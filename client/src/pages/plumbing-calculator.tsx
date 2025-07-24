import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wrench, 
  Clock, 
  Building, 
  Droplets, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  AlertTriangle,
  MapPin
} from "lucide-react";

interface PlumbingFormData {
  serviceType: string;
  propertyType: string;
  urgencyLevel: string;
  city: string;
  floorNumber: string;
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
  urgencyAdd: number;
  floorAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface PlumbingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function PlumbingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: PlumbingCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig || null);
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

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to plumbing calculator:', config);
    setCustomConfig(config);
    
    // Apply primary color
    if (config.brandColors?.primary) {
      document.documentElement.style.setProperty('--primary', config.brandColors.primary);
      document.documentElement.style.setProperty('--blue-600', config.brandColors.primary);
      document.documentElement.style.setProperty('--cyan-500', config.brandColors.primary);
    }
    
    // Apply secondary color
    if (config.brandColors?.secondary) {
      document.documentElement.style.setProperty('--secondary', config.brandColors.secondary);
      document.documentElement.style.setProperty('--slate-700', config.brandColors.secondary);
    }
    
    // Apply accent color
    if (config.brandColors?.accent) {
      document.documentElement.style.setProperty('--accent', config.brandColors.accent);
      document.documentElement.style.setProperty('--emerald-500', config.brandColors.accent);
    }
    
    // Apply typography
    if (config.styling?.fontFamily) {
      document.documentElement.style.setProperty('--font-family', config.styling.fontFamily);
      document.body.style.fontFamily = config.styling.fontFamily;
    }
    
    // Apply border radius
    if (config.styling?.borderRadius) {
      document.documentElement.style.setProperty('--radius', config.styling.borderRadius);
    }
    
    // Update company branding
    if (config.companyBranding?.companyName) {
      document.title = `${config.companyBranding.companyName} - Plumbing Services Quote`;
    }
    
    // Force re-render
    document.body.classList.add('config-applied');
    setTimeout(() => document.body.classList.remove('config-applied'), 100);
  };

  const getCompanyName = () => {
    return customConfig?.companyBranding?.companyName || 'Plumbing Services';
  };

  const [formData, setFormData] = useState<PlumbingFormData>({
    serviceType: "",
    propertyType: "",
    urgencyLevel: "",
    city: "",
    floorNumber: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const serviceTypes = [
    { id: "leak-repair", label: "Leak Repair", basePrice: 120, icon: "💧", popular: true },
    { id: "pipe-installation", label: "Pipe Installation", basePrice: 200, icon: "🔧", popular: true },
    { id: "water-heater", label: "Water Heater Install/Repair", basePrice: 450, icon: "🔥", popular: true },
    { id: "toilet-faucet", label: "Toilet / Faucet Repair", basePrice: 90, icon: "🚽", popular: true },
    { id: "renovation", label: "Bathroom/Kitchen Renovation", basePrice: 800, icon: "🏠", popular: false },
    { id: "emergency", label: "Emergency Callout", basePrice: 150, icon: "🚨", popular: true },
  ];

  const propertyTypes = [
    { id: "apartment", label: "Apartment", multiplier: 1.0, popular: true },
    { id: "house", label: "House", multiplier: 1.2, popular: true },
    { id: "commercial", label: "Commercial Property", multiplier: 1.8, popular: false },
  ];

  const urgencyLevels = [
    { id: "flexible", label: "Flexible", surcharge: 0, popular: false },
    { id: "48-hours", label: "Within 48 hours", surcharge: 50, popular: true },
    { id: "emergency", label: "Emergency (Same-day)", surcharge: 100, popular: true },
  ];

  const cities = [
    "Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Wexford", "Sligo"
  ];

  const addOnOptions = [
    { id: "inspection", label: "Full Inspection", price: 60, popular: true },
    { id: "report", label: "Written Report", price: 40, popular: false },
    { id: "warranty", label: "Warranty Extension", price: 30, popular: true },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const serviceType = serviceTypes.find(s => s.id === formData.serviceType);
    const propertyType = propertyTypes.find(p => p.id === formData.propertyType);
    const urgency = urgencyLevels.find(u => u.id === formData.urgencyLevel);

    const basePrice = (serviceType?.basePrice || customConfig?.basePrice || 120) * (propertyType?.multiplier || 1);
    const urgencyAdd = urgency?.surcharge || 0;
    
    // Floor surcharge (€10 per floor above 1st)
    const floorNumber = parseInt(formData.floorNumber) || 1;
    const floorAdd = floorNumber > 1 ? (floorNumber - 1) * 10 : 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base service
    breakdown.push(`${serviceType?.label || 'Base service'} (${propertyType?.label}): €${basePrice.toFixed(0)}`);

    // Urgency surcharge
    if (urgencyAdd > 0) {
      breakdown.push(`${urgency?.label} surcharge: €${urgencyAdd}`);
    }

    // Floor surcharge
    if (floorAdd > 0) {
      breakdown.push(`Floor surcharge (${floorNumber}${floorNumber === 2 ? 'nd' : floorNumber === 3 ? 'rd' : 'th'} floor): €${floorAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    let subtotal = basePrice + urgencyAdd + floorAdd + addOnsTotal;

    // Auto-add inspection for commercial properties
    if (formData.propertyType === "commercial" && !formData.addOns.includes("inspection")) {
      const inspectionPrice = 60;
      addOnsTotal += inspectionPrice;
      subtotal += inspectionPrice;
      breakdown.push(`Commercial inspection (recommended): €${inspectionPrice}`);
    }

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "plumb10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      urgencyAdd,
      floorAdd,
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
    if (input.includes("leak") || input.includes("leaking")) newFormData.serviceType = "leak-repair";
    else if (input.includes("pipe") || input.includes("installation")) newFormData.serviceType = "pipe-installation";
    else if (input.includes("water heater") || input.includes("boiler")) newFormData.serviceType = "water-heater";
    else if (input.includes("toilet") || input.includes("faucet") || input.includes("tap")) newFormData.serviceType = "toilet-faucet";
    else if (input.includes("renovation") || input.includes("bathroom") || input.includes("kitchen")) newFormData.serviceType = "renovation";
    else if (input.includes("emergency") || input.includes("urgent")) newFormData.serviceType = "emergency";

    // Parse property type
    if (input.includes("apartment") || input.includes("flat")) newFormData.propertyType = "apartment";
    else if (input.includes("commercial") || input.includes("office") || input.includes("shop")) newFormData.propertyType = "commercial";
    else newFormData.propertyType = "house";

    // Parse urgency
    if (input.includes("emergency") || input.includes("urgent") || input.includes("same day")) newFormData.urgencyLevel = "emergency";
    else if (input.includes("48") || input.includes("48 hours") || input.includes("soon")) newFormData.urgencyLevel = "48-hours";
    else newFormData.urgencyLevel = "flexible";

    // Parse floor number
    const floorMatch = input.match(/(\d+)(?:st|nd|rd|th)?\s*floor/);
    if (floorMatch) {
      newFormData.floorNumber = floorMatch[1];
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("inspection") || input.includes("check")) newAddOns.push("inspection");
    if (input.includes("report") || input.includes("written")) newAddOns.push("report");
    if (input.includes("warranty") || input.includes("guarantee")) newAddOns.push("warranty");
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
          ? "border-blue-500 bg-blue-50 shadow-lg" 
          : "border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-semibold ${selected ? "text-blue-800" : "text-slate-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-slate-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-slate-500"}`}>+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-slate-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier !== 1.0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-slate-500"}`}>
            {Math.round(option.multiplier * 100)}% rate
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Service Details", completed: !!formData.serviceType && !!formData.propertyType },
    { number: 2, title: "Urgency & Location", completed: !!formData.urgencyLevel && !!formData.city },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-slate-800 mb-2">
            Professional Plumbing Quote Calculator
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-body">
            Get an instant, professional estimate for your plumbing needs. Trusted by homeowners and businesses across Ireland.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-blue-200 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-blue-600 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-slate-300 text-slate-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-blue-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Service Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Wrench className="h-6 w-6 mr-2 text-blue-600" />
                      What plumbing service do you need?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <label className="block text-sm font-body text-slate-700 mb-2">
                        Describe your plumbing issue (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Need emergency leak fix in 3rd-floor apartment"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-blue-200 text-slate-800 mb-3 resize-none placeholder:text-slate-400"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Service Type</h3>
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

                        {formData.serviceType === "leak-repair" && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="text-sm text-slate-600">
                              🔧 Most requested: Leak Repair + Inspection
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Property Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {propertyTypes.map((property) => (
                            <OptionCard
                              key={property.id}
                              option={property}
                              selected={formData.propertyType === property.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: property.id }))}
                              popular={property.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.serviceType || !formData.propertyType}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Urgency & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-blue-600" />
                      Timeline and location details
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Urgency Level</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {urgencyLevels.map((urgency) => (
                            <OptionCard
                              key={urgency.id}
                              option={urgency}
                              selected={formData.urgencyLevel === urgency.id}
                              onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: urgency.id }))}
                              popular={urgency.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-display text-slate-700 mb-3">City</h3>
                          <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                            <SelectTrigger className="border-slate-300 bg-white">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city.toLowerCase()}><EditableText value={city} onSave={() => {}} /></SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <h3 className="text-lg font-display text-slate-700 mb-3">Floor Number</h3>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="number"
                              placeholder="e.g., 3"
                              value={formData.floorNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: e.target.value }))}
                              className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
                              min="1"
                              max="20"
                            />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Additional €10 per floor above 1st
                          </div>
                        </div>
                      </div>

                      {formData.urgencyLevel === "emergency" && (
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                            <h4 className="font-semibold text-orange-800 mb-1">Emergency Service Selected</h4>
                          </div>
                          <div className="text-sm text-orange-700">
                            Same-day emergency service includes €100 surcharge. Our certified plumbers will prioritize your call.
                          </div>
                        </div>
                      )}
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
                      disabled={!formData.urgencyLevel || !formData.city}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-blue-600" />
                      Additional services and discounts
                    </h2>
                    
                    <div className="space-y-6">
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
                                  ? "border-blue-500 bg-blue-50 shadow-lg text-slate-800"
                                  : "border-slate-300 hover:border-blue-400 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-semibold ${formData.addOns.includes(addOn.id) ? "text-blue-600" : "text-slate-500"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                              {addOn.id === "inspection" && (
                                <div className="text-xs text-slate-500 mt-1">
                                  💡 What's included in inspection? → Complete system check, leak detection, pressure testing
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., PLUMB10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-blue-600" />
                      Get your plumbing quote
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
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
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
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
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
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-blue-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-slate-800 mb-4">Your Plumbing Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-blue-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span className="text-blue-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-slate-800">Ready to Fix Your Plumbing?</h3>
                    <p className="text-sm text-slate-600">
                      This quote is valid for 48 hours. Licensed, insured plumbers with 5-year warranty.
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Plumbing Service Appointment";
                        const body = `I'd like to request an appointment! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@aquadashservices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🔧 Request Appointment
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Licensed
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                        Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-700 rounded-full mr-1"></div>
                        5yr Warranty
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
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