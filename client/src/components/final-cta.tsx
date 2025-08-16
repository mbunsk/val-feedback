import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function FinalCTA() {
  const scrollToValidation = () => {
    const validationSection = document.getElementById('validation');
    if (validationSection) {
      validationSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">🎯</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">✨</div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
          Ready to Validate Your Startup Idea?
        </h2>
        
        <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
          Join thousands of entrepreneurs who have explored their wild ideas with our AI. 
          Get your AI-powered validation report in just 30 seconds.
        </p>

        <Button 
          onClick={scrollToValidation}
          size="lg"
          className="px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent transition-all duration-300 transform hover:scale-110"
        >
          <span className="mr-3">🔬</span>
          Start Validating Now
          <ArrowUp className="ml-3 w-6 h-6" />
        </Button>

        <p className="text-sm text-muted-foreground mt-4">
          Free • No signup required • Get results in 30 seconds
        </p>
      </div>
    </section>
  );
} 