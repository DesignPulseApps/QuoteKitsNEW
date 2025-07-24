import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Baby, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  Heart,
  Camera,
  Home
} from "lucide-react";

interface NewbornFormData {
  sessionType: string;
  babyAge: string;
  peopleIncluded: string;
  addOns: string[];
  deliveryPreference: string;
  preferredDate: string;
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
  sessionTypeAdd: number;
  ageAdd: number;
  peopleAdd: number;
  addOnsTotal: number;
  deliveryAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface NewbornPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function NewbornPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: NewbornPhotographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  
  // Use the propConfig as customConfig for consistency
  const customConfig = propConfig;
  const [textConfig, setTextConfig] = useState<any>({});
  
  const [formData, setFormData] = useState<NewbornFormData>({
    sessionType: "",
    babyAge: "",
    peopleIncluded: "",
    addOns: [],
    deliveryPreference: "",
    preferredDate: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

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

  const sessionTypes = [
    { id: "classic-studio", label: "Classic Studio (posed)", basePrice: 290, icon: "👶", popular: true },
    { id: "lifestyle", label: "Lifestyle (at home)", basePrice: 340, icon: "🏠", popular: true },
    { id: "combo", label: "Combo: Newborn + Family", basePrice: 365, icon: "👨‍👩‍👧‍👦", popular: true },
    { id: "mini", label: "Mini Session", basePrice: 190, icon: "⏱️", popular: false },
  ];

  const babyAges = [
    { id: "5-10-days", label: "5–10 Days", surcharge: 0, icon: "🍼", popular: true },
    { id: "11-21-days", label: "11–21 Days", surcharge: 25, icon: "😴", popular: true },
    { id: "1-month-plus", label: "1 Month+", surcharge: 50, icon: "👶", popular: false },
  ];

  const peopleOptions = [
    { id: "baby-only", label: "Baby Only", surcharge: 0, popular: false },
    { id: "baby-parents", label: "Baby + Parents", surcharge: 50, popular: true },
    { id: "baby-family", label: "Baby + Family (3–6)", surcharge: 100, popular: true },
  ];

  const deliveryOptions = [
    { id: "digital-only", label: "Digital Only", price: 0, popular: false },
    { id: "prints-album", label: "Prints + Album", price: 140, popular: true },
    { id: "usb-album", label: "USB + Album", price: 160, popular: true },
  ];

  const addOnOptions = [
    { id: "makeup", label: "Professional Makeup for Mom", price: 80, popular: true },
    { id: "sibling", label: "Sibling Portraits", price: 50, popular: true },
    { id: "album", label: "Custom Printed Album", price: 140, popular: true },
    { id: "wall-art", label: "Framed Wall Art", price: 120, popular: false },
    { id: "retouching", label: "Extra Retouching", price: 60, popular: false },
    { id: "extended", label: "Extended Session Time", price: 75, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const sessionType = sessionTypes.find(s => s.id === formData.sessionType);
    const babyAge = babyAges.find(a => a.id === formData.babyAge);
    const people = peopleOptions.find(p => p.id === formData.peopleIncluded);
    const delivery = deliveryOptions.find(d => d.id === formData.deliveryPreference);

    const basePrice = sessionType?.basePrice || customConfig?.basePrice || 300;
    const sessionTypeAdd = 0; // Already included in base price
    const ageAdd = babyAge?.surcharge || 0;
    const peopleAdd = people?.surcharge || 0;
    const deliveryAdd = delivery?.price || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base session
    breakdown.push(`${sessionType?.label || 'Base session'}: €${basePrice.toFixed(0)}`);

    // Age surcharge
    if (ageAdd > 0) {
      breakdown.push(`${babyAge?.label} timing: €${ageAdd}`);
    }

    // People included
    if (peopleAdd > 0) {
      breakdown.push(`${people?.label}: €${peopleAdd}`);
    }

    // Delivery option
    if (deliveryAdd > 0) {
      breakdown.push(`${delivery?.label}: €${deliveryAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    // Auto-add makeup for sessions with mom
    if ((formData.peopleIncluded === "baby-parents" || formData.peopleIncluded === "baby-family") && !formData.addOns.includes("makeup")) {
      // This would be a suggestion, not auto-added
    }

    let subtotal = basePrice + ageAdd + peopleAdd + deliveryAdd + addOnsTotal;

    // Weekend surcharge for weekend sessions
    if (formData.preferredDate) {
      const selectedDate = new Date(formData.preferredDate);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        const weekendSurcharge = 75;
        subtotal += weekendSurcharge;
        breakdown.push(`Weekend session: €${weekendSurcharge}`);
      }
    }

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "newborn10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      sessionTypeAdd,
      ageAdd,
      peopleAdd,
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

    // Parse session type
    if (input.includes("lifestyle") || input.includes("at home") || input.includes("home")) newFormData.sessionType = "lifestyle";
    else if (input.includes("combo") || input.includes("family")) newFormData.sessionType = "combo";
    else if (input.includes("mini") || input.includes("short")) newFormData.sessionType = "mini";
    else newFormData.sessionType = "classic-studio";

    // Parse baby age
    if (input.includes("5") || input.includes("6") || input.includes("7") || input.includes("8") || input.includes("9") || input.includes("10")) newFormData.babyAge = "5-10-days";
    else if (input.includes("month") || input.includes("older") || input.includes("weeks")) newFormData.babyAge = "1-month-plus";
    else newFormData.babyAge = "11-21-days";

    // Parse people included
    if (input.includes("baby only") || input.includes("just baby")) newFormData.peopleIncluded = "baby-only";
    else if (input.includes("family") || input.includes("siblings") || input.includes("children")) newFormData.peopleIncluded = "baby-family";
    else newFormData.peopleIncluded = "baby-parents";

    // Parse delivery
    if (input.includes("digital") || input.includes("online")) newFormData.deliveryPreference = "digital-only";
    else if (input.includes("usb") || input.includes("drive")) newFormData.deliveryPreference = "usb-album";
    else newFormData.deliveryPreference = "prints-album";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("makeup") || input.includes("hair")) newAddOns.push("makeup");
    if (input.includes("sibling") || input.includes("brother") || input.includes("sister")) newAddOns.push("sibling");
    if (input.includes("album") || input.includes("book")) newAddOns.push("album");
    if (input.includes("wall art") || input.includes("framed") || input.includes("print")) newAddOns.push("wall-art");
    if (input.includes("retouching") || input.includes("editing")) newAddOns.push("retouching");
    if (input.includes("extended") || input.includes("longer") || input.includes("more time")) newAddOns.push("extended");
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
      className={`relative p-4 rounded-3xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-pink-300 bg-pink-50 shadow-lg" 
          : "border-stone-200 hover:border-pink-200 bg-white hover:bg-pink-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-light text-sm ${selected ? "text-pink-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-pink-600" : "text-stone-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-pink-600" : "text-stone-500"}`}>+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-pink-600" : "text-stone-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Session Type", completed: !!formData.sessionType && !!formData.babyAge },
    { number: 2, title: "Family & Delivery", completed: !!formData.peopleIncluded && !!formData.deliveryPreference },
    { number: 3, title: "Add-ons & Date", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-25 via-pink-25 to-stone-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <EditableText
            text={textConfig?.mainTitle || customConfig?.textCustomization?.headline || "Newborn Photography Calculator"}
            onSave={(value) => updateTextContent('mainTitle', value)}
            isPreview={isPreview}
            placeholder="Newborn Photography Calculator"
            className="text-4xl font-serif text-stone-800 mb-2 block"
          />
          <EditableText
            text={textConfig?.subtitle || customConfig?.textCustomization?.description || "Capture these fleeting moments with gentle, professional newborn photography. Get your personalized quote for your precious new arrival."}
            onSave={(value) => updateTextContent('subtitle', value)}
            isPreview={isPreview}
            placeholder="Capture these fleeting moments with gentle, professional newborn photography..."
            className="text-stone-600 max-w-2xl mx-auto font-light block"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-pink-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light ${
                        step.completed
                          ? "bg-pink-400 text-white"
                          : currentStep === step.number
                          ? "bg-pink-300 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-light text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-pink-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Session Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Baby className="h-6 w-6 mr-2 text-pink-400" />
                      Choose your newborn session style
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-pink-50 rounded-3xl border border-pink-200">
                      <label className="block text-sm font-light text-stone-700 mb-2">
                        Describe your dream newborn session (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., A newborn lifestyle shoot at our home with parents and siblings included"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-pink-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-2xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-pink-400 hover:bg-pink-500 text-white border-0 font-light rounded-2xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Session Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {sessionTypes.map((session) => (
                            <OptionCard
                              key={session.id}
                              option={session}
                              selected={formData.sessionType === session.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionType: session.id }))}
                              icon={session.icon}
                              popular={session.popular}
                            />
                          ))}
                        </div>

                        {formData.sessionType === "combo" && (
                          <div className="mt-4 p-3 bg-pink-50 rounded-2xl border border-pink-200">
                            <div className="text-sm text-stone-600">
                              👨‍👩‍👧‍👦 Most booked: Studio + Album + Wall Art
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Baby Age at Session</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {babyAges.map((age) => (
                            <OptionCard
                              key={age.id}
                              option={age}
                              selected={formData.babyAge === age.id}
                              onClick={() => setFormData(prev => ({ ...prev, babyAge: age.id }))}
                              icon={age.icon}
                              popular={age.popular}
                            />
                          ))}
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                          <div className="text-sm text-amber-800">
                            💡 What's the best age for newborn sessions? → 5-14 days old for those sleepy, curled poses
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.sessionType || !formData.babyAge}
                      className="bg-pink-400 hover:bg-pink-500 text-white px-8 font-light rounded-2xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Family & Delivery */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-pink-400" />
                      Who's included and how you'd like your photos
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Number of People Included</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {peopleOptions.map((people) => (
                            <OptionCard
                              key={people.id}
                              option={people}
                              selected={formData.peopleIncluded === people.id}
                              onClick={() => setFormData(prev => ({ ...prev, peopleIncluded: people.id }))}
                              popular={people.popular}
                            />
                          ))}
                        </div>
                        
                        {(formData.peopleIncluded === "baby-parents" || formData.peopleIncluded === "baby-family") && !formData.addOns.includes("makeup") && (
                          <div className="mt-4 p-3 bg-rose-50 rounded-2xl border border-rose-200">
                            <div className="text-sm text-rose-800">
                              💄 Consider adding professional makeup for mom - you'll love how radiant you look!
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Delivery Preference</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {deliveryOptions.map((delivery) => (
                            <OptionCard
                              key={delivery.id}
                              option={delivery}
                              selected={formData.deliveryPreference === delivery.id}
                              onClick={() => setFormData(prev => ({ ...prev, deliveryPreference: delivery.id }))}
                              popular={delivery.popular}
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
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-2xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.peopleIncluded || !formData.deliveryPreference}
                      className="bg-pink-400 hover:bg-pink-500 text-white px-8 font-light rounded-2xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Date */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-pink-400" />
                      Enhance your session experience
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Add-ons (Optional)</h3>
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
                              className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-pink-300 bg-pink-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-pink-200 bg-white text-stone-700 hover:bg-pink-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs font-light">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-light"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-medium ${formData.addOns.includes(addOn.id) ? "text-pink-600" : "text-stone-500"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-light text-stone-700 mb-3">Preferred Date (Optional)</h3>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                            <Input
                              type="date"
                              value={formData.preferredDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                              className="pl-10 border-stone-300 bg-white text-stone-800 rounded-2xl"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-light text-stone-700 mb-3">Promo Code (Optional)</h3>
                          <Input
                            placeholder="Enter promo code (e.g., NEWBORN10)"
                            value={formData.promoCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                            className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-2xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-pink-400 hover:bg-pink-500 text-white px-8 font-light rounded-2xl"
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
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-pink-400" />
                      Get your newborn photography quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-2xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-2xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 mb-2">
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-2xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-pink-400 hover:bg-pink-500 text-white px-8 font-light rounded-2xl"
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
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-pink-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-light text-stone-800 mb-4">Your Session Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-light text-pink-500">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-pink-500"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-medium text-stone-800">
                      <span>Total</span>
                      <span className="text-pink-500">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-light text-stone-800">Capture these fleeting moments forever</h3>
                    <p className="text-sm text-stone-600 font-light">
                      This quote is valid for 48 hours. Gentle, professional newborn photography with years of experience.
                    </p>
                    
                    <Button 
                      className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 font-light rounded-2xl"
                      onClick={() => {
                        const subject = "Newborn Photography Session";
                        const body = `I'd love to book my newborn session! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@snugglebabyvienna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      👶 Book My Session
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-400 rounded-full mr-1"></div>
                        Gentle approach
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-1"></div>
                        Safe & warm
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-pink-500 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-stone-300 text-stone-600 hover:bg-stone-50 rounded-2xl"
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