import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Navigation,
  Baby,
  Wrench,
  UserPlus,
  Timer,
  Download,
  Mail,
  Sparkles,
  Route,
  Gauge
} from "lucide-react";

interface VanRentalFormData {
  rentalType: string;
  duration: string;
  pickupLocation: string;
  returnLocation: string;
  kmLimit: string;
  driverAge: string;
  extras: string[];
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
  durationMultiplier: number;
  oneWayFee: number;
  extrasTotal: number;
  ageUpcharge: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  kmAllowance: number;
}

interface VanRentalCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function VanRentalCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: VanRentalCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<VanRentalFormData>({
    rentalType: "",
    duration: "",
    pickupLocation: "",
    returnLocation: "",
    kmLimit: "",
    driverAge: "",
    extras: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Van & Duration", completed: currentStep > 1 },
    { number: 2, title: "Locations & Extras", completed: currentStep > 2 },
    { number: 3, title: "Driver & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const rentalTypeOptions = [
    { 
      label: "Cargo Van", 
      value: "cargo", 
      baseRate: 65, 
      icon: <Truck className="h-5 w-5" />,
      description: "Compact cargo space",
      capacity: "2 passengers"
    },
    { 
      label: "Passenger Van", 
      value: "passenger", 
      baseRate: 85, 
      icon: <Users className="h-5 w-5" />,
      description: "Up to 9 passengers",
      capacity: "9 passengers",
      popular: true
    },
    { 
      label: "Luton/Box Van", 
      value: "luton", 
      baseRate: 120, 
      icon: <Truck className="h-6 w-6" />,
      description: "Large cargo capacity",
      capacity: "Tail lift available"
    },
    { 
      label: "Campervan", 
      value: "camper", 
      baseRate: 180, 
      icon: <Truck className="h-5 w-5" />,
      description: "Self-contained travel",
      capacity: "2-4 people"
    }
  ];

  const durationOptions = [
    { label: "Half Day (4 hours)", value: "half_day", multiplier: 0.6, icon: <Clock className="h-5 w-5" /> },
    { label: "Full Day", value: "full_day", multiplier: 1, icon: <Clock className="h-5 w-5" /> },
    { label: "Weekend (2 days)", value: "weekend", multiplier: 1.8, icon: <Clock className="h-5 w-5" /> },
    { label: "Weekly (7 days)", value: "weekly", multiplier: 5.5, discount: 0.15, icon: <Timer className="h-5 w-5" /> }
  ];

  const kmLimitOptions = [
    { label: "100km/day", value: "100", allowance: 100, price: 0, icon: <Gauge className="h-5 w-5" /> },
    { label: "200km/day", value: "200", allowance: 200, price: 15, icon: <Gauge className="h-5 w-5" />, popular: true },
    { label: "Unlimited", value: "unlimited", allowance: -1, price: 35, icon: <Route className="h-5 w-5" /> }
  ];

  const extrasOptions = [
    { 
      label: "GPS Navigation", 
      value: "gps", 
      price: 10, 
      icon: <Navigation className="h-4 w-4" />,
      description: "Built-in satellite navigation"
    },
    { 
      label: "Child/Baby Seat", 
      value: "baby_seat", 
      price: 15, 
      icon: <Baby className="h-4 w-4" />,
      description: "Safety-certified child seat"
    },
    { 
      label: "Sack Trolley", 
      value: "trolley", 
      price: 8, 
      icon: <Wrench className="h-4 w-4" />,
      description: "Moving and loading trolley"
    },
    { 
      label: "Additional Driver", 
      value: "extra_driver", 
      price: 20, 
      icon: <UserPlus className="h-4 w-4" />,
      description: "Second authorized driver"
    },
    { 
      label: "Insurance Upgrade", 
      value: "insurance", 
      price: 25, 
      icon: <Shield className="h-4 w-4" />,
      description: "Comprehensive coverage"
    }
  ];

  const ageOptions = [
    { label: "18-24 years", value: "18-24", surcharge: 20 },
    { label: "25-29 years", value: "25-29", surcharge: 10 },
    { label: "30+ years", value: "30+", surcharge: 0 }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-van-rental', {
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
        rentalType: result.rentalType || prev.rentalType,
        duration: result.duration || prev.duration,
        kmLimit: result.kmLimit || prev.kmLimit,
        extras: result.extras?.length ? result.extras : prev.extras
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedVan = rentalTypeOptions.find(v => v.value === formData.rentalType);
    const selectedDuration = durationOptions.find(d => d.value === formData.duration);
    const selectedKmLimit = kmLimitOptions.find(k => k.value === formData.kmLimit);
    const selectedAge = ageOptions.find(a => a.value === formData.driverAge);
    
    const baseRate = selectedVan?.baseRate || customConfig?.basePrice || 35;
    const durationMultiplier = selectedDuration?.multiplier || 1;
    const kmPrice = selectedKmLimit?.price || 0;
    
    // Calculate base rental cost
    const baseRentalCost = baseRate * durationMultiplier + kmPrice;
    
    // One-way fee (if different return location)
    const oneWayFee = formData.returnLocation && formData.returnLocation !== formData.pickupLocation ? 50 : 0;
    
    // Extras total
    const extrasTotal = formData.extras.reduce((total, extraValue) => {
      const extra = extrasOptions.find(e => e.value === extraValue);
      return total + (extra?.price || 0);
    }, 0);

    // Age surcharge
    const ageUpcharge = selectedAge?.surcharge || 0;
    
    const subtotal = baseRentalCost + oneWayFee + extrasTotal + ageUpcharge;
    
    // Apply duration discount
    const durationDiscount = (selectedDuration?.discount || 0) * subtotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "vanlife15") {
      promoDiscount = subtotal * 0.15;
    }

    const totalDiscount = durationDiscount + promoDiscount;
    const total = Math.max(0, subtotal - totalDiscount);
    
    const breakdown = [
      `${selectedVan?.label || 'Van'} (${selectedDuration?.label || 'Duration'}): €${baseRentalCost.toFixed(2)}`,
      ...(oneWayFee > 0 ? [`One-way return: +€${oneWayFee}`] : []),
      ...formData.extras.map(extraValue => {
        const extra = extrasOptions.find(e => e.value === extraValue);
        return `${extra?.label || 'Extra'}: +€${extra?.price || 0}`;
      }),
      ...(ageUpcharge > 0 ? [`Young driver surcharge: +€${ageUpcharge}`] : []),
      ...(durationDiscount > 0 ? [`Weekly discount: -€${durationDiscount.toFixed(2)}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Calculate km allowance based on duration
    let kmAllowance = selectedKmLimit?.allowance || 100;
    if (kmAllowance > 0) {
      const days = selectedDuration?.value === 'half_day' ? 0.5 : 
                   selectedDuration?.value === 'weekend' ? 2 : 
                   selectedDuration?.value === 'weekly' ? 7 : 1;
      kmAllowance *= days;
    }

    return {
      baseRate: baseRentalCost,
      durationMultiplier,
      oneWayFee,
      extrasTotal,
      ageUpcharge,
      subtotal,
      promoDiscount: totalDiscount,
      total,
      breakdown,
      kmAllowance
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
          ? "border-blue-600 bg-gradient-to-br from-blue-50 to-slate-50 shadow-md" 
          : "border-slate-300 hover:border-blue-400 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-slate-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-blue-800" : "text-slate-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-slate-600 mb-2"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.capacity && (
        <p className="text-xs text-slate-500"><EditableText value={option.capacity} onSave={() => {}} /></p>
      )}
      {option.baseRate && (
        <p className="text-sm font-medium text-blue-600 mt-2">From €{option.baseRate}/day</p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-blue-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.allowance && option.allowance > 0 && (
        <p className="text-xs text-slate-500 mt-1"><EditableText value={option.allowance}km included</p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-blue-700 to-slate-600 mb-4">
            <EditableText
              value={textConfig.headline || "Van Rental Services"}
              onSave={(value) => updateTextContent('headline', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Professional van hire with flexible options, competitive rates, and full insurance coverage."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-slate-700 max-w-2xl mx-auto font-medium text-lg block"
            isPreview={isPreview}
          />
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Fully Insured
            </span>
            <span className="flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Modern Fleet
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              24/7 Support
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-slate-300 rounded-3xl shadow-xl">
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
                          : "bg-slate-300 text-slate-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-slate-400 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-300">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Van Rental Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'I need a Luton van for the weekend, with GPS and extra driver' or 'Cargo van for house move with unlimited mileage'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
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
                        Smart Fill
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step 1: Van Type & Duration */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-blue-600" />
                      Choose Your Van
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rentalTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.rentalType === option.value}
                          onClick={() => setFormData({ ...formData, rentalType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Rental Duration
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {durationOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.duration === option.value}
                          onClick={() => setFormData({ ...formData, duration: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                      Kilometre Allowance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {kmLimitOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.kmLimit === option.value}
                          onClick={() => setFormData({ ...formData, kmLimit: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.rentalType || !formData.duration || !formData.kmLimit}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
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

              {/* Step 2: Locations & Extras */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        Pickup Location
                      </label>
                      <Input
                        placeholder="Address or postcode"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                        className="border-slate-300 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        Return Location (Optional)
                      </label>
                      <Input
                        placeholder="Same as pickup or different"
                        value={formData.returnLocation}
                        onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                        className="border-slate-300 focus:border-blue-600"
                      />
                      <p className="text-xs text-slate-500 mt-1">Different location: +€50 one-way fee</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-600" />
                      Optional Extras
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extrasOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.extras.includes(option.value)}
                          onClick={() => {
                            const newExtras = formData.extras.includes(option.value)
                              ? formData.extras.filter(e => e !== option.value)
                              : [...formData.extras, option.value];
                            setFormData({ ...formData, extras: newExtras });
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
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.pickupLocation}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Driver & Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Driver Age</label>
                    <select
                      value={formData.driverAge}
                      onChange={(e) => setFormData({ ...formData, driverAge: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="">Select age range</option>
                      {ageOptions.map((age) => (
                        <option key={age.value} value={age.value}>
                          {age.label} {age.surcharge > 0 && `(+€${age.surcharge})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Promo Code (Optional)</label>
                    <Input
                      placeholder="Enter promo code for discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="border-slate-300 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        className="border-slate-300 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        className="border-slate-300 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Phone</label>
                      <Input
                        placeholder="Phone number"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="border-slate-300 focus:border-blue-600"
                      />
                    </div>
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
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email || !formData.driverAge}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.generateQuoteButtonText || "Generate Quote"}
                        onSave={(value) => updateTextContent('generateQuoteButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
                      <Truck className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-slate-600 text-white p-6 rounded-2xl">
                    <Truck className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Van Rental Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized van rental quote.</p>
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
                        rentalType: "",
                        duration: "",
                        pickupLocation: "",
                        returnLocation: "",
                        kmLimit: "",
                        driverAge: "",
                        extras: [],
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-300 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-slate-600 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Kilometre Allowance Progress */}
                {pricing.kmAllowance > 0 && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Kilometre Allowance</span>
                      <span className="text-sm text-slate-600"><EditableText value={pricing.kmAllowance}km included</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">Additional km: €0.25/km</p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-slate-800 font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-slate-700">Total:</span>
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Truck className="mr-2 h-5 w-5" />
                  Reserve Now
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    🚐 Modern fleet • 🛡️ Fully insured • 📞 24/7 support
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