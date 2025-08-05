import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from 'react';

export default function Hero() {

  const [subscriberCount, setSubscriberCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('https://validatorai.com/postback/fetch_count_json.php');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        // Access val_subs
        const count = data.val_subs || 0;
        setSubscriberCount(count);
      } catch (err) {
        console.error('Fetch error:', err);
        setSubscriberCount(0);
      }
    };

    fetchCount();
  }, []);
  
  const scrollToValidation = () => {
    const element = document.getElementById('validate');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-8 pb-20 bg-gradient-to-br from-background via-primary/10 via-accent/15 to-secondary/25 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-secondary/30 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Hero Top Section with Val and Stats */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col lg:flex-row justify-center items-center space-y-6 lg:space-y-0 lg:space-x-8 xl:space-x-16">
              {/* Val's Quote Section */}
              <div className="flex items-center space-x-4 relative">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                    <img 
                      src="/attached_assets/AIValFull_1754243498167.jpg" 
                      alt="Val - Your AI Mentor" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full border border-white shadow-lg animate-pulse z-20"></div>
                </div>
                
                {/* Thought Bubble */}
                <div className="relative">
                  <div className="bg-white rounded-xl p-3 shadow-lg border border-white/20 max-w-xs">
                    <div className="text-xs text-gray-700 leading-tight">
                      <span className="font-semibold text-primary">Val provides:</span> Market insights, 
                      customer targeting, revenue ideas, and validation steps!
                    </div>
                    
                    {/* Bubble tail */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                      <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial Section */}
              <div className="text-center">
                <blockquote className="text-lg font-medium text-white mb-2">
                  "This is the future!"
                </blockquote>
                <cite className="text-sm text-white/70">
                  - Cal State Fullerton Entrepreneurship Center
                </cite>
              </div>
              
              {/* User Stats Section */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center -space-x-1">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                    alt="User"
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616c5e1b36e?w=100&h=100&fit=crop&crop=face"
                    alt="User"
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    alt="User"
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                    alt="User"
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                </div>
                <span className="text-lg font-bold text-white">{subscriberCount}</span>
                <span className="text-sm text-white/80">entrepreneurs validated</span>
              </div>
            </div>
          </div>
          
          <div className="inline-block mb-6">
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">
              Explore Your Ideas
            </span>
            <br />
            <span className="text-foreground">With AI Feedback! 🚀</span>
          </h1>
          <p className="text-xl sm:text-2xl text-foreground/70 mb-8 max-w-4xl mx-auto leading-relaxed">
            Get instant AI validation, create free landing page mockups and connect with{" "}
            <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg animate-pulse-slow">200,000+ entrepreneurs</span>{" "}
            — all completely free! 🦄
          </p>
          <Button 
            onClick={scrollToValidation}
            size="lg"
            className="inline-flex items-center px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent animate-pulse-slow"
          >
            <span className="mr-3">🎮</span>
            Lets Validate Your Idea Now!
            <ArrowRight className="ml-3 w-6 h-6 animate-bounce-gentle" />
          </Button>
          
          <div className="mt-8 flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">30 sec</div>
              <div className="text-sm text-foreground/60">to explore</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">1 min</div>
              <div className="text-sm text-foreground/60">to mock up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">1 min</div>
              <div className="text-sm text-foreground/60">for feedback</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
