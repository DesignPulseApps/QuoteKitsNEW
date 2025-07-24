import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function FinalCTA() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            🎯 <span className="text-neon-400">Ready to Give Your Leads What They Want?</span>
          </h2>
          <p className="text-2xl md:text-3xl text-white font-bold mb-8">
            Stop quoting by hand.<br/>
            Start closing with QuoteKit.
          </p>
          
          <div className="bg-midnight-800/50 border border-midnight-700 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-neon-400 font-bold mb-4">✅ Unlimited Embeds</h3>
                <h3 className="text-neon-400 font-bold mb-4">✅ Branded PDF Quotes</h3>
                <h3 className="text-neon-400 font-bold mb-4">✅ AI Price Logic</h3>
              </div>
              <div>
                <h3 className="text-neon-400 font-bold mb-4">✅ Instant Lead Capture</h3>
                <h3 className="text-neon-400 font-bold mb-4">✅ No Setup Fees</h3>
                <h3 className="text-neon-400 font-bold mb-4">✅ All 50+ Calculators</h3>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl text-white mb-4 font-semibold">
              All 50+ Calculators • €5/month (renews annually, cancel anytime)
            </p>
          </div>

          <Button
            onClick={() => scrollToSection("pricing")}
            className="bg-neon-500 hover:bg-neon-600 text-white px-12 py-6 rounded-lg font-bold text-2xl transition-all duration-300 hover:shadow-glow transform hover:scale-105 animate-pulse"
          >
            💥 Get QuoteKit Now →
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Your competitors are still typing quotes by hand.
          </p>
        </motion.div>
      </div>
    </section>
  );
}