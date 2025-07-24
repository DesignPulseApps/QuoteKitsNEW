import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Heart, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  Leaf
} from "lucide-react";

interface MassageFormData {
  massageType: string;
  sessionLength: string;
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
  typeAdd: number;
  locationAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface MassageTherapyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function MassageTherapyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: MassageTherapyCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<MassageFormData>({
    massageType: "",
    sessionLength: "",
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

  const massageTypes = [
    { id: "swedish", label: "Swedish", surcharge: 0, icon: "🌿", popular: true },
    { id: "deep-tissue", label: "Deep Tissue", surcharge: 20, icon: "💪", popular: true },
    { id: "sports", label: "Sports", surcharge: 25, icon: "⚽", popular: false },
    { id: "prenatal", label: "Prenatal", surcharge: 15, icon: "🤱", popular: false },
    { id: "hot-stone", label: "Hot Stone", surcharge: 20, icon: "🔥", popular: true },
  ];

  const sessionLengths = [
    { id: "30", label: "30 minutes", basePrice: 40, icon: "⏰" },
    { id: "60", label: "60 minutes", basePrice: 65, icon: "⏱️", popular: true },
    { id: "90", label: "90 minutes", basePrice: 90, icon: "🕐", popular: true },
    { id: "120", label: "120 minutes", basePrice: 115, icon: "🕑" },
  ];

  const addOnOptions = [
    { id: "aromatherapy", label: "Aromatherapy", price: 15, popular: true },
    { id: "hot-stones", label: "Hot Stones", price: 20, popular: true },
    { id: "cupping", label: "Cupping", price: 25, popular: false },
    { id: "cbd-oil", label: "CBD Oil Treatment", price: 20, popular: false },
    { id: "head-scalp", label: "Head/Scalp Focus", price: 10, popular: true },
  ];

  const locations = [
    { id: "studio", label: "In Studio", surcharge: 0, icon: "🏠", popular: true },
    { id: "mobile", label: "Mobile / At-Home", surcharge: 30, icon: "🚗", popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const sessionLength = sessionLengths.find(s => s.id === formData.sessionLength);
    const massageType = massageTypes.find(m => m.id === formData.massageType);
    const location = locations.find(l => l.id === formData.location);

    const basePrice = sessionLength?.basePrice || customConfig?.basePrice || 0;
    const typeAdd = massageType?.surcharge || 0;
    const locationAdd = location?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base session
    breakdown.push(`${sessionLength?.label || 'Base session'}: ${currencySymbol}${basePrice}`);

    // Massage type surcharge
    if (typeAdd > 0) {
      breakdown.push(`${massageType?.label} specialty: ${currencySymbol}${typeAdd}`);
    }

    // Location surcharge
    if (locationAdd > 0) {
      breakdown.push(`${location?.label} service: ${currencySymbol}${locationAdd}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    let subtotal = basePrice + typeAdd + locationAdd + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "relax10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      typeAdd,
      locationAdd,
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

    // Parse session length
    if (input.includes("120") || input.includes("2 hour")) newFormData.sessionLength = "120";
    else if (input.includes("90") || input.includes("hour and half")) newFormData.sessionLength = "90";
    else if (input.includes("60") || input.includes("hour")) newFormData.sessionLength = "60";
    else newFormData.sessionLength = "30";

    // Parse massage type
    if (input.includes("deep tissue") || input.includes("deep")) newFormData.massageType = "deep-tissue";
    else if (input.includes("sports")) newFormData.massageType = "sports";
    else if (input.includes("prenatal") || input.includes("pregnancy")) newFormData.massageType = "prenatal";
    else if (input.includes("hot stone") || input.includes("stone")) newFormData.massageType = "hot-stone";
    else newFormData.massageType = "swedish";

    // Parse location
    if (input.includes("home") || input.includes("mobile") || input.includes("at home")) newFormData.location = "mobile";
    else newFormData.location = "studio";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("aromatherapy") || input.includes("essential oil")) newAddOns.push("aromatherapy");
    if (input.includes("hot stone") || input.includes("stones")) newAddOns.push("hot-stones");
    if (input.includes("cupping")) newAddOns.push("cupping");
    if (input.includes("cbd") || input.includes("oil treatment")) newAddOns.push("cbd-oil");
    if (input.includes("head") || input.includes("scalp")) newAddOns.push("head-scalp");
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
          ? "border-green-500 bg-green-50 shadow-lg" 
          : "border-green-200 hover:border-green-300 bg-white"
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
        {option.basePrice !== undefined && (
          <div className="text-sm text-green-600 mt-1">€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className="text-sm text-green-600 mt-1">+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-green-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Massage & Duration", completed: !!formData.massageType && !!formData.sessionLength },
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
          <h1 className="text-4xl font-display text-green-800 mb-2">
            Massage Therapy Quote Calculator
          </h1>
          <p className="text-green-700 max-w-2xl mx-auto font-body">
            Professional therapeutic massage services for wellness and relaxation. Get your personalized quote instantly.
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
                          ? "bg-green-600 text-white"
                          : currentStep === step.number
                          ? "bg-green-700 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-green-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Massage & Duration */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Leaf className="h-6 w-6 mr-2 text-green-600" />
                      Choose your wellness session
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <label className="block text-sm font-body text-green-700 mb-2">
                        Describe your massage needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I want 90-minute deep tissue with hot stones at home"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-green-200 mb-3 resize-none"
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
                        <h3 className="text-lg font-display text-green-700 mb-3">Massage Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {massageTypes.map((massage) => (
                            <OptionCard
                              key={massage.id}
                              option={massage}
                              selected={formData.massageType === massage.id}
                              onClick={() => setFormData(prev => ({ ...prev, massageType: massage.id }))}
                              icon={massage.icon}
                              popular={massage.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Session Length</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {sessionLengths.map((length) => (
                            <OptionCard
                              key={length.id}
                              option={length}
                              selected={formData.sessionLength === length.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionLength: length.id }))}
                              icon={length.icon}
                              popular={length.popular}
                            />
                          ))}
                        </div>

                        {formData.massageType === "swedish" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                              🌿 Most popular: 60min Swedish + Aromatherapy
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.massageType || !formData.sessionLength}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-green-600" />
                      Session location and enhancements
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Session Location</h3>
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
                        <h3 className="text-lg font-display text-green-700 mb-3">Enhancements (Optional)</h3>
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
                                  ? "border-green-500 bg-green-50 shadow-lg"
                                  : "border-green-200 hover:border-green-300 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-green-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-green-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                              {addOn.id === "cbd-oil" && (
                                <div className="text-xs text-green-600 mt-1">
                                  💡 What is CBD oil treatment? → Natural pain relief and relaxation enhancement
                                </div>
                              )}
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
                      className="px-8 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.location}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-green-600" />
                      Special offers and preferences
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., RELAX10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-green-300"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-green-700 mb-3">Preferred Date & Time (Optional)</h3>
                        <div className="flex space-x-4">
                          <Input
                            type="date"
                            className="border-green-300"
                          />
                          <Input
                            type="time"
                            className="border-green-300"
                          />
                        </div>
                      </div>

                      {formData.massageType === "prenatal" && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">🤱 Prenatal Massage Special Care:</h4>
                          <div className="text-sm text-green-700">
                            Our certified prenatal massage therapists ensure safe, comfortable positioning throughout your session.
                          </div>
                        </div>
                      )}

                      {formData.location === "mobile" && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">🚗 Mobile Service Information:</h4>
                          <div className="text-sm text-green-700">
                            We bring our professional massage table and all supplies to your location. Please ensure a quiet, private space is available.
                          </div>
                        </div>
                      )}
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
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-green-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-green-600" />
                      Get your wellness quote
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
                      className="bg-green-600 hover:bg-green-700 text-white px-8 font-semibold"
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
              <h3 className="text-xl font-display text-green-800 mb-4">Your Wellness Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-green-700">
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
                    <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-green-800">Ready to Relax?</h3>
                    <p className="text-sm text-green-600">
                      This quote is valid for 48 hours. Professional therapeutic massage for your wellness journey.
                    </p>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Massage Therapy Appointment";
                        const body = `I'd love to book a massage therapy session! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@tranquilhands.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🌿 Book Now
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-green-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Licensed Therapist
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-700 rounded-full mr-1"></div>
                        Clean & Safe
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
                        Valid for 48 hours
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