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
  Scale, 
  FileText, 
  Building, 
  Users, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Calculator,
  User,
  Mail,
  Calendar,
  Download,
  Timer,
  ChevronRight,
  HelpCircle,
  Star,
  Shield,
  BookOpen
} from "lucide-react";

interface LegalAdvisorQuote {
  serviceType: string;
  consultationType: string;
  urgencyLevel: string;
  jurisdiction: string;
  addOns: string[];
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    urgencyFee: number;
    jurisdictionFee: number;
    addOnCosts: { name: string; amount: number }[];
    discounts: { name: string; amount: number }[];
  };
}

const serviceTypeOptions = [
  { value: "contract-drafting", label: "Contract Drafting", icon: FileText, description: "Draft and review business contracts" },
  { value: "business-setup", label: "Business Setup Advice", icon: Building, description: "Legal guidance for business formation" },
  { value: "family-law", label: "Family Law Consultation", icon: Users, description: "Family legal matters and disputes" },
  { value: "immigration", label: "Immigration Services", icon: Globe, description: "Visa, residency, and immigration advice" },
  { value: "estate-planning", label: "Estate & Will Planning", icon: Shield, description: "Wills, trusts, and estate planning" },
  { value: "ip-trademark", label: "IP / Trademark Advice", icon: BookOpen, description: "Intellectual property protection" }
];

const consultationTypeOptions = [
  { value: "30min-call", label: "Initial 30-min Call", duration: 30, baseCost: 120 },
  { value: "1hour-session", label: "1-Hour Strategy Session", duration: 60, baseCost: 200 },
  { value: "ongoing-retainer", label: "Ongoing Retainer", duration: 0, baseCost: 500 }
];

const urgencyOptions = [
  { value: "flexible", label: "Flexible (1-2 weeks)", fee: 0, icon: Clock },
  { value: "priority", label: "Priority (within 3 days)", fee: 50, icon: AlertTriangle },
  { value: "urgent", label: "Urgent (within 24h)", fee: 100, icon: AlertTriangle }
];

const jurisdictionOptions = [
  { value: "local", label: "Local / In-Country", fee: 0 },
  { value: "international", label: "International", fee: 100 }
];

const addOnOptions = [
  { value: "document-review", label: "Document Review", cost: 90, description: "Comprehensive document analysis" },
  { value: "legal-summary", label: "Written Legal Summary", cost: 70, description: "Detailed written report" },
  { value: "email-support", label: "Follow-up Email Support", cost: 40, description: "Post-consultation email assistance" },
  { value: "in-person", label: "In-person Meeting", cost: 120, description: "Face-to-face consultation" }
];

