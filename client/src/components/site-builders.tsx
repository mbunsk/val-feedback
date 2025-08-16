import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import base44Logo from "@assets/base44png_1754234608565.png";
import bubbleLogo from "@assets/bubble-icon-logo-png_seeklogo-448116_1754234608565.png";
import lovableLogo from "@assets/lovable-icon-bg-light_1754234608566.png";

interface SiteBuildersProps {
  validationData?: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  };
}

export default function SiteBuilders({ validationData }: SiteBuildersProps) {
  const [copied, setCopied] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { toast } = useToast();

  const samplePrompt = `Create a landing page mockup for "FitAI" - an app concept that uses AI to create personalized workout plans. Include a hero section highlighting the AI personalization, features section showing workout customization, testimonials section, and a signup form to collect interest. Use a clean, fitness-focused design with blue and green accent colors. Perfect for showing the concept to potential partners, friends, or collaborators who might be interested in the idea.`;

  const generateRefinedPrompt = async () => {
    if (!validationData) return samplePrompt;
    
    setGeneratingPrompt(true);
    try {
      const response = await apiRequest("POST", "/api/generate-prompt", {
        idea: validationData.idea,
        targetCustomer: validationData.targetCustomer,
        problemSolved: validationData.problemSolved
      });
      
      const data = await response.json();
      setCurrentPrompt(data.prompt);
      return data.prompt;
    } catch (error) {
      // Fallback to improved template if API fails
      const fallbackPrompt = `Create a landing page for "${validationData.idea.toLowerCase()}" which helps ${validationData.targetCustomer.toLowerCase()} solve ${validationData.problemSolved.toLowerCase()}. The target customer is ${validationData.targetCustomer.toLowerCase()}. The goal of the site is to highlight our new venture and to collect emails of interested early users. Include a hero section, key features, and an email signup form for early users. Use modern colors and great stock images, as this is going to be perfect for validating demand and collecting interested prospects.`;
      setCurrentPrompt(fallbackPrompt);
      return fallbackPrompt;
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const getCustomPrompt = () => {
    if (!validationData) return samplePrompt;
    if (currentPrompt) return currentPrompt;
    
    // Default improved template
    return `Create a landing page for "${validationData.idea.toLowerCase()}" which helps ${validationData.targetCustomer.toLowerCase()} solve ${validationData.problemSolved.toLowerCase()}. The target customer is ${validationData.targetCustomer.toLowerCase()}. The goal of the site is to highlight our new venture and to collect emails of interested early users. Include a hero section, key features, and an email signup form for early users. Use modern colors and great stock images, as this is going to be perfect for validating demand and collecting interested prospects.`;
  };

  const copyPrompt = async () => {
    const promptToCopy = validationData ? getCustomPrompt() : samplePrompt;
    try {
      await navigator.clipboard.writeText(promptToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const trackLinkClick = async (company: string, linkType: string, url: string) => {
    try {
      await apiRequest("POST", "/api/track-click", {
        company,
        linkType,
        url
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error("Failed to track link click:", error);
    }
  };

  const builders = [
    /*{
      name: "Base44",
      description: "Free builder with powerful features — no credit card needed!",
      url: "https://base44.pxf.io/c/4695538/2049275/25619?trafcat=base",
      color: "bg-orange-600 hover:bg-orange-700",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      recommended: true,
    },
    {
      name: "Lovable",
      description: "Beautiful visual editor — start creating instantly for free!",
      url: "https://lovable.dev/?via=aron",
      color: "bg-pink-600 hover:bg-pink-700",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },*/
    {
      name: "Bubble",
      description: "Visual programming — build apps without code for free!",
      url: "https://bubble.pxf.io/e1kn1O",
      color: "bg-purple-600 hover:bg-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <section id="build" className="py-20 bg-gradient-to-br from-secondary/25 via-background to-primary/15 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">🎨</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">⚡</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-secondary/30 to-primary/20 border-secondary/30">
            <span className="w-8 h-8 bg-gradient-to-br from-secondary to-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 animate-pulse-slow">
              2
            </span>
            🎨 Build Your Landing Page
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            Mock Up Your Idea! <span className="emoji">🚀</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Create a free landing page to show partners, customers, and friends what you're exploring!
            <br />
            <span className="text-primary font-semibold">Perfect for sharing your concept and getting feedback! ✨</span>
          </p>
        </div>

        {/* Prompt Generator */}
        <Card className="mb-12 shadow-2xl border-2 border-accent/30 bg-card/80 backdrop-blur-sm animate-pulse-slow">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <span className="text-3xl animate-wiggle">📝</span>
              <h3 className="text-2xl font-black gradient-text mt-2">
                {validationData ? "Your Custom Landing Page Prompt!" : "Free Landing Page Prompt!"}
              </h3>
              <p className="text-foreground/70 mt-2">
                {validationData 
                  ? "AI-generated prompt based on your idea and validation feedback" 
                  : "Copy this and create your mockup in minutes — completely free!"
                }
              </p>
            </div>
            

            
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-4 sm:p-6 border-2 border-accent/30 highlight-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <p className="text-lg font-semibold text-foreground">✨ Copy & paste to get started free:</p>
                <Button
                  onClick={async () => {
                    if (validationData && !currentPrompt) {
                      await generateRefinedPrompt();
                    }
                    copyPrompt();
                  }}
                  variant="outline"
                  className="rounded-full border-2 border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  size="sm"
                  disabled={generatingPrompt}
                >
                  {generatingPrompt ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full" />
                      Generating...
                    </div>
                  ) : copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      🎉 Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      📋 Copy Prompt
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-card/90 p-4 sm:p-6 rounded-xl border-2 border-primary/20 font-mono text-xs sm:text-sm text-foreground shadow-inner backdrop-blur-sm max-h-64 overflow-y-auto">
                {validationData ? (
                  getCustomPrompt()
                ) : (
                  <div className="text-center text-muted-foreground/70 py-8">
                    <p className="text-sm">Your landing page prompt will appear here</p>
                    <p className="text-sm">once you validate your startup idea above.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructions to use builders */}
            <div className="text-center mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <p className="text-foreground/80 text-lg">
                <span className="pulse-pointer text-2xl">👇</span> <span className="font-semibold">Paste your prompt with our site builder partner, Bubble</span> below to see what your idea looks like live!
              </p>
            </div>


          </CardContent>
        </Card>

        {/* Site Builders */}
        <div className="grid md:grid-cols-1 gap-8">
          {builders.map((builder, index) => (
            <Card key={builder.name} className={`shadow-2xl border-2 ${builder.recommended ? 'border-orange-400 hover:border-orange-500 ring-2 ring-orange-200' : 'border-primary/20 hover:border-primary/40'} bg-card/80 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 animate-float`} style={{animationDelay: `${index * 0.2}s`}}>
              <CardContent className="p-8 text-center">
                <a 
                  href={builder.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer" 
                  style={{animationDelay: `${index * 0.3}s`}}
                  onClick={() => trackLinkClick(builder.name.toLowerCase(), 'logo', builder.url)}
                >
                  <img 
                    src={
                      builder.name === "Base44" ? base44Logo :
                      builder.name === "Lovable" ? lovableLogo :
                      builder.name === "Bubble" ? bubbleLogo :
                      ""
                    }
                    alt={`${builder.name} logo`}
                    className="w-12 h-12 object-contain"
                  />
                </a>
                <h3 className="text-2xl font-black text-foreground mb-3">{builder.name}</h3>
                <p className="text-foreground/70 mb-6 text-lg">{builder.description}</p>
                <Button asChild className={`w-full ${builder.color} transition-all duration-300 transform hover:scale-105 rounded-2xl py-6 text-lg font-bold shadow-lg hover:shadow-xl`}>
                  <a 
                    href={builder.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center"
                    onClick={() => trackLinkClick(builder.name.toLowerCase(), 'button', builder.url)}
                  >
                    <span className="mr-2">🎨</span>
                    Mock Up For Free
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
