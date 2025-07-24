import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Dumbbell, 
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
  Zap
} from "lucide-react";

interface PersonalTrainingFormData {
  trainingType: string;
  sessionFormat: string;
  frequency: string;
  duration: string;
  addOns: string[];
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
  frequencyAdd: number;
  formatAdd: number;
  durationAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface PersonalTrainingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function PersonalTrainingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: PersonalTrainingCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<PersonalTrainingFormData>({
    trainingType: "",
    sessionFormat: "",
    frequency: "",
    duration: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const trainingTypes = [
    { id: "general", label: "General Fitness", surcharge: 0, icon: "💪", popular: true },
    { id: "strength", label: "Strength & Conditioning", surcharge: 10, icon: "🏋️", popular: true },
    { id: "weight-loss", label: "Weight Loss", surcharge: 15, icon: "🔥", popular: true },
    { id: "prenatal", label: "Pre/Postnatal", surcharge: 20, icon: "🤰", popular: false },
    { id: "online", label: "Online Coaching", surcharge: -5, icon: "💻", popular: true },
  ];

  const sessionFormats = [
    { id: "one-on-one", label: "1-on-1", basePrice: 50, icon: "👤", popular: true },
    { id: "small-group", label: "Small Group (2-4)", basePrice: 30, icon: "👥", popular: true },
    { id: "virtual", label: "Virtual / Zoom", basePrice: 35, icon: "💻", popular: true },
    { id: "outdoor", label: "Outdoor / Park", basePrice: 55, icon: "🌳", popular: false },
    { id: "in-gym", label: "In-Gym", basePrice: 50, icon: "🏟️", popular: true },
  ];

  const frequencies = [
    { id: "1x", label: "Once a week", multiplier: 1, sessions: 1, popular: false },
    { id: "2-3x", label: "2-3x per week", multiplier: 2.5, sessions: 2.5, popular: true },
    { id: "4x+", label: "4+ sessions per week", multiplier: 4, sessions: 4, popular: true },
  ];

  const durations = [
    { id: "30", label: "30 mins", multiplier: 0.75, popular: false },
    { id: "45", label: "45 mins", multiplier: 0.9, popular: true },
    { id: "60", label: "60 mins", multiplier: 1.0, popular: true },
  ];

  const addOnOptions = [
    { id: "meal-plan", label: "Meal Plan", price: 40, popular: true },
    { id: "progress-app", label: "Progress Tracking App", price: 25, popular: true },
    { id: "check-in", label: "Weekly Check-In Call", price: 20, popular: true },
    { id: "pdf-plan", label: "Goal-Specific PDF Plan", price: 30, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const trainingType = trainingTypes.find(t => t.id === formData.trainingType);
    const sessionFormat = sessionFormats.find(f => f.id === formData.sessionFormat);
    const frequency = frequencies.find(f => f.id === formData.frequency);
    const duration = durations.find(d => d.id === formData.duration);

    const sessionPrice = (sessionFormat?.basePrice || customConfig?.basePrice || 60) * (duration?.multiplier || 1);
    const basePrice = sessionPrice * (frequency?.sessions || 1) * 4; // Monthly price
    const trainingAdd = trainingType?.surcharge || 0;
    const frequencyAdd = 0; // Already included in base calculation
    const formatAdd = 0; // Already included in base calculation
    const durationAdd = 0; // Already included in base calculation
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base session
    breakdown.push(`${sessionFormat?.label || 'Base training'} (${frequency?.label}, ${duration?.label}): ${currencySymbol}${basePrice.toFixed(0)}`);

    // Training type surcharge
    if (trainingAdd !== 0) {
      const totalTrainingAdd = trainingAdd * (frequency?.sessions || 1) * 4;
      breakdown.push(`${trainingType?.label} specialty: ${currencySymbol}${totalTrainingAdd > 0 ? '+' : ''}${totalTrainingAdd}`);
    }

    // Add-ons - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    let subtotal = basePrice + (trainingAdd * (frequency?.sessions || 1) * 4) + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "fit10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      frequencyAdd,
      formatAdd,
      durationAdd,
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

    // Parse frequency
    if (input.includes("4") || input.includes("four") || input.includes("4+")) newFormData.frequency = "4x+";
    else if (input.includes("3") || input.includes("three") || input.includes("2-3") || input.includes("twice")) newFormData.frequency = "2-3x";
    else newFormData.frequency = "1x";

    // Parse training type
    if (input.includes("weight loss") || input.includes("lose weight")) newFormData.trainingType = "weight-loss";
    else if (input.includes("strength") || input.includes("conditioning")) newFormData.trainingType = "strength";
    else if (input.includes("prenatal") || input.includes("postnatal") || input.includes("pregnancy")) newFormData.trainingType = "prenatal";
    else if (input.includes("online") || input.includes("virtual") || input.includes("zoom")) newFormData.trainingType = "online";
    else newFormData.trainingType = "general";

    // Parse session format
    if (input.includes("online") || input.includes("virtual") || input.includes("zoom")) newFormData.sessionFormat = "virtual";
    else if (input.includes("group") || input.includes("small group")) newFormData.sessionFormat = "small-group";
    else if (input.includes("outdoor") || input.includes("park")) newFormData.sessionFormat = "outdoor";
    else if (input.includes("gym")) newFormData.sessionFormat = "in-gym";
    else newFormData.sessionFormat = "one-on-one";

    // Parse duration
    if (input.includes("30") || input.includes("thirty")) newFormData.duration = "30";
    else if (input.includes("45") || input.includes("forty")) newFormData.duration = "45";
    else newFormData.duration = "60";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("meal plan") || input.includes("nutrition")) newAddOns.push("meal-plan");
    if (input.includes("app") || input.includes("tracking")) newAddOns.push("progress-app");
    if (input.includes("check") || input.includes("call")) newAddOns.push("check-in");
    if (input.includes("pdf") || input.includes("plan")) newAddOns.push("pdf-plan");
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
          ? "border-green-400 bg-green-50 shadow-lg" 
          : "border-gray-600 hover:border-green-400 bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-semibold ${selected ? "text-gray-800" : "text-white"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-green-600" : "text-gray-300"}`}>€{option.basePrice}/session</div>
        )}
        {option.surcharge !== undefined && option.surcharge !== 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-green-600" : "text-gray-300"}`}>
            {option.surcharge > 0 ? '+' : ''}€{option.surcharge}/session
          </div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-green-600" : "text-gray-300"}`}>+€{option.price}/month</div>
        )}
        {option.multiplier !== undefined && option.multiplier !== 1.0 && (
          <div className={`text-sm mt-1 ${selected ? "text-green-600" : "text-gray-300"}`}>
            {Math.round(option.multiplier * 100)}% duration
          </div>
        )}
        {option.sessions !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-green-600" : "text-gray-300"}`}>
            {option.sessions} sessions/week
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Training Goals", completed: !!formData.trainingType && !!formData.sessionFormat },
    { number: 2, title: "Schedule & Duration", completed: !!formData.frequency && !!formData.duration },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-white mb-2">
            Personal Training Quote Calculator
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto font-body">
            Transform your fitness journey with professional personal training. Get your personalized quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-800/90 backdrop-blur-sm border-green-400 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-green-400 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Training Goals */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Dumbbell className="h-6 w-6 mr-2 text-green-400" />
                      Define your fitness goals
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-green-900/30 rounded-xl border border-green-400">
                      <label className="block text-sm font-body text-gray-300 mb-2">
                        Describe your training needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I want 3 sessions per week for weight loss, online, with a meal plan"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-gray-800 border-green-400 text-white mb-3 resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Training Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {trainingTypes.map((type) => (
                            <OptionCard
                              key={type.id}
                              option={type}
                              selected={formData.trainingType === type.id}
                              onClick={() => setFormData(prev => ({ ...prev, trainingType: type.id }))}
                              icon={type.icon}
                              popular={type.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Session Format</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {sessionFormats.map((format) => (
                            <OptionCard
                              key={format.id}
                              option={format}
                              selected={formData.sessionFormat === format.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionFormat: format.id }))}
                              icon={format.icon}
                              popular={format.popular}
                            />
                          ))}
                        </div>

                        {formData.sessionFormat === "small-group" && (
                          <div className="mt-4 p-3 bg-green-900/30 rounded-xl border border-green-400">
                            <div className="text-sm text-gray-300">
                              💪 Most popular: 3x/week + meal plan + PDF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.trainingType || !formData.sessionFormat}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule & Duration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-green-400" />
                      Training schedule and session length
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Training Frequency</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {frequencies.map((freq) => (
                            <OptionCard
                              key={freq.id}
                              option={freq}
                              selected={formData.frequency === freq.id}
                              onClick={() => setFormData(prev => ({ ...prev, frequency: freq.id }))}
                              popular={freq.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Session Duration</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {durations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.duration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                              popular={duration.popular}
                            />
                          ))}
                        </div>
                      </div>

                      {formData.frequency === "4x+" && (
                        <div className="p-4 bg-green-900/30 rounded-xl border border-green-400">
                          <h4 className="font-semibold text-green-400 mb-2">💡 Bulk Discount Available:</h4>
                          <div className="text-sm text-gray-300">
                            Consider our 12-session package for 10% off when training 4+ times per week!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.frequency || !formData.duration}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-green-400" />
                      Enhance your training experience
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Add-ons (Optional)</h3>
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
                                  ? "border-green-400 bg-green-50 shadow-lg text-gray-800"
                                  : "border-gray-600 hover:border-green-400 bg-gray-800 text-white hover:bg-gray-700"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-semibold ${formData.addOns.includes(addOn.id) ? "text-green-600" : "text-gray-300"}`}>
                                  +€{addOn.price}/month
                                </div>
                              </div>
                              {addOn.id === "check-in" && (
                                <div className="text-xs text-gray-400 mt-1">
                                  💡 What's in the Weekly Check-In Call? → Progress review, goal adjustment, motivation boost
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., FIT10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-green-400" />
                      Get your fitness quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
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
            <Card className="p-6 bg-gray-800/95 backdrop-blur-sm border-green-400 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-white mb-4">Your Training Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-400">
                  €{pricing.total.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-green-400"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-400 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-white">
                      <span>Monthly Total</span>
                      <span className="text-green-400">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-white">Ready to Transform?</h3>
                    <p className="text-sm text-gray-300">
                      This quote is valid for 48 hours. Professional training that gets real results.
                    </p>
                    
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Personal Training Consultation";
                        const body = `I'd love to book a free consultation! My quote is €${pricing.total.toLocaleString()}/month.`;
                        const mailtoUrl = `mailto:info@fitgoalscoach.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      💪 Book Free Consultation
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Certified Trainer
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Results Guaranteed
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-600 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-300">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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