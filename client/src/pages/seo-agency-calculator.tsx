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
  Search, 
  TrendingUp,
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
  BarChart3,
  FileText,
  Link,
  Zap,
  MapPin,
  Globe,
  Gauge
} from "lucide-react";

interface SEOAgencyFormData {
  primaryGoal: string;
  websiteSize: string;
  technicalAudit: boolean;
  blogPlan: string;
  backlinkCampaign: string;
  addOns: string[];
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  websiteSizeAdd: number;
  auditAdd: number;
  blogAdd: number;
  backlinkAdd: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface SEOAgencyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function SEOAgencyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: SEOAgencyCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<SEOAgencyFormData>({
    primaryGoal: "",
    websiteSize: "",
    technicalAudit: false,
    blogPlan: "",
    backlinkCampaign: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "", website: "" }
  });

  const steps = [
    { number: 1, title: "SEO Goals & Website", completed: currentStep > 1 },
    { number: 2, title: "Services & Content", completed: currentStep > 2 },
    { number: 3, title: "Add-ons & Promo", completed: currentStep > 3 },
    { number: 4, title: "Contact & Quote", completed: quoteGenerated }
  ];

  const primaryGoals = [
    { 
      label: "Rank Higher on Google", 
      value: "ranking", 
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Improve organic search rankings",
      basePrice: 400,
      popular: true
    },
    { 
      label: "Local SEO (Maps & Reviews)", 
      value: "local", 
      icon: <MapPin className="h-5 w-5" />,
      description: "Dominate local search results",
      basePrice: 450
    },
    { 
      label: "Improve Core Web Vitals", 
      value: "vitals", 
      icon: <Gauge className="h-5 w-5" />,
      description: "Optimize site speed and performance",
      basePrice: 350
    },
    { 
      label: "Keyword Strategy & Blog Content", 
      value: "content", 
      icon: <FileText className="h-5 w-5" />,
      description: "Content-driven SEO approach",
      basePrice: 500
    },
    { 
      label: "E-commerce SEO", 
      value: "ecommerce", 
      icon: <Globe className="h-5 w-5" />,
      description: "Product and category optimization",
      basePrice: 600
    }
  ];

  const websiteSizes = [
    { label: "1-5 Pages", value: "small", multiplier: 1, icon: <FileText className="h-4 w-4" /> },
    { label: "6-15 Pages", value: "medium", multiplier: 1.3, icon: <FileText className="h-4 w-4" />, popular: true },
    { label: "16-30 Pages", value: "large", multiplier: 1.7, icon: <FileText className="h-4 w-4" /> },
    { label: "30+ Pages", value: "enterprise", multiplier: 2.2, icon: <FileText className="h-4 w-4" /> }
  ];

  const blogPlans = [
    { label: "No Blogging", value: "0", price: 0, icon: <FileText className="h-5 w-5" /> },
    { label: "2 Blogs/Month", value: "2", price: 200, icon: <FileText className="h-5 w-5" />, popular: true },
    { label: "4 Blogs/Month", value: "4", price: 400, icon: <FileText className="h-5 w-5" /> },
    { label: "8 Blogs/Month", value: "8", price: 800, icon: <FileText className="h-5 w-5" /> }
  ];

  const backlinkCampaigns = [
    { label: "No Backlinks", value: "none", price: 0, icon: <Link className="h-5 w-5" /> },
    { label: "Basic (5 links/mo)", value: "basic", price: 150, icon: <Link className="h-5 w-5" /> },
    { label: "Pro (10 links/mo)", value: "pro", price: 250, icon: <Link className="h-5 w-5" />, popular: true },
    { label: "Premium (20+ links/mo)", value: "premium", price: 400, icon: <Link className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Competitor Analysis", 
      value: "competitor", 
      price: 150, 
      icon: <Search className="h-4 w-4" />,
      description: "In-depth competitive research",
      popular: true
    },
    { 
      label: "Keyword Research Pack", 
      value: "keywords", 
      price: 100, 
      icon: <Target className="h-4 w-4" />,
      description: "Comprehensive keyword mapping"
    },
    { 
      label: "Site Speed Optimization", 
      value: "speed", 
      price: 200, 
      icon: <Zap className="h-4 w-4" />,
      description: "Technical performance improvements"
    },
    { 
      label: "Monthly Reporting", 
      value: "reporting", 
      price: 75, 
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Detailed progress reports"
    },
    { 
      label: "Landing Page Optimization", 
      value: "landing", 
      price: 250, 
      icon: <Target className="h-4 w-4" />,
      description: "Conversion-focused page optimization"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-seo-agency', {
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
        primaryGoal: result.primaryGoal || prev.primaryGoal,
        websiteSize: result.websiteSize || prev.websiteSize,
        technicalAudit: result.technicalAudit !== undefined ? result.technicalAudit : prev.technicalAudit,
        blogPlan: result.blogPlan || prev.blogPlan,
        backlinkCampaign: result.backlinkCampaign || prev.backlinkCampaign,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedGoal = primaryGoals.find(g => g.value === formData.primaryGoal);
    const selectedWebsiteSize = websiteSizes.find(w => w.value === formData.websiteSize);
    const selectedBlogPlan = blogPlans.find(b => b.value === formData.blogPlan);
    const selectedBacklinkCampaign = backlinkCampaigns.find(b => b.value === formData.backlinkCampaign);
    
    const basePrice = (selectedGoal?.basePrice || customConfig?.basePrice || 400) * (selectedWebsiteSize?.multiplier || 1);
    const websiteSizeAdd = 0; // Already included in multiplier
    const auditAdd = formData.technicalAudit ? 150 : 0;
    const blogAdd = selectedBlogPlan?.price || 0;
    const backlinkAdd = selectedBacklinkCampaign?.price || 0;
    
    // Calculate add-ons
    let addOnsTotal = 0;
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn) {
        addOnsTotal += addOn.price;
      }
    });
    
    const subtotal = basePrice + websiteSizeAdd + auditAdd + blogAdd + backlinkAdd + addOnsTotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "seo10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedGoal?.label || 'SEO Service'} (${selectedWebsiteSize?.label || '1-5 pages'}): €${basePrice.toFixed(2)}`,
      ...(formData.technicalAudit ? [`Technical SEO audit: +€${auditAdd.toFixed(2)}`] : []),
      ...(blogAdd > 0 ? [`Blog content (${formData.blogPlan} posts/month): +€${blogAdd.toFixed(2)}`] : []),
      ...(backlinkAdd > 0 ? [`Backlink campaign (${selectedBacklinkCampaign?.label}): +€${backlinkAdd.toFixed(2)}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +€${addOn?.price.toFixed(2) || '0.00'}`;
      }),
      ...(promoDiscount > 0 ? [`Promo discount (10%): -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 72 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 72);

    return {
      basePrice,
      websiteSizeAdd,
      auditAdd,
      blogAdd,
      backlinkAdd,
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
          ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 shadow-md" 
          : "border-gray-200 hover:border-green-300 bg-white hover:bg-gradient-to-br hover:from-green-50/30 hover:to-blue-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${selected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-medium ${selected ? "text-green-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-600 mb-2 ml-11"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.basePrice && (
        <p className="text-sm font-medium text-green-600 ml-11">From €{option.basePrice} onSave={() => {}} /></p>
      )}
      {option.price !== undefined && option.price > 0 && (
        <p className="text-sm font-medium text-green-600 ml-11">+€{option.price} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-blue-50/30">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-blue-700 to-green-600 mb-4">
            SEO Agency Services
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium text-lg">
            Professional SEO services to boost your search rankings and drive organic traffic. Get a customized quote for your project.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-green-700">
            <span className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Organic Growth
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Proven Results
            </span>
            <span className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Data-Driven
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
                          ? "bg-green-600 text-white"
                          : currentStep === step.number
                          ? "bg-green-500 text-white"
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
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Assistant - Describe Your SEO Needs
                  </h3>
                  <Switch
                    checked={showNaturalLanguage}
                    onCheckedChange={setShowNaturalLanguage}
                  />
                </div>
                {showNaturalLanguage && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="e.g., 'I want to rank my ecom store and get backlinks + 4 blogs monthly' or 'Need local SEO for my restaurant'"
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
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
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

              {/* Step 1: SEO Goals & Website */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      What's your primary SEO goal?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {primaryGoals.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.primaryGoal === option.value}
                          onClick={() => setFormData({ ...formData, primaryGoal: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Website size
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {websiteSizes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.websiteSize === option.value}
                          onClick={() => setFormData({ ...formData, websiteSize: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.primaryGoal || !formData.websiteSize}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Services & Content */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Search className="h-5 w-5 mr-2 text-green-600" />
                      Technical SEO audit
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-300 border ${
                          formData.technicalAudit 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 hover:border-green-300 bg-white"
                        }`}
                        onClick={() => setFormData({ ...formData, technicalAudit: true })}
                      >
                        <div className="text-center">
                          <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${formData.technicalAudit ? "text-green-600" : "text-gray-400"}`} />
                          <p className="font-medium">Yes (+€150)</p>
                          <p className="text-sm text-gray-600">Comprehensive site audit</p>
                        </div>
                      </Card>
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-300 border ${
                          !formData.technicalAudit 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 hover:border-green-300 bg-white"
                        }`}
                        onClick={() => setFormData({ ...formData, technicalAudit: false })}
                      >
                        <div className="text-center">
                          <span className={`text-2xl mb-2 block ${!formData.technicalAudit ? "text-green-600" : "text-gray-400"}`}>✗</span>
                          <p className="font-medium">No audit needed</p>
                          <p className="text-sm text-gray-600">Skip technical audit</p>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Monthly blogging plan
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {blogPlans.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.blogPlan === option.value}
                          onClick={() => setFormData({ ...formData, blogPlan: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Link className="h-5 w-5 mr-2 text-green-600" />
                      Backlink campaign
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {backlinkCampaigns.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.backlinkCampaign === option.value}
                          onClick={() => setFormData({ ...formData, backlinkCampaign: option.value })}
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
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.blogPlan || !formData.backlinkCampaign}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Promo */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-green-600" />
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
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter 'SEO10' for 10% discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="border-gray-300 focus:border-green-600"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
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
                          className="border-gray-300 focus:border-green-600"
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
                          className="border-gray-300 focus:border-green-600"
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
                          className="border-gray-300 focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Website URL</label>
                        <Input
                          placeholder="https://yourwebsite.com"
                          value={formData.contactInfo.website}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, website: e.target.value }
                          })}
                          className="border-gray-300 focus:border-green-600"
                        />
                      </div>
                    </div>
                  </div>

                  {!quoteGenerated ? (
                    <div className="flex justify-between">
                      <Button
                        onClick={() => setCurrentStep(3)}
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setQuoteGenerated(true)}
                        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
                      >
                        Generate Quote
                        <Search className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl">
                        <Search className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Your SEO Quote is Ready!</h3>
                        <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your customized SEO strategy quote.</p>
                        <div className="mt-4 p-3 bg-white/20 rounded-lg">
                          <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-4">
                          <Download className="mr-2 h-5 w-5" />
                          Download PDF Quote
                        </Button>
                        <Button className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-4">
                          <Mail className="mr-2 h-5 w-5" />
                          Email Quote
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          setCurrentStep(1);
                          setQuoteGenerated(false);
                          setFormData({
                            primaryGoal: "",
                            websiteSize: "",
                            technicalAudit: false,
                            blogPlan: "",
                            backlinkCampaign: "",
                            addOns: [],
                            promoCode: "",
                            naturalLanguageInput: "",
                            contactInfo: { name: "", email: "", phone: "", website: "" }
                          });
                        }}
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
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
                  <div className="text-3xl font-bold text-green-600 mb-2">
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
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Quote Valid For</span>
                  </div>
                  <div className="text-center text-xs text-green-600">
                    72 hours from generation
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
                    <span className="text-green-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Book a Call
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔍 Organic Growth • 📈 Proven Results • 🎯 Data-Driven
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