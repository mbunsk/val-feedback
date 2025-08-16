import { useState } from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import IdeaValidation from "@/components/idea-validation";
import StartupResources from "@/components/startup-resources";
import StartupSimulator from "@/components/startup-simulator";
import ValidationStrategyArticle from "@/components/validation-strategy-article";
import AudienceBuildingSection from "@/components/audience-building-section";
import TestimonialsGrid from "@/components/testimonials-grid";
import NewsletterSection from "@/components/newsletter-section";
import FinalCTA from "@/components/final-cta";
import Footer from "@/components/footer";

export default function Home() {
  const [validationData, setValidationData] = useState<{
    idea: string;
    targetCustomer: string;
    problemSolved: string;
    feedback: string;
  } | undefined>();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <IdeaValidation onValidationComplete={setValidationData} />
      <StartupResources validationData={validationData} />
      <StartupSimulator validationData={validationData} />
      
      {/* Section Divider */}
      <div className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-primary/60"></div>
            <div className="mx-8 flex items-center gap-3 text-3xl">
              <span>⭐</span>
              <span>✨</span>
              <span>⭐</span>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent"></div>
          </div>
        </div>
      </div>
      
      {!validationData && (
        <>
          <TestimonialsGrid />
          <NewsletterSection />
          <FinalCTA />
        </>
      )}
      
      {/* Show validation strategy article after simulation */}
      {validationData && (
        <>
          <ValidationStrategyArticle />
          <AudienceBuildingSection />
        </>
      )}
      
      <Footer />
    </div>
  );
}
