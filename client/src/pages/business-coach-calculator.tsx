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
  Target, 
  Calendar, 
  VideoIcon, 
  Clock, 
  Plus,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Calculator,
  User,
  Briefcase,
  Sparkles,
  Download,
  Mail,
  Timer,
  ArrowRight
} from "lucide-react";

interface BusinessCoachQuote {
  coachingFocus: string;
  sessionFrequency: string;
  coachingFormat: string;
  packageDuration: string;
  addOns: string[];
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    discounts: { name: string; amount: number }[];
    addOnCosts: { name: string; amount: number }[];
  };
}

const coachingFocusOptions = [
  { value: "leadership", label: "Leadership", icon: Target, description: "Executive leadership development" },
  { value: "startup-growth", label: "Startup / Business Growth", icon: TrendingUp, description: "Scale your business effectively" },
  { value: "career-transition", label: "Career Transition", icon: ArrowRight, description: "Navigate career changes" },
  { value: "productivity", label: "Productivity & Time Management", icon: Clock, description: "Optimize your workflow" },
  { value: "sales-marketing", label: "Sales / Marketing", icon: Briefcase, description: "Boost revenue and growth" }
];

const sessionFrequencyOptions = [
  { value: "one-time", label: "One-time Deep Dive", sessions: 1, description: "Intensive single session" },
  { value: "weekly", label: "Weekly", sessions: 4, description: "Regular weekly coaching" },
  { value: "biweekly", label: "Biweekly", sessions: 2, description: "Every two weeks" },
  { value: "monthly", label: "Monthly", sessions: 1, description: "Monthly check-ins" }
];

const formatOptions = [
  { value: "online", label: "Zoom / Online", icon: VideoIcon, premium: 0 },
  { value: "in-person", label: "In-Person", icon: User, premium: 100 },
  { value: "hybrid", label: "Hybrid", icon: Sparkles, premium: 50 }
];

const durationOptions = [
  { value: "1-month", label: "1 Month", multiplier: 1, discount: 0 },
  { value: "3-months", label: "3 Months", multiplier: 3, discount: 0.1 },
  { value: "6-months", label: "6 Months", multiplier: 6, discount: 0.15 },
  { value: "custom", label: "Custom Term", multiplier: 1, discount: 0 }
];

const addOnOptions = [
  { value: "email-support", label: "Email Support", cost: 50, description: "Unlimited email coaching" },
  { value: "worksheets", label: "Strategy Worksheets", cost: 25, description: "Custom action plans" },
  { value: "accountability", label: "Accountability Calls", cost: 40, description: "Weekly check-in calls" },
  { value: "action-plans", label: "Personalized Action Plans", cost: 25, description: "Tailored strategies" }
];

