import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Heart, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  Target,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Monitor,
  Home,
  Zap,
  FileText,
  MapPin,
  Car,
  Droplets
} from "lucide-react";

interface CarDetailingFormData {
  vehicleType: string;
  serviceLevel: string;
  condition: string;
  addOns: string[];
  serviceLocation: string;
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
  vehicleAdjustment: number;
  serviceLevelPrice: number;
  conditionSurcharge: number;
  locationSurcharge: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface CarDetailingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function CarDetailingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: CarDetailingCalculatorProps = {}) {
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
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<CarDetailingFormData>({
    vehicleType: "",
    serviceLevel: "",
    condition: "",
    addOns: [],
    serviceLocation: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const vehicleTypes = [
    { id: "sedan", label: "Sedan", adjustment: 0, icon: "🚗", popular: true },
    { id: "suv", label: "SUV", adjustment: 20, icon: "🚙", popular: true },
    { id: "truck", label: "Truck", adjustment: 25, icon: "🛻", popular: false },
    { id: "van", label: "Van", adjustment: 30, icon: "🚐", popular: false },
    { id: "coupe", label: "Coupe", adjustment: 5, icon: "🏎️", popular: false },
    { id: "motorcycle", label: "Motorcycle", adjustment: -20, icon: "🏍️", popular: false },
  ];

  const serviceLevels = [
    { id: "exterior-wash", label: "Exterior Wash Only", price: 60, icon: "💧", popular: false },
    { id: "interior-clean", label: "Full Interior Clean", price: 80, icon: "🧽", popular: true },
    { id: "full-detail", label: "Full Detail (Interior + Exterior)", price: 150, icon: "✨", popular: true },
    { id: "engine-bay", label: "Engine Bay Clean", price: 100, icon: "🔧", popular: false },
    { id: "ceramic-coating", label: "Ceramic Coating", price: 210, icon: "🛡️", popular: false },
  ];

  const conditions = [
    { id: "light", label: "Light Dirt", surcharge: 0, icon: "😊", popular: true },
    { id: "average", label: "Average", surcharge: 10, icon: "😐", popular: true },
    { id: "heavy", label: "Heavy Soiling / Pet Hair", surcharge: 20, icon: "😵", popular: false },
  ];

  const addOnOptions = [
    { id: "headlight-restoration", label: "Headlight Restoration", price: 40, popular: true, description: "Restore clarity to cloudy headlights" },
    { id: "leather-conditioning", label: "Leather Conditioning", price: 25, popular: true, description: "Deep conditioning for leather seats" },
    { id: "odor-elimination", label: "Odor Elimination", price: 35, popular: false, description: "Professional odor removal treatment" },
    { id: "stain-removal", label: "Stain Removal", price: 30, popular: true, description: "Targeted stain treatment for carpets/seats" },
    { id: "water-spot-treatment", label: "Water Spot Treatment", price: 20, popular: false, description: "Remove water spots from paint" },
  ];

  const serviceLocations = [
    { id: "shop", label: "At Detailer's Shop", surcharge: 0, icon: "🏪", popular: false },
    { id: "mobile", label: "At Customer's Address", surcharge: 25, icon: "🏠", popular: true },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const vehicle = vehicleTypes.find(v => v.id === formData.vehicleType);
    const service = serviceLevels.find(s => s.id === formData.serviceLevel);
    const condition = conditions.find(c => c.id === formData.condition);
    const location = serviceLocations.find(l => l.id === formData.serviceLocation);

    const basePrice = service?.price || customConfig?.basePrice || 60;
    const vehicleAdjustment = vehicle?.adjustment || 0;
    const serviceLevelPrice = 0; // Already included in base price
    const conditionSurcharge = condition?.surcharge || 0;
    const locationSurcharge = location?.surcharge || 0;

    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base service price
    breakdown.push(`${service?.label || 'Base service'}: ${currencySymbol}${basePrice}`);
    
    // Vehicle type adjustment
    if (vehicleAdjustment !== 0) {
      const adjustment = vehicleAdjustment > 0 ? `+${currencySymbol}${vehicleAdjustment}` : `-${currencySymbol}${Math.abs(vehicleAdjustment)}`;
      breakdown.push(`${vehicle?.label} adjustment: ${adjustment}`);
    }
    
    // Condition surcharge
    if (conditionSurcharge > 0) {
      breakdown.push(`${condition?.label} surcharge: +${currencySymbol}${conditionSurcharge}`);
    }
    
    // Location surcharge
    if (locationSurcharge > 0) {
      breakdown.push(`${location?.label}: +${currencySymbol}${locationSurcharge}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        breakdown.push(`${addOn.label}: +${currencySymbol}${addOn.price}`);
        addOnsTotal += addOn.price;
      }
    });

    let subtotal = basePrice + vehicleAdjustment + conditionSurcharge + locationSurcharge + addOnsTotal;

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "shine10" || formData.promoCode.toLowerCase() === "detail10") {
      promoDiscount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${promoDiscount.toFixed(2)}`);
    }

    const total = Math.max(0, subtotal - promoDiscount);

    return {
      basePrice,
      vehicleAdjustment,
      serviceLevelPrice,
      conditionSurcharge,
      locationSurcharge,
      addOnsTotal,
      subtotal,
      promoDiscount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse vehicle type
    if (input.includes("suv") || input.includes("jeep")) newFormData.vehicleType = "suv";
    else if (input.includes("truck") || input.includes("pickup")) newFormData.vehicleType = "truck";
    else if (input.includes("van") || input.includes("minivan")) newFormData.vehicleType = "van";
    else if (input.includes("coupe") || input.includes("sports car")) newFormData.vehicleType = "coupe";
    else if (input.includes("motorcycle") || input.includes("bike")) newFormData.vehicleType = "motorcycle";
    else newFormData.vehicleType = "sedan";

    // Parse service level
    if (input.includes("full detail") || input.includes("complete detail")) newFormData.serviceLevel = "full-detail";
    else if (input.includes("interior") || input.includes("inside")) newFormData.serviceLevel = "interior-clean";
    else if (input.includes("engine") || input.includes("motor")) newFormData.serviceLevel = "engine-bay";
    else if (input.includes("ceramic") || input.includes("coating")) newFormData.serviceLevel = "ceramic-coating";
    else newFormData.serviceLevel = "exterior-wash";

    // Parse condition
    if (input.includes("heavy") || input.includes("dirty") || input.includes("pet hair")) newFormData.condition = "heavy";
    else if (input.includes("average") || input.includes("normal")) newFormData.condition = "average";
    else newFormData.condition = "light";

    // Parse location
    if (input.includes("house") || input.includes("home") || input.includes("my place") || input.includes("mobile")) newFormData.serviceLocation = "mobile";
    else newFormData.serviceLocation = "shop";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("headlight") || input.includes("lights")) newAddOns.push("headlight-restoration");
    if (input.includes("leather") || input.includes("conditioning")) newAddOns.push("leather-conditioning");
    if (input.includes("odor") || input.includes("smell")) newAddOns.push("odor-elimination");
    if (input.includes("stain") || input.includes("spot")) newAddOns.push("stain-removal");
    if (input.includes("water spot") || input.includes("water mark")) newAddOns.push("water-spot-treatment");
    newFormData.addOns = newAddOns;

    setFormData(newFormData);
  };

  const downloadQuotePDF = () => {
    console.log("Downloading PDF quote...");
  };

  const OptionCard = ({ 
    option, 
    selected, 
    onClick, 
    icon, 
    popular = false 
  }: { 
    option: any; 
    selected: boolean; 
    onClick: () => void; 
    icon?: string; 
    popular?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-teal-400 bg-teal-50 shadow-lg" 
          : "border-gray-300 hover:border-teal-300 bg-white hover:bg-teal-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-teal-800" : "text-gray-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.adjustment !== undefined && option.adjustment > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-teal-600" : "text-gray-500"}`}>
            +€{option.adjustment}
          </div>
        )}
        {option.adjustment !== undefined && option.adjustment < 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-teal-600" : "text-gray-500"}`}>
            -€{Math.abs(option.adjustment)}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-teal-600" : "text-gray-500"}`}>
            €{option.price}
          </div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-teal-600" : "text-gray-500"}`}>
            +€{option.surcharge}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Vehicle & Service", completed: !!formData.vehicleType && !!formData.serviceLevel },
    { number: 2, title: "Condition & Location", completed: !!formData.condition && !!formData.serviceLocation },
    { number: 3, title: "Add-ons", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-teal-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

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
                          ? "bg-teal-500 text-white"
                          : currentStep === step.number
                          ? "bg-teal-400 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-teal-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Vehicle & Service */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Car className="h-6 w-6 mr-2 text-teal-500" />
                      <EditableText
                        value={textConfig.serviceTitle || "Vehicle and service details"}
                        onSave={(value) => updateTextContent('serviceTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your detailing needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need full detail for my SUV, plus stain removal at my house"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-teal-200 text-gray-800 mb-3 resize-none placeholder:text-gray-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-teal-500 hover:bg-teal-600 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Vehicle Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {vehicleTypes.map((vehicle) => (
                            <OptionCard
                              key={vehicle.id}
                              option={vehicle}
                              selected={formData.vehicleType === vehicle.id}
                              onClick={() => setFormData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                              icon={vehicle.icon}
                              popular={vehicle.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Service Level</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {serviceLevels.map((service) => (
                            <OptionCard
                              key={service.id}
                              option={service}
                              selected={formData.serviceLevel === service.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceLevel: service.id }))}
                              icon={service.icon}
                              popular={service.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.vehicleType || !formData.serviceLevel}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
                    >
                      <EditableText
                        value={textConfig.nextStepButtonText || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButtonText', value)}
                        className="font-medium"
                        isPreview={isPreview}
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Condition & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Droplets className="h-6 w-6 mr-2 text-teal-500" />
                      Vehicle condition and service location
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Condition of Vehicle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {conditions.map((condition) => (
                            <OptionCard
                              key={condition.id}
                              option={condition}
                              selected={formData.condition === condition.id}
                              onClick={() => setFormData(prev => ({ ...prev, condition: condition.id }))}
                              icon={condition.icon}
                              popular={condition.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Service Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {serviceLocations.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.serviceLocation === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceLocation: location.id }))}
                              icon={location.icon}
                              popular={location.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
                    >
                      <EditableText
                        value={textConfig.previousButtonText || "Previous"}
                        onSave={(value) => updateTextContent('previousButtonText', value)}
                        className="font-medium"
                        isPreview={isPreview}
                      />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.condition || !formData.serviceLocation}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-teal-500" />
                      Enhancement add-ons
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Premium Add-On Services (Optional)</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-teal-400 bg-teal-50 shadow-lg text-gray-800"
                                  : "border-gray-300 hover:border-teal-300 bg-white text-gray-700 hover:bg-teal-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-bold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-gray-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-bold ml-4 ${formData.addOns.includes(addOn.id) ? "text-teal-600" : "text-gray-500"}`}>
                                  €{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.vehicleType === "suv" && formData.serviceLevel === "full-detail" && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="text-sm text-amber-800">
                              🚙 SUV Recommendation: Headlight Restoration + Odor Elimination combo for best results
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Info */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-teal-500" />
                      Get your detailing quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Promo Code (Optional)
                        </label>
                        <Input
                          placeholder="Enter promo code (e.g., SHINE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
                    >
                      <EditableText
                        value={textConfig.getQuoteButtonText || "Get Quote"}
                        onSave={(value) => updateTextContent('getQuoteButtonText', value)}
                        className="font-medium"
                        isPreview={isPreview}
                      />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Detailing Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-teal-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-teal-600 font-medium"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.promoDiscount > 0 && (
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-teal-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Make your car shine</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 48 hours. Professional detailing that protects and enhances your vehicle.
                    </p>
                    
                    <Button 
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 font-bold rounded-xl"
                      onClick={() => {
                        const subject = "Car Detailing Service Booking";
                        const body = `I'm ready to book my car detailing service! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@glossgarage.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🚗 Book My Detail
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-1"></div>
                        Expert service
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-1"></div>
                        Premium products
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-teal-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
                        onClick={downloadQuotePDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Quote PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}