interface LegalAdvisorCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function LegalAdvisorCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: LegalAdvisorCalculatorProps = {}) {
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
    serviceType: "",
    consultationType: "",
    urgencyLevel: "",
    jurisdiction: "",
    addOns: [] as string[],
    promoCode: "",
    clientName: "",
    clientEmail: ""
  });
  const [quote, setQuote] = useState<LegalAdvisorQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const calculateQuote = () => {
    const consultation = consultationTypeOptions.find(c => c.value === formData.consultationType);
    const urgency = urgencyOptions.find(u => u.value === formData.urgencyLevel);
    const jurisdiction = jurisdictionOptions.find(j => j.value === formData.jurisdiction);
    
    if (!consultation || !urgency || !jurisdiction) return null;

    // Calculate base cost
    const baseCost = consultation.baseCost;
    
    // Apply urgency fee
    const urgencyFee = urgency.fee;
    
    // Apply jurisdiction fee
    const jurisdictionFee = jurisdiction.fee;
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      return option && option.cost > 0 ? { name: option.label, amount: option.cost } : { name: "", amount: 0 };
    }).filter(a => a.name);

    // Apply discounts
    const discounts = [];
    
    // Promo code discount
    if (formData.promoCode.toLowerCase() === "legal10") {
      const promoDiscount = (baseCost + urgencyFee + jurisdictionFee) * 0.1;
      discounts.push({ name: "Promo Code Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + urgencyFee + jurisdictionFee + totalAddOnCost - totalDiscounts;

    return {
      serviceType: formData.serviceType,
      consultationType: formData.consultationType,
      urgencyLevel: formData.urgencyLevel,
      jurisdiction: formData.jurisdiction,
      addOns: formData.addOns,
      promoCode: formData.promoCode,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      baseRate: 120,
      totalCost,
      breakdown: {
        baseCost,
        urgencyFee,
        jurisdictionFee,
        addOnCosts,
        discounts
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What legal service do you need?</h2>
              <p className="text-slate-600">Select the area where you need legal guidance</p>
            </div>
            
            <div className="grid gap-4">
              {serviceTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.serviceType === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, serviceType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.serviceType === option.value ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.serviceType === option.value ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        {formData.serviceType === option.value && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Consultation type?</h2>
              <p className="text-slate-600">Choose the format that works best for you</p>
            </div>
            
            <div className="grid gap-4">
              {consultationTypeOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.consultationType === option.value
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, consultationType: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        {option.duration > 0 && (
                          <p className="text-sm text-slate-600"><EditableText value={option.duration} minutes</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          €{option.baseCost}
                        </Badge>
                        {formData.consultationType === option.value && (
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-2 ml-auto" />
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How urgent is this?</h2>
              <p className="text-slate-600">Faster turnaround times may include priority fees</p>
            </div>
            
            <div className="grid gap-4">
              {urgencyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.urgencyLevel === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.urgencyLevel === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.urgencyLevel === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.fee > 0 && (
                            <Badge variant="outline" className="mb-2">
                              +€{option.fee}
                            </Badge>
                          )}
                          {formData.urgencyLevel === option.value && (
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Jurisdiction scope?</h2>
              <p className="text-slate-600">International cases may require additional expertise</p>
            </div>
            
            <div className="grid gap-4">
              {jurisdictionOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.jurisdiction === option.value
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, jurisdiction: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                      <div className="text-right">
                        {option.fee > 0 && (
                          <Badge variant="outline" className="mb-2">
                            +€{option.fee}
                          </Badge>
                        )}
                        {formData.jurisdiction === option.value && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Additional services</h2>
              <p className="text-slate-600">Enhance your consultation with these optional services</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {addOnOptions.map((option) => (
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
                      <div>
                        <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
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
              ))}
            </div>

            <Card className="bg-slate-50">
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
                  Try "LEGAL10" for 10% off your consultation
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
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              <EditableText
                value={textConfig.headline || "Legal Advisor Pricing Calculator"}
                onSave={(value) => updateTextContent('headline', value)}
                className="inline-block"
                isPreview={isPreview}
              />
            </h1>
            <EditableText
              value={textConfig.description || "Get an instant quote for professional legal consultation services"}
              onSave={(value) => updateTextContent('description', value)}
              className="text-lg text-slate-600 mb-6 block"
              isPreview={isPreview}
            />
            
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
                    (currentStep === 1 && !formData.serviceType) ||
                    (currentStep === 2 && !formData.consultationType) ||
                    (currentStep === 3 && !formData.urgencyLevel) ||
                    (currentStep === 4 && !formData.jurisdiction) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
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
                      <Scale className="h-5 w-5 mr-2" />
                      Your Legal Consultation Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Service Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Service Type:</span>
                            <span className="font-medium">
                              {serviceTypeOptions.find(o => o.value === quote.serviceType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consultation:</span>
                            <span className="font-medium">
                              {consultationTypeOptions.find(o => o.value === quote.consultationType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgency:</span>
                            <span className="font-medium">
                              {urgencyOptions.find(o => o.value === quote.urgencyLevel)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Jurisdiction:</span>
                            <span className="font-medium">
                              {jurisdictionOptions.find(o => o.value === quote.jurisdiction)?.label}
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
                            <span>Base Consultation:</span>
                            <span>€{quote.breakdown.baseCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                          
                          {quote.breakdown.urgencyFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Urgency Fee:</span>
                              <span>+€{quote.breakdown.urgencyFee.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.jurisdictionFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>International Fee:</span>
                              <span>+€{quote.breakdown.jurisdictionFee.toFixed(2)} onSave={() => {}} /></span>
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
                            Schedule My Consultation
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