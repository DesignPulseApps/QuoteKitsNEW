import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  Home, 
  CheckCircle,
  Calculator,
  User,
  Mail,
  Download,
  Timer,
  ChevronRight,
  BookOpen,
  Star,
  Award,
  Car,
  Utensils,
  Building,
  Shield,
  Globe,
  BrainCircuit,
  School,
  Baby
} from "lucide-react";

interface TuitionQuote {
  gradeLevel: string;
  enrollmentType: string;
  siblingStatus: string;
  addOns: string[];
  paymentPlan: string;
  promoCode: string;
  parentName: string;
  parentEmail: string;
  baseTuition: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    enrollmentAdjustment: number;
    siblingDiscount: number;
    addOnCosts: { name: string; amount: number }[];
    paymentFee: number;
    discounts: { name: string; amount: number }[];
  };
}

const gradeLevelOptions = [
  { 
    value: "pre-k", 
    label: "Pre-K / Kindergarten", 
    icon: Baby, 
    description: "Ages 3-5", 
    baseTuition: 5000,
    color: "bg-pink-100 text-pink-700"
  },
  { 
    value: "primary", 
    label: "Primary (1–5)", 
    icon: BookOpen, 
    description: "Elementary grades", 
    baseTuition: 7500,
    color: "bg-blue-100 text-blue-700"
  },
  { 
    value: "middle", 
    label: "Middle School (6–8)", 
    icon: School, 
    description: "Junior high grades", 
    baseTuition: 9000,
    color: "bg-green-100 text-green-700"
  },
  { 
    value: "high", 
    label: "High School (9–12)", 
    icon: GraduationCap, 
    description: "Senior grades", 
    baseTuition: 11000,
    color: "bg-purple-100 text-purple-700"
  }
];

const enrollmentTypeOptions = [
  { value: "full-time", label: "Full-Time", multiplier: 1.0, icon: Clock, description: "Regular full-day enrollment" },
  { value: "part-time", label: "Part-Time", multiplier: 0.7, icon: Clock, description: "Part-day or flexible schedule" },
  { value: "boarding", label: "Boarding", multiplier: 1.0, addOn: 8000, icon: Home, description: "Residential boarding program" },
  { value: "day-school", label: "Day School", multiplier: 1.0, icon: Building, description: "Traditional day school program" }
];

const siblingOptions = [
  { value: "first", label: "First Child", discount: 0, icon: User },
  { value: "second", label: "Second Child", discount: 0.10, icon: Users },
  { value: "third", label: "Third+ Child", discount: 0.15, icon: Users }
];

const addOnOptions = [
  { value: "aftercare", label: "After-School Care", cost: 900, icon: Clock, description: "Extended day supervision and activities" },
  { value: "lunch", label: "Lunch Plan", cost: 750, icon: Utensils, description: "Daily nutritious meals program" },
  { value: "transport", label: "Transportation", cost: 1200, icon: Car, description: "Daily bus transportation service" },
  { value: "ib-advanced", label: "IB / Advanced Curriculum", cost: 1500, icon: Award, description: "International Baccalaureate program" }
];

const paymentPlanOptions = [
  { value: "annual", label: "Annual", fee: 0, icon: Calendar, description: "Pay full year upfront" },
  { value: "quarterly", label: "Quarterly", fee: 0.02, icon: Calendar, description: "Pay in 4 installments" },
  { value: "monthly", label: "Monthly", fee: 0.05, icon: Calendar, description: "Monthly payment plan" }
];

