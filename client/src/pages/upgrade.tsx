import { useState, useEffect } from "react";
import { QuoteKitHeader } from "@/components/calculator-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Upgrade() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLocation('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [setLocation]);

  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 calculators",
        "100 quotes per month",
        "Basic analytics",
        "Email support",
        "QuoteKits branding"
      ],
      current: true,
      popular: false
    },
    {
      name: "Pro",
      price: "€29",
      period: "per month",
      description: "For growing businesses",
      features: [
        "Unlimited calculators",
        "1,000 quotes per month",
        "Advanced analytics",
        "Priority support",
        "Remove QuoteKits branding",
        "Custom domains",
        "API access"
      ],
      current: false,
      popular: true
    },
    {
      name: "Enterprise",
      price: "€99",
      period: "per month",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited quotes",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Advanced security",
        "Team collaboration"
      ],
      current: false,
      popular: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neon-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Upgrade your account to unlock more calculators, advanced analytics, and remove branding
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative bg-midnight-800 border-midnight-700 ${
                plan.popular ? 'ring-2 ring-neon-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-neon-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>
                <CardDescription className="text-gray-400 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-neon-500 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    plan.current
                      ? 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-neon-500 hover:bg-neon-600'
                      : 'bg-midnight-700 hover:bg-midnight-600 border border-midnight-600'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-400">
                Your data is always safe. If you exceed limits after downgrading, some features may be restricted until you upgrade again.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-400">
                We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-400">
                No setup fees. Pay only the monthly subscription cost for your chosen plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}