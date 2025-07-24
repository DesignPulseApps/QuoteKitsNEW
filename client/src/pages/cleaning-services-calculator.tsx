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
  Sparkles, 
  Home, 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle,
  Calculator,
  User,
  Mail,
  Download,
  Timer,
  ChevronRight,
  HelpCircle,
  Star,
  Sofa,
  Car,
  Building,
  Plane,
  Shirt,
  Utensils,
  Wind,
  MapPin,
  DollarSign,
  Layers,
  BrainCircuit
} from "lucide-react";

interface CleaningQuote {
  cleaningType: string;
  propertySize: string;
  addOns: string[];
  frequency: string;
  urgency: string;
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    addOnCosts: { name: string; amount: number }[];
    frequencyDiscount: number;
    urgencyFee: number;
    discounts: { name: string; amount: number }[];
  };
}

const cleaningTypeOptions = [
  { 
    value: "regular", 
    label: "Regular / Weekly", 
    icon: Calendar, 
    description: "Standard house cleaning service", 
    multiplier: 1.0,
    color: "bg-teal-100 text-teal-700"
  },
  { 
    value: "deep-clean", 
    label: "Deep Clean", 
    icon: Sparkles, 
    description: "Comprehensive deep cleaning", 
    multiplier: 1.25,
    color: "bg-blue-100 text-blue-700"
  },
  { 
    value: "move-in-out", 
    label: "Move-in / Move-out", 
    icon: Home, 
    description: "Moving cleaning services", 
    multiplier: 1.35,
    color: "bg-purple-100 text-purple-700"
  },
  { 
    value: "airbnb", 
    label: "Airbnb Turnaround", 
    icon: Plane, 
    description: "Guest turnover cleaning", 
    multiplier: 1.15,
    color: "bg-orange-100 text-orange-700"
  },
  { 
    value: "carpet", 
    label: "Carpet / Upholstery", 
    icon: Sofa, 
    description: "Specialized fabric cleaning", 
    multiplier: 1.20,
    color: "bg-green-100 text-green-700"
  }
];

const propertySizeOptions = [
  { value: "studio", label: "Studio", rooms: 0, basePrice: 60 },
  { value: "1-bedroom", label: "1 Bedroom", rooms: 1, basePrice: 75 },
  { value: "2-bedroom", label: "2 Bedroom", rooms: 2, basePrice: 90 },
  { value: "3-bedroom", label: "3 Bedroom", rooms: 3, basePrice: 105 },
  { value: "4-bedroom", label: "4+ Bedroom", rooms: 4, basePrice: 125 }
];

const addOnOptions = [
  { value: "windows", label: "Window Cleaning", cost: 20, icon: Wind, description: "Interior and exterior windows" },
  { value: "fridge", label: "Inside Fridge", cost: 10, icon: Utensils, description: "Deep clean refrigerator interior" },
  { value: "oven", label: "Inside Oven", cost: 15, icon: Utensils, description: "Deep clean oven interior" },
  { value: "laundry", label: "Laundry & Folding", cost: 15, icon: Shirt, description: "Wash, dry, and fold clothes" },
  { value: "balcony", label: "Balcony / Patio", cost: 12, icon: MapPin, description: "Outdoor space cleaning" }
];

const frequencyOptions = [
  { value: "one-time", label: "One-time", discount: 0, icon: Clock },
  { value: "weekly", label: "Weekly", discount: 0.15, icon: Calendar },
  { value: "biweekly", label: "Biweekly", discount: 0.10, icon: Calendar },
  { value: "monthly", label: "Monthly", discount: 0.05, icon: Calendar }
];

const urgencyOptions = [
  { value: "standard", label: "Standard (2–3 days)", multiplier: 1.0, icon: Clock },
  { value: "express", label: "Express (Next Day)", multiplier: 1.20, icon: Zap },
  { value: "emergency", label: "Emergency (Same Day)", multiplier: 1.50, icon: Zap }
];

