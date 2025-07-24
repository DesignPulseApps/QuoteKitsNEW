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
  PenTool, 
  FileText,
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
  Search,
  Globe,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Zap
} from "lucide-react";

interface CopywriterFormData {
  projectType: string;
  wordCount: string;
  toneOfVoice: string;
  urgency: string;
  addOns: string[];
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
  wordCountAdd: number;
  expressAdd: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface CopywriterCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function CopywriterCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: CopywriterCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<CopywriterFormData>({
    projectType: "",
    wordCount: "",
    toneOfVoice: "",
    urgency: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "", company: "" }
  });

  const steps = [
    { number: 1, title: "Project & Length", completed: currentStep > 1 },
    { number: 2, title: "Tone & Timing", completed: currentStep > 2 },
    { number: 3, title: "Add-ons & Promo", completed: currentStep > 3 },
    { number: 4, title: "Contact & Quote", completed: quoteGenerated }
  ];

  // Use custom pricing configuration if available
  const getProjectTypePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        label: group.label,
        value: group.id,
        icon: <Globe className="h-5 w-5" />,
        description: group.description || "Professional copywriting service",
        basePrice: group.price,
        popular: group.id === "website" || group.id === "blog"
      }));
    }
    return [
      { 
        label: "Website Copy", 
        value: "website", 
        icon: <Globe className="h-5 w-5" />,
        description: "Home pages, about pages, service descriptions",
        basePrice: 100,
        popular: true
      },
      { 
        label: "Blog Post", 
        value: "blog", 
        icon: <FileText className="h-5 w-5" />,
        description: "SEO articles and thought leadership content",
        basePrice: 75
      },
      { 
        label: "Sales Page", 
        value: "sales", 
        icon: <Target className="h-5 w-5" />,
        description: "High-converting landing and sales pages",
        basePrice: 150
      },
      { 
        label: "Product Description", 
        value: "product", 
        icon: <Star className="h-5 w-5" />,
        description: "E-commerce product copy that sells",
        basePrice: 50
      },
      { 
        label: "Email Sequence", 
        value: "email", 
        icon: <MessageSquare className="h-5 w-5" />,
        description: "Welcome series and nurture campaigns",
        basePrice: 120
      }
    ];
  };

  const projectTypes = getProjectTypePricing();

  const wordCounts = [
    { label: "Under 500", value: "under500", multiplier: 0.8, icon: <FileText className="h-4 w-4" /> },
    { label: "500-1,000", value: "500to1000", multiplier: 1, icon: <FileText className="h-4 w-4" />, popular: true },
    { label: "1,000-2,000", value: "1000to2000", multiplier: 1.5, icon: <FileText className="h-4 w-4" /> },
    { label: "Over 2,000", value: "over2000", multiplier: 2.2, icon: <FileText className="h-4 w-4" /> }
  ];

  const toneOptions = [
    { 
      label: "Professional", 
      value: "professional", 
      icon: <Users className="h-5 w-5" />,
      description: "Corporate and authoritative tone"
    },
    { 
      label: "Friendly", 
      value: "friendly", 
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Conversational and approachable",
      popular: true
    },
    { 
      label: "Persuasive", 
      value: "persuasive", 
      icon: <Target className="h-5 w-5" />,
      description: "Sales-focused and compelling"
    },
    { 
      label: "Witty", 
      value: "witty", 
      icon: <Sparkles className="h-5 w-5" />,
      description: "Creative and entertaining"
    }
  ];

  const urgencyOptions = [
    { 
      label: "Standard (5 days)", 
      value: "standard", 
      addCost: 0, 
      icon: <Clock className="h-5 w-5" />,
      popular: true
    },
    { 
      label: "Express (48 hours)", 
      value: "express", 
      addCost: 50, 
      icon: <Zap className="h-5 w-5" />,
      description: "Priority delivery"
    }
  ];

  const addOnOptions = [
    { 
      label: "Keyword Research", 
      value: "keywords", 
      price: 30, 
      icon: <Search className="h-4 w-4" />,
      description: "SEO keyword analysis and integration"
    },
    { 
      label: "SEO Optimization", 
      value: "seo", 
      price: 40, 
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Search engine optimization",
      popular: true
    },
    { 
      label: "Competitor Analysis", 
      value: "competitor", 
      price: 50, 
      icon: <Target className="h-4 w-4" />,
      description: "Market and competitor research"
    },
    { 
      label: "Upload-ready Format", 
      value: "format", 
      price: 20, 
      icon: <FileText className="h-4 w-4" />,
      description: "Google Doc / HTML formatting"
    },
    { 
      label: "Revisions Package", 
      value: "revisions", 
      price: 25, 
      icon: <RefreshCw className="h-4 w-4" />,
      description: "Up to 3 rounds of revisions"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-copywriter', {
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
        projectType: result.projectType || prev.projectType,
        wordCount: result.wordCount || prev.wordCount,
        toneOfVoice: result.toneOfVoice || prev.toneOfVoice,
        urgency: result.urgency || prev.urgency,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const selectedProjectType = projectTypes.find(p => p.value === formData.projectType);
    const selectedWordCount = wordCounts.find(w => w.value === formData.wordCount);
    const selectedUrgency = urgencyOptions.find(u => u.value === formData.urgency);
    
    const basePrice = (selectedProjectType?.basePrice || customConfig?.basePrice || 75) * (selectedWordCount?.multiplier || 1);
    const wordCountAdd = 0; // Already included in multiplier
    const expressAdd = selectedUrgency?.addCost || 0;
    
    // Calculate add-ons using dynamic pricing
    let addOnsTotal = 0;
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
      }
    });
    
    const subtotal = basePrice + wordCountAdd + expressAdd + addOnsTotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "copy10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedProjectType?.label || 'Copy'} writing (${selectedWordCount?.label || '500-1,000 words'}): ${currencySymbol}${basePrice.toFixed(2)}`,
      ...(expressAdd > 0 ? [`Express delivery (48h): +${currencySymbol}${expressAdd.toFixed(2)}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +${currencySymbol}${addOn?.price.toFixed(2) || '0.00'}`;
      }),
      ...(promoDiscount > 0 ? [`Promo discount (10%): -${currencySymbol}${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 72 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 72);

    return {
      basePrice,
      wordCountAdd,
      expressAdd,
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
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-slate-50 shadow-md" 
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-slate-50/30"
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
          <Badge className="bg-gradient-to-r from-blue-500 to-slate-600 text-white text-xs">
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
      {option.price !== undefined && option.price > 0 && (
        <p className="text-sm font-medium text-blue-600 ml-11">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.addCost !== undefined && option.addCost > 0 && (
        <p className="text-sm font-medium text-blue-600 ml-11">+€{option.addCost} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-700 to-slate-600 mb-4">
            Professional Copywriting Services
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium text-lg">
            Expert copy that converts. From sales pages to blog posts, get a personalized quote for your copywriting project.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <PenTool className="h-4 w-4 mr-2" />
              Expert Writing
            </span>
            <span className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Conversion-Focused
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              SEO Optimized
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
                    AI Assistant - Describe Your Copy Project
                  </h3>
                  <Switch
                    checked={showNaturalLanguage}
                    onCheckedChange={setShowNaturalLanguage}
                  />
                </div>
                {showNaturalLanguage && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="e.g., 'I need a witty 1,000-word sales page optimized for SEO' or 'Professional blog post with keyword research'"
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

              {/* Step 1: Project & Length */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <PenTool className="h-5 w-5 mr-2 text-blue-600" />
                      What type of copy do you need?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectTypes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.projectType === option.value}
                          onClick={() => setFormData({ ...formData, projectType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Word count estimate
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {wordCounts.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.wordCount === option.value}
                          onClick={() => setFormData({ ...formData, wordCount: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.wordCount}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Tone & Timing */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                      Tone of voice
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {toneOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.toneOfVoice === option.value}
                          onClick={() => setFormData({ ...formData, toneOfVoice: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Delivery timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {urgencyOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.urgency === option.value}
                          onClick={() => setFormData({ ...formData, urgency: option.value })}
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
                      disabled={!formData.toneOfVoice || !formData.urgency}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
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
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter 'COPY10' for 10% discount"
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
                        <PenTool className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-blue-600 to-slate-600 text-white p-6 rounded-2xl">
                        <PenTool className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Your Copy Quote is Ready!</h3>
                        <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your customized copywriting quote.</p>
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
                            projectType: "",
                            wordCount: "",
                            toneOfVoice: "",
                            urgency: "",
                            addOns: [],
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
                    <span className="text-sm font-medium text-blue-700">Quote Valid For</span>
                  </div>
                  <div className="text-center text-xs text-blue-600">
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
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Request Project
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    ✍️ Expert Writing • 🎯 Conversion-Focused • 📈 SEO Optimized
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