import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Users, Target, BarChart, Lightbulb } from "lucide-react";
import { Link } from "wouter";

export default function ValidationStrategyArticle() {
  return (
    <section className="py-16 bg-gradient-to-br from-accent/10 via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black mb-6 gradient-text">
            This is How Ideas Are Validated in 2026 and Beyond
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Are you using dated methods? Discover the modern approach to startup idea validation that's helping entrepreneurs build successful businesses faster than ever before.
          </p>
        </div>

        {/* Simple Article Summary */}
        <div className="mb-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Lightbulb className="w-6 h-6 mr-3 text-primary" />
                Learn Our Complete Audience Building Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg text-foreground/80">
                We built ValidatorAI's community to 200,000+ entrepreneurs using proven strategies. 
                Our complete guide shows exactly how we did it, so you can build your own engaged audience around your validated idea.
              </p>
              
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/validation-strategy" className="inline-flex items-center">
                    Read Complete Strategy Guide
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
} 