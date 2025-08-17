import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { user, signIn, loading: authLoading } = useAuth();

  // Listen for newsletter signup after auth
  useEffect(() => {
    const handleNewsletterSignupAfterAuth = () => {
      if (user) {
        handleNewsletterSignup();
      }
    };

    window.addEventListener('newsletterSignupAfterAuth', handleNewsletterSignupAfterAuth);
    
    return () => {
      window.removeEventListener('newsletterSignupAfterAuth', handleNewsletterSignupAfterAuth);
    };
  }, [user]);

  // Scroll to newsletter section when user gets subscribed after auth
  useEffect(() => {
    if (isSubscribed) {
      setTimeout(() => {
        scrollToNewsletter();
      }, 1000); // Delay to ensure the success state is rendered
    }
  }, [isSubscribed]);

  const scrollToNewsletter = () => {
    const newsletterSection = document.getElementById('newsletter-section');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const handleNewsletterSignup = async () => {
    // Check if user is authenticated
    if (!user) {
      try {
        // Redirect to Google OAuth for newsletter signup
        await signIn({ newsletterSignup: true });
        return;
      } catch (error) {
        toast({
          title: "Authentication Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // User is authenticated, proceed with newsletter signup
    setIsSubmitting(true);
    
    try {
      // Parse user name from Google auth data
      let firstName = '';
      let lastName = '';
      
      if (user.name) {
        const nameParts = user.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        // Fallback: use email prefix as first name
        firstName = user.email.split('@')[0] || '';
        lastName = '';
      }

      const response = await apiRequest("POST", "/api/insert-to-beehive", {
        email: user.email,
        firstName: firstName,
        lastName: lastName
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSubscribed(true);
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter! 📧",
        });
        
        // Scroll to newsletter section after successful subscription
        setTimeout(() => {
          scrollToNewsletter();
        }, 500); // Small delay to ensure toast is visible
      } else {
        throw new Error(data.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe to newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter-section" className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">📧</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">🚀</div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-secondary/30 to-primary/20 border-secondary/30">
              <Mail className="w-5 h-5 mr-2" />
              Newsletter
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl font-black mb-6 gradient-text">
              Join 200,000+ Others in Our Newsletter
            </h2>
            
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Get the latest startup validation tips, AI insights, and exclusive features delivered to your inbox.
            </p>

            {isSubscribed ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-semibold">Subscribed! 📧</span>
              </div>
            ) : (
              <Button 
                size="lg"
                className="px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent transition-all duration-300 transform hover:scale-110"
                onClick={handleNewsletterSignup}
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting || authLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                    {!user ? "Signing in..." : "Subscribing..."}
                  </div>
                ) : (
                  <>
                    <Mail className="w-6 h-6 mr-3" />
                    {!user ? "Join Our Newsletter" : "Join Our Newsletter"}
                    <span className="ml-3">📧</span>
                  </>
                )}
              </Button>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              No spam, unsubscribe anytime. Used by founders at top startups.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 