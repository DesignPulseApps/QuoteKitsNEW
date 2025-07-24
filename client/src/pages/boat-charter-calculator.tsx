import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Anchor, 
  Waves, 
  Users,
  MapPin,
  Clock,
  Calendar,
  Star,
  Compass,
  Ship,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Timer,
  Download,
  Mail,
  Music,
  Camera,
  Utensils,
  Gamepad2
} from "lucide-react";

interface BoatCharterFormData {
  boatType: string;
  duration: string;
  guests: string;
  departureLocation: string;
  extras: string[];
  preferredDate: string;
  specialRequests: string;
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
  extraHoursFee: number;
  extrasTotal: number;
  guestSurcharge: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface BoatCharterCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function BoatCharterCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: BoatCharterCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<BoatCharterFormData>({
    boatType: "",
    duration: "",
    guests: "",
    departureLocation: "",
    extras: [],
    preferredDate: "",
    specialRequests: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Boat & Duration", completed: currentStep > 1 },
    { number: 2, title: "Guests & Location", completed: currentStep > 2 },
    { number: 3, title: "Extras & Details", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const boatTypeOptions = [
    { 
      label: "Sailboat", 
      value: "sailboat", 
      baseRate: 450, 
      icon: <Ship className="h-5 w-5" />,
      description: "Classic sailing experience",
      capacity: "Up to 8 guests"
    },
    { 
      label: "Catamaran", 
      value: "catamaran", 
      baseRate: 650, 
      icon: <Ship className="h-6 w-6" />,
      description: "Stable and spacious",
      capacity: "Up to 12 guests",
      popular: true
    },
    { 
      label: "Motor Yacht", 
      value: "motor_yacht", 
      baseRate: 900, 
      icon: <Anchor className="h-5 w-5" />,
      description: "Luxury and comfort",
      capacity: "Up to 15 guests"
    },
    { 
      label: "Speedboat", 
      value: "speedboat", 
      baseRate: 350, 
      icon: <Waves className="h-5 w-5" />,
      description: "Fast and thrilling",
      capacity: "Up to 6 guests"
    },
    { 
      label: "Fishing Boat", 
      value: "fishing_boat", 
      baseRate: 400, 
      icon: <Compass className="h-5 w-5" />,
      description: "Perfect for angling",
      capacity: "Up to 8 guests"
    },
    { 
      label: "Party Boat", 
      value: "party_boat", 
      baseRate: 750, 
      icon: <Music className="h-5 w-5" />,
      description: "Entertainment focused",
      capacity: "Up to 50 guests"
    }
  ];

  const durationOptions = [
    { label: "2 Hours", value: "2_hours", baseHours: 2, icon: <Clock className="h-5 w-5" /> },
    { label: "Half Day (4 hours)", value: "half_day", baseHours: 4, icon: <Clock className="h-5 w-5" /> },
    { label: "Full Day (8 hours)", value: "full_day", baseHours: 8, icon: <Clock className="h-5 w-5" />, popular: true },
    { label: "Sunset Cruise (3 hours)", value: "sunset", baseHours: 3, icon: <Timer className="h-5 w-5" /> },
    { label: "Multi-Day", value: "multi_day", baseHours: 24, icon: <Calendar className="h-5 w-5" /> }
  ];

  const extrasOptions = [
    { 
      label: "Captain & Crew", 
      value: "captain_crew", 
      price: 150, 
      icon: <Anchor className="h-4 w-4" />,
      description: "Professional navigation"
    },
    { 
      label: "Catering / Drinks", 
      value: "catering", 
      price: 250, 
      icon: <Utensils className="h-4 w-4" />,
      description: "Food and beverages"
    },
    { 
      label: "Water Toys", 
      value: "water_toys", 
      price: 75, 
      icon: <Gamepad2 className="h-4 w-4" />,
      description: "Jetski, paddleboards"
    },
    { 
      label: "Photographer", 
      value: "photographer", 
      price: 200, 
      icon: <Camera className="h-4 w-4" />,
      description: "Professional photos/drone"
    },
    { 
      label: "Live DJ / Music", 
      value: "dj_music", 
      price: 180, 
      icon: <Music className="h-4 w-4" />,
      description: "Entertainment system"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-boat-charter', {
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
        boatType: result.boatType || prev.boatType,
        duration: result.duration || prev.duration,
        guests: result.guests || prev.guests,
        extras: result.extras?.length ? result.extras : prev.extras
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
    
    const selectedBoat = boatTypeOptions.find(b => b.value === formData.boatType);
    const selectedDuration = durationOptions.find(d => d.value === formData.duration);
    const guestCount = parseInt(formData.guests) || 0;
    
    const baseRate = selectedBoat?.baseRate || customConfig?.basePrice || 0;
    const baseHours = selectedDuration?.baseHours || 4;
    
    // Calculate base cost (already includes standard duration)
    const baseCost = baseRate;
    
    // Extra hours fee (for multi-day or extended charters)
    const extraHoursFee = formData.duration === 'multi_day' ? baseRate * 1.5 : 0;
    
    // Extras total - use dynamic pricing
    const extrasTotal = formData.extras.reduce((total, extraValue) => {
      const extra = extrasOptions.find(e => e.value === extraValue);
      return total + (extra?.price || 0);
    }, 0);

    // Guest surcharge for party boats with more than 15 guests
    let guestSurcharge = 0;
    if (formData.boatType === 'party_boat' && guestCount > 15) {
      guestSurcharge = (guestCount - 15) * 20;
    }
    
    const subtotal = baseCost + extraHoursFee + extrasTotal + guestSurcharge;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "ocean10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedBoat?.label || 'Boat'} (${selectedDuration?.label || 'Duration'}): €${baseCost.toFixed(2)}`,
      ...(extraHoursFee > 0 ? [`Multi-day surcharge: +€${extraHoursFee.toFixed(2)}`] : []),
      ...formData.extras.map(extraValue => {
        const extra = extrasOptions.find(e => e.value === extraValue);
        return `${extra?.label || 'Extra'}: +€${extra?.price || 0}`;
      }),
      ...(guestSurcharge > 0 ? [`Large group surcharge: +€${guestSurcharge}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 48 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 48);

    return {
      baseRate: baseCost,
      extraHoursFee,
      extrasTotal,
      guestSurcharge,
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
          ? "border-teal-500 bg-gradient-to-br from-teal-50 to-blue-50 shadow-md" 
          : "border-slate-300 hover:border-teal-400 bg-white hover:bg-gradient-to-br hover:from-teal-50/30 hover:to-blue-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-teal-800" : "text-slate-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs">
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
        <p className="text-sm font-medium text-teal-600 mt-2">From €{option.baseRate} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-teal-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-300 to-amber-400 mb-4">
            <EditableText
              value={textConfig.heroTitle || "Boat Charter Services"}
              onSave={(value) => updateTextContent('heroTitle', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto font-medium text-lg">
            <EditableText
              value={textConfig.heroDescription || "Luxury maritime experiences with professional crew, premium amenities, and unforgettable memories on the water."}
              onSave={(value) => updateTextContent('heroDescription', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-teal-300">
            <span className="flex items-center">
              <Anchor className="h-4 w-4 mr-2" />
              Licensed Captain
            </span>
            <span className="flex items-center">
              <Waves className="h-4 w-4 mr-2" />
              Premium Fleet
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
                          ? "bg-teal-600 text-white"
                          : currentStep === step.number
                          ? "bg-teal-500 text-white"
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
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-teal-300">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Charter Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'I want a catamaran for 12 people, sunset cruise, drinks included' or 'Motor yacht for wedding party with photographer'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-white border-teal-300 text-slate-900 placeholder-slate-400"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
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

              {/* Step 1: Boat Type & Duration */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Anchor className="h-5 w-5 mr-2 text-teal-600" />
                      <EditableText
                        value={textConfig.vesselSelectionTitle || "Choose Your Vessel"}
                        onSave={(value) => updateTextContent('vesselSelectionTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {boatTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.boatType === option.value}
                          onClick={() => setFormData({ ...formData, boatType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-teal-600" />
                      <EditableText
                        value={textConfig.durationSelectionTitle || "Charter Duration"}
                        onSave={(value) => updateTextContent('durationSelectionTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {durationOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.duration === option.value}
                          onClick={() => setFormData({ ...formData, duration: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.boatType || !formData.duration}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3"
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

              {/* Step 2: Guests & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-teal-600" />
                        Number of Guests
                      </label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      >
                        <option value="">Select guest count</option>
                        {[...Array(50)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                        <option value="50+">50+ guests</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                        Departure Location
                      </label>
                      <Input
                        placeholder="Marina name or address"
                        value={formData.departureLocation}
                        onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                        className="border-slate-300 focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                      Preferred Date
                    </label>
                    <Input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="border-slate-300 focus:border-teal-600 max-w-xs"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.guests || !formData.departureLocation}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Extras & Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-teal-600" />
                      Charter Extras
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
                      <label className="block text-slate-700 font-medium mb-2">Special Requests</label>
                      <Textarea
                        placeholder="Any special requirements or requests..."
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        className="border-slate-300 focus:border-teal-600"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Promo Code</label>
                      <Input
                        placeholder="Enter promo code"
                        value={formData.promoCode}
                        onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                        className="border-slate-300 focus:border-teal-600"
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
                        className="border-slate-300 focus:border-teal-600"
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
                        className="border-slate-300 focus:border-teal-600"
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
                        className="border-slate-300 focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.generateQuoteButtonText || "Generate Quote"}
                        onSave={(value) => updateTextContent('generateQuoteButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
                      <Anchor className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-2xl">
                    <Anchor className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Charter Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized boat charter quote.</p>
                    <div className="mt-4 p-3 bg-white/20 rounded-lg">
                      <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        boatType: "",
                        duration: "",
                        guests: "",
                        departureLocation: "",
                        extras: [],
                        preferredDate: "",
                        specialRequests: "",
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
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
                  <div className="text-3xl font-bold text-teal-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-slate-600 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Expiry Timer */}
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-amber-700">Quote Valid For</span>
                  </div>
                  <div className="text-center text-xs text-amber-600">
                    48 hours from generation
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
                    <span className="text-teal-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Anchor className="mr-2 h-5 w-5" />
                  <EditableText
                    value={textConfig.reserveButtonText || "Reserve Your Boat"}
                    onSave={(value) => updateTextContent('reserveButtonText', value)}
                    className="font-semibold text-lg"
                    isPreview={isPreview}
                  />
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    ⚓ Licensed captains • 🛥️ Premium fleet • 🌊 Unforgettable experience
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