import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuoteKitHeader } from "@/components/calculator-header";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { TestAuth } from "@/components/test-auth";
import { 
  Settings, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Eye, 
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Calculator,
  Mail,
  Globe,
  Plus,
  X,
  Search,
  Camera,
  Home,
  Wrench,
  Zap,
  Stethoscope,
  Heart,
  Car,
  Code,
  GraduationCap,
  Truck,
  Briefcase,
  Scale,
  Scissors,
  Paintbrush,
  TreePine,
  Shield,
  Droplets,
  Video,
  Edit,
  Monitor,
  Palette,
  Dumbbell,
  Target,
  Building,
  Crown,
  DollarSign,
  Save,
  RotateCcw
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
}

interface UserCalculator {
  id: string;
  embedId: string;
  embedUrl: string;
  adminUrl: string;
  calculatorId: number;
  config: any;
  customBranding: any;
  isActive: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  

  // Demo data for preview - bypassing auth temporarily
  const [user] = useState<User>({
    id: "demo-123",
    email: "demo@quotekit.ai", 
    fullName: "Demo User",
    subscriptionStatus: "pro",
    quotesUsedThisMonth: 47,
    quotesLimit: 500
  });

  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // All available calculators
  const allCalculators = [
    // Photography & Creative (10 calculators)
    { id: 1, name: "Wedding Photography", icon: Camera, category: "Photography & Creative", slug: "wedding-photography" },
    { id: 2, name: "Boudoir Photography", icon: Heart, category: "Photography & Creative", slug: "boudoir-photography" },
    { id: 3, name: "Corporate Headshots", icon: Briefcase, category: "Photography & Creative", slug: "corporate-headshots" },
    { id: 4, name: "Drone/Aerial Photography", icon: Camera, category: "Photography & Creative", slug: "drone-photography" },
    { id: 5, name: "Event Videography", icon: Video, category: "Photography & Creative", slug: "event-videography" },
    { id: 6, name: "Real Estate Photography", icon: Home, category: "Photography & Creative", slug: "real-estate-photography" },
    { id: 7, name: "Food Photography", icon: Camera, category: "Photography & Creative", slug: "food-photography" },
    { id: 8, name: "Commercial Photography", icon: Camera, category: "Photography & Creative", slug: "commercial-photography" },
    { id: 9, name: "Portrait Photography", icon: Camera, category: "Photography & Creative", slug: "portrait-photography" },
    { id: 10, name: "Lifestyle Influencer", icon: Users, category: "Photography & Creative", slug: "lifestyle-influencer" },

    // Home & Construction (10 calculators)
    { id: 11, name: "Home Renovation", icon: Home, category: "Home & Construction", slug: "home-renovation" },
    { id: 12, name: "Landscaping", icon: TreePine, category: "Home & Construction", slug: "landscaping" },
    { id: 13, name: "Interior Design", icon: Palette, category: "Home & Construction", slug: "interior-design" },
    { id: 14, name: "Painting & Decorating", icon: Paintbrush, category: "Home & Construction", slug: "painting-decorating" },
    { id: 15, name: "Electrical Services", icon: Zap, category: "Home & Construction", slug: "electrical" },
    { id: 16, name: "Plumbing Services", icon: Wrench, category: "Home & Construction", slug: "plumbing" },
    { id: 17, name: "Roofing", icon: Home, category: "Home & Construction", slug: "roofing" },
    { id: 18, name: "Solar Panel Installation", icon: Zap, category: "Home & Construction", slug: "solar" },
    { id: 19, name: "Pest Control", icon: Shield, category: "Home & Construction", slug: "pest-control" },
    { id: 20, name: "Window & Door Installation", icon: Home, category: "Home & Construction", slug: "window-door" },

    // Beauty & Wellness (8 calculators)
    { id: 21, name: "Makeup Artist", icon: Palette, category: "Beauty & Wellness", slug: "makeup-artist" },
    { id: 22, name: "Hair Stylist", icon: Scissors, category: "Beauty & Wellness", slug: "hair-stylist" },
    { id: 23, name: "Tattoo Artist", icon: Palette, category: "Beauty & Wellness", slug: "tattoo-artist" },
    { id: 24, name: "Massage Therapy", icon: Heart, category: "Beauty & Wellness", slug: "massage-therapy" },
    { id: 25, name: "Personal Trainer", icon: Dumbbell, category: "Beauty & Wellness", slug: "personal-training" },
    { id: 26, name: "Nutritionist", icon: Heart, category: "Beauty & Wellness", slug: "nutritionist" },
    { id: 27, name: "Life Coach", icon: Target, category: "Beauty & Wellness", slug: "life-coach" },
    { id: 28, name: "Hypnotherapist", icon: Heart, category: "Beauty & Wellness", slug: "hypnotherapist" },

    // Education & Training (3 calculators)
    { id: 29, name: "Private Tutor", icon: GraduationCap, category: "Education & Training", slug: "private-tutor" },
    { id: 30, name: "Private Schools", icon: GraduationCap, category: "Education & Training", slug: "private-school" },
    { id: 31, name: "Driving Instructor", icon: Car, category: "Education & Training", slug: "driving-instructor" },

    // Healthcare & Medical (5 calculators)
    { id: 32, name: "Dentist & Implant Clinics", icon: Stethoscope, category: "Healthcare & Medical", slug: "dentist" },
    { id: 33, name: "Private Medical Clinics", icon: Stethoscope, category: "Healthcare & Medical", slug: "private-medical" },
    { id: 34, name: "Plastic Surgery", icon: Stethoscope, category: "Healthcare & Medical", slug: "plastic-surgery" },
    { id: 35, name: "Childcare Practitioners", icon: Heart, category: "Healthcare & Medical", slug: "childcare" },
    { id: 36, name: "Childcare Services", icon: Heart, category: "Healthcare & Medical", slug: "childcare-services" },

    // Pet Services (1 calculator)
    { id: 37, name: "Dog Trainer", icon: Heart, category: "Pet Services", slug: "dog-trainer" },

    // Automotive & Transportation (9 calculators)
    { id: 38, name: "Car Detailing", icon: Car, category: "Automotive & Transportation", slug: "car-detailing" },
    { id: 39, name: "Auto Mechanic", icon: Wrench, category: "Automotive & Transportation", slug: "auto-mechanic" },
    { id: 40, name: "Mobile Car Wash", icon: Droplets, category: "Automotive & Transportation", slug: "mobile-car-wash" },
    { id: 41, name: "Moving Services", icon: Truck, category: "Automotive & Transportation", slug: "moving-services" },
    { id: 42, name: "Chauffeur/Limo Services", icon: Car, category: "Automotive & Transportation", slug: "chauffeur-limo" },
    { id: 43, name: "Airport Transfers", icon: Car, category: "Automotive & Transportation", slug: "airport-transfer" },
    { id: 44, name: "Van Rentals", icon: Truck, category: "Automotive & Transportation", slug: "van-rental" },
    { id: 45, name: "Boat Charters", icon: Truck, category: "Automotive & Transportation", slug: "boat-charter" },
    { id: 46, name: "Motorcycle Repair", icon: Wrench, category: "Automotive & Transportation", slug: "motorcycle-repair" },

    // Business & Digital Services (11 calculators)
    { id: 47, name: "Web Designer", icon: Code, category: "Business & Digital Services", slug: "web-designer" },
    { id: 48, name: "Marketing Consultant", icon: BarChart3, category: "Business & Digital Services", slug: "marketing-consultant" },
    { id: 49, name: "SEO Agency", icon: TrendingUp, category: "Business & Digital Services", slug: "seo-agency" },
    { id: 50, name: "Video Editor", icon: Video, category: "Business & Digital Services", slug: "video-editor" },
    { id: 51, name: "Copywriter", icon: Edit, category: "Business & Digital Services", slug: "copywriter" },
    { id: 52, name: "Virtual Assistant", icon: Users, category: "Business & Digital Services", slug: "virtual-assistant" },
    { id: 53, name: "Business Coach", icon: Briefcase, category: "Business & Digital Services", slug: "business-coach" },
    { id: 54, name: "Legal Advisor", icon: Scale, category: "Business & Digital Services", slug: "legal-advisor" },
    { id: 55, name: "Tax Preparer", icon: Calculator, category: "Business & Digital Services", slug: "tax-preparer" },
    { id: 56, name: "Translation Services", icon: Globe, category: "Business & Digital Services", slug: "translation-services" },
    { id: 57, name: "Cleaning Services", icon: Home, category: "Business & Digital Services", slug: "cleaning-services" }
  ];

