import { Button } from "@/components/ui/button";
import { Rocket, Play, CheckCircle, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import heroImage from "@assets/ChatGPT Image Jun 11, 2025, 03_34_10 PM_1749649063120.png";

export default function Hero() {
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
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-500/10 rounded-full blur-3xl"
          animate={{
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-neon-400/5 rounded-full blur-3xl"
          animate={{
            y: [20, -20, 20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-neon-500/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto pt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-neon-400">💥 They Don't Want a Chat.</span>
            <br />
            <span className="text-white animate-pulse">
              They Want a Price.
            </span>
          </motion.h1>

          <motion.div
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-gray-200 text-lg md:text-xl">
              Clients don't want to call. They won't wait for an email.<br />
              <span className="text-white font-semibold">They want a price—right now.</span>
            </p>
            
            <p className="text-gray-300 text-lg md:text-xl">
              If your website can't quote instantly, they'll click away and never return.<br />
              It's not your fault. Your service page just isn't built to convert.
            </p>
            
            <p className="text-neon-300 font-bold text-xl md:text-2xl">
              But now it can be.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              onClick={() => scrollToSection("pricing")}
              className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-6 rounded-lg font-bold text-xl transition-all duration-300 hover:shadow-glow transform hover:scale-105 min-w-[400px] max-w-lg"
            >
              💥 Get Lifetime Access for Just €5/month
            </Button>
            <p className="text-sm text-gray-400 text-center max-w-md">
              Limited Launch Offer • Renews annually • Cancel anytime
            </p>
            
            <p className="text-gray-200 text-lg md:text-xl text-center max-w-2xl">
              QuoteKit calculators give you <span className="text-white font-semibold">confirmed bookings</span>, not question marks.<br />
              No calls. No emails. No fuss.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/niches">
                <Button
                  variant="outline"
                  className="border border-gray-600 hover:border-neon-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-transparent"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  See All 56 Niches
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border border-gray-600 hover:border-neon-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <img 
              src={heroImage} 
              alt="No Calls. No Emails. Just Bookings - AI Calculator showing instant quotes"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="text-neon-400 h-5 w-5" />
              <span>No Coding Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-neon-400 h-5 w-5" />
              <span>5-Minute Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-neon-400 h-5 w-5" />
              <span>500+ Businesses</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
