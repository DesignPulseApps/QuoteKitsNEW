import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Calculator, 
  FileText, 
  Users, 
  Building, 
  DollarSign, 
  Clock, 
  Shield,
  CheckCircle,
  User,
  Mail,
  Calendar,
  Download,
  Timer,
  ChevronRight,
  HelpCircle,
  Star,
  BookOpen,
  Briefcase,
  TrendingUp,
  Phone,
  Zap
} from "lucide-react";

interface TaxPreparerQuote {
  filingType: string;
  incomeLevel: string;
  formsCount: string;
  addOns: string[];
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    complexityFee: number;
    formsFee: number;
    addOnCosts: { name: string; amount: number }[];
    discounts: { name: string; amount: number }[];
  };
}

const filingTypeOptions = [
  { value: "individual", label: "Individual", icon: User, baseCost: 80, description: "Personal tax return filing" },
  { value: "married-joint", label: "Married Joint", icon: Users, baseCost: 120, description: "Joint filing for married couples" },
  { value: "married-separate", label: "Married Separate", icon: Users, baseCost: 100, description: "Separate filing for married couples" },
  { value: "business", label: "Business / Self-Employed", icon: Briefcase, baseCost: 200, description: "Self-employment and business returns" },
  { value: "llc", label: "LLC", icon: Building, baseCost: 250, description: "Limited Liability Company filing" },
  { value: "corporation", label: "Corporation", icon: Building, baseCost: 350, description: "Corporate tax return filing" }
];

const incomeLevelOptions = [
  { value: "under-30k", label: "Under €30k", multiplier: 1, icon: DollarSign },
  { value: "30k-70k", label: "€30k–€70k", multiplier: 1.2, icon: DollarSign },
  { value: "70k-150k", label: "€70k–€150k", multiplier: 1.5, icon: TrendingUp },
  { value: "over-150k", label: "Over €150k", multiplier: 2, icon: TrendingUp }
];

const formsCountOptions = [
  { value: "w2-only", label: "W2 only", fee: 0, icon: FileText, description: "Simple W2 wage filing" },
  { value: "extra-1-3", label: "1–3 extra forms", fee: 50, icon: FileText, description: "Additional 1099s, interest forms" },
  { value: "extra-4-plus", label: "4+ forms", fee: 125, icon: FileText, description: "Multiple income sources" },
  { value: "investment-crypto", label: "Investment / Crypto forms", fee: 200, icon: TrendingUp, description: "Complex investment reporting" }
];

const addOnOptions = [
  { value: "audit-protection", label: "Audit Protection", cost: 40, description: "IRS audit defense and support", icon: Shield },
  { value: "year-round-support", label: "Year-Round Support", cost: 90, description: "Tax advice throughout the year", icon: Phone },
  { value: "prior-year", label: "Prior-Year Filing", cost: 60, description: "File previous year returns", icon: Clock },
  { value: "in-person-review", label: "In-Person Review Session", cost: 50, description: "Face-to-face consultation", icon: User },
  { value: "rush-filing", label: "Rush Filing (48hr)", cost: 75, description: "Expedited tax preparation", icon: Zap }
];

