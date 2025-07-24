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
  Utensils, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  ChefHat,
  Image
} from "lucide-react";

interface FoodFormData {
  clientType: string;
  dishCount: string;
  location: string;
  imageStyle: string;
  addOns: string[];
  deliveryFormat: string[];
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
  dishAdd: number;
  locationAdd: number;
  styleAdd: number;
  addOnsTotal: number;
  deliveryAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface FoodPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function FoodPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: FoodPhotographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  
  // Use the propConfig as customConfig for consistency
  const customConfig = propConfig;
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
  
  const [formData, setFormData] = useState<FoodFormData>({
    clientType: "",
    dishCount: "",
    location: "",
    imageStyle: "",
    addOns: [],
    deliveryFormat: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Use custom pricing configuration if available
  const getClientTypePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        id: group.id,
        label: group.label,
        icon: group.icon || "🍽️",
        popular: group.id === "restaurant" || group.id === "chef"
      }));
    }
    return [
      { id: "restaurant", label: "Restaurant", icon: "🍽️", popular: true },
      { id: "chef", label: "Chef / Personal Brand", icon: "👨‍🍳", popular: true },
      { id: "product", label: "Product Brand", icon: "📦" },
      { id: "editorial", label: "Magazine / Editorial", icon: "📰" },
      { id: "social", label: "Social Media Campaign", icon: "📱" },
    ];
  };

  const getDishCountPricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        price: duration.price,
        icon: duration.icon || "🍴",
        popular: duration.id === "6-10" || duration.id === "11-20"
      }));
    }
    return [
      { id: "1-5", label: "1-5 dishes", price: 0, icon: "🍴" },
      { id: "6-10", label: "6-10 dishes", price: 100, icon: "🍽️", popular: true },
      { id: "11-20", label: "11-20 dishes", price: 200, icon: "🍱", popular: true },
      { id: "20+", label: "20+ dishes", price: 300, icon: "🍷" },
    ];
  };

  const getLocationPricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices.map((location: any) => ({
        ...location,
        icon: location.icon || "🏢"
      }));
    }
    return [
      { id: "studio", label: "In-studio", price: 0, icon: "🏢" },
      { id: "on-location", label: "On-location (restaurant/kitchen)", price: 75, icon: "🏪" },
      { id: "outdoor", label: "Outdoor / Natural Light", price: 50, icon: "🌅" },
    ];
  };

  const getImageStylePricing = () => {
    if (customConfig?.wardrobePrices) {
      return customConfig.wardrobePrices.map((style: any) => ({
        ...style,
        icon: style.icon || "📐",
        popular: style.id === "lifestyle"
      }));
    }
    return [
      { id: "overhead", label: "Overhead", price: 0, icon: "📐" },
      { id: "lifestyle", label: "Lifestyle / Table Setting", price: 80, icon: "🕯️", popular: true },
      { id: "studio", label: "Studio Lighting", price: 0, icon: "💡" },
      { id: "process", label: "Process Shots (cooking, chopping)", price: 60, icon: "🔪" },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((addon: any) => ({
        ...addon,
        popular: addon.id === "stylist" || addon.id === "props"
      }));
    }
    return [
      { id: "stylist", label: "Food Stylist Required", price: 150, popular: true },
      { id: "props", label: "Props Included", price: 100, popular: true },
      { id: "fast", label: "Fast Turnaround (48 hrs)", price: 80 },
      { id: "raw", label: "Raw Files Provided", price: 50 },
      { id: "commercial", label: "Commercial License", price: 200 },
    ];
  };

  const getDeliveryFormatPricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices.map((format: any) => ({
        ...format,
        icon: format.icon || "📄"
      }));
    }
    return [
      { id: "jpeg", label: "Edited JPEGs", price: 0, icon: "📄" },
      { id: "social", label: "Social Media Format", price: 40, icon: "📱" },
      { id: "tiff", label: "High-Res TIFF", price: 60, icon: "🖼️" },
      { id: "web", label: "Web-Optimized Versions", price: 30, icon: "🌐" },
    ];
  };

  const clientTypes = getClientTypePricing();
  const dishCounts = getDishCountPricing();
  const locations = getLocationPricing();
  const imageStyles = getImageStylePricing();
  const addOnOptions = getAddOnPricing();
  const deliveryFormats = getDeliveryFormatPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const baseStudio = customConfig?.basePrice || 180;
    
    let dishAdd = 0;
    let locationAdd = 0;
    let styleAdd = 0;
    let addOnsTotal = 0;
    let deliveryAdd = 0;
    const breakdown: string[] = [`Base package (in-studio, 1-5 dishes, JPEGs): ${currencySymbol}${baseStudio}`];

    // Dish count pricing
    const dishes = dishCounts.find(d => d.id === formData.dishCount);
    if (dishes && dishes.price > 0) {
      dishAdd = dishes.price;
      breakdown.push(`${dishes.label}: €${dishAdd}`);
    }

    // Location pricing
    const location = locations.find(l => l.id === formData.location);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: €${locationAdd}`);
    }

    // Style pricing
    const style = imageStyles.find(s => s.id === formData.imageStyle);
    if (style && style.price > 0) {
      styleAdd = style.price;
      breakdown.push(`${style.label}: €${styleAdd}`);
    }

    // Add-ons pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    // Delivery format pricing
    formData.deliveryFormat.forEach(formatId => {
      const format = deliveryFormats.find(f => f.id === formatId);
      if (format && format.price > 0) {
        deliveryAdd += format.price;
        breakdown.push(`${format.label}: €${format.price}`);
      }
    });

    const subtotal = baseStudio + dishAdd + locationAdd + styleAdd + addOnsTotal + deliveryAdd;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "food10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseStudio,
      dishAdd,
      locationAdd,
      styleAdd,
      addOnsTotal,
      deliveryAdd,
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

    // Parse client type
    if (input.includes("restaurant") || input.includes("cafe")) newFormData.clientType = "restaurant";
    else if (input.includes("chef") || input.includes("personal")) newFormData.clientType = "chef";
    else if (input.includes("brand") || input.includes("product")) newFormData.clientType = "product";
    else if (input.includes("magazine") || input.includes("editorial")) newFormData.clientType = "editorial";
    else if (input.includes("social") || input.includes("campaign")) newFormData.clientType = "social";
    else newFormData.clientType = "restaurant";

    // Parse dish count
    const dishMatch = input.match(/(\d+)\s*dish/);
    if (dishMatch) {
      const count = parseInt(dishMatch[1]);
      if (count <= 5) newFormData.dishCount = "1-5";
      else if (count <= 10) newFormData.dishCount = "6-10";
      else if (count <= 20) newFormData.dishCount = "11-20";
      else newFormData.dishCount = "20+";
    } else {
      newFormData.dishCount = "6-10";
    }

    // Parse location
    if (input.includes("outdoor") || input.includes("natural")) {
      newFormData.location = "outdoor";
    } else if (input.includes("restaurant") || input.includes("kitchen") || input.includes("location")) {
      newFormData.location = "on-location";
    } else {
      newFormData.location = "studio";
    }

    // Parse style
    if (input.includes("lifestyle") || input.includes("table")) {
      newFormData.imageStyle = "lifestyle";
    } else if (input.includes("process") || input.includes("cooking")) {
      newFormData.imageStyle = "process";
    } else if (input.includes("overhead")) {
      newFormData.imageStyle = "overhead";
    } else {
      newFormData.imageStyle = "studio";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("stylist")) newAddOns.push("stylist");
    if (input.includes("props")) newAddOns.push("props");
    if (input.includes("fast") || input.includes("rush") || input.includes("48")) newAddOns.push("fast");
    if (input.includes("raw")) newAddOns.push("raw");
    if (input.includes("commercial")) newAddOns.push("commercial");
    newFormData.addOns = newAddOns;

    // Parse delivery format
    const newFormats: string[] = ["jpeg"]; // Default
    if (input.includes("social")) newFormats.push("social");
    if (input.includes("tiff") || input.includes("high-res")) newFormats.push("tiff");
    if (input.includes("web")) newFormats.push("web");
    newFormData.deliveryFormat = newFormats;

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
          ? "border-amber-600 bg-amber-50 shadow-md" 
          : "border-stone-200 hover:border-amber-400 bg-cream-50"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-stone-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-amber-700 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Client & Dishes", completed: !!formData.clientType && !!formData.dishCount },
    { number: 2, title: "Location & Style", completed: !!formData.location && !!formData.imageStyle },
    { number: 3, title: "Add-ons & Delivery", completed: formData.deliveryFormat.length > 0 },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-stone-800 mb-2">
            Food Photography Calculator
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto font-body">
            Create stunning food photography that makes mouths water. Get your custom quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-cream-25/90 backdrop-blur-sm border-stone-200">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-amber-600 text-white"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-stone-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Client & Dishes */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-stone-800 mb-4 flex items-center">
                      <ChefHat className="h-6 w-6 mr-2 text-amber-600" />
                      Tell us about your food photography needs
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <label className="block text-sm font-body text-stone-700 mb-2">
                        Describe your project (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need 15 dishes shot with props and fast delivery"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-amber-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Client Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {clientTypes.map((client) => (
                            <OptionCard
                              key={client.id}
                              option={client}
                              selected={formData.clientType === client.id}
                              onClick={() => setFormData(prev => ({ ...prev, clientType: client.id }))}
                              icon={client.icon}
                              popular={client.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Number of Dishes / Shots</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {dishCounts.map((count) => (
                            <OptionCard
                              key={count.id}
                              option={count}
                              selected={formData.dishCount === count.id}
                              onClick={() => setFormData(prev => ({ ...prev, dishCount: count.id }))}
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
                      disabled={!formData.clientType || !formData.dishCount}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Style */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-stone-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-amber-600" />
                      Location & photography style
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Shooting Location</h3>
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
                        <h3 className="text-lg font-display text-stone-700 mb-3">Image Style</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {imageStyles.map((style) => (
                            <OptionCard
                              key={style.id}
                              option={style}
                              selected={formData.imageStyle === style.id}
                              onClick={() => setFormData(prev => ({ ...prev, imageStyle: style.id }))}
                              icon={style.icon}
                              popular={style.popular}
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
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.location || !formData.imageStyle}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-stone-800 mb-4 flex items-center">
                      <Image className="h-6 w-6 mr-2 text-amber-600" />
                      Add-ons & delivery options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Add-ons (Optional)</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-amber-600 bg-amber-50 shadow-md"
                                  : "border-stone-200 hover:border-amber-400 bg-cream-50"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-stone-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-amber-700 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {formData.addOns.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-green-700">
                              🍴 Most food brands book 10 dishes with props & social media edits
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Delivery Format</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {deliveryFormats.map((format) => (
                            <div
                              key={format.id}
                              onClick={() => {
                                const newFormats = formData.deliveryFormat.includes(format.id)
                                  ? formData.deliveryFormat.filter(id => id !== format.id)
                                  : [...formData.deliveryFormat, format.id];
                                setFormData(prev => ({ ...prev, deliveryFormat: newFormats }));
                              }}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.deliveryFormat.includes(format.id)
                                  ? "border-amber-600 bg-amber-50 shadow-md"
                                  : "border-stone-200 hover:border-amber-400 bg-cream-50"
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2"><EditableText value={format.icon} onSave={() => {}} /></div>
                                <div className="font-semibold text-stone-800"><EditableText value={format.label} onSave={() => {}} /></div>
                                {format.price > 0 && (
                                  <div className="text-sm text-amber-700 mt-1">+€{format.price} onSave={() => {}} /></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-stone-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., FOOD10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-stone-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={formData.deliveryFormat.length === 0}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-stone-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-amber-600" />
                      Get your detailed quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-stone-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-stone-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-stone-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50"
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
            <Card className="p-6 bg-cream-25/95 backdrop-blur-sm border-stone-200 sticky top-8">
              <h3 className="text-xl font-display text-stone-800 mb-4">Your Food Shoot Estimate</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-amber-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600">
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
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-stone-800">Ready to Book Your Shoot?</h3>
                    <p className="text-sm text-stone-600">
                      This quote is valid for 72 hours. Let's create mouthwatering food photography together.
                    </p>
                    
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Food Photography Booking";
                        const body = `I'm ready to book my food photography session! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@foodshots.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🍽️ Book My Food Shoot
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Professional Styling
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                        Same-Day Editing
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
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