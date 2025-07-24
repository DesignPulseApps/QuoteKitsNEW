import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Home, 
  Clock, 
  Building2, 
  Hammer, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Shield,
  AlertTriangle
} from "lucide-react";

interface RoofingFormData {
  serviceType: string;
  roofType: string;
  roofSize: string;
  buildingType: string;
  accessDifficulty: string;
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
  sizeMultiplier: number;
  typeMultiplier: number;
  accessFee: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface RoofingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function RoofingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: RoofingCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<RoofingFormData>({
    serviceType: "",
    roofType: "",
    roofSize: "",
    buildingType: "",
    accessDifficulty: "",
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
  const getServiceTypePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        id: group.id,
        label: group.label,
        basePrice: group.price,
        perMeter: group.perMeter || false,
        icon: group.icon || "🔧",
        popular: group.id === "leak-repair" || group.id === "replacement"
      }));
    }
    return [
      { id: "leak-repair", label: "Leak Repair", basePrice: 150, icon: "🔧", popular: true },
      { id: "replacement", label: "Full Replacement", basePrice: 120, perMeter: true, icon: "🏗️", popular: true },
      { id: "gutter-cleaning", label: "Gutter Cleaning", basePrice: 150, icon: "🌊" },
      { id: "tile-replacement", label: "Tile/Slate Replacement", basePrice: 200, icon: "🧱" },
      { id: "inspection", label: "Inspection Only", basePrice: 75, icon: "🔍" },
    ];
  };

  const getRoofTypePricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        multiplier: duration.multiplier || 1,
        icon: duration.icon || "⬜",
        popular: duration.id === "pitched" || duration.id === "tile"
      }));
    }
    return [
      { id: "flat", label: "Flat", multiplier: 1, icon: "⬜" },
      { id: "pitched", label: "Pitched", multiplier: 1, icon: "🔺", popular: true },
      { id: "metal", label: "Metal", multiplier: 1.15, icon: "🔩" },
      { id: "tile", label: "Tile", multiplier: 1.2, icon: "🧱", popular: true },
      { id: "asphalt", label: "Asphalt Shingle", multiplier: 1, icon: "🏠" },
    ];
  };

  const getRoofSizePricing = () => {
    if (customConfig?.wardrobePrices) {
      return customConfig.wardrobePrices.map((size: any) => ({
        id: size.id,
        label: size.label,
        meters: size.meters || 100,
        icon: size.icon || "📐",
        popular: size.id === "medium" || size.id === "large"
      }));
    }
    return [
      { id: "small", label: "Small (up to 50m²)", meters: 50, icon: "📐" },
      { id: "medium", label: "Medium (50-150m²)", meters: 100, icon: "📏", popular: true },
      { id: "large", label: "Large (150-300m²)", meters: 225, icon: "📊", popular: true },
      { id: "extra-large", label: "Extra Large (300m²+)", meters: 400, icon: "📈" },
    ];
  };

  const getBuildingTypePricing = () => {
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
      { id: "house", label: "House", multiplier: 1, icon: "🏠", popular: true },
      { id: "apartment", label: "Apartment Block", multiplier: 1.1, icon: "🏢" },
      { id: "commercial", label: "Commercial", multiplier: 1.2, icon: "🏭" },
    ];
  };

  const getAccessLevelPricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices.map((delivery: any) => ({
        id: delivery.id,
        label: delivery.label,
        fee: delivery.price,
        icon: delivery.icon || "✅",
        popular: delivery.id === "easy"
      }));
    }
    return [
      { id: "easy", label: "Easy", fee: 0, icon: "✅", popular: true },
      { id: "moderate", label: "Moderate", fee: 100, icon: "⚠️" },
      { id: "difficult", label: "Difficult", fee: 200, icon: "🚫" },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((addon: any) => ({
        ...addon,
        popular: addon.id === "gutter-guard" || addon.id === "waterproof"
      }));
    }
    return [
      { id: "gutter-guard", label: "Gutter Guard Installation", price: 180, popular: true },
      { id: "waterproof", label: "Waterproof Coating", price: 150, popular: true },
      { id: "skylight", label: "Skylight Installation", price: 250 },
      { id: "fascia", label: "Fascia Replacement", price: 120 },
      { id: "emergency", label: "Emergency Call-Out", price: 100 },
    ];
  };

  const serviceTypes = getServiceTypePricing();
  const roofTypes = getRoofTypePricing();
  const roofSizes = getRoofSizePricing();
  const buildingTypes = getBuildingTypePricing();
  const accessLevels = getAccessLevelPricing();
  const addOnOptions = getAddOnPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const service = serviceTypes.find(s => s.id === formData.serviceType);
    const roofType = roofTypes.find(r => r.id === formData.roofType);
    const size = roofSizes.find(s => s.id === formData.roofSize);
    const building = buildingTypes.find(b => b.id === formData.buildingType);
    const access = accessLevels.find(a => a.id === formData.accessDifficulty);

    let basePrice = service?.basePrice || customConfig?.basePrice || 0;
    let sizeMultiplier = 0;
    let typeMultiplier = 0;
    let accessFee = access?.fee || 0;
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    if (service?.perMeter && size) {
      sizeMultiplier = basePrice * size.meters;
      breakdown.push(`${service.label} (${size.meters}m²): ${currencySymbol}${sizeMultiplier.toLocaleString()}`);
    } else if (service) {
      breakdown.push(`${service.label}: ${currencySymbol}${basePrice}`);
    }

    // Roof type multiplier
    if (roofType && roofType.multiplier > 1) {
      const multiplierAmount = (service?.perMeter ? sizeMultiplier : basePrice) * (roofType.multiplier - 1);
      typeMultiplier = multiplierAmount;
      breakdown.push(`${roofType.label} roof premium (${((roofType.multiplier - 1) * 100).toFixed(0)}%): €${multiplierAmount.toFixed(2)}`);
    }

    // Building type multiplier
    if (building && building.multiplier > 1) {
      const currentTotal = (service?.perMeter ? sizeMultiplier : basePrice) + typeMultiplier;
      const buildingMultiplier = currentTotal * (building.multiplier - 1);
      typeMultiplier += buildingMultiplier;
      breakdown.push(`${building.label} surcharge (${((building.multiplier - 1) * 100).toFixed(0)}%): €${buildingMultiplier.toFixed(2)}`);
    }

    // Access difficulty fee
    if (accessFee > 0) {
      breakdown.push(`Access difficulty (${access?.label}): €${accessFee}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    let subtotal = (service?.perMeter ? sizeMultiplier : basePrice) + typeMultiplier + accessFee + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "roof10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: service?.perMeter ? sizeMultiplier : basePrice,
      sizeMultiplier: service?.perMeter ? 0 : sizeMultiplier,
      typeMultiplier,
      accessFee,
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

    // Parse service type
    if (input.includes("leak") || input.includes("repair")) newFormData.serviceType = "leak-repair";
    else if (input.includes("replacement") || input.includes("new roof") || input.includes("replace")) newFormData.serviceType = "replacement";
    else if (input.includes("gutter") || input.includes("clean")) newFormData.serviceType = "gutter-cleaning";
    else if (input.includes("tile") || input.includes("slate")) newFormData.serviceType = "tile-replacement";
    else if (input.includes("inspection") || input.includes("inspect")) newFormData.serviceType = "inspection";
    else newFormData.serviceType = "leak-repair";

    // Parse roof type
    if (input.includes("flat")) newFormData.roofType = "flat";
    else if (input.includes("metal")) newFormData.roofType = "metal";
    else if (input.includes("tile") || input.includes("slate")) newFormData.roofType = "tile";
    else if (input.includes("asphalt") || input.includes("shingle")) newFormData.roofType = "asphalt";
    else newFormData.roofType = "pitched";

    // Parse roof size
    if (input.includes("large") || input.includes("big")) {
      if (input.includes("extra") || input.includes("huge")) newFormData.roofSize = "extra-large";
      else newFormData.roofSize = "large";
    } else if (input.includes("medium")) {
      newFormData.roofSize = "medium";
    } else if (input.includes("small")) {
      newFormData.roofSize = "small";
    } else {
      newFormData.roofSize = "medium";
    }

    // Parse building type
    if (input.includes("commercial") || input.includes("business")) newFormData.buildingType = "commercial";
    else if (input.includes("apartment") || input.includes("block")) newFormData.buildingType = "apartment";
    else newFormData.buildingType = "house";

    // Parse access difficulty
    if (input.includes("difficult") || input.includes("hard") || input.includes("steep")) newFormData.accessDifficulty = "difficult";
    else if (input.includes("moderate") || input.includes("medium")) newFormData.accessDifficulty = "moderate";
    else newFormData.accessDifficulty = "easy";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("emergency") || input.includes("urgent") || input.includes("weekend")) newAddOns.push("emergency");
    if (input.includes("gutter guard") || input.includes("guard")) newAddOns.push("gutter-guard");
    if (input.includes("waterproof") || input.includes("coating")) newAddOns.push("waterproof");
    if (input.includes("skylight")) newAddOns.push("skylight");
    if (input.includes("fascia")) newAddOns.push("fascia");
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
          ? "border-yellow-500 bg-yellow-50 shadow-lg" 
          : "border-slate-300 hover:border-yellow-400 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className="text-sm text-yellow-600 mt-1">
            {option.perMeter ? `€${option.basePrice}/m²` : `€${option.basePrice}`}
          </div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-yellow-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
        {option.fee !== undefined && option.fee > 0 && (
          <div className="text-sm text-yellow-600 mt-1">+€{option.fee} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1 && (
          <div className="text-sm text-yellow-600 mt-1">+{((option.multiplier - 1) * 100).toFixed(0)}%</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Service & Roof Type", completed: !!formData.serviceType && !!formData.roofType },
    { number: 2, title: "Size & Building", completed: !!formData.roofSize && !!formData.buildingType },
    { number: 3, title: "Access & Add-ons", completed: !!formData.accessDifficulty },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-slate-800 mb-2">
            Roofing Quote Calculator
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-body">
            Professional roofing services with transparent pricing. Get your instant quote today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-slate-300 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-yellow-500 text-white"
                          : currentStep === step.number
                          ? "bg-yellow-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-yellow-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Service & Roof Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-yellow-600" />
                      Tell us about your roofing needs
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <label className="block text-sm font-body text-slate-700 mb-2">
                        Describe your roofing project (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Need a flat roof leak fixed this weekend"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-yellow-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Roof Service Type</h3>
                        <div className="grid grid-cols-2 gap-4">
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

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Roof Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {roofTypes.map((roof) => (
                            <OptionCard
                              key={roof.id}
                              option={roof}
                              selected={formData.roofType === roof.id}
                              onClick={() => setFormData(prev => ({ ...prev, roofType: roof.id }))}
                              icon={roof.icon}
                              popular={roof.popular}
                            />
                          ))}
                        </div>

                        {formData.serviceType === "gutter-cleaning" && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="text-sm text-yellow-700">
                              🏆 Most chosen: Gutter cleaning + waterproofing
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.serviceType || !formData.roofType}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Size & Building */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Building2 className="h-6 w-6 mr-2 text-yellow-600" />
                      Roof size and building details
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Roof Size</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {roofSizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.roofSize === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, roofSize: size.id }))}
                              icon={size.icon}
                              popular={size.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Building Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {buildingTypes.map((building) => (
                            <OptionCard
                              key={building.id}
                              option={building}
                              selected={formData.buildingType === building.id}
                              onClick={() => setFormData(prev => ({ ...prev, buildingType: building.id }))}
                              icon={building.icon}
                              popular={building.popular}
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
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.roofSize || !formData.buildingType}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Access & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Hammer className="h-6 w-6 mr-2 text-yellow-600" />
                      Access difficulty and additional services
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Access Difficulty</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {accessLevels.map((access) => (
                            <OptionCard
                              key={access.id}
                              option={access}
                              selected={formData.accessDifficulty === access.id}
                              onClick={() => setFormData(prev => ({ ...prev, accessDifficulty: access.id }))}
                              icon={access.icon}
                              popular={access.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Add-ons (Optional)</h3>
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
                                  ? "border-yellow-500 bg-yellow-50 shadow-lg"
                                  : "border-slate-300 hover:border-yellow-400 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-slate-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-yellow-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., ROOF10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.accessDifficulty}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-yellow-600" />
                      Get your roofing quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-300 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-slate-800 mb-4">Your Roofing Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-yellow-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-yellow-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Schedule Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-slate-800">Ready to Secure Your Roof?</h3>
                    <p className="text-sm text-slate-600">
                      This quote is valid for 5 business days. Professional roofing services you can trust.
                    </p>
                    
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Roofing Project Quote";
                        const body = `I'm ready to schedule my roofing inspection! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@reliableroofing.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🏠 Schedule a Roof Inspection
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></div>
                        24/7 Emergency
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 5 business days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
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