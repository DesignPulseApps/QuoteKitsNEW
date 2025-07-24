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
  FileText
} from "lucide-react";

interface PrivateTutorFormData {
  subject: string;
  studentLevel: string;
  sessionType: string;
  sessionFrequency: string;
  sessionDuration: string;
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
  levelAdjustment: number;
  typeAdjustment: number;
  durationAdjustment: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface PrivateTutorCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function PrivateTutorCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: PrivateTutorCalculatorProps = {}) {
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
  
  const [formData, setFormData] = useState<PrivateTutorFormData>({
    subject: "",
    studentLevel: "",
    sessionType: "",
    sessionFrequency: "",
    sessionDuration: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const subjects = [
    { id: "mathematics", label: "Mathematics", icon: "📊", popular: true },
    { id: "science", label: "Science", icon: "🔬", popular: true },
    { id: "english-languages", label: "English / Languages", icon: "📚", popular: true },
    { id: "coding-it", label: "Coding / IT", icon: "💻", popular: false },
    { id: "music", label: "Music", icon: "🎵", popular: false },
  ];

  const studentLevels = [
    { id: "primary", label: "Primary / Elementary", adjustment: 0, icon: "🎒", popular: true },
    { id: "secondary", label: "Secondary / High School", adjustment: 10, icon: "📖", popular: true },
    { id: "university", label: "College / University", adjustment: 15, icon: "🎓", popular: false },
    { id: "adult", label: "Adult Learner", adjustment: 12, icon: "👩‍💼", popular: false },
  ];

  const sessionTypes = [
    { id: "online", label: "Online", adjustment: 0, icon: "💻", popular: true },
    { id: "student-home", label: "In-Person (Student's Home)", adjustment: 10, icon: "🏠", popular: false },
    { id: "tutor-home", label: "In-Person (Tutor's Home)", adjustment: 5, icon: "🏫", popular: false },
  ];

  const sessionFrequencies = [
    { id: "one-off", label: "One-off", multiplier: 1, icon: "⏱️", popular: false },
    { id: "weekly", label: "Weekly", multiplier: 1, icon: "📅", popular: true },
    { id: "twice-weekly", label: "Twice per week", multiplier: 1.9, icon: "🗓️", popular: true },
    { id: "intensive", label: "Intensive (3+ per week)", multiplier: 2.7, icon: "🚀", popular: false },
  ];

  const sessionDurations = [
    { id: "30min", label: "30 min", basePrice: 25, icon: "⏰", popular: false },
    { id: "60min", label: "60 min", basePrice: 30, icon: "🕐", popular: true },
    { id: "90min", label: "90 min", basePrice: 40, icon: "🕕", popular: false },
  ];

  const addOnOptions = [
    { id: "exam-materials", label: "Exam Prep Materials", price: 10, popular: true, description: "Practice tests and study guides" },
    { id: "progress-reports", label: "Progress Reports", price: 15, popular: true, description: "Weekly detailed progress tracking" },
    { id: "homework-support", label: "Homework Support", price: 10, popular: false, description: "Additional homework help between sessions" },
    { id: "emergency-booking", label: "Emergency Same-Day Booking", price: 25, popular: false, description: "Last-minute session availability" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const duration = sessionDurations.find(d => d.id === formData.sessionDuration);
    const level = studentLevels.find(l => l.id === formData.studentLevel);
    const type = sessionTypes.find(t => t.id === formData.sessionType);
    const frequency = sessionFrequencies.find(f => f.id === formData.sessionFrequency);

    const basePrice = duration?.basePrice || customConfig?.basePrice || 30;
    const levelAdjustment = level?.adjustment || 0;
    const typeAdjustment = type?.adjustment || 0;
    const durationAdjustment = 0;

    let addOnsTotal = 0;
    const breakdown: string[] = [];

    // Base session price
    breakdown.push(`${duration?.label || '60 min'} session base: €${basePrice}`);
    
    // Level adjustment
    if (levelAdjustment > 0) {
      breakdown.push(`${level?.label} level: +€${levelAdjustment}`);
    }
    
    // Session type adjustment
    if (typeAdjustment > 0) {
      breakdown.push(`${type?.label}: +€${typeAdjustment}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        breakdown.push(`${addOn.label}: +€${addOn.price}`);
        addOnsTotal += addOn.price;
      }
    });

    let sessionTotal = basePrice + levelAdjustment + typeAdjustment + addOnsTotal;
    
    // Apply frequency multiplier
    const frequencyMultiplier = frequency?.multiplier || 1;
    if (frequencyMultiplier !== 1) {
      breakdown.push(`${frequency?.label} discount: ×${frequencyMultiplier}`);
    }

    let subtotal = sessionTotal * frequencyMultiplier;

    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "learn10" || formData.promoCode.toLowerCase() === "study10") {
      promoDiscount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${promoDiscount.toFixed(2)}`);
    }

    const total = Math.max(0, subtotal - promoDiscount);

    return {
      basePrice,
      levelAdjustment,
      typeAdjustment,
      durationAdjustment,
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

    // Parse subject
    if (input.includes("math") || input.includes("calculus") || input.includes("algebra")) newFormData.subject = "mathematics";
    else if (input.includes("science") || input.includes("physics") || input.includes("chemistry") || input.includes("biology")) newFormData.subject = "science";
    else if (input.includes("english") || input.includes("language") || input.includes("writing")) newFormData.subject = "english-languages";
    else if (input.includes("coding") || input.includes("programming") || input.includes("computer")) newFormData.subject = "coding-it";
    else if (input.includes("music") || input.includes("piano") || input.includes("violin")) newFormData.subject = "music";
    else newFormData.subject = "mathematics";

    // Parse student level
    if (input.includes("primary") || input.includes("elementary") || input.includes("young")) newFormData.studentLevel = "primary";
    else if (input.includes("secondary") || input.includes("high school") || input.includes("teenager") || input.includes("14-year-old")) newFormData.studentLevel = "secondary";
    else if (input.includes("university") || input.includes("college") || input.includes("degree")) newFormData.studentLevel = "university";
    else if (input.includes("adult")) newFormData.studentLevel = "adult";
    else newFormData.studentLevel = "secondary";

    // Parse session type
    if (input.includes("home") || input.includes("in-person") || input.includes("face-to-face")) newFormData.sessionType = "student-home";
    else if (input.includes("online") || input.includes("zoom") || input.includes("virtual")) newFormData.sessionType = "online";
    else newFormData.sessionType = "online";

    // Parse frequency
    if (input.includes("weekly") || input.includes("once a week")) newFormData.sessionFrequency = "weekly";
    else if (input.includes("twice") || input.includes("two times")) newFormData.sessionFrequency = "twice-weekly";
    else if (input.includes("intensive") || input.includes("daily")) newFormData.sessionFrequency = "intensive";
    else if (input.includes("one-off") || input.includes("single")) newFormData.sessionFrequency = "one-off";
    else newFormData.sessionFrequency = "weekly";

    // Parse duration
    if (input.includes("30 min") || input.includes("half hour")) newFormData.sessionDuration = "30min";
    else if (input.includes("90 min") || input.includes("hour and half")) newFormData.sessionDuration = "90min";
    else newFormData.sessionDuration = "60min";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("exam") || input.includes("test") || input.includes("materials")) newAddOns.push("exam-materials");
    if (input.includes("progress") || input.includes("report")) newAddOns.push("progress-reports");
    if (input.includes("homework") || input.includes("support")) newAddOns.push("homework-support");
    if (input.includes("emergency") || input.includes("urgent") || input.includes("same-day")) newAddOns.push("emergency-booking");
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
          ? "border-slate-400 bg-slate-50 shadow-lg" 
          : "border-stone-200 hover:border-slate-200 bg-white hover:bg-slate-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs font-light">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-slate-800" : "text-stone-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 font-medium ${selected ? "text-slate-600" : "text-stone-500"}`}>
            €{option.basePrice}
          </div>
        )}
        {option.adjustment !== undefined && option.adjustment > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-slate-600" : "text-stone-500"}`}>
            +€{option.adjustment}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-slate-600" : "text-stone-500"}`}>
            +€{option.price}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Subject & Level", completed: !!formData.subject && !!formData.studentLevel },
    { number: 2, title: "Session Details", completed: !!formData.sessionType && !!formData.sessionDuration },
    { number: 3, title: "Frequency & Add-ons", completed: !!formData.sessionFrequency },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-25 via-stone-50 to-blue-25">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-slate-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-slate-600 text-white"
                          : currentStep === step.number
                          ? "bg-slate-500 text-white"
                          : "bg-stone-300 text-stone-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Subject & Level */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-slate-800 mb-4 flex items-center">
                      <BookOpen className="h-6 w-6 mr-2 text-slate-600" />
                      <EditableText
                        value={textConfig.step1Title || "Subject and student level"}
                        onSave={(value) => updateTextContent('step1Title', value)}
                        className="text-2xl font-medium text-slate-800"
                        isPreview={isPreview}
                      />
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <EditableText
                          value={textConfig.naturalLanguageLabel || "Describe your tutoring needs (optional)"}
                          onSave={(value) => updateTextContent('naturalLanguageLabel', value)}
                          className="text-sm font-medium text-slate-700"
                          isPreview={isPreview}
                        />
                      </label>
                      <Textarea
                        placeholder="e.g., I need weekly math help for my 14-year-old at home"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-slate-200 text-slate-800 mb-3 resize-none placeholder:text-slate-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-slate-700 mb-3">
                          <EditableText
                            value={textConfig.subjectLabel || "Subject"}
                            onSave={(value) => updateTextContent('subjectLabel', value)}
                            className="text-lg font-medium text-slate-700"
                            isPreview={isPreview}
                          />
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {subjects.map((subject) => (
                            <OptionCard
                              key={subject.id}
                              option={subject}
                              selected={formData.subject === subject.id}
                              onClick={() => setFormData(prev => ({ ...prev, subject: subject.id }))}
                              icon={subject.icon}
                              popular={subject.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-slate-700 mb-3">
                          <EditableText
                            value={textConfig.studentLevelLabel || "Student Level"}
                            onSave={(value) => updateTextContent('studentLevelLabel', value)}
                            className="text-lg font-medium text-slate-700"
                            isPreview={isPreview}
                          />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentLevels.map((level) => (
                            <OptionCard
                              key={level.id}
                              option={level}
                              selected={formData.studentLevel === level.id}
                              onClick={() => setFormData(prev => ({ ...prev, studentLevel: level.id }))}
                              icon={level.icon}
                              popular={level.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.subject || !formData.studentLevel}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 font-medium rounded-xl"
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

              {/* Step 2: Session Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium text-slate-800 mb-4 flex items-center">
                      <Monitor className="h-6 w-6 mr-2 text-slate-600" />
                      Session type and duration
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-slate-700 mb-3">Session Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {sessionTypes.map((type) => (
                            <OptionCard
                              key={type.id}
                              option={type}
                              selected={formData.sessionType === type.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionType: type.id }))}
                              icon={type.icon}
                              popular={type.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-slate-700 mb-3">Session Duration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {sessionDurations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.sessionDuration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionDuration: duration.id }))}
                              icon={duration.icon}
                              popular={duration.popular}
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
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.sessionType || !formData.sessionDuration}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 font-medium rounded-xl"
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
                    <h2 className="text-2xl font-medium text-slate-800 mb-4 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-slate-600" />
                      Frequency and enhancement options
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-slate-700 mb-3">Session Frequency</h3>
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
                        <h3 className="text-lg font-medium text-slate-700 mb-3">Enhancement Add-Ons (Optional)</h3>
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
                                  ? "border-slate-400 bg-slate-50 shadow-lg text-slate-800"
                                  : "border-stone-200 hover:border-slate-200 bg-white text-slate-700 hover:bg-slate-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs font-medium">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className="text-xs text-slate-500 mt-1"><EditableText value={addOn.description} onSave={() => {}} /></div>
                                </div>
                                <div className={`font-medium ml-4 ${formData.addOns.includes(addOn.id) ? "text-slate-600" : "text-slate-500"}`}>
                                  €{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.subject === "mathematics" && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="text-sm text-blue-800">
                              📊 Math students often benefit from: Progress Reports + Exam Prep Materials
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
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.sessionFrequency}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 font-medium rounded-xl"
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
                    <h2 className="text-2xl font-medium text-slate-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-slate-600" />
                      Get your tutoring quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Promo Code (Optional)
                        </label>
                        <Input
                          placeholder="Enter promo code (e.g., LEARN10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 font-medium rounded-xl"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-medium text-slate-800 mb-4">
                <EditableText
                  value={textConfig.pricingSidebarTitle || "Your Tutoring Investment"}
                  onSave={(value) => updateTextContent('pricingSidebarTitle', value)}
                  className="text-xl font-medium text-slate-800"
                  isPreview={isPreview}
                />
              </h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-medium text-slate-700">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600 font-light">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-slate-700"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.promoDiscount > 0 && (
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-medium text-slate-800">
                        <span>Total</span>
                        <span className="text-slate-700">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ready to Start Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">
                      <EditableText
                        value={textConfig.ctaTitle || "Start your learning journey"}
                        onSave={(value) => updateTextContent('ctaTitle', value)}
                        className="text-lg font-medium text-slate-800"
                        isPreview={isPreview}
                      />
                    </h3>
                    <p className="text-sm text-slate-600 font-light">
                      <EditableText
                        value={textConfig.ctaDescription || "This quote is valid for 72 hours. Expert tutoring tailored to your academic goals."}
                        onSave={(value) => updateTextContent('ctaDescription', value)}
                        className="text-sm text-slate-600 font-light"
                        isPreview={isPreview}
                      />
                    </p>
                    
                    <Button 
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 font-medium rounded-xl"
                      onClick={() => {
                        const subject = "Tutoring Session Booking";
                        const body = `I'm ready to start learning! My tutoring quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@mathmastervienna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      📚 Schedule a Trial
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-400 rounded-full mr-1"></div>
                        Expert tutors
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-600 rounded-full mr-1"></div>
                        Proven results
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-slate-700 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
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