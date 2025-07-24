import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Shield, 
  Clock, 
  Home, 
  Bug, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  AlertTriangle,
  Calendar
} from "lucide-react";

interface PestControlFormData {
  pestType: string;
  infestationLevel: string;
  propertyType: string;
  serviceType: string;
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
  pestTypeSurcharge: number;
  infestationSurcharge: number;
  propertyMultiplier: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface PestControlCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function PestControlCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: PestControlCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
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
  const [formData, setFormData] = useState<PestControlFormData>({
    pestType: "",
    infestationLevel: "",
    propertyType: "",
    serviceType: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Use custom pricing configuration if available
  const getPestTypePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        id: group.id,
        label: group.label,
        surcharge: group.price,
        icon: group.icon || "🪳",
        popular: ["cockroaches", "ants", "rodents"].includes(group.id)
      }));
    }
    return [
      { id: "cockroaches", label: "Cockroaches", surcharge: 50, icon: "🪳", popular: true },
      { id: "ants", label: "Ants", surcharge: 25, icon: "🐜", popular: true },
      { id: "wasps", label: "Wasps/Bees", surcharge: 75, icon: "🐝" },
      { id: "bedbugs", label: "Bedbugs", surcharge: 150, icon: "🛏️" },
      { id: "rodents", label: "Rodents (Mice/Rats)", surcharge: 100, icon: "🐭", popular: true },
      { id: "termites", label: "Termites", surcharge: 250, icon: "🪵" },
      { id: "general", label: "General Pest Prevention", surcharge: 0, icon: "🛡️" },
    ];
  };

  const getInfestationLevelPricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        surcharge: duration.price,
        icon: duration.icon || "🟢",
        popular: duration.id === "light" || duration.id === "moderate"
      }));
    }
    return [
      { id: "light", label: "Light", surcharge: 0, icon: "🟢", popular: true },
      { id: "moderate", label: "Moderate", surcharge: 75, icon: "🟡", popular: true },
      { id: "severe", label: "Severe", surcharge: 150, icon: "🔴" },
    ];
  };

  const getPropertyTypePricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices.map((location: any) => ({
        id: location.id,
        label: location.label,
        multiplier: location.multiplier || 1,
        icon: location.icon || "🏠",
        popular: location.id === "house"
      }));
    }
    return [
      { id: "apartment", label: "Apartment", multiplier: 1, icon: "🏠" },
      { id: "house", label: "Detached House", multiplier: 1.2, icon: "🏡", popular: true },
      { id: "commercial", label: "Commercial Unit", multiplier: 1.5, icon: "🏢" },
      { id: "warehouse", label: "Warehouse / Industrial", multiplier: 2, icon: "🏭" },
    ];
  };

  const getServiceTypePricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices.map((delivery: any) => ({
        id: delivery.id,
        label: delivery.label,
        multiplier: delivery.multiplier || 1,
        icon: delivery.icon || "🎯",
        popular: delivery.id === "one-time" || delivery.id === "monthly"
      }));
    }
    return [
      { id: "one-time", label: "One-Time Treatment", multiplier: 1, icon: "🎯", popular: true },
      { id: "monthly", label: "Monthly Maintenance", multiplier: 0.8, icon: "📅", popular: true },
      { id: "quarterly", label: "Quarterly Prevention", multiplier: 0.9, icon: "🗓️" },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((addon: any) => ({
        ...addon,
        popular: ["eco-friendly", "follow-up", "pet-safe"].includes(addon.id)
      }));
    }
    return [
      { id: "eco-friendly", label: "Eco-Friendly Chemicals", price: 40, popular: true },
      { id: "same-day", label: "Same-Day Service", price: 80 },
      { id: "follow-up", label: "Follow-Up Visit", price: 50, popular: true },
      { id: "pet-safe", label: "Pet-Safe Treatment", price: 40, popular: true },
    ];
  };

  const pestTypes = getPestTypePricing();
  const infestationLevels = getInfestationLevelPricing();
  const propertyTypes = getPropertyTypePricing();
  const serviceTypes = getServiceTypePricing();
  const addOnOptions = getAddOnPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const basePrice = customConfig?.basePrice || 100;
    
    const pest = pestTypes.find(p => p.id === formData.pestType);
    const infestation = infestationLevels.find(i => i.id === formData.infestationLevel);
    const property = propertyTypes.find(p => p.id === formData.propertyType);
    const service = serviceTypes.find(s => s.id === formData.serviceType);

    const pestTypeSurcharge = pest?.surcharge || 0;
    const infestationSurcharge = infestation?.surcharge || 0;
    let addOnsTotal = 0;

    const breakdown: string[] = [`Base visit: ${currencySymbol}${basePrice}`];

    // Pest type surcharge
    if (pestTypeSurcharge > 0) {
      breakdown.push(`${pest?.label} treatment: ${currencySymbol}${pestTypeSurcharge}`);
    }

    // Infestation level surcharge
    if (infestationSurcharge > 0) {
      breakdown.push(`${infestation?.label} infestation: ${currencySymbol}${infestationSurcharge}`);
    }

    let subtotalBeforeProperty = basePrice + pestTypeSurcharge + infestationSurcharge;

    // Property type multiplier
    let propertyMultiplier = 0;
    if (property && property.multiplier > 1) {
      propertyMultiplier = subtotalBeforeProperty * (property.multiplier - 1);
      breakdown.push(`${property.label} surcharge (${((property.multiplier - 1) * 100).toFixed(0)}%): ${currencySymbol}${propertyMultiplier.toFixed(2)}`);
    }

    let subtotalAfterProperty = subtotalBeforeProperty + propertyMultiplier;

    // Service type multiplier
    if (service && service.multiplier < 1) {
      const discount = subtotalAfterProperty * (1 - service.multiplier);
      breakdown.push(`${service.label} discount (${((1 - service.multiplier) * 100).toFixed(0)}%): -${currencySymbol}${discount.toFixed(2)}`);
      subtotalAfterProperty -= discount;
    }

    // Add-ons - use dynamic pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    let subtotal = subtotalAfterProperty + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "pest10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      pestTypeSurcharge,
      infestationSurcharge,
      propertyMultiplier,
      addOnsTotal,
      subtotal,
      discount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse pest type
    if (input.includes("mice") || input.includes("rat") || input.includes("rodent")) newFormData.pestType = "rodents";
    else if (input.includes("cockroach") || input.includes("roach")) newFormData.pestType = "cockroaches";
    else if (input.includes("ant")) newFormData.pestType = "ants";
    else if (input.includes("wasp") || input.includes("bee")) newFormData.pestType = "wasps";
    else if (input.includes("bedbug") || input.includes("bed bug")) newFormData.pestType = "bedbugs";
    else if (input.includes("termite")) newFormData.pestType = "termites";
    else newFormData.pestType = "general";

    // Parse infestation level
    if (input.includes("severe") || input.includes("heavy") || input.includes("major")) newFormData.infestationLevel = "severe";
    else if (input.includes("moderate") || input.includes("medium")) newFormData.infestationLevel = "moderate";
    else newFormData.infestationLevel = "light";

    // Parse property type
    if (input.includes("warehouse") || input.includes("industrial")) newFormData.propertyType = "warehouse";
    else if (input.includes("commercial") || input.includes("business") || input.includes("office")) newFormData.propertyType = "commercial";
    else if (input.includes("apartment") || input.includes("flat")) newFormData.propertyType = "apartment";
    else newFormData.propertyType = "house";

    // Parse service type
    if (input.includes("monthly") || input.includes("regular") || input.includes("maintenance")) newFormData.serviceType = "monthly";
    else if (input.includes("quarterly") || input.includes("prevention")) newFormData.serviceType = "quarterly";
    else newFormData.serviceType = "one-time";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("eco") || input.includes("green") || input.includes("natural")) newAddOns.push("eco-friendly");
    if (input.includes("same day") || input.includes("urgent") || input.includes("emergency")) newAddOns.push("same-day");
    if (input.includes("follow up") || input.includes("follow-up") || input.includes("return")) newAddOns.push("follow-up");
    if (input.includes("pet") || input.includes("safe") || input.includes("animal")) newAddOns.push("pet-safe");
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
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-green-500 bg-green-50 shadow-lg" 
          : "border-green-200 hover:border-green-400 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-green-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className="text-sm text-green-600 mt-1">+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-green-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1 && (
          <div className="text-sm text-green-600 mt-1">+{((option.multiplier - 1) * 100).toFixed(0)}%</div>
        )}
        {option.multiplier !== undefined && option.multiplier < 1 && (
          <div className="text-sm text-green-600 mt-1">-{((1 - option.multiplier) * 100).toFixed(0)}%</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Pest & Infestation", completed: !!formData.pestType && !!formData.infestationLevel },
    { number: 2, title: "Property & Service", completed: !!formData.propertyType && !!formData.serviceType },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-green-800 mb-2">
            Pest Control Pricing Calculator
          </h1>
          <p className="text-green-700 max-w-2xl mx-auto font-body">
            Professional pest control services to protect your property. Get your instant quote today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-green-200 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-green-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Pest & Infestation */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Bug className="h-6 w-6 mr-2 text-green-600" />
                      What pest problem are you dealing with?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <label className="block text-sm font-body text-green-700 mb-2">
                        Describe your pest problem (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I have a mice problem in my warehouse"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-green-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Pest Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {pestTypes.map((pest) => (
                            <OptionCard
                              key={pest.id}
                              option={pest}
                              selected={formData.pestType === pest.id}
                              onClick={() => setFormData(prev => ({ ...prev, pestType: pest.id }))}
                              icon={pest.icon}
                              popular={pest.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Infestation Level</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {infestationLevels.map((level) => (
                            <OptionCard
                              key={level.id}
                              option={level}
                              selected={formData.infestationLevel === level.id}
                              onClick={() => setFormData(prev => ({ ...prev, infestationLevel: level.id }))}
                              icon={level.icon}
                              popular={level.popular}
                            />
                          ))}
                        </div>

                        {formData.pestType === "ants" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                              🐜 Most popular: Ant control + follow-up visit + eco-safe
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.pestType || !formData.infestationLevel}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Property & Service */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Home className="h-6 w-6 mr-2 text-green-600" />
                      Property details and service type
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Property Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {propertyTypes.map((property) => (
                            <OptionCard
                              key={property.id}
                              option={property}
                              selected={formData.propertyType === property.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: property.id }))}
                              icon={property.icon}
                              popular={property.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Service Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {serviceTypes.map((service) => (
                            <OptionCard
                              key={service.id}
                              option={service}
                              selected={formData.serviceType === service.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceType: service.id }))}
                              icon={service.icon}
                              popular={service.popular}
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
                      className="px-8 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.propertyType || !formData.serviceType}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Promo */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-green-600" />
                      Additional services and special offers
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Add-ons (Optional)</h3>
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
                              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-green-500 bg-green-50 shadow-lg"
                                  : "border-green-200 hover:border-green-400 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-green-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-green-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., PEST10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-green-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-green-600" />
                      Get your pest control quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
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
                            className="pl-10 border-green-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
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
                            className="pl-10 border-green-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
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
                            className="pl-10 border-green-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-green-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-green-800 mb-4">Your Pest Control Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-green-700">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-green-800">Ready to Protect Your Property?</h3>
                    <p className="text-sm text-green-600">
                      This quote is valid for 3 days. Professional pest control you can trust.
                    </p>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Pest Control Service Quote";
                        const body = `I need pest control services! My quote is €${pricing.total.toLocaleString()} for ${formData.pestType} treatment.`;
                        const mailtoUrl = `mailto:info@pestcontrolpro.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🛡️ Book My Service
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-green-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Eco-Friendly Options
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-green-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-green-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 3 days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-green-300 text-green-600 hover:bg-green-50"
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