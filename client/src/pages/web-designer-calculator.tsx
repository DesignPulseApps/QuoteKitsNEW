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
  Code, 
  Globe,
  Layers,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Download,
  Mail,
  Timer,
  Palette,
  Monitor,
  Search,
  ShoppingCart,
  Calendar,
  FileText,
  Zap
} from "lucide-react";

interface WebDesignerFormData {
  websiteType: string;
  pageCount: string;
  platform: string;
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
  pageAddCost: number;
  platformSurcharge: number;
  addOnsTotal: number;
  timelineRush: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface WebDesignerCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function WebDesignerCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: WebDesignerCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
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
  const [formData, setFormData] = useState<WebDesignerFormData>({
    websiteType: "",
    pageCount: "",
    platform: "",
    addOns: [],
    timeline: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "", company: "" }
  });

  const steps = [
    { number: 1, title: "Project Type", completed: currentStep > 1 },
    { number: 2, title: "Platform & Pages", completed: currentStep > 2 },
    { number: 3, title: "Extras & Timeline", completed: currentStep > 3 },
    { number: 4, title: "Contact & Quote", completed: quoteGenerated }
  ];

  const websiteTypes = [
    { 
      label: "Landing Page", 
      value: "landing", 
      basePrice: 600, 
      icon: <Monitor className="h-5 w-5" />,
      description: "Single focused page for campaigns",
      popular: true
    },
    { 
      label: "Portfolio Site", 
      value: "portfolio", 
      basePrice: 800, 
      icon: <Palette className="h-5 w-5" />,
      description: "Showcase work and projects"
    },
    { 
      label: "Business Website", 
      value: "business", 
      basePrice: 1200, 
      icon: <Globe className="h-5 w-5" />,
      description: "Full company presence online"
    },
    { 
      label: "Blog", 
      value: "blog", 
      basePrice: 700, 
      icon: <FileText className="h-5 w-5" />,
      description: "Content-focused publication"
    },
    { 
      label: "E-Commerce", 
      value: "ecommerce", 
      basePrice: 1500, 
      icon: <ShoppingCart className="h-5 w-5" />,
      description: "Online store with payments"
    }
  ];

  const pageCountOptions = [
    { label: "1-3 Pages", value: "1-3", multiplier: 1, icon: <Layers className="h-4 w-4" /> },
    { label: "4-6 Pages", value: "4-6", multiplier: 1.3, icon: <Layers className="h-4 w-4" />, popular: true },
    { label: "7-10 Pages", value: "7-10", multiplier: 1.7, icon: <Layers className="h-4 w-4" /> },
    { label: "10+ Pages", value: "10+", multiplier: 2.2, icon: <Layers className="h-4 w-4" /> }
  ];

  const platformOptions = [
    { label: "WordPress", value: "wordpress", surcharge: 0, icon: <Code className="h-5 w-5" /> },
    { label: "Webflow", value: "webflow", surcharge: 100, icon: <Globe className="h-5 w-5" />, popular: true },
    { label: "Squarespace", value: "squarespace", surcharge: 50, icon: <Monitor className="h-5 w-5" /> },
    { label: "Shopify", value: "shopify", surcharge: 150, icon: <ShoppingCart className="h-5 w-5" /> },
    { label: "Custom HTML", value: "custom", surcharge: 200, icon: <Code className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Logo Design", 
      value: "logo", 
      price: 200, 
      icon: <Palette className="h-4 w-4" />,
      description: "Custom brand identity design"
    },
    { 
      label: "SEO Setup", 
      value: "seo", 
      price: 120, 
      icon: <Search className="h-4 w-4" />,
      description: "Search engine optimization",
      popular: true
    },
    { 
      label: "Blog Integration", 
      value: "blog", 
      price: 150, 
      icon: <FileText className="h-4 w-4" />,
      description: "Content management system"
    },
    { 
      label: "Booking System", 
      value: "booking", 
      price: 180, 
      icon: <Calendar className="h-4 w-4" />,
      description: "Appointment scheduling"
    },
    { 
      label: "Copywriting", 
      value: "copywriting", 
      price: 100, 
      icon: <FileText className="h-4 w-4" />,
      description: "Professional content writing",
      perPage: true
    },
    { 
      label: "E-Commerce Integration", 
      value: "ecommerce", 
      price: 300, 
      icon: <ShoppingCart className="h-4 w-4" />,
      description: "Online store functionality"
    }
  ];

  const timelineOptions = [
    { label: "2 Weeks", value: "2weeks", rushFee: 0, icon: <Clock className="h-5 w-5" /> },
    { label: "1 Month", value: "1month", rushFee: 0, icon: <Clock className="h-5 w-5" />, popular: true },
    { label: "Flexible", value: "flexible", rushFee: 0, icon: <Clock className="h-5 w-5" /> },
    { label: "Urgent (7 days)", value: "urgent", rushFee: 250, icon: <Zap className="h-5 w-5" /> }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-web-designer', {
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
        websiteType: result.websiteType || prev.websiteType,
        pageCount: result.pageCount || prev.pageCount,
        platform: result.platform || prev.platform,
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
    const selectedWebsiteType = websiteTypes.find(t => t.value === formData.websiteType);
    const selectedPageCount = pageCountOptions.find(p => p.value === formData.pageCount);
    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);
    const selectedTimeline = timelineOptions.find(t => t.value === formData.timeline);
    
    const basePrice = (selectedWebsiteType?.basePrice || customConfig?.basePrice || 600) * (selectedPageCount?.multiplier || 1);
    const pageAddCost = 0; // Already included in multiplier
    const platformSurcharge = selectedPlatform?.surcharge || 0;
    const timelineRush = selectedTimeline?.rushFee || 0;
    
    // Calculate add-ons
    let addOnsTotal = 0;
    const pageMultiplier = selectedPageCount?.multiplier || 1;
    
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn) {
        if (addOn.perPage) {
          addOnsTotal += addOn.price * pageMultiplier;
        } else {
          addOnsTotal += addOn.price;
        }
      }
    });
    
    const subtotal = basePrice + pageAddCost + platformSurcharge + addOnsTotal + timelineRush;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "design10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedWebsiteType?.label || 'Website'} (${selectedPageCount?.label || '1-3 pages'}): €${basePrice.toFixed(2)}`,
      ...(platformSurcharge > 0 ? [`${selectedPlatform?.label} platform: +€${platformSurcharge.toFixed(2)}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        const addOnTotal = addOn?.perPage ? (addOn.price * pageMultiplier) : (addOn?.price || 0);
        return `${addOn?.label || 'Add-on'}: +€${addOnTotal.toFixed(2)}`;
      }),
      ...(timelineRush > 0 ? [`Rush delivery: +€${timelineRush.toFixed(2)}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 48 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 48);

    return {
      basePrice,
      pageAddCost,
      platformSurcharge,
      addOnsTotal,
      timelineRush,
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
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-gray-50 shadow-md" 
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-gray-50/30"
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
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
            Popular
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
        <p className="text-sm font-medium text-blue-600 ml-11">+€{option.price}{option.perPage ? '/page' : ''} onSave={() => {}} /></p>
      )}
      {option.surcharge > 0 && (
        <p className="text-sm font-medium text-blue-600 ml-11">+€{option.surcharge} onSave={() => {}} /></p>
      )}
      {option.rushFee > 0 && (
        <p className="text-sm font-medium text-orange-600 ml-11">+€{option.rushFee} rush fee</p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-gray-700 to-blue-600 mb-4">
            Web Design Services
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium text-lg">
            Professional website design and development. Get an instant quote for your custom web project.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Mobile-First
            </span>
            <span className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              SEO Ready
            </span>
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Fast Delivery
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

              {/* Natural Language Toggle */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Smart Fill - Describe Your Project
                  </h3>
                  <Switch
                    checked={showNaturalLanguage}
                    onCheckedChange={setShowNaturalLanguage}
                  />
                </div>
                {showNaturalLanguage && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="e.g., 'I need a Webflow portfolio with 6 pages and SEO setup' or 'Business website on WordPress with booking system'"
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
                          Fill Form
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 1: Project Type */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-600" />
                      What type of website do you need?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {websiteTypes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.websiteType === option.value}
                          onClick={() => setFormData({ ...formData, websiteType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.websiteType}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Platform & Pages */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-blue-600" />
                      How many pages will you need?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {pageCountOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.pageCount === option.value}
                          onClick={() => setFormData({ ...formData, pageCount: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" />
                      Which platform would you prefer?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {platformOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.platform === option.value}
                          onClick={() => setFormData({ ...formData, platform: option.value })}
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
                      disabled={!formData.pageCount || !formData.platform}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Extras & Timeline */}
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
                      placeholder="Enter promo code for 10% discount"
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
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-blue-600 to-gray-600 text-white p-6 rounded-2xl">
                        <Globe className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Your Web Design Quote is Ready!</h3>
                        <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your custom website quote.</p>
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
                            websiteType: "",
                            pageCount: "",
                            platform: "",
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
                  <p className="text-gray-600 text-sm">Total Project Cost</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Lockdown Timer */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Quote Valid For</span>
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
                  <Globe className="mr-2 h-5 w-5" />
                  Let's Build It
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🌐 Mobile-First • 🚀 SEO Ready • ⚡ Fast Delivery
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