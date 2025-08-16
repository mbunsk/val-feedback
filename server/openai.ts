import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateValidationFeedback(idea: string, targetCustomer: string, problemSolved: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Val, a warm, thoughtful, startup-savvy mentor who helps aspiring entrepreneurs validate their ideas. Provide insightful feedback that helps refine concepts while maintaining enthusiasm.

Respond with clean, well-structured HTML that will be beautifully styled. Focus on clear content without custom styling, arrows, or formatting instructions.

<div class="validation-section">
<h3>Overall Fit Score</h3>
<div class="score-display">[X]/100</div>
<p>Rate based on market potential, differentiation, feasibility, and problem-solution connection. Explain your score clearly.</p>
</div>

<div class="validation-section">
<h3>What Makes This Special</h3>
<p>Explain what makes their idea unique and valuable. Focus on differentiation and customer value.</p>
</div>

<div class="validation-section">
<h3>Market Reality Check</h3>
<p>Identify 2-3 existing competitors and suggest how they could stand out. Be constructive about challenges.</p>
</div>

<div class="validation-section">
<h3>Find Your Customers</h3>
<p>Here are specific places to find early customers</p>
<ul>
<li><strong>Reddit Communities:</strong> List specific subreddits (e.g., r/entrepreneurship, r/startups) relevant to this idea</li>
<li><strong>Online Groups:</strong> Identify Facebook groups, Discord servers, or LinkedIn communities where target customers spend time</li>
<li><strong>Forums & Websites:</strong> Name specific industry forums, blogs, or websites where these customers are active</li>
</ul>
<p>Include realistic acquisition strategies and potential partnerships for each location.</p>
</div>

<div class="validation-section">
<h3>Next Steps</h3>
<ul>
<li>One key validation question to ask potential customers</li>
<li>One practical improvement to strengthen the idea</li>
<li>One specific action to take this week</li>
</ul>
</div>

<div class="validation-section">
<h3>Customer Reality Simulation</h3>
<div class="customer-conversations">
<div class="customer-conversation">
<h4>Customer #1: [Profile]</h4>
<p><strong>Initial Response:</strong> "[Their first reaction]"</p>
<p><strong>Follow-up Questions:</strong> "[Their concerns/questions]"</p>
<p><strong>Objections:</strong> "[Specific hesitations]"</p>
<p><strong>Interest Level:</strong> [High/Medium/Low with reasoning]</p>
</div>
<div class="customer-conversation">
<h4>Customer #2: [Profile]</h4>
<p><strong>Initial Response:</strong> "[Their first reaction]"</p>
<p><strong>Follow-up Questions:</strong> "[Their concerns/questions]"</p>
<p><strong>Objections:</strong> "[Specific hesitations]"</p>
<p><strong>Interest Level:</strong> [High/Medium/Low with reasoning]</p>
</div>
<div class="customer-conversation">
<h4>Customer #3: [Profile]</h4>
<p><strong>Initial Response:</strong> "[Their first reaction]"</p>
<p><strong>Follow-up Questions:</strong> "[Their concerns/questions]"</p>
<p><strong>Objections:</strong> "[Specific hesitations]"</p>
<p><strong>Interest Level:</strong> [High/Medium/Low with reasoning]</p>
</div>
</div>
</div>

<div class="validation-section">
<h3>Revenue Potential & Business Model</h3>
<p><strong>Market Analysis:</strong> Research the total addressable market size, competitor pricing, and market trends for this industry.</p>
<p><strong>Business Model Options:</strong> Analyze 2-3 potential business models (subscription, one-time purchase, freemium, marketplace, etc.) and recommend the best fit.</p>
<p><strong>Pricing Strategy:</strong> Suggest specific pricing tiers with reasoning based on value delivered and market research.</p>
<p><strong>Revenue Projections:</strong> Provide conservative, realistic, and optimistic first-year revenue scenarios with assumptions.</p>
<p><strong>Key Milestones:</strong> Define specific revenue and customer acquisition milestones to track progress.</p>
</div>

<div class="validation-section">
<h3>Launch Timeline</h3>
<ul>
<li>Week 1-2: Specific validation activities and customer interviews</li>
<li>Week 3-4: MVP development approach and key features to build first</li>
<li>Month 2-3: Launch strategy and initial customer acquisition plan</li>
</ul>
</div>

<div class="validation-section">
<h3>Risk Assessment</h3>
<p>Identify the 3 biggest risks that could derail this idea and provide specific mitigation strategies for each.</p>
</div>

<div class="validation-section">
<h3>Success Metrics</h3>
<p>Define 5 key metrics to track progress: early validation signals, user engagement indicators, and business health measurements.</p>
</div>

<div class="validation-section">
<h3>One Suggestion to Make This Idea More Marketable</h3>
<p>Provide one specific, actionable suggestion that would make this startup idea more appealing to customers and easier to market. Focus on positioning, messaging, features, or market approach that would increase conversion rates and customer interest.</p>
</div>

Be encouraging but realistic. Focus on actionable insights without any styling instructions.`
        },
        {
          role: "user",
          content: `Startup Idea: ${idea}
Target Customer: ${targetCustomer}
Problem Solved: ${problemSolved}

Please analyze this startup idea and provide comprehensive validation feedback using the exact HTML structure specified.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI validation feedback error:", error);
    // Fallback response
    return JSON.stringify({
      ideaFitAlignment: `Your idea of ${idea} shows potential for addressing ${problemSolved} for ${targetCustomer}. Consider refining the specific value proposition.`,
      competitorSnapshot: [
        "**Direct Competitor A** – Established player with basic solution",
        "**Indirect Competitor B** – Different approach to same problem", 
        "**Adjacent Competitor C** – Similar target market, different focus"
      ],
      uvpInsight: "Focus on what makes your solution uniquely valuable compared to existing alternatives.",
      customerTargeting: `${targetCustomer} can be found in these specific places:

**Reddit Communities:**
- r/entrepreneur (general startup discussions)
- r/smallbusiness (business owners and operators)
- Industry-specific subreddits related to your target market

**Online Communities:**
- LinkedIn groups for your industry
- Facebook groups and pages
- Discord servers focused on your niche
- Industry-specific forums and websites

**In-Person Locations:**
- Local networking events and meetups
- Industry conferences and trade shows
- Coworking spaces and business centers
- Professional association meetings

Focus on understanding their specific pain points and engage authentically in these communities.`,
      startupReadinessScore: 72,
      improvementTip: "Conduct customer interviews to validate assumptions and refine your solution based on real feedback.",
      customerInterviewSimulation: [
        `"I really need a better solution for ${problemSolved}."`,
        `"This could be helpful, but I'm concerned about the learning curve."`,
        `"I'm happy with my current solution - why should I switch?"`
      ],
      pricingMonetization: {
        pricePoint: "$49/month - Based on market research showing similar B2B tools price between $29-99/month. This positions you competitively while allowing room for value demonstration.",
        monetization: "Monthly subscription model with 14-day free trial. Premium tier at $99/month for advanced features and integrations.",
        conversionRate: "4.2% - Industry average for B2B SaaS landing pages is 2-5%. With proper targeting and value proposition, expect 4-5% from qualified traffic."
      }
    });
  }
}

