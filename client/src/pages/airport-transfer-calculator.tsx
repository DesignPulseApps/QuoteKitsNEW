import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Plane, 
  Car, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Baby,
  Luggage,
  Shield,
  Timer,
  Download,
  Mail,
  ArrowLeftRight,
  Sparkles
} from "lucide-react";

interface AirportTransferFormData {
  pickupLocation: string;
  destinationAirport: string;
  passengers: number;
  vehicleType: string;
  pickupDate: string;
  pickupTime: string;
  addOns: string[];
  returnTrip: boolean;
  returnDate: string;
  returnTime: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  baseFare: number;
  passengerSurcharge: number;
  vehicleUpgrade: number;
  addOnsTotal: number;
  nightSurcharge: number;
  returnFare: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface AirportTransferCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function AirportTransferCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: AirportTransferCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<AirportTransferFormData>({
    pickupLocation: "",
    destinationAirport: "",
    passengers: 1,
    vehicleType: "",
    pickupDate: "",
    pickupTime: "",
    addOns: [],
    returnTrip: false,
    returnDate: "",
    returnTime: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Route & Passengers", completed: currentStep > 1 },
    { number: 2, title: "Vehicle & Add-ons", completed: currentStep > 2 },
    { number: 3, title: "Schedule & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const airportOptions = [
    { label: "Vienna International Airport (VIE)", value: "vie", distance: 35 },
    { label: "Munich Airport (MUC)", value: "muc", distance: 45 },
    { label: "Frankfurt Airport (FRA)", value: "fra", distance: 55 },
    { label: "Zurich Airport (ZUR)", value: "zur", distance: 40 },
    { label: "Prague Airport (PRG)", value: "prg", distance: 30 },
    { label: "Other Airport", value: "other", distance: 40 }
  ];

  const vehicleTypeOptions = [
    { 
      label: "Economy Car", 
      value: "economy", 
      basePrice: 35, 
      icon: <Car className="h-5 w-5" />,
      capacity: "1-3 passengers",
      description: "Comfortable and affordable"
    },
    { 
      label: "Executive Sedan", 
      value: "sedan", 
      basePrice: 55, 
      icon: <Car className="h-5 w-5" />,
      capacity: "1-3 passengers",
      description: "Professional luxury service",
      popular: true
    },
    { 
      label: "SUV", 
      value: "suv", 
      basePrice: 75, 
      icon: <Car className="h-6 w-6" />,
      capacity: "1-6 passengers",
      description: "Spacious and comfortable"
    },
    { 
      label: "Van", 
      value: "van", 
      basePrice: 85, 
      icon: <Car className="h-6 w-6" />,
      capacity: "1-8 passengers",
      description: "Perfect for groups"
    },
    { 
      label: "Shuttle Bus", 
      value: "shuttle", 
      basePrice: 25, 
      icon: <Users className="h-5 w-5" />,
      capacity: "Shared service",
      description: "Budget-friendly option"
    }
  ];

  const addOnOptions = [
    { 
      label: "Baby Seat", 
      value: "baby_seat", 
      price: 10, 
      icon: <Baby className="h-4 w-4" />,
      description: "Child safety seat included"
    },
    { 
      label: "Extra Luggage", 
      value: "extra_luggage", 
      price: 8, 
      icon: <Luggage className="h-4 w-4" />,
      description: "Additional baggage space"
    },
    { 
      label: "Meet & Greet", 
      value: "meet_greet", 
      price: 15, 
      icon: <Star className="h-4 w-4" />,
      description: "Personal assistance at airport"
    },
    { 
      label: "Flight Tracking", 
      value: "flight_tracking", 
      price: 5, 
      icon: <Plane className="h-4 w-4" />,
      description: "Real-time flight monitoring"
    }
  ];

  const popularRoutes = [
    "City Center → Vienna Airport",
    "Hotel District → Munich Airport", 
    "Main Station → Frankfurt Airport",
    "Business District → Zurich Airport"
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-airport-transfer', {
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
        destinationAirport: result.destinationAirport || prev.destinationAirport,
        vehicleType: result.vehicleType || prev.vehicleType,
        passengers: result.passengers || prev.passengers,
        addOns: result.addOns?.length ? result.addOns : prev.addOns,
        returnTrip: result.returnTrip !== undefined ? result.returnTrip : prev.returnTrip
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
    
    const selectedVehicle = vehicleTypeOptions.find(v => v.value === formData.vehicleType);
    const selectedAirport = airportOptions.find(a => a.value === formData.destinationAirport);
    
    const baseFare = selectedVehicle?.basePrice || propConfig?.basePrice || 0;
    const distanceMultiplier = (selectedAirport?.distance || 40) / 35; // Base distance 35km
    const adjustedBaseFare = baseFare * distanceMultiplier;
    
    // Extra passenger surcharge (after 3 passengers)
    const extraPassengers = Math.max(0, formData.passengers - 3);
    const passengerSurcharge = extraPassengers * 8;
    
    // Vehicle upgrade costs already included in base price
    const vehicleUpgrade = 0;
    
    // Add-ons total - use dynamic pricing
    const addOnsTotal = formData.addOns.reduce((total, addOnValue) => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      return total + (addOn?.price || 0);
    }, 0);

    // Night surcharge (22:00 - 06:00)
    let nightSurcharge = 0;
    if (formData.pickupTime) {
      const hour = parseInt(formData.pickupTime.split(':')[0]);
      if (hour >= 22 || hour < 6) {
        nightSurcharge = adjustedBaseFare * 0.2; // 20% night surcharge
      }
    }

    // Return trip calculation
    const singleTripTotal = adjustedBaseFare + passengerSurcharge + addOnsTotal + nightSurcharge;
    const returnFare = formData.returnTrip ? singleTripTotal * 1.8 : 0;
    
    const subtotal = singleTripTotal + returnFare;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "airport10") {
      promoDiscount = subtotal * 0.1;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `Base fare to ${selectedAirport?.label || 'airport'}: ${currencySymbol}${adjustedBaseFare.toFixed(2)}`,
      ...(passengerSurcharge > 0 ? [`Extra passengers (${extraPassengers}): +${currencySymbol}${passengerSurcharge}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +${currencySymbol}${addOn?.price || 0}`;
      }),
      ...(nightSurcharge > 0 ? [`Night surcharge (22:00-06:00): +${currencySymbol}${nightSurcharge.toFixed(2)}`] : []),
      ...(returnFare > 0 ? [`Return trip: +${currencySymbol}${returnFare.toFixed(2)}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -${currencySymbol}${promoDiscount.toFixed(2)}`] : [])
    ];

    return {
      baseFare: adjustedBaseFare,
      passengerSurcharge,
      vehicleUpgrade,
      addOnsTotal,
      nightSurcharge,
      returnFare,
      subtotal,
      promoDiscount,
      total,
      breakdown
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
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 shadow-md" 
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-sky-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-blue-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs">
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
        <p className="text-sm font-medium text-blue-600 mt-2">From €{option.basePrice} onSave={() => {}} /></p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-blue-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 mb-4">
            <EditableText
              value={textConfig.heroTitle || "Airport Transfer Services"}
              onSave={(value) => updateTextContent('heroTitle', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <p className="text-blue-700 max-w-2xl mx-auto font-medium text-lg">
            <EditableText
              value={textConfig.heroDescription || "Professional airport transfers with punctual service, comfortable vehicles, and competitive rates."}
              onSave={(value) => updateTextContent('heroDescription', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-600">
            <span className="flex items-center">
              <Plane className="h-4 w-4 mr-2" />
              Flight Tracking
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Licensed Drivers
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              24/7 Service
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-400 text-white"
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
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Transfer Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'Pickup from hotel in city center to Vienna airport, 4 people, baby seat' or 'Round trip to Munich airport with meet and greet'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-white border-blue-300 text-blue-900 placeholder-blue-400"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
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

              {/* Popular Routes */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Popular Routes:</h4>
                <div className="flex flex-wrap gap-2">
                  {popularRoutes.map((route, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-100 cursor-pointer">
                      {route}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Step 1: Route & Passengers */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <EditableText
                          value={textConfig.pickupLocationLabel || "Pickup Location"}
                          onSave={(value) => updateTextContent('pickupLocationLabel', value)}
                          className="font-medium"
                          isPreview={isPreview}
                        />
                      </label>
                      <Input
                        placeholder="Hotel, address, or area"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 flex items-center">
                        <Plane className="h-4 w-4 mr-2 text-blue-500" />
                        Destination Airport
                      </label>
                      <select
                        value={formData.destinationAirport}
                        onChange={(e) => setFormData({ ...formData, destinationAirport: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select airport</option>
                        {airportOptions.map((airport) => (
                          <option key={airport.value} value={airport.value}>
                            {airport.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      Number of Passengers
                    </label>
                    <div className="flex items-center space-x-4">
                      {[1,2,3,4,5,6,7,8].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFormData({ ...formData, passengers: num })}
                          className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                            formData.passengers === num
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-300 text-gray-600 hover:border-blue-300"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.pickupLocation || !formData.destinationAirport}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3"
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
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Car className="h-5 w-5 mr-2 text-blue-500" />
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
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-500" />
                      <EditableText
                        value={textConfig.additionalServicesTitle || "Additional Services"}
                        onSave={(value) => updateTextContent('additionalServicesTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
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

                  <div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Return Trip</span>
                        <span className="text-sm text-blue-600">(1.8× single fare)</span>
                      </div>
                      <Switch
                        checked={formData.returnTrip}
                        onCheckedChange={(checked) => setFormData({ ...formData, returnTrip: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.vehicleType}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.continueStep3ButtonText || "Continue"}
                        onSave={(value) => updateTextContent('continueStep3ButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
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
                      <label className="block text-gray-700 font-medium mb-2">Pickup Date</label>
                      <Input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Pickup Time</label>
                      <Input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {formData.returnTrip && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Return Date</label>
                        <Input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Return Time</label>
                        <Input
                          type="time"
                          value={formData.returnTime}
                          onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Promo Code (Optional)</label>
                    <Input
                      placeholder="Enter promo code for discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        className="border-blue-300 focus:border-blue-500"
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
                        className="border-blue-300 focus:border-blue-500"
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
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email || !formData.pickupDate || !formData.pickupTime}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3"
                    >
                      <EditableText
                        value={textConfig.generateQuoteButtonText || "Generate Quote"}
                        onSave={(value) => updateTextContent('generateQuoteButtonText', value)}
                        className="font-semibold"
                        isPreview={isPreview}
                      />
                      <Plane className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white p-6 rounded-2xl">
                    <Plane className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Transfer Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized airport transfer quote.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        pickupLocation: "",
                        destinationAirport: "",
                        passengers: 1,
                        vehicleType: "",
                        pickupDate: "",
                        pickupTime: "",
                        addOns: [],
                        returnTrip: false,
                        returnDate: "",
                        returnTime: "",
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
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
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-blue-200 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                  {formData.pickupTime && (
                    <div className="flex items-center justify-center mt-2 text-xs text-blue-600">
                      <Timer className="h-3 w-3 mr-1" />
                      {(() => {
                        const hour = parseInt(formData.pickupTime.split(':')[0]);
                        return hour >= 22 || hour < 6 ? "Night surcharge applied" : "Standard rate";
                      })()}
                    </div>
                  )}
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
                    <span>Total:</span>
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Plane className="mr-2 h-5 w-5" />
                  <EditableText
                    value={textConfig.bookTransferButtonText || "Book Airport Transfer"}
                    onSave={(value) => updateTextContent('bookTransferButtonText', value)}
                    className="font-semibold text-lg"
                    isPreview={isPreview}
                  />
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    ✈️ Professional service • 🚗 Modern fleet • 📱 Flight tracking
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