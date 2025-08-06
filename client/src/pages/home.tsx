import { useState } from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import IdeaValidation from "@/components/idea-validation";
import SiteBuilders from "@/components/site-builders";
import NewsletterForm from "@/components/newsletter-form";
import Testimonials from "@/components/testimonials";
import NewsletterSignup from "@/components/newsletter-signup";
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
      <SiteBuilders validationData={validationData} />
      <NewsletterForm />
      <Testimonials />
 
      <Footer />
    </div>
  );
}
