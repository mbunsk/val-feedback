import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "./storage-supabase";
import { insertSubmissionSchema, insertValidationSchema, validations, submissions, users, linkClicks, simulationSessions } from "@shared/schema";
import { z } from "zod";
import { generateValidationFeedback, generateLandingPagePrompt, generateCustomerPersonas, handleCustomerInterview, generateStartupSimulation } from "./openai";
import { requireAuth, optionalAuth, AuthenticatedRequest } from "./auth";
import OpenAI from "openai";
import { passport } from "./auth-config";
import session from "express-session";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Validate that OpenAI API key is present
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve attached assets statically
  app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));

  // Validate startup idea (optional auth to track user data)
  app.post("/api/validate", async (req: AuthenticatedRequest, res, next) => {
    console.log('Validate endpoint hit');
    try {
      await optionalAuth(req, res, next);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return next(error);
    }
  }, async (req: AuthenticatedRequest, res) => {
    console.log('Validation handler executing');
    console.log('Request body:', req.body);
    console.log('User from request:', req.user);
    
    try {
      const { idea, targetCustomer, problemSolved } = insertValidationSchema.parse(req.body);
      
      // Generate AI feedback using OpenAI
      const aiFeedback = await generateValidationFeedback(idea, targetCustomer, problemSolved);
      
      if (!aiFeedback) {
        throw new Error("Failed to generate feedback");
      }
      
      console.log('Creating validation with user ID:', req.user?.id);
      const validation = await storage.createValidation({ 
        idea, 
        targetCustomer, 
        problemSolved
      }, aiFeedback, req.user?.id);

      // Return structured response for frontend
      res.json({
        id: validation.id,
        idea,
        targetCustomer,
        problemSolved,
        feedback: aiFeedback
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Validation error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Submit project for newsletter consideration (optional auth)
  app.post("/api/submit", upload.single('screenshot'), async (req: AuthenticatedRequest, res, next) => {
    try {
      await optionalAuth(req, res, next);
    } catch (error) {
      return next(error);
    }
  }, async (req: AuthenticatedRequest, res) => {
    try {
      const submissionData: {
        name: string;
        email: string;
        projectName: string;
        projectSummary: string;
        siteUrl: string;
        whatDoYouNeed: string;
        screenshotPath?: string;
      } = {
        name: req.body.name,
        email: req.body.email,
        projectName: req.body.projectName,
        projectSummary: req.body.projectSummary,
        siteUrl: req.body.siteUrl,
        whatDoYouNeed: req.body.whatDoYouNeed || '',
        screenshotPath: req.file?.path || undefined,
      };

      const validatedData = insertSubmissionSchema.parse(submissionData);
      const submission = await storage.createSubmission(validatedData, req.user?.id);
      
      res.json({ 
        message: "Thank you for your submission! We'll review your project and get back to you within 48 hours.",
        id: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Generate refined landing page prompt using AI (no auth required for public use)
  app.post("/api/generate-prompt", async (req, res) => {
    const { idea, targetCustomer, problemSolved } = req.body;
    
    try {
      
      // Create a 2-sentence summary instead of refining individual inputs
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini for faster response times
        messages: [
          {
            role: "system",
            content: "You are a professional copywriter who creates compelling startup summaries. Write a clear, professional 2-sentence summary that captures what they're building and why it matters."
          },
          {
            role: "user", 
            content: `Create a professional 2-sentence summary of this startup idea:

Idea: ${idea}
Target Customer: ${targetCustomer}  
Problem Solved: ${problemSolved}

Write it like an elevator pitch - explain what they're launching and why customers will want it. Make it sound professional and exciting.

Return ONLY a JSON object:
{
  "summary": "A compelling 2-sentence summary of the startup idea"
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from AI");
      }
      
      console.log("Raw AI response:", content);
      
      const result = JSON.parse(content);
      console.log("Parsed summary result:", result);
      
      // Validate that we got a proper summary
      if (!result.summary) {
        throw new Error("AI did not provide a summary");
      }
      
      const prompt = `${result.summary}

Create a landing page for this startup. The goal of the site is to highlight our new venture and to collect emails of interested early users. Include a hero section, key features, and an email signup form for early users. Use modern colors and great stock images, as this is going to be perfect for validating demand and collecting interested prospects.`;
      
      console.log("Final generated prompt:", prompt);
      
      res.json({ prompt });
    } catch (error) {
      console.error("Error generating prompt:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log the exact error so we can debug why AI refinement is failing
      res.status(500).json({ 
        message: "Failed to generate refined prompt", 
        error: errorMessage,
        details: "AI refinement failed - check server logs"
      });
    }
  });

  // Get all submissions (for admin purposes)
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User logout route - accessible via GET for easy URL access
  app.get("/logout", async (req, res) => {
    try {
      // Clear any authentication cookies
      res.clearCookie('auth_token');
      res.clearCookie('user_session');
      
      // Redirect to home page with success message
      res.redirect('/?message=Successfully logged out');
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, redirect to home
      res.redirect('/?message=Logged out');
    }
  });

  // Alternative POST logout route for programmatic logout
  app.post("/api/logout", async (req, res) => {
    try {
      // Clear any authentication cookies
      res.clearCookie('auth_token');
      res.clearCookie('user_session');
      
      res.json({ success: true, message: "Successfully logged out" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google OAuth routes
  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/?error=auth_failed',
      successRedirect: '/?message=login_success'
    })
  );

  app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect('/?error=logout_failed');
      }
      res.redirect('/?message=logout_success');
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        id: req.user?.id,
        email: req.user?.email,
        name: req.user?.name,
        avatar: req.user?.avatar
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Admin authentication route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (password !== "1221") {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Create session that expires in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const session = await storage.createAdminSession({ expires_at: expiresAt.toISOString() });
      
      // Set secure cookie
      res.cookie('admin_session', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin middleware to verify session
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const sessionId = req.cookies?.admin_session;
      
      if (!sessionId) {
        return res.status(401).json({ message: "No session" });
      }

      const session = await storage.getAdminSession(sessionId);
      
      if (!session || new Date(session.expires_at) < new Date()) {
        return res.status(401).json({ message: "Session expired" });
      }

      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Get all submissions (admin only)
  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all validations (admin only)
  app.get("/api/admin/validations", requireAdmin, async (req, res) => {
    try {
      const validations = await storage.getAllValidations();
      res.json(validations);
    } catch (error) {
      console.error("Get validations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    res.clearCookie('admin_session');
    res.json({ success: true });
  });

  // Track link clicks
  app.post("/api/track-click", async (req, res) => {
    try {
      const { company, linkType, url } = req.body;
      
      if (!company || !linkType || !url) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await storage.trackLinkClick(company, linkType, url);
      res.json({ success: true });
    } catch (error) {
      console.error("Click tracking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get link click stats (admin only)
  app.get("/api/admin/link-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getLinkClickStats();
      res.json(stats);
    } catch (error) {
      console.error("Link stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get validation count (admin only)
  app.get("/api/admin/validation-count", requireAdmin, async (req, res) => {
    try {
      const count = await storage.getValidationCount();
      res.json({ count });
    } catch (error) {
      console.error("Validation count error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate customer personas for startup simulator
  app.post("/api/generate-customers", async (req, res) => {
    // Handle both nested validationData and direct properties
    let validationData = req.body.validationData;
    const landingPageContent = req.body.landingPageContent;
    
    // If validationData is not provided, check if the properties are sent directly
    if (!validationData && (req.body.idea || req.body.targetCustomer || req.body.problemSolved)) {
      validationData = {
        idea: req.body.idea,
        targetCustomer: req.body.targetCustomer,
        problemSolved: req.body.problemSolved,
        feedback: req.body.feedback
      };
    }
    
    if (!validationData) {
      return res.status(400).json({ message: "Validation data is required" });
    }
    
    try {
      const customers = await generateCustomerPersonas(validationData, landingPageContent);
      res.json({ customers });
    } catch (error) {
      console.error("Error generating customers:", error);
      res.status(500).json({ message: "Failed to generate customer personas" });
    }
  });

  // Handle customer interview chat
  app.post("/api/customer-interview", async (req, res) => {
    const { customerId, customerPersona, userQuestion, conversationHistory, validationData } = req.body;

    try {
      const response = await handleCustomerInterview(customerId, customerPersona, userQuestion, conversationHistory, validationData);
      
      // Save or update simulation session
      if (validationData && conversationHistory) {
        try {
          // Import supabase client
          const { supabase } = await import('./supabase');
          
          // Get user ID from the request if available
          const userId = req.user?.id || null;
          
          // Check if session already exists for this user and validation
          const { data: existingSession } = await supabase
            .from('simulation_sessions')
            .select('*')
            .eq('user_id', userId || '')
            .eq('idea', validationData.idea)
            .single();

          // Add the new message to conversation history
          const updatedConversationHistory = [
            ...conversationHistory,
            {
              id: conversationHistory.length + 1,
              customerId: customerId,
              isUser: true,
              text: userQuestion,
              timestamp: new Date()
            },
            {
              id: conversationHistory.length + 2,
              customerId: customerId,
              isUser: false,
              text: response,
              timestamp: new Date()
            }
          ];

          if (existingSession) {
            // Update existing session
            await supabase
              .from('simulation_sessions')
              .update({
                conversation_history: JSON.stringify(updatedConversationHistory),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSession.id);
          } else {
            // Create new session
            await supabase
              .from('simulation_sessions')
              .insert({
                user_id: userId,
                validation_id: null,
                idea: validationData.idea,
                target_customer: validationData.targetCustomer,
                problem_solved: validationData.problemSolved,
                customer_personas: null, // Will be updated when simulation starts
                conversation_history: JSON.stringify(updatedConversationHistory),
                simulation_data: null // Will be updated when simulation starts
              });
          }
        } catch (sessionError) {
          console.error("Error saving simulation session:", sessionError);
          // Don't fail the main request if session saving fails
        }
      }
      
      res.json({ response });
    } catch (error) {
      console.error("Error in customer interview:", error);
      res.status(500).json({ message: "Failed to generate customer response" });
    }
  });

  // Generate startup journey simulation
  app.post("/api/generate-simulation", async (req, res) => {
    const { validationData, customerInsights, landingPageContent } = req.body;

    if (!validationData) {
      return res.status(400).json({ message: "validationData is required" });
    }

    try {
      const simulation = await generateStartupSimulation(validationData, customerInsights, landingPageContent);
      
      // Save simulation data to database
      if (validationData) {
        try {
          // Import supabase client
          const { supabase } = await import('./supabase');
          
          // Get user ID from the request if available
          const userId = req.user?.id || null;
          
          // Check if session already exists for this user and validation
          const { data: existingSession } = await supabase
            .from('simulation_sessions')
            .select('*')
            .eq('user_id', userId || '')
            .eq('idea', validationData.idea)
            .single();

          if (existingSession) {
            // Update existing session with simulation data
            await supabase
              .from('simulation_sessions')
              .update({
                simulation_data: JSON.stringify(simulation),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSession.id);
          } else {
            // Create new session with simulation data
            await supabase
              .from('simulation_sessions')
              .insert({
                user_id: userId,
                validation_id: null,
                idea: validationData.idea,
                target_customer: validationData.targetCustomer,
                problem_solved: validationData.problemSolved,
                customer_personas: customerInsights ? JSON.stringify(customerInsights.map(insight => insight.persona)) : null,
                conversation_history: null,
                simulation_data: JSON.stringify(simulation)
              });
          }
        } catch (sessionError) {
          console.error("Error saving simulation data:", sessionError);
          // Don't fail the main request if session saving fails
        }
      }
      
      res.json({ simulation });
    } catch (error) {
      console.error("Error generating simulation:", error);
      res.status(500).json({ message: "Failed to generate startup simulation" });
    }
  });

  // Insert to Beehiiv newsletter
  app.post("/api/insert-to-beehive", requireAuth, async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Convert PHP cURL to JavaScript fetch
      const response = await fetch("https://api.beehiiv.com/v2/publications/pub_f0fb44c7-6963-454e-8fa0-477ec33c46cb/subscriptions", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": "Bearer vjf5yOKUqj0MkFCRZwtPD65ktFOpWEnOIKejocqPdGTD49721SCijrS5UW1ibPuJ",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'validatorai',
          utm_campaign: 'registration',
          utm_medium: 'validatorai-registration',
          referring_site: 'https://validatorai.com',
          custom_fields: [
            {
              name: 'First Name',
              value: firstName
            },
            {
              name: 'Last Name',
              value: lastName
            }
          ]
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Beehiiv API error:", responseData);
        return res.status(500).json({ message: "Failed to subscribe to newsletter" });
      }

      // Check if status is "validating" and trigger postback
      if (responseData.data?.status === "validating") {
        try {
          await fetch('https://validatorai.com/postback/user_insert.php', {
            method: 'GET'
          });
        } catch (postbackError) {
          console.error("Postback error:", postbackError);
          // Don't fail the main request if postback fails
        }
      }

      res.json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Beehiiv subscription error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Handle challenge feedback
  app.post("/api/challenge-feedback", async (req, res) => {
    try {
      const { month, challenge, response, validationData, simulationData } = req.body;
      
      if (!month || !challenge || !response || !validationData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { generateChallengeFeedback } = await import("./openai.js");
      const feedback = await generateChallengeFeedback(month, challenge, response, validationData, simulationData);
      res.json({ feedback });
    } catch (error) {
      console.error("Challenge feedback error:", error);
      res.status(500).json({ message: "Failed to generate feedback" });
    }
  });

  // Handle Val chat
  app.post("/api/val-chat", async (req, res) => {
    try {
      const { month, question, conversationHistory, simulationData, validationData } = req.body;
      
      if (!month || !question || !validationData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { handleValChat } = await import("./openai.js");
      const response = await handleValChat(month, question, conversationHistory, simulationData, validationData);
      res.json({ response });
    } catch (error) {
      console.error("Val chat error:", error);
      res.status(500).json({ message: "Failed to get Val's response" });
    }
  });

  // Generate and download pitch deck (PDF format)
  app.post("/api/generate-pitch-deck", async (req, res) => {
    try {
      const { validationData, customerInsights, simulationData } = req.body;

      if (!validationData?.idea) {
        return res.status(400).json({ message: "Validation data required" });
      }

      const pitchDeckData = {
        validationData,
        customerInsights: customerInsights || [],
        simulationData: simulationData || []
      };

      // Fallback to text-based pitch deck since PDF generation failed
      const { TextReportGenerator } = await import("./textReportGenerator.js");
      const generator = new TextReportGenerator();
      const pitchDeckContent = generator.generatePitchDeck(pitchDeckData);
      const filename = `${validationData.idea.replace(/[^a-zA-Z0-9]/g, '_')}_PitchDeck.txt`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pitchDeckContent.length);
      
      res.send(pitchDeckContent);
    } catch (error) {
      console.error("Pitch deck generation error:", error);
      res.status(500).json({ message: "Failed to generate pitch deck" });
    }
  });

  // Generate comprehensive report PDF
  app.post("/api/generate-report", async (req, res) => {
    const { validationData, bubbleUrl, customerInterviews, simulation } = req.body;

    try {
      // This would generate a comprehensive PDF with:
      // - Original validation results
      // - Customer interview insights
      // - 6-month journey simulation
      // - Market analysis
      // - Recommended next steps
      
      // For now, return success - PDF generation would be implemented here
      res.json({ message: "Report generation ready - implementation needed" });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Generate simple 6-month simulation text file
  app.post("/api/generate-simulation-roadmap", async (req, res) => {
    try {
      const { validationData, simulationData } = req.body;
      
      if (!validationData?.idea || !simulationData?.length) {
        return res.status(400).json({ message: "Simulation data required" });
      }

      let roadmapText = `6-MONTH STARTUP SIMULATION ROADMAP\n`;
      roadmapText += `Generated for: ${validationData.idea}\n`;
      roadmapText += `Target Customer: ${validationData.targetCustomer}\n`;
      roadmapText += `Problem Solved: ${validationData.problemSolved}\n\n`;

      simulationData.forEach((month, index) => {
        roadmapText += `MONTH ${month.month}: ${month.title}\n`;
        roadmapText += `Revenue: $${month.revenue}\n`;
        roadmapText += `Users: ${month.users}\n`;
        roadmapText += `Challenge: ${month.challenge}\n`;
        roadmapText += `Wins: ${month.wins?.join(', ')}\n`;
        roadmapText += `Key Decisions: ${month.keyDecisions?.join(', ')}\n`;
        
        if (index < simulationData.length - 1) {
          roadmapText += `\n---\n\n`;
        }
      });

      roadmapText += `\nGenerated by ValidatorAI\n`;
      roadmapText += `For startup idea validation and simulation\n`;
      roadmapText += `Date: ${new Date().toLocaleDateString()}\n`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="startup-simulation-roadmap.txt"');
      res.send(roadmapText);
    } catch (error) {
      console.error("Simulation roadmap error:", error);
      res.status(500).json({ message: "Failed to generate simulation roadmap" });
    }
  });

  // Create or update simulation session
  app.post("/api/simulation-session", async (req, res) => {
    try {
      const { userId, validationId, idea, targetCustomer, problemSolved, customerPersonas, conversationHistory, simulationData } = req.body;
      
      if (!idea || !targetCustomer || !problemSolved) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Import supabase client
      const { supabase } = await import('./supabase');

      // Check if session already exists for this user and validation
      const { data: existingSession } = await supabase
        .from('simulation_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('idea', idea)
        .single();

      if (existingSession) {
        // Update existing session
        const { data: updatedSession, error } = await supabase
          .from('simulation_sessions')
          .update({
            customer_personas: customerPersonas ? JSON.stringify(customerPersonas) : null,
            conversation_history: conversationHistory ? JSON.stringify(conversationHistory) : null,
            simulation_data: simulationData ? JSON.stringify(simulationData) : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (error) throw new Error(`Failed to update simulation session: ${error.message}`);
        res.json({ session: updatedSession });
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('simulation_sessions')
          .insert({
            user_id: userId,
            validation_id: validationId,
            idea,
            target_customer: targetCustomer,
            problem_solved: problemSolved,
            customer_personas: customerPersonas ? JSON.stringify(customerPersonas) : null,
            conversation_history: conversationHistory ? JSON.stringify(conversationHistory) : null,
            simulation_data: simulationData ? JSON.stringify(simulationData) : null
          })
          .select()
          .single();

        if (error) throw new Error(`Failed to create simulation session: ${error.message}`);
        res.json({ session: newSession });
      }
    } catch (error) {
      console.error("Simulation session error:", error);
      res.status(500).json({ message: "Failed to save simulation session" });
    }
  });

  // Get simulation sessions for admin (paginated)
  app.get("/api/admin/simulation-sessions", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const offsetValue = (page - 1) * pageSize;

      // Import supabase client
      const { supabase } = await import('./supabase');

      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('simulation_sessions')
        .select('*', { count: 'exact', head: true });

      if (countError) throw new Error(`Failed to get count: ${countError.message}`);

      // Get paginated sessions with user and validation data
      const { data: sessions, error: fetchError } = await supabase
        .from('simulation_sessions')
        .select(`
          *,
          user:users(id, name, email),
          validation:validations(id, feedback)
        `)
        .order('created_at', { ascending: false })
        .range(offsetValue, offsetValue + pageSize - 1);

      if (fetchError) throw new Error(`Failed to fetch sessions: ${fetchError.message}`);

      res.json({
        sessions: (sessions || []).map(session => ({
          id: session.id,
          idea: session.idea,
          targetCustomer: session.target_customer,
          problemSolved: session.problem_solved,
          customerPersonas: session.customer_personas ? JSON.parse(session.customer_personas) : null,
          conversationHistory: session.conversation_history ? JSON.parse(session.conversation_history) : null,
          simulationData: session.simulation_data ? JSON.parse(session.simulation_data) : null,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          user: session.user,
          validation: session.validation
        })),
        pagination: {
          page,
          pageSize,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / pageSize)
        }
      });
    } catch (error) {
      console.error("Get simulation sessions error:", error);
      res.status(500).json({ message: "Failed to fetch simulation sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
