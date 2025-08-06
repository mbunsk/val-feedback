import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "./storage-supabase";
import { insertSubmissionSchema, insertValidationSchema } from "@shared/schema";
import { z } from "zod";
import { generateValidationFeedback, generateLandingPagePrompt } from "./openai";
import { requireAuth, optionalAuth, AuthenticatedRequest } from "./auth";
import OpenAI from "openai";

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

  const httpServer = createServer(app);
  return httpServer;
}