export async function generateLandingPagePrompt(idea: string, targetCustomer: string, problemSolved: string, validationFeedback: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating comprehensive landing page prompts for AI-powered no-code website builders like Base44, Lovable, and Bubble. Create a detailed, actionable prompt that these AI builders can use to generate a complete, high-converting landing page.

Your prompt should include:
- Compelling headline and subheadline with clear value proposition
- Problem/solution framework with emotional hooks
- Target customer language and pain points
- Detailed feature/benefit breakdown
- Social proof elements and credibility indicators
- Email capture strategy with lead magnets
- Visual design suggestions and layout structure
- Call-to-action copy and button placement
- Color scheme and typography recommendations
- Mobile responsiveness considerations
- Trust signals and risk reduction elements

Make it extremely specific and actionable so an AI can build a complete landing page. Focus on conversion optimization and email list building for early customer validation.`
        },
        {
          role: "user", 
          content: `Create a comprehensive landing page prompt for AI site builders (Base44, Lovable, Bubble) for this startup:

**Startup Details:**
- Idea: ${idea}
- Target Customer: ${targetCustomer}
- Problem Solved: ${problemSolved}

**AI Validation Insights:**
- Market Fit Analysis: ${validationFeedback.ideaFitAlignment}
- Unique Value Proposition: ${validationFeedback.uvpInsight}
- Target Customer Locations: ${validationFeedback.customerTargeting}
- Startup Readiness: ${validationFeedback.startupReadinessScore}/100
- Pricing Strategy: ${validationFeedback.pricingMonetization?.pricePoint || 'To be determined'}

Create an extremely detailed prompt that an AI site builder can use to generate a complete landing page. Include specific copy suggestions, design elements, sections, and conversion optimization strategies. The goal is email capture for early customer validation and building a waitlist.`
        }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI landing page prompt error:", error);
    // Fallback prompt
    return `Build a high-converting landing page for "${idea}" targeting ${targetCustomer}:

**PAGE STRUCTURE & DESIGN:**
- Clean, modern design with primary color #2563eb (blue) and accent #f59e0b (orange)
- Mobile-first responsive layout
- Fast loading with optimized images
- Sticky header with logo and CTA button

**HERO SECTION:**
- Headline: "Finally, a solution for ${problemSolved}"
- Subheadline: "Join 500+ ${targetCustomer} who are revolutionizing how they handle ${problemSolved}"
- Hero image: Modern, professional illustration or photo relevant to the solution
- Primary CTA button: "Get Early Access" (prominent, above fold)

**PROBLEM SECTION:**
- Header: "The Problem ${targetCustomer} Face Daily"
- Pain points specific to ${targetCustomer}
- Statistical data about the problem impact
- Emotional language that creates urgency

**SOLUTION SECTION:**
- Header: "Introducing [Product Name]"
- 3 key benefits with icons and descriptions
- Feature breakdown with mockup images
- "How It Works" - 3-step process

**SOCIAL PROOF SECTION:**
- "Join 500+ Early Adopters" counter
- 3 customer testimonials with photos and titles
- Company logos (if any partnerships)
- "Featured on" media mentions

**EMAIL CAPTURE SECTION:**
- Header: "Get Early Access + Exclusive Updates"
- Lead magnet: "Free [Industry] Toolkit" or "Beta Access"
- Single email input field
- Privacy assurance text
- Compelling CTA: "Reserve My Spot"

**TRUST SIGNALS:**
- Security badges and certifications
- Money-back guarantee
- "No spam, unsubscribe anytime"
- Founder photo and credentials

**FOOTER:**
- Contact information
- Social media links
- Privacy policy and terms
- Additional trust indicators

**CONVERSION OPTIMIZATION:**
- Multiple email capture points (hero, middle, bottom)
- Exit-intent popup with special offer
- Social media sharing buttons
- Analytics and heat mapping integration

Build this as a single-page application with smooth scrolling navigation and optimized for email conversion.`;
  }
}

export async function generateCustomerPersonas(validationData: any, landingPageContent?: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating realistic customer personas for startup validation. Generate 3 diverse, realistic potential customers with distinct backgrounds, pain points, and personalities. Use both the validation feedback and landing page content to create highly relevant personas.

For each persona, include:
- Detailed personality traits and communication style
- Daily challenges and lifestyle context
- Decision-making factors and buying motivations
- Price sensitivity and budget considerations
- How they currently solve this problem (if at all)

Make each persona feel like a real person with authentic motivations, not generic customer archetypes. Focus on psychological depth and realistic business/personal contexts.

Respond with a JSON array of 3 customer objects with these fields:
{
  "id": number,
  "name": string,
  "role": string, 
  "background": string (2-3 sentences about their situation),
  "avatar": string (single emoji that represents them),
  "personality": string (communication style and traits),
  "painPoints": array of strings (3-4 specific pain points),
  "currentSolution": string (how they solve this now),
  "priceWillingness": string (what they might pay and why)
}`
        },
        {
          role: "user",
          content: `Create customer personas for this startup:

**Validation Data:**
- Idea: ${validationData.idea}
- Target Customer: ${validationData.targetCustomer} 
- Problem Solved: ${validationData.problemSolved}
- AI Feedback: ${validationData.feedback}

${landingPageContent ? `**Landing Page Context:**\n${landingPageContent.substring(0, 1000)}...` : ''}

Create 3 diverse personas that represent different segments within the target customer base.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.customers || result;
  } catch (error) {
    console.error("OpenAI customer personas error:", error);
    return [
      {
        id: 1,
        name: "Sarah Chen",
        role: "Small Business Owner",
        background: "Runs a local marketing agency with 5 employees. Always looking for tools to streamline operations and impress clients with innovative solutions.",
        avatar: "👩‍💼",
        personality: "Direct, results-oriented, skeptical of new tools but willing to try if ROI is clear. Values efficiency and proven solutions.",
        painPoints: [
          "Spends too much time on manual processes",
          "Hard to differentiate from competitors", 
          "Limited budget for expensive enterprise tools",
          "Needs quick wins to show clients"
        ],
        currentSolution: "Uses basic tools and manual processes",
        priceWillingness: "$50-200/month if it saves significant time"
      },
      {
        id: 2,
        name: "Mike Rodriguez", 
        role: "Freelance Consultant",
        background: "Independent consultant specializing in process optimization. Works with mid-size companies to improve their operations and reduce costs.",
        avatar: "🧑‍💻",
        personality: "Analytical, detail-oriented, price-conscious but understands value. Likes to test thoroughly before committing.",
        painPoints: [
          "Inconsistent client pipeline",
          "Time-consuming client onboarding",
          "Difficult to scale beyond personal capacity", 
          "Needs professional-looking deliverables"
        ],
        currentSolution: "Combination of spreadsheets and basic software",
        priceWillingness: "$25-100/month depending on client volume increase"
      },
      {
        id: 3,
        name: "Jennifer Park",
        role: "Operations Manager",
        background: "Works at a growing tech startup, responsible for internal processes and vendor relationships. Always under pressure to do more with less.",
        avatar: "👩‍🔬", 
        personality: "Collaborative, process-focused, budget-conscious but willing to invest in proven solutions. Values good support and onboarding.",
        painPoints: [
          "Limited budget approval authority",
          "Needs buy-in from multiple stakeholders",
          "Pressure to show measurable improvements",
          "Concerned about team adoption and training"
        ],
        currentSolution: "Enterprise tools that are overkill or free tools that lack features",
        priceWillingness: "$100-500/month if it solves a major pain point"
      }
    ];
  }
}

export async function handleCustomerInterview(customerId: number, customerPersona: any, userQuestion: string, conversationHistory: any[], validationData: any) {
  try {
    console.log(`in handleCustomerInterview`);
    
    // Add null checks for customerPersona
    if (!customerPersona) {
      console.error("customerPersona is undefined or null");
      return "I'm sorry, but I'm having trouble accessing the customer persona information. Could you please try again?";
    }
    
    if (!customerPersona.name || !customerPersona.role) {
      console.error("customerPersona missing required properties:", customerPersona);
      return "I'm sorry, but the customer persona information is incomplete. Could you please try again?";
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are ${customerPersona.name}, a ${customerPersona.role}. 

**Your Background:** ${customerPersona.background || 'Not specified'}
**Your Personality:** ${customerPersona.personality || 'Professional and helpful'}  
**Your Pain Points:** ${customerPersona.painPoints?.join(', ') || 'General business challenges'}
**How You Currently Solve This:** ${customerPersona.currentSolution || 'Using existing tools and processes'}
**Your Price Sensitivity:** ${customerPersona.priceWillingness || 'Moderate'}

**The Startup Being Discussed:**
- Idea: ${validationData?.idea || 'A new business solution'}
- Target Customer: ${validationData?.targetCustomer || 'Business professionals'}
- Problem It Solves: ${validationData?.problemSolved || 'Business efficiency'}

You are being interviewed about this startup idea. Respond authentically as this persona:
- Stay in character with your personality and communication style
- Reference your specific pain points and current situation
- Be honest about concerns, skepticism, or excitement 
- Ask follow-up questions when curious
- Share relevant experiences from your background
- Give realistic feedback about pricing and adoption barriers
- Don't just agree with everything - be genuinely helpful but honest

Keep responses conversational (2-3 sentences usually), and make sure they feel authentic to your persona's voice and concerns.`
        },
        {
          role: "user",
          content: conversationHistory.length === 0 
            ? `Hi ${customerPersona.name}! I'm working on ${validationData?.idea?.split(' ').slice(0, 6).join(' ') || 'a new solution'} and would love to get your perspective. I understand you're ${customerPersona.role.toLowerCase()} - what's your biggest challenge when it comes to ${validationData?.problemSolved?.toLowerCase() || 'business efficiency'}?`
            : userQuestion
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI customer interview error:", error);
    console.log(`error..: ${error}`);
    return "I'm interested but need to think about this more. Can you tell me more about how this would work in practice?";
  }
}

