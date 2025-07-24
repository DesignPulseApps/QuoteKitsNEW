import { motion } from "framer-motion";
import { Star } from "lucide-react";
import testimonialImage from "@assets/1a_1749650402887.png";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Mike",
      role: "Landscaping Pro",
      initials: "M",
      gradient: "from-green-500 to-emerald-600",
      text: "Setup took 5 minutes. My inbox hasn't stopped since.",
    },
    {
      name: "Sarah",
      role: "Wedding Photographer",
      initials: "S",
      gradient: "from-pink-500 to-purple-600",
      text: "Clients LOVE getting a quote on the spot. Total game-changer.",
    },
    {
      name: "David",
      role: "HVAC Contractor",
      initials: "D",
      gradient: "from-blue-500 to-cyan-600",
      text: "I'm closing deals before competitors even respond to emails.",
    },
  ];

  const stats = [
    { value: "300%", label: "Average Conversion Increase" },
    { value: "24/7", label: "Lead Generation" },
    { value: "5min", label: "Setup Time" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            💬 Real Pros. <span className="text-neon-400">Real Results.</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              className="bg-midnight-800 rounded-xl p-6 hover:bg-midnight-700 transition-colors"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center mr-3`}
                >
                  <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics Image */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <img 
            src={testimonialImage} 
            alt="Customer testimonials and statistics showing 300% conversion increase, 24/7 lead generation, 5min setup"
            className="mx-auto max-w-4xl w-full rounded-2xl shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
