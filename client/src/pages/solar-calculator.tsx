import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Sun, 
  Clock, 
  Home, 
  Zap, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Battery,
  Car,
  MonitorSpeaker
} from "lucide-react";

interface SolarFormData {
  propertyType: string;
  roofType: string;
  powerUsage: string;
  batteryStorage: string;
  timeline: string;
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
  powerMultiplier: number;
  roofComplexity: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
  estimatedKW: number;
}

interface SolarCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function SolarCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: SolarCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<SolarFormData>({
    propertyType: "",
    roofType: "",
    powerUsage: "",
    batteryStorage: "",
    timeline: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const propertyTypes = [
    { id: "house", label: "House", multiplier: 1, icon: "🏠", popular: true },
    { id: "apartment", label: "Apartment Building", multiplier: 1.2, icon: "🏢" },
    { id: "commercial", label: "Commercial", multiplier: 1.5, icon: "🏭" },
  ];

  const roofTypes = [
    { id: "flat", label: "Flat", complexity: 1.1, icon: "⬜", popular: true },
    { id: "sloped-south", label: "Sloped - South Facing", complexity: 1, icon: "📐", popular: true },
    { id: "sloped-eastwest", label: "Sloped - East/West", complexity: 1.05, icon: "📏" },
    { id: "metal", label: "Metal", complexity: 1.15, icon: "🔩" },
    { id: "tile", label: "Tile", complexity: 1.2, icon: "🧱" },
    { id: "asphalt", label: "Asphalt", complexity: 1, icon: "🏠" },
  ];

  const powerUsageOptions = [
    { id: "low", label: "< 250 kWh", kwEstimate: 3, icon: "🔋" },
    { id: "medium", label: "250-500 kWh", kwEstimate: 5, icon: "⚡", popular: true },
    { id: "high", label: "500-1000 kWh", kwEstimate: 8, icon: "🔌", popular: true },
    { id: "very-high", label: "1000+ kWh", kwEstimate: 12, icon: "⚡⚡" },
  ];

  const batteryOptions = [
    { id: "no", label: "No Battery", price: 0, icon: "❌" },
    { id: "yes", label: "Yes, Include Battery", price: 4500, icon: "🔋", popular: true },
  ];

  const timelineOptions = [
    { id: "asap", label: "As Soon As Possible", icon: "🚀", popular: true },
    { id: "3months", label: "Within 3 Months", icon: "📅" },
    { id: "research", label: "Just Researching", icon: "📖" },
  ];

  const addOnOptions = [
    { id: "battery-storage", label: "Battery Storage", price: 4500, popular: true },
    { id: "ev-charger", label: "EV Charger", price: 1200, popular: true },
    { id: "smart-monitoring", label: "Smart Monitoring", price: 400 },
    { id: "solar-roof-tiles", label: "Solar Roof Tiles", price: 2000 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const basePrice = customConfig?.basePrice || 5000; // Base 3kW system
    const pricePerKW = 1000;
    
    const property = propertyTypes.find(p => p.id === formData.propertyType);
    const roof = roofTypes.find(r => r.id === formData.roofType);
    const usage = powerUsageOptions.find(u => u.id === formData.powerUsage);
    
    const estimatedKW = usage?.kwEstimate || 3;
    const additionalKW = Math.max(0, estimatedKW - 3);
    
    let powerMultiplier = additionalKW * pricePerKW;
    let roofComplexity = 0;
    let addOnsTotal = 0;

    const breakdown: string[] = [`Base solar system (3kW): €${basePrice.toLocaleString()}`];

    // Additional power capacity
    if (additionalKW > 0) {
      breakdown.push(`Additional capacity (${additionalKW}kW): €${powerMultiplier.toLocaleString()}`);
    }

    // Roof complexity
    if (roof && roof.complexity > 1) {
      const currentTotal = basePrice + powerMultiplier;
      roofComplexity = currentTotal * (roof.complexity - 1);
      breakdown.push(`${roof.label} roof complexity (${((roof.complexity - 1) * 100).toFixed(0)}%): €${roofComplexity.toFixed(2)}`);
    }

    // Property type multiplier
    if (property && property.multiplier > 1) {
      const currentTotal = basePrice + powerMultiplier + roofComplexity;
      const propertyMultiplier = currentTotal * (property.multiplier - 1);
      roofComplexity += propertyMultiplier;
      breakdown.push(`${property.label} installation (${((property.multiplier - 1) * 100).toFixed(0)}%): €${propertyMultiplier.toFixed(2)}`);
    }

    // Battery storage from main option
    if (formData.batteryStorage === "yes") {
      const batteryPrice = batteryOptions.find(b => b.id === "yes")?.price || 0;
      addOnsTotal += batteryPrice;
      breakdown.push(`Battery Storage: €${batteryPrice.toLocaleString()}`);
    }

    // Add-ons (excluding battery if already added)
    formData.addOns.forEach(addOnId => {
      if (addOnId === "battery-storage" && formData.batteryStorage === "yes") return; // Avoid double counting
      
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price.toLocaleString()}`);
      }
    });

    let subtotal = basePrice + powerMultiplier + roofComplexity + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "solar10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      powerMultiplier,
      roofComplexity,
      addOnsTotal,
      subtotal,
      discount,
      total,
      breakdown,
      estimatedKW,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse property type
    if (input.includes("commercial") || input.includes("business")) newFormData.propertyType = "commercial";
    else if (input.includes("apartment") || input.includes("building")) newFormData.propertyType = "apartment";
    else newFormData.propertyType = "house";

    // Parse roof type
    if (input.includes("south") || input.includes("south-facing")) newFormData.roofType = "sloped-south";
    else if (input.includes("east") || input.includes("west")) newFormData.roofType = "sloped-eastwest";
    else if (input.includes("flat")) newFormData.roofType = "flat";
    else if (input.includes("metal")) newFormData.roofType = "metal";
    else if (input.includes("tile")) newFormData.roofType = "tile";
    else newFormData.roofType = "sloped-south";

    // Parse power usage
    const kwMatch = input.match(/(\d+)\s*kwh/);
    if (kwMatch) {
      const kwh = parseInt(kwMatch[1]);
      if (kwh < 250) newFormData.powerUsage = "low";
      else if (kwh <= 500) newFormData.powerUsage = "medium";
      else if (kwh <= 1000) newFormData.powerUsage = "high";
      else newFormData.powerUsage = "very-high";
    } else {
      newFormData.powerUsage = "medium";
    }

    // Parse battery storage
    if (input.includes("battery") || input.includes("storage")) {
      newFormData.batteryStorage = "yes";
    } else {
      newFormData.batteryStorage = "no";
    }

    // Parse timeline
    if (input.includes("asap") || input.includes("soon") || input.includes("urgent")) {
      newFormData.timeline = "asap";
    } else if (input.includes("3 month") || input.includes("few month")) {
      newFormData.timeline = "3months";
    } else {
      newFormData.timeline = "research";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("ev charger") || input.includes("electric car")) newAddOns.push("ev-charger");
    if (input.includes("monitoring") || input.includes("smart")) newAddOns.push("smart-monitoring");
    if (input.includes("roof tiles") || input.includes("solar tiles")) newAddOns.push("solar-roof-tiles");
    if (input.includes("battery") && !newAddOns.includes("battery-storage")) newAddOns.push("battery-storage");
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
          : "border-green-200 hover:border-yellow-400 bg-white"
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
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-yellow-600 mt-1">+€{option.price.toLocaleString()} onSave={() => {}} /></div>
        )}
        {option.kwEstimate !== undefined && (
          <div className="text-sm text-green-600 mt-1">~{option.kwEstimate}kW system</div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1 && (
          <div className="text-sm text-yellow-600 mt-1">+{((option.multiplier - 1) * 100).toFixed(0)}%</div>
        )}
        {option.complexity !== undefined && option.complexity > 1 && (
          <div className="text-sm text-yellow-600 mt-1">+{((option.complexity - 1) * 100).toFixed(0)}%</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Property & Roof", completed: !!formData.propertyType && !!formData.roofType },
    { number: 2, title: "Power & Battery", completed: !!formData.powerUsage && !!formData.batteryStorage },
    { number: 3, title: "Timeline & Add-ons", completed: !!formData.timeline },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-green-800 mb-2">
            Solar Panel Installation Calculator
          </h1>
          <p className="text-green-700 max-w-2xl mx-auto font-body">
            Harness the power of the sun with clean, renewable energy. Get your personalized solar quote instantly.
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
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-yellow-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Property & Roof */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Sun className="h-6 w-6 mr-2 text-yellow-500" />
                      Tell us about your property
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <label className="block text-sm font-body text-green-700 mb-2">
                        Describe your solar needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I have a south-facing roof and use 600kWh/month"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-yellow-200 mb-3 resize-none"
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
                        <h3 className="text-lg font-display text-green-700 mb-3">Property Type</h3>
                        <div className="grid grid-cols-3 gap-4">
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
                        <h3 className="text-lg font-display text-green-700 mb-3">Roof Type</h3>
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
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.propertyType || !formData.roofType}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Power & Battery */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                      Power usage and battery storage
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Monthly Power Usage</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {powerUsageOptions.map((usage) => (
                            <OptionCard
                              key={usage.id}
                              option={usage}
                              selected={formData.powerUsage === usage.id}
                              onClick={() => setFormData(prev => ({ ...prev, powerUsage: usage.id }))}
                              icon={usage.icon}
                              popular={usage.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Battery Storage</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {batteryOptions.map((battery) => (
                            <OptionCard
                              key={battery.id}
                              option={battery}
                              selected={formData.batteryStorage === battery.id}
                              onClick={() => setFormData(prev => ({ ...prev, batteryStorage: battery.id }))}
                              icon={battery.icon}
                              popular={battery.popular}
                            />
                          ))}
                        </div>

                        {formData.powerUsage === "high" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                              ☀️ Most homes choose 5kW + battery + EV charger
                            </div>
                          </div>
                        )}
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
                      disabled={!formData.powerUsage || !formData.batteryStorage}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Timeline & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Battery className="h-6 w-6 mr-2 text-yellow-500" />
                      Installation timeline and additional features
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Installation Timeline</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {timelineOptions.map((timeline) => (
                            <OptionCard
                              key={timeline.id}
                              option={timeline}
                              selected={formData.timeline === timeline.id}
                              onClick={() => setFormData(prev => ({ ...prev, timeline: timeline.id }))}
                              icon={timeline.icon}
                              popular={timeline.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Add-ons (Optional)</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                // Skip battery storage if already selected in main option
                                if (addOn.id === "battery-storage" && formData.batteryStorage === "yes") return;
                                
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id) || (addOn.id === "battery-storage" && formData.batteryStorage === "yes")
                                  ? "border-yellow-500 bg-yellow-50 shadow-lg"
                                  : "border-green-200 hover:border-yellow-400 bg-white"
                              } ${addOn.id === "battery-storage" && formData.batteryStorage === "yes" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-green-800">
                                  {addOn.label}
                                  {addOn.id === "battery-storage" && formData.batteryStorage === "yes" && (
                                    <span className="text-sm text-green-600 ml-2">(Already included)</span>
                                  )}
                                </div>
                                <div className="text-yellow-600 font-semibold">+€{addOn.price.toLocaleString()} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SOLAR10)"
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
                      disabled={!formData.timeline}
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
                      <Mail className="h-6 w-6 mr-2 text-yellow-500" />
                      Get your solar quote
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-green-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-green-800 mb-4">Your Solar Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.estimatedKW > 0 && (
                  <div className="text-lg text-yellow-600 font-semibold">
                    {pricing.estimatedKW}kW Solar System
                  </div>
                )}
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-green-700">
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
                    <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Go Solar Section */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-green-800">Ready to Go Solar?</h3>
                    <p className="text-sm text-green-600">
                      This quote is valid for 7 days. Start saving with clean energy today.
                    </p>
                    
                    <Button 
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Solar Panel Installation Quote";
                        const body = `I'm interested in installing solar panels! My quote is €${pricing.total.toLocaleString()} for a ${pricing.estimatedKW}kW system.`;
                        const mailtoUrl = `mailto:info@solarpowerinstall.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      ☀️ Book a Solar Assessment
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-green-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        25-Year Warranty
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        Government Grants
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
                        Valid for 7 days
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