import { motion } from "framer-motion";
import { Frown, Zap, Smile, Clock, CheckCircle, TrendingUp, Search, Code } from "lucide-react";
import psychologyImage from "@assets/ChatGPT Image Jun 11, 2025, 03_34_22 PM_1749649267631.png";

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-12 lg:py-16 bg-midnight-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Before Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            😫 Before: The Back-and-Forth Burnout
          </h2>
          <p className="text-xl text-gray-300 mb-8">You've been here before...</p>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Frown className="h-8 w-8 text-red-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-white mb-4">The Old Way (Painful)</h3>
                <div className="space-y-3 text-gray-300">
                  <p>• A potential client sends a vague message</p>
                  <p>• You write a custom quote</p>
                  <p>• ...Then wait</p>
                  <p>• Crickets. No reply. No booking. Just another wasted hour.</p>
                  <p className="text-red-400 font-medium">Meanwhile, your competitor sent a sleek, automated quote in 3 seconds flat. They won the client. You lost time.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* After Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            🚀 After: From Ghosted to Booked
          </h2>
          <p className="text-xl text-gray-300 mb-8">With QuoteKit.ai, your site delivers exactly what they want</p>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Smile className="h-8 w-8 text-green-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-white mb-4">The New Way (Effortless)</h3>
                <div className="grid md:grid-cols-3 gap-6 text-gray-300 mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-neon-400" />
                    <span>Instant pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-neon-400" />
                    <span>Beautiful quote PDFs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-neon-400" />
                    <span>Email lead capture</span>
                  </div>
                </div>
                <p className="text-green-400 font-medium">All in less time than it takes to answer a DM. You become the pro they trust—before you even reply.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Fix Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            🛠️ The Fix: Our AI-Powered Quote Engine
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              number: 1,
              icon: Search,
              title: "Choose from 50+ calculators",
              description: "photographers, trades, events & more"
            },
            {
              number: 2,
              icon: Code,
              title: "Customize your style, logo & pricing",
              description: "no code needed"
            },
            {
              number: 3,
              icon: TrendingUp,
              title: "Embed & watch quotes + leads roll in",
              description: "24/7"
            }
          ].map((step) => (
            <motion.div key={step.number} className="text-center group" variants={itemVariants}>
              <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-2 border-green-400/40 rounded-3xl p-8 hover:border-green-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-green-400/20">
                <div className="relative mb-8">
                  <motion.div
                    className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-green-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <step.icon className="text-white h-12 w-12" />
                  </motion.div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-green-400">Step {step.number}</h3>
                <h4 className="text-xl font-semibold text-white mb-3">{step.title}</h4>
                <p className="text-gray-300 leading-relaxed text-lg">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  );
}
