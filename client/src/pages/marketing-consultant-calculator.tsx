import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  BarChart3, 
  Target,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Download,
  Mail,
  Timer,
  TrendingUp,
  Search,
  Share2,
  MessageSquare,
  Zap,
  Calendar
} from "lucide-react";

interface MarketingConsultantFormData {
  marketingGoal: string;
  serviceFocus: string;
  businessSize: string;
  engagementType: string;
  addOns: string[];
  timeline: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  businessSizeAdd: number;
  engagementAdd: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface MarketingConsultantCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function MarketingConsultantCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: MarketingConsultantCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  
  // Use the propConfig as customConfig for consistency
  const customConfig = propConfig;
  const [textConfig, setTextConfig] = useState<any>({});
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    setTextConfig(prev => ({ ...prev, [key]: value }));
    // Send update to parent if in preview mode
    if (isPreview) {
      window.parent?.postMessage({
        type: 'TEXT_UPDATE',
        key,
        value
      }, '*');
    }
  };
  const [formData, setFormData] = useState<MarketingConsultantFormData>({
    marketingGoal: "",
    serviceFocus: "",
    businessSize: "",
    engagementType: "",
    addOns: [],
    timeline: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "", company: "" }
  });

  const steps = [
    { number: 1, title: "Goals & Focus", completed: currentStep > 1 },
    { number: 2, title: "Business & Engagement", completed: currentStep > 2 },
    { number: 3, title: "Add-ons & Timeline", completed: currentStep > 3 },
    { number: 4, title: "Contact & Quote", completed: quoteGenerated }
  ];

  const marketingGoals = [
    { 
      label: "Increase Website Traffic", 
      value: "traffic", 
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Drive more qualified visitors to your site",
      popular: true
    },
    { 
      label: "Grow Social Media Audience", 
      value: "social", 
      icon: <Share2 className="h-5 w-5" />,
      description: "Build engaged followers across platforms"
    },
    { 
      label: "Launch a New Product", 
      value: "launch", 
      icon: <Zap className="h-5 w-5" />,
      description: "Create buzz and drive product adoption"
    },
    { 
      label: "Improve Branding", 
      value: "branding", 
      icon: <Target className="h-5 w-5" />,
      description: "Strengthen brand identity and positioning"
    },
    { 
      label: "Generate Leads", 
      value: "leads", 
      icon: <Users className="h-5 w-5" />,
      description: "Convert prospects into qualified leads"
    }
  ];

  const serviceFocus = [
    { label: "SEO", value: "seo", basePrice: 400, icon: <Search className="h-5 w-5" />, popular: true },
    { label: "Google Ads / PPC", value: "ppc", basePrice: 500, icon: <Target className="h-5 w-5" /> },
    { label: "Social Media Strategy", value: "social", basePrice: 450, icon: <Share2 className="h-5 w-5" /> },
    { label: "Email Marketing", value: "email", basePrice: 350, icon: <MessageSquare className="h-5 w-5" /> },
    { label: "Branding & Positioning", value: "branding", basePrice: 600, icon: <Star className="h-5 w-5" /> }
  ];

  const businessSizes = [
    { label: "Solo / Startup", value: "solo", multiplier: 1, icon: <Users className="h-4 w-4" /> },
    { label: "Small Business", value: "small", multiplier: 1.5, icon: <Users className="h-4 w-4" />, popular: true },
    { label: "Mid-size", value: "medium", multiplier: 2.25, icon: <Users className="h-4 w-4" /> },
    { label: "Enterprise", value: "enterprise", multiplier: 3.5, icon: <Users className="h-4 w-4" /> }
  ];

  const engagementTypes = [
    { label: "One-time Audit", value: "audit", multiplier: 0.8, icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Monthly Consulting", value: "monthly", multiplier: 1, icon: <Calendar className="h-5 w-5" />, popular: true },
    { label: "Full Strategy & Execution", value: "full", multiplier: 1.75, icon: <Zap className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Content Plan", 
      value: "content", 
      price: 200, 
      icon: <MessageSquare className="h-4 w-4" />,
      description: "Strategic content calendar and guidelines"
    },
    { 
      label: "Competitor Audit", 
      value: "competitor", 
      price: 150, 
      icon: <Search className="h-4 w-4" />,
      description: "In-depth competitive analysis",
      popular: true
    },
    { 
      label: "Analytics Setup", 
      value: "analytics", 
      price: 250, 
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Tracking and measurement configuration"
    },
    { 
      label: "Marketing Automation", 
      value: "automation", 
      price: 400, 
      icon: <Zap className="h-4 w-4" />,
      description: "Email sequences and lead nurturing"
    },
    { 
      label: "Social Ads Management", 
      value: "social_ads", 
      price: 350, 
      icon: <Target className="h-4 w-4" />,
      description: "Paid social media campaign setup"
    }
  ];

  const timelineOptions = [
    { label: "Immediate", value: "immediate", urgency: 1.2, icon: <Clock className="h-5 w-5" /> },
    { label: "Within a Month", value: "month", urgency: 1, icon: <Clock className="h-5 w-5" />, popular: true },
    { label: "Flexible", value: "flexible", urgency: 0.9, icon: <Clock className="h-5 w-5" /> },
    { label: "Not Sure Yet", value: "unsure", urgency: 1, icon: <Clock className="h-5 w-5" /> }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-marketing-consultant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to process AI request');
      }

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        marketingGoal: result.marketingGoal || prev.marketingGoal,
        serviceFocus: result.serviceFocus || prev.serviceFocus,
        businessSize: result.businessSize || prev.businessSize,
        engagementType: result.engagementType || prev.engagementType,
        addOns: result.addOns?.length ? result.addOns : prev.addOns,
        timeline: result.timeline || prev.timeline
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedServiceFocus = serviceFocus.find(s => s.value === formData.serviceFocus);
    const selectedBusinessSize = businessSizes.find(b => b.value === formData.businessSize);
    const selectedEngagementType = engagementTypes.find(e => e.value === formData.engagementType);
    const selectedTimeline = timelineOptions.find(t => t.value === formData.timeline);
    
    const basePrice = (selectedServiceFocus?.basePrice || customConfig?.basePrice || 400) * (selectedBusinessSize?.multiplier || 1) * (selectedEngagementType?.multiplier || 1) * (selectedTimeline?.urgency || 1);
    const businessSizeAdd = 0; // Already included in multiplier
    const engagementAdd = 0; // Already included in multiplier
    
    // Calculate add-ons
    let addOnsTotal = 0;
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn) {
        addOnsTotal += addOn.price;
      }
    });
    
    const subtotal = basePrice + businessSizeAdd + engagementAdd + addOnsTotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "market15") {
      promoDiscount = subtotal * 0.15;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedServiceFocus?.label || 'Marketing'} consulting (${selectedBusinessSize?.label || 'Solo'}): €${basePrice.toFixed(2)}`,
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +€${addOn?.price.toFixed(2) || '0.00'}`;
      }),
      ...(promoDiscount > 0 ? [`Promo discount (15%): -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 48 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 48);

    return {
      basePrice,
      businessSizeAdd,
      engagementAdd,
      addOnsTotal,
      subtotal,
      promoDiscount,
      total,
      breakdown,
      quoteExpiry
    };
  };

  const OptionCard = ({ option, selected, onClick, icon, popular = false }: {
    option: any;
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    popular?: boolean;
  }) => (
    <Card
      className={`p-4 cursor-pointer transition-all duration-300 border hover:shadow-lg ${
        selected 
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md" 
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-purple-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${selected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-medium ${selected ? "text-blue-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
            Top Choice
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-600 mb-2 ml-11"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.basePrice && (
        <p className="text-sm font-medium text-blue-600 ml-11">From €{option.basePrice} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-blue-600 ml-11">+€{option.price} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-blue-600 mb-4">
            Marketing Consulting Services
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium text-lg">
            Strategic marketing expertise to grow your business. Get a personalized quote for comprehensive marketing consulting.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Data-Driven
            </span>
            <span className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              ROI Focused
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth Oriented
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-600 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Assistant - Describe Your Marketing Needs
                  </h3>
                  <Switch
                    checked={showNaturalLanguage}
                    onCheckedChange={setShowNaturalLanguage}
                  />
                </div>
                {showNaturalLanguage && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="e.g., 'I want SEO + social media growth for my startup' or 'Need full marketing strategy for mid-size business'"
                      value={formData.naturalLanguageInput}
                      onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                      className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      rows={2}
                    />
                    <Button 
                      onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                      variant="outline" 
                      size="sm"
                      disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      {isProcessingAI ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto-Fill
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 1: Goals & Focus */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      What's your primary marketing goal?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketingGoals.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.marketingGoal === option.value}
                          onClick={() => setFormData({ ...formData, marketingGoal: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Which service area is your main focus?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serviceFocus.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.serviceFocus === option.value}
                          onClick={() => setFormData({ ...formData, serviceFocus: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.marketingGoal || !formData.serviceFocus}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Business & Engagement */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      What's your business size?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {businessSizes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.businessSize === option.value}
                          onClick={() => setFormData({ ...formData, businessSize: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      What type of engagement do you need?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {engagementTypes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.engagementType === option.value}
                          onClick={() => setFormData({ ...formData, engagementType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.businessSize || !formData.engagementType}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-600" />
                      Additional Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addOnOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.addOns.includes(option.value)}
                          onClick={() => {
                            const newAddOns = formData.addOns.includes(option.value)
                              ? formData.addOns.filter(a => a !== option.value)
                              : [...formData.addOns, option.value];
                            setFormData({ ...formData, addOns: newAddOns });
                          }}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Project Timeline
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {timelineOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.timeline === option.value}
                          onClick={() => setFormData({ ...formData, timeline: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter promo code for 15% discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="border-gray-300 focus:border-blue-600"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.timeline}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact & Quote */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Name *</label>
                        <Input
                          placeholder="Your name"
                          value={formData.contactInfo.name}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, name: e.target.value }
                          })}
                          className="border-gray-300 focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.contactInfo.email}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, email: e.target.value }
                          })}
                          className="border-gray-300 focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone</label>
                        <Input
                          placeholder="Phone number"
                          value={formData.contactInfo.phone}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, phone: e.target.value }
                          })}
                          className="border-gray-300 focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Company</label>
                        <Input
                          placeholder="Company name (optional)"
                          value={formData.contactInfo.company}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, company: e.target.value }
                          })}
                          className="border-gray-300 focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {!quoteGenerated ? (
                    <div className="flex justify-between">
                      <Button
                        onClick={() => setCurrentStep(3)}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setQuoteGenerated(true)}
                        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                      >
                        Generate Quote
                        <BarChart3 className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Your Marketing Quote is Ready!</h3>
                        <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your customized marketing strategy quote.</p>
                        <div className="mt-4 p-3 bg-white/20 rounded-lg">
                          <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4">
                          <Download className="mr-2 h-5 w-5" />
                          Download PDF Quote
                        </Button>
                        <Button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4">
                          <Mail className="mr-2 h-5 w-5" />
                          Email Quote
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          setCurrentStep(1);
                          setQuoteGenerated(false);
                          setFormData({
                            marketingGoal: "",
                            serviceFocus: "",
                            businessSize: "",
                            engagementType: "",
                            addOns: [],
                            timeline: "",
                            promoCode: "",
                            naturalLanguageInput: "",
                            contactInfo: { name: "", email: "", phone: "", company: "" }
                          });
                        }}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Create New Quote
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-sm">Total Investment</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Validity Timer */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Quote Locked For</span>
                  </div>
                  <div className="text-center text-xs text-blue-600">
                    48 hours from generation
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-gray-800 font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Discovery Call
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    📊 Data-Driven • 🎯 ROI Focused • 📈 Growth Oriented
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}