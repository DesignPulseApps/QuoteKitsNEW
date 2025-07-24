import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Truck, 
  MapPin, 
  Calendar,
  Package,
  Home,
  Building,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  Sparkles,
  Download,
  Mail,
  Box,
  Wrench,
  HandHeart
} from "lucide-react";

interface MovingServicesFormData {
  movingType: string;
  propertyType: string;
  bedrooms: string;
  distance: string;
  movingDate: string;
  pickupAddress: string;
  deliveryAddress: string;
  extras: string[];
  specialItems: string;
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
  distanceFee: number;
  extrasTotal: number;
  specialItemsFee: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  estimatedHours: number;
}

interface MovingServicesCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function MovingServicesCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: MovingServicesCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<MovingServicesFormData>({
    movingType: "",
    propertyType: "",
    bedrooms: "",
    distance: "",
    movingDate: "",
    pickupAddress: "",
    deliveryAddress: "",
    extras: [],
    specialItems: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Move Details", completed: currentStep > 1 },
    { number: 2, title: "Locations & Date", completed: currentStep > 2 },
    { number: 3, title: "Services & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const movingTypeOptions = [
    { 
      label: "Local Move", 
      value: "local", 
      baseRate: 120, 
      icon: <Home className="h-5 w-5" />,
      description: "Within same city/area",
      timeframe: "Same day service"
    },
    { 
      label: "Long Distance", 
      value: "long_distance", 
      baseRate: 180, 
      icon: <Truck className="h-5 w-5" />,
      description: "Interstate or far moves",
      timeframe: "2-3 days delivery",
      popular: true
    },
    { 
      label: "International", 
      value: "international", 
      baseRate: 350, 
      icon: <Building className="h-5 w-5" />,
      description: "Cross-border moves",
      timeframe: "1-4 weeks delivery"
    },
    { 
      label: "Office Relocation", 
      value: "office", 
      baseRate: 280, 
      icon: <Building className="h-6 w-6" />,
      description: "Commercial moves",
      timeframe: "Weekend preferred"
    }
  ];

  const propertyTypeOptions = [
    { label: "Studio/1BR", value: "studio", multiplier: 1, icon: <Home className="h-5 w-5" /> },
    { label: "2 Bedroom", value: "2br", multiplier: 1.4, icon: <Home className="h-5 w-5" />, popular: true },
    { label: "3 Bedroom", value: "3br", multiplier: 1.8, icon: <Home className="h-5 w-5" /> },
    { label: "4+ Bedroom", value: "4br", multiplier: 2.5, icon: <Home className="h-5 w-5" /> },
    { label: "Office Space", value: "office_space", multiplier: 2.2, icon: <Building className="h-5 w-5" /> }
  ];

  const distanceOptions = [
    { label: "Under 10 miles", value: "local_short", fee: 0, icon: <MapPin className="h-5 w-5" /> },
    { label: "10-50 miles", value: "local_medium", fee: 80, icon: <MapPin className="h-5 w-5" /> },
    { label: "50-200 miles", value: "regional", fee: 200, icon: <Truck className="h-5 w-5" /> },
    { label: "200+ miles", value: "long_distance", fee: 400, icon: <Truck className="h-5 w-5" /> }
  ];

  const extrasOptions = [
    { 
      label: "Packing Services", 
      value: "packing", 
      price: 150, 
      icon: <Package className="h-4 w-4" />,
      description: "Professional packing"
    },
    { 
      label: "Unpacking Services", 
      value: "unpacking", 
      price: 120, 
      icon: <Box className="h-4 w-4" />,
      description: "Setup at destination"
    },
    { 
      label: "Furniture Assembly", 
      value: "assembly", 
      price: 100, 
      icon: <Wrench className="h-4 w-4" />,
      description: "Disassemble & reassemble"
    },
    { 
      label: "Storage Service", 
      value: "storage", 
      price: 80, 
      icon: <Building className="h-4 w-4" />,
      description: "Temporary storage"
    },
    { 
      label: "Cleaning Service", 
      value: "cleaning", 
      price: 90, 
      icon: <HandHeart className="h-4 w-4" />,
      description: "Post-move cleaning"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-moving-services', {
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
        movingType: result.movingType || prev.movingType,
        propertyType: result.propertyType || prev.propertyType,
        bedrooms: result.bedrooms || prev.bedrooms,
        distance: result.distance || prev.distance,
        extras: result.extras?.length ? result.extras : prev.extras
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedMovingType = movingTypeOptions.find(m => m.value === formData.movingType);
    const selectedProperty = propertyTypeOptions.find(p => p.value === formData.propertyType);
    const selectedDistance = distanceOptions.find(d => d.value === formData.distance);
    
    const baseRate = selectedMovingType?.baseRate || customConfig?.basePrice || 120;
    const propertyMultiplier = selectedProperty?.multiplier || 1;
    const distanceFee = selectedDistance?.fee || 0;
    
    // Calculate base moving cost
    const baseMovingCost = baseRate * propertyMultiplier;
    
    // Extras total
    const extrasTotal = formData.extras.reduce((total, extraValue) => {
      const extra = extrasOptions.find(e => e.value === extraValue);
      return total + (extra?.price || 0);
    }, 0);

    // Special items surcharge (piano, artwork, etc.)
    const specialItemsFee = formData.specialItems.trim() ? 120 : 0;
    
    const subtotal = baseMovingCost + distanceFee + extrasTotal + specialItemsFee;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "move15") {
      promoDiscount = subtotal * 0.15;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedMovingType?.label || 'Moving'} (${selectedProperty?.label || 'Property'}): €${baseMovingCost.toFixed(2)}`,
      ...(distanceFee > 0 ? [`Distance fee: +€${distanceFee}`] : []),
      ...formData.extras.map(extraValue => {
        const extra = extrasOptions.find(e => e.value === extraValue);
        return `${extra?.label || 'Extra'}: +€${extra?.price || 0}`;
      }),
      ...(specialItemsFee > 0 ? [`Special items handling: +€${specialItemsFee}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Estimate hours based on property size and distance
    const baseHours = selectedProperty?.multiplier ? Math.ceil(selectedProperty.multiplier * 4) : 4;
    const estimatedHours = baseHours + (formData.extras.length * 2);

    return {
      baseRate: baseMovingCost,
      distanceFee,
      extrasTotal,
      specialItemsFee,
      subtotal,
      promoDiscount,
      total,
      breakdown,
      estimatedHours
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
          ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-md" 
          : "border-slate-300 hover:border-orange-400 bg-white hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-red-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-orange-800" : "text-slate-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-slate-600 mb-2"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.timeframe && (
        <p className="text-xs text-slate-500"><EditableText value={option.timeframe} onSave={() => {}} /></p>
      )}
      {option.baseRate && (
        <p className="text-sm font-medium text-orange-600 mt-2">From €{option.baseRate} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-orange-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.fee > 0 && (
        <p className="text-sm font-medium text-orange-600 mt-2">+€{option.fee} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50 to-red-100">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-red-700 to-orange-600 mb-4">
            <EditableText
              value={textConfig.headline || "Moving Services"}
              onSave={(value) => updateTextContent('headline', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Professional moving services with experienced teams, secure transport, and comprehensive insurance coverage."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-slate-700 max-w-2xl mx-auto font-medium text-lg block"
            isPreview={isPreview}
          />
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-orange-700">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Fully Insured
            </span>
            <span className="flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Professional Crew
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              5-Star Service
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
                          ? "bg-orange-600 text-white"
                          : currentStep === step.number
                          ? "bg-orange-500 text-white"
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
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-300">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Moving Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'Moving 2-bedroom apartment across town with packing help' or 'Office relocation, need furniture assembly and storage'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-white border-orange-300 text-slate-900 placeholder-slate-400"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
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

              {/* Step 1: Move Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-orange-600" />
                      Type of Move
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {movingTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.movingType === option.value}
                          onClick={() => setFormData({ ...formData, movingType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-orange-600" />
                      Property Size
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {propertyTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.propertyType === option.value}
                          onClick={() => setFormData({ ...formData, propertyType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                      Distance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {distanceOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.distance === option.value}
                          onClick={() => setFormData({ ...formData, distance: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.movingType || !formData.propertyType || !formData.distance}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Locations & Date */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                        Pickup Address
                      </label>
                      <Input
                        placeholder="Current address"
                        value={formData.pickupAddress}
                        onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                        className="border-slate-300 focus:border-orange-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                        Delivery Address
                      </label>
                      <Input
                        placeholder="New address"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        className="border-slate-300 focus:border-orange-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                      Preferred Moving Date
                    </label>
                    <Input
                      type="date"
                      value={formData.movingDate}
                      onChange={(e) => setFormData({ ...formData, movingDate: e.target.value })}
                      className="border-slate-300 focus:border-orange-600 max-w-xs"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.pickupAddress || !formData.deliveryAddress}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Services & Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-orange-600" />
                      Additional Services
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Special Items</label>
                      <Textarea
                        placeholder="Piano, artwork, fragile items..."
                        value={formData.specialItems}
                        onChange={(e) => setFormData({ ...formData, specialItems: e.target.value })}
                        className="border-slate-300 focus:border-orange-600"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Promo Code</label>
                      <Input
                        placeholder="Enter promo code"
                        value={formData.promoCode}
                        onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                        className="border-slate-300 focus:border-orange-600"
                      />
                    </div>
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
                        className="border-slate-300 focus:border-orange-600"
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
                        className="border-slate-300 focus:border-orange-600"
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
                        className="border-slate-300 focus:border-orange-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3"
                    >
                      Generate Quote
                      <Truck className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl">
                    <Truck className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Moving Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized moving quote.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        movingType: "",
                        propertyType: "",
                        bedrooms: "",
                        distance: "",
                        movingDate: "",
                        pickupAddress: "",
                        deliveryAddress: "",
                        extras: [],
                        specialItems: "",
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
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
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-slate-600 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Estimated Time */}
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-700">Estimated Duration</span>
                  </div>
                  <div className="text-center text-sm text-orange-600">
                    {pricing.estimatedHours} hours
                  </div>
                </div>

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
                    <span className="text-orange-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Truck className="mr-2 h-5 w-5" />
                  Book Moving Service
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    📦 Professional crew • 🛡️ Fully insured • ⭐ 5-star service
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