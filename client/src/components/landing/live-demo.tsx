import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle, Home, Camera, Dumbbell, Trees, Sparkles } from "lucide-react";
import { Link } from "wouter";
import statsImage from "@assets/ChatGPT Image Jun 11, 2025, 03_34_34 PM_1749649780004.png";

const demoCalculators = [
  {
    title: "Home Renovation AI",
    icon: Home,
    href: "/calculator/home-renovation",
    description: "AI-powered renovation quotes with natural language input",
    featured: true,
    badge: "NEW AI"
  },
  {
    title: "Wedding Photography",
    icon: Camera,
    href: "/calculator/wedding-photography",
    description: "Event duration, guest count, and location pricing"
  },
  {
    title: "Personal Training",
    icon: Dumbbell,
    href: "/calculator/personal-training",
    description: "Session packages with automatic discounts"
  },
  {
    title: "Landscaping Services",
    icon: Trees,
    href: "/calculator/landscaping",
    description: "Square footage and material complexity pricing"
  }
];

export default function LiveDemo() {
  return (
    <section className="py-12 lg:py-16 bg-midnight-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            See QuoteKit <span className="text-neon-400">In Action</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Try our live calculators and see how they instantly convert visitors into qualified leads with professional quotes.
          </p>
          
          {/* Statistics Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img 
              src={statsImage} 
              alt="QuoteKit Statistics - 300% Average Conversion Increase, 24/7 Lead Generation, 5min Setup Time"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Featured Calculator - Home Renovation AI */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-neon-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                NEW AI
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Home Renovation AI Calculator</h3>
                    <p className="text-blue-200">Advanced AI with natural language processing</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                    <span className="text-gray-300">Natural language input processing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                    <span className="text-gray-300">Real-time quote calculations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                    <span className="text-gray-300">Professional quote emails</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-neon-400 mr-3 h-5 w-5" />
                    <span className="text-gray-300">Smart suggestions & upsells</span>
                  </div>
                </div>

                <Link href="/calculator/home-renovation">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                    <Play className="mr-2 h-5 w-5" />
                    Try AI Calculator Demo
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto relative">
                  <div className="text-gray-800">
                    <h4 className="text-xl font-bold mb-4 text-center">Home Renovation Quote</h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-blue-600 mb-2">
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">AI Input</span>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        "I want to redo my kitchen and paint my apartment (80m²)"
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>✓ Kitchen Remodel</span>
                        <span className="font-medium">€8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✓ Painting (80m²)</span>
                        <span className="font-medium">€2,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✓ Consultation Fee</span>
                        <span className="font-medium">€500</span>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Total Estimate</div>
                        <div className="text-3xl font-bold text-blue-600">€11,400</div>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors">
                      Get Detailed Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Other Calculator Demos */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {demoCalculators.slice(1).map((calculator, index) => (
            <Card key={calculator.title} className="bg-midnight-800 border-midnight-700 p-6 hover:border-neon-500/30 transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center mr-3">
                  <calculator.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{calculator.title}</h3>
              </div>
              
              <p className="text-gray-400 mb-6">{calculator.description}</p>
              
              <Link href={calculator.href}>
                <Button 
                  variant="outline" 
                  className="w-full border-midnight-600 hover:bg-neon-500 hover:border-neon-500 hover:text-white transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Try Demo
                </Button>
              </Link>
            </Card>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-6">
            Each calculator captures leads automatically and generates professional quotes in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/niches">
              <Button className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-glow">
                Browse All 50+ Niches
              </Button>
            </Link>
            <Link href="#pricing">
              <Button 
                variant="outline" 
                className="border-neon-500 text-neon-400 hover:bg-neon-500 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Start Building - €5/month
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