interface BusinessCoachCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function BusinessCoachCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: BusinessCoachCalculatorProps = {}) {
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
    coachingFocus: "",
    sessionFrequency: "",
    coachingFormat: "",
    packageDuration: "",
    addOns: [] as string[],
    promoCode: "",
    clientName: "",
    clientEmail: ""
  });
  const [quote, setQuote] = useState<BusinessCoachQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const calculateQuote = () => {
    const baseRate = customConfig?.basePrice || 200; // €200 per session
    
    const frequency = sessionFrequencyOptions.find(f => f.value === formData.sessionFrequency);
    const duration = durationOptions.find(d => d.value === formData.packageDuration);
    const format = formatOptions.find(f => f.value === formData.coachingFormat);
    
    if (!frequency || !duration || !format) return null;

    // Calculate base cost
    const sessionsPerMonth = frequency.sessions;
    const totalSessions = sessionsPerMonth * duration.multiplier;
    const baseCost = totalSessions * baseRate;
    
    // Apply format premium
    const formatPremium = format.premium * totalSessions;
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      return option && option.cost > 0 ? { name: option.label, amount: option.cost * duration.multiplier } : { name: "", amount: 0 };
    }).filter(a => a.name);

    // Apply discounts
    const discounts = [];
    
    // Duration discount
    if (duration.discount > 0) {
      const discountAmount = baseCost * duration.discount;
      discounts.push({ name: `${duration.label} Package Discount`, amount: discountAmount });
    }
    
    // Promo code discount
    if (formData.promoCode.toLowerCase() === "welcome10") {
      const promoDiscount = (baseCost + formatPremium) * 0.1;
      discounts.push({ name: "Promo Code Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + formatPremium + totalAddOnCost - totalDiscounts;

    return {
      coachingFocus: formData.coachingFocus,
      sessionFrequency: formData.sessionFrequency,
      coachingFormat: formData.coachingFormat,
      packageDuration: formData.packageDuration,
      addOns: formData.addOns,
      promoCode: formData.promoCode,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      baseRate,
      totalCost,
      breakdown: {
        baseCost: baseCost + formatPremium,
        discounts,
        addOnCosts
      }
    };
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
              <h2 className="text-2xl font-bold text-navy-900 mb-2">What's your coaching focus?</h2>
              <p className="text-slate-600">Choose the area where you need the most guidance</p>
            </div>
            
            <div className="grid gap-4">
              {coachingFocusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.coachingFocus === option.value
                        ? "ring-2 ring-gold-500 bg-gold-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, coachingFocus: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.coachingFocus === option.value ? "bg-gold-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.coachingFocus === option.value ? "text-gold-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy-900"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        {formData.coachingFocus === option.value && (
                          <CheckCircle className="h-5 w-5 text-gold-600" />
                        )}
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
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Session frequency?</h2>
              <p className="text-slate-600">How often would you like to meet?</p>
            </div>
            
            <div className="grid gap-4">
              {sessionFrequencyOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.sessionFrequency === option.value
                      ? "ring-2 ring-gold-500 bg-gold-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, sessionFrequency: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-navy-900"><EditableText value={option.label} onSave={() => {}} /></h3>
                        <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-navy-100 text-navy-700">
                          {option.sessions} session{option.sessions > 1 ? 's' : ''}/month
                        </Badge>
                        {formData.sessionFrequency === option.value && (
                          <CheckCircle className="h-5 w-5 text-gold-600 mt-2 ml-auto" />
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
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Preferred format?</h2>
              <p className="text-slate-600">Choose how you'd like to connect</p>
            </div>
            
            <div className="grid gap-4">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.coachingFormat === option.value
                        ? "ring-2 ring-gold-500 bg-gold-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, coachingFormat: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.coachingFormat === option.value ? "bg-gold-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.coachingFormat === option.value ? "text-gold-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-navy-900"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.premium > 0 && (
                            <Badge variant="outline" className="mb-2">
                              +€{option.premium}/session
                            </Badge>
                          )}
                          {formData.coachingFormat === option.value && (
                            <CheckCircle className="h-5 w-5 text-gold-600" />
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
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Package duration?</h2>
              <p className="text-slate-600">Longer commitments include valuable discounts</p>
            </div>
            
            <div className="grid gap-4">
              {durationOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.packageDuration === option.value
                      ? "ring-2 ring-gold-500 bg-gold-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, packageDuration: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-navy-900"><EditableText value={option.label} onSave={() => {}} /></h3>
                      <div className="text-right">
                        {option.discount > 0 && (
                          <Badge className="bg-gold-100 text-gold-800 mb-2">
                            {Math.round(option.discount * 100)}% OFF
                          </Badge>
                        )}
                        {formData.packageDuration === option.value && (
                          <CheckCircle className="h-5 w-5 text-gold-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Add-on services</h2>
              <p className="text-slate-600">Enhance your coaching experience (optional)</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {addOnOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.addOns.includes(option.value)
                      ? "ring-2 ring-gold-500 bg-gold-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => handleAddOnToggle(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-navy-900"><EditableText value={option.label} onSave={() => {}} /></h3>
                        <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          €{option.cost}/month
                        </Badge>
                        {formData.addOns.includes(option.value) && (
                          <CheckCircle className="h-5 w-5 text-gold-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <Label htmlFor="promoCode" className="text-sm font-medium text-navy-900">
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
                  Try "WELCOME10" for 10% off your first package
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-navy-900 mb-4">
              <EditableText
                value={textConfig.headline || "Business Coach Pricing Calculator"}
                onSave={(value) => updateTextContent('headline', value)}
                className="inline-block"
                isPreview={isPreview}
              />
            </h1>
            <EditableText
              value={textConfig.description || "Get an instant quote for your personalized coaching journey"}
              onSave={(value) => updateTextContent('description', value)}
              className="text-lg text-slate-600 mb-6 block"
              isPreview={isPreview}
            />
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-gold-500 to-gold-600 h-2 rounded-full"
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
                  className="border-navy-200 text-navy-600 hover:bg-navy-50"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.coachingFocus) ||
                    (currentStep === 2 && !formData.sessionFrequency) ||
                    (currentStep === 3 && !formData.coachingFormat) ||
                    (currentStep === 4 && !formData.packageDuration) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
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
                <Card className="border-gold-200 bg-gradient-to-r from-gold-50 to-navy-50">
                  <CardHeader>
                    <CardTitle className="text-navy-800 flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Your Coaching Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-4">Package Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Focus Area:</span>
                            <span className="font-medium">
                              {coachingFocusOptions.find(o => o.value === quote.coachingFocus)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium">
                              {sessionFrequencyOptions.find(o => o.value === quote.sessionFrequency)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="font-medium">
                              {formatOptions.find(o => o.value === quote.coachingFormat)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">
                              {durationOptions.find(o => o.value === quote.packageDuration)?.label}
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
                        <h3 className="font-semibold text-navy-900 mb-4">Cost Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Package:</span>
                            <span>€{quote.breakdown.baseCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                          
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
                          <div className="flex justify-between font-bold text-lg text-navy-900">
                            <span>Total Investment:</span>
                            <span>€{quote.totalCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showEmailCapture && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-gold-200"
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
                          <Button className="bg-navy-600 hover:bg-navy-700 text-white flex-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Discovery Call
                          </Button>
                          <Button variant="outline" className="border-gold-300 text-gold-700 hover:bg-gold-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                          <Button variant="outline" className="border-navy-300 text-navy-700 hover:bg-navy-50">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Quote
                          </Button>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gold-50 rounded-lg border border-gold-200">
                          <div className="flex items-center text-gold-800">
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