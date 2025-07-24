import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Rocket, Zap, Building2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Pricing() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePlanSelection = (planName: string) => {
    if (planName === "Starter") {
      // Free plan - redirect to signup
      setLocation("/register");
      return;
    }

    // For paid plans, redirect to registration with plan parameters
    const planMap = {
      "Pro": { tier: "pro", price: "5" },
      "Business": { tier: "business", price: "35" },
      "Enterprise": { tier: "enterprise", price: "95" }
    };

    const plan = planMap[planName as keyof typeof planMap];
    if (plan) {
      setLocation(`/register?plan=${plan.tier}&price=${plan.price}`);
    } else {
      toast({
        title: "Invalid Plan",
        description: "Please select a valid plan.",
        variant: "destructive"
      });
    }
  };

  const plans = [
    {
      name: "Starter",
      description: "Free forever",
      price: "€0",
      period: "",
      quotesLimit: "Up to 5 quotes/month",
      icon: <Rocket className="h-6 w-6" />,
      features: [
        "Fully embeddable AI quote widget",
        "Real-time price calculation",
        "Custom branding & styling tools",
        "Email lead capture",
        "Admin dashboard access"
      ],
      cta: "Start Free",
      popular: false,
      bestFor: "New users, testing the waters"
    },
    {
      name: "Pro",
      description: "Launch offer - save 67%",
      price: "€5",
      period: "/month",
      quotesLimit: "6-20 quotes/month",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Everything in Starter",
        "PDF + Email export",
        "Priority email support",
        "Year branding",
        "Style configuration JSON editor"
      ],
      cta: "Get Pro Deal",
      popular: true,
      bestFor: "Scaling businesses needing to impress customers"
    },
    {
      name: "Business",
      description: "For growing businesses",
      price: "€35",
      period: "/month",
      quotesLimit: "21-500 quotes/month",
      icon: <Building2 className="h-6 w-6" />,
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
      popular: false,
      bestFor: "Growing companies with high-volume needs"
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "€95",
      period: "/month",
      quotesLimit: "500+ quotes/month",
      icon: <Crown className="h-6 w-6" />,
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
      popular: false,
      bestFor: "Enterprise clients seeking custom solutions"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Start free, upgrade when you're ready. All plans include our core AI quote generation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-midnight-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-neon-400 shadow-lg shadow-neon-400/20"
                  : "border-midnight-600 hover:border-neon-400/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-neon-400 to-neon-500 text-black px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-400/10 rounded-full mb-4">
                  <div className="text-neon-400">{plan.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-neon-400 text-sm mt-2">{plan.quotesLimit}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-neon-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelection(plan.name)}
                className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-neon-400 to-neon-500 text-black hover:from-neon-500 hover:to-neon-600"
                    : "bg-midnight-700 text-white border border-midnight-600 hover:bg-midnight-600 hover:border-neon-400/50"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">{plan.bestFor}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ SSL encryption</span>
            <span>✓ GDPR compliant</span>
            <span>✓ 99.9% uptime</span>
            <span>✓ 24/7 support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}