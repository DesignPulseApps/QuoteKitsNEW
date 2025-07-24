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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
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
  Stethoscope,
  Award,
  Info,
  FileText,
  Activity,
  Clipboard,
  UserCheck,
  Thermometer,
  Microscope,
  Scan,
  PillBottle
} from "lucide-react";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";

// Medical specific icons
const MedicalIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="white"/>
  </svg>
);

const DiagnosticIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 8h10M7 12h8M7 16h6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="19" cy="8" r="2" fill="currentColor"/>
  </svg>
);

interface MedicalConfig {
  consultations: {
    [key: string]: number;
  };
  serviceCategories: {
    [key: string]: number;
  };
  urgency: {
    [key: string]: number;
  };
  addOns: {
    [key: string]: number;
  };
  discounts: {
    promo: number;
  };
  promoCodes: {
    [key: string]: number;
  };
}

const defaultConfig: MedicalConfig = {
  consultations: {
    "general-gp": 90,
    "specialist": 150,
    "health-check": 200,
    "second-opinion": 120,
    "preventative-screening": 160
  },
  serviceCategories: {
    "diagnostics": 80,
    "preventative": 60,
    "cosmetic": 200,
    "mental-health": 140
  },
  urgency: {
    "standard": 0,
    "same-day": 60,
    "priority": 40
  },
  addOns: {
    "lab-tests": 75,
    "basic-imaging": 120,
    "advanced-imaging": 250,
    "medical-certificate": 35,
    "follow-up-call": 30
  },
  discounts: {
    promo: 0.10
  },
  promoCodes: {
    "HEALTH10": 0.10,
    "CHECKUP15": 0.15,
    "WELLNESS20": 0.20
  }
};

