import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Travis",
    title: "Professor in California",
    initials: "TR",
    color: "from-blue-400 to-blue-600",
    quote: "Val asked the right questions to help me structure a clear starting point for the startup I discussed."
  },
  {
    name: "Jessica",
    title: "USA",
    initials: "JE",
    color: "from-purple-400 to-purple-600",
    quote: "Val has been really great so far! It feels light years better than anything I've used before. This is hands down the most confident that I've felt about any of them."
  },
  {
    name: "Eric",
    title: "College Student, USA",
    initials: "ER",
    color: "from-green-400 to-green-600",
    quote: "This service makes it really easy for a person like myself that has no experience in the business sector. It is actually making me think about pursuing this small idea."
  },
  {
    name: "Jen",
    title: "USA",
    initials: "JN",
    color: "from-pink-400 to-pink-600",
    quote: "I did an accelerator previously which fell short because they molded my idea into a major opportunity. Val is helping me move forward the correct way."
  },
  {
    name: "David Fox",
    title: "Zapt",
    initials: "DF",
    color: "from-orange-400 to-orange-600",
    quote: "Putting Zapt through Validator AI gave us actionable advice and excellent insights which significantly helped us move forward. The AI mentor underscored several vital considerations."
  },
  {
    name: "Andrew Bouras",
    title: "Varos Technologies",
    initials: "AB",
    color: "from-cyan-400 to-cyan-600",
    quote: "We have received accurate feedback every step of the way. The AI hit on all important aspects of our business that we are addressing."
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary/25 via-background to-primary/15 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">🎉</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-bounce-gentle">💫</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <span className="text-4xl animate-wiggle mb-4 block">🏆</span>
          <h2 id="testimonials" className="text-3xl sm:text-5xl font-black mb-4 gradient-text">Exploration Stories!</h2>
          <p className="text-xl text-foreground/70">Real people that refined their ideas with AI and community feedback 🚀</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.name} className="shadow-2xl border-2 border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 animate-float" style={{animationDelay: `${index * 0.3}s`}}>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.color} rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle`} style={{animationDelay: `${index * 0.4}s`}}>
                    <span className="text-white font-black text-lg">{testimonial.initials}</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-black text-foreground text-lg">{testimonial.name}</p>
                    <p className="text-sm text-foreground/70 font-semibold">{testimonial.title}</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -top-2 -left-2 text-3xl text-primary/30">"</span>
                  <p className="text-foreground/80 italic leading-relaxed pl-6">{testimonial.quote}</p>
                  <span className="absolute -bottom-4 -right-2 text-3xl text-primary/30">"</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