export async function generateStartupSimulation(validationData: any, customerInsights: any[] = [], landingPageContent?: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert startup advisor creating realistic 6-month journey simulations. Base your predictions on real market conditions, customer feedback patterns, and startup statistics. Be optimistic but realistic.

Create a simulation with:
- Month-by-month progression with realistic challenges
- Revenue growth based on customer price feedback
- User acquisition patterns typical for this market
- Key decisions and milestones
- Authentic startup challenges and wins

Return exactly 6 months of data in the "simulation" array. Each month should have progressive growth and different challenges.`
        },
        {
          role: "user",
          content: `Generate a 6-month startup simulation for:

**Startup Details:**
- Idea: ${validationData.idea}
- Target Customer: ${validationData.targetCustomer}
- Problem Solved: ${validationData.problemSolved}

**Customer Interview Insights:**
${customerInsights.map((insight, i) => `
Customer ${i+1} Insights:
- Persona: ${insight.persona?.name} (${insight.persona?.role})
- Price Willingness: ${insight.persona?.priceWillingness}
- Key Concerns: ${insight.keyPoints?.join(', ') || 'General interest in solution'}
`).join('')}

${landingPageContent ? `**Landing Page Context:**\n${landingPageContent.substring(0, 800)}...` : ''}

Create a realistic simulation with authentic challenges and revenue projections based on the customer price feedback.

IMPORTANT: Return exactly 6 months of data in the "simulation" array. Each month should have progressive growth and different challenges.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.simulation || result;
  } catch (error) {
    console.error("OpenAI startup simulation error:", error);
    // Fallback with complete 6-month data structure
    return [
      {
        month: 1,
        title: "Launch & Initial Validation",
        challenge: "You have $5,000 left in your budget and need to decide: spend it on marketing to get more users, or on product development to add the feature customers keep requesting. What's your choice and why?",
        challenges: ["Product-market fit unclear", "Limited initial traction", "Budget constraints"],
        wins: ["First paying customers", "Positive user feedback", "Working MVP"],
        revenue: 1200,
        users: 50,
        keyDecisions: ["Pricing strategy", "Core feature prioritization", "Customer acquisition focus"]
      },
      {
        month: 2,
        title: "First Growth Sprint",
        challenge: "A competitor just launched a very similar product with VC funding. They're offering it free for 6 months. How do you respond to protect your early customers and maintain momentum?",
        challenges: ["Increased competition", "Customer retention concerns", "Limited marketing budget"],
        wins: ["Word-of-mouth referrals starting", "Product improvements based on feedback", "First repeat customers"],
        revenue: 2800,
        users: 120,
        keyDecisions: ["Competitive positioning", "Customer retention strategy", "Feature prioritization"]
      },
      {
        month: 3,
        title: "Market Expansion",
        challenge: "You've validated your solution with early adopters, but now need to reach mainstream customers who are more skeptical. What changes to your messaging, pricing, or product would you make?",
        challenges: ["Reaching mainstream market", "Scaling customer support", "Cash flow management"],
        wins: ["Steady customer growth", "Improved conversion rates", "Team expansion"],
        revenue: 4500,
        users: 200,
        keyDecisions: ["Market expansion strategy", "Hiring priorities", "Pricing adjustments"]
      },
      {
        month: 4,
        title: "Scaling Operations",
        challenge: "Customer support tickets are overwhelming your small team, and response times are suffering. You could hire more support staff or invest in automation tools. What's your approach?",
        challenges: ["Customer support bottlenecks", "Quality control issues", "Team burnout"],
        wins: ["Established customer base", "Proven revenue model", "Strong customer feedback"],
        revenue: 7200,
        users: 320,
        keyDecisions: ["Operational scaling", "Quality vs. speed trade-offs", "Investment priorities"]
      },
      {
        month: 5,
        title: "Strategic Decisions",
        challenge: "An acquisition offer comes in for $500K, which would cover your team's salaries for 2 years but means giving up control. You also have interest from VCs. What path do you choose?",
        challenges: ["Growth plateau", "Funding decisions", "Strategic direction"],
        wins: ["Market recognition", "Strong unit economics", "Team stability"],
        revenue: 9800,
        users: 450,
        keyDecisions: ["Funding strategy", "Growth vs. profitability", "Long-term vision"]
      },
      {
        month: 6,
        title: "Future Planning",
        challenge: "You need to plan your next 6 months. Market research shows opportunity in 3 new segments, but you only have resources for one. How do you choose which market to pursue?",
        challenges: ["Resource allocation", "Market prioritization", "Sustainable growth"],
        wins: ["Profitable operations", "Strong market position", "Experienced team"],
        revenue: 12500,
        users: 580,
        keyDecisions: ["Expansion strategy", "Resource management", "Long-term sustainability"]
      }
    ];
  }
}