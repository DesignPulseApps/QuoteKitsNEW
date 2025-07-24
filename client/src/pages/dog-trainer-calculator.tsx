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
  BookOpen,
  GraduationCap,
  Monitor,
  Home,
  Zap,
  FileText,
  MapPin
} from "lucide-react";

interface DogTrainerFormData {
  dogAge: string;
  dogSize: string;
  trainingType: string;
  sessionFormat: string;
  sessionFrequency: string;
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
  sizeAdjustment: number;
  typeAdjustment: number;
  formatAdjustment: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface DogTrainerCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function DogTrainerCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: DogTrainerCalculatorProps = {}) {
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
  
  const [formData, setFormData] = useState<DogTrainerFormData>({
    dogAge: "",
    dogSize: "",
    trainingType: "",
    sessionFormat: "",
    sessionFrequency: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const dogAges = [
    { id: "puppy", label: "Puppy (<1yr)", adjustment: 0, icon: "🐶", popular: true },
    { id: "adult", label: "Adult (1–7yrs)", adjustment: 0, icon: "🐕", popular: true },
    { id: "senior", label: "Senior (8+ yrs)", adjustment: 5, icon: "🐕‍🦺", popular: false },
  ];

  const dogSizes = [
    { id: "small", label: "Small", adjustment: 0, icon: "🐾", popular: false },
    { id: "medium", label: "Medium", adjustment: 5, icon: "🐾", popular: true },
    { id: "large", label: "Large", adjustment: 10, icon: "🐾", popular: true },
    { id: "xl", label: "XL", adjustment: 15, icon: "🐾", popular: false },
  ];

  const trainingTypes = [
    { id: "basic-obedience", label: "Basic Obedience", adjustment: 0, icon: "🎯", popular: true },
    { id: "puppy-socialization", label: "Puppy Socialization", adjustment: 0, icon: "🐶", popular: true },
    { id: "behavioral-correction", label: "Behavioral Correction", adjustment: 30, icon: "🔧", popular: false },
    { id: "leash-training", label: "Leash Training", adjustment: 10, icon: "🦮", popular: true },
    { id: "protection-k9", label: "Protection / Advanced K9", adjustment: 50, icon: "🛡️", popular: false },
  ];

  const sessionFormats = [
    { id: "one-on-one", label: "One-on-One", adjustment: 0, icon: "👤", popular: true },
    { id: "group-class", label: "Group Class", adjustment: -15, icon: "👥", popular: true },
    { id: "at-home", label: "At Owner's Home", adjustment: 20, icon: "🏠", popular: false },
    { id: "trainer-location", label: "At Trainer's Location", adjustment: 5, icon: "🏫", popular: false },
    { id: "online", label: "Online (Virtual Coaching)", adjustment: -10, icon: "💻", popular: false },
  ];

  const sessionFrequencies = [
    { id: "one-off", label: "One-off", multiplier: 1, icon: "⏱️", popular: false },
    { id: "weekly", label: "Weekly", multiplier: 1, icon: "📅", popular: true },
    { id: "twice-weekly", label: "2x per week", multiplier: 1.9, icon: "🗓️", popular: true },
    { id: "full-program", label: "Full Program (6+ Sessions)", multiplier: 5.5, icon: "📚", popular: false },
  ];

  const addOnOptions = [
    { id: "training-plan", label: "Written Training Plan", price: 15, popular: true, description: "Customized step-by-step training guide" },
    { id: "progress-report", label: "Progress Report", price: 12, popular: true, description: "Weekly progress tracking and updates" },
    { id: "leash-collar-package", label: "Leash/Collar Package", price: 25, popular: false, description: "Professional training equipment" },
    { id: "emergency-weekend", label: "Emergency Weekend Session", price: 35, popular: false, description: "Priority weekend availability" },
    { id: "travel-to-client", label: "Travel to Client", price: 20, popular: false, description: "Transportation to your location" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const basePrice = customConfig?.basePrice || 40; // Base price for 60min one-on-one obedience training
    
    const age = dogAges.find(a => a.id === formData.dogAge);
    const size = dogSizes.find(s => s.id === formData.dogSize);
    const type = trainingTypes.find(t => t.id === formData.trainingType);
    const format = sessionFormats.find(f => f.id === formData.sessionFormat);
    const frequency = sessionFrequencies.find(f => f.id === formData.sessionFrequency);

    const sizeAdjustment = size?.adjustment || 0;
    const typeAdjustment = type?.adjustment || 0;
    const formatAdjustment = format?.adjustment || 0;
    const ageAdjustment = age?.adjustment || 0;

    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base session price
    breakdown.push(`Base training session: €${basePrice}`);
    
    // Age adjustment
    if (ageAdjustment > 0) {
      breakdown.push(`${age?.label} adjustment: +€${ageAdjustment}`);
    }
    
    // Size adjustment
    if (sizeAdjustment > 0) {
      breakdown.push(`${size?.label} size: +€${sizeAdjustment}`);
    }
    
    // Training type adjustment
    if (typeAdjustment > 0) {
      breakdown.push(`${type?.label}: +€${typeAdjustment}`);
    }
    
    // Format adjustment
    if (formatAdjustment !== 0) {
      const adjustment = formatAdjustment > 0 ? `+€${formatAdjustment}` : `-€${Math.abs(formatAdjustment)}`;
      breakdown.push(`${format?.label}: ${adjustment}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        breakdown.push(`${addOn.label}: +€${addOn.price}`);
        addOnsTotal += addOn.price;
      }
    });

    let sessionTotal = basePrice + ageAdjustment + sizeAdjustment + typeAdjustment + formatAdjustment + addOnsTotal;
    
    // Apply frequency multiplier
    const frequencyMultiplier = frequency?.multiplier || 1;
    if (frequencyMultiplier !== 1) {
      breakdown.push(`${frequency?.label} package: ×${frequencyMultiplier}`);
    }

    let subtotal = sessionTotal * frequencyMultiplier;

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "paws10" || formData.promoCode.toLowerCase() === "train10") {
      promoDiscount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${promoDiscount.toFixed(2)}`);
    }

    const total = Math.max(0, subtotal - promoDiscount);

    return {
      basePrice,
      sizeAdjustment,
      typeAdjustment,
      formatAdjustment,
      addOnsTotal,
      subtotal,
      promoDiscount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse dog age
    if (input.includes("puppy") || input.includes("young") || input.includes("months old")) newFormData.dogAge = "puppy";
    else if (input.includes("senior") || input.includes("old") || input.includes("8") || input.includes("9") || input.includes("10")) newFormData.dogAge = "senior";
    else newFormData.dogAge = "adult";

    // Parse dog size
    if (input.includes("lab") || input.includes("labrador") || input.includes("large") || input.includes("big")) newFormData.dogSize = "large";
    else if (input.includes("chihuahua") || input.includes("small") || input.includes("tiny")) newFormData.dogSize = "small";
    else if (input.includes("xl") || input.includes("giant") || input.includes("mastiff")) newFormData.dogSize = "xl";
    else newFormData.dogSize = "medium";

    // Parse training type
    if (input.includes("leash") || input.includes("pulling") || input.includes("walk")) newFormData.trainingType = "leash-training";
    else if (input.includes("behavior") || input.includes("aggressive") || input.includes("correction")) newFormData.trainingType = "behavioral-correction";
    else if (input.includes("puppy") || input.includes("social")) newFormData.trainingType = "puppy-socialization";
    else if (input.includes("protection") || input.includes("guard") || input.includes("advanced")) newFormData.trainingType = "protection-k9";
    else newFormData.trainingType = "basic-obedience";

    // Parse session format
    if (input.includes("home") || input.includes("house") || input.includes("at my")) newFormData.sessionFormat = "at-home";
    else if (input.includes("group") || input.includes("class")) newFormData.sessionFormat = "group-class";
    else if (input.includes("online") || input.includes("virtual") || input.includes("zoom")) newFormData.sessionFormat = "online";
    else newFormData.sessionFormat = "one-on-one";

    // Parse frequency
    if (input.includes("one-off") || input.includes("single") || input.includes("once")) newFormData.sessionFrequency = "one-off";
    else if (input.includes("twice") || input.includes("2x") || input.includes("two times")) newFormData.sessionFrequency = "twice-weekly";
    else if (input.includes("program") || input.includes("package") || input.includes("course")) newFormData.sessionFrequency = "full-program";
    else newFormData.sessionFrequency = "weekly";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("plan") || input.includes("guide")) newAddOns.push("training-plan");
    if (input.includes("progress") || input.includes("report")) newAddOns.push("progress-report");
    if (input.includes("leash") || input.includes("collar") || input.includes("equipment")) newAddOns.push("leash-collar-package");
    if (input.includes("emergency") || input.includes("weekend") || input.includes("urgent")) newAddOns.push("emergency-weekend");
    if (input.includes("travel") || input.includes("come to")) newAddOns.push("travel-to-client");
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
          ? "border-blue-300 bg-blue-50 shadow-lg" 
          : "border-stone-200 hover:border-blue-200 bg-white hover:bg-blue-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-blue-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.adjustment !== undefined && option.adjustment > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-stone-500"}`}>
            +€{option.adjustment}
          </div>
        )}
        {option.adjustment !== undefined && option.adjustment < 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-stone-500"}`}>
            -€{Math.abs(option.adjustment)}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-stone-500"}`}>
            +€{option.price}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Dog Info", completed: !!formData.dogAge && !!formData.dogSize },
    { number: 2, title: "Training Details", completed: !!formData.trainingType && !!formData.sessionFormat },
    { number: 3, title: "Frequency & Add-ons", completed: !!formData.sessionFrequency },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-stone-50 to-green-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-400 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-stone-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-blue-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Dog Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2 text-blue-500" />
                      <EditableText
                        value={textConfig.step1Title || "Tell us about your dog"}
                        onSave={(value) => updateTextContent('step1Title', value)}
                        className="text-2xl font-medium text-stone-800"
                        isPreview={isPreview}
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <EditableText
                          value={textConfig.naturalLanguageLabel || "Describe your training needs (optional)"}
                          onSave={(value) => updateTextContent('naturalLanguageLabel', value)}
                          className="text-sm font-medium text-stone-700"
                          isPreview={isPreview}
                        />
                      </label>
                      <Textarea
                        placeholder="e.g., I need help with leash pulling for my 2-year-old lab at home"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-blue-200 text-stone-800 mb-3 resize-none placeholder:text-stone-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">
                          <EditableText
                            value={textConfig.dogAgeLabel || "Dog's Age"}
                            onSave={(value) => updateTextContent('dogAgeLabel', value)}
                            className="text-lg font-medium text-stone-700"
                            isPreview={isPreview}
                          />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {dogAges.map((age) => (
                            <OptionCard
                              key={age.id}
                              option={age}
                              selected={formData.dogAge === age.id}
                              onClick={() => setFormData(prev => ({ ...prev, dogAge: age.id }))}
                              icon={age.icon}
                              popular={age.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">
                          <EditableText
                            value={textConfig.dogSizeLabel || "Dog's Size"}
                            onSave={(value) => updateTextContent('dogSizeLabel', value)}
                            className="text-lg font-medium text-stone-700"
                            isPreview={isPreview}
                          />
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {dogSizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.dogSize === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, dogSize: size.id }))}
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
                      disabled={!formData.dogAge || !formData.dogSize}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 font-medium rounded-xl"
                    >
                      <EditableText
                        value={textConfig.nextButtonText || "Next Step"}
                        onSave={(value) => updateTextContent('nextButtonText', value)}
                        className="font-medium"
                        isPreview={isPreview}
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Training Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Target className="h-6 w-6 mr-2 text-blue-500" />
                      Training type and format
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Training Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={!formData.trainingType || !formData.sessionFormat}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 font-medium rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Frequency & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-stone-800 mb-4 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-blue-500" />
                      Frequency and enhancement options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-stone-700 mb-3">Session Frequency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sessionFrequencies.map((frequency) => (
                            <OptionCard
                              key={frequency.id}
                              option={frequency}
                              selected={formData.sessionFrequency === frequency.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionFrequency: frequency.id }))}
                              icon={frequency.icon}
                              popular={frequency.popular}
                            />
                          ))}
                        </div>
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
                                  ? "border-blue-400 bg-blue-50 shadow-lg text-stone-800"
                                  : "border-stone-200 hover:border-blue-200 bg-white text-stone-700 hover:bg-blue-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-stone-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-medium ml-4 ${formData.addOns.includes(addOn.id) ? "text-blue-600" : "text-stone-500"}`}>
                                  €{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.dogAge === "puppy" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-800">
                              🐶 Puppy recommendation: Socialization + Written Training Plan for best results
                            </div>
                          </div>
                        )}
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
                      disabled={!formData.sessionFrequency}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 font-medium rounded-xl"
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
                      <Mail className="h-6 w-6 mr-2 text-blue-500" />
                      Get your training quote
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

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Promo Code (Optional)
                        </label>
                        <Input
                          placeholder="Enter promo code (e.g., PAWS10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 rounded-xl"
                        />
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
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 font-medium rounded-xl"
                    >
                      <EditableText
                        value={textConfig.getQuoteButtonText || "Get Quote"}
                        onSave={(value) => updateTextContent('getQuoteButtonText', value)}
                        className="font-medium"
                        isPreview={isPreview}
                      />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-medium text-stone-800 mb-4">
                <EditableText
                  value={textConfig.pricingSidebarTitle || "Your Training Investment"}
                  onSave={(value) => updateTextContent('pricingSidebarTitle', value)}
                  className="text-xl font-medium text-stone-800"
                  isPreview={isPreview}
                />
              </h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-medium text-blue-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-stone-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-blue-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.promoDiscount > 0 && (
                      <div className="border-t border-stone-200 pt-2 flex justify-between font-medium text-stone-800">
                        <span>Total</span>
                        <span className="text-blue-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-stone-800">
                      <EditableText
                        value={textConfig.ctaTitle || "Start your dog's journey"}
                        onSave={(value) => updateTextContent('ctaTitle', value)}
                        className="text-lg font-medium text-stone-800"
                        isPreview={isPreview}
                      />
                    </h3>
                    <p className="text-sm text-stone-600 font-light">
                      <EditableText
                        value={textConfig.ctaDescription || "This quote is valid for 48 hours. Professional training that builds confidence and bonds."}
                        onSave={(value) => updateTextContent('ctaDescription', value)}
                        className="text-sm text-slate-600 font-light"
                        isPreview={isPreview}
                      />
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 font-medium rounded-xl"
                      onClick={() => {
                        const subject = "Dog Training Session Booking";
                        const body = `I'm ready to start my dog's training journey! My training quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@smartpawsacademy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🐕 Schedule My Session
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                        Expert trainers
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Proven methods
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-blue-600 mb-2">Quote Locked!</div>
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