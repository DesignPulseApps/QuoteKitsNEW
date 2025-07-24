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
  Droplets,
  Wrench,
  Settings,
  Battery,
  Shield
} from "lucide-react";

interface AutoMechanicFormData {
  vehicleType: string;
  serviceNeeded: string;
  urgency: string;
  serviceLocation: string;
  addOns: string[];
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
  urgencyAdjustment: number;
  locationSurcharge: number;
  addOnsTotal: number;
  premiumPartsAdjustment: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface AutoMechanicCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function AutoMechanicCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: AutoMechanicCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [textConfig, setTextConfig] = useState<any>(propConfig?.textContent || {});
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    const updated = { ...textConfig, [key]: value };
    setTextConfig(updated);
    if (onConfigChange) {
      onConfigChange({
        ...propConfig,
        textContent: updated
      });
    }
  };
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  
  const [formData, setFormData] = useState<AutoMechanicFormData>({
    vehicleType: "",
    serviceNeeded: "",
    urgency: "",
    serviceLocation: "",
    addOns: [],
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
    { id: "suv", label: "SUV", adjustment: 30, icon: "🚙", popular: true },
    { id: "truck", label: "Truck", adjustment: 40, icon: "🛻", popular: false },
    { id: "van", label: "Van", adjustment: 35, icon: "🚐", popular: false },
    { id: "electric-hybrid", label: "Electric / Hybrid", adjustment: 50, icon: "⚡", popular: false },
  ];

  const servicesNeeded = [
    { id: "oil-change", label: "Oil Change", price: 60, icon: "🛢️", popular: true },
    { id: "brake-replacement", label: "Brake Replacement", price: 180, icon: "🔧", popular: true },
    { id: "tire-service", label: "Tire Rotation / Replacement", price: 80, icon: "⚙️", popular: true },
    { id: "engine-diagnostics", label: "Engine Diagnostics", price: 120, icon: "🔍", popular: false },
    { id: "battery-replacement", label: "Battery Replacement", price: 150, icon: "🔋", popular: false },
    { id: "suspension-alignment", label: "Suspension / Alignment", price: 200, icon: "⚖️", popular: false },
  ];

  const urgencyLevels = [
    { id: "flexible", label: "Flexible / Book Anytime", adjustment: 0, icon: "📅", popular: true },
    { id: "within-3-days", label: "Within 3 Days", adjustment: 20, icon: "⏰", popular: true },
    { id: "emergency", label: "Emergency / ASAP", adjustment: 50, icon: "🚨", popular: false },
  ];

  const serviceLocations = [
    { id: "at-shop", label: "At Shop", surcharge: 0, icon: "🏪", popular: true },
    { id: "mobile", label: "Mobile (at customer's location)", surcharge: 35, icon: "🚗", popular: false },
  ];

  const addOnOptions = [
    { id: "pickup-dropoff", label: "Pickup & Drop-off", price: 25, popular: true, description: "Free vehicle pickup and delivery service" },
    { id: "premium-parts", label: "Premium Parts", price: 0, isPercentage: true, percentage: 15, popular: true, description: "High-quality OEM or premium parts (+15%)" },
    { id: "car-wash", label: "Car Wash After Service", price: 20, popular: false, description: "Complete exterior wash and interior vacuum" },
    { id: "extended-warranty", label: "Extended Warranty", price: 40, popular: false, description: "Additional 6-month warranty on parts and labor" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const vehicle = vehicleTypes.find(v => v.id === formData.vehicleType);
    const service = servicesNeeded.find(s => s.id === formData.serviceNeeded);
    const urgency = urgencyLevels.find(u => u.id === formData.urgency);
    const location = serviceLocations.find(l => l.id === formData.serviceLocation);

    const basePrice = service?.price || customConfig?.basePrice || 40;
    const vehicleAdjustment = vehicle?.adjustment || 0;
    const urgencyAdjustment = urgency?.adjustment || 0;
    const locationSurcharge = location?.surcharge || 0;

    let addOnsTotal = 0;
    let premiumPartsAdjustment = 0;
    const breakdown: string[] = [];

    // Base service price
    breakdown.push(`${service?.label || 'Base inspection'}: ${currencySymbol}${basePrice}`);
    
    // Vehicle type adjustment
    if (vehicleAdjustment > 0) {
      breakdown.push(`${vehicle?.label} surcharge: +${currencySymbol}${vehicleAdjustment}`);
    }
    
    // Urgency adjustment
    if (urgencyAdjustment > 0) {
      breakdown.push(`${urgency?.label}: +${currencySymbol}${urgencyAdjustment}`);
    }
    
    // Location surcharge
    if (locationSurcharge > 0) {
      breakdown.push(`${location?.label}: +${currencySymbol}${locationSurcharge}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        if (addOn.isPercentage) {
          // Premium parts percentage will be calculated after base total
          breakdown.push(`${addOn.label}: +${addOn.percentage}%`);
        } else if (addOn.price > 0) {
          breakdown.push(`${addOn.label}: +${currencySymbol}${addOn.price}`);
          addOnsTotal += addOn.price;
        }
      }
    });

    let subtotalBeforePremium = basePrice + vehicleAdjustment + urgencyAdjustment + locationSurcharge + addOnsTotal;

    // Premium parts percentage
    if (formData.addOns.includes("premium-parts")) {
      premiumPartsAdjustment = subtotalBeforePremium * 0.15;
    }

    let subtotal = subtotalBeforePremium + premiumPartsAdjustment;

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "fix10" || formData.promoCode.toLowerCase() === "repair10") {
      promoDiscount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${promoDiscount.toFixed(2)}`);
    }

    const total = Math.max(0, subtotal - promoDiscount);

    return {
      basePrice,
      vehicleAdjustment,
      urgencyAdjustment,
      locationSurcharge,
      addOnsTotal,
      premiumPartsAdjustment,
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
    else if (input.includes("electric") || input.includes("hybrid") || input.includes("tesla")) newFormData.vehicleType = "electric-hybrid";
    else newFormData.vehicleType = "sedan";

    // Parse service needed
    if (input.includes("brake") || input.includes("brakes")) newFormData.serviceNeeded = "brake-replacement";
    else if (input.includes("oil") || input.includes("oil change")) newFormData.serviceNeeded = "oil-change";
    else if (input.includes("tire") || input.includes("tires") || input.includes("rotation")) newFormData.serviceNeeded = "tire-service";
    else if (input.includes("engine") || input.includes("diagnostic")) newFormData.serviceNeeded = "engine-diagnostics";
    else if (input.includes("battery")) newFormData.serviceNeeded = "battery-replacement";
    else if (input.includes("suspension") || input.includes("alignment")) newFormData.serviceNeeded = "suspension-alignment";
    else newFormData.serviceNeeded = "oil-change";

    // Parse urgency
    if (input.includes("emergency") || input.includes("asap") || input.includes("urgent")) newFormData.urgency = "emergency";
    else if (input.includes("3 days") || input.includes("soon") || input.includes("quickly")) newFormData.urgency = "within-3-days";
    else newFormData.urgency = "flexible";

    // Parse location
    if (input.includes("mobile") || input.includes("my location") || input.includes("come to")) newFormData.serviceLocation = "mobile";
    else newFormData.serviceLocation = "at-shop";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("pickup") || input.includes("drop off")) newAddOns.push("pickup-dropoff");
    if (input.includes("premium") || input.includes("oem")) newAddOns.push("premium-parts");
    if (input.includes("wash") || input.includes("clean")) newAddOns.push("car-wash");
    if (input.includes("warranty") || input.includes("guarantee")) newAddOns.push("extended-warranty");
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
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-blue-500 bg-blue-50 shadow-lg" 
          : "border-gray-400 hover:border-blue-400 bg-white hover:bg-blue-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-medium">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-bold text-sm ${selected ? "text-blue-800" : "text-gray-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.adjustment !== undefined && option.adjustment > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            +€{option.adjustment}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-blue-600" : "text-gray-500"}`}>
            €{option.price}
          </div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            +€{option.surcharge}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Vehicle & Service", completed: !!formData.vehicleType && !!formData.serviceNeeded },
    { number: 2, title: "Urgency & Location", completed: !!formData.urgency && !!formData.serviceLocation },
    { number: 3, title: "Add-ons", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-100 to-blue-100">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Calculator Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Wrench className="h-10 w-10 mr-3 text-blue-600" />
            <EditableText
              value={textConfig.headline || "Auto Mechanic Quote Calculator"}
              onSave={(value) => updateTextContent('headline', value)}
              className="flex-1"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Get instant pricing for professional auto repair services. Quality parts, expert technicians, and transparent pricing."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-gray-600 max-w-2xl mx-auto font-medium"
            isPreview={isPreview}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white border-gray-300 rounded-lg shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.completed
                          ? "bg-blue-600 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-gray-400 text-gray-700"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-bold text-gray-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-blue-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Vehicle & Service */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Wrench className="h-6 w-6 mr-2 text-blue-600" />
                      <EditableText
                        value={textConfig.serviceTitle || "Vehicle and service details"}
                        onSave={(value) => updateTextContent('serviceTitle', value)}
                        className="flex-1"
                        isPreview={isPreview}
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-300">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Describe your repair needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Need an emergency brake job on an SUV"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-blue-300 text-gray-800 mb-3 resize-none placeholder:text-gray-500 rounded-lg"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-bold rounded-lg"
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
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Service Needed</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {servicesNeeded.map((service) => (
                            <OptionCard
                              key={service.id}
                              option={service}
                              selected={formData.serviceNeeded === service.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceNeeded: service.id }))}
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
                      disabled={!formData.vehicleType || !formData.serviceNeeded}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold rounded-lg"
                    >
                      <EditableText
                        value={textConfig.nextStepButtonText || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButtonText', value)}
                        className="font-bold"
                        isPreview={isPreview}
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Urgency & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-blue-600" />
                      Urgency and service location
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Urgency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {urgencyLevels.map((urgency) => (
                            <OptionCard
                              key={urgency.id}
                              option={urgency}
                              selected={formData.urgency === urgency.id}
                              onClick={() => setFormData(prev => ({ ...prev, urgency: urgency.id }))}
                              icon={urgency.icon}
                              popular={urgency.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Location of Service</h3>
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
                      className="px-8 border-gray-400 text-gray-700 hover:bg-gray-100 rounded-lg font-bold"
                    >
                      <EditableText
                        value={textConfig.previousButtonText || "Previous"}
                        onSave={(value) => updateTextContent('previousButtonText', value)}
                        className="font-bold"
                        isPreview={isPreview}
                      />
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.urgency || !formData.serviceLocation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold rounded-lg"
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
                      <Settings className="h-6 w-6 mr-2 text-blue-600" />
                      Premium add-on services
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-3">Enhancement Options (Optional)</h3>
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
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-blue-500 bg-blue-50 shadow-lg text-gray-800"
                                  : "border-gray-400 hover:border-blue-400 bg-white text-gray-700 hover:bg-blue-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-bold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-gray-600 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-bold ml-4 ${formData.addOns.includes(addOn.id) ? "text-blue-700" : "text-gray-600"}`}>
                                  {addOn.isPercentage ? `+${addOn.percentage}%` : addOn.price === 0 ? "Included" : `€${addOn.price}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.serviceNeeded === "battery-replacement" && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                            <div className="text-sm text-yellow-800">
                              🔋 Battery Recommendation: Add Engine Diagnostics to check charging system
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
                      className="px-8 border-gray-400 text-gray-700 hover:bg-gray-100 rounded-lg font-bold"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold rounded-lg"
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
                      <Mail className="h-6 w-6 mr-2 text-blue-600" />
                      Get your repair quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-gray-400 bg-white text-gray-800 placeholder:text-gray-500 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-gray-400 bg-white text-gray-800 placeholder:text-gray-500 rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-gray-400 bg-white text-gray-800 placeholder:text-gray-500 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Promo Code (Optional)
                        </label>
                        <Input
                          placeholder="Enter promo code (e.g., FIX10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="border-gray-400 bg-white text-gray-800 placeholder:text-gray-500 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-400 text-gray-700 hover:bg-gray-100 rounded-lg font-bold"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold rounded-lg"
                    >
                      <EditableText
                        value={textConfig.getQuoteButtonText || "Get Quote"}
                        onSave={(value) => updateTextContent('getQuoteButtonText', value)}
                        className="font-bold"
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
            <Card id="pricing-sidebar" className="p-6 bg-white border-gray-300 rounded-lg shadow-xl sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Repair Estimate</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-700">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-700">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-blue-700 font-bold"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.promoDiscount > 0 && (
                      <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-blue-700">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Get your car fixed right</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 48 hours. Professional repair service with quality parts and expert technicians.
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold rounded-lg"
                      onClick={() => {
                        const subject = "Auto Repair Service Appointment";
                        const body = `I'm ready to schedule my auto repair service! My repair quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@wrenchbrosgarage.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🔧 Book Appointment
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Expert techs
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                        Quality parts
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-300 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-700 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 rounded-lg font-bold"
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