  const categories = ["All", ...Array.from(new Set(allCalculators.map(calc => calc.category)))];
  
  const filteredCalculators = allCalculators.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || calc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [demoCalculators, setDemoCalculators] = useState<UserCalculator[]>([
    {
      id: "calc-1",
      embedId: "qk-wedding-photo",
      embedUrl: "https://quotekit.ai/embed/qk-wedding-photo",
      adminUrl: "https://quotekit.ai/admin/qk-wedding-photo", 
      calculatorId: 1,
      config: { primaryColor: "#10b981" },
      customBranding: { companyName: "Elite Photography" },
      isActive: true
    },
    {
      id: "calc-2",
      embedId: "qk-home-reno", 
      embedUrl: "https://quotekit.ai/embed/qk-home-reno",
      adminUrl: "https://quotekit.ai/admin/qk-home-reno",
      calculatorId: 2,
      config: { primaryColor: "#3b82f6" },
      customBranding: { companyName: "Premier Renovations" },
      isActive: true
    }
  ]);

  useEffect(() => {
    // Demo mode for dashboard preview
    console.log('Dashboard loaded in demo mode');
  }, []);

  // Use demo data for preview
  const userCalculators = demoCalculators;
  const calculatorsLoading = false;
  
  const subscriptionPlans = {
    free: { name: "Free", quotesLimit: 5, price: 0 },
    pro: { name: "Pro", quotesLimit: 500, price: 5 },
    business: { name: "Business", quotesLimit: 2000, price: 35 },
    enterprise: { name: "Enterprise", quotesLimit: 10000, price: 95 }
  };