interface PrivateSchoolCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function PrivateSchoolCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: PrivateSchoolCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
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
  
  const [formData, setFormData] = useState({
    gradeLevel: "",
    enrollmentType: "",
    siblingStatus: "",
    addOns: [] as string[],
    paymentPlan: "",
    promoCode: "",
    parentName: "",
    parentEmail: "",
    naturalLanguageInput: ""
  });
  const [quote, setQuote] = useState<TuitionQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showNLInput, setShowNLInput] = useState(false);
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [quoteValidTime, setQuoteValidTime] = useState(7 * 24 * 60 * 60); // 7 days in seconds

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Countdown timer for quote validity
  useEffect(() => {
    if (quote && quoteValidTime > 0) {
      const timer = setInterval(() => {
        setQuoteValidTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quote, quoteValidTime]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateQuote = () => {
    const gradeLevel = gradeLevelOptions.find(g => g.value === formData.gradeLevel);
    const enrollmentType = enrollmentTypeOptions.find(e => e.value === formData.enrollmentType);
    const siblingStatus = siblingOptions.find(s => s.value === formData.siblingStatus);
    const paymentPlan = paymentPlanOptions.find(p => p.value === formData.paymentPlan);
    
    if (!gradeLevel || !enrollmentType || !siblingStatus || !paymentPlan) return null;

    // Calculate base cost
    let baseCost = (gradeLevel.baseTuition || customConfig?.basePrice || 12000) * enrollmentType.multiplier;
    
    // Add boarding fee if applicable
    let enrollmentAdjustment = 0;
    if (enrollmentType.addOn) {
      enrollmentAdjustment = enrollmentType.addOn;
    }
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      return option && option.cost > 0 ? { name: option.label, amount: option.cost } : { name: "", amount: 0 };
    }).filter(a => a.name);

    // Apply sibling discount
    const siblingDiscount = (baseCost + enrollmentAdjustment) * siblingStatus.discount;
    
    // Apply payment plan fee
    const subtotal = baseCost + enrollmentAdjustment - siblingDiscount + addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const paymentFee = subtotal * paymentPlan.fee;
    
    // Apply discounts
    const discounts = [];
    
    // Promo code discount (15% off tuition)
    if (formData.promoCode.toLowerCase() === "scholarship15") {
      const promoDiscount = baseCost * 0.15;
      discounts.push({ name: "Scholarship Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + enrollmentAdjustment - siblingDiscount + totalAddOnCost + paymentFee - totalDiscounts;

    return {
      gradeLevel: formData.gradeLevel,
      enrollmentType: formData.enrollmentType,
      siblingStatus: formData.siblingStatus,
      addOns: formData.addOns,
      paymentPlan: formData.paymentPlan,
      promoCode: formData.promoCode,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      baseTuition: gradeLevel.baseTuition,
      totalCost: Math.round(totalCost * 100) / 100,
      breakdown: {
        baseCost: Math.round(baseCost * 100) / 100,
        enrollmentAdjustment: Math.round(enrollmentAdjustment * 100) / 100,
        siblingDiscount: Math.round(siblingDiscount * 100) / 100,
        addOnCosts,
        paymentFee: Math.round(paymentFee * 100) / 100,
        discounts
      }
    };
  };

  const processNaturalLanguage = async () => {
    if (!formData.naturalLanguageInput.trim()) return;
    
    setIsProcessingNL(true);
    try {
      const response = await fetch('/api/ai/process-privateschool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData.naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          gradeLevel: result.gradeLevel || prev.gradeLevel,
          enrollmentType: result.enrollmentType || prev.enrollmentType,
          siblingStatus: result.siblingStatus || prev.siblingStatus,
          addOns: result.addOns || prev.addOns,
          paymentPlan: result.paymentPlan || prev.paymentPlan,
          naturalLanguageInput: ""
        }));
        setShowNLInput(false);
      }
    } catch (error) {
      console.error("Error processing natural language:", error);
    } finally {
      setIsProcessingNL(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateQuote();
    }
  };

  const generateQuote = async () => {
    setIsGenerating(true);
    try {
      const calculatedQuote = calculateQuote();
      if (calculatedQuote) {
        setQuote(calculatedQuote);
        setShowEmailCapture(true);
        setQuoteValidTime(7 * 24 * 60 * 60); // Reset to 7 days
      }
    } catch (error) {
      console.error("Error generating quote:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddOnToggle = (addOn: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter(a => a !== addOn)
        : [...prev.addOns, addOn]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                <EditableText
                  value={textConfig.step1Title || "What grade level?"}
                  onSave={(value) => updateTextContent('step1Title', value)}
                  className="text-2xl font-bold text-slate-800"
                  isPreview={isPreview}
                />
              </h2>
              <p className="text-slate-600">
                <EditableText
                  value={textConfig.step1Description || "Select your child's current or intended grade level"}
                  onSave={(value) => updateTextContent('step1Description', value)}
                  className="text-slate-600"
                  isPreview={isPreview}
                />
              </p>
              
              <Button
                variant="outline"
                onClick={() => setShowNLInput(!showNLInput)}
                className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                <EditableText
                  value={textConfig.naturalLanguageButtonText || "Try Natural Language Input"}
                  onSave={(value) => updateTextContent('naturalLanguageButtonText', value)}
                  className="font-medium"
                  isPreview={isPreview}
                />
              </Button>
            </div>

            {showNLInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <Label className="text-sm font-medium text-slate-800 mb-2 block">
                  Describe your enrollment needs in plain English
                </Label>
                <Input
                  value={formData.naturalLanguageInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                  placeholder="e.g., My daughter is 10, full-time, with aftercare and lunch"
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={processNaturalLanguage}
                    disabled={isProcessingNL || !formData.naturalLanguageInput.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingNL ? "Processing..." : "Auto-fill Form"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNLInput(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="grid gap-4">
              {gradeLevelOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.gradeLevel === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, gradeLevel: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.gradeLevel === option.value ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.gradeLevel === option.value ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            €{option.baseTuition.toLocaleString()}/year
                          </Badge>
                          {formData.gradeLevel === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-2 ml-auto" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Enrollment type?</h2>
              <p className="text-slate-600">Choose the program that fits your needs</p>
            </div>
            
            <div className="grid gap-4">
              {enrollmentTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.enrollmentType === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, enrollmentType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.enrollmentType === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.enrollmentType === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                            <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                          </div>
                        </div>
                        <div className="text-right">
                          {option.addOn && (
                            <Badge variant="outline" className="mb-2">
                              +€{option.addOn.toLocaleString()}
                            </Badge>
                          )}
                          {option.multiplier < 1 && (
                            <Badge variant="outline" className="mb-2 border-green-300 text-green-700">
                              {Math.round((1 - option.multiplier) * 100)}% off
                            </Badge>
                          )}
                          {formData.enrollmentType === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Sibling enrollment?</h2>
              <p className="text-slate-600">Multiple children receive sibling discounts</p>
            </div>
            
            <div className="grid gap-4">
              {siblingOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.siblingStatus === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, siblingStatus: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.siblingStatus === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.siblingStatus === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.discount > 0 && (
                            <Badge variant="outline" className="mb-2 border-green-300 text-green-700">
                              {Math.round(option.discount * 100)}% discount
                            </Badge>
                          )}
                          {formData.siblingStatus === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Optional programs</h2>
              <p className="text-slate-600">Enhance your child's educational experience</p>
            </div>
            
            <div className="grid gap-4">
              {addOnOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.addOns.includes(option.value)
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleAddOnToggle(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.addOns.includes(option.value) ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.addOns.includes(option.value) ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                            <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            +€{option.cost.toLocaleString()}
                          </Badge>
                          {formData.addOns.includes(option.value) && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {formData.addOns.length === 0 && (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-600">No optional programs selected. You can skip this step or choose programs above.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment preference</h2>
              <p className="text-slate-600">Choose how you'd like to pay tuition</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {paymentPlanOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.paymentPlan === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentPlan: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.paymentPlan === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.paymentPlan === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                            <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                          </div>
                        </div>
                        <div className="text-right">
                          {option.fee > 0 && (
                            <Badge variant="outline" className="mb-2">
                              +{Math.round(option.fee * 100)}%
                            </Badge>
                          )}
                          {formData.paymentPlan === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <Label htmlFor="promoCode" className="text-sm font-medium text-slate-800">
                  Scholarship / Promo Code (Optional)
                </Label>
                <Input
                  id="promoCode"
                  value={formData.promoCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="Enter scholarship or promo code"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Try "SCHOLARSHIP15" for 15% tuition discount
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Private School Tuition Calculator
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Get an instant estimate for your child's education costs
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-slate-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Main Calculator */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              {renderStep()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.gradeLevel) ||
                    (currentStep === 2 && !formData.enrollmentType) ||
                    (currentStep === 3 && !formData.siblingStatus) ||
                    (currentStep === 5 && !formData.paymentPlan) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {isGenerating ? (
                    "Calculating..."
                  ) : currentStep === totalSteps ? (
                    "Calculate Tuition"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote Results */}
          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Your Tuition Estimate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Enrollment Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Grade Level:</span>
                            <span className="font-medium">
                              {gradeLevelOptions.find(o => o.value === quote.gradeLevel)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Enrollment Type:</span>
                            <span className="font-medium">
                              {enrollmentTypeOptions.find(o => o.value === quote.enrollmentType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sibling Status:</span>
                            <span className="font-medium">
                              {siblingOptions.find(o => o.value === quote.siblingStatus)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Plan:</span>
                            <span className="font-medium">
                              {paymentPlanOptions.find(o => o.value === quote.paymentPlan)?.label}
                            </span>
                          </div>
                          {quote.addOns.length > 0 && (
                            <div className="flex justify-between">
                              <span>Programs:</span>
                              <span className="font-medium">
                                {quote.addOns.length} selected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Cost Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Tuition:</span>
                            <span>€{quote.breakdown.baseCost.toLocaleString()} onSave={() => {}} /></span>
                          </div>
                          
                          {quote.breakdown.enrollmentAdjustment > 0 && (
                            <div className="flex justify-between text-blue-600">
                              <span>Boarding Fee:</span>
                              <span>+€{quote.breakdown.enrollmentAdjustment.toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.siblingDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Sibling Discount:</span>
                              <span>-€{quote.breakdown.siblingDiscount.toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.addOnCosts.map((addon, index) => (
                            <div key={index} className="flex justify-between text-blue-600">
                              <span><EditableText value={addon.name}:</span>
                              <span>+€{addon.amount.toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          {quote.breakdown.paymentFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Payment Plan Fee:</span>
                              <span>+€{quote.breakdown.paymentFee.toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-green-600">
                              <span><EditableText value={discount.name}:</span>
                              <span>-€{discount.amount.toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg text-slate-800">
                            <span>Annual Total:</span>
                            <span>€{quote.totalCost.toLocaleString()} onSave={() => {}} /></span>
                          </div>
                          
                          {formData.paymentPlan === "monthly" && (
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>Monthly Payment:</span>
                              <span>€{Math.round(quote.totalCost / 12).toLocaleString()} onSave={() => {}} /></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {showEmailCapture && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-blue-200"
                      >
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="parentName">Parent / Guardian Name</Label>
                            <Input
                              id="parentName"
                              value={formData.parentName}
                              onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                              placeholder="Enter your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="parentEmail">Email Address</Label>
                            <Input
                              id="parentEmail"
                              type="email"
                              value={formData.parentEmail}
                              onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                            <School className="mr-2 h-4 w-4" />
                            Apply Now
                          </Button>
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book a Tour
                          </Button>
                          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                        </div>
                        
                        {quoteValidTime > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center text-blue-800">
                              <Timer className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">
                                This quote is locked for {formatTime(quoteValidTime)}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}