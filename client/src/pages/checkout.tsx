import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Copy, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [planDetails, setPlanDetails] = useState({ tier: 'pro', price: '€5' });
  const { toast } = useToast();

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tier = urlParams.get('tier') || 'pro';
        const price = urlParams.get('price') || '5';
        
        setPlanDetails({ tier, price: `€${price}` });

        const response = await fetch('/api/create-subscription-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier,
            userId: `checkout_${Date.now()}`
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create checkout session`);
        }

        const data = await response.json();
        
        if (data.url) {
          setCheckoutUrl(data.url);
          console.log('Checkout URL created:', data.url);
        } else {
          throw new Error('No checkout URL received');
        }
        
      } catch (error) {
        console.error('Checkout error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    createCheckoutSession();
  }, []);

  const handlePaymentClick = () => {
    if (!checkoutUrl) return;
    
    // Copy URL to clipboard automatically
    navigator.clipboard.writeText(checkoutUrl).then(() => {
      toast({
        title: "Payment Link Ready",
        description: "Link copied to clipboard. Opening payment window...",
      });
    });

    // Open in new window
    const paymentWindow = window.open(checkoutUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!paymentWindow) {
      toast({
        title: "Payment Link Copied",
        description: "Please paste the link in a new browser tab to complete payment.",
        variant: "default"
      });
    } else {
      toast({
        title: "Payment Window Opened",
        description: "Complete your payment in the new window.",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = checkoutUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-midnight-800 border-midnight-600">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-400" />
            <h2 className="text-xl font-semibold mb-2 text-white">Preparing Payment</h2>
            <p className="text-gray-400">Creating your secure checkout session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-midnight-800 border-midnight-600">
          <CardHeader>
            <CardTitle className="text-red-400 text-center">Payment Setup Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-center">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-neon-400 text-black hover:bg-neon-500"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => setLocation('/pricing')} 
                variant="outline" 
                className="w-full border-midnight-600 text-gray-300 hover:bg-midnight-700"
              >
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-midnight-800 border-midnight-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-neon-400/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-neon-400" />
          </div>
          <CardTitle className="text-white text-2xl">Complete Your Purchase</CardTitle>
          <p className="text-gray-400 mt-2">
            You're upgrading to <span className="text-neon-400 font-semibold capitalize">{planDetails.tier}</span> plan 
            for <span className="text-neon-400 font-semibold">{planDetails.price}/month</span>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-midnight-700 rounded-lg p-4 border border-midnight-600">
            <h3 className="text-white font-semibold mb-2">What you get:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✓ Unlimited AI quote calculations</li>
              <li>✓ Custom branding and styling</li>
              <li>✓ Email lead capture</li>
              <li>✓ Dashboard analytics</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePaymentClick}
              className="w-full bg-gradient-to-r from-neon-400 to-neon-500 text-black hover:from-neon-500 hover:to-neon-600 font-semibold py-4 text-lg"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Pay Securely with Stripe
            </Button>

            <div className="text-center text-xs text-gray-500">
              <p>🔒 Secured by Stripe | Instant activation | Cancel anytime</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-midnight-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-midnight-800 text-gray-500">Alternative options</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={checkoutUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-sm text-gray-300 text-xs"
                placeholder="Secure payment link"
              />
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                size="sm"
                className="border-midnight-600 text-gray-300 hover:bg-midnight-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              onClick={() => setLocation('/dashboard')} 
              variant="ghost" 
              className="w-full text-gray-400 hover:text-white hover:bg-midnight-700"
            >
              Continue with Free Plan Instead
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Having trouble? Contact support for assistance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}