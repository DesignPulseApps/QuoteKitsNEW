import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import pricingImage from "@assets/1a_1749650402887.png";
import SEOHead from "@/components/seo-head";
import { 
  Check, 
  Star,
  Zap,
  Crown,
  Building,
  Sparkles
} from "lucide-react";

const pricingPlans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for trying out QuoteKits",
    badge: null,
    features: [
      "1 calculator",
      "Basic customization",
      "QuoteKits branding",
      "Email support",
      "Basic analytics",
      "Mobile responsive"
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "€5",
    period: "month",
    originalPrice: "€15",
    description: "Launch offer - save 67%",
    badge: "Launch Offer",
    features: [
      "5 calculators",
      "Full customization",
      "Your branding",
      "Priority email support", 
      "Advanced analytics",
      "Lead capture forms",
      "Export data",
      "Custom domains"
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    popular: true
  },
  {
    name: "Business",
    price: "€35",
    period: "month", 
    description: "For growing businesses",
    badge: null,
    features: [
      "20 calculators",
      "Team collaboration",
      "API access",
      "Phone support",
      "Custom integrations",
      "White-label solution",
      "Advanced reporting",
      "Multi-language support"
    ],
    cta: "Start Business Trial",
    ctaVariant: "outline" as const,
    popular: false
  },
  {
    name: "Enterprise",
    price: "€95",
    period: "month",
    description: "For large organizations",
    badge: "Most Powerful",
    features: [
      "Unlimited calculators",
      "Dedicated account manager",
      "Custom development",
      "24/7 phone support",
      "SLA guarantee",
      "On-premise deployment",
      "Advanced security",
      "Training & onboarding"
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#060517'}}>
      <SEOHead 
        title="Pricing - Start Free Quote Calculator | QuoteKit.ai"
        description="Simple, transparent pricing for AI quote calculators. Start free, then just €5/month for Pro features. No hidden fees. Perfect for service businesses."
        keywords="quote calculator pricing, AI quotes cost, service pricing plans, automated quotes subscription, business tools pricing"
        url="https://quotekit.ai/pricing"
      />
      <Header />
      
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="py-20 lg:py-32 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-neon-500/20 text-neon-400 border-neon-500/30">
                Simple, Transparent Pricing
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-400 to-blue-400">Growth Plan</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                Start free and scale as you grow. No hidden fees, no surprises.
                Cancel anytime.
              </p>
              
              {/* Statistics and Testimonials Image */}
              <div className="mb-16">
                <img 
                  src={pricingImage} 
                  alt="Customer testimonials and statistics showing 300% conversion increase, 24/7 lead generation, 5min setup"
                  className="mx-auto max-w-4xl w-full rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`p-8 h-full relative ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-neon-500/10 to-blue-500/10 border-neon-500/50 shadow-2xl shadow-neon-500/20' 
                      : 'bg-black/50 border-gray-800 backdrop-blur-sm'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-neon-500 to-blue-500 text-white px-4 py-1">
                          <Star className="w-4 h-4 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    {plan.badge && !plan.popular && (
                      <Badge className="absolute -top-3 left-4 bg-orange-500 text-white">
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      
                      <div className="flex items-baseline justify-center mb-2">
                        {plan.originalPrice && (
                          <span className="text-2xl text-gray-500 line-through mr-2">
                            {plan.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400 ml-1">/{plan.period}</span>
                      </div>
                      
                      {plan.originalPrice && (
                        <p className="text-green-400 text-sm font-medium">Save 67%</p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <Button 
                        asChild
                        variant={plan.ctaVariant}
                        className={`w-full py-3 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-neon-500 to-blue-500 hover:from-neon-600 hover:to-blue-600 text-white shadow-lg hover:shadow-glow' 
                            : plan.ctaVariant === 'outline'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        <Link href={
                          plan.name === 'Free' 
                            ? '/register' 
                            : `/register?plan=${plan.name.toLowerCase()}&price=${plan.price.replace('€', '')}`
                        }>
                          {plan.name === 'Free' ? plan.cta : `Start ${plan.name} Trial`}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm relative">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Everything you need to know about QuoteKit pricing
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {[
                  {
                    question: "Can I change plans anytime?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
                  },
                  {
                    question: "Is there a free trial?",
                    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
                  },
                  {
                    question: "What happens if I exceed my calculator limit?",
                    answer: "You can easily upgrade to a higher plan or purchase additional calculators as needed."
                  },
                  {
                    question: "Do you offer discounts for annual billing?",
                    answer: "Yes, save 20% when you choose annual billing on any paid plan."
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
                  },
                  {
                    question: "Is there a setup fee?",
                    answer: "No setup fees, ever. You only pay the monthly or annual subscription fee."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-black/50 border-gray-800 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300">
                        {faq.answer}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Converting?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using QuoteKit to capture more leads and close more deals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-gradient-to-r from-neon-500 to-blue-500 hover:from-neon-600 hover:to-blue-600 text-white px-8 py-4 text-lg rounded-lg font-medium transition-all duration-300 hover:shadow-glow"
                >
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg rounded-lg font-medium transition-all duration-300"
                >
                  <Link href="/niches">Browse Calculators</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}