import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Camera, 
  Clock, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Building,
  Image
} from "lucide-react";

interface CommercialFormData {
  projectType: string;
  imageCount: string;
  location: string;
  duration: string;
  addOns: string[];
  deliverySpeed: string;
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
  imageAdd: number;
  durationAdd: number;
  locationAdd: number;
  addOnsTotal: number;
  deliveryAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
  currency?: string;
}

interface CommercialPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function CommercialPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: CommercialPhotographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig);
  const [textConfig, setTextConfig] = useState<any>({});
  
  // Initialize with prop config and watch for changes
  useEffect(() => {
    if (propConfig) {
      setCustomConfig(propConfig);
      applyCustomConfig(propConfig);
    }
  }, [propConfig]);

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        setCustomConfig(event.data.config);
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to commercial photography calculator:', config);
    setCustomConfig(config);
    
    // Initialize text configuration if provided
    if (config.textContent) {
      setTextConfig(config.textContent);
    }
  };
  
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
  const [formData, setFormData] = useState<CommercialFormData>({
    projectType: "",
    imageCount: "",
    location: "",
    duration: "",
    addOns: [],
    deliverySpeed: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const projectTypes = [
    { id: "product", label: "Product Photography", icon: "📦", popular: true },
    { id: "branding", label: "Branding & Lifestyle", icon: "✨", popular: true },
    { id: "headshots", label: "Corporate Headshots", icon: "👤" },
    { id: "editorial", label: "Editorial / Magazine", icon: "📰" },
    { id: "advertising", label: "Advertising Campaign", icon: "🎯" },
  ];

  // Use custom pricing configuration if available
  const getImageCountPricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        id: group.id,
        label: group.label,
        price: group.price,
        icon: group.icon || "📷",
        popular: group.id === "6-15" || group.id === "16-30"
      }));
    }
    return [
      { id: "1-5", label: "1-5 images", price: 0, icon: "📷" },
      { id: "6-15", label: "6-15 images", price: 300, icon: "📸", popular: true },
      { id: "16-30", label: "16-30 images", price: 750, icon: "🎥", popular: true },
      { id: "30+", label: "30+ images", price: 1200, icon: "🏢" },
    ];
  };

  const getLocationPricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices.map((location: any) => ({
        id: location.id,
        label: location.label,
        price: location.price,
        icon: location.icon || "🏢"
      }));
    }
    return [
      { id: "studio", label: "In-Studio", price: 0, icon: "🏢" },
      { id: "on-location", label: "On-location (office, warehouse, outdoors)", price: 100, icon: "🌍" },
      { id: "hybrid", label: "Hybrid (multiple locations)", price: 200, icon: "🔄" },
    ];
  };

  const getDurationPricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        price: duration.price,
        icon: duration.icon || "⏰",
        popular: duration.id === "half-day" || duration.id === "full-day"
      }));
    }
    return [
      { id: "1-hour", label: "Up to 1 hour", price: 0, icon: "⏰" },
      { id: "half-day", label: "Half-day (4 hours)", price: 250, icon: "🌅", popular: true },
      { id: "full-day", label: "Full-day (8 hours)", price: 600, icon: "☀️", popular: true },
      { id: "multi-day", label: "Multi-day", price: 1200, icon: "📅" },
    ];
  };

  const getEnhancementPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((addon: any) => ({
        ...addon,
        popular: addon.id === "creative-director" || addon.id === "advanced-retouching"
      }));
    }
    return [
      { id: "creative-director", label: "Creative Director / Art Direction", price: 200, popular: true },
      { id: "stylist", label: "Wardrobe Stylist", price: 150 },
      { id: "basic-retouching", label: "Basic Retouching", price: 50 },
      { id: "advanced-retouching", label: "Advanced Retouching", price: 100, popular: true },
      { id: "casting", label: "Model/Actor Casting", price: 300 },
      { id: "set-design", label: "Set Design / Props", price: 180 },
      { id: "local-rights", label: "Usage Rights: Local", price: 100 },
      { id: "national-rights", label: "Usage Rights: National", price: 250 },
      { id: "global-rights", label: "Usage Rights: Global", price: 500 },
    ];
  };

  const getDeliveryPricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices;
    }
    return [
      { id: "standard", label: "Standard (3-5 days)", price: 0, icon: "📅" },
      { id: "rush", label: "Rush (48 hours)", price: 90, icon: "⚡" },
      { id: "same-day", label: "Same-Day Preview", price: 150, icon: "🚨" },
    ];
  };

  const imageCounts = getImageCountPricing();
  const locations = getLocationPricing();
  const durations = getDurationPricing();
  const addOnOptions = getEnhancementPricing();
  const deliverySpeeds = getDeliveryPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const baseStudio = customConfig?.basePrice || 350;
    
    let imageAdd = 0;
    let durationAdd = 0;
    let locationAdd = 0;
    let addOnsTotal = 0;
    let deliveryAdd = 0;
    const breakdown: string[] = [`Base package (product, 1hr, studio, 1-5 images): ${currencySymbol}${baseStudio}`];

    // Image count pricing
    const images = imageCounts.find(i => i.id === formData.imageCount);
    if (images && images.price > 0) {
      imageAdd = images.price;
      breakdown.push(`${images.label}: ${currencySymbol}${imageAdd}`);
    }

    // Duration pricing
    const duration = durations.find(d => d.id === formData.duration);
    if (duration && duration.price > 0) {
      durationAdd = duration.price;
      breakdown.push(`${duration.label}: ${currencySymbol}${durationAdd}`);
    }

    // Location pricing
    const location = locations.find(l => l.id === formData.location);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: ${currencySymbol}${locationAdd}`);
    }

    // Add-ons pricing - use dynamic pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    // Delivery speed pricing
    const delivery = deliverySpeeds.find(d => d.id === formData.deliverySpeed);
    if (delivery && delivery.price > 0) {
      deliveryAdd = delivery.price;
      breakdown.push(`${delivery.label}: ${currencySymbol}${deliveryAdd}`);
    }

    const subtotal = baseStudio + imageAdd + durationAdd + locationAdd + addOnsTotal + deliveryAdd;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "commercial10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseStudio,
      imageAdd,
      durationAdd,
      locationAdd,
      addOnsTotal,
      deliveryAdd,
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

    // Parse project type
    if (input.includes("product")) newFormData.projectType = "product";
    else if (input.includes("lifestyle") || input.includes("brand")) newFormData.projectType = "branding";
    else if (input.includes("headshot") || input.includes("corporate")) newFormData.projectType = "headshots";
    else if (input.includes("editorial") || input.includes("magazine")) newFormData.projectType = "editorial";
    else if (input.includes("advertising") || input.includes("campaign")) newFormData.projectType = "advertising";
    else newFormData.projectType = "product";

    // Parse image count
    const imageMatch = input.match(/(\d+)\s*(?:image|photo|shot)/);
    if (imageMatch) {
      const count = parseInt(imageMatch[1]);
      if (count <= 5) newFormData.imageCount = "1-5";
      else if (count <= 15) newFormData.imageCount = "6-15";
      else if (count <= 30) newFormData.imageCount = "16-30";
      else newFormData.imageCount = "30+";
    } else {
      newFormData.imageCount = "6-15";
    }

    // Parse location
    if (input.includes("location") || input.includes("office") || input.includes("warehouse") || input.includes("outdoor")) {
      newFormData.location = "on-location";
    } else if (input.includes("hybrid") || input.includes("multiple")) {
      newFormData.location = "hybrid";
    } else {
      newFormData.location = "studio";
    }

    // Parse duration
    if (input.includes("full day") || input.includes("8 hour")) {
      newFormData.duration = "full-day";
    } else if (input.includes("half day") || input.includes("4 hour")) {
      newFormData.duration = "half-day";
    } else if (input.includes("multi") || input.includes("several day")) {
      newFormData.duration = "multi-day";
    } else {
      newFormData.duration = "1-hour";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("creative") || input.includes("art direct")) newAddOns.push("creative-director");
    if (input.includes("stylist") || input.includes("wardrobe")) newAddOns.push("stylist");
    if (input.includes("props") || input.includes("set design")) newAddOns.push("set-design");
    if (input.includes("casting") || input.includes("model")) newAddOns.push("casting");
    if (input.includes("advanced retouch")) newAddOns.push("advanced-retouching");
    else if (input.includes("retouch")) newAddOns.push("basic-retouching");
    if (input.includes("global")) newAddOns.push("global-rights");
    else if (input.includes("national")) newAddOns.push("national-rights");
    else if (input.includes("local")) newAddOns.push("local-rights");
    newFormData.addOns = newAddOns;

    // Parse delivery speed
    if (input.includes("same day")) {
      newFormData.deliverySpeed = "same-day";
    } else if (input.includes("rush") || input.includes("48") || input.includes("urgent")) {
      newFormData.deliverySpeed = "rush";
    } else {
      newFormData.deliverySpeed = "standard";
    }

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
          ? "border-slate-700 bg-slate-50 shadow-md" 
          : "border-slate-200 hover:border-slate-400 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-slate-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project & Images", completed: !!formData.projectType && !!formData.imageCount },
    { number: 2, title: "Location & Duration", completed: !!formData.location && !!formData.duration },
    { number: 3, title: "Add-ons & Delivery", completed: !!formData.deliverySpeed },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <EditableText
            value={textConfig.mainTitle || "Commercial Photography Calculator"}
            onSave={(value) => updateTextContent('mainTitle', value)}
            className="text-4xl font-display text-slate-800 mb-2 block"
            isPreview={isPreview}
            placeholder="Enter main title"
          />
          <EditableText
            value={textConfig.mainSubtitle || "Professional commercial photography with transparent pricing. Get your custom quote instantly."}
            onSave={(value) => updateTextContent('mainSubtitle', value)}
            className="text-slate-600 max-w-2xl mx-auto font-body"
            isPreview={isPreview}
            placeholder="Enter subtitle"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-slate-200">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-slate-700 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project & Images */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Briefcase className="h-6 w-6 mr-2 text-slate-700" />
                      <EditableText
                        value={textConfig.step1Title || "Tell us about your project"}
                        onSave={(value) => updateTextContent('step1Title', value)}
                        className="text-2xl font-display text-slate-800"
                        isPreview={isPreview}
                        placeholder="Enter step 1 title"
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <EditableText
                        value={textConfig.descriptionLabel || "Describe your project (optional)"}
                        onSave={(value) => updateTextContent('descriptionLabel', value)}
                        className="block text-sm font-body text-slate-700 mb-2"
                        isPreview={isPreview}
                        placeholder="Enter description label"
                      />
                      <Textarea
                        placeholder="e.g., Lifestyle brand shoot, full day, with props and 20 final images"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-slate-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-slate-700 hover:bg-slate-800 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <EditableText
                          value={textConfig.aiButtonText || "Calculate with AI"}
                          onSave={(value) => updateTextContent('aiButtonText', value)}
                          className="font-body font-semibold"
                          isPreview={isPreview}
                          placeholder="Enter button text"
                        />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <EditableText
                          value={textConfig.projectTypeTitle || "Project Type"}
                          onSave={(value) => updateTextContent('projectTypeTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter project type title"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {projectTypes.map((project) => (
                            <OptionCard
                              key={project.id}
                              option={project}
                              selected={formData.projectType === project.id}
                              onClick={() => setFormData(prev => ({ ...prev, projectType: project.id }))}
                              icon={project.icon}
                              popular={project.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          value={textConfig.imageCountTitle || "Number of Final Images Required"}
                          onSave={(value) => updateTextContent('imageCountTitle', value)}
                          className="text-lg font-display text-slate-700 mb-3 block"
                          isPreview={isPreview}
                          placeholder="Enter image count title"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {imageCounts.map((count) => (
                            <OptionCard
                              key={count.id}
                              option={count}
                              selected={formData.imageCount === count.id}
                              onClick={() => setFormData(prev => ({ ...prev, imageCount: count.id }))}
                              icon={count.icon}
                              popular={count.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.imageCount}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      <EditableText
                        value={textConfig.nextStepButton1 || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButton1', value)}
                        className="px-8 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter next step button text"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Duration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-slate-700" />
                      Location & shoot duration
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Shooting Location</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {locations.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.location === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, location: location.id }))}
                              icon={location.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Shoot Duration</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {durations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.duration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                              icon={duration.icon}
                              popular={duration.popular}
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
                      disabled={!formData.location || !formData.duration}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Delivery */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Image className="h-6 w-6 mr-2 text-slate-700" />
                      Add-ons & delivery options
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
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-slate-700 bg-slate-50 shadow-md"
                                  : "border-slate-200 hover:border-slate-400 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-slate-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-slate-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {formData.addOns.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-green-700">
                              📸 Most booked: Full-day lifestyle + casting + creative director
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Delivery Speed</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {deliverySpeeds.map((speed) => (
                            <OptionCard
                              key={speed.id}
                              option={speed}
                              selected={formData.deliverySpeed === speed.id}
                              onClick={() => setFormData(prev => ({ ...prev, deliverySpeed: speed.id }))}
                              icon={speed.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., COMMERCIAL10)"
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
                      disabled={!formData.deliverySpeed}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
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
                      <Mail className="h-6 w-6 mr-2 text-slate-700" />
                      Get your detailed quote
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-200 sticky top-8">
              <EditableText
                value={textConfig.quoteTitle || "Your Commercial Shoot Quote"}
                onSave={(value) => updateTextContent('quoteTitle', value)}
                className="text-xl font-display text-slate-800 mb-4 block"
                isPreview={isPreview}
                placeholder="Enter quote title"
              />
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-slate-700">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
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
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <EditableText
                      value={textConfig.bookingTitle || "Ready to Book This Shoot?"}
                      onSave={(value) => updateTextContent('bookingTitle', value)}
                      className="text-lg font-display text-slate-800 block"
                      isPreview={isPreview}
                      placeholder="Enter booking title"
                    />
                    <EditableText
                      value={textConfig.bookingDescription || "This quote is valid for 72 hours. Let's create stunning commercial photography together."}
                      onSave={(value) => updateTextContent('bookingDescription', value)}
                      className="text-sm text-slate-600"
                      isPreview={isPreview}
                      placeholder="Enter booking description"
                    />
                    
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Commercial Photography Booking";
                        const body = `I'm ready to book my commercial photography session! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@commercialstudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      <EditableText
                        value={textConfig.bookingButton || "📸 Book This Shoot"}
                        onSave={(value) => updateTextContent('bookingButton', value)}
                        className="w-full py-3 font-semibold"
                        isPreview={isPreview}
                        placeholder="Enter booking button text"
                      />
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Professional Quality
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-500 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
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