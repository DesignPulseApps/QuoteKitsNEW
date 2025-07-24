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
  Home, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Building
} from "lucide-react";

interface RealEstateFormData {
  propertyType: string;
  propertySize: string;
  services: string[];
  timeframe: string;
  location: string;
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
  propertyTypeAdd: number;
  servicesAdd: number;
  timeframeAdd: number;
  locationAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface RealEstatePhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function RealEstatePhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: RealEstatePhotographyCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<RealEstateFormData>({
    propertyType: "",
    propertySize: "",
    services: [],
    timeframe: "",
    location: "",
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
        icon: group.icon || "🏢",
        price: group.price,
        popular: group.id === "house"
      }));
    }
    return [
      { id: "apartment", label: "Apartment", icon: "🏢", price: 0 },
      { id: "house", label: "House", icon: "🏡", price: 50, popular: true },
      { id: "villa", label: "Luxury Villa", icon: "🏰", price: 100 },
      { id: "commercial", label: "Commercial Space", icon: "🏬", price: 100 },
    ];
  };

  const getPropertySizePricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        id: duration.id,
        label: duration.label,
        icon: duration.icon || "📐",
        popular: duration.id === "50-100" || duration.id === "100-200"
      }));
    }
    return [
      { id: "under-50", label: "Under 50m²", icon: "📐" },
      { id: "50-100", label: "50-100m²", icon: "📏", popular: true },
      { id: "100-200", label: "100-200m²", icon: "📊", popular: true },
      { id: "over-200", label: "Over 200m²", icon: "📈" },
    ];
  };

  const getServicePricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((service: any) => ({
        ...service,
        icon: service.icon || "🏠",
        popular: service.id === "aerial" || service.id === "twilight"
      }));
    }
    return [
      { id: "interior", label: "Interior Photos", price: 0, icon: "🏠" },
      { id: "exterior", label: "Exterior Photos", price: 30, icon: "🌅" },
      { id: "aerial", label: "Aerial/Drone Shots", price: 80, icon: "🚁", popular: true },
      { id: "twilight", label: "Twilight Photography", price: 90, icon: "🌆", popular: true },
      { id: "floor-plan", label: "Floor Plan", price: 60, icon: "📋" },
      { id: "virtual-tour", label: "Virtual Tour (360°)", price: 120, icon: "🔄" },
    ];
  };

  const getTimeframePricing = () => {
    if (customConfig?.deliveryPrices) {
      return customConfig.deliveryPrices;
    }
    return [
      { id: "standard", label: "Standard (48-72 hrs)", price: 0, icon: "📅" },
      { id: "rush", label: "Rush (24 hrs)", price: 50, icon: "⚡" },
      { id: "same-day", label: "Same-Day", price: 90, icon: "🚨" },
    ];
  };

  const getLocationPricing = () => {
    if (customConfig?.locationPrices) {
      return customConfig.locationPrices.map((location: any) => ({
        id: location.id,
        label: location.label,
        price: location.price,
        icon: location.icon || "🏙️"
      }));
    }
    return [
      { id: "city", label: "Within City", price: 0, icon: "🏙️" },
      { id: "nearby", label: "Up to 50km", price: 25, icon: "🚗" },
      { id: "distant", label: "50km+", price: 75, icon: "🛣️" },
    ];
  };

  const propertyTypes = getPropertyTypePricing();
  const propertySizes = getPropertySizePricing();
  const serviceOptions = getServicePricing();
  const timeframes = getTimeframePricing();
  const locations = getLocationPricing();

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const baseApartment = customConfig?.basePrice || 150;
    
    let propertyTypeAdd = 0;
    let servicesAdd = 0;
    let timeframeAdd = 0;
    let locationAdd = 0;
    const breakdown: string[] = [`Base package (apartment, 50m², interior): ${currencySymbol}${baseApartment}`];

    // Property type pricing
    const property = propertyTypes.find(p => p.id === formData.propertyType);
    if (property && property.price > 0) {
      propertyTypeAdd = property.price;
      breakdown.push(`${property.label}: ${currencySymbol}${propertyTypeAdd}`);
    }

    // Services pricing - use dynamic pricing from configuration
    formData.services.forEach(serviceId => {
      const service = serviceOptions.find(s => s.id === serviceId);
      if (service && service.price > 0) {
        servicesAdd += service.price;
        breakdown.push(`${service.label}: ${currencySymbol}${service.price}`);
      }
    });

    // Timeframe pricing
    const timeframe = timeframes.find(t => t.id === formData.timeframe);
    if (timeframe && timeframe.price > 0) {
      timeframeAdd = timeframe.price;
      breakdown.push(`${timeframe.label}: ${currencySymbol}${timeframeAdd}`);
    }

    // Location pricing
    const location = locations.find(l => l.id === formData.location);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: ${currencySymbol}${locationAdd}`);
    }

    const subtotal = baseApartment + propertyTypeAdd + servicesAdd + timeframeAdd + locationAdd;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "save10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseApartment,
      propertyTypeAdd,
      servicesAdd,
      timeframeAdd,
      locationAdd,
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

    // Parse property types
    if (input.includes("villa") || input.includes("luxury")) newFormData.propertyType = "villa";
    else if (input.includes("commercial") || input.includes("office") || input.includes("shop")) newFormData.propertyType = "commercial";
    else if (input.includes("house")) newFormData.propertyType = "house";
    else newFormData.propertyType = "apartment";

    // Parse property size
    const sizeMatch = input.match(/(\d+)\s*m²?/);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      if (size < 50) newFormData.propertySize = "under-50";
      else if (size <= 100) newFormData.propertySize = "50-100";
      else if (size <= 200) newFormData.propertySize = "100-200";
      else newFormData.propertySize = "over-200";
    } else {
      newFormData.propertySize = "50-100";
    }

    // Parse services
    const newServices: string[] = [];
    if (!input.includes("exterior") && !input.includes("aerial") && !input.includes("twilight")) {
      newServices.push("interior"); // Default if nothing specific mentioned
    }
    if (input.includes("exterior")) newServices.push("exterior");
    if (input.includes("aerial") || input.includes("drone")) newServices.push("aerial");
    if (input.includes("twilight") || input.includes("dusk")) newServices.push("twilight");
    if (input.includes("floor plan") || input.includes("floorplan")) newServices.push("floor-plan");
    if (input.includes("virtual") || input.includes("360")) newServices.push("virtual-tour");
    if (newServices.length === 0) newServices.push("interior");
    newFormData.services = newServices;

    // Parse timeframe
    if (input.includes("same day") || input.includes("today")) {
      newFormData.timeframe = "same-day";
    } else if (input.includes("rush") || input.includes("24") || input.includes("urgent")) {
      newFormData.timeframe = "rush";
    } else {
      newFormData.timeframe = "standard";
    }

    // Parse location
    if (input.includes("far") || input.includes("distant") || input.includes("50km")) {
      newFormData.location = "distant";
    } else if (input.includes("nearby") || input.includes("outside")) {
      newFormData.location = "nearby";
    } else {
      newFormData.location = "city";
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
          ? "border-blue-600 bg-blue-50 shadow-md" 
          : "border-gray-200 hover:border-blue-400 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-gray-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-blue-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Property Type", completed: !!formData.propertyType && !!formData.propertySize },
    { number: 2, title: "Services Needed", completed: formData.services.length > 0 },
    { number: 3, title: "Timeframe & Location", completed: !!formData.timeframe && !!formData.location },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            Real Estate Photography Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Get an instant quote for your property photography. Professional quality, competitive pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gray-200">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-600 text-white"
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

              {/* Step 1: Property Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Building className="h-6 w-6 mr-2 text-blue-600" />
                      Tell us about your property
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your property photography needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need aerial and twilight shots of a 200m² villa next week"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-blue-200 mb-3 resize-none"
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
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.propertyType || !formData.propertySize}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Services */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-blue-600" />
                      Which services do you need?
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {serviceOptions.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => {
                            const newServices = formData.services.includes(service.id)
                              ? formData.services.filter(id => id !== service.id)
                              : [...formData.services, service.id];
                            setFormData(prev => ({ ...prev, services: newServices }));
                          }}
                          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                            formData.services.includes(service.id)
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-400 bg-white"
                          }`}
                        >
                          {service.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
                              Popular
                            </Badge>
                          )}
                          <div className="text-center">
                            <div className="text-2xl mb-2"><EditableText value={service.icon} onSave={() => {}} /></div>
                            <div className="font-semibold text-gray-800"><EditableText value={service.label} onSave={() => {}} /></div>
                            {service.price > 0 && (
                              <div className="text-sm text-blue-600 mt-1">+€{service.price} onSave={() => {}} /></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.services.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700">
                          📸 Most popular combo: Interior + Aerial + Floor Plan
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={formData.services.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Timeframe & Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-blue-600" />
                      Delivery timeframe & location
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Delivery Timeframe</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {timeframes.map((timeframe) => (
                            <OptionCard
                              key={timeframe.id}
                              option={timeframe}
                              selected={formData.timeframe === timeframe.id}
                              onClick={() => setFormData(prev => ({ ...prev, timeframe: timeframe.id }))}
                              icon={timeframe.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Property Location</h3>
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
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SAVE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.timeframe || !formData.location}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
                      <Mail className="h-6 w-6 mr-2 text-blue-600" />
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
                            className="pl-10 border-gray-300"
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
                            className="pl-10 border-gray-300"
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
                            className="pl-10 border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-gray-200 sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Property Media Package</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">
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
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Book Your Shoot?</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 48 hours. Secure your photography session today.
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Real Estate Photography Booking";
                        const body = `I'm ready to book my property photography session! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@realestatephoto.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      📸 Book Photography Session
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Professional Quality
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Same-Day Editing
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
                        Valid for 48 hours
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