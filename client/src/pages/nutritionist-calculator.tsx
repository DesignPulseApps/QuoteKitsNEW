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
  Stethoscope,
  Dumbbell,
  Clipboard,
  Target,
  TrendingUp
} from "lucide-react";

interface NutritionistFormData {
  goalType: string;
  planType: string;
  dietPreference: string;
  addOns: string[];
  clientType: string;
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
  addOnsTotal: number;
  subtotal: number;
  returningDiscount: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface NutritionistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function NutritionistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: NutritionistCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<NutritionistFormData>({
    goalType: "",
    planType: "",
    dietPreference: "",
    addOns: [],
    clientType: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const goalTypes = [
    { id: "weight-loss", label: "Weight Loss", icon: "🎯", popular: true },
    { id: "muscle-gain", label: "Muscle Gain", icon: "💪", popular: true },
    { id: "digestive-health", label: "Digestive Health", icon: "🌿", popular: false },
    { id: "general-wellness", label: "General Wellness", icon: "✨", popular: true },
    { id: "sports-nutrition", label: "Sports Nutrition", icon: "🏃", popular: false },
  ];

  const planTypes = [
    { id: "one-time", label: "One-time Meal Plan", basePrice: 90, icon: "📋", popular: false },
    { id: "4-week", label: "4-Week Program", basePrice: 180, icon: "📅", popular: true },
    { id: "8-week", label: "8-Week Program", basePrice: 300, icon: "🗓️", popular: true },
    { id: "monthly", label: "Ongoing Monthly Coaching", basePrice: 120, icon: "🔄", popular: false },
  ];

  const dietPreferences = [
    { id: "balanced", label: "Balanced", popular: true },
    { id: "vegetarian", label: "Vegetarian", popular: true },
    { id: "vegan", label: "Vegan", popular: false },
    { id: "keto", label: "Keto", popular: true },
    { id: "gluten-free", label: "Gluten-Free", popular: false },
    { id: "custom", label: "Custom", popular: false },
  ];

  const addOnOptions = [
    { id: "grocery-list", label: "Grocery List", price: 25, popular: true, description: "A personalized weekly shopping list" },
    { id: "supplement-plan", label: "Supplement Plan", price: 35, popular: true, description: "Tailored supplement recommendations" },
    { id: "whatsapp-support", label: "WhatsApp Support", price: 15, popular: false, description: "Weekly support via WhatsApp" },
    { id: "zoom-checkins", label: "Zoom Check-ins (Weekly)", price: 20, popular: true, description: "Weekly video consultations" },
    { id: "food-diary-review", label: "Food Diary Review", price: 30, popular: false, description: "Weekly food diary analysis" },
  ];

  const clientTypes = [
    { id: "new", label: "New Client", discount: 0 },
    { id: "returning", label: "Returning Client", discount: 0.1 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const planType = planTypes.find(p => p.id === formData.planType);
    const clientType = clientTypes.find(c => c.id === formData.clientType);

    const basePrice = planType?.basePrice || customConfig?.basePrice || 0;
    
    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base plan
    breakdown.push(`${planType?.label || 'Base plan'}: ${currencySymbol}${basePrice}`);

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        let addOnPrice = addOn.price;
        
        // Weekly add-ons for longer plans
        if ((addOn.id === "whatsapp-support" || addOn.id === "zoom-checkins") && formData.planType !== "one-time") {
          const weeks = formData.planType === "4-week" ? 4 : formData.planType === "8-week" ? 8 : 4;
          addOnPrice = addOn.price * weeks;
          breakdown.push(`${addOn.label} (${weeks} weeks): ${currencySymbol}${addOnPrice}`);
        } else {
          breakdown.push(`${addOn.label}: ${currencySymbol}${addOnPrice}`);
        }
        
        addOnsTotal += addOnPrice;
      }
    });

    let subtotal = basePrice + addOnsTotal;

    // Returning client discount
    let returningDiscount = 0;
    if (formData.clientType === "returning") {
      returningDiscount = subtotal * 0.1;
      breakdown.push(`Returning client discount (10%): -${currencySymbol}${returningDiscount.toFixed(2)}`);
    }

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "wellness10" || formData.promoCode.toLowerCase() === "health10") {
      promoDiscount = (subtotal - returningDiscount) * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${promoDiscount.toFixed(2)}`);
    }

    const total = subtotal - returningDiscount - promoDiscount;

    return {
      basePrice,
      addOnsTotal,
      subtotal,
      returningDiscount,
      promoDiscount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse goal type
    if (input.includes("weight loss") || input.includes("lose weight")) newFormData.goalType = "weight-loss";
    else if (input.includes("muscle") || input.includes("gain")) newFormData.goalType = "muscle-gain";
    else if (input.includes("digestive") || input.includes("gut")) newFormData.goalType = "digestive-health";
    else if (input.includes("sports") || input.includes("athletic")) newFormData.goalType = "sports-nutrition";
    else newFormData.goalType = "general-wellness";

    // Parse plan type
    if (input.includes("one-time") || input.includes("single")) newFormData.planType = "one-time";
    else if (input.includes("4-week") || input.includes("4 week") || input.includes("month")) newFormData.planType = "4-week";
    else if (input.includes("8-week") || input.includes("8 week") || input.includes("two month")) newFormData.planType = "8-week";
    else if (input.includes("monthly") || input.includes("ongoing")) newFormData.planType = "monthly";
    else newFormData.planType = "4-week";

    // Parse diet preference
    if (input.includes("keto") || input.includes("ketogenic")) newFormData.dietPreference = "keto";
    else if (input.includes("vegan")) newFormData.dietPreference = "vegan";
    else if (input.includes("vegetarian")) newFormData.dietPreference = "vegetarian";
    else if (input.includes("gluten-free") || input.includes("gluten free")) newFormData.dietPreference = "gluten-free";
    else if (input.includes("custom")) newFormData.dietPreference = "custom";
    else newFormData.dietPreference = "balanced";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("grocery") || input.includes("shopping")) newAddOns.push("grocery-list");
    if (input.includes("supplement")) newAddOns.push("supplement-plan");
    if (input.includes("whatsapp") || input.includes("chat")) newAddOns.push("whatsapp-support");
    if (input.includes("zoom") || input.includes("video") || input.includes("call")) newAddOns.push("zoom-checkins");
    if (input.includes("diary") || input.includes("tracking")) newAddOns.push("food-diary-review");
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
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-emerald-400 bg-emerald-50 shadow-lg" 
          : "border-stone-200 hover:border-emerald-200 bg-white hover:bg-emerald-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-emerald-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-emerald-600" : "text-stone-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-emerald-600" : "text-stone-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Goals & Plan", completed: !!formData.goalType && !!formData.planType },
    { number: 2, title: "Diet & Add-ons", completed: !!formData.dietPreference },
    { number: 3, title: "Client Details", completed: !!formData.clientType },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-25 via-stone-50 to-amber-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-emerald-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-emerald-500 text-white"
                          : currentStep === step.number
                          ? "bg-emerald-400 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-emerald-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Goals & Plan */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Target className="h-6 w-6 mr-2 text-emerald-500" />
                      Your nutrition goals and plan
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Describe your nutrition needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I want a 4-week keto plan with Zoom calls"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-emerald-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Your Goal</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {goalTypes.map((goal) => (
                            <OptionCard
                              key={goal.id}
                              option={goal}
                              selected={formData.goalType === goal.id}
                              onClick={() => setFormData(prev => ({ ...prev, goalType: goal.id }))}
                              icon={goal.icon}
                              popular={goal.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Plan Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {planTypes.map((plan) => (
                            <OptionCard
                              key={plan.id}
                              option={plan}
                              selected={formData.planType === plan.id}
                              onClick={() => setFormData(prev => ({ ...prev, planType: plan.id }))}
                              icon={plan.icon}
                              popular={plan.popular}
                            />
                          ))}
                        </div>
                        
                        {formData.goalType === "sports-nutrition" && (
                          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="text-sm text-emerald-800">
                              💡 Most sports nutrition clients choose: 8-Week Plan + Zoom Check-ins
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.goalType || !formData.planType}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Diet & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Stethoscope className="h-6 w-6 mr-2 text-emerald-500" />
                      Diet preferences and support options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Diet Preference</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {dietPreferences.map((diet) => (
                            <OptionCard
                              key={diet.id}
                              option={diet}
                              selected={formData.dietPreference === diet.id}
                              onClick={() => setFormData(prev => ({ ...prev, dietPreference: diet.id }))}
                              popular={diet.popular}
                            />
                          ))}
                        </div>
                        
                        {formData.dietPreference === "vegan" && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="text-sm text-amber-800">
                              🌱 Suggested: Add a Supplement Plan to ensure optimal nutrition on a vegan diet
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Add-On Services (Optional)</h3>
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
                              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-emerald-400 bg-emerald-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-emerald-200 bg-white text-stone-700 hover:bg-emerald-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-stone-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-medium ml-4 ${formData.addOns.includes(addOn.id) ? "text-emerald-600" : "text-stone-500"}`}>
                                  {(addOn.id === "whatsapp-support" || addOn.id === "zoom-checkins") && formData.planType !== "one-time"
                                    ? `€${addOn.price}/week`
                                    : `€${addOn.price}`
                                  }
                                </div>
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
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.dietPreference}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Client Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-emerald-500" />
                      Client type and discounts
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Client Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {clientTypes.map((client) => (
                            <OptionCard
                              key={client.id}
                              option={client}
                              selected={formData.clientType === client.id}
                              onClick={() => setFormData(prev => ({ ...prev, clientType: client.id }))}
                            />
                          ))}
                        </div>
                        
                        {formData.clientType === "new" && formData.goalType && (
                          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="text-sm text-emerald-800">
                              ✨ New clients: We recommend starting with our 8-Week Program for optimal results
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., WELLNESS10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.clientType}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 font-medium rounded-xl"
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
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-emerald-500" />
                      Get your nutrition plan quote
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
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
                            className="pl-10 border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 font-medium rounded-xl"
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
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-emerald-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-medium text-stone-800 mb-4">Your Nutrition Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-medium text-emerald-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-emerald-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {(pricing.returningDiscount > 0 || pricing.promoDiscount > 0) && (
                      <div className="border-t border-stone-200 pt-2 flex justify-between font-medium text-stone-800">
                        <span>Total</span>
                        <span className="text-emerald-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-stone-800">Transform your health today</h3>
                    <p className="text-sm text-stone-600 font-light">
                      This quote is locked for 72 hours. Expert nutrition guidance tailored to your goals.
                    </p>
                    
                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 font-medium rounded-xl"
                      onClick={() => {
                        const subject = "Nutrition Plan Consultation";
                        const body = `I'd love to start my nutrition journey! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@fitfuelcoaching.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🥗 Book My Plan
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></div>
                        Expert guidance
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                        Proven results
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-emerald-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl"
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