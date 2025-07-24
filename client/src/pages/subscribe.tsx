import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/supabase";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionForm = ({ planId, planName, price }: { planId: string; planName: string; price: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-midnight-800 p-4 rounded-lg border border-midnight-700">
        <h3 className="text-lg font-semibold text-white mb-2">{planName}</h3>
        <p className="text-2xl font-bold text-neon-400">{price}</p>
      </div>
      
      <PaymentElement />
      
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-neon-500 hover:bg-neon-600 text-white"
      >
        {isLoading ? "Processing..." : `Subscribe to ${planName}`}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
          setLocation('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        setLocation('/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Create subscription when plan is selected
  useEffect(() => {
    if (selectedPlan && currentUser) {
      createSubscription(selectedPlan);
    }
  }, [selectedPlan, currentUser]);

  const createSubscription = async (planId: string) => {
    try {
      const response = await apiRequest(`/api/create-subscription`, {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          priceId: planId
        })
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: "price_free",
      name: "Free",
      price: "€0/month",
      description: "Perfect for getting started",
      features: [
        "5 quotes per month",
        "1 calculator",
        "Basic customization",
        "Email support"
      ],
      popular: false,
      stripePriceId: null
    },
    {
      id: "price_pro",
      name: "Pro",
      price: "€5/month",
      description: "Launch special pricing",
      features: [
        "100 quotes per month",
        "5 calculators",
        "Advanced customization",
        "Priority support",
        "Analytics dashboard"
      ],
      popular: true,
      stripePriceId: "price_pro_launch"
    },
    {
      id: "price_business",
      name: "Business",
      price: "€35/month",
      description: "For growing businesses",
      features: [
        "1,000 quotes per month",
        "25 calculators",
        "Full customization",
        "Phone support",
        "Advanced analytics",
        "White-label option"
      ],
      popular: false,
      stripePriceId: "price_business"
    },
    {
      id: "price_enterprise",
      name: "Enterprise",
      price: "€95/month",
      description: "For large organizations",
      features: [
        "Unlimited quotes",
        "Unlimited calculators",
        "Custom integrations",
        "Dedicated support",
        "Custom branding",
        "API access"
      ],
      popular: false,
      stripePriceId: "price_enterprise"
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.stripePriceId) {
      setSelectedPlan(plan.stripePriceId);
    } else {
      // Free plan - redirect directly to dashboard
      setLocation('/dashboard');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (selectedPlan && clientSecret) {
    const plan = plans.find(p => p.stripePriceId === selectedPlan);
    
    return (
      <div className="min-h-screen bg-midnight-900 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Subscription</h1>
            <p className="text-gray-400">Enter your payment details to get started</p>
          </div>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#38bdf8',
                    }
                  }
                }}
              >
                <SubscriptionForm 
                  planId={selectedPlan} 
                  planName={plan?.name || "Selected Plan"} 
                  price={plan?.price || ""} 
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400">Select the perfect plan for your business needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative bg-midnight-800 border-midnight-700 hover:border-neon-500 transition-all cursor-pointer ${
                plan.popular ? 'ring-2 ring-neon-500' : ''
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-neon-500 text-white px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-neon-400 mb-2">{plan.price}</div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <Check className="h-4 w-4 text-neon-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-neon-500 hover:bg-neon-600 text-white' 
                      : 'bg-midnight-700 hover:bg-midnight-600 text-white border border-midnight-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan);
                  }}
                >
                  {plan.name === "Free" ? "Get Started Free" : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}