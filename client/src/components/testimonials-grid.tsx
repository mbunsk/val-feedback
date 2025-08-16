import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    initial: "J",
    name: "Jessica",
    location: "USA",
    quote: "Val has been really great so far! It feels light years better than anything I've used before. I've attempted several business ideas in the past and this is hands down the most confident that I've felt about any of them."
  },
  {
    initial: "D",
    name: "Dr. Ivan Romano",
    company: "Substancy",
    quote: "This is amazing! I'm blown away!"
  },
  {
    initial: "T",
    name: "Travis",
    location: "Professor in California",
    quote: "Over our conversation, Val asked the right questions to help me structure a clear starting point for the startup I discussed."
  },
  {
    initial: "D",
    name: "David Fox",
    company: "Zapt",
    quote: "Putting Zapt through Validator AI gave us actionable advice and excellent insights which significantly helped us move forward."
  },
  {
    initial: "J",
    name: "Jen",
    location: "USA",
    quote: "I did an accelerator previously which fell short. Val is helping me move forward the correct way."
  },
  {
    initial: "A",
    name: "Andrew Bouras",
    company: "Varos Technologies",
    quote: "We have received accurate feedback every step of the way. The AI hit on all important aspects of our business that we are addressing."
  }
];

export default function TestimonialsGrid() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-20 animate-float">💬</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-bounce-gentle">⭐</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            What Entrepreneurs Say
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Thousands of founders trust Val to validate their startup ideas
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="shadow-lg border-2 border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 animate-float" 
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardContent className="p-6">
                {/* Avatar and Name */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.company || testimonial.location}
                    </div>
                  </div>
                </div>
                
                {/* Quote */}
                <p className="text-foreground/80 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 