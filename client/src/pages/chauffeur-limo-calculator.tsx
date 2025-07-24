import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Car, 
  Crown, 
  Sparkles, 
  Clock, 
  MapPin, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Star,
  Wine,
  Shield,
  Users,
  Timer,
  Download,
  Mail
} from "lucide-react";

interface ChauffeurFormData {
  serviceType: string;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  duration: string;
  addOns: string[];
  date: string;
  time: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  durationMultiplier: number;
  vehicleUpcharge: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  expiresAt: Date;
}

interface ChauffeurLimoCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function ChauffeurLimoCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: ChauffeurLimoCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
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
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [formData, setFormData] = useState<ChauffeurFormData>({
    serviceType: "",
    vehicleType: "",
    pickupLocation: "",
    dropoffLocation: "",
    duration: "",
    addOns: [],
    date: "",
    time: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Service Details", completed: currentStep > 1 },
    { number: 2, title: "Vehicle & Add-ons", completed: currentStep > 2 },
    { number: 3, title: "Schedule & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const serviceTypeOptions = [
    { 
      label: "Airport Transfer", 
      value: "airport", 
      basePrice: 120, 
      icon: <Car className="h-5 w-5" />,
      description: "Professional point-to-point service"
    },
    { 
      label: "Hourly Hire", 
      value: "hourly", 
      basePrice: 100, 
      icon: <Clock className="h-5 w-5" />,
      description: "Flexible time-based booking"
    },
    { 
      label: "Wedding / Event", 
      value: "wedding", 
      basePrice: 450, 
      icon: <Crown className="h-5 w-5" />,
      description: "Special occasion packages",
      popular: true
    },
    { 
      label: "Corporate Booking", 
      value: "corporate", 
      basePrice: 150, 
      icon: <Shield className="h-5 w-5" />,
      description: "Executive transportation"
    }
  ];

  const vehicleTypeOptions = [
    { 
      label: "Luxury Sedan", 
      value: "sedan", 
      upcharge: 0, 
      icon: <Car className="h-5 w-5" />,
      capacity: "1-3 passengers"
    },
    { 
      label: "Executive SUV", 
      value: "suv", 
      upcharge: 50, 
      icon: <Car className="h-6 w-6" />,
      capacity: "1-6 passengers"
    },
    { 
      label: "Stretch Limousine", 
      value: "limo", 
      upcharge: 100, 
      icon: <Crown className="h-5 w-5" />,
      capacity: "6-10 passengers",
      popular: true
    },
    { 
      label: "Party Bus", 
      value: "party_bus", 
      upcharge: 200, 
      icon: <Users className="h-5 w-5" />,
      capacity: "10-20 passengers"
    }
  ];

  const durationOptions = [
    { label: "1 Hour", value: "1hr", multiplier: 1, icon: <Clock className="h-5 w-5" /> },
    { label: "2-4 Hours", value: "2-4hr", multiplier: 2.5, icon: <Clock className="h-5 w-5" /> },
    { label: "5+ Hours", value: "5hr+", multiplier: 4, discount: 0.1, icon: <Clock className="h-5 w-5" /> },
    { label: "Full Day", value: "full_day", multiplier: 8, discount: 0.15, icon: <Calendar className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Red Carpet Service", 
      value: "red_carpet", 
      price: 75, 
      icon: <Star className="h-4 w-4" />,
      description: "Premium arrival experience"
    },
    { 
      label: "Champagne & Refreshments", 
      value: "champagne", 
      price: 50, 
      icon: <Wine className="h-4 w-4" />,
      description: "Complimentary beverages"
    },
    { 
      label: "Wedding Decorations", 
      value: "decorations", 
      price: 85, 
      icon: <Sparkles className="h-4 w-4" />,
      description: "Custom vehicle styling"
    },
    { 
      label: "Extra Stopovers", 
      value: "extra_stops", 
      price: 25, 
      icon: <MapPin className="h-4 w-4" />,
      description: "Additional pickup/drop-off"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-chauffeur', {
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
        serviceType: result.serviceType || prev.serviceType,
        vehicleType: result.vehicleType || prev.vehicleType,
        duration: result.duration || prev.duration,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const currency = propConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const selectedService = serviceTypeOptions.find(s => s.value === formData.serviceType);
    const selectedVehicle = vehicleTypeOptions.find(v => v.value === formData.vehicleType);
    const selectedDuration = durationOptions.find(d => d.value === formData.duration);
    
    const basePrice = selectedService?.basePrice || propConfig?.basePrice || 0;
    const vehicleUpcharge = selectedVehicle?.upcharge || 0;
    const durationMultiplier = selectedDuration?.multiplier || 1;
    
    // Add-ons total - use dynamic pricing
    const addOnsTotal = formData.addOns.reduce((total, addOnValue) => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      return total + (addOn?.price || 0);
    }, 0);

    const subtotal = (basePrice + vehicleUpcharge) * durationMultiplier + addOnsTotal;
    const discount = (selectedDuration?.discount || 0) * subtotal;
    
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "luxury15") {
      promoDiscount = subtotal * 0.15;
    }

    const total = Math.max(0, subtotal - discount - promoDiscount);
    
    const breakdown = [
      `${selectedService?.label || 'Service'}: €${basePrice}`,
      `${selectedVehicle?.label || 'Vehicle'}: +€${vehicleUpcharge}`,
      `Duration (${selectedDuration?.label || 'N/A'}): ×${durationMultiplier}`,
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +€${addOn?.price || 0}`;
      }),
      ...(discount > 0 ? [`Multi-hour discount: -€${discount.toFixed(2)}`] : []),
      ...(promoDiscount > 0 ? [`Promo code: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    return {
      basePrice,
      durationMultiplier,
      vehicleUpcharge,
      addOnsTotal,
      subtotal,
      discount,
      promoDiscount,
      total,
      breakdown,
      expiresAt
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
          ? "border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md" 
          : "border-gray-200 hover:border-yellow-300 bg-white hover:bg-gradient-to-br hover:from-yellow-50/30 hover:to-amber-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-yellow-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-600 mb-2"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.capacity && (
        <p className="text-xs text-gray-500"><EditableText value={option.capacity} onSave={() => {}} /></p>
      )}
      {option.basePrice && (
        <p className="text-sm font-medium text-yellow-600 mt-2">From €{option.basePrice} onSave={() => {}} /></p>
      )}
      {option.upcharge > 0 && (
        <p className="text-sm font-medium text-yellow-600 mt-2">+€{option.upcharge} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-yellow-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-4">
            <EditableText
              value={textConfig.heroTitle || "Luxury Chauffeur Services"}
              onSave={(value) => updateTextContent('heroTitle', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <p className="text-yellow-100 max-w-2xl mx-auto font-medium text-lg">
            <EditableText
              value={textConfig.heroDescription || "Premium transportation with professional chauffeurs. Elegant vehicles, impeccable service, unforgettable experiences."}
              onSave={(value) => updateTextContent('heroDescription', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-yellow-300">
            <span className="flex items-center">
              <Crown className="h-4 w-4 mr-2" />
              VIP Treatment
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Licensed & Insured
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
            <Card className="p-8 bg-black/80 backdrop-blur-sm border-yellow-500/30 rounded-3xl shadow-2xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-yellow-500 text-black"
                          : currentStep === step.number
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-yellow-100">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-600 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-2xl border border-yellow-500/20">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Transportation Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'Need a stretch limo for prom night with red carpet and drinks' or 'Airport pickup in luxury sedan for corporate client'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-black/40 border-yellow-500/30 text-yellow-100 placeholder-yellow-400/60"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
                  >
                    {isProcessingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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

              {/* Step 1: Service Type & Vehicle */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                      <Crown className="h-5 w-5 mr-2" />
                      <EditableText
                        value={textConfig.serviceSelectionTitle || "Select Service Type"}
                        onSave={(value) => updateTextContent('serviceSelectionTitle', value)}
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
                      disabled={!formData.serviceType}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
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

              {/* Step 2: Vehicle & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      <EditableText
                        value={textConfig.vehicleSelectionTitle || "Choose Your Vehicle"}
                        onSave={(value) => updateTextContent('vehicleSelectionTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicleTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.vehicleType === option.value}
                          onClick={() => setFormData({ ...formData, vehicleType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Service Duration
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
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Premium Add-ons
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
                      className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.vehicleType || !formData.duration}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule & Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Pickup Location</label>
                      <Input
                        placeholder="Address or location"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Drop-off Location</label>
                      <Input
                        placeholder="Destination address"
                        value={formData.dropoffLocation}
                        onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Preferred Date</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Preferred Time</label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-yellow-300 font-medium mb-2">Promo Code (Optional)</label>
                    <Input
                      placeholder="Enter promo code for discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="bg-black/40 border-yellow-500/30 text-yellow-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                    <div>
                      <label className="block text-yellow-300 font-medium mb-2">Phone</label>
                      <Input
                        placeholder="Phone number"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="bg-black/40 border-yellow-500/30 text-yellow-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.generateQuoteButtonText || "Generate Quote"}
                        onSave={(value) => updateTextContent('generateQuoteButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
                      <Crown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black p-6 rounded-2xl">
                    <Crown className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Luxury Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized chauffeur service quote.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-black border-2 border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-black border-2 border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        serviceType: "",
                        vehicleType: "",
                        pickupLocation: "",
                        dropoffLocation: "",
                        duration: "",
                        addOns: [],
                        date: "",
                        time: "",
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
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
              <Card className="p-6 bg-gradient-to-br from-black/90 to-yellow-900/20 border-yellow-500/30 backdrop-blur-sm shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-yellow-200 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-400 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                  <div className="flex items-center justify-center mt-2 text-xs text-yellow-400">
                    <Timer className="h-3 w-3 mr-1" />
                    Quote expires in 48 hours
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-yellow-200"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-yellow-100 font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-yellow-500/30 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-yellow-200">Total:</span>
                    <span className="text-yellow-400">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black py-4 text-lg font-bold rounded-2xl shadow-lg"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  <EditableText
                    value={textConfig.reserveButtonText || "Reserve My Ride"}
                    onSave={(value) => updateTextContent('reserveButtonText', value)}
                    className="font-bold text-lg"
                    isPreview={isPreview}
                  />
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-yellow-400/80">
                    👑 Luxury Service • 🚗 Professional Chauffeurs • ⭐ Premium Experience
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