import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Loader2, HelpCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  projectName: z.string().min(1, "Project name is required"),
  projectSummary: z.string().min(10, "Project summary must be at least 10 characters"),
  siteUrl: z.string().url("Invalid URL"),
  whatDoYouNeed: z.string().min(1, "Please tell us what you need"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewsletterForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      projectName: "",
      projectSummary: "",
      siteUrl: "",
      whatDoYouNeed: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData & { screenshot?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'screenshot' && value) {
          formData.append(key, value);
        }
      });
      
      if (selectedFile) {
        formData.append('screenshot', selectedFile);
      }

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Subscribe to newsletter after successful submission
      try {
        const newsletterResponse = await fetch('https://napkin.com/temp/form-submit/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: form.getValues('name'),
            email: form.getValues('email')
          }),
        });

        if (newsletterResponse.ok) {
          console.log('Successfully subscribed to newsletter after submission');
        } else {
          console.error('Newsletter subscription failed after submission');
        }
      } catch (error) {
        console.error('Newsletter subscription error after submission:', error);
      }

      toast({
        title: "Success!",
        description: data.message,
      });
      form.reset();
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate({ ...data, screenshot: selectedFile || undefined });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <section id="submit" className="py-20 bg-gradient-to-br from-primary/15 via-background to-accent/15 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 text-5xl opacity-20 animate-float">⭐</div>
        <div className="absolute bottom-20 left-10 text-4xl opacity-20 animate-bounce-gentle">🏆</div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-gradient-to-r from-accent/20 to-secondary/30 border-accent/30">
            <span className="w-8 h-8 bg-gradient-to-br from-accent to-secondary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 animate-pulse-slow">
              3
            </span>
            💬 Get Feedback!
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            Share Your New Creation! <span className="emoji">🌟</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-4">
            Submit your project and get feedback and traction from our amazing community of{" "}
            <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg animate-pulse-slow">200,000+ idea explorers</span>!
          </p>
          <p className="text-lg text-foreground/60">
            Let our audience help you refine and improve your concept!
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-accent/30 bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm animate-pulse-slow">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Share Your Amazing Idea!</h3>
              <p className="text-white/80 text-lg">Fill out this form to get valuable feedback from our community</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">👋 Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">📧 Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">🚀 Idea Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your project/concept name" 
                          {...field} 
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">📝 Concept Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Brief description of your idea and what makes it interesting..."
                          className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-white font-semibold">🌐 Landing Page URL (or the preview URL your site builder offers)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-white/60 hover:text-white/80 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                At Base44, Lovable and Bubble, they give you the ability to PUBLISH your site for free and you can retrieve a preview URL there, so you can show off your new creation.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="https://your-mockup-page.com" 
                          {...field} 
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="whatDoYouNeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        What do you need?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., I need a technical founder, help with traction, advice..." 
                          {...field} 
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:bg-white/15"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />



                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    size="lg"
                    className="px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl shadow-accent/30 bg-gradient-to-r from-accent via-secondary to-accent hover:from-secondary hover:via-accent hover:to-secondary transition-all duration-300 transform hover:scale-110"
                  >
                    {submitMutation.isPending && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
                    <span className="mr-2">🌟</span>
                    {submitMutation.isPending ? "Submitting..." : "Submit My Idea!"}
                    {!submitMutation.isPending && <span className="ml-2">🚀</span>}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl px-6 py-4 border border-white/20">
                <div className="text-2xl mr-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-sm">
                  👥
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    We'll try to share your post in our widely read startup newsletter.
                  </p>
                  <p className="text-xs text-white/70">
                    Get insights and traction from thousands of curious explorers ✨
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
