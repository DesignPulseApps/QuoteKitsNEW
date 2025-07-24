import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Palette, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Plus,
  Minus
} from "lucide-react";

interface MakeupFormData {
  occasionType: string;
  peopleCount: number;
  makeupStyle: string;
  addOns: string[];
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
  styleSurcharge: number;
  locationSurcharge: number;
  addOnsTotal: number;
  additionalPeoplePrice: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface MakeupArtistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function MakeupArtistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: MakeupArtistCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<MakeupFormData>({
    occasionType: "",
    peopleCount: 1,
    makeupStyle: "",
    addOns: [],
    location: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const occasionTypes = [
    { id: "bridal", label: "Bridal", basePrice: 150, icon: "💍", popular: true },
    { id: "bridesmaid", label: "Bridesmaid", basePrice: 120, icon: "👰", popular: true },
    { id: "event-glam", label: "Event Glam", basePrice: 100, icon: "✨", popular: true },
    { id: "photoshoot", label: "Photoshoot / Editorial", basePrice: 130, icon: "📸" },
    { id: "prom", label: "Prom / Graduation", basePrice: 90, icon: "🎓" },
  ];

  const makeupStyles = [
    { id: "natural", label: "Natural / Soft Glam", surcharge: 0, icon: "🌸", popular: true },
    { id: "full-glam", label: "Full Glam", surcharge: 25, icon: "💄", popular: true },
    { id: "editorial", label: "Editorial / High Fashion", surcharge: 40, icon: "🎨" },
    { id: "hd-ready", label: "HD / Camera-Ready", surcharge: 30, icon: "📷" },
  ];

  const addOnOptions = [
    { id: "lashes", label: "Lashes", price: 15, popular: true },
    { id: "hair-styling", label: "Hair Styling", price: 40, popular: true },
    { id: "skincare-prep", label: "Skincare Prep", price: 20 },
    { id: "touch-up-kit", label: "Touch-Up Kit", price: 25 },
    { id: "travel", label: "Travel to Venue", price: 75, popular: true },
  ];

  const locations = [
    { id: "studio", label: "At Studio", surcharge: 0, icon: "🏠", popular: true },
    { id: "on-site", label: "On-Site / Client Venue", surcharge: 50, icon: "🚗" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const occasion = occasionTypes.find(o => o.id === formData.occasionType);
    const style = makeupStyles.find(s => s.id === formData.makeupStyle);
    const location = locations.find(l => l.id === formData.location);

    const basePrice = occasion?.basePrice || customConfig?.basePrice || 100;
    const styleSurcharge = style?.surcharge || 0;
    const locationSurcharge = location?.surcharge || 0;
    const additionalPeoplePrice = (formData.peopleCount - 1) * 80;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base pricing for first person
    breakdown.push(`${occasion?.label || 'Base service'} (1 person): ${currencySymbol}${basePrice}`);

    // Additional people
    if (formData.peopleCount > 1) {
      breakdown.push(`Additional people (${formData.peopleCount - 1}): ${currencySymbol}${additionalPeoplePrice}`);
    }

    // Style surcharge
    if (styleSurcharge > 0) {
      const totalStyleSurcharge = (styleSurcharge * formData.peopleCount);
      breakdown.push(`${style?.label} (${formData.peopleCount} people): ${currencySymbol}${totalStyleSurcharge}`);
    }

    // Location surcharge
    if (locationSurcharge > 0) {
      breakdown.push(`${location?.label}: ${currencySymbol}${locationSurcharge}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        let addOnPrice = addOn.price;
        // Travel fee is flat, others are per person
        if (addOn.id !== "travel") {
          addOnPrice *= formData.peopleCount;
          addOnsTotal += addOnPrice;
          breakdown.push(`${addOn.label} (${formData.peopleCount} people): ${currencySymbol}${addOnPrice}`);
        } else {
          addOnsTotal += addOnPrice;
          breakdown.push(`${addOn.label}: ${currencySymbol}${addOnPrice}`);
        }
      }
    });

    let subtotal = basePrice + additionalPeoplePrice + (styleSurcharge * formData.peopleCount) + locationSurcharge + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "glam10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      styleSurcharge: styleSurcharge * formData.peopleCount,
      locationSurcharge,
      addOnsTotal,
      additionalPeoplePrice,
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

    // Parse occasion type
    if (input.includes("bridal") || input.includes("bride")) newFormData.occasionType = "bridal";
    else if (input.includes("bridesmaid")) newFormData.occasionType = "bridesmaid";
    else if (input.includes("photoshoot") || input.includes("editorial")) newFormData.occasionType = "photoshoot";
    else if (input.includes("prom") || input.includes("graduation")) newFormData.occasionType = "prom";
    else newFormData.occasionType = "event-glam";

    // Parse people count
    const numbers = input.match(/(\d+)\s*people?/);
    if (numbers) {
      newFormData.peopleCount = Math.max(1, Math.min(10, parseInt(numbers[1])));
    }

    // Parse makeup style
    if (input.includes("full glam") || input.includes("full glamour")) newFormData.makeupStyle = "full-glam";
    else if (input.includes("editorial") || input.includes("high fashion")) newFormData.makeupStyle = "editorial";
    else if (input.includes("hd") || input.includes("camera ready")) newFormData.makeupStyle = "hd-ready";
    else newFormData.makeupStyle = "natural";

    // Parse location
    if (input.includes("venue") || input.includes("on-site") || input.includes("location")) newFormData.location = "on-site";
    else newFormData.location = "studio";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("lashes") || input.includes("eyelashes")) newAddOns.push("lashes");
    if (input.includes("hair") || input.includes("styling")) newAddOns.push("hair-styling");
    if (input.includes("skincare") || input.includes("prep")) newAddOns.push("skincare-prep");
    if (input.includes("touch up") || input.includes("touch-up")) newAddOns.push("touch-up-kit");
    if (input.includes("travel") || input.includes("venue")) newAddOns.push("travel");
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
          ? "border-rose-400 bg-rose-50 shadow-lg" 
          : "border-rose-200 hover:border-rose-300 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-rose-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className="text-sm text-rose-600 mt-1">€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className="text-sm text-rose-600 mt-1">+€{option.surcharge}/person</div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-rose-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Occasion & People", completed: !!formData.occasionType && formData.peopleCount > 0 },
    { number: 2, title: "Style & Location", completed: !!formData.makeupStyle && !!formData.location },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-rose-800 mb-2">
            Makeup Artist Pricing Calculator
          </h1>
          <p className="text-rose-700 max-w-2xl mx-auto font-body">
            Professional makeup artistry for your special occasions. Get your personalized quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-rose-200 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-rose-500 text-white"
                          : currentStep === step.number
                          ? "bg-rose-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-rose-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-rose-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Occasion & People */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-rose-800 mb-4 flex items-center">
                      <Palette className="h-6 w-6 mr-2 text-rose-600" />
                      Tell us about your makeup needs
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                      <label className="block text-sm font-body text-rose-700 mb-2">
                        Describe your makeup requirements (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need bridal makeup with hair and lashes for 3 people"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-rose-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-rose-600 hover:bg-rose-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Occasion Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {occasionTypes.map((occasion) => (
                            <OptionCard
                              key={occasion.id}
                              option={occasion}
                              selected={formData.occasionType === occasion.id}
                              onClick={() => setFormData(prev => ({ ...prev, occasionType: occasion.id }))}
                              icon={occasion.icon}
                              popular={occasion.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Number of People</h3>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, prev.peopleCount - 1) }))}
                            disabled={formData.peopleCount <= 1}
                            className="border-rose-300 text-rose-600"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="text-2xl font-bold text-rose-800 min-w-[3rem] text-center">
                            {formData.peopleCount}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, peopleCount: Math.min(10, prev.peopleCount + 1) }))}
                            disabled={formData.peopleCount >= 10}
                            className="border-rose-300 text-rose-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-rose-600">people (max 10)</span>
                        </div>

                        {formData.occasionType === "bridal" && (
                          <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                            <div className="text-sm text-rose-700">
                              💍 Most selected: Full Glam + Hair + Lashes
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.occasionType || formData.peopleCount === 0}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Style & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-rose-800 mb-4 flex items-center">
                      <Sparkles className="h-6 w-6 mr-2 text-rose-600" />
                      Makeup style and appointment location
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Makeup Style</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {makeupStyles.map((style) => (
                            <OptionCard
                              key={style.id}
                              option={style}
                              selected={formData.makeupStyle === style.id}
                              onClick={() => setFormData(prev => ({ ...prev, makeupStyle: style.id }))}
                              icon={style.icon}
                              popular={style.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Appointment Location</h3>
                        <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.makeupStyle || !formData.location}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-rose-800 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-rose-600" />
                      Enhance your beauty experience
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Add-ons (Optional)</h3>
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
                                  ? "border-rose-400 bg-rose-50 shadow-lg"
                                  : "border-rose-200 hover:border-rose-300 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-rose-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-rose-600 font-semibold">
                                  +€{addOn.id === "travel" ? addOn.price : addOn.price * formData.peopleCount}
                                  {addOn.id !== "travel" && formData.peopleCount > 1 && (
                                    <span className="text-xs text-rose-500 ml-1">({formData.peopleCount} people)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-rose-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., GLAM10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-rose-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-rose-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-rose-600" />
                      Get your makeup artistry quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-rose-700 mb-2">
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
                            className="pl-10 border-rose-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-700 mb-2">
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
                            className="pl-10 border-rose-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-700 mb-2">
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
                            className="pl-10 border-rose-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-rose-800 mb-4">Your Makeup Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-rose-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {formData.peopleCount > 0 && (
                  <div className="text-lg text-rose-600 font-semibold">
                    For {formData.peopleCount} person{formData.peopleCount !== 1 ? 's' : ''}
                  </div>
                )}
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-rose-700">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-rose-200 pt-2 flex justify-between font-bold text-rose-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-rose-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-rose-800">Ready to Look Stunning?</h3>
                    <p className="text-sm text-rose-600">
                      This quote is valid for 48 hours. Professional makeup artistry that makes you glow.
                    </p>
                    
                    <Button 
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Makeup Artist Booking";
                        const body = `I'd love to book your makeup services! My quote is €${pricing.total.toLocaleString()} for ${formData.peopleCount} person${formData.peopleCount !== 1 ? 's' : ''}.`;
                        const mailtoUrl = `mailto:info@glamartist.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      💄 Book Me
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-rose-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div>
                        Professional MUA
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-600 rounded-full mr-1"></div>
                        Premium Products
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-rose-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-rose-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
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