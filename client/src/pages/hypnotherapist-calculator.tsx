import { useState } from "react";
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
  Target,
  TrendingUp,
  Brain,
  Volume2,
  Wind,
  Zap,
  Shield,
  Lightbulb
} from "lucide-react";

interface HypnotherapistFormData {
  treatmentType: string;
  sessionFormat: string;
  sessionPlan: string;
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

interface HypnotherapistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function HypnotherapistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: HypnotherapistCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [textConfig, setTextConfig] = useState<any>(propConfig?.textContent || {});
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    const updated = { ...textConfig, [key]: value };
    setTextConfig(updated);
    if (onConfigChange) {
      onConfigChange({
        ...propConfig,
        textContent: updated
      });
    }
  };
  
  const [formData, setFormData] = useState<HypnotherapistFormData>({
    treatmentType: "",
    sessionFormat: "",
    sessionPlan: "",
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

  const treatmentTypes = [
    { id: "stop-smoking", label: "Stop Smoking", icon: "🚭", popular: true },
    { id: "weight-loss", label: "Weight Loss", icon: "⚖️", popular: true },
    { id: "stress-anxiety", label: "Stress & Anxiety", icon: "🧘", popular: true },
    { id: "confidence", label: "Confidence / Self-Esteem", icon: "✨", popular: false },
    { id: "sleep-improvement", label: "Sleep Improvement", icon: "😴", popular: false },
    { id: "rtt-deep-healing", label: "RTT Deep Healing", icon: "🌱", popular: false },
  ];

  const sessionFormats = [
    { id: "in-person", label: "In-Person", basePrice: 0, icon: "🤝", popular: true },
    { id: "online-zoom", label: "Online via Zoom", basePrice: -20, icon: "💻", popular: true },
    { id: "group-session", label: "Group Session", basePrice: -40, icon: "👥", popular: false },
  ];

  const sessionPlans = [
    { id: "one-off", label: "One-off Session", basePrice: 100, icon: "⏱️", popular: false },
    { id: "3-session", label: "3-Session Plan", basePrice: 270, icon: "📅", popular: true },
    { id: "6-session", label: "6-Session Deep Dive", basePrice: 500, icon: "🗓️", popular: true },
  ];

  const addOnOptions = [
    { id: "audio-recording", label: "Personalized Audio Recording", price: 25, popular: true, description: "Custom hypnosis recording for home practice" },
    { id: "follow-up", label: "Follow-up Check-In", price: 20, popular: true, description: "30-minute progress review session" },
    { id: "progress-journal", label: "Progress Journal", price: 15, popular: false, description: "Structured tracking workbook" },
    { id: "nlp-addon", label: "NLP Techniques Add-On", price: 30, popular: false, description: "Enhanced session with NLP methods" },
    { id: "urgent-booking", label: "Urgent Booking (within 48h)", price: 40, popular: false, description: "Priority scheduling within 48 hours" },
  ];

  const clientTypes = [
    { id: "new", label: "New Client", discount: 0 },
    { id: "returning", label: "Returning Client", discount: 0.1 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const plan = sessionPlans.find(p => p.id === formData.sessionPlan);
    const format = sessionFormats.find(f => f.id === formData.sessionFormat);

    const basePrice = (plan?.basePrice || customConfig?.basePrice || 80) + (format?.basePrice || 0);
    
    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base plan
    breakdown.push(`${plan?.label || 'Base plan'}: €${plan?.basePrice || 0}`);
    
    // Session format adjustment
    if (format && format.basePrice !== 0) {
      const adjustment = format.basePrice > 0 ? `+€${format.basePrice}` : `-€${Math.abs(format.basePrice)}`;
      breakdown.push(`${format.label} adjustment: ${adjustment}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        breakdown.push(`${addOn.label}: €${addOn.price}`);
        addOnsTotal += addOn.price;
      }
    });

    let subtotal = basePrice + addOnsTotal;

    // Returning client discount
    let returningDiscount = 0;
    if (formData.clientType === "returning") {
      returningDiscount = subtotal * 0.1;
      breakdown.push(`Returning client discount (10%): -€${returningDiscount.toFixed(2)}`);
    }

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "calm10" || formData.promoCode.toLowerCase() === "healing10") {
      promoDiscount = (subtotal - returningDiscount) * 0.1;
      breakdown.push(`Promo code discount (10%): -€${promoDiscount.toFixed(2)}`);
    }

    const total = Math.max(0, subtotal - returningDiscount - promoDiscount);

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

    // Parse treatment type
    if (input.includes("smoking") || input.includes("quit")) newFormData.treatmentType = "stop-smoking";
    else if (input.includes("weight") || input.includes("diet")) newFormData.treatmentType = "weight-loss";
    else if (input.includes("stress") || input.includes("anxiety") || input.includes("panic")) newFormData.treatmentType = "stress-anxiety";
    else if (input.includes("confidence") || input.includes("self-esteem")) newFormData.treatmentType = "confidence";
    else if (input.includes("sleep") || input.includes("insomnia")) newFormData.treatmentType = "sleep-improvement";
    else if (input.includes("rtt") || input.includes("deep") || input.includes("healing")) newFormData.treatmentType = "rtt-deep-healing";
    else newFormData.treatmentType = "stress-anxiety";

    // Parse session format
    if (input.includes("group")) newFormData.sessionFormat = "group-session";
    else if (input.includes("online") || input.includes("zoom") || input.includes("virtual")) newFormData.sessionFormat = "online-zoom";
    else newFormData.sessionFormat = "in-person";

    // Parse session plan
    if (input.includes("one-off") || input.includes("single")) newFormData.sessionPlan = "one-off";
    else if (input.includes("3-session") || input.includes("3 session") || input.includes("three")) newFormData.sessionPlan = "3-session";
    else if (input.includes("6-session") || input.includes("6 session") || input.includes("six") || input.includes("deep dive")) newFormData.sessionPlan = "6-session";
    else newFormData.sessionPlan = "3-session";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("recording") || input.includes("audio")) newAddOns.push("audio-recording");
    if (input.includes("follow-up") || input.includes("check-in")) newAddOns.push("follow-up");
    if (input.includes("journal") || input.includes("tracking")) newAddOns.push("progress-journal");
    if (input.includes("nlp")) newAddOns.push("nlp-addon");
    if (input.includes("urgent") || input.includes("asap") || input.includes("quickly")) newAddOns.push("urgent-booking");
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
          ? "border-teal-300 bg-teal-50 shadow-lg" 
          : "border-stone-200 hover:border-teal-200 bg-white hover:bg-teal-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-teal-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-teal-600" : "text-stone-500"}`}>
            {option.basePrice === 0 ? "Base" : option.basePrice > 0 ? `+€${option.basePrice}` : `-€${Math.abs(option.basePrice)}`}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-teal-600" : "text-stone-500"}`}>
            +€{option.price}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Treatment & Format", completed: !!formData.treatmentType && !!formData.sessionFormat },
    { number: 2, title: "Plan & Add-ons", completed: !!formData.sessionPlan },
    { number: 3, title: "Client Details", completed: !!formData.clientType },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-25 via-stone-50 to-purple-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-teal-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-teal-500 text-white"
                          : currentStep === step.number
                          ? "bg-teal-400 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-teal-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Treatment & Format */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Brain className="h-6 w-6 mr-2 text-teal-500" />
                      Your treatment focus and session format
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-200">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Describe your therapy needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need RTT therapy and a recording ASAP"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-teal-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-teal-500 hover:bg-teal-600 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Treatment Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {treatmentTypes.map((treatment) => (
                            <OptionCard
                              key={treatment.id}
                              option={treatment}
                              selected={formData.treatmentType === treatment.id}
                              onClick={() => setFormData(prev => ({ ...prev, treatmentType: treatment.id }))}
                              icon={treatment.icon}
                              popular={treatment.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Session Format</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.treatmentType || !formData.sessionFormat}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Plan & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-teal-500" />
                      Session plan and enhancement options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Session Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {sessionPlans.map((plan) => (
                            <OptionCard
                              key={plan.id}
                              option={plan}
                              selected={formData.sessionPlan === plan.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionPlan: plan.id }))}
                              icon={plan.icon}
                              popular={plan.popular}
                            />
                          ))}
                        </div>
                        
                        {formData.treatmentType === "rtt-deep-healing" && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="text-sm text-purple-800">
                              🌱 RTT Recommendation: 6-Session Deep Dive for comprehensive transformation
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Enhancement Add-Ons (Optional)</h3>
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
                                  ? "border-teal-400 bg-teal-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-teal-200 bg-white text-stone-700 hover:bg-teal-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-stone-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-medium ml-4 ${formData.addOns.includes(addOn.id) ? "text-teal-600" : "text-stone-500"}`}>
                                  €{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="text-sm text-green-800">
                            ⭐ Most popular: 3-Session Plan + Audio Recording + NLP Add-On
                          </div>
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
                      disabled={!formData.sessionPlan}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
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
                      <Users className="h-6 w-6 mr-2 text-teal-500" />
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
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., CALM10)"
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
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
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
                      <Mail className="h-6 w-6 mr-2 text-teal-500" />
                      Get your therapy quote
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
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-medium rounded-xl"
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
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-teal-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-medium text-stone-800 mb-4">Your Therapy Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-medium text-teal-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-teal-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {(pricing.returningDiscount > 0 || pricing.promoDiscount > 0) && (
                      <div className="border-t border-stone-200 pt-2 flex justify-between font-medium text-stone-800">
                        <span>Total</span>
                        <span className="text-teal-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-stone-800">Begin your transformation</h3>
                    <p className="text-sm text-stone-600 font-light">
                      This quote is valid for 48 hours. Expert hypnotherapy guidance for lasting change.
                    </p>
                    
                    <Button 
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 font-medium rounded-xl"
                      onClick={() => {
                        const subject = "Hypnotherapy Session Booking";
                        const body = `I'm ready to begin my transformation journey! My therapy quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@calmmindclinic.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🧠 Schedule Now
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-1"></div>
                        Clinical expertise
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-1"></div>
                        Proven methods
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-teal-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-stone-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
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