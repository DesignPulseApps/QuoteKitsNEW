import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  TreePine, 
  Clock, 
  Home, 
  Sprout, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Ruler,
  Calendar
} from "lucide-react";

interface LandscapingFormData {
  propertyType: string;
  serviceType: string[];
  propertySize: string;
  frequency: string;
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
  servicePremium: number;
  sizePremium: number;
  frequencyDiscount: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface LandscapingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function LandscapingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: LandscapingCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<LandscapingFormData>({
    propertyType: "",
    serviceType: [],
    propertySize: "",
    frequency: "",
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
  const getPropertyTypePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        id: group.id,
        label: group.label,
        icon: group.icon || "🏡",
        popular: group.id === "backyard" || group.id === "full-property"
      }));
    }
    return [
      { id: "front-yard", label: "Residential Front Yard", icon: "🏡" },
      { id: "backyard", label: "Backyard", icon: "🌿", popular: true },
      { id: "full-property", label: "Full Property", icon: "🏘️", popular: true },
      { id: "commercial", label: "Commercial Property", icon: "🏢" },
    ];
  };

  const getServiceTypePricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((service: any) => ({
        ...service,
        icon: service.icon || "🌱",
        popular: service.id === "tree-trimming" || service.id === "cleanup"
      }));
    }
    return [
      { id: "mowing", label: "Lawn Mowing / Edging", price: 0, icon: "🌱" },
      { id: "tree-trimming", label: "Tree Trimming", price: 100, icon: "🌳", popular: true },
      { id: "garden-design", label: "Garden Design & Planting", price: 200, icon: "🌺" },
      { id: "irrigation", label: "Irrigation Installation", price: 300, icon: "💧" },
      { id: "patio", label: "Patio / Deck Build", price: 900, icon: "🪨" },
      { id: "lighting", label: "Outdoor Lighting", price: 250, icon: "💡" },
      { id: "fence", label: "Fence Installation", price: 800, icon: "🚪" },
      { id: "cleanup", label: "Seasonal Cleanup", price: 80, icon: "🍂", popular: true },
    ];
  };

  const getPropertySizePricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        price: duration.price,
        icon: duration.icon || "📐",
        popular: duration.id === "medium" || duration.id === "large"
      }));
    }
    return [
      { id: "small", label: "Small (up to 200m²)", price: 0, icon: "📐" },
      { id: "medium", label: "Medium (200-500m²)", price: 50, icon: "📏", popular: true },
      { id: "large", label: "Large (500-1000m²)", price: 100, icon: "📊", popular: true },
      { id: "very-large", label: "Very Large (1000m²+)", price: 150, icon: "📈" },
    ];
  };

  const getFrequencyPricing = () => {
    if (customConfig?.usagePrices) {
      return customConfig.usagePrices.map((usage: any) => ({
        id: usage.id,
        label: usage.label,
        discount: usage.discount || 0,
        icon: usage.icon || "1️⃣",
        popular: usage.id === "weekly"
      }));
    }
    return [
      { id: "one-time", label: "One-time", discount: 0, icon: "1️⃣" },
      { id: "weekly", label: "Weekly", discount: 0.10, icon: "📅", popular: true },
      { id: "bi-weekly", label: "Bi-weekly", discount: 0.07, icon: "🗓️" },
      { id: "monthly", label: "Monthly", discount: 0.05, icon: "📆" },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.wardrobePrices) {
      return customConfig.wardrobePrices.map((addon: any) => ({
        ...addon,
        popular: addon.id === "soil-treatment" || addon.id === "mulching"
      }));
    }
    return [
      { id: "soil-treatment", label: "Soil & Fertilizer Treatment", price: 120, popular: true },
      { id: "sod", label: "Sod Installation", price: 200 },
      { id: "pressure-washing", label: "Pressure Washing", price: 80 },
      { id: "mulching", label: "Mulching", price: 90, popular: true },
      { id: "garden-redesign", label: "Garden Bed Redesign", price: 150 },
    ];
  };

  const propertyTypes = getPropertyTypePricing();
  const serviceTypes = getServiceTypePricing();
  const propertySizes = getPropertySizePricing();
  const frequencies = getFrequencyPricing();
  const addOnOptions = getAddOnPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const baseLawnMowing = customConfig?.basePrice || 120;
    
    let servicePremium = 0;
    let sizePremium = 0;
    let frequencyDiscount = 0;
    let addOnsTotal = 0;
    const breakdown: string[] = [`Base service (small property, lawn mowing): ${currencySymbol}${baseLawnMowing}`];

    // Service type pricing - use dynamic pricing from configuration
    formData.serviceType.forEach(serviceId => {
      const service = serviceTypes.find(s => s.id === serviceId);
      if (service && service.price > 0) {
        servicePremium += service.price;
        breakdown.push(`${service.label}: ${currencySymbol}${service.price}`);
      }
    });

    // Property size pricing
    const size = propertySizes.find(s => s.id === formData.propertySize);
    if (size && size.price > 0) {
      sizePremium = size.price;
      breakdown.push(`${size.label}: ${currencySymbol}${sizePremium}`);
    }

    // Add-ons pricing - use dynamic pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    let subtotal = baseLawnMowing + servicePremium + sizePremium + addOnsTotal;

    // Frequency discount
    const frequency = frequencies.find(f => f.id === formData.frequency);
    if (frequency && frequency.discount > 0) {
      frequencyDiscount = subtotal * frequency.discount;
      breakdown.push(`${frequency.label} discount (${(frequency.discount * 100).toFixed(0)}%): -${currencySymbol}${frequencyDiscount.toFixed(2)}`);
      subtotal -= frequencyDiscount;
    }

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "landscape10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseLawnMowing,
      servicePremium,
      sizePremium,
      frequencyDiscount,
      addOnsTotal,
      subtotal: subtotal + frequencyDiscount, // Show subtotal before frequency discount
      discount,
      total,
      breakdown,
      currency,
      currencySymbol,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse property type
    if (input.includes("commercial") || input.includes("business")) newFormData.propertyType = "commercial";
    else if (input.includes("full property") || input.includes("entire")) newFormData.propertyType = "full-property";
    else if (input.includes("front yard") || input.includes("front")) newFormData.propertyType = "front-yard";
    else newFormData.propertyType = "backyard";

    // Parse property size
    if (input.includes("large") || input.includes("big")) {
      if (input.includes("very") || input.includes("huge")) newFormData.propertySize = "very-large";
      else newFormData.propertySize = "large";
    } else if (input.includes("medium")) {
      newFormData.propertySize = "medium";
    } else if (input.includes("small")) {
      newFormData.propertySize = "small";
    } else {
      newFormData.propertySize = "medium";
    }

    // Parse service types
    const newServices: string[] = [];
    if (input.includes("mowing") || input.includes("mow") || input.includes("edging")) newServices.push("mowing");
    if (input.includes("tree") || input.includes("trimming") || input.includes("pruning")) newServices.push("tree-trimming");
    if (input.includes("garden") || input.includes("planting") || input.includes("design")) newServices.push("garden-design");
    if (input.includes("irrigation") || input.includes("sprinkler") || input.includes("watering")) newServices.push("irrigation");
    if (input.includes("patio") || input.includes("deck")) newServices.push("patio");
    if (input.includes("lighting") || input.includes("lights")) newServices.push("lighting");
    if (input.includes("fence") || input.includes("fencing")) newServices.push("fence");
    if (input.includes("cleanup") || input.includes("clean up") || input.includes("seasonal")) newServices.push("cleanup");
    
    // Default to mowing if no specific services mentioned
    if (newServices.length === 0) newServices.push("mowing");
    newFormData.serviceType = newServices;

    // Parse frequency
    if (input.includes("weekly") || input.includes("every week")) {
      newFormData.frequency = "weekly";
    } else if (input.includes("bi-weekly") || input.includes("every two week") || input.includes("biweekly")) {
      newFormData.frequency = "bi-weekly";
    } else if (input.includes("monthly") || input.includes("once a month")) {
      newFormData.frequency = "monthly";
    } else {
      newFormData.frequency = "one-time";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("soil") || input.includes("fertilizer")) newAddOns.push("soil-treatment");
    if (input.includes("sod") || input.includes("new grass")) newAddOns.push("sod");
    if (input.includes("pressure wash") || input.includes("cleaning")) newAddOns.push("pressure-washing");
    if (input.includes("mulch") || input.includes("mulching")) newAddOns.push("mulching");
    if (input.includes("redesign") || input.includes("garden bed")) newAddOns.push("garden-redesign");
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
        <div className="font-semibold text-gray-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-green-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
        {option.discount !== undefined && option.discount > 0 && (
          <div className="text-sm text-green-600 mt-1">-{(option.discount * 100).toFixed(0)}%</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Property & Services", completed: !!formData.propertyType && formData.serviceType.length > 0 },
    { number: 2, title: "Size & Frequency", completed: !!formData.propertySize && !!formData.frequency },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            Landscaping Quote Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Transform your outdoor space with professional landscaping. Get your custom quote instantly.
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
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-green-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Property & Services */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <TreePine className="h-6 w-6 mr-2 text-green-600" />
                      Tell us about your landscaping project
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your project (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Backyard cleanup and tree trimming, medium-sized garden"
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
                        <h3 className="text-lg font-display text-gray-700 mb-3">Property Type</h3>
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
                        <h3 className="text-lg font-display text-gray-700 mb-3">Service Type (Select all that apply)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {serviceTypes.map((service) => (
                            <div
                              key={service.id}
                              onClick={() => {
                                const newServices = formData.serviceType.includes(service.id)
                                  ? formData.serviceType.filter(id => id !== service.id)
                                  : [...formData.serviceType, service.id];
                                setFormData(prev => ({ ...prev, serviceType: newServices }));
                              }}
                              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.serviceType.includes(service.id)
                                  ? "border-green-500 bg-green-50 shadow-lg"
                                  : "border-green-200 hover:border-green-400 bg-white"
                              }`}
                            >
                              {service.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="text-center">
                                <div className="text-2xl mb-2"><EditableText value={service.icon} onSave={() => {}} /></div>
                                <div className="font-semibold text-gray-800"><EditableText value={service.label} onSave={() => {}} /></div>
                                {service.price > 0 && (
                                  <div className="text-sm text-green-600 mt-1">+€{service.price} onSave={() => {}} /></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {formData.serviceType.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                              🌿 Most selected: Lawn mowing + tree trimming + cleanup
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.propertyType || formData.serviceType.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Size & Frequency */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Ruler className="h-6 w-6 mr-2 text-green-600" />
                      Property size & service frequency
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Property Size</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {propertySizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.propertySize === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertySize: size.id }))}
                              icon={size.icon}
                              popular={size.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Service Frequency</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {frequencies.map((freq) => (
                            <OptionCard
                              key={freq.id}
                              option={freq}
                              selected={formData.frequency === freq.id}
                              onClick={() => setFormData(prev => ({ ...prev, frequency: freq.id }))}
                              icon={freq.icon}
                              popular={freq.popular}
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
                      disabled={!formData.propertySize || !formData.frequency}
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
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Sprout className="h-6 w-6 mr-2 text-green-600" />
                      Enhance your landscaping
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Add-ons (Optional)</h3>
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
                                <div className="font-semibold text-gray-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-green-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., LANDSCAPE10)"
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
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-green-600" />
                      Get your landscaping quote
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
                            className="pl-10 border-green-300"
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
                            className="pl-10 border-green-300"
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
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Landscaping Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
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
                    <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Schedule Section */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Transform Your Landscape?</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 72 hours. Let's create your dream outdoor space together.
                    </p>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Landscaping Project Quote";
                        const body = `I'm interested in scheduling my landscaping project! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@greenlandscaping.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🌿 Schedule My Landscaping
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Free Consultation
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-green-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
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