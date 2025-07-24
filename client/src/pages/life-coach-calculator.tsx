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
  Target,
  TrendingUp,
  BookOpen,
  Video,
  MessageCircle,
  Award,
  Compass,
  Lightbulb
} from "lucide-react";

interface LifeCoachFormData {
  coachingFocus: string;
  sessionFormat: string;
  programDuration: string;
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

interface LifeCoachCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function LifeCoachCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: LifeCoachCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<LifeCoachFormData>({
    coachingFocus: "",
    sessionFormat: "",
    programDuration: "",
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

  const coachingFocus = [
    { id: "personal-growth", label: "Personal Growth", icon: "🌱", popular: true },
    { id: "career-coaching", label: "Career Coaching", icon: "💼", popular: true },
    { id: "confidence-building", label: "Confidence Building", icon: "✨", popular: true },
    { id: "relationship-coaching", label: "Relationship Coaching", icon: "💕", popular: false },
    { id: "life-purpose", label: "Life Purpose / Direction", icon: "🧭", popular: false },
  ];

  const sessionFormats = [
    { id: "zoom-coaching", label: "1:1 Zoom Coaching", basePrice: 0, icon: "💻", popular: true },
    { id: "group-sessions", label: "Group Sessions", basePrice: -30, icon: "👥", popular: false },
    { id: "in-person", label: "In-person (Local)", basePrice: 40, icon: "🤝", popular: false },
    { id: "asynchronous", label: "Asynchronous (Voxer/Email)", basePrice: -20, icon: "📱", popular: false },
  ];

  const programDurations = [
    { id: "one-off", label: "One-off Session", basePrice: 80, icon: "⏱️", popular: false },
    { id: "4-week", label: "4-Week Coaching Plan", basePrice: 280, icon: "📅", popular: true },
    { id: "8-week", label: "8-Week Coaching Plan", basePrice: 480, icon: "🗓️", popular: true },
    { id: "monthly", label: "Ongoing Monthly", basePrice: 150, icon: "🔄", popular: false },
  ];

  const addOnOptions = [
    { id: "accountability-checkins", label: "Accountability Check-ins (Weekly)", price: 20, popular: true, description: "Weekly progress check-ins via video call" },
    { id: "worksheets", label: "Personalized Worksheets", price: 30, popular: true, description: "Custom worksheets tailored to your goals" },
    { id: "video-resources", label: "Access to Recorded Resources", price: 40, popular: false, description: "Library of coaching video content" },
    { id: "whatsapp-support", label: "WhatsApp Support", price: 15, popular: true, description: "Weekly support via WhatsApp messaging" },
    { id: "discovery-call", label: "Discovery Call", price: 0, popular: false, description: "Free 30-minute strategy session" },
  ];

  const clientTypes = [
    { id: "new", label: "New Client", discount: 0 },
    { id: "returning", label: "Returning Client", discount: 0.1 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const duration = programDurations.find(p => p.id === formData.programDuration);
    const format = sessionFormats.find(f => f.id === formData.sessionFormat);

    const basePrice = (duration?.basePrice || customConfig?.basePrice || 120) + (format?.basePrice || 0);
    
    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base plan
    breakdown.push(`${duration?.label || 'Base plan'}: €${duration?.basePrice || 0}`);
    
    // Session format adjustment
    if (format && format.basePrice !== 0) {
      const adjustment = format.basePrice > 0 ? `+€${format.basePrice}` : `-€${Math.abs(format.basePrice)}`;
      breakdown.push(`${format.label} adjustment: ${adjustment}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        let addOnPrice = addOn.price;
        
        // Weekly add-ons for longer plans
        if ((addOn.id === "whatsapp-support" || addOn.id === "accountability-checkins") && formData.programDuration !== "one-off") {
          const weeks = formData.programDuration === "4-week" ? 4 : formData.programDuration === "8-week" ? 8 : 4;
          addOnPrice = addOn.price * weeks;
          breakdown.push(`${addOn.label} (${weeks} weeks): €${addOnPrice}`);
        } else if (addOn.price > 0) {
          breakdown.push(`${addOn.label}: €${addOnPrice}`);
        } else {
          breakdown.push(`${addOn.label}: Free`);
        }
        
        addOnsTotal += addOnPrice;
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
    if (formData.promoCode.toLowerCase() === "growth10" || formData.promoCode.toLowerCase() === "journey10") {
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

    // Parse coaching focus
    if (input.includes("career") || input.includes("job")) newFormData.coachingFocus = "career-coaching";
    else if (input.includes("confidence") || input.includes("self-esteem")) newFormData.coachingFocus = "confidence-building";
    else if (input.includes("relationship") || input.includes("dating")) newFormData.coachingFocus = "relationship-coaching";
    else if (input.includes("purpose") || input.includes("direction")) newFormData.coachingFocus = "life-purpose";
    else newFormData.coachingFocus = "personal-growth";

    // Parse session format
    if (input.includes("group")) newFormData.sessionFormat = "group-sessions";
    else if (input.includes("in-person") || input.includes("local")) newFormData.sessionFormat = "in-person";
    else if (input.includes("voxer") || input.includes("email") || input.includes("asynchronous")) newFormData.sessionFormat = "asynchronous";
    else newFormData.sessionFormat = "zoom-coaching";

    // Parse program duration
    if (input.includes("one-off") || input.includes("single")) newFormData.programDuration = "one-off";
    else if (input.includes("4-week") || input.includes("4 week") || input.includes("month")) newFormData.programDuration = "4-week";
    else if (input.includes("8-week") || input.includes("8 week") || input.includes("two month")) newFormData.programDuration = "8-week";
    else if (input.includes("monthly") || input.includes("ongoing")) newFormData.programDuration = "monthly";
    else newFormData.programDuration = "4-week";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("worksheet") || input.includes("workbook")) newAddOns.push("worksheets");
    if (input.includes("check-in") || input.includes("accountability")) newAddOns.push("accountability-checkins");
    if (input.includes("whatsapp") || input.includes("chat")) newAddOns.push("whatsapp-support");
    if (input.includes("video") || input.includes("resource")) newAddOns.push("video-resources");
    if (input.includes("discovery") || input.includes("consultation")) newAddOns.push("discovery-call");
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
          ? "border-purple-300 bg-purple-50 shadow-lg" 
          : "border-stone-200 hover:border-purple-200 bg-white hover:bg-purple-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-purple-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-purple-600" : "text-stone-500"}`}>
            {option.basePrice === 0 ? "Base" : option.basePrice > 0 ? `+€${option.basePrice}` : `-€${Math.abs(option.basePrice)}`}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-purple-600" : "text-stone-500"}`}>
            {option.price === 0 ? "Free" : `+€${option.price}`}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Focus & Format", completed: !!formData.coachingFocus && !!formData.sessionFormat },
    { number: 2, title: "Duration & Add-ons", completed: !!formData.programDuration },
    { number: 3, title: "Client Details", completed: !!formData.clientType },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-stone-50 to-green-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-purple-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-purple-500 text-white"
                          : currentStep === step.number
                          ? "bg-purple-400 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-purple-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Focus & Format */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Compass className="h-6 w-6 mr-2 text-purple-500" />
                      Your coaching focus and format
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Describe your coaching needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I want 4 weeks of confidence coaching with worksheets and check-ins"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-purple-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-purple-500 hover:bg-purple-600 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Coaching Focus</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {coachingFocus.map((focus) => (
                            <OptionCard
                              key={focus.id}
                              option={focus}
                              selected={formData.coachingFocus === focus.id}
                              onClick={() => setFormData(prev => ({ ...prev, coachingFocus: focus.id }))}
                              icon={focus.icon}
                              popular={focus.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Session Format</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={!formData.coachingFocus || !formData.sessionFormat}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Duration & Add-ons */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-purple-500" />
                      Program duration and support options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Program Duration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {programDurations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.programDuration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, programDuration: duration.id }))}
                              icon={duration.icon}
                              popular={duration.popular}
                            />
                          ))}
                        </div>
                        
