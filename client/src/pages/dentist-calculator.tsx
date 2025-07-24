import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { EditableText } from "@/components/editable-text";
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Star,
  Download,
  Send,
  AlertCircle,
  Shield,
  Calendar,
  Users,
  CreditCard,
  Zap,
  X
} from "lucide-react";
import { QuoteKitHeader } from "@/components/calculator-header";

// Dental-specific icons simulation
const ToothIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.5 2 6 4.5 6 8c0 2 1 4 1 6s-1 4-1 6c0 1.5 1.5 2 3 2s3-.5 3-2c0-2-1-4-1-6s1-4 1-6c0-2-1-4-1-6s1.5-2 3-2s3 .5 3 2c0 2-1 4-1 6s1 4 1 6c0 1.5 1.5 2 3 2s3-.5 3-2c0-2-1-4-1-6s1-4 1-6c0-3.5-2.5-6-6-6z"/>
  </svg>
);

const SmileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="9" cy="9" r="1"/>
    <circle cx="15" cy="9" r="1"/>
  </svg>
);

interface TreatmentConfig {
  treatments: {
    [key: string]: {
      single?: number;
      multiple?: number;
      fullSet?: number;
      starting?: number;
      base?: number;
    };
  };
  urgency: {
    [key: string]: number;
  };
  addOns: {
    [key: string]: number;
  };
  discounts: {
    multiTreatment: number;
    insurance: number;
  };
  promoCodes: {
    [key: string]: number;
  };
}

const defaultConfig: TreatmentConfig = {
  treatments: {
    "dental-implant-single": { single: 1200 },
    "dental-implant-multiple": { multiple: 1000 },
    "veneers-single": { single: 450 },
    "veneers-full": { fullSet: 4000 },
    "invisalign": { starting: 3500 },
    "teeth-whitening": { base: 300 },
    "cleaning": { base: 90 },
    "root-canal": { base: 400 }
  },
  urgency: {
    "regular": 1.0,
    "express": 75,
    "virtual": 50
  },
  addOns: {
    "xray-3d": 120,
    "sedation": 200,
    "care-package": 150
  },
  discounts: {
    multiTreatment: 0.10,
    insurance: 0.15
  },
  promoCodes: {
    "DENTAL10": 0.10,
    "SMILE20": 0.20,
    "NEWPATIENT15": 0.15
  }
};

