import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Scissors, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star
} from "lucide-react";

interface HairStylistFormData {
  serviceType: string;
  hairLength: string;
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
  lengthSurcharge: number;
  locationSurcharge: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface HairStylistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function HairStylistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: HairStylistCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<HairStylistFormData>({
    serviceType: "",
    hairLength: "",
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

  const serviceTypes = [
    { id: "blow-dry", label: "Blow-Dry", basePrice: 40, icon: "💨", popular: true },
    { id: "haircut-style", label: "Haircut & Style", basePrice: 60, icon: "✂️", popular: true },
    { id: "bridal-updo", label: "Bridal / Event Updo", basePrice: 150, icon: "👰", popular: true },
    { id: "coloring", label: "Coloring / Highlights", basePrice: 120, icon: "🎨" },
    { id: "keratin", label: "Keratin / Straightening", basePrice: 200, icon: "✨" },
  ];

  const hairLengths = [
    { id: "short", label: "Short", surcharge: 0, icon: "💇", popular: true },
    { id: "medium", label: "Medium", surcharge: 15, icon: "💁", popular: true },
    { id: "long", label: "Long", surcharge: 25, icon: "👩" },
    { id: "extra-long", label: "Extra Long", surcharge: 40, icon: "🦄" },
  ];

  const addOnOptions = [
    { id: "olaplex", label: "Olaplex / Bond Repair", price: 25, popular: true },
    { id: "extensions", label: "Hair Extensions (Clip-in or Style-in)", price: 40, popular: true },
    { id: "trial", label: "Trial Session (for bridal)", price: 50 },
    { id: "extra-time", label: "Extra Styling Time", price: 30 },
    { id: "travel", label: "Travel to Venue", price: 75, popular: true },
  ];

  const locations = [
    { id: "salon", label: "In Salon", surcharge: 0, icon: "🏠", popular: true },
    { id: "mobile", label: "Mobile / Client's Location", surcharge: 50, icon: "🚗" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const service = serviceTypes.find(s => s.id === formData.serviceType);
    const length = hairLengths.find(l => l.id === formData.hairLength);
    const location = locations.find(l => l.id === formData.location);

    const basePrice = service?.basePrice || customConfig?.basePrice || 0;
    const lengthSurcharge = length?.surcharge || 0;
    const locationSurcharge = location?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base service
    breakdown.push(`${service?.label || 'Base service'}: ${currencySymbol}${basePrice}`);

    // Hair length surcharge
    if (lengthSurcharge > 0) {
      breakdown.push(`${length?.label} hair surcharge: ${currencySymbol}${lengthSurcharge}`);
    }

    // Location surcharge
    if (locationSurcharge > 0) {
      breakdown.push(`${location?.label}: ${currencySymbol}${locationSurcharge}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    let subtotal = basePrice + lengthSurcharge + locationSurcharge + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "hair10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      lengthSurcharge,
      locationSurcharge,
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
    if (input.includes("bridal") || input.includes("updo") || input.includes("event")) newFormData.serviceType = "bridal-updo";
    else if (input.includes("haircut") || input.includes("cut")) newFormData.serviceType = "haircut-style";
    else if (input.includes("color") || input.includes("highlight")) newFormData.serviceType = "coloring";
    else if (input.includes("keratin") || input.includes("straighten")) newFormData.serviceType = "keratin";
    else newFormData.serviceType = "blow-dry";

    // Parse hair length
    if (input.includes("extra long") || input.includes("very long")) newFormData.hairLength = "extra-long";
    else if (input.includes("long")) newFormData.hairLength = "long";
    else if (input.includes("medium")) newFormData.hairLength = "medium";
    else newFormData.hairLength = "short";

    // Parse location
    if (input.includes("my place") || input.includes("home") || input.includes("venue") || input.includes("mobile")) newFormData.location = "mobile";
    else newFormData.location = "salon";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("olaplex") || input.includes("bond repair")) newAddOns.push("olaplex");
    if (input.includes("extension") || input.includes("clip-in")) newAddOns.push("extensions");
    if (input.includes("trial")) newAddOns.push("trial");
    if (input.includes("extra time") || input.includes("more time")) newAddOns.push("extra-time");
    if (input.includes("travel") || input.includes("venue") || input.includes("mobile")) newAddOns.push("travel");
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
          ? "border-pink-400 bg-pink-50 shadow-lg" 
          : "border-pink-200 hover:border-pink-300 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-pink-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className="text-sm text-pink-600 mt-1">€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className="text-sm text-pink-600 mt-1">+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-pink-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Service & Hair", completed: !!formData.serviceType && !!formData.hairLength },
    { number: 2, title: "Location & Add-ons", completed: !!formData.location },
    { number: 3, title: "Promo & Details", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-pink-800 mb-2">
            Hair Stylist Quote Calculator
          </h1>
          <p className="text-pink-700 max-w-2xl mx-auto font-body">
            Professional hair styling services for every occasion. Get your personalized quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-pink-200 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-pink-500 text-white"
                          : currentStep === step.number
                          ? "bg-pink-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-pink-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-pink-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Service & Hair */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-pink-800 mb-4 flex items-center">
                      <Scissors className="h-6 w-6 mr-2 text-pink-600" />
                      What hair service would you like?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-pink-50 rounded-xl border border-pink-200">
                      <label className="block text-sm font-body text-pink-700 mb-2">
                        Describe your hair styling needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need a bridal updo with extensions at my place"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-pink-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-pink-600 hover:bg-pink-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-pink-700 mb-3">Service Type</h3>
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
                        <h3 className="text-lg font-display text-pink-700 mb-3">Hair Length</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {hairLengths.map((length) => (
                            <OptionCard
                              key={length.id}
                              option={length}
                              selected={formData.hairLength === length.id}
                              onClick={() => setFormData(prev => ({ ...prev, hairLength: length.id }))}
                              icon={length.icon}
                              popular={length.popular}
                            />
                          ))}
                        </div>

                        {formData.serviceType === "blow-dry" && (
                          <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-200">
                            <div className="text-sm text-pink-700">
                              💨 Most booked: Blow-Dry + Olaplex
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.serviceType || !formData.hairLength}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-pink-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-pink-600" />
                      Appointment location and extras
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-pink-700 mb-3">Appointment Location</h3>
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

                      <div>
                        <h3 className="text-lg font-display text-pink-700 mb-3">Add-ons (Optional)</h3>
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
                                  ? "border-pink-400 bg-pink-50 shadow-lg"
                                  : "border-pink-200 hover:border-pink-300 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-pink-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-pink-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.location}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Promo & Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-pink-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-pink-600" />
                      Special offers and details
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-pink-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., HAIR10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-pink-300"
                        />
                      </div>

                      {formData.serviceType === "bridal-updo" && (
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                          <h4 className="font-semibold text-pink-800 mb-2">💡 Suggested for Bridal Services:</h4>
                          <div className="text-sm text-pink-700">
                            Consider adding a trial session to perfect your look before the big day!
                          </div>
                        </div>
                      )}

                      {formData.hairLength === "extra-long" && (
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                          <h4 className="font-semibold text-pink-800 mb-2">✨ Recommended for Extra Long Hair:</h4>
                          <div className="text-sm text-pink-700">
                            Extra styling time and Olaplex treatment are often beneficial for longer hair.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-pink-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-pink-600" />
                      Get your hair styling quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-pink-700 mb-2">
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
                            className="pl-10 border-pink-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-pink-700 mb-2">
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
                            className="pl-10 border-pink-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-pink-700 mb-2">
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
                            className="pl-10 border-pink-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-pink-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-pink-800 mb-4">Your Hair Styling Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-pink-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-pink-700">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-pink-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-pink-200 pt-2 flex justify-between font-bold text-pink-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-pink-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-pink-800">Ready for Gorgeous Hair?</h3>
                    <p className="text-sm text-pink-600">
                      This quote is valid for 72 hours. Professional styling that makes you feel amazing.
                    </p>
                    
                    <Button 
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Hair Styling Appointment";
                        const body = `I'd love to book a hair styling appointment! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@glamhairsalon.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      ✂️ Book Now
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-pink-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-1"></div>
                        Professional Stylist
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mr-1"></div>
                        Premium Products
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-pink-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-pink-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
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