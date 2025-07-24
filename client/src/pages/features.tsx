import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import featuresImage from "@assets/ChatGPT Image Jun 11, 2025, 03_36_34 PM_1749650396269.png";
import SEOHead from "@/components/seo-head";
import { 
  Zap, 
  Brain, 
  Palette, 
  Globe, 
  BarChart3, 
  Shield, 
  Clock, 
  Users, 
  Target, 
  Code, 
  Download, 
  Mail, 
  Settings, 
  Smartphone, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  PenTool,
  Bell,
  CreditCard,
  RefreshCw,
  FileText,
  Eye,
  Webhook
} from "lucide-react";

export default function Features() {
  const heroFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Intelligence",
      description: "Smart pricing algorithms and natural language processing that understands client needs"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Quote Generation",
      description: "Real-time calculations with professional breakdown and 48-hour validity locks"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Universal Embedding",
      description: "Works seamlessly on WordPress, Squarespace, Wix, Webflow, and any website"
    }
  ];

  const coreFeatures = [
    {
      category: "Smart Automation",
      icon: <Brain className="h-6 w-6" />,
      color: "from-blue-500 to-purple-600",
      features: [
        {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Natural Language Processing",
          description: "Clients describe their needs in plain English, AI auto-fills the form"
        },
        {
          icon: <Target className="h-5 w-5" />,
          title: "Smart Pricing Logic",
          description: "Dynamic pricing based on project complexity, urgency, and market rates"
        },
        {
          icon: <Bell className="h-5 w-5" />,
          title: "Quote Validity Timers",
          description: "Create urgency with countdown timers and automated follow-ups"
        },
        {
          icon: <RefreshCw className="h-5 w-5" />,
          title: "Learning Algorithms",
          description: "Pricing improves over time based on conversion data and market feedback"
        }
      ]
    },
    {
      category: "Professional Design",
      icon: <Palette className="h-6 w-6" />,
      color: "from-green-500 to-teal-600",
      features: [
        {
          icon: <PenTool className="h-5 w-5" />,
          title: "Custom Branding",
          description: "Upload your logo, adjust colors, fonts, and styling to match your brand"
        },
        {
          icon: <Smartphone className="h-5 w-5" />,
          title: "Mobile-First Design",
          description: "Optimized for all devices with touch-friendly interfaces and fast loading"
        },
        {
          icon: <Eye className="h-5 w-5" />,
          title: "Professional Templates",
          description: "Industry-specific designs that build trust and credibility"
        },
        {
          icon: <Settings className="h-5 w-5" />,
          title: "JSON Style Editor",
          description: "Advanced customization for developers with full CSS control"
        }
      ]
    },
    {
      category: "Lead Generation",
      icon: <Users className="h-6 w-6" />,
      color: "from-orange-500 to-red-600",
      features: [
        {
          icon: <Mail className="h-5 w-5" />,
          title: "Email Capture",
          description: "Optional email gates before quote reveal to build your prospect list"
        },
        {
          icon: <Download className="h-5 w-5" />,
          title: "PDF Quote Export",
          description: "Professional branded quotes that clients can save and share"
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          title: "Analytics Dashboard",
          description: "Track quote volumes, conversion rates, and revenue metrics"
        },
        {
          icon: <Webhook className="h-5 w-5" />,
          title: "CRM Integration",
          description: "Connect to Mailchimp, HubSpot, Airtable, and 50+ other platforms"
        }
      ]
    },
    {
      category: "Business Tools",
      icon: <Code className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600",
      features: [
        {
          icon: <Globe className="h-5 w-5" />,
          title: "Multi-Language Support",
          description: "Serve global clients with built-in translations for major languages"
        },
        {
          icon: <Shield className="h-5 w-5" />,
          title: "Security & Privacy",
          description: "GDPR compliant with encrypted data and secure hosting"
        },
        {
          icon: <Clock className="h-5 w-5" />,
          title: "24/7 Uptime",
          description: "Reliable hosting with 99.9% uptime guarantee and global CDN"
        },
        {
          icon: <CreditCard className="h-5 w-5" />,
          title: "Payment Integration",
          description: "Accept deposits and payments directly through Stripe integration"
        }
      ]
    }
  ];

  const integrationFeatures = [
    { name: "WordPress", logo: "🔌", description: "Simple shortcode and plugin" },
    { name: "Squarespace", logo: "🟦", description: "Code injection and blocks" },
    { name: "Wix", logo: "⚡", description: "HTML component integration" },
    { name: "Webflow", logo: "🌊", description: "Custom code and CMS" },
    { name: "Shopify", logo: "🛒", description: "App store integration" },
    { name: "Framer", logo: "🎨", description: "Component library" }
  ];

  const businessBenefits = [
    {
      title: "300% Higher Conversion",
      description: "Instant quotes convert better than email back-and-forth",
      stat: "From 8% to 24% average close rate"
    },
    {
      title: "Save 15 Hours/Week",
      description: "Eliminate quote requests and price discussions",
      stat: "Automated lead qualification"
    },
    {
      title: "Premium Positioning",
      description: "Professional tools signal premium service quality",
      stat: "Charge 25-40% higher rates"
    },
    {
      title: "Scale Without Limits",
      description: "Handle unlimited quotes without extra work",
      stat: "24/7 automated sales process"
    }
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: '#060517'}}>
      <SEOHead 
        title="Features - AI-Powered Quote Calculators for Service Businesses | QuoteKit.ai"
        description="Discover powerful features of QuoteKit.ai: AI processing, instant quotes, custom branding, lead capture, analytics & more. Perfect for photographers, contractors & consultants."
        keywords="quote calculator features, AI quotes, service pricing, automated quotes, lead generation, business tools, custom branding"
        url="https://quotekit.ai/features"
      />
      <Header />
      
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Meet Your New <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400">Lead Machines</span>.
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                AI-powered quote calculators for every service business.<br />
                Embed on any website. Start capturing leads in seconds. Then relax.
              </p>
              
              <div className="flex items-center justify-center gap-8 mb-8 text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-neon-400">💡</span>
                  <span>57 Live Demos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🔓</span>
                  <span>1 Full Version Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">💸</span>
                  <span>Launch Price: Just €5/month</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  asChild
                  className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 text-lg rounded-lg font-medium transition-all duration-300 hover:shadow-glow"
                >
                  <Link href="/niches">Browse All 58 Calculators</Link>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg rounded-lg font-medium transition-all duration-300"
                >
                  <Link href="/#pricing">See Pricing</Link>
                </Button>
              </div>

              {/* Feature Grid Image */}
              <div className="mb-16">
                <img 
                  src={featuresImage} 
                  alt="QuoteKit Features: Unlimited Embeds, Instant Lead Capture, AI Pricing Logic, Powerful Admin Tools"
                  className="mx-auto max-w-2xl w-full rounded-2xl shadow-2xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No Coding Needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Fully Brandable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Lead Capture Built-In</span>
                </div>
              </div>

              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Whether you're a photographer, coach, cleaner or consultant—QuoteKit does the quoting, so you can do the closing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {heroFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-neon-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="py-20 bg-midnight-800/50">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Everything You Need to <span className="text-neon-400">Dominate</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Professional-grade features that scale from solo freelancers to enterprise agencies
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {coreFeatures.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <Card className="p-8 bg-midnight-700/50 border-midnight-600 h-full">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white mr-4`}>
                        {category.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {category.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <div className="w-10 h-10 rounded-lg bg-midnight-600 flex items-center justify-center text-gray-300 mr-4 flex-shrink-0">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-1">{feature.title}</h4>
                            <p className="text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Works With <span className="text-neon-400">Everything</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                One-click integration with all major website builders and platforms
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {integrationFeatures.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-midnight-700/30 border-midnight-600 hover:border-neon-500/50 transition-all duration-300 group hover:bg-midnight-700/50">
                    <div className="text-4xl mb-3">{platform.logo}</div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-400 transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-gray-400">{platform.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-gray-400 mb-6">Simple embed code works anywhere:</p>
              <Card className="max-w-3xl mx-auto p-6 bg-midnight-800 border-midnight-600">
                <code className="text-neon-400 text-sm">
                  {`<iframe src="https://quotekit.ai/calculator/your-niche" 
  width="100%" height="600px" frameborder="0">
</iframe>`}
                </code>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Business Benefits */}
        <section className="py-20 bg-gradient-to-r from-midnight-800 to-midnight-900">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Measurable <span className="text-neon-400">Business Impact</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Real results from service businesses using QuoteKit calculators
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {businessBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-midnight-700/30 border-midnight-600 text-center h-full">
                    <div className="text-3xl font-bold text-neon-400 mb-2">{benefit.title}</div>
                    <p className="text-gray-300 mb-4">{benefit.description}</p>
                    <p className="text-sm text-gray-500">{benefit.stat}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-neon-500/10 to-blue-500/10 border-t border-midnight-600">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to <span className="text-neon-400">Transform</span> Your Business?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Join thousands of service professionals who've eliminated back-and-forth pricing emails forever.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-neon-500/25 transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-midnight-500 text-gray-300 hover:border-neon-400 hover:text-white px-8 py-4 text-lg rounded-xl"
                >
                  View Live Demo
                </Button>
              </div>
              
              <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-neon-400 mr-2" />
                  No setup fees
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-neon-400 mr-2" />
                  Cancel anytime
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-neon-400 mr-2" />
                  30-day guarantee
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}