interface TaxPreparerCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function TaxPreparerCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: TaxPreparerCalculatorProps = {}) {
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
    filingType: "",
    incomeLevel: "",
    formsCount: "",
    addOns: [] as string[],
    promoCode: "",
    clientName: "",
    clientEmail: "",
    naturalLanguageInput: ""
  });
  const [quote, setQuote] = useState<TaxPreparerQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showNLInput, setShowNLInput] = useState(false);
  const [isProcessingNL, setIsProcessingNL] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const calculateQuote = () => {
    const filing = filingTypeOptions.find(f => f.value === formData.filingType);
    const income = incomeLevelOptions.find(i => i.value === formData.incomeLevel);
    const forms = formsCountOptions.find(f => f.value === formData.formsCount);
    
    if (!filing || !income || !forms) return null;

    // Calculate base cost with income multiplier
    const baseCost = filing.baseCost * income.multiplier;
    
    // Forms complexity fee
    const formsFee = forms.fee;
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      return option && option.cost > 0 ? { name: option.label, amount: option.cost } : { name: "", amount: 0 };
    }).filter(a => a.name);

    // Apply discounts
    const discounts = [];
    
    // Promo code discount (10% off base + forms)
    if (formData.promoCode.toLowerCase() === "taxsaver10") {
      const promoDiscount = (baseCost + formsFee) * 0.1;
      discounts.push({ name: "Promo Code Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + formsFee + totalAddOnCost - totalDiscounts;

    return {
      filingType: formData.filingType,
      incomeLevel: formData.incomeLevel,
      formsCount: formData.formsCount,
      addOns: formData.addOns,
      promoCode: formData.promoCode,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      baseRate: 80,
      totalCost: Math.round(totalCost),
      breakdown: {
        baseCost: Math.round(baseCost),
        complexityFee: 0,
        formsFee,
        addOnCosts,
        discounts
      }
    };
  };

  const processNaturalLanguage = async () => {
    if (!formData.naturalLanguageInput.trim()) return;
    
    setIsProcessingNL(true);
    try {
      const response = await fetch('/api/ai/process-tax-preparer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData.naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          filingType: result.filingType || prev.filingType,
          incomeLevel: result.incomeLevel || prev.incomeLevel,
          formsCount: result.formsCount || prev.formsCount,
          addOns: result.addOns || prev.addOns,
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What type of tax filing?</h2>
              <p className="text-slate-600">Select your filing category to get started</p>
              
              <Button
                variant="outline"
                onClick={() => setShowNLInput(!showNLInput)}
                className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Try Natural Language Input
              </Button>
            </div>

            {showNLInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <Label className="text-sm font-medium text-slate-800 mb-2 block">
                  Describe your tax situation in plain English
                </Label>
                <Input
                  value={formData.naturalLanguageInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                  placeholder="e.g., I need to file business taxes with crypto investments and need rush service"
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
              {filingTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.filingType === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, filingType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.filingType === option.value ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.filingType === option.value ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            From €{option.baseCost}
                          </Badge>
                          {formData.filingType === option.value && (
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What's your income level?</h2>
              <p className="text-slate-600">Higher income levels may require additional complexity handling</p>
            </div>
            
            <div className="grid gap-4">
              {incomeLevelOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.incomeLevel === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, incomeLevel: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.incomeLevel === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.incomeLevel === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="mb-2">
                              {option.multiplier}x complexity
                            </Badge>
                          )}
                          {formData.incomeLevel === option.value && (
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How many forms to process?</h2>
              <p className="text-slate-600">Additional forms increase preparation time and complexity</p>
            </div>
            
            <div className="grid gap-4">
              {formsCountOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.formsCount === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, formsCount: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.formsCount === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.formsCount === option.value ? "text-blue-600" : "text-slate-600"
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
                              +€{option.fee}
                            </Badge>
                          )}
                          {formData.formsCount === option.value && (
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Additional services</h2>
              <p className="text-slate-600">Enhance your tax preparation with these optional services</p>
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
                            €{option.cost}
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Final details</h2>
              <p className="text-slate-600">Review your selections and add any promo codes</p>
            </div>
            
            <Card className="bg-slate-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Your Tax Filing Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Filing Type:</span>
                    <span className="font-medium">
                      {filingTypeOptions.find(o => o.value === formData.filingType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Level:</span>
                    <span className="font-medium">
                      {incomeLevelOptions.find(o => o.value === formData.incomeLevel)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forms Complexity:</span>
                    <span className="font-medium">
                      {formsCountOptions.find(o => o.value === formData.formsCount)?.label}
                    </span>
                  </div>
                  {formData.addOns.length > 0 && (
                    <div className="flex justify-between">
                      <span>Add-on Services:</span>
                      <span className="font-medium">
                        {formData.addOns.length} selected
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
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
                  Try "TAXSAVER10" for 10% off your filing
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
              <EditableText
                value={textConfig.headline || "Tax Preparer Pricing Calculator"}
                onSave={(value) => updateTextContent('headline', value)}
                className="inline-block"
                isPreview={isPreview}
              />
            </h1>
            <EditableText
              value={textConfig.description || "Get an instant quote for professional tax preparation services"}
              onSave={(value) => updateTextContent('description', value)}
              className="text-lg text-slate-600 mb-6 block"
              isPreview={isPreview}
            />
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-slate-700 h-2 rounded-full"
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
                    (currentStep === 1 && !formData.filingType) ||
                    (currentStep === 2 && !formData.incomeLevel) ||
                    (currentStep === 3 && !formData.formsCount) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
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
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Your Tax Preparation Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Filing Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Filing Type:</span>
                            <span className="font-medium">
                              {filingTypeOptions.find(o => o.value === quote.filingType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Income Level:</span>
                            <span className="font-medium">
                              {incomeLevelOptions.find(o => o.value === quote.incomeLevel)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Forms Count:</span>
                            <span className="font-medium">
                              {formsCountOptions.find(o => o.value === quote.formsCount)?.label}
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
                            <span>Base Filing Cost:</span>
                            <span>€{quote.breakdown.baseCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                          
                          {quote.breakdown.formsFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Additional Forms:</span>
                              <span>+€{quote.breakdown.formsFee.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.addOnCosts.map((addon, index) => (
                            <div key={index} className="flex justify-between text-blue-600">
                              <span><EditableText value={addon.name}:</span>
                              <span>+€{addon.amount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
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
                        className="mt-6 pt-6 border-t border-blue-200"
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
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Your Filing
                          </Button>
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Quote
                          </Button>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center text-blue-800">
                            <Timer className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              This quote is valid for 72 hours
                            </span>
                          </div>
                        </div>
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