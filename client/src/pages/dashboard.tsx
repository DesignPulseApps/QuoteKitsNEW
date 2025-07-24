import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calculator, Plus, Settings, Eye, Copy, ExternalLink, BarChart3, Users, TrendingUp, Activity, Calendar, DollarSign, Palette, Type, Layout, Zap, Bell, Smartphone, Monitor, Tablet, Trash2, Edit3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";
import CalculatorPreview from "../components/calculator-preview";
import { getQuoteStats, incrementQuoteUsage, canGenerateQuote, resetQuoteUsage } from "@/lib/quote-tracker";
import { EditableText } from "@/components/editable-text";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: 'free' | 'pro' | 'business' | 'enterprise';
  quotesUsedThisMonth: number;
  quotesLimit: number;
  calculatorsUsed: number;
  calculatorLimit: number;
}

interface UserCalculator {
  id: string;
  name: string;
  slug: string;
  embed_url: string;
  admin_url: string;
  calculator_id: number;
  config: any;
  custom_branding: any;
  is_active: boolean;
  template_id: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  created_at: string;
  last_updated: string;
  embedId?: string;
}

interface CalculatorTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template_id: string;
  slug: string;
}

// Subscription tier definitions
const SUBSCRIPTION_TIERS = {
  free: { name: 'Free for Life', calculators: 1, quotes: 5, price: 0 },
  pro: { name: 'Pro Launch Special', calculators: 5, quotes: 25, price: 5 },
  business: { name: 'Business', calculators: 10, quotes: 50, price: 35 },
  enterprise: { name: 'Enterprise', calculators: 999, quotes: 999, price: 99 }
};

const getUserSubscriptionData = () => {
  const userSession = localStorage.getItem('user_session');
  const subscriptionKey = `subscription_${userSession}`;
  const quotesKey = `quotes_${userSession}`;
  
  const savedSubscription = localStorage.getItem(subscriptionKey);
  const savedQuotes = localStorage.getItem(quotesKey);
  
  const subscription = savedSubscription ? JSON.parse(savedSubscription) : 'free';
  const quotesUsed = savedQuotes ? parseInt(savedQuotes) : 0;
  
  const tier = SUBSCRIPTION_TIERS[subscription as keyof typeof SUBSCRIPTION_TIERS];
  
  return {
    subscription,
    quotesUsed,
    tier
  };
};

const mockUser: User = (() => {
  const quoteStats = getQuoteStats();
  return {
    id: "1",
    email: "user@example.com",
    fullName: "John Doe",
    subscriptionStatus: quoteStats.subscription,
    quotesUsedThisMonth: quoteStats.used,
    quotesLimit: quoteStats.limit,
    calculatorsUsed: 0,
    calculatorLimit: SUBSCRIPTION_TIERS[quoteStats.subscription].calculators
  };
})();

const calculatorTemplates: CalculatorTemplate[] = [
  // Photography Services
  { id: "1", name: "Wedding Photography Calculator", category: "Photography", description: "Comprehensive wedding photography with venue types, packages, and AI pricing", template_id: "wedding-photography", slug: "wedding-photography" },
  { id: "2", name: "Portrait Photography Calculator", category: "Photography", description: "Professional portrait sessions with advanced booking system", template_id: "portrait-photography", slug: "portrait-photography" },
  { id: "3", name: "Boudoir Photography Calculator", category: "Photography", description: "Intimate photography sessions with privacy options", template_id: "boudoir-photography", slug: "boudoir-photography" },
  { id: "4", name: "Commercial Photography Calculator", category: "Photography", description: "Business photography with usage rights and licensing", template_id: "commercial-photography", slug: "commercial-photography" },
  { id: "5", name: "Real Estate Photography Calculator", category: "Photography", description: "Property photography with drone and virtual tour options", template_id: "real-estate-photography", slug: "real-estate-photography" },
  { id: "6", name: "Event Videography Calculator", category: "Photography", description: "Professional event videography with editing packages", template_id: "event-videography", slug: "event-videography" },
  { id: "7", name: "Drone Photography Calculator", category: "Photography", description: "Aerial photography with flight permits and equipment", template_id: "drone-photography", slug: "drone-photography" },
  { id: "8", name: "Food Photography Calculator", category: "Photography", description: "Culinary photography for restaurants and brands", template_id: "food-photography", slug: "food-photography" },
  { id: "9", name: "Newborn Photography Calculator", category: "Photography", description: "Specialized newborn sessions with safety protocols", template_id: "newborn-photography", slug: "newborn-photography" },
  { id: "10", name: "Maternity Photography Calculator", category: "Photography", description: "Pregnancy photography with wardrobe and locations", template_id: "maternity-photography", slug: "maternity-photography" },
  
  // Construction & Home Services
  { id: "11", name: "Home Renovation Calculator", category: "Construction", description: "Complete renovation planning with materials and labor", template_id: "home-renovation", slug: "home-renovation-calculator-new" },
  { id: "12", name: "Roofing Services Calculator", category: "Construction", description: "Roofing installation with material options and warranties", template_id: "roofing-services", slug: "roofing-calculator" },
  { id: "13", name: "Electrician Services Calculator", category: "Construction", description: "Electrical work with safety certifications and permits", template_id: "electrician", slug: "electrician-calculator" },
  { id: "14", name: "Plumbing Services Calculator", category: "Construction", description: "Plumbing repairs and installations with emergency rates", template_id: "plumbing", slug: "plumbing-calculator" },
  { id: "15", name: "Solar Panel Installation Calculator", category: "Construction", description: "Solar energy systems with financing and incentives", template_id: "solar", slug: "solar-calculator" },
  { id: "16", name: "Window & Door Installation Calculator", category: "Construction", description: "Custom windows and doors with energy efficiency ratings", template_id: "window-door", slug: "window-door-calculator" },
  { id: "17", name: "Landscaping Services Calculator", category: "Construction", description: "Garden design and maintenance with seasonal planning", template_id: "landscaping", slug: "landscaping-calculator" },
  { id: "18", name: "Painting & Decorating Calculator", category: "Construction", description: "Interior and exterior painting with premium finishes", template_id: "painting-decorating", slug: "painting-decorating-calculator" },
  
  // Health & Beauty Services
  { id: "19", name: "Makeup Artist Calculator", category: "Beauty", description: "Professional makeup for weddings and events", template_id: "makeup-artist", slug: "makeup-artist-calculator" },
  { id: "20", name: "Hair Stylist Calculator", category: "Beauty", description: "Hair styling services with product recommendations", template_id: "hair-stylist", slug: "hair-stylist-calculator" },
  { id: "21", name: "Tattoo Artist Calculator", category: "Beauty", description: "Custom tattoo pricing with design complexity", template_id: "tattoo-artist", slug: "tattoo-artist-calculator" },
  { id: "22", name: "Massage Therapy Calculator", category: "Beauty", description: "Therapeutic massage with specialized techniques", template_id: "massage-therapy", slug: "massage-therapy-calculator" },
  { id: "23", name: "Personal Training Calculator", category: "Beauty", description: "Fitness coaching with nutrition and workout plans", template_id: "personal-training", slug: "personal-training-calculator" },
  { id: "24", name: "Nutritionist Calculator", category: "Beauty", description: "Dietary consultation with meal planning", template_id: "nutritionist", slug: "nutritionist-calculator" },
  
  // Professional Services
  { id: "25", name: "Legal Services Calculator", category: "Legal", description: "Legal consultation with case complexity assessment", template_id: "legal-services", slug: "legal-advisor-calculator" },
  { id: "26", name: "Tax Preparation Calculator", category: "Legal", description: "Tax filing services with audit protection", template_id: "tax-preparer", slug: "tax-preparer-calculator" },
  { id: "27", name: "Business Coach Calculator", category: "Professional", description: "Business consulting with strategic planning", template_id: "business-coach", slug: "business-coach-calculator" },
  { id: "28", name: "Life Coach Calculator", category: "Professional", description: "Personal development coaching with goal setting", template_id: "life-coach", slug: "life-coach-calculator" },
  { id: "29", name: "Virtual Assistant Calculator", category: "Professional", description: "Administrative support with task specialization", template_id: "virtual-assistant", slug: "virtual-assistant-calculator" },
  { id: "30", name: "Translation Services Calculator", category: "Professional", description: "Document translation with certification options", template_id: "translation-services", slug: "translation-services-calculator" },
  
  // Technology Services
  { id: "31", name: "Web Designer Calculator", category: "Technology", description: "Website design with responsive and e-commerce options", template_id: "web-designer", slug: "web-designer-calculator" },
  { id: "32", name: "SEO Agency Calculator", category: "Technology", description: "Search optimization with analytics and reporting", template_id: "seo-agency", slug: "seo-agency-calculator" },
  { id: "33", name: "Video Editor Calculator", category: "Technology", description: "Video editing with motion graphics and effects", template_id: "video-editor", slug: "video-editor-calculator" },
  { id: "34", name: "Marketing Consultant Calculator", category: "Technology", description: "Digital marketing strategy with campaign management", template_id: "marketing-consultant", slug: "marketing-consultant-calculator" },
  { id: "35", name: "Copywriter Calculator", category: "Technology", description: "Content writing with SEO optimization", template_id: "copywriter", slug: "copywriter-calculator" },
  
  // Automotive Services
  { id: "36", name: "Auto Mechanic Calculator", category: "Automotive", description: "Vehicle repairs with diagnostic and parts", template_id: "auto-mechanic", slug: "auto-mechanic-calculator" },
  { id: "37", name: "Car Detailing Calculator", category: "Automotive", description: "Vehicle cleaning with paint protection services", template_id: "car-detailing", slug: "car-detailing-calculator" },
  { id: "38", name: "Mobile Car Wash Calculator", category: "Automotive", description: "On-location vehicle cleaning services", template_id: "mobile-car-wash", slug: "mobile-car-wash-calculator" },
  { id: "39", name: "Motorcycle Repair Calculator", category: "Automotive", description: "Motorcycle maintenance and customization", template_id: "motorcycle-repair", slug: "motorcycle-repair-calculator" },
  { id: "40", name: "Driving Instructor Calculator", category: "Automotive", description: "Driving lessons with test preparation", template_id: "driving-instructor", slug: "driving-instructor-calculator" },
  
  // Transportation Services
  { id: "41", name: "Airport Transfer Calculator", category: "Transportation", description: "Airport shuttle with flight tracking", template_id: "airport-transfer", slug: "airport-transfer-calculator" },
  { id: "42", name: "Chauffeur & Limo Calculator", category: "Transportation", description: "Luxury transportation with event packages", template_id: "chauffeur-limo", slug: "chauffeur-limo-calculator" },
  { id: "43", name: "Van Rental Calculator", category: "Transportation", description: "Commercial vehicle rental with insurance", template_id: "van-rental", slug: "van-rental-calculator" },
  { id: "44", name: "Moving Services Calculator", category: "Transportation", description: "Relocation services with packing and storage", template_id: "moving-services", slug: "moving-services-calculator" },
  { id: "45", name: "Boat Charter Calculator", category: "Transportation", description: "Marine vessel rental with crew and catering", template_id: "boat-charter", slug: "boat-charter-calculator" },
  
  // Cleaning & Maintenance
  { id: "46", name: "Cleaning Services Calculator", category: "Professional", description: "Residential and commercial cleaning with eco options", template_id: "cleaning-services", slug: "cleaning-services-calculator" },
  { id: "47", name: "Pest Control Calculator", category: "Professional", description: "Pest elimination with prevention and warranties", template_id: "pest-control", slug: "pest-control-calculator" },
  { id: "48", name: "Interior Design Calculator", category: "Professional", description: "Space design with furniture and decoration", template_id: "interior-design", slug: "interior-design-calculator" },
  
  // Medical & Educational Services
  { id: "49", name: "Dentist Services Calculator", category: "Medical", description: "Dental procedures with insurance coordination", template_id: "dentist", slug: "dentist-calculator" },
  { id: "50", name: "Plastic Surgery Calculator", category: "Medical", description: "Cosmetic procedures with recovery planning", template_id: "plastic-surgery", slug: "plastic-surgery-calculator" },
  { id: "51", name: "Private Medical Calculator", category: "Medical", description: "Private healthcare with specialist consultations", template_id: "private-medical", slug: "private-medical-calculator" },
  { id: "52", name: "Childcare Services Calculator", category: "Education", description: "Daycare and nanny services with educational programs", template_id: "childcare-services", slug: "childcare-services-calculator" },
  { id: "53", name: "Private School Calculator", category: "Education", description: "Private education with extracurricular activities", template_id: "private-school", slug: "private-school-calculator" },
  { id: "54", name: "Private Tutor Calculator", category: "Education", description: "Personal tutoring with subject specialization", template_id: "private-tutor", slug: "private-tutor-calculator" },
  
  // Specialized Services
  { id: "55", name: "Hypnotherapist Calculator", category: "Professional", description: "Hypnotherapy sessions with treatment programs", template_id: "hypnotherapist", slug: "hypnotherapist-calculator" },
  { id: "56", name: "Dog Trainer Calculator", category: "Professional", description: "Pet training with behavioral modification", template_id: "dog-trainer", slug: "dog-trainer-calculator" }
];

