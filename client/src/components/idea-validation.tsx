import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Lightbulb, Target, Users, Zap, LogIn } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import SaveResults from "@/components/save-results";

interface ValidationResponse {
  id: string;
  idea: string;
  targetCustomer: string;
  problemSolved: string;
  feedback: string;
  createdAt: string;
}

interface IdeaValidationProps {
  onValidationComplete?: (data: {
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  }) => void;
}

export default function IdeaValidation({ onValidationComplete }: IdeaValidationProps) {
  const [idea, setIdea] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const { toast } = useToast();
  const { user, signIn, loading: authLoading, pendingValidation, clearPendingValidation } = useAuth();
  const hasAutoSubmitted = useRef(false);

  // Beehiiv newsletter signup function
  const subscribeToNewsletter = async (email: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch('https://napkin.com/temp/form-submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: firstName + ' ' + lastName, email: email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Successfully subscribed to newsletter:', data);
        return { success: true, data };
      } else {
        console.error('Newsletter subscription failed:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Newsletter subscription network error:', error);
      return { success: false, error };
    }
  };

  const validateMutation = useMutation({
    mutationFn: async (data: { idea: string; targetCustomer: string; problemSolved: string }) => {
      console.log('validateMutation called with data:', data);
      const response = await apiRequest("POST", "/api/validate", data);
      console.log('Validation response received');
      return response.json() as Promise<ValidationResponse>;
    },
    onSuccess: async (data) => {
      setValidationResult(data);
      
      // Pass validation data to parent component
      if (onValidationComplete) {
        onValidationComplete({
          idea: data.idea,
          targetCustomer: data.targetCustomer,
          problemSolved: data.problemSolved,
          feedback: data.feedback
        });
      }

      // Auto-subscribe user to newsletter if they have email
      if (user?.email && !newsletterSubscribed) {
        try {
          let firstName = '';
          let lastName = '';
          
          if (user?.user_metadata?.full_name) {
            const nameParts = user.user_metadata.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else {
            // Fallback: use email prefix as first name
            firstName = user.email.split('@')[0] || '';
            lastName = '';
          }
          
          const result = await subscribeToNewsletter(user.email, firstName, lastName);
          
          if (result.success) {
            setNewsletterSubscribed(true);
            /*toast({
              title: "Newsletter Subscription",
              description: "You've been subscribed to our startup insights newsletter! 📧",
            });*/
          } else {
            console.warn('Newsletter subscription failed:', result.error);
            // Don't show error toast to user as this is a background process
          }
        } catch (error) {
          console.error('Newsletter subscription error:', error);
        }
      }
      
      setTimeout(() => {
        const element = document.getElementById('validation-response');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add focus to make it more prominent
          element.focus();
          // Add a more prominent highlight effect for auto-submitted validations
          if (hasAutoSubmitted.current) {
            element.style.outline = '3px solid #3b82f6';
            element.style.outlineOffset = '6px';
            element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
            // Remove the highlight after 5 seconds for auto-submitted validations
            setTimeout(() => {
              element.style.outline = '';
              element.style.outlineOffset = '';
              element.style.boxShadow = '';
            }, 5000);
          } else {
            // Regular highlight for manual submissions
            element.style.outline = '2px solid #3b82f6';
            element.style.outlineOffset = '4px';
            // Remove the highlight after 3 seconds
            setTimeout(() => {
              element.style.outline = '';
              element.style.outlineOffset = '';
            }, 3000);
          }
        }
      }, 100);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate your idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle pending validation after authentication
  useEffect(() => {
    console.log('useEffect triggered:', { 
      user: !!user, 
      pendingValidation: !!pendingValidation, 
      validationResult: !!validationResult,
      hasAutoSubmitted: hasAutoSubmitted.current 
    });
    
    if (user && pendingValidation && !validationResult && !hasAutoSubmitted.current) {
      console.log('Auto-submitting validation with data:', pendingValidation);
      hasAutoSubmitted.current = true;
      
      // Pre-populate the form with pending validation data
      setIdea(pendingValidation.idea);
      setTargetCustomer(pendingValidation.targetCustomer);
      setProblemSolved(pendingValidation.problemSolved);
      scrollToElement('tell-us-about-your-idea');
      // Auto-submit the validation
      console.log('Calling validateMutation.mutate with:', pendingValidation);
      validateMutation.mutate(pendingValidation);
      
      // Clear the pending validation
      clearPendingValidation();
      
      toast({
        title: "Welcome back!",
        description: "Your idea validation is being processed...",
      });
    }
  }, [user, pendingValidation, validationResult, clearPendingValidation, toast]);

  // Reset auto-submit flag when user signs out or when there's no pending validation
  useEffect(() => {
    if (!user || !pendingValidation) {
      hasAutoSubmitted.current = false;
    }
  }, [user, pendingValidation]);

  const handleValidation = async () => {
    if (!idea.trim() || !targetCustomer.trim() || !problemSolved.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all three fields!",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      try {
        // Store the form data and redirect to Google OAuth
        await signIn({ idea, targetCustomer, problemSolved });
        return; // The user will be redirected to Google OAuth
      } catch (error) {
        toast({
          title: "Authentication Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // User is authenticated, proceed with validation
    validateMutation.mutate({ idea, targetCustomer, problemSolved });
  };

  const parseFeedback = (feedbackHtml: string) => {
    // Clean up any stray HTML text that might appear before the actual content
    let cleanedHtml = feedbackHtml;
    
    // Remove any HTML text that might appear at the beginning
    cleanedHtml = cleanedHtml.replace(/^[\s\S]*?(<div class="validation-section">)/i, '$1');
    
    // Remove any stray ```html tags if they exist
    cleanedHtml = cleanedHtml.replace(/```html\s*/gi, '');
    cleanedHtml = cleanedHtml.replace(/```\s*/gi, '');
    
    return cleanedHtml;
  };

  return (
    <section id="validate" className="py-20 bg-gradient-to-br from-accent/15 to-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 text-6xl opacity-20 animate-float">💡</div>
        <div className="absolute bottom-10 left-10 text-4xl opacity-20 animate-bounce-gentle">🚀</div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            <span className="w-8 h-8 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 animate-pulse-slow">
              1
            </span>
            🎯 Idea Validation Lab
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            What's Your Wild Idea? <span className="text-5xl emoji">🤔</span>
          </h2>
          <p className="text-xl text-foreground/70 leading-relaxed">
            Share any idea and our AI will give you thoughtful feedback, insights, and suggestions to explore it further!
            <br />
            <span className="text-primary font-semibold">No pressure, just fun exploration! ✨</span>
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm animate-pulse-slow">
          <CardContent className="p-8">
            <div className="text-center mb-8" id="tell-us-about-your-idea">
              <span className="text-3xl">💭</span>
              <p className="text-lg font-semibold text-foreground mt-2">
                Tell us about your idea in 3 quick steps
              </p>
              <p className="text-sm text-foreground/60">
                Just the basics - we'll do the deep thinking for you! 🎨
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Show pending validation message */}
              {pendingValidation && user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Welcome back! Your form has been pre-filled and validation is in progress...
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <label className="text-sm font-semibold text-foreground">What is your startup idea?</label>
                </div>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  className="text-base resize-none border-2 border-primary/30 focus:border-primary rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., A sneaker display case that saves space and shows off collections..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-accent" />
                  <label className="text-sm font-semibold text-foreground">Who is the target customer?</label>
                </div>
                <Input
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className="text-base border-2 border-accent/30 focus:border-accent rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., Sneaker collectors with 20+ pairs..."
                />
              </div>

              <div className="space-y-2" id="problem-solved-input">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-secondary" />
                  <label className="text-sm font-semibold text-foreground">What problem does it solve?</label>
                </div>
                <Input
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  className="text-base border-2 border-secondary/30 focus:border-secondary rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., Limited space for sneaker storage and display..."
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button id="validate-button" 
                onClick={handleValidation}
                disabled={validateMutation.isPending || authLoading}
                size="lg"
                className="px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent transition-all duration-300 transform hover:scale-110"
              >
                {validateMutation.isPending && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
                {authLoading && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
                <span className="mr-2">
                  {!user ? "🔐" : "🔬"}
                </span>
                {validateMutation.isPending ? "AI analysis coming in 30 seconds..." : 
                 authLoading ? "Checking authentication..." :
                 !user ? "Get AI Feedback!" : "Get AI Feedback!"}
                {!validateMutation.isPending && !authLoading && <span className="ml-2">✨</span>}
              </Button>
            </div>

            {validationResult && (() => {
              const feedbackHtml = parseFeedback(validationResult.feedback);
              return (
                <div 
              id="validation-response" 
              tabIndex={-1}
              className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-600 focus:outline-none"
            >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-500 shadow-lg animate-bounce-gentle">
                      <img 
                        src="/attached_assets/AIValFull_1754243498167.jpg" 
                        alt="Val - Your AI Mentor" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-3xl font-black gradient-text mb-2">Val's Analysis is Ready! <span className="text-3xl">🎉</span></h3>
                    <p className="text-lg text-foreground/70">Your warm, thoughtful startup mentor has insights for you</p>
                  </div>

                  {/* AI Analysis Content */}
                  <div className="space-y-6">
                    <div 
                      className="ai-feedback-content"
                      dangerouslySetInnerHTML={{ __html: feedbackHtml }}
                    />
                  </div>

                  {/* Save Results Component */}
                  <div className="mt-6">
                    <SaveResults validationData={validationResult} />
                
                {/* Auto-submit indicator */}
                {hasAutoSubmitted.current && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        🎉 Auto-submitted after authentication - Your form was automatically processed!
                      </span>
                    </div>
                  </div>
                )}

                {/* Newsletter subscription indicator */}
                {newsletterSubscribed && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        📧 You've been subscribed to our startup insights newsletter!
                      </span>
                    </div>
                  </div>
                )}
                  </div>

                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