                        {formData.coachingFocus === "career-coaching" && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="text-sm text-purple-800">
                              💼 Recommended: 4-Week Plan + Worksheets for career transition success
                            </div>
                          </div>
                        )}
                        
                        {formData.coachingFocus === "relationship-coaching" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-800">
                              💕 Suggested: Start with a Discovery Call to explore your relationship goals
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
                                  ? "border-purple-400 bg-purple-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-purple-200 bg-white text-stone-700 hover:bg-purple-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-stone-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-medium ml-4 ${formData.addOns.includes(addOn.id) ? "text-purple-600" : "text-stone-500"}`}>
                                  {(addOn.id === "whatsapp-support" || addOn.id === "accountability-checkins") && formData.programDuration !== "one-off"
                                    ? `€${addOn.price}/week`
                                    : addOn.price === 0 ? "Free" : `€${addOn.price}`
                                  }
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.programDuration === "8-week" && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="text-sm text-yellow-800">
                              ⭐ Most clients choose: 8-Week Plan + WhatsApp Support for best results
                            </div>
                          </div>
                        )}
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
                      disabled={!formData.programDuration}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-medium rounded-xl"
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
                      <Users className="h-6 w-6 mr-2 text-purple-500" />
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
                          placeholder="Enter promo code (e.g., GROWTH10)"
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
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-medium rounded-xl"
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
                      <Mail className="h-6 w-6 mr-2 text-purple-500" />
                      Get your coaching quote
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
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-medium rounded-xl"
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
            <Card id="pricing-sidebar" className="p-6 bg-white/95 backdrop-blur-sm border-purple-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-medium text-stone-800 mb-4">Your Coaching Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-medium text-purple-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-purple-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {(pricing.returningDiscount > 0 || pricing.promoDiscount > 0) && (
                      <div className="border-t border-stone-200 pt-2 flex justify-between font-medium text-stone-800">
                        <span>Total</span>
                        <span className="text-purple-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-stone-800">Start your transformation journey</h3>
                    <p className="text-sm text-stone-600 font-light">
                      This quote is locked for 72 hours. Expert coaching guidance tailored to your goals.
                    </p>
                    
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 font-medium rounded-xl"
                      onClick={() => {
                        const subject = "Life Coaching Discovery Call";
                        const body = `I'm ready to start my transformation journey! My coaching quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@lifecoaching.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🌟 Book a Discovery Call
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                        Expert guidance
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                        Proven results
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-purple-600 mb-2">Quote Locked!</div>
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