const performanceData = [
  { name: 'Jan', quotes: 0, conversions: 0 },
  { name: 'Feb', quotes: 0, conversions: 0 },
  { name: 'Mar', quotes: 0, conversions: 0 },
  { name: 'Apr', quotes: 0, conversions: 0 },
  { name: 'May', quotes: 0, conversions: 0 },
  { name: 'Jun', quotes: 0, conversions: 0 }
];

const clientData: Array<{id: number, name: string, email: string, project: string, quote: string, status: string, date: string}> = [];

export default function Dashboard() {
  const [user, setUser] = useState<User>(mockUser);
  const [userCalculators, setUserCalculators] = useState<UserCalculator[]>([]);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  
  // Clear test data function
  const clearTestData = () => {
    const userSession = localStorage.getItem('user_session');
    const userCalculatorKey = `userCalculators_${userSession}`;
    localStorage.removeItem(userCalculatorKey);
    toast({
      title: "Test Data Cleared",
      description: "All calculator data has been reset. Create a new calculator to test embed codes.",
    });
    window.location.reload();
  };
  const [selectedCalculator, setSelectedCalculator] = useState<UserCalculator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customConfig, setCustomConfig] = useState<any>({
    // Initialize pricing configuration with defaults
    basePrice: 200,
    hourlyRate: 100,
    locationFee: 50,
    currency: 'EUR',
    addOnPrices: [
      { name: "Rush delivery", price: 100 },
      { name: "Print package", price: 150 },
      { name: "Social media package", price: 75 }
    ],
    durationPrices: [
      { duration: "30 minutes", multiplier: 0.5 },
      { duration: "1 hour", multiplier: 1 },
      { duration: "2 hours", multiplier: 1.8 },
      { duration: "Half day", multiplier: 3 }
    ]
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

  // Listen for quote usage updates
  useEffect(() => {
    const handleQuoteUsageUpdate = (event: CustomEvent) => {
      const quoteStats = getQuoteStats();
      setUser(prev => ({
        ...prev,
        quotesUsedThisMonth: quoteStats.used,
        quotesLimit: quoteStats.limit,
        subscriptionStatus: quoteStats.subscription
      }));
    };

    window.addEventListener('quoteUsageUpdated', handleQuoteUsageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('quoteUsageUpdated', handleQuoteUsageUpdate as EventListener);
    };
  }, []);

  // Get current user email for session isolation
  const getCurrentUserEmail = () => {
    try {
      const supabaseUser = localStorage.getItem('user');
      if (supabaseUser) {
        const parsed = JSON.parse(supabaseUser);
        return parsed.email;
      }
      
      const tempUser = localStorage.getItem('temp_user');
      if (tempUser) {
        const parsed = JSON.parse(tempUser);
        return parsed.email;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Get current user email for session isolation
    const getCurrentUserEmailLocal = () => {
      try {
        const supabaseUser = localStorage.getItem('user');
        if (supabaseUser) {
          const parsed = JSON.parse(supabaseUser);
          return parsed.email;
        }
        
        const tempUser = localStorage.getItem('temp_user');
        if (tempUser) {
          const parsed = JSON.parse(tempUser);
          return parsed.email;
        }
        
        return null;
      } catch {
        return null;
      }
    };

    // Check for account creation flag - if this is a new account, clear all data
    const isNewAccount = localStorage.getItem('new_account_created');
    if (isNewAccount === 'true') {
      // Clear all existing data for this new account
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userCalculators_') || key.startsWith('subscription_') || key === 'user_session') {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('new_account_created');
    }

    // Check if user just logged in/registered and force new session for data isolation
    const userEmail = getCurrentUserEmailLocal();
    const lastUserEmail = localStorage.getItem('last_user_email');
    
    if (userEmail && userEmail !== lastUserEmail) {
      // Different user - clear all previous data and create new session
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userCalculators_') || key.startsWith('subscription_') || key === 'user_session') {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('last_user_email', userEmail);
    }

    // Generate unique user session if not exists
    let userSession = localStorage.getItem('user_session');
    if (!userSession) {
      userSession = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '_' + performance.now();
      localStorage.setItem('user_session', userSession);
    }

    // Load user-specific calculators (should be empty for new users)
    const userCalculatorKey = `userCalculators_${userSession}`;
    const saved = localStorage.getItem(userCalculatorKey);
    const calculators = saved ? JSON.parse(saved) : [];
    setUserCalculators(calculators);

    // Update user with current calculator count and subscription data
    const { subscription, quotesUsed, tier } = getUserSubscriptionData();
    setUser(prev => ({
      ...prev,
      subscriptionStatus: subscription,
      quotesUsedThisMonth: quotesUsed,
      quotesLimit: tier.quotes,
      calculatorsUsed: calculators.length,
      calculatorLimit: tier.calculators
    }));
  }, []);

  const filteredCalculators = calculatorTemplates.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || calc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const checkSubscriptionLimits = () => {
    if (user.calculatorsUsed >= user.calculatorLimit) {
      return { canAdd: false, reason: 'calculator_limit' };
    }
    return { canAdd: true };
  };

  const upgradeSubscription = async (newTier: keyof typeof SUBSCRIPTION_TIERS) => {
    const tier = SUBSCRIPTION_TIERS[newTier];
    
    // For free tier (downgrade), no payment needed
    if (newTier === 'free') {
      const userSession = localStorage.getItem('user_session');
      const subscriptionKey = `subscription_${userSession}`;
      localStorage.setItem(subscriptionKey, JSON.stringify(newTier));
      
      setUser(prev => ({
        ...prev,
        subscriptionStatus: newTier,
        calculatorLimit: tier.calculators,
        quotesLimit: tier.quotes
      }));
      
      setShowUpgradeModal(false);
      toast({
        title: "Subscription Updated",
        description: `You're now on the ${tier.name} plan.`,
      });
      return;
    }

    // For paid tiers, create Stripe checkout session
    try {
      setShowUpgradeModal(false);
      
      toast({
        title: "Creating checkout session...",
        description: "Redirecting to secure payment.",
      });

      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: newTier,
          priceId: getPriceIdForTier(newTier),
          userId: user.id || `session_${localStorage.getItem('user_session')}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (data.url) {
        // Open Stripe checkout in new tab to avoid iframe restrictions
        console.log('Opening checkout in new tab:', data.url);
        const checkoutWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
        
        if (!checkoutWindow) {
          // Fallback if popup is blocked - show modal with link
          setCheckoutUrl(data.url);
          setShowCheckoutModal(true);
        } else {
          toast({
            title: "Checkout Opened",
            description: "Complete your payment in the new tab to upgrade your subscription.",
          });
        }
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment Setup Failed",
        description: `Unable to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setShowUpgradeModal(true); // Reopen modal on error
    }
  };

  // Map tiers to Stripe price IDs (these would be configured in Stripe Dashboard)
  const getPriceIdForTier = (tier: string) => {
    const priceIds = {
      'pro': 'price_pro_monthly_5eur',
      'business': 'price_business_monthly_35eur', 
      'enterprise': 'price_enterprise_monthly_99eur'
    };
    return priceIds[tier as keyof typeof priceIds];
  };

  const deleteCalculator = (calculatorId: string) => {
    if (confirm('Are you sure you want to delete this calculator? This action cannot be undone.')) {
      const userSession = localStorage.getItem('user_session');
      const userCalculatorKey = `userCalculators_${userSession}`;
      
      const updated = userCalculators.filter(calc => calc.id !== calculatorId);
      setUserCalculators(updated);
      localStorage.setItem(userCalculatorKey, JSON.stringify(updated));
      
      // Update user calculator count
      setUser(prev => ({
        ...prev,
        calculatorsUsed: updated.length
      }));
      
      toast({
        title: "Calculator Deleted",
        description: "Calculator has been removed from your dashboard.",
      });
    }
  };

  // Test quote generation to see usage tracking in action
  const testQuoteGeneration = () => {
    const quoteCheck = canGenerateQuote();
    
    if (!quoteCheck.allowed) {
      toast({
        title: "Quote Limit Reached",
        description: `You've used all ${quoteCheck.limit} quotes for this month. Upgrade your plan to continue.`,
        variant: "destructive"
      });
      setShowUpgradeModal(true);
      return;
    }
    
    // Simulate quote generation
    incrementQuoteUsage();
    
    toast({
      title: "Quote Generated",
      description: `Quote generated successfully! ${quoteCheck.remaining - 1} quotes remaining this month.`,
    });
  };

  // Reset quote usage for testing
  const resetQuoteUsageForTesting = () => {
    if (confirm('Reset quote usage for this month? This is for testing purposes only.')) {
      resetQuoteUsage();
      
      toast({
        title: "Quote Usage Reset",
        description: "Monthly quote usage has been reset to 0.",
      });
    }
  };

  // Force clean user session - for testing new user experience
  const resetUserSession = () => {
    if (confirm('This will clear all your data and simulate a new user account. Continue?')) {
      // Clear all user-specific data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userCalculators_') || key.startsWith('subscription_') || key.startsWith('quote_usage_') || key === 'user_session') {
          localStorage.removeItem(key);
        }
      });
      
      // Generate new session
      const newSession = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '_' + performance.now();
      localStorage.setItem('user_session', newSession);
      
      // Reset state
      setUserCalculators([]);
      const freshQuoteStats = getQuoteStats();
      setUser(prev => ({
        ...prev,
        subscriptionStatus: 'free',
        quotesUsedThisMonth: freshQuoteStats.used,
        quotesLimit: freshQuoteStats.limit,
        calculatorsUsed: 0,
        calculatorLimit: SUBSCRIPTION_TIERS.free.calculators
      }));
      
      toast({
        title: "Session Reset",
        description: "Your account has been reset to simulate a new user experience.",
      });
    }
  };

  const addCalculator = async (template: CalculatorTemplate) => {
    // Check subscription limits
    const limitCheck = checkSubscriptionLimits();
    if (!limitCheck.canAdd) {
      setShowUpgradeModal(true);
      return;
    }
    // Generate unique embed ID for the user calculator
    const embedId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create deep clone of the comprehensive calculator with all detailed features
    const getDetailedConfig = (templateId: string) => {
      switch (templateId) {
        case 'wedding-photography':
          return {
            packageTypes: [
              { id: "elopement", label: "Elopement / Small Ceremony", basePrice: 950, hours: 4, icon: "💕", popular: false },
              { id: "half-day", label: "Half-Day Coverage", basePrice: 1200, hours: 6, icon: "☀️", popular: true },
              { id: "full-day", label: "Full-Day Coverage", basePrice: 1800, hours: 10, icon: "💍", popular: true },
              { id: "destination", label: "Destination Wedding", basePrice: 2500, hours: 12, icon: "✈️", popular: false }
            ],
            hourOptions: [
              { id: "4", label: "4 Hours", surcharge: 0, popular: false },
              { id: "6", label: "6 Hours", surcharge: 300, popular: true },
              { id: "8", label: "8 Hours", surcharge: 600, popular: true },
              { id: "10+", label: "10+ Hours", surcharge: 900, popular: false }
            ],
            locationOptions: [
              { id: "1", label: "1 Location", surcharge: 0, popular: false },
              { id: "2", label: "2 Locations", surcharge: 150, popular: true },
              { id: "3+", label: "3+ Locations", surcharge: 350, popular: false }
            ],
            addOnOptions: [
              { id: "engagement", label: "Engagement Session", price: 300, popular: true },
              { id: "second-photographer", label: "Second Photographer", price: 250, popular: true },
              { id: "drone", label: "Drone Coverage", price: 150, popular: false },
              { id: "album", label: "Album & Prints", price: 200, popular: true },
              { id: "rehearsal", label: "Rehearsal Dinner Coverage", price: 350, popular: false },
              { id: "express", label: "Express Turnaround", price: 175, popular: false }
            ],
            deliveryOptions: [
              { id: "gallery", label: "Online Gallery Only", price: 0, popular: false },
              { id: "usb-album", label: "USB + Album", price: 250, popular: true },
              { id: "video-highlights", label: "Video Highlights Add-On", price: 400, popular: true }
            ],
            multiStep: true,
            aiPowered: true,
            naturalLanguageInput: true,
            calculatorType: "comprehensive-wedding-photography"
          };
        case 'home-renovation':
          return {
            projectTypes: ["kitchen", "bathroom", "living-room", "bedroom", "whole-house"],
            propertyTypes: ["apartment", "house", "villa", "commercial"],
            finishQualities: ["standard", "premium", "luxury"],
            timeframes: ["flexible", "normal", "rush"],
            multiStep: true,
            aiPowered: true,
            calculatorType: "comprehensive-home-renovation"
          };
        case 'portrait-photography':
          return {
            sessionTypes: ["studio", "outdoor", "lifestyle", "business"],
            durations: ["30min", "1hour", "2hours", "half-day"],
            groupSizes: ["individual", "couple", "family", "group"],
            deliveryOptions: ["digital", "prints", "album"],
            multiStep: true,
            calculatorType: "comprehensive-portrait-photography"
          };
        default:
          return {
            isDetailed: true,
            hasAdvancedFeatures: true,
            calculatorType: `comprehensive-${templateId}`
          };
      }
    };

    const detailedConfig = getDetailedConfig(template.template_id);

    const newCalculator: UserCalculator = {
      id: `calc_${Date.now()}`,
      name: template.name,
      slug: `${template.slug}-${Date.now()}`,
      embed_url: `${window.location.origin}/embed/${embedId}`,
      admin_url: `${window.location.origin}/dashboard`,
      embedId: embedId,
      calculator_id: parseInt(template.id),
      config: detailedConfig,
      custom_branding: {},
      is_active: true,
      template_id: template.template_id,
      layout_json: {
        type: template.template_id === 'wedding-photography' ? "multi-step-wizard" : "detailed-form",
        steps: template.template_id === 'wedding-photography' ? 
          ["package-coverage", "locations-addons", "wedding-details", "contact-info"] : 
          ["service-selection", "requirements", "customization", "contact"],
        components: template.template_id === 'wedding-photography' ? 
          ["package-selector", "hour-selector", "location-grid", "addon-grid", "natural-language", "pricing-sidebar"] :
          ["service-options", "requirements-form", "customization-panel", "quote-summary"],
        forceDetailedView: true,
        useComprehensiveCalculator: true
      },
      logic_json: detailedConfig,
      style_json: template.template_id === 'wedding-photography' ? {
        theme: "elegant-wedding",
        colors: { primary: "#f43f5e", accent: "#fbbf24", neutral: "#6b7280" },
        layout: "stepped-wizard"
      } : {},
      prompt_md: template.template_id === 'wedding-photography' ? "Professional wedding photography calculator with comprehensive multi-step form, package selection, venue options, and AI-powered pricing logic." : "",
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    // Get user session for isolated storage
    const userSession = localStorage.getItem('user_session');
    const userCalculatorKey = `userCalculators_${userSession}`;
    
    const updated = [...userCalculators, newCalculator];
    setUserCalculators(updated);
    localStorage.setItem(userCalculatorKey, JSON.stringify(updated));
    
    // Update user calculator count
    setUser(prev => ({
      ...prev,
      calculatorsUsed: updated.length
    }));
    
    setShowCalculatorModal(false);
    
    toast({
      title: "Calculator Added Successfully",
      description: `${template.name} has been added to your dashboard.`,
    });
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    // Merge existing config with pricing defaults
    const existingConfig = calc.config || {};
    const configWithDefaults = {
      // Pricing defaults
      basePrice: 200,
      hourlyRate: 100,
      locationFee: 50,
      currency: 'EUR',
      addOnPrices: [
        { name: "Rush delivery", price: 100 },
        { name: "Print package", price: 150 },
        { name: "Social media package", price: 75 }
      ],
      durationPrices: [
        { duration: "30 minutes", multiplier: 0.5 },
        { duration: "1 hour", multiplier: 1 },
        { duration: "2 hours", multiplier: 1.8 },
        { duration: "Half day", multiplier: 3 }
      ],
      sessionDurations: [
        { id: "30-min", label: "30 minutes", price: 0, icon: "⏰" },
        { id: "1-hour", label: "1 hour", price: 75, icon: "🕐" },
        { id: "2-hours", label: "2 hours", price: 150, icon: "⏱️" }
      ],
      groupPrices: [
        { id: "individual", label: "Individual", price: 0, icon: "👤" },
        { id: "couple", label: "Couple", price: 50, icon: "💕" },
        { id: "family", label: "Family", price: 100, icon: "👨‍👩‍👧‍👦" },
        { id: "senior", label: "Senior / Graduation", price: 0, icon: "🎓" },
        { id: "branding", label: "Branding / Business", price: 80, icon: "💼" }
      ],
      locationPrices: [
        { id: "studio", label: "Studio", price: 0, icon: "🏢" },
        { id: "outdoor", label: "Outdoor", price: 60, icon: "🌳" },
        { id: "client-location", label: "Client's Home / Office", price: 60, icon: "🏠" }
      ],
      wardrobePrices: [
        { id: "1", label: "1 Outfit", price: 0, icon: "👕" },
        { id: "2", label: "2 Outfits", price: 40, icon: "👔" },
        { id: "3+", label: "3+ Outfits", price: 80, icon: "👗" }
      ],
      enhancementPrices: [
        { id: "makeup", label: "Professional Makeup", price: 80 },
        { id: "standard-retouching", label: "Standard Retouching", price: 0 },
        { id: "deluxe-retouching", label: "Deluxe Retouching", price: 50 },
        { id: "express-delivery", label: "Express Delivery", price: 50 },
        { id: "extra-images", label: "Extra Images (+5)", price: 100 },
        { id: "headshot-bundle", label: "Headshot Bundle", price: 75 }
      ],
      usagePrices: [
        { id: "personal", label: "Personal Use", price: 0, icon: "🏠" },
        { id: "commercial", label: "Commercial / Branding", price: 120, icon: "💼" }
      ],
      // Merge with existing config (existing config takes precedence)
      ...existingConfig
    };
    setCustomConfig(configWithDefaults);
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    // Merge existing config with pricing defaults
    const existingConfig = calc.config || {};
    const configWithDefaults = {
      // Pricing defaults
      basePrice: 200,
      hourlyRate: 100,
      locationFee: 50,
      currency: 'EUR',
      addOnPrices: [
        { name: "Rush delivery", price: 100 },
        { name: "Print package", price: 150 },
        { name: "Social media package", price: 75 }
      ],
      durationPrices: [
        { duration: "30 minutes", multiplier: 0.5 },
        { duration: "1 hour", multiplier: 1 },
        { duration: "2 hours", multiplier: 1.8 },
        { duration: "Half day", multiplier: 3 }
      ],
      sessionDurations: [
        { id: "30-min", label: "30 minutes", price: 0, icon: "⏰" },
        { id: "1-hour", label: "1 hour", price: 75, icon: "🕐" },
        { id: "2-hours", label: "2 hours", price: 150, icon: "⏱️" }
      ],
      groupPrices: [
        { id: "individual", label: "Individual", price: 0, icon: "👤" },
        { id: "couple", label: "Couple", price: 50, icon: "💕" },
        { id: "family", label: "Family", price: 100, icon: "👨‍👩‍👧‍👦" },
        { id: "senior", label: "Senior / Graduation", price: 0, icon: "🎓" },
        { id: "branding", label: "Branding / Business", price: 80, icon: "💼" }
      ],
      locationPrices: [
        { id: "studio", label: "Studio", price: 0, icon: "🏢" },
        { id: "outdoor", label: "Outdoor", price: 60, icon: "🌳" },
        { id: "client-location", label: "Client's Home / Office", price: 60, icon: "🏠" }
      ],
      wardrobePrices: [
        { id: "1", label: "1 Outfit", price: 0, icon: "👕" },
        { id: "2", label: "2 Outfits", price: 40, icon: "👔" },
        { id: "3+", label: "3+ Outfits", price: 80, icon: "👗" }
      ],
      enhancementPrices: [
        { id: "makeup", label: "Professional Makeup", price: 80 },
        { id: "standard-retouching", label: "Standard Retouching", price: 0 },
        { id: "deluxe-retouching", label: "Deluxe Retouching", price: 50 },
        { id: "express-delivery", label: "Express Delivery", price: 50 },
        { id: "extra-images", label: "Extra Images (+5)", price: 100 },
        { id: "headshot-bundle", label: "Headshot Bundle", price: 75 }
      ],
      usagePrices: [
        { id: "personal", label: "Personal Use", price: 0, icon: "🏠" },
        { id: "commercial", label: "Commercial / Branding", price: 120, icon: "💼" }
      ],
      // Merge with existing config (existing config takes precedence)
      ...existingConfig
    };
    setCustomConfig(configWithDefaults);
    setShowPreviewModal(true);
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your quote calculators and track performance</p>
        </div>

        {/* Subscription Status */}
        <Card className="bg-midnight-800 border-midnight-700 mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {SUBSCRIPTION_TIERS[user.subscriptionStatus].name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {user.calculatorsUsed}/{user.calculatorLimit} calculators • {user.quotesUsedThisMonth}/{user.quotesLimit} quotes used
                </p>
              </div>
              <div className="flex space-x-2">
                {user.subscriptionStatus === 'free' && (
                  <Button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                  >
                    Upgrade Now
                  </Button>
                )}
                <Button
                  onClick={clearTestData}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500"
                >
                  Clear Test Data
                </Button>
              </div>
            </div>
            
            {/* Usage bars */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Calculator Usage</span>
                  <span className="text-white">{user.calculatorsUsed}/{user.calculatorLimit}</span>
                </div>
                <div className="w-full bg-midnight-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      user.calculatorsUsed >= user.calculatorLimit ? 'bg-red-500' : 
                      user.calculatorsUsed / user.calculatorLimit > 0.8 ? 'bg-yellow-500' : 'bg-neon-400'
                    }`}
                    style={{ width: `${Math.min((user.calculatorsUsed / user.calculatorLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Quote Usage</span>
                  <span className="text-white">{user.quotesUsedThisMonth}/{user.quotesLimit}</span>
                </div>
                <div className="w-full bg-midnight-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      user.quotesUsedThisMonth >= user.quotesLimit ? 'bg-red-500' : 
                      user.quotesUsedThisMonth / user.quotesLimit > 0.8 ? 'bg-yellow-500' : 'bg-neon-400'
                    }`}
                    style={{ width: `${Math.min((user.quotesUsedThisMonth / user.quotesLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Calculators</p>
                  <p className="text-2xl font-bold text-white">{user.calculatorsUsed}/{user.calculatorLimit}</p>
                </div>
                <Calculator className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Quotes This Month</p>
                  <p className="text-2xl font-bold text-white">{user.quotesUsedThisMonth}/{user.quotesLimit}</p>
                  <div className="w-full bg-midnight-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (user.quotesUsedThisMonth / user.quotesLimit) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.quotesLimit - user.quotesUsedThisMonth} remaining
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">0%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue Generated</p>
                  <p className="text-2xl font-bold text-white">$0</p>
                </div>
                <DollarSign className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Your Calculators */}
        <Card className="bg-midnight-800 border-midnight-700 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-neon-400" />
                Your Calculators
              </CardTitle>
              <Button
                onClick={() => setShowCalculatorModal(true)}
                className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Calculator
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userCalculators.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No calculators yet</h3>
                <p className="text-gray-400 mb-4">Create your first calculator to start generating quotes</p>
                <Button
                  onClick={() => setShowCalculatorModal(true)}
                  className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Calculator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCalculators.map((calc) => (
                  <Card key={calc.id} className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white truncate">{calc.name}</h3>
                        <Badge 
                          variant={calc.is_active ? "default" : "secondary"}
                          className={calc.is_active ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}
                        >
                          {calc.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        Created {new Date(calc.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => customizeCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showEmbedCode(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCalculator(calc.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-neon-400" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Line type="monotone" dataKey="quotes" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-neon-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-gray-400 py-8">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Activity will appear here as you use your calculators</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management */}
        <Card className="bg-midnight-800 border-midnight-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-neon-400" />
              Recent Client Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Client</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Project</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Quote</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((client) => (
                    <tr key={client.id} className="border-b border-midnight-700/50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-300">{client.project}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-white">{client.quote}</p>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={
                            client.status === 'Accepted' ? 'default' : 
                            client.status === 'Pending' ? 'secondary' : 
                            'destructive'
                          }
                          className={
                            client.status === 'Accepted' ? 'bg-green-500 text-white' :
                            client.status === 'Pending' ? 'bg-yellow-500 text-black' :
                            'bg-red-500 text-white'
                          }
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-400">{client.date}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Customization Modal */}
        {showCustomizeModal && selectedCalculator && (
          <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] bg-midnight-800 border-midnight-700 p-0 flex flex-col">
              <DialogHeader className="px-6 py-4 border-b border-midnight-700 flex-shrink-0">
                <DialogTitle className="text-white">Customize Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Personalize your calculator appearance and functionality.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-1 min-h-0">
                {/* Left Panel - Customization Options */}
                <div className="w-1/2 border-r border-midnight-700 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
                    
                    {/* Branding */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Palette className="h-4 w-4 mr-2" />
                        Branding
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Business Name</Label>
                          <Input
                            value={customConfig.businessName || ''}
                            onChange={(e) => setCustomConfig({...customConfig, businessName: e.target.value})}
                            placeholder="Your Business Name"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Logo Upload</Label>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setCustomConfig({...customConfig, logoUrl: event.target?.result as string});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="bg-midnight-900 border-midnight-600 text-white file:bg-neon-500 file:text-black file:border-0 file:px-4 file:py-2 file:rounded"
                            />
                            <Input
                              value={customConfig.logoUrl || ''}
                              onChange={(e) => setCustomConfig({...customConfig, logoUrl: e.target.value})}
                              placeholder="Or paste image URL"
                              className="bg-midnight-900 border-midnight-600 text-white text-xs"
                            />
                          </div>
                        </div>
                        {customConfig.logoUrl && (
                          <div>
                            <Label className="text-gray-300">Logo Size: {customConfig.logoSize || 60}px</Label>
                            <Slider
                              value={[customConfig.logoSize || 60]}
                              onValueChange={(value) => setCustomConfig({...customConfig, logoSize: value[0]})}
                              max={200}
                              min={20}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                        )}
                        <div>
                          <Label className="text-gray-300">Primary Color</Label>
                          <Input
                            type="color"
                            value={customConfig.primaryColor || '#10B981'}
                            onChange={(e) => setCustomConfig({...customConfig, primaryColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Configuration */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pricing Configuration
                      </h3>
                      <div className="space-y-4">
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Base Pricing</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-gray-300 text-xs">Base Price (€)</Label>
                              <Input
                                type="number"
                                value={customConfig.basePrice ?? 200}
                                onChange={(e) => setCustomConfig({...customConfig, basePrice: Number(e.target.value) || 0})}
                                placeholder="200"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Hourly Rate (€)</Label>
                              <Input
                                type="number"
                                value={customConfig.hourlyRate ?? 100}
                                onChange={(e) => setCustomConfig({...customConfig, hourlyRate: Number(e.target.value) || 0})}
                                placeholder="100"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Location Fee (€)</Label>
                              <Input
                                type="number"
                                value={customConfig.locationFee ?? 50}
                                onChange={(e) => setCustomConfig({...customConfig, locationFee: Number(e.target.value) || 0})}
                                placeholder="50"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Currency</Label>
                              <Select value={customConfig.currency || 'EUR'} onValueChange={(value) => setCustomConfig({...customConfig, currency: value})}>
                                <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EUR">€ Euro</SelectItem>
                                  <SelectItem value="USD">$ USD</SelectItem>
                                  <SelectItem value="GBP">£ Pound</SelectItem>
                                  <SelectItem value="CHF">₣ CHF</SelectItem>
                                  <SelectItem value="CAD">C$ CAD</SelectItem>
                                  <SelectItem value="AUD">A$ AUD</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Add-on Services</h4>
                          <div className="space-y-3">
                            {(customConfig.addOnPrices || [
                              { name: "Rush delivery", price: 100 },
                              { name: "Print package", price: 150 },
                              { name: "Social media package", price: 75 }
                            ]).map((addon, index) => (
                              <div key={index} className="flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    value={addon.name}
                                    onChange={(e) => {
                                      const newAddOns = [...(customConfig.addOnPrices || [])];
                                      newAddOns[index] = { ...addon, name: e.target.value };
                                      setCustomConfig({...customConfig, addOnPrices: newAddOns});
                                    }}
                                    placeholder="Add-on name"
                                    className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                  />
                                </div>
                                <div className="w-20">
                                  <Input
                                    type="number"
                                    value={addon.price}
                                    onChange={(e) => {
                                      const newAddOns = [...(customConfig.addOnPrices || [])];
                                      newAddOns[index] = { ...addon, price: Number(e.target.value) };
                                      setCustomConfig({...customConfig, addOnPrices: newAddOns});
                                    }}
                                    placeholder="Price"
                                    className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newAddOns = [...(customConfig.addOnPrices || [])];
                                    newAddOns.splice(index, 1);
                                    setCustomConfig({...customConfig, addOnPrices: newAddOns});
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newAddOns = [...(customConfig.addOnPrices || []), { name: "", price: 0 }];
                                setCustomConfig({...customConfig, addOnPrices: newAddOns});
                              }}
                              className="text-neon-400 hover:text-neon-300 hover:bg-neon-500/20 text-xs"
                            >
                              + Add Service
                            </Button>
                          </div>
                        </div>

                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Duration Pricing</h4>
                          <div className="space-y-2">
                            {(customConfig.durationPrices || [
                              { duration: "30 minutes", multiplier: 0.5 },
                              { duration: "1 hour", multiplier: 1 },
                              { duration: "2 hours", multiplier: 1.8 },
                              { duration: "Half day", multiplier: 3 }
                            ]).map((duration, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <div className="flex-1">
                                  <Input
                                    value={duration.duration}
                                    onChange={(e) => {
                                      const newDurations = [...(customConfig.durationPrices || [])];
                                      newDurations[index] = { ...duration, duration: e.target.value };
                                      setCustomConfig({...customConfig, durationPrices: newDurations});
                                    }}
                                    placeholder="Duration"
                                    className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                  />
                                </div>
                                <div className="w-20">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={duration.multiplier}
                                    onChange={(e) => {
                                      const newDurations = [...(customConfig.durationPrices || [])];
                                      newDurations[index] = { ...duration, multiplier: Number(e.target.value) };
                                      setCustomConfig({...customConfig, durationPrices: newDurations});
                                    }}
                                    placeholder="×"
                                    className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-8">×</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Multiplier × Base Price = Final Price for duration
                          </p>
                        </div>

                        {/* Session Duration Direct Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Session Duration Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Control the +€75, +€150 amounts shown in calculator</p>
                          <div className="space-y-3">
                            {(customConfig.sessionDurations || [
                              { id: "30-min", label: "30 minutes", price: 0, icon: "⏰" },
                              { id: "1-hour", label: "1 hour", price: 75, icon: "🕐" },
                              { id: "2-hours", label: "2 hours", price: 150, icon: "⏱️" }
                            ]).map((duration, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Duration Label"
                                  value={duration.label}
                                  onChange={(e) => {
                                    const newDurations = [...(customConfig.sessionDurations || [])];
                                    newDurations[index] = { ...duration, label: e.target.value };
                                    setCustomConfig({...customConfig, sessionDurations: newDurations});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Extra Price (€)"
                                  value={duration.price}
                                  onChange={(e) => {
                                    const newDurations = [...(customConfig.sessionDurations || [])];
                                    newDurations[index] = { ...duration, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, sessionDurations: newDurations});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Group Size Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Group Size Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Pricing for Individual, Couple, Family, etc.</p>
                          <div className="space-y-3">
                            {(customConfig.groupPrices || [
                              { id: "individual", label: "Individual", price: 0, icon: "👤" },
                              { id: "couple", label: "Couple", price: 50, icon: "💕" },
                              { id: "family", label: "Family", price: 100, icon: "👨‍👩‍👧‍👦" },
                              { id: "senior", label: "Senior / Graduation", price: 0, icon: "🎓" },
                              { id: "branding", label: "Branding / Business", price: 80, icon: "💼" }
                            ]).map((group, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Group Type"
                                  value={group.label}
                                  onChange={(e) => {
                                    const newGroups = [...(customConfig.groupPrices || [])];
                                    newGroups[index] = { ...group, label: e.target.value };
                                    setCustomConfig({...customConfig, groupPrices: newGroups});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Extra Price (€)"
                                  value={group.price}
                                  onChange={(e) => {
                                    const newGroups = [...(customConfig.groupPrices || [])];
                                    newGroups[index] = { ...group, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, groupPrices: newGroups});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Location Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Location Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Control the +€60 amounts for Outdoor, Client location</p>
                          <div className="space-y-3">
                            {(customConfig.locationPrices || [
                              { id: "studio", label: "Studio", price: 0, icon: "🏢" },
                              { id: "outdoor", label: "Outdoor", price: 60, icon: "🌳" },
                              { id: "client-location", label: "Client's Home / Office", price: 60, icon: "🏠" }
                            ]).map((location, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Location Type"
                                  value={location.label}
                                  onChange={(e) => {
                                    const newLocations = [...(customConfig.locationPrices || [])];
                                    newLocations[index] = { ...location, label: e.target.value };
                                    setCustomConfig({...customConfig, locationPrices: newLocations});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Extra Price (€)"
                                  value={location.price}
                                  onChange={(e) => {
                                    const newLocations = [...(customConfig.locationPrices || [])];
                                    newLocations[index] = { ...location, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, locationPrices: newLocations});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Wardrobe Changes Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Wardrobe Changes Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Control the +€40, +€80 amounts for outfit changes</p>
                          <div className="space-y-3">
                            {(customConfig.wardrobePrices || [
                              { id: "1", label: "1 Outfit", price: 0, icon: "👕" },
                              { id: "2", label: "2 Outfits", price: 40, icon: "👔" },
                              { id: "3+", label: "3+ Outfits", price: 80, icon: "👗" }
                            ]).map((wardrobe, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Outfit Option"
                                  value={wardrobe.label}
                                  onChange={(e) => {
                                    const newWardrobe = [...(customConfig.wardrobePrices || [])];
                                    newWardrobe[index] = { ...wardrobe, label: e.target.value };
                                    setCustomConfig({...customConfig, wardrobePrices: newWardrobe});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Extra Price (€)"
                                  value={wardrobe.price}
                                  onChange={(e) => {
                                    const newWardrobe = [...(customConfig.wardrobePrices || [])];
                                    newWardrobe[index] = { ...wardrobe, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, wardrobePrices: newWardrobe});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add-on Services Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Add-on Services Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Control Professional Makeup (+€80), Retouching, etc.</p>
                          <div className="space-y-3">
                            {(customConfig.enhancementPrices || [
                              { id: "makeup", label: "Professional Makeup", price: 80 },
                              { id: "standard-retouching", label: "Standard Retouching", price: 0 },
                              { id: "deluxe-retouching", label: "Deluxe Retouching", price: 50 },
                              { id: "express-delivery", label: "Express Delivery", price: 50 },
                              { id: "extra-images", label: "Extra Images (+5)", price: 100 },
                              { id: "headshot-bundle", label: "Headshot Bundle", price: 75 }
                            ]).map((addon, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Add-on Service"
                                  value={addon.label}
                                  onChange={(e) => {
                                    const newAddons = [...(customConfig.enhancementPrices || [])];
                                    newAddons[index] = { ...addon, label: e.target.value };
                                    setCustomConfig({...customConfig, enhancementPrices: newAddons});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Price (€)"
                                  value={addon.price}
                                  onChange={(e) => {
                                    const newAddons = [...(customConfig.enhancementPrices || [])];
                                    newAddons[index] = { ...addon, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, enhancementPrices: newAddons});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Usage Type Pricing */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Usage Type Pricing</h4>
                          <p className="text-xs text-gray-400 mb-3">Control Commercial/Branding (+€120) pricing</p>
                          <div className="space-y-3">
                            {(customConfig.usagePrices || [
                              { id: "personal", label: "Personal Use", price: 0, icon: "🏠" },
                              { id: "commercial", label: "Commercial / Branding", price: 120, icon: "💼" }
                            ]).map((usage, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Usage Type"
                                  value={usage.label}
                                  onChange={(e) => {
                                    const newUsage = [...(customConfig.usagePrices || [])];
                                    newUsage[index] = { ...usage, label: e.target.value };
                                    setCustomConfig({...customConfig, usagePrices: newUsage});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Extra Price (€)"
                                  value={usage.price}
                                  onChange={(e) => {
                                    const newUsage = [...(customConfig.usagePrices || [])];
                                    newUsage[index] = { ...usage, price: Number(e.target.value) || 0 };
                                    setCustomConfig({...customConfig, usagePrices: newUsage});
                                  }}
                                  className="bg-midnight-900 border-midnight-600 text-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comprehensive Text Customization */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Type className="h-4 w-4 mr-2" />
                        Text Customization
                      </h3>
                      <div className="space-y-6">
                        
                        {/* Headers Section */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Headers & Titles</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-xs">Main Title</Label>
                              <Input
                                value={customConfig.mainTitle || ''}
                                onChange={(e) => setCustomConfig({...customConfig, mainTitle: e.target.value})}
                                placeholder={selectedCalculator.name}
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Subtitle</Label>
                              <Input
                                value={customConfig.subtitle || ''}
                                onChange={(e) => setCustomConfig({...customConfig, subtitle: e.target.value})}
                                placeholder="Get your personalized quote"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Description</Label>
                              <Textarea
                                value={customConfig.description || ''}
                                onChange={(e) => setCustomConfig({...customConfig, description: e.target.value})}
                                placeholder="Brief description of your service"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Button Text Section */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Button Text</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-xs">Submit Button</Label>
                              <Input
                                value={customConfig.submitButtonText || ''}
                                onChange={(e) => setCustomConfig({...customConfig, submitButtonText: e.target.value})}
                                placeholder="Get My Quote"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Next Step Button</Label>
                              <Input
                                value={customConfig.nextStepButton || ''}
                                onChange={(e) => setCustomConfig({...customConfig, nextStepButton: e.target.value})}
                                placeholder="Continue"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Back Button</Label>
                              <Input
                                value={customConfig.backStepButton || ''}
                                onChange={(e) => setCustomConfig({...customConfig, backStepButton: e.target.value})}
                                placeholder="Back"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Form Fields Section */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Form Field Labels</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-xs">Name Field Label</Label>
                              <Input
                                value={customConfig.nameLabel || ''}
                                onChange={(e) => setCustomConfig({...customConfig, nameLabel: e.target.value})}
                                placeholder="Your Name"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Email Field Label</Label>
                              <Input
                                value={customConfig.emailLabel || ''}
                                onChange={(e) => setCustomConfig({...customConfig, emailLabel: e.target.value})}
                                placeholder="Email Address"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Phone Field Label</Label>
                              <Input
                                value={customConfig.phoneLabel || ''}
                                onChange={(e) => setCustomConfig({...customConfig, phoneLabel: e.target.value})}
                                placeholder="Phone Number"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Inline Editing Info */}
                        <div className="border border-neon-500/30 rounded-lg p-4 bg-neon-500/5">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm flex items-center">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Live Preview Editing
                          </h4>
                          <p className="text-gray-300 text-xs mb-3">
                            Click any text in the live preview to edit it directly. Changes will be saved automatically.
                          </p>
                          <div className="bg-midnight-900 border border-midnight-600 rounded p-3">
                            <div className="text-xs text-gray-400 mb-2">Preview shows:</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• Click-to-edit titles and descriptions</div>
                              <div>• Hover hints for editable content</div>
                              <div>• Real-time text updates</div>
                            </div>
                          </div>
                        </div>

                        {/* Calculator-Specific Fields */}
                        {(() => {
                          const getCalculatorSpecificFields = () => {
                            const calculatorConfigs = {
                              'wedding-photography': {
                                sections: [
                                  {
                                    title: 'Package Options',
                                    fields: [
                                      { key: 'elopementPackage', label: 'Elopement Package', placeholder: 'Elopement / Small Ceremony' },
                                      { key: 'halfDayPackage', label: 'Half-Day Package', placeholder: 'Half-Day Coverage' },
                                      { key: 'fullDayPackage', label: 'Full-Day Package', placeholder: 'Full-Day Coverage' },
                                      { key: 'destinationPackage', label: 'Destination Package', placeholder: 'Destination Wedding' }
                                    ]
                                  },
                                  {
                                    title: 'Location Options',
                                    fields: [
                                      { key: 'singleLocation', label: 'Single Location', placeholder: '1 Location' },
                                      { key: 'twoLocations', label: 'Two Locations', placeholder: '2 Locations' },
                                      { key: 'multipleLocations', label: 'Multiple Locations', placeholder: '3+ Locations' }
                                    ]
                                  },
                                  {
                                    title: 'Add-on Services',
                                    fields: [
                                      { key: 'engagementSession', label: 'Engagement Session', placeholder: 'Engagement Session' },
                                      { key: 'secondPhotographer', label: 'Second Photographer', placeholder: 'Second Photographer' },
                                      { key: 'dronePhotography', label: 'Drone Photography', placeholder: 'Drone Photography' },
                                      { key: 'weddingAlbum', label: 'Wedding Album', placeholder: 'Wedding Album' },
                                      { key: 'rehearsalDinner', label: 'Rehearsal Dinner', placeholder: 'Rehearsal Dinner Coverage' },
                                      { key: 'expressDelivery', label: 'Express Delivery', placeholder: 'Express Turnaround' }
                                    ]
                                  }
                                ]
                              },
                              'boudoir-photography': {
                                sections: [
                                  {
                                    title: 'Session Types',
                                    fields: [
                                      { key: 'standardSession', label: 'Standard Session', placeholder: 'Standard Boudoir Session' },
                                      { key: 'deluxeSession', label: 'Deluxe Session', placeholder: 'Deluxe Session with Makeup' },
                                      { key: 'couplesSession', label: 'Couples Session', placeholder: 'Couples Boudoir' },
                                      { key: 'outdoorSession', label: 'Outdoor Session', placeholder: 'Outdoor Boudoir' }
                                    ]
                                  },
                                  {
                                    title: 'Add-on Services',
                                    fields: [
                                      { key: 'makeupArtist', label: 'Makeup Artist', placeholder: 'Professional Makeup' },
                                      { key: 'hairStyling', label: 'Hair Styling', placeholder: 'Hair Styling Service' },
                                      { key: 'outfitChanges', label: 'Extra Outfits', placeholder: 'Additional Outfit Changes' },
                                      { key: 'albumUpgrade', label: 'Album Upgrade', placeholder: 'Luxury Album' }
                                    ]
                                  }
                                ]
                              },
                              'portrait-photography': {
                                sections: [
                                  {
                                    title: 'Portrait Types',
                                    fields: [
                                      { key: 'familyPortrait', label: 'Family Portrait', placeholder: 'Family Portrait Session' },
                                      { key: 'individualPortrait', label: 'Individual Portrait', placeholder: 'Individual Portrait' },
                                      { key: 'businessHeadshots', label: 'Business Headshots', placeholder: 'Professional Headshots' },
                                      { key: 'seniorPortraits', label: 'Senior Portraits', placeholder: 'Senior Graduation Photos' }
                                    ]
                                  },
                                  {
                                    title: 'Session Options',
                                    fields: [
                                      { key: 'studioSession', label: 'Studio Session', placeholder: 'Studio Portrait Session' },
                                      { key: 'outdoorSession', label: 'Outdoor Session', placeholder: 'Outdoor Portrait Session' },
                                      { key: 'extendedSession', label: 'Extended Session', placeholder: 'Extended Time' },
                                      { key: 'rushDelivery', label: 'Rush Delivery', placeholder: 'Same-Day Delivery' }
                                    ]
                                  }
                                ]
                              },
                              'real-estate-photography': {
                                sections: [
                                  {
                                    title: 'Listing Types',
                                    fields: [
                                      { key: 'standardListing', label: 'Standard Listing', placeholder: 'Standard Real Estate Photos' },
                                      { key: 'luxuryListing', label: 'Luxury Listing', placeholder: 'Luxury Property Package' },
                                      { key: 'commercialProperty', label: 'Commercial Property', placeholder: 'Commercial Real Estate' },
                                      { key: 'rentalProperty', label: 'Rental Property', placeholder: 'Rental Listing Photos' }
                                    ]
                                  },
                                  {
                                    title: 'Additional Services',
                                    fields: [
                                      { key: 'virtualTour', label: 'Virtual Tour', placeholder: '360° Virtual Tour' },
                                      { key: 'droneAerial', label: 'Drone Aerial', placeholder: 'Aerial Drone Photography' },
                                      { key: 'twilightPhotos', label: 'Twilight Photos', placeholder: 'Twilight/Dusk Photos' },
                                      { key: 'videoWalkthrough', label: 'Video Walkthrough', placeholder: 'Property Video Tour' },
                                      { key: 'floorPlan', label: 'Floor Plan', placeholder: 'Professional Floor Plan' },
                                      { key: 'virtualStaging', label: 'Virtual Staging', placeholder: 'Digital Furniture Staging' }
                                    ]
                                  }
                                ]
                              },
                              'electrician': {
                                sections: [
                                  {
                                    title: 'Service Types',
                                    fields: [
                                      { key: 'generalElectrical', label: 'General Electrical', placeholder: 'General Electrical Work' },
                                      { key: 'emergencyRepair', label: 'Emergency Repair', placeholder: 'Emergency Electrical Repair' },
                                      { key: 'panelUpgrade', label: 'Panel Upgrade', placeholder: 'Electrical Panel Upgrade' },
                                      { key: 'newConstruction', label: 'New Construction', placeholder: 'New Construction Wiring' }
                                    ]
                                  },
                                  {
                                    title: 'Specialized Services',
                                    fields: [
                                      { key: 'lightingInstall', label: 'Lighting Installation', placeholder: 'Lighting Installation' },
                                      { key: 'outletInstall', label: 'Outlet Installation', placeholder: 'New Outlet Installation' },
                                      { key: 'smartHome', label: 'Smart Home Setup', placeholder: 'Smart Home Automation' },
                                      { key: 'safetyInspection', label: 'Safety Inspection', placeholder: 'Electrical Safety Inspection' }
                                    ]
                                  }
                                ]
                              },
                              'home-renovation': {
                                sections: [
                                  {
                                    title: 'Renovation Types',
                                    fields: [
                                      { key: 'kitchenReno', label: 'Kitchen Renovation', placeholder: 'Kitchen Renovation' },
                                      { key: 'bathroomReno', label: 'Bathroom Renovation', placeholder: 'Bathroom Renovation' },
                                      { key: 'fullHouseReno', label: 'Full House Renovation', placeholder: 'Complete Home Renovation' },
                                      { key: 'basementFinish', label: 'Basement Finishing', placeholder: 'Basement Finishing' }
                                    ]
                                  },
                                  {
                                    title: 'Additional Services',
                                    fields: [
                                      { key: 'additionBuild', label: 'Home Addition', placeholder: 'Room Addition' },
                                      { key: 'flooringInstall', label: 'Flooring Installation', placeholder: 'New Flooring' },
                                      { key: 'paintingService', label: 'Painting Service', placeholder: 'Interior/Exterior Painting' },
                                      { key: 'roofingWork', label: 'Roofing Work', placeholder: 'Roof Repair/Replacement' }
                                    ]
                                  }
                                ]
                              }
                            };
                            
                            return calculatorConfigs[selectedCalculator.template_id as keyof typeof calculatorConfigs] || null;
                          };
                          
                          const config = getCalculatorSpecificFields();
                          
                          if (!config) return null;
                          
                          return config.sections.map((section: any, sectionIndex: number) => (
                            <div key={sectionIndex} className="border border-midnight-600 rounded-lg p-4">
                              <h4 className="text-neon-400 font-medium mb-3 text-sm">{section.title}</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {section.fields.map((field: any) => (
                                  <div key={field.key}>
                                    <Label className="text-gray-300 text-xs">{field.label}</Label>
                                    <Input
                                      value={customConfig[field.key] || ''}
                                      onChange={(e) => setCustomConfig({...customConfig, [field.key]: e.target.value})}
                                      placeholder={field.placeholder}
                                      className="bg-midnight-900 border-midnight-600 text-white text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}

                        {/* Footer Section */}
                        <div className="border border-midnight-600 rounded-lg p-4">
                          <h4 className="text-neon-400 font-medium mb-3 text-sm">Footer & Privacy</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-xs">Footer Text</Label>
                              <Input
                                value={customConfig.footerText || ''}
                                onChange={(e) => setCustomConfig({...customConfig, footerText: e.target.value})}
                                placeholder="Powered by YourBusiness"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Privacy Text</Label>
                              <Input
                                value={customConfig.privacyText || ''}
                                onChange={(e) => setCustomConfig({...customConfig, privacyText: e.target.value})}
                                placeholder="Your information is secure"
                                className="bg-midnight-900 border-midnight-600 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Layout & Spacing */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Layout className="h-4 w-4 mr-2" />
                        Layout & Spacing
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Layout Style</Label>
                          <Select value={customConfig.layout || 'vertical'} onValueChange={(value) => setCustomConfig({...customConfig, layout: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vertical">Vertical (Single Column)</SelectItem>
                              <SelectItem value="horizontal">Horizontal (Multi-Column)</SelectItem>
                              <SelectItem value="wizard">Step-by-Step Wizard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Padding: {customConfig.padding || 20}px</Label>
                          <Slider
                            value={[customConfig.padding || 20]}
                            onValueChange={(value) => setCustomConfig({...customConfig, padding: value[0]})}
                            max={60}
                            min={0}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Border Radius: {customConfig.borderRadius || 8}px</Label>
                          <Slider
                            value={[customConfig.borderRadius || 8]}
                            onValueChange={(value) => setCustomConfig({...customConfig, borderRadius: value[0]})}
                            max={24}
                            min={0}
                            step={2}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Behavior */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Zap className="h-4 w-4 mr-2" />
                        Form Behavior
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Real-time Updates</Label>
                          <Switch
                            checked={customConfig.realTimeUpdates !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, realTimeUpdates: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Show Progress Bar</Label>
                          <Switch
                            checked={customConfig.showProgress || false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, showProgress: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Required Field Validation</Label>
                          <Switch
                            checked={customConfig.validation !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, validation: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Animation Speed</Label>
                          <Select value={customConfig.animationSpeed || 'normal'} onValueChange={(value) => setCustomConfig({...customConfig, animationSpeed: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slow">Slow</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="fast">Fast</SelectItem>
                              <SelectItem value="none">No Animation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications & Analytics */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications & Analytics
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Email Notifications</Label>
                          <Input
                            value={customConfig.notificationEmail || ''}
                            onChange={(e) => setCustomConfig({...customConfig, notificationEmail: e.target.value})}
                            placeholder="your@email.com"
                            type="email"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Track Conversions</Label>
                          <Switch
                            checked={customConfig.trackConversions !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, trackConversions: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Capture Lead Info</Label>
                          <Switch
                            checked={customConfig.captureLeads || false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, captureLeads: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Google Analytics ID</Label>
                          <Input
                            value={customConfig.googleAnalytics || ''}
                            onChange={(e) => setCustomConfig({...customConfig, googleAnalytics: e.target.value})}
                            placeholder="GA4-XXXXXXXXXX"
                            className="bg-midnight-900 border-midnight-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Device Optimization */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Device Optimization
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300">Mobile Optimized</Label>
                          <Switch
                            checked={customConfig.mobileOptimized !== false}
                            onCheckedChange={(checked) => setCustomConfig({...customConfig, mobileOptimized: checked})}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Responsive Breakpoint</Label>
                          <Select value={customConfig.breakpoint || 'md'} onValueChange={(value) => setCustomConfig({...customConfig, breakpoint: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sm">Small (640px)</SelectItem>
                              <SelectItem value="md">Medium (768px)</SelectItem>
                              <SelectItem value="lg">Large (1024px)</SelectItem>
                              <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Font Size: {customConfig.fontSize || 16}px</Label>
                          <Slider
                            value={[customConfig.fontSize || 16]}
                            onValueChange={(value) => setCustomConfig({...customConfig, fontSize: value[0]})}
                            max={24}
                            min={12}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Styling */}
                    <div>
                      <h3 className="text-white font-medium mb-4 flex items-center">
                        <div className="w-2 h-2 bg-neon-500 rounded-full mr-2"></div>
                        <Palette className="h-4 w-4 mr-2" />
                        Advanced Styling
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Background Color</Label>
                          <Input
                            type="color"
                            value={customConfig.backgroundColor || '#ffffff'}
                            onChange={(e) => setCustomConfig({...customConfig, backgroundColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Text Color</Label>
                          <Input
                            type="color"
                            value={customConfig.textColor || '#000000'}
                            onChange={(e) => setCustomConfig({...customConfig, textColor: e.target.value})}
                            className="h-12 bg-midnight-900 border-midnight-600"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Font Family</Label>
                          <Select value={customConfig.fontFamily || 'Inter'} onValueChange={(value) => setCustomConfig({...customConfig, fontFamily: value})}>
                            <SelectTrigger className="bg-midnight-900 border-midnight-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Poppins">Poppins</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Border Radius: {customConfig.borderRadius || 8}px</Label>
                          <Slider
                            value={[customConfig.borderRadius || 8]}
                            onValueChange={(value) => setCustomConfig({...customConfig, borderRadius: value[0]})}
                            max={50}
                            min={0}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Shadow Intensity: {customConfig.shadowIntensity || 10}%</Label>
                          <Slider
                            value={[customConfig.shadowIntensity || 10]}
                            onValueChange={(value) => setCustomConfig({...customConfig, shadowIntensity: value[0]})}
                            max={100}
                            min={0}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Custom CSS</Label>
                          <Textarea
                            value={customConfig.customCSS || ''}
                            onChange={(e) => setCustomConfig({...customConfig, customCSS: e.target.value})}
                            placeholder="/* Custom CSS styles */\n.calculator-form {\n  /* your styles here */\n}"
                            className="bg-midnight-900 border-midnight-600 text-white font-mono text-sm"
                            rows={6}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Live Preview */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b border-midnight-700 bg-midnight-900 flex-shrink-0">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-neon-400" />
                      Live Preview
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">See changes in real-time</p>
                  </div>
                  
                  <div className="flex-1 overflow-hidden bg-gray-100 relative">
                    <div 
                      className="w-full h-full overflow-y-auto p-4"
                      style={{
                        backgroundColor: customConfig.backgroundColor || '#ffffff',
                        color: customConfig.textColor || '#000000',
                        fontSize: `${customConfig.fontSize || 16}px`
                      }}
                    >
                      <div className="transform scale-75 origin-top-left w-[133%] h-[133%]">
                        <CalculatorPreview 
                          slug={selectedCalculator.template_id}
                          customConfig={{
                            ...customConfig,
                            forceDetailedView: true,
                            useComprehensiveCalculator: true,
                            calculatorType: `comprehensive-${selectedCalculator.template_id}`,
                            isPreview: true
                          }}
                          onConfigChange={(newConfig) => {
                            setCustomConfig(prev => ({ ...prev, ...newConfig }));
                          }}
                          className="h-auto max-h-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-6 py-4 border-t border-midnight-700 bg-midnight-900 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomizeModal(false)}
                  className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                >
                  Cancel
                </Button>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomConfig({});
                      toast({
                        title: "Reset Complete",
                        description: "All customizations have been reset to default.",
                      });
                    }}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                  >
                    Reset to Default
                  </Button>
                  <Button
                    onClick={() => {
                      const updatedCalculators = userCalculators.map(calc => 
                        calc.id === selectedCalculator.id 
                          ? { ...calc, config: customConfig }
                          : calc
                      );
                      setUserCalculators(updatedCalculators);
                      const userSession = localStorage.getItem('user_session');
                      const userCalculatorKey = `userCalculators_${userSession}`;
                      localStorage.setItem(userCalculatorKey, JSON.stringify(updatedCalculators));
                      
                      toast({
                        title: "Calculator Updated!",
                        description: "Your customizations have been saved.",
                      });
                      
                      setShowCustomizeModal(false);
                    }}
                    className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Calculator Selection Modal */}
        {showCalculatorModal && (
          <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from our library of professional calculator templates.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col space-y-4 p-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-midnight-900 border-midnight-600 text-white placeholder-gray-400"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="sm:w-48 bg-midnight-900 border-midnight-600 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-midnight-900 border-midnight-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredCalculators.map((calculator) => (
                    <Card 
                      key={calculator.id} 
                      className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-neon-500/20"
                      onClick={() => addCalculator(calculator)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">{calculator.name}</h3>
                            <p className="text-xs text-gray-400">{calculator.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{calculator.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCalculators.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">No calculators found matching your criteria.</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowCalculatorModal(false)}
                        className="mt-2 border-midnight-600 text-gray-300 hover:bg-midnight-800"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <Dialog open={showEmbedModal} onOpenChange={setShowEmbedModal}>
            <DialogContent className="max-w-2xl bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Embed Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Copy and paste this code into your website to embed the calculator.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Preview URL */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Direct Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono">
                      {`https://quotekits.com/embed/${selectedCalculator.embedId || selectedCalculator.id}`}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        const embedUrl = `https://quotekits.com/embed/${selectedCalculator.embedId || selectedCalculator.id}`;
                        navigator.clipboard.writeText(embedUrl);
                        toast({
                          title: "Copied!",
                          description: "Direct link copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Embed Code
                  </label>
                  <div className="flex items-start space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`<iframe 
  src="https://quotekits.com/embed/${selectedCalculator.embedId || selectedCalculator.id}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        const embedUrl = `https://quotekits.com/embed/${selectedCalculator.embedId || selectedCalculator.id}`;
                        const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
                        navigator.clipboard.writeText(embedCode);
                        toast({
                          title: "Copied!",
                          description: "Embed code copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedCalculator && (
          <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-neon-400" />
                  Preview: {selectedCalculator.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  See how your calculator looks and test its functionality.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-hidden bg-gray-100 relative">
                <div 
                  className="w-full h-full overflow-y-auto"
                  style={{
                    backgroundColor: customConfig.backgroundColor || '#ffffff',
                    color: customConfig.textColor || '#000000',
                    fontSize: `${customConfig.fontSize || 16}px`,
                    minHeight: '700px'
                  }}
                >
                  <CalculatorPreview 
                    slug={selectedCalculator.template_id}
                    customConfig={customConfig}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                >
                  Close Preview
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            Calculator added successfully!
          </div>
        )}

        {/* Subscription Upgrade Modal */}
        {showUpgradeModal && (
          <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
            <DialogContent className="max-w-4xl bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Upgrade Your Subscription</DialogTitle>
                <DialogDescription className="text-gray-400">
                  You've reached your {user.subscriptionStatus === 'free' ? 'calculator limit' : 'usage limits'}. Choose a plan that fits your needs.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => (
                  <Card 
                    key={tier} 
                    className={`bg-midnight-900 border-midnight-600 hover:border-neon-500/50 transition-all ${
                      tier === 'pro' ? 'border-neon-500 shadow-lg shadow-neon-500/20' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">{details.name}</h3>
                        {tier === 'pro' && (
                          <div className="bg-neon-500 text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                            LIMITED TIME
                          </div>
                        )}
                        <div className="text-3xl font-bold text-white mb-1">
                          {details.price === 0 ? 'Free' : `€${details.price}`}
                        </div>
                        {details.price > 0 && (
                          <div className="text-sm text-gray-400 mb-4">/month</div>
                        )}
                        
                        <div className="space-y-3 text-left">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                            <span className="text-gray-300">
                              {details.calculators === 999 ? 'Unlimited' : details.calculators} calculators
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                            <span className="text-gray-300">
                              {details.quotes === 999 ? 'Unlimited' : details.quotes} quotes/month
                            </span>
                          </div>
                          
                          {tier === 'pro' && (
                            <>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Priority support</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Custom branding</span>
                              </div>
                            </>
                          )}
                          
                          {tier === 'business' && (
                            <>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Analytics dashboard</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Lead management</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">API access</span>
                              </div>
                            </>
                          )}
                          
                          {tier === 'enterprise' && (
                            <>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">White-label solution</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Dedicated support</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-neon-400 rounded-full mr-2"></div>
                                <span className="text-gray-300">Custom integrations</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <Button
                          className={`w-full mt-6 ${
                            tier === user.subscriptionStatus 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : tier === 'pro' 
                                ? 'bg-neon-500 hover:bg-neon-600 text-black font-medium' 
                                : 'bg-midnight-700 hover:bg-midnight-600 text-white border border-midnight-600'
                          }`}
                          onClick={() => tier !== user.subscriptionStatus && upgradeSubscription(tier as keyof typeof SUBSCRIPTION_TIERS)}
                          disabled={tier === user.subscriptionStatus}
                        >
                          {tier === user.subscriptionStatus ? 'Current Plan' : 
                           tier === 'free' ? 'Downgrade' : 
                           tier === 'enterprise' ? 'Contact Sales' : 
                           `Pay €${details.price}/month`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-400 pt-4 border-t border-midnight-600">
                Need help choosing? <span className="text-neon-400 cursor-pointer hover:underline">Contact our sales team</span>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Checkout Modal for blocked popups */}
        {showCheckoutModal && (
          <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
            <DialogContent className="bg-midnight-800 text-white border-midnight-600 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-neon-400">Complete Your Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Your browser blocked the popup. Click the button below to open the secure Stripe checkout page:
                </p>
                <Button
                  className="w-full bg-neon-500 hover:bg-neon-600 text-black font-medium"
                  onClick={() => window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
                >
                  Open Stripe Checkout
                </Button>
                <div className="text-xs text-gray-400 text-center">
                  Or copy this link: 
                  <input 
                    type="text" 
                    value={checkoutUrl} 
                    readOnly 
                    className="w-full mt-2 p-2 bg-midnight-700 border border-midnight-600 rounded text-xs"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}