interface CleaningServicesCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function CleaningServicesCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: CleaningServicesCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [textConfig, setTextConfig] = useState<any>(propConfig?.textContent || {});
  
  // Text customization functionality
  const updateTextContent = (key: string, value: string) => {
    const newConfig = {
      ...textConfig,
      [key]: value
    };
    setTextConfig(newConfig);
    
    // Notify parent component about the change
    if (onConfigChange) {
      onConfigChange({
        ...propConfig,
        textContent: newConfig
      });
    }
  };
  
  const [formData, setFormData] = useState({
    cleaningType: "",
    propertySize: "",
    addOns: [] as string[],
    frequency: "",
    urgency: "",
    promoCode: "",
    clientName: "",
    clientEmail: "",
    naturalLanguageInput: ""
  });
  const [quote, setQuote] = useState<CleaningQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showNLInput, setShowNLInput] = useState(false);
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [quoteValidTime, setQuoteValidTime] = useState(72 * 60 * 60); // 72 hours in seconds

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const calculateQuote = () => {
    const cleaningType = cleaningTypeOptions.find(t => t.value === formData.cleaningType);
    const propertySize = propertySizeOptions.find(p => p.value === formData.propertySize);
    const frequency = frequencyOptions.find(f => f.value === formData.frequency);
    const urgency = urgencyOptions.find(u => u.value === formData.urgency);
    
    if (!cleaningType || !propertySize || !frequency || !urgency) return null;

    // Calculate base cost
    const baseCost = (propertySize.basePrice || customConfig?.basePrice || 80) * cleaningType.multiplier;
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      return option && option.cost > 0 ? { name: option.label, amount: option.cost } : { name: "", amount: 0 };
    }).filter(a => a.name);

    // Apply frequency discount
    const frequencyDiscount = baseCost * frequency.discount;
    
    // Apply urgency multiplier
    const urgencyFee = baseCost * (urgency.multiplier - 1);
    
    // Apply discounts
    const discounts = [];
    
    // Promo code discount (10% off total before urgency)
    if (formData.promoCode.toLowerCase() === "clean10") {
      const subtotal = baseCost + addOnCosts.reduce((sum, addon) => sum + addon.amount, 0) - frequencyDiscount;
      const promoDiscount = subtotal * 0.1;
      discounts.push({ name: "Promo Code Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + totalAddOnCost - frequencyDiscount + urgencyFee - totalDiscounts;

    return {
      cleaningType: formData.cleaningType,
      propertySize: formData.propertySize,
      addOns: formData.addOns,
      frequency: formData.frequency,
      urgency: formData.urgency,
      promoCode: formData.promoCode,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      baseRate: propertySize.basePrice,
      totalCost: Math.round(totalCost * 100) / 100,
      breakdown: {
        baseCost: Math.round(baseCost * 100) / 100,
        addOnCosts,
        frequencyDiscount: Math.round(frequencyDiscount * 100) / 100,
        urgencyFee: Math.round(urgencyFee * 100) / 100,
        discounts
      }
    };
  };

  const processNaturalLanguage = async () => {
    if (!formData.naturalLanguageInput.trim()) return;
    
    setIsProcessingNL(true);
    try {
      const response = await fetch('/api/ai/process-cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData.naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          cleaningType: result.cleaningType || prev.cleaningType,
          propertySize: result.propertySize || prev.propertySize,
          addOns: result.addOns || prev.addOns,
          frequency: result.frequency || prev.frequency,
          urgency: result.urgency || prev.urgency,
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
        setQuoteValidTime(72 * 60 * 60); // Reset to 72 hours
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What type of cleaning do you need?</h2>
              <p className="text-slate-600">Select the service that best fits your needs</p>
              
              <Button
                variant="outline"
                onClick={() => setShowNLInput(!showNLInput)}
                className="mt-4 border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Try Natural Language Input
              </Button>
            </div>

            {showNLInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200"
              >
                <Label className="text-sm font-medium text-slate-800 mb-2 block">
                  Describe your cleaning needs in plain English
                </Label>
                <Input
                  value={formData.naturalLanguageInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                  placeholder="e.g., I need a 3-bedroom deep clean this weekend with laundry"
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={processNaturalLanguage}
                    disabled={isProcessingNL || !formData.naturalLanguageInput.trim()}
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
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
              {cleaningTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.cleaningType === option.value
                        ? "ring-2 ring-teal-500 bg-teal-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, cleaningType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.cleaningType === option.value ? "bg-teal-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.cleaningType === option.value ? "text-teal-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        <div className="text-right">
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="mb-2">
                              +{Math.round((option.multiplier - 1) * 100)}%
                            </Badge>
                          )}
                          {formData.cleaningType === option.value && (
                            <CheckCircle className="h-5 w-5 text-teal-600 mt-2 ml-auto" />
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What's your property size?</h2>
              <p className="text-slate-600">Choose the size that best describes your space</p>
            </div>
            
            <div className="grid gap-4">
              {propertySizeOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.propertySize === option.value
                      ? "ring-2 ring-teal-500 bg-teal-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, propertySize: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.propertySize === option.value ? "bg-teal-100" : "bg-slate-100"
                        }`}>
                          <Home className={`h-6 w-6 ${
                            formData.propertySize === option.value ? "text-teal-600" : "text-slate-600"
                          }`} />
                        </div>
                        <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          €{option.basePrice}
                        </Badge>
                        {formData.propertySize === option.value && (
                          <CheckCircle className="h-5 w-5 text-teal-600 mt-2 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Any additional services?</h2>
              <p className="text-slate-600">Enhance your cleaning with optional add-ons</p>
            </div>
            
            <div className="grid gap-4">
              {addOnOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.addOns.includes(option.value)
                        ? "ring-2 ring-teal-500 bg-teal-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleAddOnToggle(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.addOns.includes(option.value) ? "bg-teal-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.addOns.includes(option.value) ? "text-teal-600" : "text-slate-600"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                            <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            +€{option.cost}
                          </Badge>
                          {formData.addOns.includes(option.value) && (
                            <CheckCircle className="h-5 w-5 text-teal-600" />
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
                  <p className="text-slate-600">No add-ons selected. You can skip this step or choose services above.</p>
                </CardContent>
              </Card>
            )}
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How often do you need cleaning?</h2>
              <p className="text-slate-600">Regular service gets you better rates</p>
            </div>
            
            <div className="grid gap-4">
              {frequencyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.frequency === option.value
                        ? "ring-2 ring-teal-500 bg-teal-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, frequency: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.frequency === option.value ? "bg-teal-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.frequency === option.value ? "text-teal-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.discount > 0 && (
                            <Badge variant="outline" className="mb-2 border-green-300 text-green-700">
                              {Math.round(option.discount * 100)}% off
                            </Badge>
                          )}
                          {formData.frequency === option.value && (
                            <CheckCircle className="h-5 w-5 text-teal-600" />
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

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">When do you need this done?</h2>
              <p className="text-slate-600">Faster service may include rush fees</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {urgencyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.urgency === option.value
                        ? "ring-2 ring-teal-500 bg-teal-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.urgency === option.value ? "bg-teal-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.urgency === option.value ? "text-teal-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="mb-2">
                              +{Math.round((option.multiplier - 1) * 100)}%
                            </Badge>
                          )}
                          {formData.urgency === option.value && (
                            <CheckCircle className="h-5 w-5 text-teal-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-teal-50">
              <CardContent className="p-4">
                <Label htmlFor="promoCode" className="text-sm font-medium text-slate-800">
                  Promo Code (Optional)
                </Label>
                <Input
                  id="promoCode"
                  value={formData.promoCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="Enter promo code"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Try "CLEAN10" for 10% off your cleaning service
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              <EditableText
                value={textConfig.headline || "Cleaning Services Quote Calculator"}
                onSave={(value) => updateTextContent('headline', value)}
                className="inline-block"
                isPreview={isPreview}
              />
            </h1>
            <EditableText
              value={textConfig.description || "Get an instant quote for professional cleaning services"}
              onSave={(value) => updateTextContent('description', value)}
              className="text-lg text-slate-600 mb-6 block"
              isPreview={isPreview}
            />
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
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
                    (currentStep === 1 && !formData.cleaningType) ||
                    (currentStep === 2 && !formData.propertySize) ||
                    (currentStep === 4 && !formData.frequency) ||
                    (currentStep === 5 && !formData.urgency) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : currentStep === totalSteps ? (
                    "Get My Quote"
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
                <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-slate-50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Your Cleaning Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Service Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Cleaning Type:</span>
                            <span className="font-medium">
                              {cleaningTypeOptions.find(o => o.value === quote.cleaningType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Property Size:</span>
                            <span className="font-medium">
                              {propertySizeOptions.find(o => o.value === quote.propertySize)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium">
                              {frequencyOptions.find(o => o.value === quote.frequency)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span className="font-medium">
                              {urgencyOptions.find(o => o.value === quote.urgency)?.label}
                            </span>
                          </div>
                          {quote.addOns.length > 0 && (
                            <div className="flex justify-between">
                              <span>Add-ons:</span>
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
                            <span>Base Service:</span>
                            <span>€{quote.breakdown.baseCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                          
                          {quote.breakdown.addOnCosts.map((addon, index) => (
                            <div key={index} className="flex justify-between text-teal-600">
                              <span><EditableText value={addon.name}:</span>
                              <span>+€{addon.amount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          {quote.breakdown.frequencyDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Frequency Discount:</span>
                              <span>-€{quote.breakdown.frequencyDiscount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.urgencyFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Rush Fee:</span>
                              <span>+€{quote.breakdown.urgencyFee.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-green-600">
                              <span><EditableText value={discount.name}:</span>
                              <span>-€{discount.amount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg text-slate-800">
                            <span>Total Cost:</span>
                            <span>€{quote.totalCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showEmailCapture && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-teal-200"
                      >
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="clientName">Your Name</Label>
                            <Input
                              id="clientName"
                              value={formData.clientName}
                              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Enter your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientEmail">Email Address</Label>
                            <Input
                              id="clientEmail"
                              type="email"
                              value={formData.clientEmail}
                              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="bg-teal-600 hover:bg-teal-700 text-white flex-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Now
                          </Button>
                          <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Quote
                          </Button>
                        </div>
                        
                        {quoteValidTime > 0 && (
                          <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="flex items-center text-teal-800">
                              <Timer className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">
                                This quote is valid for {formatTime(quoteValidTime)}
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