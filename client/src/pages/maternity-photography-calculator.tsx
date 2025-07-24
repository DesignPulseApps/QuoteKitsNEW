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
  Heart, 
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
  Camera,
  Home,
  MapPin,
  Flower
} from "lucide-react";

interface MaternityFormData {
  sessionType: string;
  gestationWeek: string;
  whoIncluded: string;
  addOns: string[];
  location: string;
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
  weekAdd: number;
  peopleAdd: number;
  locationAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface MaternityPhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function MaternityPhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: MaternityPhotographyCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<MaternityFormData>({
    sessionType: "",
    gestationWeek: "",
    whoIncluded: "",
    addOns: [],
    location: "",
    preferredDate: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const sessionTypes = [
    { id: "classic-studio", label: "Classic Studio", basePrice: 280, icon: "📸", popular: true },
    { id: "outdoor-lifestyle", label: "Outdoor / Lifestyle", basePrice: 355, icon: "🌿", popular: true },
    { id: "artistic", label: "Artistic (milk bath, fabric toss)", basePrice: 355, icon: "✨", popular: false },
    { id: "combo", label: "Studio + Outdoor Combo", basePrice: 450, icon: "🌸", popular: true },
  ];

  const gestationWeeks = [
    { id: "25-29", label: "25–29 Weeks", surcharge: 0, icon: "🤰", popular: false },
    { id: "30-34", label: "30–34 Weeks", surcharge: 0, icon: "💕", popular: true },
    { id: "35-38", label: "35–38 Weeks", surcharge: 25, icon: "👶", popular: true },
  ];

  const whoIncludedOptions = [
    { id: "mom-only", label: "Mom-to-be only", surcharge: 0, popular: false },
    { id: "mom-partner", label: "Mom + Partner", surcharge: 40, popular: true },
    { id: "mom-family", label: "Mom + Family (up to 5)", surcharge: 80, popular: true },
  ];

  const locationOptions = [
    { id: "in-studio", label: "In-Studio", surcharge: 0, popular: true },
    { id: "outdoor", label: "Outdoor Location (park, forest)", surcharge: 50, popular: true },
    { id: "in-home", label: "In-Home Session", surcharge: 75, popular: false },
  ];

  const addOnOptions = [
    { id: "makeup", label: "Professional Makeup", price: 80, popular: true },
    { id: "dress-rental", label: "Flowing Dress Rental", price: 60, popular: true },
    { id: "hair-styling", label: "Hair Styling", price: 60, popular: false },
    { id: "partner-portraits", label: "Partner Portraits", price: 40, popular: true },
    { id: "retouched-set", label: "Retouched Image Set", price: 65, popular: false },
    { id: "album", label: "Printed Album", price: 140, popular: true },
    { id: "wall-art", label: "Wall Art or Canvas", price: 120, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const sessionType = sessionTypes.find(s => s.id === formData.sessionType);
    const gestationWeek = gestationWeeks.find(w => w.id === formData.gestationWeek);
    const whoIncluded = whoIncludedOptions.find(w => w.id === formData.whoIncluded);
    const location = locationOptions.find(l => l.id === formData.location);

    const basePrice = sessionType?.basePrice || customConfig?.basePrice || 280;
    const sessionTypeAdd = 0; // Already included in base price
    const weekAdd = gestationWeek?.surcharge || 0;
    const peopleAdd = whoIncluded?.surcharge || 0;
    const locationAdd = location?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base session
    breakdown.push(`${sessionType?.label || 'Base session'}: €${basePrice.toFixed(0)}`);

    // Gestation week surcharge
    if (weekAdd > 0) {
      breakdown.push(`${gestationWeek?.label} timing: €${weekAdd}`);
    }

    // People included
    if (peopleAdd > 0) {
      breakdown.push(`${whoIncluded?.label}: €${peopleAdd}`);
    }

    // Location
    if (locationAdd > 0) {
      breakdown.push(`${location?.label}: €${locationAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    // Auto-add makeup when dress rental is selected
    if (formData.addOns.includes("dress-rental") && !formData.addOns.includes("makeup")) {
      // This would be a suggestion, not auto-added
    }

    let subtotal = basePrice + weekAdd + peopleAdd + locationAdd + addOnsTotal;

    // Travel surcharge for distant outdoor locations
    if (formData.location === "outdoor") {
      // This would depend on actual location distance
    }

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "maternity10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      sessionTypeAdd,
      weekAdd,
      peopleAdd,
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

    // Parse session type
    if (input.includes("outdoor") || input.includes("lifestyle")) newFormData.sessionType = "outdoor-lifestyle";
    else if (input.includes("artistic") || input.includes("milk bath") || input.includes("fabric")) newFormData.sessionType = "artistic";
    else if (input.includes("combo") || input.includes("studio + outdoor")) newFormData.sessionType = "combo";
    else newFormData.sessionType = "classic-studio";

    // Parse gestation week
    if (input.includes("25") || input.includes("26") || input.includes("27") || input.includes("28") || input.includes("29")) newFormData.gestationWeek = "25-29";
    else if (input.includes("35") || input.includes("36") || input.includes("37") || input.includes("38")) newFormData.gestationWeek = "35-38";
    else newFormData.gestationWeek = "30-34";

    // Parse who included
    if (input.includes("family") || input.includes("children") || input.includes("kids")) newFormData.whoIncluded = "mom-family";
    else if (input.includes("partner") || input.includes("husband") || input.includes("couple")) newFormData.whoIncluded = "mom-partner";
    else newFormData.whoIncluded = "mom-only";

    // Parse location
    if (input.includes("home") || input.includes("house")) newFormData.location = "in-home";
    else if (input.includes("outdoor") || input.includes("park") || input.includes("forest")) newFormData.location = "outdoor";
    else newFormData.location = "in-studio";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("makeup") || input.includes("make up")) newAddOns.push("makeup");
    if (input.includes("dress") || input.includes("gown")) newAddOns.push("dress-rental");
    if (input.includes("hair") || input.includes("styling")) newAddOns.push("hair-styling");
    if (input.includes("partner portraits") || input.includes("couple shots")) newAddOns.push("partner-portraits");
    if (input.includes("retouching") || input.includes("editing")) newAddOns.push("retouched-set");
    if (input.includes("album") || input.includes("book")) newAddOns.push("album");
    if (input.includes("wall art") || input.includes("canvas") || input.includes("print")) newAddOns.push("wall-art");
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
          ? "border-amber-300 bg-amber-50 shadow-lg" 
          : "border-stone-200 hover:border-amber-200 bg-white hover:bg-amber-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-light text-sm ${selected ? "text-amber-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-amber-600" : "text-stone-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-amber-600" : "text-stone-500"}`}>+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-amber-600" : "text-stone-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Session Details", completed: !!formData.sessionType && !!formData.gestationWeek },
    { number: 2, title: "People & Location", completed: !!formData.whoIncluded && !!formData.location },
    { number: 3, title: "Add-ons & Date", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-25 via-stone-50 to-rose-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-amber-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light ${
                        step.completed
                          ? "bg-amber-400 text-white"
                          : currentStep === step.number
                          ? "bg-amber-300 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-light text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-amber-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Session Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2 text-amber-400" />
                      Your maternity session preferences
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-amber-50 rounded-3xl border border-amber-200">
                      <label className="block text-sm font-light text-stone-700 mb-2">
                        Describe your dream maternity session (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Outdoor shoot at 32 weeks with makeup and album"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-amber-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-2xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-amber-400 hover:bg-amber-500 text-white border-0 font-light rounded-2xl"
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

                        {formData.sessionType === "artistic" && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                            <div className="text-sm text-stone-600">
                              ✨ Most loved: Studio + Makeup + Dress Rental
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Gestation Week at Time of Shoot</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {gestationWeeks.map((week) => (
                            <OptionCard
                              key={week.id}
                              option={week}
                              selected={formData.gestationWeek === week.id}
                              onClick={() => setFormData(prev => ({ ...prev, gestationWeek: week.id }))}
                              icon={week.icon}
                              popular={week.popular}
                            />
                          ))}
                        </div>
                        
                        <div className="mt-4 p-3 bg-rose-50 rounded-2xl border border-rose-200">
                          <div className="text-sm text-rose-800">
                            💡 When is the best time to schedule my shoot? → 30-34 weeks is ideal for the perfect bump shape
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.sessionType || !formData.gestationWeek}
                      className="bg-amber-400 hover:bg-amber-500 text-white px-8 font-light rounded-2xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: People & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-amber-400" />
                      Who's included and where to shoot
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Who Is Included</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {whoIncludedOptions.map((who) => (
                            <OptionCard
                              key={who.id}
                              option={who}
                              selected={formData.whoIncluded === who.id}
                              onClick={() => setFormData(prev => ({ ...prev, whoIncluded: who.id }))}
                              popular={who.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-light text-stone-700 mb-3">Location</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {locationOptions.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.location === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, location: location.id }))}
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
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-2xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.whoIncluded || !formData.location}
                      className="bg-amber-400 hover:bg-amber-500 text-white px-8 font-light rounded-2xl"
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
                      <Star className="h-6 w-6 mr-2 text-amber-400" />
                      Enhance your maternity experience
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
                                  ? "border-amber-300 bg-amber-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-amber-200 bg-white text-stone-700 hover:bg-amber-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-light">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-light"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-medium ${formData.addOns.includes(addOn.id) ? "text-amber-600" : "text-stone-500"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                              {addOn.id === "dress-rental" && !formData.addOns.includes("makeup") && (
                                <div className="text-xs text-stone-500 mt-1">
                                  💄 Consider adding makeup to complete your glamorous look!
                                </div>
                              )}
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
                            placeholder="Enter promo code (e.g., MATERNITY10)"
                            value={formData.promoCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                            className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-2xl"
                          />
                        </div>
                      </div>

                      {formData.gestationWeek && (
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                          <h4 className="font-medium text-purple-800 mb-2">💜 Bundle Opportunity</h4>
                          <div className="text-sm text-purple-700">
                            Save 15% when you book both maternity and newborn sessions together! Perfect for capturing your complete journey.
                          </div>
                        </div>
                      )}
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
                      className="bg-amber-400 hover:bg-amber-500 text-white px-8 font-light rounded-2xl"
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
                      <Mail className="h-6 w-6 mr-2 text-amber-400" />
                      Get your maternity photography quote
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
                      className="bg-amber-400 hover:bg-amber-500 text-white px-8 font-light rounded-2xl"
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
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-amber-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-light text-stone-800 mb-4">Your Maternity Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-light text-amber-500">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-amber-500"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
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
                      <span className="text-amber-500">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-light text-stone-800">Celebrate this beautiful chapter</h3>
                    <p className="text-sm text-stone-600 font-light">
                      This quote is locked for 72 hours. Timeless, elegant maternity photography with artistic vision.
                    </p>
                    
                    <Button 
                      className="w-full bg-amber-400 hover:bg-amber-500 text-white py-3 font-light rounded-2xl"
                      onClick={() => {
                        const subject = "Maternity Photography Session";
                        const body = `I'd love to reserve my maternity session! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@viennabumpstudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🤰 Reserve My Session
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-1"></div>
                        Timeless style
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                        Artistic vision
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-amber-500 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
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