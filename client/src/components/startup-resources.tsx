import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Track link clicks
const trackClick = async (company: string, linkType: string, url: string) => {
  try {
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, linkType, url })
    });
  } catch (error) {
    console.log('Click tracking failed:', error);
  }
};

import bubbleLogo from "@assets/bubble-icon-logo-png_seeklogo-448116_1754234608565.png";
import beehiivLogo from "@assets/beehiivlogopng_1755201488531.png";
import liveplanLogo from "@assets/liveplanlogo_1755201488533.png";
import gammaLogo from "@assets/gamma_1755201488532.png";
import miroLogo from "@assets/mirologo_1755201488533.png";
import notionLogo from "@assets/notionlogopng_1755201488534.png";
import augmentLogo from "@assets/augmentbestlogo_1755203840573.png";

interface StartupResourcesProps {
  validationData?: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  };
}

export default function StartupResources({ validationData }: StartupResourcesProps) {
  // Show preview version if validation not complete
  if (!validationData) {
    return (
      <section id="resources" className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">🚀</div>
          <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">💼</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-secondary/30 to-primary/20 border-secondary/30">
              <span className="w-8 h-8 bg-gradient-to-br from-secondary to-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 animate-pulse-slow">
                2
              </span>
              🛠️ Your Startup Resources Kit
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
              Ready to Keep Exploring?
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              After validating your idea, you'll get access to personalized startup and idea validation resources.
              <br />
              <span className="text-primary font-semibold">Choose from 7 trusted partner tools to continue your exploration journey! ✨</span>
            </p>
          </div>

          {/* Preview Grid */}
          <div className="text-center">
            <Card className="max-w-4xl mx-auto border-2 border-dashed border-muted-foreground/30 bg-muted/20">
              <CardContent className="p-12">
                <div className="text-6xl mb-6">🔒</div>
                <h3 className="text-2xl font-bold mb-4 text-muted-foreground">
                  Your Startup Resources Kit
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Complete Step 1 (idea validation) to unlock your personalized toolkit including:
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="font-semibold text-purple-700 dark:text-purple-300">🌐 Website Builder</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Create landing pages</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="font-semibold text-yellow-700 dark:text-yellow-300">📧 Audience Building</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Build your community</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">📋 Business Planning</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Create business plans</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="font-semibold text-green-700 dark:text-green-300">🎨 Presentations</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Build pitch decks</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="font-semibold text-orange-700 dark:text-orange-300">🤝 Collaboration</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Whiteboard ideas</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">📊 Organization</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Manage research</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 max-w-2xl mx-auto">
                  <div className="col-start-2 bg-lime-50 dark:bg-lime-900/20 p-3 rounded-lg border border-lime-200 dark:border-lime-700">
                    <div className="font-semibold text-lime-700 dark:text-lime-300">🎓 Education</div>
                    <div className="text-sm text-lime-600 dark:text-lime-400">Entrepreneur MBA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const resources = [
    {
      name: "Bubble",
      title: "Mock Up Your Website",
      description: "Create a professional landing page mockup in minutes. No coding required - perfect for validating your idea with real visitors.",
      url: "https://bubble.pxf.io/e1kn1O",
      logo: bubbleLogo,
      color: "bg-purple-600 hover:bg-purple-700",
      category: "Website Builder"
    },
    {
      name: "Beehiiv",
      title: "Build Your Audience",
      description: "The best way to validate is to build an audience! Create newsletters and grow your subscriber base to validate demand before you build.",
      url: "https://www.beehiiv.com/?via=aron-meystedt&_bhlid=bfc4afcba0acc7ca8c69966bb231bf46b6adfee0",
      logo: beehiivLogo,
      color: "bg-yellow-600 hover:bg-yellow-700",
      category: "Audience Building"
    },
    {
      name: "LivePlan",
      title: "Create a Full Business Plan",
      description: "Transform your validated idea into a comprehensive business plan with financial projections and investor-ready documents.",
      url: "https://liveplan.com",
      logo: liveplanLogo,
      color: "bg-blue-600 hover:bg-blue-700",
      category: "Business Planning"
    },
    {
      name: "Gamma",
      title: "Create Pitch Deck",
      description: "Build beautiful pitch decks powered by AI. Turn your idea validation into compelling presentation slides in minutes.",
      url: "https://try.gamma.app/9mp9k1gqybqf",
      logo: gammaLogo,
      color: "bg-green-600 hover:bg-green-700",
      category: "Presentations"
    },
    {
      name: "Miro",
      title: "Whiteboard Your Idea",
      description: "Visualize and map out your startup concept with collaborative whiteboarding. Perfect for brainstorming and team planning.",
      url: "https://miro.com",
      logo: miroLogo,
      color: "bg-orange-600 hover:bg-orange-700",
      category: "Collaboration"
    },
    {
      name: "Notion",
      title: "Organize & Analyze",
      description: "Keep all your startup research, customer feedback, and business insights organized in one powerful workspace.",
      url: "https://notion.so",
      logo: notionLogo,
      color: "bg-gray-600 hover:bg-gray-700",
      category: "Organization"
    },
    {
      name: "Augment",
      title: "Learn from Top Entrepreneurs",
      description: "An MBA for entrepreneurs, by entrepreneurs: entirely practical, taught by the world's greatest entrepreneurs, on your terms, and costing less than 1% of a traditional MBA. Validator AI members get 30% off!",
      url: "https://agmntbiz.link/validatorai",
      logo: augmentLogo,
      color: "bg-lime-600 hover:bg-lime-700",
      category: "Education"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">🚀</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">💼</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-secondary/30 to-primary/20 border-secondary/30">
            <span className="w-8 h-8 bg-gradient-to-br from-secondary to-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 animate-pulse-slow">
              2
            </span>
            🛠️ Your Startup Resources Kit
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            Ready to Continue?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Your idea is validated! Now access your personalized startup and idea validation resources.
            <br />
            <span className="text-primary font-semibold">Each tool is specifically chosen to help assist in planning, mockups, presentations and education! ✨</span>
          </p>
        </div>

        {/* Divider Line */}
        <div className="mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>

        {/* Resources List */}
        <div className="space-y-4 mb-12">
          {resources.map((resource, index) => (
            <Card 
              key={resource.name} 
              className={`shadow-lg ${
                ['bubble', 'beehiiv', 'augment', 'gamma'].includes(resource.name.toLowerCase())
                  ? 'border-2 border-purple-400 hover:border-purple-500 shadow-purple-200/50 dark:shadow-purple-900/50'
                  : 'border border-primary/20 hover:border-primary/40'
              } bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Logo always on left, button always on right */}
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-shrink-0"
                    onClick={() => trackClick(resource.name.toLowerCase(), 'logo', resource.url)}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2 hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer">
                      {resource.logo ? (
                        <img 
                          src={resource.logo}
                          alt={`${resource.name} logo`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          {resource.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </a>
                  
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
                      {resource.category}
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">{resource.title}</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {resource.description}
                    </p>
                  </div>
                  
                  <Button 
                    asChild 
                    className={`flex-shrink-0 ${resource.color} transition-all duration-300 transform hover:scale-105 rounded-xl px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl`}
                  >
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center"
                      onClick={() => trackClick(resource.name.toLowerCase(), 'button', resource.url)}
                    >
                      <span className="mr-2">🚀</span>
                      Try {resource.name}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
}