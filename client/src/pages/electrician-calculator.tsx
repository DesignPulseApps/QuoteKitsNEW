import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Zap, 
  Home, 
  Building, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User
} from "lucide-react";

interface ElectricianFormData {
  serviceType: string;
  propertyType: string;
  roomCount: string;
  urgencyLevel: string;
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
  serviceTypeAdd: number;
  roomAdd: number;
  urgencyAdd: number;
  addOnsCost: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface ElectricianCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function ElectricianCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: ElectricianCalculatorProps = {}) {
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

  // Initialize with prop config
  useEffect(() => {
    if (propConfig) {
      setCustomConfig(propConfig);
      applyCustomConfig(propConfig);
    }
  }, [propConfig]);

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    if (isPreview) return; // Skip message listener in preview mode
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPreview]);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to electrician calculator:', config);
    setCustomConfig(config);
    
    // Apply primary color
    if (config.brandColors?.primary) {
      document.documentElement.style.setProperty('--primary', config.brandColors.primary);
      document.documentElement.style.setProperty('--amber-500', config.brandColors.primary);
      document.documentElement.style.setProperty('--yellow-500', config.brandColors.primary);
    }
    
    // Apply secondary color
    if (config.brandColors?.secondary) {
      document.documentElement.style.setProperty('--secondary', config.brandColors.secondary);
      document.documentElement.style.setProperty('--blue-600', config.brandColors.secondary);
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
      document.title = `${config.companyBranding.companyName} - Electrician Services Quote`;
    }
    
    // Force re-render
  };

  const getStyles = () => {
    if (!customConfig) return {};
    return {
      '--primary-color': customConfig.primaryColor || '#06D6A0'
    };
  };

  const getCompanyName = () => {
    return customConfig?.companyBranding?.companyName || 'Professional Electrician';
  };

  const [formData, setFormData] = useState<ElectricianFormData>({
    serviceType: "",
    propertyType: "",
    roomCount: "",
    urgencyLevel: "",
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
        icon: group.icon || "⚡",
        popular: group.id === "rewiring" || group.id === "fuse-box-upgrade" || group.id === "lighting-installation"
      }));
    }
    return [
      { id: "new-installation", label: "New Installation", icon: "⚡", popular: false },
      { id: "rewiring", label: "Rewiring", icon: "🔌", popular: true },
      { id: "fault-finding", label: "Fault Finding", icon: "🔍", popular: false },
      { id: "fuse-box-upgrade", label: "Fuse Box Upgrade", icon: "📦", popular: true },
      { id: "lighting-installation", label: "Lighting Installation", icon: "💡", popular: true },
      { id: "ev-charger", label: "EV Charger Install", icon: "🚗", popular: false },
      { id: "smart-home", label: "Smart Home Setup", icon: "🏠", popular: false },
    ];
  };

  const getPropertyTypePricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices.map((location: any) => ({
        id: location.id,
        label: location.label,
        icon: location.icon || "🏢"
      }));
    }
    return [
      { id: "apartment", label: "Apartment", icon: "🏢" },
      { id: "house", label: "House", icon: "🏡" },
      { id: "commercial", label: "Commercial Unit", icon: "🏬" },
      { id: "construction", label: "Construction Site", icon: "🚧" },
    ];
  };

  const getRoomCountOptions = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => duration.label);
    }
    return [
      "1 room", "2 rooms", "3 rooms", "4 rooms", "5 rooms", 
      "6 rooms", "7 rooms", "8 rooms", "9 rooms", "10+ rooms"
    ];
  };

  const getUrgencyPricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices;
    }
    return [
      { id: "standard", label: "Standard (1-3 days)", price: 0, icon: "📅" },
      { id: "next-day", label: "Next Day", price: 50, icon: "⏰" },
      { id: "emergency", label: "Emergency (Same Day)", price: 100, icon: "🚨" },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices;
    }
    return [
      { id: "certificate", label: "Certificate of Compliance", price: 40 },
      { id: "cleanup", label: "Cleanup/Disposal", price: 50 },
      { id: "materials", label: "Materials Included", price: 100 },
      { id: "extra-tech", label: "Extra Technician", price: 70 },
    ];
  };

  const serviceTypes = getServiceTypePricing();
  const propertyTypes = getPropertyTypePricing();
  const roomCounts = getRoomCountOptions();
  const urgencyLevels = getUrgencyPricing();
  const addOnOptions = getAddOnPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const baseCallOut = customConfig?.basePrice || 80;
    
    let serviceTypeAdd = 0;
    let roomAdd = 0;
    let urgencyAdd = 0;
    let addOnsCost = 0;
    const breakdown: string[] = [`Base call-out fee: ${currencySymbol}${baseCallOut}`];

    // Service type pricing - use dynamic pricing from configuration
    const servicePricing: any = {
      "fuse-box-upgrade": 120,
      "ev-charger": 200,
      "smart-home": 225,
      "rewiring": 150,
      "lighting-installation": 80
    };

    if (customConfig?.groupPrices) {
      const serviceConfig = customConfig.groupPrices.find((group: any) => group.id === formData.serviceType);
      if (serviceConfig) {
        serviceTypeAdd = serviceConfig.price;
        breakdown.push(`${serviceConfig.label}: ${currencySymbol}${serviceTypeAdd}`);
      }
    } else {
      serviceTypeAdd = servicePricing[formData.serviceType] || 50;
      const serviceLabel = serviceTypes.find(s => s.id === formData.serviceType)?.label || "Standard service";
      breakdown.push(`${serviceLabel}: ${currencySymbol}${serviceTypeAdd}`);
    }

    // Room count pricing
    if (formData.roomCount) {
      const roomNumber = parseInt(formData.roomCount.split(" ")[0]);
      if (roomNumber > 1) {
        roomAdd = (roomNumber - 1) * (customConfig?.hourlyRate || 60);
        breakdown.push(`Additional ${roomNumber - 1} rooms: ${currencySymbol}${roomAdd}`);
      }
    }

    // Urgency pricing
    const urgency = urgencyLevels.find(u => u.id === formData.urgencyLevel);
    if (urgency) {
      urgencyAdd = urgency.price;
      if (urgencyAdd > 0) {
        breakdown.push(`${urgency.label}: ${currencySymbol}${urgencyAdd}`);
      }
    }

    // Add-ons pricing - use dynamic pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsCost += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    const subtotal = baseCallOut + serviceTypeAdd + roomAdd + urgencyAdd + addOnsCost;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "save10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseCallOut,
      serviceTypeAdd,
      roomAdd,
      urgencyAdd,
      addOnsCost,
      subtotal,
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

    // Parse service types
    if (input.includes("lighting")) newFormData.serviceType = "lighting-installation";
    else if (input.includes("fuse box") || input.includes("fusebox")) newFormData.serviceType = "fuse-box-upgrade";
    else if (input.includes("rewiring") || input.includes("rewire")) newFormData.serviceType = "rewiring";
    else if (input.includes("ev charger") || input.includes("electric car")) newFormData.serviceType = "ev-charger";
    else if (input.includes("smart home")) newFormData.serviceType = "smart-home";
    else if (input.includes("fault") || input.includes("problem")) newFormData.serviceType = "fault-finding";

    // Parse room count
    const roomMatch = input.match(/(\d+)\s*rooms?/);
    if (roomMatch) {
      const count = parseInt(roomMatch[1]);
      newFormData.roomCount = count <= 10 ? `${count} room${count > 1 ? 's' : ''}` : "10+ rooms";
    }

    // Parse urgency
    if (input.includes("urgent") || input.includes("emergency") || input.includes("today")) {
      newFormData.urgencyLevel = "emergency";
    } else if (input.includes("tomorrow") || input.includes("next day")) {
      newFormData.urgencyLevel = "next-day";
    } else {
      newFormData.urgencyLevel = "standard";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("certificate") || input.includes("compliance")) newAddOns.push("certificate");
    if (input.includes("materials") || input.includes("parts")) newAddOns.push("materials");
    if (input.includes("cleanup") || input.includes("disposal")) newAddOns.push("cleanup");
    if (input.includes("extra tech") || input.includes("two people")) newAddOns.push("extra-tech");
    newFormData.addOns = newAddOns;

    // Parse property type
    if (input.includes("apartment") || input.includes("flat")) newFormData.propertyType = "apartment";
    else if (input.includes("commercial") || input.includes("office") || input.includes("shop")) newFormData.propertyType = "commercial";
    else if (input.includes("construction") || input.includes("building site")) newFormData.propertyType = "construction";
    else newFormData.propertyType = "house";

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
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        selected 
          ? "border-blue-500 bg-blue-50 shadow-md" 
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-gray-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && (
          <div className="text-sm text-gray-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Service Type", completed: !!formData.serviceType },
    { number: 2, title: "Property & Scope", completed: !!formData.propertyType && !!formData.roomCount },
    { number: 3, title: "Urgency & Add-ons", completed: !!formData.urgencyLevel },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50" style={getStyles()}>
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            {getCompanyName()} Quote Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Get an instant quote for your electrical project. Professional service, transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Service Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Zap className="h-6 w-6 mr-2 text-blue-500" />
                      What electrical service do you need?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your project in your own words (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need lighting installation in 4 rooms and a fuse box upgrade urgently"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white/80 border-blue-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        variant="outline" 
                        size="sm" 
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

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

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.serviceType}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Property & Scope */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Home className="h-6 w-6 mr-2 text-blue-500" />
                      Property details
                    </h2>
                    
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
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Number of Rooms/Areas</h3>
                        <div className="grid grid-cols-5 gap-3">
                          {roomCounts.map((count) => (
                            <Button
                              key={count}
                              variant={formData.roomCount === count ? "default" : "outline"}
                              onClick={() => setFormData(prev => ({ ...prev, roomCount: count }))}
                              className={`${
                                formData.roomCount === count 
                                  ? "bg-blue-500 hover:bg-blue-600 text-white" 
                                  : "border-gray-300 hover:border-blue-300"
                              }`}
                            >
                              {count}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.propertyType || !formData.roomCount}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Urgency & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-blue-500" />
                      When do you need this done?
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {urgencyLevels.map((urgency) => (
                          <OptionCard
                            key={urgency.id}
                            option={urgency}
                            selected={formData.urgencyLevel === urgency.id}
                            onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: urgency.id }))}
                            icon={urgency.icon}
                          />
                        ))}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Additional Services</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-gray-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-sm text-gray-600 mt-1">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SAVE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.urgencyLevel}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8"
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
                      <Mail className="h-6 w-6 mr-2 text-blue-500" />
                      Get your detailed quote
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
                            className="pl-10"
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
                            className="pl-10"
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
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="text-white px-8"
                      style={{
                        backgroundColor: customConfig?.brandColors?.primary || '#10b981',
                        '&:hover': {
                          backgroundColor: customConfig?.brandColors?.secondary || '#059669'
                        }
                      } as React.CSSProperties}
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
            <Card className="p-6 bg-white/90 backdrop-blur-sm sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">
                  €{pricing.total.toFixed(2)}
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
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {formData.serviceType && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700">
                      ⚡ Most clients choose: {serviceTypes.find(s => s.popular)?.label} + Certificate + Materials
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Schedule Your Job?</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 24 hours. Book your preferred time slot today.
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                      onClick={() => {
                        const subject = "Electrical Job Booking";
                        const body = `I'm ready to schedule my electrical job! My quote is €${pricing.total.toFixed(2)}`;
                        const mailtoUrl = `mailto:info@electrician.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      ⚡ Book My Job
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Same Day Service
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-blue-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 24 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
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