interface PrivateMedicalCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function PrivateMedicalCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: PrivateMedicalCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessingNL, setIsProcessingNL] = useState(false);
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
    consultationType: "",
    serviceCategory: "",
    urgency: "standard",
    addOns: [] as string[],
    promoCode: "",
    
    // Patient contact
    patientName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    appointmentDate: "",
    medicalHistory: "",
    symptoms: "",
    additionalNotes: ""
  });

  const [quote, setQuote] = useState({
    consultationCost: 0,
    serviceCost: 0,
    urgencyCost: 0,
    addOnCost: 0,
    discount: 0,
    total: 0,
    breakdown: [] as Array<{name: string, price: number, type: 'consultation' | 'service' | 'urgency' | 'addon' | 'discount'}>
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
      const response = await fetch("/api/ai/process-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          consultationType: result.consultationType || prev.consultationType,
          serviceCategory: result.serviceCategory || prev.serviceCategory,
          urgency: result.urgency || prev.urgency,
          addOns: result.addOns || prev.addOns
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
      let consultationCost = 0;
      let serviceCost = 0;
      let urgencyCost = 0;
      let addOnCost = 0;
      let discount = 0;
      const breakdown: Array<{name: string, price: number, type: 'consultation' | 'service' | 'urgency' | 'addon' | 'discount'}> = [];

      // Calculate consultation cost
      consultationCost = defaultConfig.consultations[formData.consultationType] || customConfig?.basePrice || 120;
      
      const consultationNames: {[key: string]: string} = {
        "general-gp": "General GP Visit",
        "specialist": "Specialist Consultation",
        "health-check": "Health Check Package",
        "second-opinion": "Second Opinion Consultation",
        "preventative-screening": "Preventative Screening"
      };
      
      if (consultationCost > 0) {
        breakdown.push({
          name: consultationNames[formData.consultationType] || "Consultation",
          price: consultationCost,
          type: 'consultation'
        });
      }

      // Calculate service category cost
      if (formData.serviceCategory) {
        serviceCost = defaultConfig.serviceCategories[formData.serviceCategory] || 0;
        
        const serviceNames: {[key: string]: string} = {
          "diagnostics": "Diagnostic Services",
          "preventative": "Preventative Care",
          "cosmetic": "Cosmetic/Aesthetic Services",
          "mental-health": "Mental Health Services"
        };
        
        if (serviceCost > 0) {
          breakdown.push({
            name: serviceNames[formData.serviceCategory] || "Additional Service",
            price: serviceCost,
            type: 'service'
          });
        }
      }

      // Calculate urgency cost
      urgencyCost = defaultConfig.urgency[formData.urgency] || 0;
      if (urgencyCost > 0) {
        const urgencyNames: {[key: string]: string} = {
          "same-day": "Same-Day Appointment Surcharge",
          "priority": "Priority Visit Surcharge"
        };
        
        breakdown.push({
          name: urgencyNames[formData.urgency] || "Urgency Surcharge",
          price: urgencyCost,
          type: 'urgency'
        });
      }

      // Calculate add-ons
      formData.addOns.forEach(addon => {
        const addonCost = defaultConfig.addOns[addon] || 0;
        addOnCost += addonCost;
        
        const addonNames: {[key: string]: string} = {
          "lab-tests": "Laboratory Tests",
          "basic-imaging": "Basic Imaging (X-ray/Ultrasound)",
          "advanced-imaging": "Advanced Imaging (MRI/CT)",
          "medical-certificate": "Medical Certificate",
          "follow-up-call": "Follow-Up Consultation Call"
        };
        
        if (addonCost > 0) {
          breakdown.push({
            name: addonNames[addon] || addon,
            price: addonCost,
            type: 'addon'
          });
        }
      });

      // Calculate discounts
      const subtotal = consultationCost + serviceCost + urgencyCost + addOnCost;
      
      if (formData.promoCode && defaultConfig.promoCodes[formData.promoCode.toUpperCase()]) {
        const promoDiscount = subtotal * defaultConfig.promoCodes[formData.promoCode.toUpperCase()];
        discount += promoDiscount;
        breakdown.push({
          name: `Promo Code: ${formData.promoCode.toUpperCase()}`,
          price: -promoDiscount,
          type: 'discount'
        });
      }

      const total = subtotal - discount;

      setQuote({
        consultationCost,
        serviceCost,
        urgencyCost,
        addOnCost,
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
    return `${hours}h ${minutes}m`;
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Natural Language Input */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-teal-600" />
            <Label className="text-teal-700 font-medium">Describe Your Medical Needs</Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., 'I need a same-day dermatology consult with blood test' or 'General GP visit with follow-up call'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={processNaturalLanguage}
              disabled={isProcessingNL || !naturalLanguageInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 shrink-0"
            >
              {isProcessingNL ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <EditableText
                  value={textConfig.processButtonText || "Process"}
                  onSave={(value) => updateTextContent('processButtonText', value)}
                  className="font-medium"
                  isPreview={isPreview}
                />
              )}
            </Button>
          </div>
          <p className="text-xs text-teal-600 mt-2">AI will auto-fill the form based on your description</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Type of Consultation *
            </Label>
            <Select value={formData.consultationType} onValueChange={(value) => setFormData(prev => ({...prev, consultationType: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select consultation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-gp">General GP Visit - €90</SelectItem>
                <SelectItem value="specialist">Specialist Appointment - €150</SelectItem>
                <SelectItem value="health-check">Health Check Package - €200</SelectItem>
                <SelectItem value="second-opinion">Second Opinion - €120</SelectItem>
                <SelectItem value="preventative-screening">Preventative Screening - €160</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Service Category
            </Label>
            <Select value={formData.serviceCategory} onValueChange={(value) => setFormData(prev => ({...prev, serviceCategory: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select service category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diagnostics">Diagnostics (+€80)</SelectItem>
                <SelectItem value="preventative">Preventative Care (+€60)</SelectItem>
                <SelectItem value="cosmetic">Cosmetic/Aesthetic (+€200)</SelectItem>
                <SelectItem value="mental-health">Mental Health (+€140)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Appointment Urgency
            </Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({...prev, urgency: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Appointment</SelectItem>
                <SelectItem value="same-day">Same-Day Visit (+€60)</SelectItem>
                <SelectItem value="priority">Priority Visit (+€40)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" />
              Promo Code (Optional)
            </Label>
            <Input
              placeholder="Enter promo code"
              value={formData.promoCode}
              onChange={(e) => setFormData(prev => ({...prev, promoCode: e.target.value}))}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Valid codes: HEALTH10, CHECKUP15, WELLNESS20</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-teal-600" />
              Additional Services
            </Label>
            <div className="space-y-3 mt-2">
              <TooltipProvider>
                {[
                  { id: "lab-tests", label: "Lab Tests", price: "€75", tooltip: "Comprehensive blood work, urine analysis, and basic metabolic panel", icon: <Microscope className="w-4 h-4" /> },
                  { id: "basic-imaging", label: "Basic Imaging", price: "€120", tooltip: "X-ray, ultrasound, and basic diagnostic imaging services", icon: <Scan className="w-4 h-4" /> },
                  { id: "advanced-imaging", label: "Advanced Imaging", price: "€250", tooltip: "MRI, CT scan, and specialized diagnostic imaging", icon: <Activity className="w-4 h-4" /> },
                  { id: "medical-certificate", label: "Medical Certificate", price: "€35", tooltip: "Official medical certificate for work, travel, or insurance", icon: <FileText className="w-4 h-4" /> },
                  { id: "follow-up-call", label: "Follow-Up Call", price: "€30", tooltip: "Doctor calls 48 hours after visit to check on your progress", icon: <Phone className="w-4 h-4" /> }
                ].map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-teal-50 transition-colors">
                    <Checkbox
                      id={service.id}
                      checked={formData.addOns.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({...prev, addOns: [...prev.addOns, service.id]}));
                        } else {
                          setFormData(prev => ({...prev, addOns: prev.addOns.filter(a => a !== service.id)}));
                        }
                      }}
                    />
                    <div className="text-teal-600"><EditableText value={service.icon} onSave={() => {}} /></div>
                    <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                      {service.label}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs"><EditableText value={service.tooltip} onSave={() => {}} /></p>
                      </TooltipContent>
                    </Tooltip>
                    <Badge variant="outline" className="text-teal-600 border-teal-200">
                      {service.price}
                    </Badge>
                  </div>
                ))}
              </TooltipProvider>
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
            <Label className="text-gray-700 font-medium">Patient Name *</Label>
            <Input
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({...prev, patientName: e.target.value}))}
              placeholder="Enter patient's full name"
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              placeholder="patient@example.com"
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

          <div>
            <Label className="text-gray-700 font-medium">Date of Birth</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({...prev, dateOfBirth: e.target.value}))}
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Preferred Appointment Date</Label>
            <Input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData(prev => ({...prev, appointmentDate: e.target.value}))}
              className="border-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Medical History</Label>
            <Textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData(prev => ({...prev, medicalHistory: e.target.value}))}
              placeholder="Previous surgeries, allergies, current medications..."
              rows={2}
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Current Symptoms</Label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({...prev, symptoms: e.target.value}))}
              placeholder="Describe your current symptoms or concerns..."
              rows={2}
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
              placeholder="Any other information or questions..."
              rows={2}
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
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <span className="font-medium text-rose-700">Quote Valid For:</span>
            </div>
            <div className="text-xl font-bold text-rose-600">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / (48 * 60 * 60)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Quote breakdown */}
      <Card className="border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <MedicalIcon />
            Your Medical Quote
            <Stethoscope className="w-5 h-5 text-teal-600" />
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
            
            <div className="flex justify-between items-center text-2xl font-bold text-teal-700">
              <span>Total Cost:</span>
              <span>€{quote.total.toFixed(0)} onSave={() => {}} /></span>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-2 p-3 bg-teal-50 rounded-lg">
              <Shield className="w-4 h-4 inline mr-1" />
              <span>Licensed practitioners • Modern facilities • Comprehensive care • Patient privacy</span>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => window.open('mailto:appointments@clinic.com?subject=Medical Appointment Request', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <EditableText
                value={textConfig.bookAppointmentButtonText || "Book My Appointment"}
                onSave={(value) => updateTextContent('bookAppointmentButtonText', value)}
                className="font-medium"
                isPreview={isPreview}
              />
            </Button>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              <Download className="w-4 h-4 mr-2" />
              Download Quote PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient information summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Patient:</strong> {formData.patientName}<br />
              <strong>Email:</strong> {formData.email}<br />
              {formData.phone && <><strong>Phone:</strong> {formData.phone}<br /></>}
              {formData.dateOfBirth && <><strong>DOB:</strong> {formData.dateOfBirth}<br /></>}
            </div>
            <div>
              {formData.appointmentDate && <><strong>Appointment:</strong> {formData.appointmentDate}<br /></>}
              <strong>Consultation:</strong> {formData.consultationType.replace('-', ' ')}<br />
              {formData.serviceCategory && <><strong>Service:</strong> {formData.serviceCategory.replace('-', ' ')}<br /></>}
              <strong>Urgency:</strong> {formData.urgency}
            </div>
          </div>
          {formData.medicalHistory && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <strong className="text-yellow-700">Medical History:</strong> {formData.medicalHistory}
            </div>
          )}
          {formData.symptoms && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <strong className="text-red-700">Current Symptoms:</strong> {formData.symptoms}
            </div>
          )}
          {formData.additionalNotes && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <strong className="text-teal-700">Additional Notes:</strong> {formData.additionalNotes}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const canProceedStep1 = formData.consultationType;
  const canProceedStep2 = formData.patientName && formData.email;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 text-teal-600"
            >
              <MedicalIcon />
            </motion.div>
            <h3 className="text-xl font-semibold text-teal-700 mb-2">Calculating Your Quote</h3>
            <p className="text-gray-600">Creating your personalized medical estimate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-teal-600 rounded-full text-white">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Private Medical Calculator</h1>
            <div className="p-3 bg-navy-600 rounded-full text-white">
              <DiagnosticIcon />
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get transparent pricing for private medical consultations. Licensed practitioners, modern facilities, comprehensive care.
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
                        ? "bg-teal-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 2: {currentStep === 1 ? "Medical Services" : "Patient Information"}
            </div>
          </div>
        )}

        <Card className="shadow-lg border-0 rounded-xl">
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
                    className="border-teal-600 text-teal-600"
                  >
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 2 ? (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedStep1}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Next: Patient Info
                  </Button>
                ) : (
                  <Button
                    onClick={calculateQuote}
                    disabled={!canProceedStep2}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
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
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Licensed Practitioners</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Modern Facilities</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>Patient Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}