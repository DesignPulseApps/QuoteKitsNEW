import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Bike, 
  Wrench, 
  Clock,
  Zap,
  AlertTriangle,
  Settings,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Timer,
  Users,
  Sparkles,
  Download,
  Mail,
  Gauge,
  Cog,
  Fuel
} from "lucide-react";

interface MotorcycleRepairFormData {
  bikeType: string;
  serviceType: string;
  urgency: string;
  addOns: string[];
  bikeAge: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  baseRate: number;
  urgencyFee: number;
  addOnsTotal: number;
  ageModifier: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface MotorcycleRepairCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function MotorcycleRepairCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: MotorcycleRepairCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [textConfig, setTextConfig] = useState<any>(propConfig?.textContent || {});
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    const newConfig = {
      ...textConfig,
      [key]: value
    };
    setTextConfig(newConfig);
    
    // Notify parent component about the change
    if (onConfigChange) {
      onConfigChange({
        ...propConfig,
        textContent: newConfig
      });
    }
  };
  const [formData, setFormData] = useState<MotorcycleRepairFormData>({
    bikeType: "",
    serviceType: "",
    urgency: "",
    addOns: [],
    bikeAge: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Bike & Service", completed: currentStep > 1 },
    { number: 2, title: "Urgency & Add-ons", completed: currentStep > 2 },
    { number: 3, title: "Details & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const bikeTypeOptions = [
    { 
      label: "Cruiser", 
      value: "cruiser", 
      baseMultiplier: 1.1, 
      icon: <Bike className="h-5 w-5" />,
      description: "Harley, Indian, etc.",
      complexity: "Standard"
    },
    { 
      label: "Sportbike", 
      value: "sportbike", 
      baseMultiplier: 1.3, 
      icon: <Zap className="h-5 w-5" />,
      description: "Ninja, CBR, R6, etc.",
      complexity: "Complex",
      popular: true
    },
    { 
      label: "Touring", 
      value: "touring", 
      baseMultiplier: 1.2, 
      icon: <Bike className="h-6 w-6" />,
      description: "Goldwing, RT, etc.",
      complexity: "Advanced"
    },
    { 
      label: "Dirt Bike", 
      value: "dirt_bike", 
      baseMultiplier: 0.9, 
      icon: <Bike className="h-5 w-5" />,
      description: "KTM, Honda CRF, etc.",
      complexity: "Simple"
    },
    { 
      label: "Scooter / Moped", 
      value: "scooter", 
      baseMultiplier: 0.7, 
      icon: <Bike className="h-5 w-5" />,
      description: "Vespa, Honda PCX, etc.",
      complexity: "Basic"
    },
    { 
      label: "Electric / Hybrid", 
      value: "electric", 
      baseMultiplier: 1.4, 
      icon: <Zap className="h-5 w-5" />,
      description: "Zero, Energica, etc.",
      complexity: "Specialized"
    }
  ];

  const serviceTypeOptions = [
    { label: "General Maintenance", value: "maintenance", baseRate: 80, icon: <Settings className="h-5 w-5" /> },
    { label: "Engine Repair", value: "engine", baseRate: 250, icon: <Cog className="h-5 w-5" />, popular: true },
    { label: "Brake Replacement", value: "brakes", baseRate: 150, icon: <AlertTriangle className="h-5 w-5" /> },
    { label: "Tire Change", value: "tires", baseRate: 60, icon: <Gauge className="h-5 w-5" /> },
    { label: "Suspension Service", value: "suspension", baseRate: 200, icon: <Settings className="h-5 w-5" /> },
    { label: "Electrical Diagnostics", value: "electrical", baseRate: 120, icon: <Zap className="h-5 w-5" /> }
  ];

  const urgencyOptions = [
    { label: "Standard (2-3 days)", value: "standard", fee: 0, icon: <Clock className="h-5 w-5" /> },
    { label: "Express (Next day)", value: "express", fee: 50, icon: <Clock className="h-5 w-5" />, popular: true },
    { label: "Emergency (Same day)", value: "emergency", fee: 100, icon: <AlertTriangle className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Oil & Filter Change", 
      value: "oil_change", 
      price: 45, 
      icon: <Fuel className="h-4 w-4" />,
      description: "Fresh oil and filter"
    },
    { 
      label: "Chain Replacement", 
      value: "chain", 
      price: 70, 
      icon: <Settings className="h-4 w-4" />,
      description: "New chain and sprockets"
    },
    { 
      label: "Valve Adjustment", 
      value: "valves", 
      price: 90, 
      icon: <Cog className="h-4 w-4" />,
      description: "Precision valve timing"
    },
    { 
      label: "Pickup & Dropoff", 
      value: "pickup", 
      price: 40, 
      icon: <Bike className="h-4 w-4" />,
      description: "We collect and deliver"
    }
  ];

  const bikeAgeOptions = [
    { label: "0-2 years", value: "new", modifier: 0, icon: <Star className="h-5 w-5" /> },
    { label: "3-5 years", value: "recent", modifier: 0.05, icon: <Star className="h-5 w-5" /> },
    { label: "6-10 years", value: "older", modifier: 0.08, icon: <Wrench className="h-5 w-5" /> },
    { label: "10+ years", value: "vintage", modifier: 0.15, icon: <Wrench className="h-5 w-5" /> }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-motorcycle-repair', {
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
        bikeType: result.bikeType || prev.bikeType,
        serviceType: result.serviceType || prev.serviceType,
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
    const selectedBike = bikeTypeOptions.find(b => b.value === formData.bikeType);
    const selectedService = serviceTypeOptions.find(s => s.value === formData.serviceType);
    const selectedUrgency = urgencyOptions.find(u => u.value === formData.urgency);
    const selectedAge = bikeAgeOptions.find(a => a.value === formData.bikeAge);
    
    const baseServiceRate = selectedService?.baseRate || customConfig?.basePrice || 80;
    const bikeMultiplier = selectedBike?.baseMultiplier || 1;
    const urgencyFee = selectedUrgency?.fee || 0;
    
    // Calculate base cost with bike type complexity
    const baseRate = baseServiceRate * bikeMultiplier;
    
    // Add-ons total
    const addOnsTotal = formData.addOns.reduce((total, addOnValue) => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      return total + (addOn?.price || 0);
    }, 0);

    // Age modifier
    const ageModifierPercent = selectedAge?.modifier || 0;
    const ageModifier = baseRate * ageModifierPercent;
    
    const subtotal = baseRate + urgencyFee + addOnsTotal + ageModifier;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "bike10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedService?.label || 'Service'} (${selectedBike?.label || 'Bike'}): €${baseRate.toFixed(2)}`,
      ...(urgencyFee > 0 ? [`${selectedUrgency?.label || 'Urgency'}: +€${urgencyFee}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +€${addOn?.price || 0}`;
      }),
      ...(ageModifier > 0 ? [`Age surcharge: +€${ageModifier.toFixed(2)}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 48 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 48);

    return {
      baseRate,
      urgencyFee,
      addOnsTotal,
      ageModifier,
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
      className={`p-4 cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
        selected 
          ? "border-red-600 bg-gradient-to-br from-red-50 to-gray-50 shadow-md" 
          : "border-gray-300 hover:border-red-400 bg-white hover:bg-gradient-to-br hover:from-red-50/30 hover:to-gray-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-red-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-600 mb-2"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.complexity && (
        <p className="text-xs text-gray-500"><EditableText value={option.complexity} onSave={() => {}} /></p>
      )}
      {option.baseRate && (
        <p className="text-sm font-medium text-red-600 mt-2">From €{option.baseRate} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-red-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.fee > 0 && (
        <p className="text-sm font-medium text-red-600 mt-2">+€{option.fee} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-gray-300 to-red-400 mb-4">
            <EditableText
              value={textConfig.headline || "Motorcycle Repair Services"}
              onSave={(value) => updateTextContent('headline', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Expert motorcycle repairs with certified mechanics, genuine parts, and comprehensive warranty coverage."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-gray-300 max-w-2xl mx-auto font-medium text-lg block"
            isPreview={isPreview}
          />
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-red-400">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Certified Mechanics
            </span>
            <span className="flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Genuine Parts
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Full Warranty
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-800/95 backdrop-blur-sm border-gray-700 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-red-600 text-white"
                          : currentStep === step.number
                          ? "bg-red-500 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-500 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-700 to-red-900/30 rounded-2xl border border-red-600/30">
                <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Repair Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'Need brake repair on a cruiser ASAP' or 'Sportbike engine trouble, next day service'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    {isProcessingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Smart Fill
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step 1: Bike Type & Service */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <Bike className="h-5 w-5 mr-2 text-red-500" />
                      <EditableText
                        value={textConfig.motorcycleSelectionTitle || "Your Motorcycle"}
                        onSave={(value) => updateTextContent('motorcycleSelectionTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bikeTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.bikeType === option.value}
                          onClick={() => setFormData({ ...formData, bikeType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-red-500" />
                      <EditableText
                        value={textConfig.serviceNeededTitle || "Service Needed"}
                        onSave={(value) => updateTextContent('serviceNeededTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serviceTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.serviceType === option.value}
                          onClick={() => setFormData({ ...formData, serviceType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.bikeType || !formData.serviceType}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.continueButtonText || "Continue"}
                        onSave={(value) => updateTextContent('continueButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Urgency & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-red-500" />
                      When Do You Need It?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-red-500" />
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
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.urgency}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Details & Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <Bike className="h-5 w-5 mr-2 text-red-500" />
                      Bike Age
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {bikeAgeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.bikeAge === option.value}
                          onClick={() => setFormData({ ...formData, bikeAge: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter promo code for discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Phone</label>
                      <Input
                        placeholder="Phone number"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email || !formData.bikeAge}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3"
                    >
                      Generate Quote
                      <Wrench className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-red-600 to-gray-700 text-white p-6 rounded-2xl">
                    <Wrench className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Repair Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized motorcycle repair quote.</p>
                    <div className="mt-4 p-3 bg-white/20 rounded-lg">
                      <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-gray-700 border-2 border-red-600 text-red-400 hover:bg-gray-600 py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-gray-700 border-2 border-red-600 text-red-400 hover:bg-gray-600 py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        bikeType: "",
                        serviceType: "",
                        urgency: "",
                        addOns: [],
                        bikeAge: "",
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    Create New Quote
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 bg-gray-800/95 backdrop-blur-sm border-gray-700 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-red-500 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-400 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-400 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Expiry Timer */}
                <div className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-600/30">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-sm font-medium text-red-400">Quote Valid For</span>
                  </div>
                  <div className="text-center text-xs text-red-300">
                    48 hours from generation
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-400"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-gray-200 font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-600 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-red-500">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  <EditableText
                    value={textConfig.bookServiceButtonText || "Book Repair Service"}
                    onSave={(value) => updateTextContent('bookServiceButtonText', value)}
                    className="font-semibold text-lg"
                    isPreview={isPreview}
                  />
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔧 Certified mechanics • 🛡️ Full warranty • ⚡ Fast service
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