  const copyEmbedCode = (embedUrl: string) => {
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "Paste this code on your website to add the calculator.",
    });
  };

  const previewCalculator = (calc: UserCalculator) => {
    // Open calculator preview in new tab
    const previewUrl = `/wedding-photography-calculator`; // Route to actual calculator
    window.open(previewUrl, '_blank');
  };

  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<UserCalculator | null>(null);
  
  // Font library options
  const fontOptions = [
    "Inter", "Lato", "Montserrat", "Playfair Display", "Poppins", "Roboto", "Roboto Slab",
    "Open Sans", "Source Sans Pro", "Merriweather", "Raleway", "Oswald", "Nunito", "DM Sans",
    "Quicksand", "Work Sans", "Abril Fatface", "Mulish", "Libre Baskerville", "Cormorant Garamond"
  ];

  // Default customization config for new calculator instances
  const defaultConfig = {
    userId: "demo-user",
    calculatorId: "wedding-photography",
    instanceId: "",
    branding: {
      primaryColor: "#38bdf8",
      accentColor: "#facc15", 
      fontFamily: "Poppins",
      fontSize: "medium",
      roundedCorners: 12,
      logoUrl: "",
      logoSize: 48
    },
    appearance: {
      background: "gradient",
      darkMode: false,
      backgroundImage: "",
      theme: "modern",
      cardStyle: "elevated",
      layout: "stepped"
    },
    text: {
      headline: "Get Your Wedding Quote",
      subheading: "Tell us about your special day", 
      ctaText: "See My Price",
      footerNote: "*Final pricing depends on confirmation."
    },
    functionality: {
      showEmailCapture: true,
      enableQuoteLock: true,
      enablePdfDownload: true,
      ctaUrl: ""
    },
    quoteLogic: {
      baseRate: 1200,
      addOns: {
        "engagementSession": 300,
        "extraHours": 150,
        "albumUpgrade": 400
      },
      discounts: {
        "earlyBooking": 0.10,
        "offSeason": 0.15
      }
    },
    questions: [
      {
        id: "duration",
        label: "Event Duration",
        type: "dropdown",
        options: ["Half Day (4 hours)", "Full Day (8 hours)", "Two Days"],
        required: true
      },
      {
        id: "guests",
        label: "Number of Guests",
        type: "number",
        min: 10,
        max: 500,
        required: true
      },
      {
        id: "location",
        label: "Event Location",
        type: "dropdown",
        options: ["Local (within 30 miles)", "Regional (30-100 miles)", "Destination (100+ miles)"],
        required: true
      }
    ]
  };

  const [customConfig, setCustomConfig] = useState(defaultConfig);

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    // Load existing config if available, otherwise use defaults
    const existingConfig = calc.config || defaultConfig;
    setCustomConfig(existingConfig);
    setShowCustomizeModal(true);
  };

  const saveCustomization = () => {
    if (selectedCalculator) {
      // Update the calculator's config
      setDemoCalculators(prev => 
        prev.map(calc => 
          calc.id === selectedCalculator.id 
            ? { ...calc, config: customConfig }
            : calc
        )
      );
      
      toast({
        title: "Settings Saved!",
        description: "Your calculator customization has been updated.",
      });
      setShowCustomizeModal(false);
    }
  };

  const resetToDefaults = () => {
    setCustomConfig(defaultConfig);
    toast({
      title: "Reset to Defaults",
      description: "All customization settings have been restored.",
    });
  };

  const createNewCalculator = () => {
    setShowCalculatorModal(true);
  };

  const addCalculatorMutation = useMutation({
    mutationFn: async (calculator: any) => {
      // Create a unique instance for this user
      const instanceId = `calc-${Date.now()}`;
      const clonedConfig = {
        ...defaultConfig,
        calculatorId: calculator.slug,
        instanceId: instanceId,
        text: {
          headline: `Get Your ${calculator.name} Quote`,
          subheading: "Tell us about your project needs",
          ctaText: "Calculate My Price",
          footerNote: "*Final pricing depends on project details."
        }
      };
      
      const newCalculator = {
        id: instanceId,
        embedId: `qk-${calculator.slug}-${instanceId}`,
        embedUrl: `https://quotekit.ai/embed/${instanceId}`,
        adminUrl: `https://quotekit.ai/admin/${instanceId}`,
        calculatorId: calculator.id,
        config: clonedConfig,
        customBranding: { companyName: "Your Business" },
        isActive: true
      };
      
      // Update local state immediately
      setDemoCalculators(prev => [...prev, newCalculator]);
      
      return newCalculator;
    },
    onSuccess: (newCalculator) => {
      toast({
        title: "Calculator Cloned!",
        description: `Your personalized calculator instance has been created.`,
      });
      setShowCalculatorModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create calculator instance. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddCalculator = (calculator: any) => {
    addCalculatorMutation.mutate(calculator);
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await apiRequest('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          calculatorSlug: 'wedding-photography'
        }),
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  const quotesPercentage = Math.round((user.quotesUsedThisMonth / user.quotesLimit) * 100);
  const currentPlan = subscriptionPlans?.[user.subscriptionStatus];

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Test Auth Component - Remove after testing */}
        <TestAuth />
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400">
            Manage your quote calculators and track your business growth
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Quotes This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {user.quotesUsedThisMonth}/{user.quotesLimit}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-neon-400" />
                </div>
                <Progress value={quotesPercentage} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Calculators</p>
                    <p className="text-2xl font-bold text-white">
                      {userCalculators?.length || 0}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Plan</p>
                    <p className="text-2xl font-bold text-white capitalize">
                      {user.subscriptionStatus}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Calculators */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Your Calculators
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={createNewCalculator}
                      className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and customize your quote calculators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatorsLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading calculators...</div>
                  ) : userCalculators?.length > 0 ? (
                    <div className="space-y-4">
                      {userCalculators.map((calc: UserCalculator) => (
                        <div key={calc.id} className="bg-midnight-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Calculator #{calc.calculatorId}</h3>
                            <Badge variant={calc.isActive ? "default" : "secondary"}>
                              {calc.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewCalculator(calc)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => customizeCalculator(calc)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyEmbedCode(calc.embedUrl)}
                              className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Embed Code
                            </Button>
                          </div>
                          
                          <p className="text-sm text-gray-400">
                            Embed ID: {calc.embedId}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No calculators yet</p>
                      <Button 
                        onClick={createNewCalculator}
                        className="bg-neon-500 hover:bg-neon-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Calculator
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
                      {user.subscriptionStatus} Plan
                    </Badge>
                  </div>
                  
                  {currentPlan && (
                    <div className="text-center mb-4">
                      <p className="text-gray-400 text-sm">Monthly Price</p>
                      <p className="text-2xl font-bold text-white">
                        €{currentPlan.price}/mo
                      </p>
                    </div>
                  )}

                  {user.subscriptionStatus === 'free' ? (
                    <Button 
                      onClick={() => handleUpgrade('starter')}
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    >
                      Upgrade to Starter
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full border-midnight-600 text-gray-300">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="bg-midnight-800 border-midnight-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/features">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Features
                    </Button>
                  </Link>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Globe className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomizeModal && selectedCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-midnight-800 rounded-2xl border border-midnight-700 w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-midnight-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Customize Calculator</h2>
                  <p className="text-gray-400 mt-1">Calculator: {selectedCalculator.embedId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex h-[calc(95vh-120px)]">
              {/* Customization Panel */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-midnight-700">
                <div className="space-y-6">
                  {/* Branding Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Branding & Colors
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customConfig?.branding?.primaryColor || "#38bdf8"}
                            onChange={(e) => setCustomConfig(prev => ({
                              ...prev,
                              branding: { ...prev.branding, primaryColor: e.target.value }
                            }))}
                            className="w-10 h-8 rounded border border-midnight-600"
                          />
                          <input
                            type="text"
                            value={customConfig?.branding?.primaryColor || "#38bdf8"}
                            onChange={(e) => setCustomConfig(prev => ({
                              ...prev,
                              branding: { ...prev.branding, primaryColor: e.target.value }
                            }))}
                            className="flex-1 px-3 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customConfig?.branding?.accentColor || "#facc15"}
                            onChange={(e) => setCustomConfig(prev => ({
                              ...prev,
                              branding: { ...prev.branding, accentColor: e.target.value }
                            }))}
                            className="w-10 h-8 rounded border border-midnight-600"
                          />
                          <input
                            type="text"
                            value={customConfig?.branding?.accentColor || "#facc15"}
                            onChange={(e) => setCustomConfig(prev => ({
                              ...prev,
                              branding: { ...prev.branding, accentColor: e.target.value }
                            }))}
                            className="flex-1 px-3 py-1 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Font Family</label>
                        <select
                          value={customConfig?.branding?.fontFamily || "Poppins"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            branding: { ...prev.branding, fontFamily: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Font Size</label>
                        <select
                          value={customConfig?.branding?.fontSize || "medium"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            branding: { ...prev.branding, fontSize: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Rounded Corners: {customConfig?.branding?.roundedCorners || 12}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={customConfig?.branding?.roundedCorners || 12}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          branding: { ...prev.branding, roundedCorners: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Logo Upload</label>
                      <div className="space-y-3">
                        {customConfig?.branding?.logoUrl ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={customConfig.branding.logoUrl} 
                                alt="Logo" 
                                className="object-contain bg-white rounded border"
                                style={{ 
                                  height: `${customConfig?.branding?.logoSize || 48}px`,
                                  width: 'auto',
                                  maxWidth: '120px'
                                }}
                              />
                              <button
                                onClick={() => setCustomConfig(prev => ({
                                  ...prev,
                                  branding: { ...prev.branding, logoUrl: "" }
                                }))}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-400 block mb-2">
                                Logo Size: {customConfig?.branding?.logoSize || 48}px
                              </label>
                              <input
                                type="range"
                                min="24"
                                max="120"
                                step="4"
                                value={customConfig?.branding?.logoSize || 48}
                                onChange={(e) => setCustomConfig(prev => ({
                                  ...prev,
                                  branding: { ...prev.branding, logoSize: parseInt(e.target.value) }
                                }))}
                                className="w-full accent-neon-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Small</span>
                                <span>Large</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // In production, upload to storage service
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCustomConfig(prev => ({
                                    ...prev,
                                    branding: { ...prev.branding, logoUrl: event.target?.result as string }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Text Content Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Text & Content
                    </h3>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Headline</label>
                      <input
                        type="text"
                        value={customConfig?.text?.headline || "Get Your Free Estimate"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          text: { ...prev.text, headline: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Get Your Free Estimate"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Subheading</label>
                      <input
                        type="text"
                        value={customConfig?.text?.subheading || "Just answer a few quick questions"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          text: { ...prev.text, subheading: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Just answer a few quick questions"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Button Text</label>
                      <input
                        type="text"
                        value={customConfig?.text?.ctaText || "Calculate Now"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          text: { ...prev.text, ctaText: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="Calculate Now"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Footer Note</label>
                      <input
                        type="text"
                        value={customConfig?.text?.footerNote || "*All quotes are subject to confirmation."}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          text: { ...prev.text, footerNote: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="*All quotes are subject to confirmation."
                      />
                    </div>
                  </div>

                  {/* Functionality Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Functionality
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Email Capture</span>
                        <input
                          type="checkbox"
                          checked={customConfig?.functionality?.showEmailCapture || true}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            functionality: { ...prev.functionality, showEmailCapture: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Quote Lock Timer</span>
                        <input
                          type="checkbox"
                          checked={customConfig?.functionality?.enableQuoteLock || true}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            functionality: { ...prev.functionality, enableQuoteLock: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">PDF Download</span>
                        <input
                          type="checkbox"
                          checked={customConfig?.functionality?.enablePdfDownload || true}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            functionality: { ...prev.functionality, enablePdfDownload: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Custom CTA URL</label>
                      <input
                        type="url"
                        value={customConfig?.functionality?.ctaUrl || ""}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          functionality: { ...prev.functionality, ctaUrl: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        placeholder="https://yourdomain.com/book"
                      />
                    </div>
                  </div>

                  {/* Question Management Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Question Management
                    </h3>
                    
                    <div className="space-y-3">
                      {customConfig?.questions?.map((question, index) => (
                        <div key={question.id} className="p-4 bg-midnight-700 rounded border border-midnight-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">Question {index + 1}</span>
                            <button
                              onClick={() => {
                                const newQuestions = customConfig.questions.filter((_, i) => i !== index);
                                setCustomConfig(prev => ({ ...prev, questions: newQuestions }));
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-xs text-gray-300 block mb-1">Label</label>
                              <input
                                type="text"
                                value={question.label}
                                onChange={(e) => {
                                  const newQuestions = [...customConfig.questions];
                                  newQuestions[index] = { ...question, label: e.target.value };
                                  setCustomConfig(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-300 block mb-1">Type</label>
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const newQuestions = [...customConfig.questions];
                                  newQuestions[index] = { ...question, type: e.target.value };
                                  setCustomConfig(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                              >
                                <option value="dropdown">Dropdown</option>
                                <option value="number">Number</option>
                                <option value="text">Text</option>
                                <option value="radio">Radio Buttons</option>
                              </select>
                            </div>
                          </div>
                          
                          {question.type === 'dropdown' && (
                            <div>
                              <label className="text-xs text-gray-300 block mb-1">Options (one per line)</label>
                              <textarea
                                value={question.options?.join('\n') || ''}
                                onChange={(e) => {
                                  const newQuestions = [...customConfig.questions];
                                  newQuestions[index] = { 
                                    ...question, 
                                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                  };
                                  setCustomConfig(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="w-full px-2 py-1 bg-midnight-800 border border-midnight-500 rounded text-white text-sm"
                                rows={3}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button
                        onClick={() => {
                          const newQuestion = {
                            id: `question-${Date.now()}`,
                            label: "New Question",
                            type: "dropdown",
                            options: ["Option 1", "Option 2"],
                            required: true
                          };
                          setCustomConfig(prev => ({ 
                            ...prev, 
                            questions: [...(prev.questions || []), newQuestion] 
                          }));
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>

                  {/* Pricing Logic Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing Logic
                    </h3>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Base Rate ($)</label>
                      <input
                        type="number"
                        value={customConfig?.quoteLogic?.baseRate || 1200}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          quoteLogic: { ...prev.quoteLogic, baseRate: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Add-ons (JSON format)</label>
                      <textarea
                        value={JSON.stringify(customConfig?.quoteLogic?.addOns || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const addOns = JSON.parse(e.target.value);
                            setCustomConfig(prev => ({
                              ...prev,
                              quoteLogic: { ...prev.quoteLogic, addOns }
                            }));
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white font-mono text-sm"
                        rows={4}
                        placeholder='{"extraHours": 150, "albumUpgrade": 400}'
                      />
                    </div>
                  </div>

                  {/* Appearance Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Theme & Layout
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Theme Design</label>
                        <select
                          value={customConfig?.appearance?.theme || "modern"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="modern">Modern Dark</option>
                          <option value="minimal">Clean Minimal</option>
                          <option value="gradient">Gradient Blue</option>
                          <option value="professional">Professional</option>
                          <option value="creative">Creative Bright</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Card Style</label>
                        <select
                          value={customConfig?.appearance?.cardStyle || "elevated"}
                          onChange={(e) => setCustomConfig(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, cardStyle: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                        >
                          <option value="elevated">Elevated Shadow</option>
                          <option value="outlined">Outlined Border</option>
                          <option value="filled">Filled Background</option>
                          <option value="glass">Glass Effect</option>
                          <option value="minimal">Minimal Lines</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Layout Style</label>
                      <select
                        value={customConfig?.appearance?.layout || "stepped"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, layout: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                      >
                        <option value="stepped">Step Progress</option>
                        <option value="single">Single Page</option>
                        <option value="sidebar">Side Navigation</option>
                        <option value="wizard">Wizard Flow</option>
                        <option value="accordion">Accordion Style</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">Background Type</label>
                      <select
                        value={customConfig?.appearance?.background || "gradient"}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, background: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-midnight-700 border border-midnight-600 rounded text-white"
                      >
                        <option value="solid">Solid Color</option>
                        <option value="gradient">Gradient</option>
                        <option value="image">Background Image</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Dark Mode</span>
                      <input
                        type="checkbox"
                        checked={customConfig?.appearance?.darkMode || false}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, darkMode: e.target.checked }
                        }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-1/2 p-6 bg-midnight-900">
                <div className="h-full">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Live Preview
                  </h3>
                  
                  <div className="rounded-lg h-[calc(100%-60px)] overflow-auto">
                    {/* Dynamic Theme Rendering */}
                    {(() => {
                      const theme = customConfig?.appearance?.theme || 'modern';
                      const cardStyle = customConfig?.appearance?.cardStyle || 'elevated';
                      const layout = customConfig?.appearance?.layout || 'stepped';
                      
                      // Theme-specific background and container styles
                      const getThemeStyles = () => {
                        switch(theme) {
                          case 'modern':
                            return {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              containerClass: 'bg-gray-800 text-white',
                              cardClass: cardStyle === 'elevated' ? 'bg-gray-700 shadow-xl' : 
                                         cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20' :
                                         cardStyle === 'outlined' ? 'bg-transparent border-2 border-gray-600' :
                                         cardStyle === 'filled' ? 'bg-gray-600' : 'bg-gray-700 border border-gray-600'
                            };
                          case 'minimal':
                            return {
                              background: '#f8fafc',
                              containerClass: 'bg-white text-gray-900',
                              cardClass: cardStyle === 'elevated' ? 'bg-white shadow-lg border' : 
                                         cardStyle === 'glass' ? 'bg-gray-50/80 border' :
                                         cardStyle === 'outlined' ? 'bg-transparent border-2 border-gray-200' :
                                         cardStyle === 'filled' ? 'bg-gray-50' : 'bg-white border border-gray-200'
                            };
                          case 'gradient':
                            return {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              containerClass: 'text-white',
                              cardClass: cardStyle === 'elevated' ? 'bg-white/15 backdrop-blur-md shadow-2xl border border-white/20' : 
                                         cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-lg border border-white/30' :
                                         cardStyle === 'outlined' ? 'bg-transparent border-2 border-white/40' :
                                         cardStyle === 'filled' ? 'bg-white/20' : 'bg-white/15 border border-white/30'
                            };
                          case 'professional':
                            return {
                              background: '#1e293b',
                              containerClass: 'bg-slate-800 text-white',
                              cardClass: cardStyle === 'elevated' ? 'bg-slate-700 shadow-xl border border-slate-600' : 
                                         cardStyle === 'glass' ? 'bg-white/5 backdrop-blur-sm border border-slate-600' :
                                         cardStyle === 'outlined' ? 'bg-transparent border-2 border-slate-500' :
                                         cardStyle === 'filled' ? 'bg-slate-600' : 'bg-slate-700 border border-slate-600'
                            };
                          case 'creative':
                            return {
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
                              containerClass: 'text-white',
                              cardClass: cardStyle === 'elevated' ? 'bg-white/20 backdrop-blur-md shadow-2xl border border-white/30' : 
                                         cardStyle === 'glass' ? 'bg-white/15 backdrop-blur-lg border border-white/40' :
                                         cardStyle === 'outlined' ? 'bg-transparent border-2 border-white/50' :
                                         cardStyle === 'filled' ? 'bg-white/25' : 'bg-white/20 border border-white/40'
                            };
                          default:
                            return {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              containerClass: 'bg-gray-800 text-white',
                              cardClass: 'bg-gray-700 shadow-xl'
                            };
                        }
                      };
                      
                      const themeStyles = getThemeStyles();
                      
                      return (
                        <div 
                          className="h-full rounded-lg p-6"
                          style={{ 
                            background: themeStyles.background,
                            fontFamily: customConfig?.branding?.fontFamily || 'Poppins'
                          }}
                        >
                          <div className={`max-w-2xl mx-auto h-full ${themeStyles.containerClass} rounded-xl p-6`}>
                            {/* Progress Steps for Stepped Layout */}
                            {layout === 'stepped' && (
                              <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center space-x-4">
                                  {[1, 2, 3, 4].map((step, index) => (
                                    <div key={step} className="flex items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-cyan-500 text-white' : 
                                        theme === 'minimal' ? 'bg-gray-200 text-gray-600' : 'bg-white/20 text-white/60'
                                      }`}>
                                        {step}
                                      </div>
                                      {index < 3 && (
                                        <div className={`w-8 h-0.5 ${theme === 'minimal' ? 'bg-gray-300' : 'bg-white/30'}`} />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Logo Display */}
                            {customConfig?.branding?.logoUrl && (
                              <div className="flex justify-center mb-6">
                                <img 
                                  src={customConfig.branding.logoUrl} 
                                  alt="Company Logo" 
                                  className="object-contain"
                                  style={{
                                    height: `${customConfig?.branding?.logoSize || 48}px`,
                                    width: 'auto',
                                    maxWidth: '200px'
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Header Content */}
                            <div className="text-center mb-8">
                              <h1 
                                className="text-3xl font-bold mb-3"
                                style={{ color: customConfig?.branding?.primaryColor || (theme === 'minimal' ? '#1f2937' : '#ffffff') }}
                              >
                                {customConfig?.text?.headline || "Your Drone Quote"}
                              </h1>
                              <p className={`text-lg ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                                {customConfig?.text?.subheading || "Get a custom quote based on your project requirements"}
                              </p>
                            </div>
                            
                            {/* Main Content Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Questions Panel */}
                              <div className="lg:col-span-2 space-y-4">
                                {customConfig?.questions?.slice(0, 3).map((question, index) => (
                                  <div key={question.id} className={`p-6 rounded-xl ${themeStyles.cardClass}`}>
                                    <label className={`block text-sm font-semibold mb-3 ${theme === 'minimal' ? 'text-gray-700' : 'text-white/90'}`}>
                                      {question.label} {question.required && <span className="text-red-400">*</span>}
                                    </label>
                                    
                                    {question.type === 'dropdown' && (
                                      <>
                                        {layout === 'stepped' && question.options ? (
                                          <div className="grid grid-cols-2 gap-3">
                                            {question.options.slice(0, 4).map((option, optIndex) => (
                                              <button
                                                key={optIndex}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                  optIndex === 0 ? 
                                                    'border-cyan-400 bg-cyan-400/10' : 
                                                    theme === 'minimal' ? 'border-gray-200 hover:border-gray-400' : 'border-white/20 hover:border-white/40'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className={`font-medium ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}>
                                                    {option}
                                                  </span>
                                                  {optIndex === 0 && <span className="text-cyan-400 text-xs">Popular</span>}
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        ) : (
                                          <select className={`w-full p-3 rounded-lg border ${
                                            theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white'
                                          }`}>
                                            <option>Select an option...</option>
                                            {question.options?.map((option, optIndex) => (
                                              <option key={optIndex} value={option}>{option}</option>
                                            ))}
                                          </select>
                                        )}
                                      </>
                                    )}
                                    
                                    {question.type === 'number' && (
                                      <input 
                                        type="number"
                                        min={question.min || 0}
                                        max={question.max || 1000}
                                        placeholder="Enter amount"
                                        className={`w-full p-3 rounded-lg border ${
                                          theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white placeholder-white/60'
                                        }`}
                                      />
                                    )}
                                    
                                    {question.type === 'text' && (
                                      <textarea 
                                        placeholder="Describe your project in detail..."
                                        rows={3}
                                        className={`w-full p-3 rounded-lg border resize-none ${
                                          theme === 'minimal' ? 'border-gray-300 bg-white text-gray-900' : 'border-white/20 bg-white/10 text-white placeholder-white/60'
                                        }`}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Quote Summary Panel */}
                              <div className={`p-6 rounded-xl ${themeStyles.cardClass} h-fit`}>
                                <h3 className={`text-xl font-bold mb-4 ${theme === 'minimal' ? 'text-gray-800' : 'text-white'}`}>
                                  Your Quote Summary
                                </h3>
                                
                                <div className="space-y-3 mb-6">
                                  <div className={`flex justify-between ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                                    <span>Base service</span>
                                    <span>€500</span>
                                  </div>
                                  <div className={`flex justify-between ${theme === 'minimal' ? 'text-gray-600' : 'text-white/80'}`}>
                                    <span>Additional options</span>
                                    <span>€200</span>
                                  </div>
                                  <hr className={theme === 'minimal' ? 'border-gray-200' : 'border-white/20'} />
                                  <div className={`flex justify-between text-xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-white'}`}>
                                    <span>Total</span>
                                    <span style={{ color: customConfig?.branding?.primaryColor || '#22d3ee' }}>€700.00</span>
                                  </div>
                                </div>
                                
                                <button 
                                  className="w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105"
                                  style={{ 
                                    backgroundColor: customConfig?.branding?.primaryColor || '#22d3ee',
                                    boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                                  }}
                                >
                                  {customConfig?.text?.ctaText || "Book My Flight"}
                                </button>
                                
                                <p className={`text-xs text-center mt-3 ${theme === 'minimal' ? 'text-gray-500' : 'text-white/60'}`}>
                                  This quote is valid for 72 hours
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
                            )}
                          </div>
                        ))}
                        
                        {/* Email Capture if Enabled */}
                        {customConfig?.functionality?.showEmailCapture && (
                          <div className="p-4 border rounded" style={{ borderRadius: `${customConfig?.branding?.roundedCorners || 12}px` }}>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input 
                              type="email" 
                              placeholder="your@email.com"
                              className="w-full p-2 border rounded" 
                              style={{ borderRadius: `${customConfig?.branding?.roundedCorners || 12}px` }}
                            />
                          </div>
                        )}
                        
                        {/* Pricing Display */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded" style={{ borderRadius: `${customConfig?.branding?.roundedCorners || 12}px` }}>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">Estimated Price</div>
                            <div className="text-3xl font-bold" style={{ color: customConfig?.branding?.primaryColor || "#38bdf8" }}>
                              ${customConfig?.quoteLogic?.baseRate || 1200}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Base rate • Additional options may apply</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mb-4">
                        <button 
                          className="px-6 py-3 text-white font-semibold rounded shadow-lg"
                          style={{ 
                            backgroundColor: customConfig?.branding?.primaryColor || "#38bdf8",
                            borderRadius: `${customConfig?.branding?.roundedCorners || 12}px`
                          }}
                        >
                          {customConfig?.text?.ctaText || "Calculate Now"}
                        </button>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">
                        {customConfig?.text?.footerNote || "*All quotes are subject to confirmation."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-midnight-700 p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                >
                  Reset to Defaults
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomizeModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Create duplicate calculator instance
                      if (selectedCalculator) {
                        const duplicatedConfig = {
                          ...customConfig,
                          instanceId: `calc-${Date.now()}-copy`,
                          text: {
                            ...customConfig.text,
                            headline: `${customConfig.text.headline} (Copy)`
                          }
                        };
                        
                        const newCalculator = {
                          id: duplicatedConfig.instanceId,
                          embedId: `qk-${duplicatedConfig.calculatorId}-${duplicatedConfig.instanceId}`,
                          embedUrl: `https://quotekit.ai/embed/${duplicatedConfig.instanceId}`,
                          adminUrl: `https://quotekit.ai/admin/${duplicatedConfig.instanceId}`,
                          calculatorId: selectedCalculator.calculatorId,
                          config: duplicatedConfig,
                          customBranding: duplicatedConfig.branding,
                          isActive: true
                        };
                        
                        setDemoCalculators(prev => [...prev, newCalculator]);
                        
                        toast({
                          title: "Calculator Duplicated!",
                          description: "A new personalized instance has been created.",
                        });
                      }
                    }}
                    variant="outline"
                    className="border-neon-500 text-neon-500 hover:bg-neon-500/20 mr-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Instance
                  </Button>
                  <Button
                    onClick={saveCustomization}
                    className="bg-neon-500 hover:bg-neon-600 text-black"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Instance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Selection Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-midnight-800 rounded-2xl border border-midnight-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-midnight-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Add Calculator</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalculatorModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white focus:outline-none focus:border-neon-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculator Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalculators.map(calculator => {
                  const IconComponent = calculator.icon;
                  return (
                    <motion.div
                      key={calculator.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-midnight-700 rounded-xl border border-midnight-600 p-4 cursor-pointer hover:border-neon-500/50 transition-all"
                      onClick={() => handleAddCalculator(calculator)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate">
                            {calculator.name}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2">
                            {calculator.category}
                          </p>
                          <Button
                            size="sm"
                            className="bg-neon-500 hover:bg-neon-600 text-black text-xs h-6 px-2"
                            disabled={addCalculatorMutation.isPending}
                          >
                            {addCalculatorMutation.isPending ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {filteredCalculators.length === 0 && (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No calculators found matching your search.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-midnight-700 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {filteredCalculators.length} of {allCalculators.length} calculators
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowCalculatorModal(false)}
                  className="border-midnight-600 text-gray-300 hover:bg-midnight-600"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}