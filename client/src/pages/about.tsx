import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Linkedin, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import aronImage from "@assets/aron_1754236357732.png";

export default function About() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://napkin.com/temp/form-submit/email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thanks for reaching out. I'll get back to you soon!",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-6">
            <span className="gradient-text">About Us</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About Content */}
          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6 mb-6">
                  <img 
                    src={aronImage} 
                    alt="Aron Meystedt" 
                    className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Aron Meystedt</h2>
                    <p className="text-foreground/70">Startup Founder, Advisor & Investor</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    I'm Aron Meystedt, a startup founder, advisor and investor. I am an LP (limited partner) 
                    in several funds, one being Tech Coast Angels in Orange County, CA. I frequently talk to 
                    college students about startups and business.
                  </p>
                  
                  <p className="font-medium text-primary">
                    Fun fact: I own the very first domain name ever registered on the Internet: 
                    Symbolics.com (March 15, 1985 registration date).
                  </p>
                  
                  <p>
                    My startup activities have been mentioned in WSJ, Wired, CNN, Venture Beat, 
                    Tech Crunch, CBS, CNET, Gizmodo, Slashdot, PC World and dozens of others.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 hover:bg-primary/10"
                    onClick={() => window.open('https://napkin.com', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Read more at Napkin.com</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 hover:bg-primary/10"
                    onClick={() => window.open('https://www.linkedin.com/in/aronmeystedt/', '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Connect on LinkedIn</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Media Mentions */}
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Featured In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm text-foreground/70">
                  <div>WSJ</div>
                  <div>Wired</div>
                  <div>CNN</div>
                  <div>VentureBeat</div>
                  <div>TechCrunch</div>
                  <div>CBS</div>
                  <div>CNET</div>
                  <div>Gizmodo</div>
                  <div>Slashdot</div>
                  <div>PC World</div>
                  <div>And more...</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div id="contact">
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center space-x-2">
                  <Mail className="w-6 h-6 text-primary" />
                  <span>Get In Touch</span>
                </CardTitle>
                <p className="text-foreground/70">
                  Have questions about startup validation or want to connect? Send me a message!
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-background/50 border-primary/20 focus:border-primary"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background/50 border-primary/20 focus:border-primary"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input style={{ color: 'black' }}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-background/50 border-primary/20 focus:border-primary"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea style={{ color: 'black' }}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="bg-background/50 border-primary/20 focus:border-primary resize-none"
                      placeholder="Tell me about your startup idea or ask me anything..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}