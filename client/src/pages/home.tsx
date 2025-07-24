import { useEffect } from "react";
import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import NichesGrid from "@/components/landing/niches-grid";
import LiveDemo from "@/components/landing/live-demo";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import FinalCTA from "@/components/landing/final-cta";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import SEOHead from "@/components/seo-head";

export default function Home() {
  return (
    <div className="min-h-screen bg-midnight-900 text-white overflow-x-hidden">
      <SEOHead 
        title="QuoteKits – AI Quote Calculators for Service Businesses"
        description="AI-powered instant quote calculators that convert visitors into paying clients. 5-minute setup. No coding. Just bookings."
        keywords="quote calculator, AI quotes, service pricing, automated quotes, pricing calculator, lead generation, business quotes, instant pricing"
        url="https://www.quotekits.com/"
      />
      <Header />
      <Hero />
      <HowItWorks />
      <NichesGrid />
      <LiveDemo />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
      
      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <Button 
          onClick={() => {
            const element = document.getElementById("pricing");
            if (element) {
              const offsetTop = element.offsetTop - 80;
              window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
              });
            }
          }}
          className="w-full bg-neon-500 hover:bg-neon-600 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-glow"
        >
          💥 Get €5/month Deal
        </Button>
      </div>
    </div>
  );
}
