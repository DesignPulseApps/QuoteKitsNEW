import { motion } from "framer-motion";
import { Camera, Dumbbell, Home, Calendar, Scale, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import worksWithEverythingImage from "@assets/ChatGPT Image Jun 11, 2025, 04_37_02 PM_1749652635835.png";
import quoteKitsLogo from "@assets/ChatGPT Image Jun 11, 2025, 11_57_41 AM_1749652762359.png";

export default function NichesGrid() {
  const niches = [
    {
      icon: Camera,
      title: "Photography",
      description: "Wedding, portrait, event photography calculators",
      gradient: "from-pink-500 to-purple-600",
      calculatorSlug: "wedding-photography",
      available: true,
    },
    {
      icon: Dumbbell,
      title: "Fitness & Wellness",
      description: "Personal training, nutrition, wellness services",
      gradient: "from-green-500 to-emerald-600",
      calculatorSlug: "personal-training",
      available: true,
    },
    {
      icon: Home,
      title: "Home Services",
      description: "Landscaping, cleaning, renovation, plumbing",
      gradient: "from-blue-500 to-cyan-600",
      calculatorSlug: "landscaping",
      available: true,
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Wedding planning, catering, party services",
      gradient: "from-yellow-500 to-orange-600",
      calculatorSlug: "",
      available: false,
    },
    {
      icon: Scale,
      title: "Legal/Consulting",
      description: "Legal services, business consulting, coaching",
      gradient: "from-indigo-500 to-purple-600",
      calculatorSlug: "",
      available: false,
    },
    {
      icon: Car,
      title: "Automotive",
      description: "Auto repair, detailing, mechanic services",
      gradient: "from-red-500 to-pink-600",
      calculatorSlug: "mobile-car-wash",
      available: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="niches" className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Before/After Image Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="mb-8">
            {/* QuoteKits Logo */}
            <div className="max-w-lg mx-auto mb-8">
              <img 
                src={quoteKitsLogo}
                alt="QuoteKits - AI-powered quote calculators"
                className="w-full h-auto"
              />
            </div>
            
            {/* Works With Everything Integration Image */}
            <div className="max-w-4xl mx-auto">
              <img 
                src={worksWithEverythingImage}
                alt="Works With Everything - WordPress, Wix, Web, and more integrations"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your Arsenal of <span className="text-neon-400">Quote-to-Close</span> Power Moves
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Build trust. Get booked. Look like a pro. Without needing a developer. Without wasting hours on DMs.
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-2xl mx-auto text-sm text-gray-400">
            <div>📸 Photographers</div>
            <div>🧼 Cleaners</div>
            <div>🛠️ Electricians</div>
            <div>🏡 Renovators</div>
            <div>💇‍♂️ Barbers</div>
            <div>🍳 Food stylists</div>
            <div>🥳 Event planners</div>
            <div>🚗 Auto services</div>
            <div>💪 Fitness trainers</div>
            <div>🎨 Designers</div>
            <div>📱 Consultants</div>
            <div>...and 40+ more</div>
          </div>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {niches.map((niche) => (
            <motion.div
              key={niche.title}
              className={`bg-midnight-800 hover:bg-midnight-700 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-neon-500/20 group ${niche.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
              variants={itemVariants}
              whileHover={{ y: niche.available ? -5 : 0 }}
            >
              {niche.available ? (
                <Link href={`/calculator/${niche.calculatorSlug}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${niche.gradient} rounded-lg flex items-center justify-center mr-4`}>
                      <niche.icon className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-neon-400 transition-colors">
                      {niche.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4">{niche.description}</p>
                  <div className="text-sm text-neon-400 group-hover:text-neon-300 transition-colors flex items-center">
                    <ArrowRight className="mr-1 h-4 w-4" />
                    Try Calculator
                  </div>
                </Link>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${niche.gradient} rounded-lg flex items-center justify-center mr-4 opacity-60`}>
                      <niche.icon className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {niche.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4">{niche.description}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <ArrowRight className="mr-1 h-4 w-4" />
                    Coming Soon
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link href="/niches">
            <Button className="bg-midnight-700 hover:bg-midnight-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 border border-midnight-600 hover:border-neon-400">
              View All 56 Niches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
