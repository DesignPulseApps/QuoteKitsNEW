import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import SEOHead from "@/components/seo-head";
import { 
  Camera, 
  Clock, 
  MapPin, 
  Heart, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Users,
  Palette
} from "lucide-react";

interface PortraitFormData {
  portraitType: string;
  duration: string;
  location: string;
  wardrobeChanges: string;
  addOns: string[];
  usageType: string;
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
  durationAdd: number;
  locationAdd: number;
  wardrobeAdd: number;
  addOnsTotal: number;
  usageAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
  currency: string;
  currencySymbol: string;
}

interface PortraitPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function PortraitPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: PortraitPhotographyCalculatorProps = {}) {
  const [textConfig, setTextConfig] = useState(propConfig || {});
  const [customConfig, setCustomConfig] = useState(propConfig || {});
  
  // Apply custom configuration (colors, styling, etc.)
  const applyCustomConfig = (config: any) => {
    console.log('Applying config to portrait-photography calculator:', config);
    setCustomConfig(config);
    
    // Apply dynamic color theming like other calculators
    const styleId = 'portrait-calculator-custom-styles';
    let existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    // Handle multiple config format variations
    const primaryColor = config.brandColors?.primary || config.primaryColor || config.backgroundColor || '#f43f5e';
    const secondaryColor = config.brandColors?.secondary || config.secondaryColor || config.textColor || '#6b7280';
    const accentColor = config.brandColors?.accent || config.accentColor || '#10b981';
    const fontFamily = config.styling?.fontFamily || config.fontFamily || 'Inter';
    const borderRadius = config.styling?.borderRadius || config.borderRadius || '0.5rem';
    
    style.textContent = `
      :root {
        --custom-primary: ${primaryColor};
        --custom-secondary: ${secondaryColor};
        --custom-accent: ${accentColor};
        --custom-font: ${fontFamily};
        --custom-radius: ${borderRadius};
      }
      
      .portrait-calculator {
        font-family: var(--custom-font) !important;
      }
      
      .portrait-calculator * {
        font-family: inherit !important;
      }
      
      /* Primary color applications - Override all rose/pink colors */
      .portrait-calculator .bg-rose-500,
      .portrait-calculator .bg-rose-400,
      .portrait-calculator .bg-rose-600,
      .portrait-calculator .hover\\:bg-rose-600:hover,
      .portrait-calculator .bg-green-500,
      .portrait-calculator .hover\\:bg-green-600:hover {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
      
      .portrait-calculator .text-rose-500,
      .portrait-calculator .text-rose-400,
      .portrait-calculator .text-rose-600 {
        color: ${primaryColor} !important;
      }
      
      .portrait-calculator .border-rose-400,
      .portrait-calculator .border-rose-300,
      .portrait-calculator .border-rose-200,
      .portrait-calculator .hover\\:border-rose-300:hover {
        border-color: ${primaryColor} !important;
      }
      
      .portrait-calculator .bg-rose-50,
      .portrait-calculator .from-rose-50,
      .portrait-calculator .to-pink-50 {
        background-color: ${primaryColor}15 !important;
      }
      
      .portrait-calculator .bg-gradient-to-br.from-rose-50.to-pink-50 {
        background: linear-gradient(to bottom right, ${primaryColor}15, ${primaryColor}10) !important;
      }
      
      /* Border radius customization */
      .portrait-calculator [class*="rounded"] {
        border-radius: ${borderRadius} !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Apply secondary color
    if (config.brandColors?.secondary) {
      document.documentElement.style.setProperty('--secondary', config.brandColors.secondary);
      document.documentElement.style.setProperty('--gray-700', config.brandColors.secondary);
    }
    
    // Apply accent color
    if (config.brandColors?.accent) {
      document.documentElement.style.setProperty('--accent', config.brandColors.accent);
      document.documentElement.style.setProperty('--green-500', config.brandColors.accent);
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
    
    // Update text config
    if (config.textContent) {
      setTextConfig(prevText => ({ ...prevText, ...config.textContent }));
    }
  };
  
  // Apply config on mount and when propConfig changes
  useEffect(() => {
    if (propConfig) {
      applyCustomConfig(propConfig);
    }
  }, [propConfig]);
  
  // Handle text content updates from customConfig
  const updateTextContent = (key: string, value: string) => {
    const newConfig = {
      ...textConfig,
      [key]: value
    };
    setTextConfig(newConfig);
    
    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<PortraitFormData>({
    portraitType: "",
    duration: "",
    location: "",
    wardrobeChanges: "",
    addOns: [],
    usageType: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Use custom group pricing if available
  const getGroupPricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices;
    }
    return [
      { id: "individual", label: "Individual", price: 0, icon: "👤", popular: true },
      { id: "couple", label: "Couple", price: 50, icon: "💕", popular: true },
      { id: "family", label: "Family", price: 100, icon: "👨‍👩‍👧‍👦" },
      { id: "senior", label: "Senior / Graduation", price: 0, icon: "🎓" },
      { id: "branding", label: "Branding / Business", price: 80, icon: "💼", popular: true },
    ];
  };

  // Use custom duration pricing if available
  const getDurationPricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations;
    }
    return [
      { id: "30-min", label: "30 minutes", price: 0, icon: "⏰" },
      { id: "1-hour", label: "1 hour", price: 75, icon: "🕐", popular: true },
      { id: "2-hours", label: "2 hours", price: 150, icon: "⏱️" },
    ];
  };

  const portraitTypes = getGroupPricing();
  const durations = getDurationPricing();

  // Use custom location pricing if available
  const getLocationPricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices;
    }
    return [
      { id: "studio", label: "Studio", price: 0, icon: "🏢" },
      { id: "outdoor", label: "Outdoor", price: 60, icon: "🌳", popular: true },
      { id: "client-location", label: "Client's Home / Office", price: 60, icon: "🏠" },
    ];
  };

  // Use custom wardrobe pricing if available
  const getWardrobePricing = () => {
    if (customConfig?.wardrobePrices) {
      return customConfig.wardrobePrices;
    }
    return [
      { id: "1", label: "1 Outfit", price: 0, icon: "👕" },
      { id: "2", label: "2 Outfits", price: 40, icon: "👔", popular: true },
      { id: "3+", label: "3+ Outfits", price: 80, icon: "👗" },
    ];
  };

  const locations = getLocationPricing();
  const wardrobeOptions = getWardrobePricing();

  // Use custom enhancement pricing if available
  const getEnhancementPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map(addon => ({
        ...addon,
        popular: addon.id === "makeup" || addon.id === "deluxe-retouching"
      }));
    }
    return [
      { id: "makeup", label: "Professional Makeup", price: 80, popular: true },
      { id: "standard-retouching", label: "Standard Retouching", price: 0 },
      { id: "deluxe-retouching", label: "Deluxe Retouching", price: 50, popular: true },
      { id: "express-delivery", label: "Express Delivery", price: 50 },
      { id: "extra-images", label: "Extra Images (+5)", price: 100 },
      { id: "headshot-bundle", label: "Headshot Bundle", price: 75 },
    ];
  };

  // Use custom usage pricing if available
  const getUsagePricing = () => {
    if (customConfig?.usagePrices) {
      return customConfig.usagePrices;
    }
    return [
      { id: "personal", label: "Personal Use", price: 0, icon: "🏠" },
      { id: "commercial", label: "Commercial / Branding", price: 120, icon: "💼" },
    ];
  };

  const addOnOptions = getEnhancementPricing();
  const usageTypes = getUsagePricing();

  const calculatePricing = (): PricingBreakdown => {
    // Use custom pricing configuration if available, otherwise use defaults
    const baseSession = customConfig?.basePrice ?? 150;
    const locationFee = customConfig?.locationFee || 50;
    const currency = customConfig?.currency || 'EUR';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'CHF' ? '₣' : '€';
    
    let durationAdd = 0;
    let locationAdd = 0;
    let wardrobeAdd = 0;
    let portraitTypeAdd = 0;
    let addOnsTotal = 0;
    let usageAdd = 0;
    const breakdown: string[] = [`Base session: ${currencySymbol}${baseSession}`];

    // Portrait type/group size pricing
    const portraitType = portraitTypes.find(p => p.id === formData.portraitType);
    if (portraitType && portraitType.price > 0) {
      portraitTypeAdd = portraitType.price;
      breakdown.push(`${portraitType.label}: ${currencySymbol}${portraitTypeAdd}`);
    }

    // Duration pricing - use custom duration multipliers if available
    const duration = durations.find(d => d.id === formData.duration);
    if (duration) {
      const durationPrices = customConfig?.durationPrices || [
        { duration: "30 minutes", multiplier: 0.5 },
        { duration: "1 hour", multiplier: 1 },
        { duration: "2 hours", multiplier: 1.8 },
        { duration: "Half day", multiplier: 3 }
      ];
      
      const customDuration = durationPrices.find(dp => 
        dp.duration.toLowerCase().includes(duration.id.replace('-', ' ')) ||
        duration.label.toLowerCase().includes(dp.duration.toLowerCase())
      );
      
      if (customDuration && customDuration.multiplier !== 1) {
        durationAdd = Math.round(baseSession * (customDuration.multiplier - 1));
        if (durationAdd > 0) {
          breakdown.push(`${duration.label} (${customDuration.multiplier}×): ${currencySymbol}${durationAdd}`);
        }
      }
    }

    // Location pricing - use actual location pricing from configuration
    const location = locations.find(l => l.id === formData.location);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: ${currencySymbol}${locationAdd}`);
    }

    // Wardrobe changes pricing - use actual wardrobe pricing from configuration
    const wardrobe = wardrobeOptions.find(w => w.id === formData.wardrobeChanges);
    if (wardrobe && wardrobe.price > 0) {
      wardrobeAdd = wardrobe.price;
      breakdown.push(`${wardrobe.label}: ${currencySymbol}${wardrobeAdd}`);
    }

    // Add-ons pricing - use dynamic enhancement pricing from configuration
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    // Usage type pricing - use dynamic usage pricing from configuration
    const usage = usageTypes.find(u => u.id === formData.usageType);
    if (usage && usage.price > 0) {
      usageAdd = usage.price;
      breakdown.push(`${usage.label}: ${currencySymbol}${usageAdd}`);
    }

    const subtotal = baseSession + durationAdd + locationAdd + wardrobeAdd + portraitTypeAdd + addOnsTotal + usageAdd;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "portrait10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseSession,
      durationAdd,
      locationAdd,
      wardrobeAdd,
      portraitTypeAdd,
      addOnsTotal,
      usageAdd,
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

    // Parse portrait type
    if (input.includes("couple")) newFormData.portraitType = "couple";
    else if (input.includes("family")) newFormData.portraitType = "family";
    else if (input.includes("senior") || input.includes("graduation")) newFormData.portraitType = "senior";
    else if (input.includes("business") || input.includes("branding") || input.includes("professional")) newFormData.portraitType = "branding";
    else newFormData.portraitType = "individual";

    // Parse duration
    if (input.includes("2 hour") || input.includes("two hour")) {
      newFormData.duration = "2-hours";
    } else if (input.includes("1 hour") || input.includes("one hour")) {
      newFormData.duration = "1-hour";
    } else {
      newFormData.duration = "30-min";
    }

    // Parse location
    if (input.includes("outdoor") || input.includes("outside") || input.includes("park")) {
      newFormData.location = "outdoor";
    } else if (input.includes("home") || input.includes("office") || input.includes("location")) {
      newFormData.location = "client-location";
    } else {
      newFormData.location = "studio";
    }

    // Parse wardrobe changes
    const outfitMatch = input.match(/(\d+)\s*(?:outfit|change|look)/);
    if (outfitMatch) {
      const count = parseInt(outfitMatch[1]);
      if (count >= 3) newFormData.wardrobeChanges = "3+";
      else if (count === 2) newFormData.wardrobeChanges = "2";
      else newFormData.wardrobeChanges = "1";
    } else {
      newFormData.wardrobeChanges = "2";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("makeup")) newAddOns.push("makeup");
    if (input.includes("deluxe retouch") || input.includes("advanced retouch")) {
      newAddOns.push("deluxe-retouching");
    } else if (input.includes("retouch")) {
      newAddOns.push("standard-retouching");
    }
    if (input.includes("express") || input.includes("rush") || input.includes("fast")) newAddOns.push("express-delivery");
    if (input.includes("extra image") || input.includes("additional")) newAddOns.push("extra-images");
    if (input.includes("headshot")) newAddOns.push("headshot-bundle");
    newFormData.addOns = newAddOns;

    // Parse usage type
    if (input.includes("commercial") || input.includes("business") || input.includes("marketing")) {
      newFormData.usageType = "commercial";
    } else {
      newFormData.usageType = "personal";
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
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg" 
          : "border-gray-200 hover:border-rose-300 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <div className="font-semibold text-gray-800">{option.label}</div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-rose-600 mt-1">+€{option.price}</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: textConfig?.stepTitle1 || "Portrait & Duration", completed: !!formData.portraitType && !!formData.duration },
    { number: 2, title: textConfig?.stepTitle2 || "Location & Wardrobe", completed: !!formData.location && !!formData.wardrobeChanges },
    { number: 3, title: textConfig?.stepTitle3 || "Add-ons & Usage", completed: !!formData.usageType },
    { number: 4, title: textConfig?.stepTitle4 || "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen portrait-calculator">
      <SEOHead 
        title="Portrait Photography Quote Calculator | AI-Powered Pricing | QuoteKit.ai"
        description="Get instant portrait photography quotes with our AI calculator. Professional pricing for individual, couple, family & business portraits. Custom quotes in 30 seconds."
        keywords="portrait photography quotes, photography pricing calculator, portrait session pricing, photographer quote tool, photography cost calculator"
        url="https://quotekit.ai/portrait-photography-calculator"
      />
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <EditableText
            text={textConfig?.mainTitle || "Portrait Photography Calculator"}
            onSave={(value) => updateTextContent('mainTitle', value)}
            isPreview={isPreview}
            placeholder="Portrait Photography Calculator"
            className="text-4xl font-display text-gray-800 mb-2 block"
          />
          <EditableText
            text={textConfig?.subtitle || "Beautiful portraits that capture your authentic self. Get your personalized quote instantly."}
            onSave={(value) => updateTextContent('subtitle', value)}
            isPreview={isPreview}
            placeholder="Beautiful portraits that capture your authentic self. Get your personalized quote instantly."
            multiline={true}
            className="text-gray-600 max-w-2xl mx-auto font-body block"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gray-200 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-rose-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      <EditableText
                        text={step.title}
                        onSave={(value) => updateTextContent(`stepTitle${step.number}`, value)}
                        isPreview={isPreview}
                        placeholder={step.title}
                        className="text-sm font-medium text-gray-700"
                      />
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Portrait & Duration */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <div className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2 text-rose-500" />
                      <EditableText
                        text={textConfig?.step1Title || "Tell us about your portrait session"}
                        onSave={(value) => updateTextContent('step1Title', value)}
                        isPreview={isPreview}
                        placeholder="Tell us about your portrait session"
                        className="text-2xl font-display text-gray-800"
                      />
                    </div>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                      <EditableText
                        text={textConfig?.visionLabel || "Describe your vision (optional)"}
                        onSave={(value) => updateTextContent('visionLabel', value)}
                        isPreview={isPreview}
                        placeholder="Describe your vision (optional)"
                        className="block text-sm font-body text-gray-700 mb-2"
                      />
                      <Textarea
                        placeholder="e.g., I want an outdoor shoot with 2 outfits and retouching"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-rose-200 mb-3 resize-none rounded-lg"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-rose-500 hover:bg-rose-600 text-white border-0 font-body font-semibold rounded-lg"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <EditableText
                          text={textConfig?.portraitTypeLabel || "Portrait Type"}
                          onSave={(value) => updateTextContent('portraitTypeLabel', value)}
                          isPreview={isPreview}
                          placeholder="Portrait Type"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {portraitTypes.map((type) => (
                            <OptionCard
                              key={type.id}
                              option={type}
                              selected={formData.portraitType === type.id}
                              onClick={() => setFormData(prev => ({ ...prev, portraitType: type.id }))}
                              icon={type.icon}
                              popular={type.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          text={textConfig?.durationLabel || "Session Duration"}
                          onSave={(value) => updateTextContent('durationLabel', value)}
                          isPreview={isPreview}
                          placeholder="Session Duration"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <div className="grid grid-cols-1 gap-4">
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

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.portraitType || !formData.duration}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-8 font-semibold rounded-lg"
                    >
                      <EditableText
                        text={propConfig?.nextStepButton || "Next Step"}
                        onSave={(value) => updateTextContent('nextStepButton', value)}
                        isPreview={isPreview}
                        placeholder="Next Step"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Wardrobe */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-rose-500" />
                      <EditableText
                        text={textConfig?.step2Title || "Location & styling details"}
                        onSave={(value) => updateTextContent('step2Title', value)}
                        isPreview={isPreview}
                        placeholder="Location & styling details"
                        className="text-2xl font-display text-gray-800"
                      />
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <EditableText
                          text={textConfig?.locationLabel || "Shooting Location"}
                          onSave={(value) => updateTextContent('locationLabel', value)}
                          isPreview={isPreview}
                          placeholder="Shooting Location"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <div className="grid grid-cols-1 gap-4">
                          {locations.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.location === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, location: location.id }))}
                              icon={location.icon}
                              popular={location.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          text={textConfig?.wardrobeLabel || "Wardrobe Changes"}
                          onSave={(value) => updateTextContent('wardrobeLabel', value)}
                          isPreview={isPreview}
                          placeholder="Wardrobe Changes"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <div className="grid grid-cols-1 gap-4">
                          {wardrobeOptions.map((wardrobe) => (
                            <OptionCard
                              key={wardrobe.id}
                              option={wardrobe}
                              selected={formData.wardrobeChanges === wardrobe.id}
                              onClick={() => setFormData(prev => ({ ...prev, wardrobeChanges: wardrobe.id }))}
                              icon={wardrobe.icon}
                              popular={wardrobe.popular}
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
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.location || !formData.wardrobeChanges}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-8 font-semibold rounded-lg"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Usage */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Palette className="h-6 w-6 mr-2 text-rose-500" />
                      <EditableText
                        text={textConfig?.step3Title || "Enhance your session"}
                        onSave={(value) => updateTextContent('step3Title', value)}
                        isPreview={isPreview}
                        placeholder="Enhance your session"
                        className="text-2xl font-display text-gray-800"
                      />
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <EditableText
                          text={textConfig?.addOnsLabel || "Add-ons (Optional)"}
                          onSave={(value) => updateTextContent('addOnsLabel', value)}
                          isPreview={isPreview}
                          placeholder="Add-ons (Optional)"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
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
                                  ? "border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg"
                                  : "border-gray-200 hover:border-rose-300 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-gray-800">{addOn.label}</div>
                                <div className="text-rose-600 font-semibold">
                                  {addOn.price > 0 ? `+€${addOn.price}` : "Included"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {formData.addOns.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                              📸 Most clients choose 1 hour, outdoor, 2 outfits + makeup
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <EditableText
                          text={textConfig?.usageTypeLabel || "Usage Type"}
                          onSave={(value) => updateTextContent('usageTypeLabel', value)}
                          isPreview={isPreview}
                          placeholder="Usage Type"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <div className="grid grid-cols-1 gap-4">
                          {usageTypes.map((usage) => (
                            <OptionCard
                              key={usage.id}
                              option={usage}
                              selected={formData.usageType === usage.id}
                              onClick={() => setFormData(prev => ({ ...prev, usageType: usage.id }))}
                              icon={usage.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <EditableText
                          text={textConfig?.promoCodeLabel || "Promo Code (Optional)"}
                          onSave={(value) => updateTextContent('promoCodeLabel', value)}
                          isPreview={isPreview}
                          placeholder="Promo Code (Optional)"
                          className="text-lg font-display text-gray-700 mb-3 block"
                        />
                        <Input
                          placeholder="Enter promo code (e.g., PORTRAIT10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.usageType}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-8 font-semibold rounded-lg"
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
                      <Mail className="h-6 w-6 mr-2 text-rose-500" />
                      <EditableText
                        text={textConfig?.step4Title || "Get your personalized quote"}
                        onSave={(value) => updateTextContent('step4Title', value)}
                        isPreview={isPreview}
                        placeholder="Get your personalized quote"
                        className="text-2xl font-display text-gray-800"
                      />
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
                            className="pl-10 border-gray-300 rounded-lg"
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
                            className="pl-10 border-gray-300 rounded-lg"
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
                            className="pl-10 border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold rounded-lg"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">
                <EditableText
                  text={textConfig?.priceCardTitle || "Your Portrait Session"}
                  onSave={(value) => updateTextContent('priceCardTitle', value)}
                  isPreview={isPreview}
                  placeholder="Your Portrait Session"
                  className="text-xl font-display text-gray-800"
                />
              </h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-rose-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>{item.split(': ')[0]}</span>
                        <span>{item.split(': ')[1]}</span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-{pricing.currencySymbol}{pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>{pricing.currencySymbol}{pricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-4">
                    <EditableText
                      text={textConfig?.bookingTitle || "Ready to Book Your Portrait?"}
                      onSave={(value) => updateTextContent('bookingTitle', value)}
                      isPreview={isPreview}
                      placeholder="Ready to Book Your Portrait?"
                      className="text-lg font-display text-gray-800 block"
                    />
                    <p className="text-sm text-gray-600">
                      <EditableText
                        text={textConfig?.bookingDescription || "This quote is valid for 72 hours. Let's create beautiful portraits that capture your essence."}
                        onSave={(value) => updateTextContent('bookingDescription', value)}
                        isPreview={isPreview}
                        placeholder="This quote is valid for 72 hours. Let's create beautiful portraits that capture your essence."
                        multiline={true}
                        className="text-sm text-gray-600"
                      />
                    </p>
                    
                    <Button 
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 font-semibold rounded-lg"
                      onClick={() => {
                        const subject = "Portrait Photography Booking";
                        const body = `I'm ready to book my portrait session! My quote is ${pricing.currencySymbol}${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@portraitstudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      <EditableText
                        text={textConfig?.bookingButtonText || "📸 Book My Portrait"}
                        onSave={(value) => updateTextContent('bookingButtonText', value)}
                        isPreview={isPreview}
                        placeholder="📸 Book My Portrait"
                        className="w-full"
                      />
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <EditableText
                          text={textConfig?.qualityBadge || "Professional Quality"}
                          onSave={(value) => updateTextContent('qualityBadge', value)}
                          isPreview={isPreview}
                          placeholder="Professional Quality"
                          className="text-xs text-gray-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div>
                        <EditableText
                          text={textConfig?.previewBadge || "Same-Day Preview"}
                          onSave={(value) => updateTextContent('previewBadge', value)}
                          isPreview={isPreview}
                          placeholder="Same-Day Preview"
                          className="text-xs text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
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
                        className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg"
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