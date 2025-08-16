import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsSubmitting(false);
      toast({
        title: "Success!",
        description: "You've been added to our newsletter.",
      });
    }, 1000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10 relative">
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

            <Button 
              size="lg"
              className="px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent transition-all duration-300 transform hover:scale-110"
              onClick={() => window.open('https://www.beehiiv.com/?via=aron-meystedt&_bhlid=bfc4afcba0acc7ca8c69966bb231bf46b6adfee0', '_blank')}
            >
              <Mail className="w-6 h-6 mr-3" />
              Join Our Newsletter
              <span className="ml-3">📧</span>
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              No spam, unsubscribe anytime. Used by founders at top startups.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 