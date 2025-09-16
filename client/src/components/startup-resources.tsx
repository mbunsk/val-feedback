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
import Base44Icon from "@assets/base44png_1754234608565.png"
import base44Logo from "@assets/base44logo.png"

interface StartupResourcesProps {
  validationData?: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  };
}

const resources = [
    {
      name: "Base44",
      title: "Mock Up Your Website",
      description: "Make your idea a reality for FREE in minutes! No coding required - validate your idea with real people next.",
      url: "https://base44.pxf.io/c/4695538/2049275/25619?trafcat=base",
      logo: base44Logo,
      color: "bg-purple-600 hover:bg-purple-700",
      category: "Website Builder"
    },
    {
      name: "LivePlan",
      title: "Create a Full Business Plan",
      description: "Transform your validated idea into a comprehensive business plan with financial projections and investor-ready documents.",
      url: "https://pas.go2cloud.org/aff_c?offer_id=2&aff_id=9860&url_id=119 ",
      logo: liveplanLogo,
      color: "bg-blue-600 hover:bg-blue-700",
      category: "Business Planning"
    },
    
  ];

export default function StartupResources({ validationData }: StartupResourcesProps) {
  // Show preview version if validation not complete
  if (!validationData) {
    return (
      <section id="resources" className="resouce-start py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative">
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
              It’s smart to mock up what your idea might look like.  We recommend Base44, below.  You can sign up for FREE and get your idea built with AI in a matter of seconds!  👇

              <br />
              
            </p>
          </div>

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
              <CardContent className="p-6 rounded-lg text-card-foreground shadow-2xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm animate-pulse-slow ">
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

  

  return (
    <section id="resources" className="resouces-result py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative ">
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
            <span className="text-primary font-semibold">Each tool is specifically chosen to help you get your idea live fast and to plan further ✨</span>
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
              <CardContent className="p-6 rounded-lg text-card-foreground shadow-2xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm animate-pulse-slow ">
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