interface DentistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function DentistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: DentistCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60); // 72 hours in seconds
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessingNL, setIsProcessingNL] = useState(false);
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

  const [formData, setFormData] = useState({
    treatmentType: "",
    treatmentCount: "1",
    urgency: "regular",
    addOns: [] as string[],
    paymentPlan: "full",
    insurance: false,
    promoCode: "",
    
    // Lead capture
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    additionalNotes: ""
  });

  const [quote, setQuote] = useState({
    subtotal: 0,
    urgencyFee: 0,
    addOnTotal: 0,
    discount: 0,
    total: 0,
    breakdown: [] as Array<{name: string, price: number, type: 'treatment' | 'urgency' | 'addon' | 'discount'}>
  });

  // Countdown timer effect
  useEffect(() => {
    if (showQuote && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQuote, timeLeft]);

  // Natural language processing
  const processNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    setIsProcessingNL(true);
    try {
      const response = await fetch("/api/ai/process-dental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          treatmentType: result.treatmentType || prev.treatmentType,
          treatmentCount: result.treatmentCount || prev.treatmentCount,
          urgency: result.urgency || prev.urgency,
          addOns: result.addOns || prev.addOns,
          paymentPlan: result.paymentPlan || prev.paymentPlan,
          insurance: result.insurance !== undefined ? result.insurance : prev.insurance
        }));
        setNaturalLanguageInput("");
      }
    } catch (error) {
      console.error("Natural language processing failed:", error);
    } finally {
      setIsProcessingNL(false);
    }
  };

  // Calculate quote
  const calculateQuote = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      let subtotal = 0;
      let urgencyFee = 0;
      let addOnTotal = 0;
      let discount = 0;
      const breakdown: Array<{name: string, price: number, type: 'treatment' | 'urgency' | 'addon' | 'discount'}> = [];

      // Calculate treatment cost
      const treatment = defaultConfig.treatments[formData.treatmentType];
      if (treatment) {
        let treatmentCost = 0;
        const count = parseInt(formData.treatmentCount);
        
        // Use dynamic pricing from customConfig if available
        const basePrice = customConfig?.basePrice || treatment.single || treatment.range?.min || 100;
        
        if (treatment.single && count === 1) {
          treatmentCost = treatment.single;
        } else if (treatment.multiple) {
          treatmentCost = treatment.multiple * count;
        } else if (treatment.fullSet) {
          treatmentCost = treatment.fullSet;
        } else if (treatment.starting) {
          treatmentCost = treatment.starting;
        } else if (treatment.base) {
          treatmentCost = treatment.base;
        }
        
        subtotal = treatmentCost;
        
        const treatmentNames: {[key: string]: string} = {
          "dental-implant-single": "Dental Implant (Single)",
          "dental-implant-multiple": `Dental Implants (${count})`,
          "veneers-single": "Veneer (Single)",
          "veneers-full": "Veneers (Full Set)",
          "invisalign": "Invisalign Treatment",
          "teeth-whitening": "Teeth Whitening",
          "cleaning": "Dental Cleaning",
          "root-canal": "Root Canal"
        };
        
        breakdown.push({
          name: treatmentNames[formData.treatmentType] || "Treatment",
          price: treatmentCost,
          type: 'treatment'
        });
      }

      // Calculate urgency fee
      if (formData.urgency !== "regular") {
        urgencyFee = defaultConfig.urgency[formData.urgency] || 0;
        breakdown.push({
          name: formData.urgency === "express" ? "Express Consultation (48h)" : "Virtual Consultation",
          price: urgencyFee,
          type: 'urgency'
        });
      }

      // Calculate add-ons
      formData.addOns.forEach(addon => {
        const addonPrice = defaultConfig.addOns[addon] || 0;
        addOnTotal += addonPrice;
        
        const addonNames: {[key: string]: string} = {
          "xray-3d": "3D X-Ray Imaging",
          "sedation": "Sedation/Anaesthesia",
          "care-package": "Post-Treatment Care"
        };
        
        breakdown.push({
          name: addonNames[addon] || addon,
          price: addonPrice,
          type: 'addon'
        });
      });

      // Calculate discounts
      let totalBeforeDiscount = subtotal + urgencyFee + addOnTotal;
      
      // Multi-treatment discount (if multiple add-ons)
      if (formData.addOns.length > 1) {
        const multiDiscount = totalBeforeDiscount * defaultConfig.discounts.multiTreatment;
        discount += multiDiscount;
        breakdown.push({
          name: "Multi-Treatment Discount (10%)",
          price: -multiDiscount,
          type: 'discount'
        });
      }
      
      // Insurance discount
      if (formData.insurance) {
        const insuranceDiscount = totalBeforeDiscount * defaultConfig.discounts.insurance;
        discount += insuranceDiscount;
        breakdown.push({
          name: "Insurance Coverage (15%)",
          price: -insuranceDiscount,
          type: 'discount'
        });
      }
      
      // Promo code discount
      if (formData.promoCode && defaultConfig.promoCodes[formData.promoCode.toUpperCase()]) {
        const promoDiscount = totalBeforeDiscount * defaultConfig.promoCodes[formData.promoCode.toUpperCase()];
        discount += promoDiscount;
        breakdown.push({
          name: `Promo Code: ${formData.promoCode.toUpperCase()}`,
          price: -promoDiscount,
          type: 'discount'
        });
      }

      const total = totalBeforeDiscount - discount;

      setQuote({
        subtotal,
        urgencyFee,
        addOnTotal,
        discount,
        total,
        breakdown
      });

      setIsCalculating(false);
      setShowQuote(true);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Natural Language Input */}
      <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-cyan-600" />
            <Label className="text-cyan-700 font-medium">Describe Your Treatment Needs</Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., 'I need dental implants and whitening with insurance coverage' or 'Single veneer with express consultation'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={processNaturalLanguage}
              disabled={isProcessingNL || !naturalLanguageInput.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 shrink-0"
            >
              {isProcessingNL ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                "Process"
              )}
            </Button>
          </div>
          <p className="text-xs text-cyan-600 mt-2">AI will auto-fill the form based on your description</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Treatment Type *</Label>
            <Select value={formData.treatmentType} onValueChange={(value) => setFormData(prev => ({...prev, treatmentType: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select treatment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dental-implant-single">Dental Implant (Single)</SelectItem>
                <SelectItem value="dental-implant-multiple">Dental Implants (Multiple)</SelectItem>
                <SelectItem value="veneers-single">Veneers (Single)</SelectItem>
                <SelectItem value="veneers-full">Veneers (Full Set)</SelectItem>
                <SelectItem value="invisalign">Invisalign/Braces</SelectItem>
                <SelectItem value="teeth-whitening">Teeth Whitening</SelectItem>
                <SelectItem value="cleaning">Dental Cleaning</SelectItem>
                <SelectItem value="root-canal">Root Canal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.treatmentType === "dental-implant-multiple" || formData.treatmentType === "veneers-single") && (
            <div>
              <Label className="text-gray-700 font-medium">Number of Treatments</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.treatmentCount}
                onChange={(e) => setFormData(prev => ({...prev, treatmentCount: e.target.value}))}
                className="border-gray-300"
              />
            </div>
          )}

          <div>
            <Label className="text-gray-700 font-medium">Consultation Type</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({...prev, urgency: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Booking (Standard)</SelectItem>
                <SelectItem value="express">Express Consultation (+€75)</SelectItem>
                <SelectItem value="virtual">Virtual Consultation (+€50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Add-On Services</Label>
            <div className="space-y-3 mt-2">
              {[
                { id: "xray-3d", label: "3D X-Ray Imaging", price: "€120" },
                { id: "sedation", label: "Sedation/Anaesthesia", price: "€200" },
                { id: "care-package", label: "Post-Treatment Care", price: "€150" }
              ].map((addon) => (
                <div key={addon.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={addon.id}
                    checked={formData.addOns.includes(addon.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({...prev, addOns: [...prev.addOns, addon.id]}));
                      } else {
                        setFormData(prev => ({...prev, addOns: prev.addOns.filter(a => a !== addon.id)}));
                      }
                    }}
                  />
                  <Label htmlFor={addon.id} className="flex-1 cursor-pointer">
                    {addon.label}
                  </Label>
                  <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                    {addon.price}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="insurance"
                checked={formData.insurance}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, insurance: !!checked}))}
              />
              <Label htmlFor="insurance" className="cursor-pointer">
                I have dental insurance (15% discount)
              </Label>
              <Shield className="w-4 h-4 text-cyan-600" />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Promo Code (Optional)</Label>
              <Input
                placeholder="Enter promo code"
                value={formData.promoCode}
                onChange={(e) => setFormData(prev => ({...prev, promoCode: e.target.value}))}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Valid codes: DENTAL10, SMILE20, NEWPATIENT15</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder="Enter your full name"
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              placeholder="your.email@example.com"
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Phone Number</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
              placeholder="+49 123 456 7890"
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Preferred Appointment Date</Label>
            <Input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData(prev => ({...prev, preferredDate: e.target.value}))}
              className="border-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Payment Preference</Label>
            <Select value={formData.paymentPlan} onValueChange={(value) => setFormData(prev => ({...prev, paymentPlan: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Pay in Full (No additional fees)</SelectItem>
                <SelectItem value="monthly">Monthly Payment Plan (+3% processing)</SelectItem>
                <SelectItem value="quarterly">Quarterly Payment Plan (+2% processing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
              placeholder="Any specific concerns, medical conditions, or preferences..."
              rows={3}
              className="border-gray-300"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderQuote = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Quote validity timer */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-700">Quote Valid For:</span>
            </div>
            <div className="text-2xl font-bold text-red-600 font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / (72 * 60 * 60)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Quote breakdown */}
      <Card className="border-cyan-200">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <ToothIcon />
            Your Dental Treatment Quote
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {quote.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className={`font-medium ${item.type === 'discount' ? 'text-green-600' : 'text-gray-700'}`}>
                  {item.name}
                </span>
                <span className={`font-bold ${item.type === 'discount' ? 'text-green-600' : 'text-gray-900'}`}>
                  {item.price < 0 ? '-' : ''}€{Math.abs(item.price).toFixed(0)}
                </span>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-xl font-bold text-cyan-700">
              <span>Total Treatment Cost:</span>
              <span>€{quote.total.toFixed(0)} onSave={() => {}} /></span>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => window.open('mailto:appointments@dentalclinic.com?subject=Dental Consultation Booking', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
            <Button variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50">
              <Download className="w-4 h-4 mr-2" />
              Download PDF Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient information summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700">Consultation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Patient:</strong> {formData.name}<br />
              <strong>Email:</strong> {formData.email}<br />
              {formData.phone && <><strong>Phone:</strong> {formData.phone}<br /></>}
            </div>
            <div>
              {formData.preferredDate && <><strong>Preferred Date:</strong> {formData.preferredDate}<br /></>}
              <strong>Payment Plan:</strong> {formData.paymentPlan.replace('-', ' ')}<br />
              <strong>Insurance:</strong> {formData.insurance ? 'Yes' : 'No'}
            </div>
          </div>
          {formData.additionalNotes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <strong>Notes:</strong> {formData.additionalNotes}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const canProceedStep1 = formData.treatmentType;
  const canProceedStep2 = formData.name && formData.email;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <ToothIcon />
            </motion.div>
            <h3 className="text-xl font-semibold text-cyan-700 mb-2">Calculating Your Quote</h3>
            <p className="text-gray-600">Analyzing treatment options and pricing...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-cyan-600 rounded-full text-white">
              <ToothIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Dental Treatment Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get an instant estimate for your dental treatment. Professional, transparent pricing with flexible payment options.
          </p>
        </div>

        {!showQuote && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? "bg-cyan-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 2: {currentStep === 1 ? "Treatment Selection" : "Contact Information"}
            </div>
          </div>
        )}

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {!showQuote && currentStep === 1 && renderStep1()}
              {!showQuote && currentStep === 2 && renderStep2()}
              {showQuote && renderQuote()}
            </AnimatePresence>

            {!showQuote && (
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="border-cyan-600 text-cyan-600"
                  >
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 2 ? (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedStep1}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Next: Contact Info
                  </Button>
                ) : (
                  <Button
                    onClick={calculateQuote}
                    disabled={!canProceedStep2}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <SmileIcon />
                    Get My Quote
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Licensed Practitioners</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Over 2000 Happy Patients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}