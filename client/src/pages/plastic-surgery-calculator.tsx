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
  Crown,
  Sparkles
} from "lucide-react";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";

// Plastic surgery specific icons
const ScalpelIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 21l8-8 8-8-2-2-8 8-8 8z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="19" cy="5" r="2" fill="currentColor"/>
    <path d="M11 13l-6 6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SurgeryIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="11" width="18" height="2" fill="currentColor" rx="1"/>
    <circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 10v7" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 17h6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface SurgeryConfig {
  procedures: {
    [key: string]: number;
  };
  anesthesia: {
    [key: string]: number;
  };
  additionalTreatments: {
    [key: string]: number;
  };
  hospitalStay: {
    [key: string]: number;
  };
  discounts: {
    promo: number;
  };
  promoCodes: {
    [key: string]: number;
  };
}

const defaultConfig: SurgeryConfig = {
  procedures: {
    "rhinoplasty": 4500,
    "breast-augmentation": 5800,
    "liposuction": 3000,
    "facelift": 7500,
    "tummy-tuck": 6200,
    "eyelid-surgery": 3800
  },
  anesthesia: {
    "local": 250,
    "general": 600
  },
  additionalTreatments: {
    "fat-transfer": 1200,
    "injectables": 300,
    "aftercare-package": 450,
    "compression-garments": 180
  },
  hospitalStay: {
    "none": 0,
    "1-night": 400,
    "2-nights": 800
  },
  discounts: {
    promo: 0.10
  },
  promoCodes: {
    "BEAUTY10": 0.10,
    "CONSULTATION15": 0.15,
    "PREMIUM20": 0.20
  }
};

interface PlasticSurgeryCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function PlasticSurgeryCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: PlasticSurgeryCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60); // 72 hours in seconds
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(null);
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

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to plastic surgery calculator:', config);
    setCustomConfig(config);
    
    // Apply primary color
    if (config.brandColors?.primary) {
      document.documentElement.style.setProperty('--primary', config.brandColors.primary);
      document.documentElement.style.setProperty('--pink-500', config.brandColors.primary);
      document.documentElement.style.setProperty('--rose-500', config.brandColors.primary);
    }
    
    // Apply secondary color
    if (config.brandColors?.secondary) {
      document.documentElement.style.setProperty('--secondary', config.brandColors.secondary);
      document.documentElement.style.setProperty('--slate-700', config.brandColors.secondary);
    }
    
    // Apply accent color
    if (config.brandColors?.accent) {
      document.documentElement.style.setProperty('--accent', config.brandColors.accent);
      document.documentElement.style.setProperty('--purple-500', config.brandColors.accent);
    }
    
    // Apply typography
    if (config.styling?.fontFamily) {
      document.documentElement.style.setProperty('--font-family', config.styling.fontFamily);
      document.body.style.fontFamily = config.styling.fontFamily;
    }
    
    // Apply border radius
    if (config.styling?.borderRadius) {
      document.documentElement.style.setProperty('--radius', config.styling.borderRadius);
    }
    
    // Update company branding
    if (config.companyBranding?.companyName) {
      document.title = `${config.companyBranding.companyName} - Plastic Surgery Consultation`;
    }
    
    // Force re-render
    document.body.classList.add('config-applied');
    setTimeout(() => document.body.classList.remove('config-applied'), 100);
  };

  const getCompanyName = () => {
    return customConfig?.companyBranding?.companyName || 'Plastic Surgery Clinic';
  };

  const [formData, setFormData] = useState({
    procedure: "",
    anesthesiaType: "general",
    additionalTreatments: [] as string[],
    hospitalStay: "none",
    consultationType: "in-person",
    promoCode: "",
    
    // Lead capture
    patientName: "",
    email: "",
    phone: "",
    age: "",
    consultationDate: "",
    medicalHistory: "",
    additionalNotes: ""
  });

  const [quote, setQuote] = useState({
    procedureCost: customConfig?.basePrice || 0,
    anesthesiaCost: 0,
    additionalCost: 0,
    hospitalCost: 0,
    discount: 0,
    total: 0,
    breakdown: [] as Array<{name: string, price: number, type: 'procedure' | 'anesthesia' | 'additional' | 'hospital' | 'discount'}>
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
      const response = await fetch("/api/ai/process-plasticsurgery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          procedure: result.procedure || prev.procedure,
          anesthesiaType: result.anesthesiaType || prev.anesthesiaType,
          additionalTreatments: result.additionalTreatments || prev.additionalTreatments,
          hospitalStay: result.hospitalStay || prev.hospitalStay,
          consultationType: result.consultationType || prev.consultationType
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
      let procedureCost = 0;
      let anesthesiaCost = 0;
      let additionalCost = 0;
      let hospitalCost = 0;
      let discount = 0;
      const breakdown: Array<{name: string, price: number, type: 'procedure' | 'anesthesia' | 'additional' | 'hospital' | 'discount'}> = [];

      // Calculate procedure cost
      procedureCost = defaultConfig.procedures[formData.procedure] || 0;
      
      const procedureNames: {[key: string]: string} = {
        "rhinoplasty": "Rhinoplasty (Nose Job)",
        "breast-augmentation": "Breast Augmentation",
        "liposuction": "Liposuction",
        "facelift": "Facelift",
        "tummy-tuck": "Tummy Tuck (Abdominoplasty)",
        "eyelid-surgery": "Eyelid Surgery (Blepharoplasty)"
      };
      
      if (procedureCost > 0) {
        breakdown.push({
          name: procedureNames[formData.procedure] || "Procedure",
          price: procedureCost,
          type: 'procedure'
        });
      }

      // Calculate anesthesia cost
      anesthesiaCost = defaultConfig.anesthesia[formData.anesthesiaType] || 0;
      if (anesthesiaCost > 0) {
        breakdown.push({
          name: `${formData.anesthesiaType.charAt(0).toUpperCase() + formData.anesthesiaType.slice(1)} Anesthesia`,
          price: anesthesiaCost,
          type: 'anesthesia'
        });
      }

      // Calculate additional treatments
      formData.additionalTreatments.forEach(treatment => {
        const treatmentCost = defaultConfig.additionalTreatments[treatment] || 0;
        additionalCost += treatmentCost;
        
        const treatmentNames: {[key: string]: string} = {
          "fat-transfer": "Fat Transfer Enhancement",
          "injectables": "Injectables (Botox/Fillers)",
          "aftercare-package": "Post-Op Aftercare Package",
          "compression-garments": "Compression Garments"
        };
        
        if (treatmentCost > 0) {
          breakdown.push({
            name: treatmentNames[treatment] || treatment,
            price: treatmentCost,
            type: 'additional'
          });
        }
      });

      // Calculate hospital stay
      hospitalCost = defaultConfig.hospitalStay[formData.hospitalStay] || 0;
      if (hospitalCost > 0) {
        const stayNames: {[key: string]: string} = {
          "1-night": "Hospital Stay (1 Night)",
          "2-nights": "Hospital Stay (2 Nights)"
        };
        
        breakdown.push({
          name: stayNames[formData.hospitalStay] || "Hospital Stay",
          price: hospitalCost,
          type: 'hospital'
        });
      }

      // Calculate discounts
      const subtotal = procedureCost + anesthesiaCost + additionalCost + hospitalCost;
      
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
        procedureCost,
        anesthesiaCost,
        additionalCost,
        hospitalCost,
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
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <Label className="text-amber-700 font-medium">Describe Your Aesthetic Goals</Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., 'I want a nose job with general anesthesia and one night stay' or 'Breast augmentation with fat transfer and aftercare package'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={processNaturalLanguage}
              disabled={isProcessingNL || !naturalLanguageInput.trim()}
              className="bg-amber-600 hover:bg-amber-700 shrink-0"
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
          <p className="text-xs text-amber-600 mt-2">AI will auto-fill the form based on your description</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Procedure Type *</Label>
            <Select value={formData.procedure} onValueChange={(value) => setFormData(prev => ({...prev, procedure: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rhinoplasty">Rhinoplasty (Nose Job)</SelectItem>
                <SelectItem value="breast-augmentation">Breast Augmentation</SelectItem>
                <SelectItem value="liposuction">Liposuction</SelectItem>
                <SelectItem value="facelift">Facelift</SelectItem>
                <SelectItem value="tummy-tuck">Tummy Tuck (Abdominoplasty)</SelectItem>
                <SelectItem value="eyelid-surgery">Eyelid Surgery (Blepharoplasty)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Anesthesia Type</Label>
            <Select value={formData.anesthesiaType} onValueChange={(value) => setFormData(prev => ({...prev, anesthesiaType: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Anesthesia (+€250)</SelectItem>
                <SelectItem value="general">General Anesthesia (+€600)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Hospital Stay</Label>
            <Select value={formData.hospitalStay} onValueChange={(value) => setFormData(prev => ({...prev, hospitalStay: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Outpatient (No Stay)</SelectItem>
                <SelectItem value="1-night">1 Night (+€400)</SelectItem>
                <SelectItem value="2-nights">2+ Nights (+€800)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Consultation Preference</Label>
            <Select value={formData.consultationType} onValueChange={(value) => setFormData(prev => ({...prev, consultationType: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In-Person Consultation</SelectItem>
                <SelectItem value="online">Online Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Additional Treatments</Label>
            <div className="space-y-3 mt-2">
              <TooltipProvider>
                {[
                  { id: "fat-transfer", label: "Fat Transfer", price: "€1,200", tooltip: "Transfers fat from one area to another for enhanced shaping" },
                  { id: "injectables", label: "Injectables (Botox/Fillers)", price: "€300", tooltip: "Non-surgical enhancement with injectables" },
                  { id: "aftercare-package", label: "Post-Op Aftercare Package", price: "€450", tooltip: "Comprehensive post-operative care and follow-ups" },
                  { id: "compression-garments", label: "Compression Garments", price: "€180", tooltip: "Medical-grade compression wear for optimal healing" }
                ].map((treatment) => (
                  <div key={treatment.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={treatment.id}
                      checked={formData.additionalTreatments.includes(treatment.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({...prev, additionalTreatments: [...prev.additionalTreatments, treatment.id]}));
                        } else {
                          setFormData(prev => ({...prev, additionalTreatments: prev.additionalTreatments.filter(t => t !== treatment.id)}));
                        }
                      }}
                    />
                    <Label htmlFor={treatment.id} className="flex-1 cursor-pointer">
                      {treatment.label}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs"><EditableText value={treatment.tooltip} onSave={() => {}} /></p>
                      </TooltipContent>
                    </Tooltip>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      {treatment.price}
                    </Badge>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Promo Code (Optional)</Label>
            <Input
              placeholder="Enter promo code"
              value={formData.promoCode}
              onChange={(e) => setFormData(prev => ({...prev, promoCode: e.target.value}))}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Valid codes: BEAUTY10, CONSULTATION15, PREMIUM20</p>
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
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({...prev, patientName: e.target.value}))}
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

          <div>
            <Label className="text-gray-700 font-medium">Age</Label>
            <Input
              type="number"
              min="18"
              max="80"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({...prev, age: e.target.value}))}
              placeholder="Enter your age"
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Preferred Consultation Date</Label>
            <Input
              type="date"
              value={formData.consultationDate}
              onChange={(e) => setFormData(prev => ({...prev, consultationDate: e.target.value}))}
              className="border-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Medical History</Label>
            <Textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData(prev => ({...prev, medicalHistory: e.target.value}))}
              placeholder="Previous surgeries, allergies, medications..."
              rows={2}
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
              placeholder="Specific goals, concerns, or questions..."
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
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <span className="font-medium text-rose-700">Quote Valid For:</span>
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / (72 * 60 * 60)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Quote breakdown */}
      <Card className="border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <SurgeryIcon />
            Your Plastic Surgery Quote
            <Crown className="w-5 h-5 text-amber-600" />
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
            
            <div className="flex justify-between items-center text-2xl font-bold text-amber-700">
              <span>Total Investment:</span>
              <span>€{quote.total.toFixed(0)} onSave={() => {}} /></span>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-2 p-3 bg-amber-50 rounded-lg">
              <Sparkles className="w-4 h-4 inline mr-1" />
              <span>Financing options available • Board-certified surgeons • Premium care</span>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.open('mailto:consultations@plasticsurgery.com?subject=Surgery Consultation Request', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <EditableText
                value={textConfig.requestConsultationButtonText || "Request Consultation"}
                onSave={(value) => updateTextContent('requestConsultationButtonText', value)}
                className="font-medium"
                isPreview={isPreview}
              />
            </Button>
            <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
              <Download className="w-4 h-4 mr-2" />
              Download Quote PDF
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
              <strong>Patient:</strong> {formData.patientName}<br />
              <strong>Email:</strong> {formData.email}<br />
              {formData.phone && <><strong>Phone:</strong> {formData.phone}<br /></>}
              {formData.age && <><strong>Age:</strong> {formData.age}<br /></>}
            </div>
            <div>
              {formData.consultationDate && <><strong>Consultation Date:</strong> {formData.consultationDate}<br /></>}
              <strong>Consultation Type:</strong> {formData.consultationType.replace('-', ' ')}<br />
              <strong>Procedure:</strong> {formData.procedure.replace('-', ' ')}<br />
              <strong>Anesthesia:</strong> {formData.anesthesiaType}
            </div>
          </div>
          {formData.medicalHistory && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <strong>Medical History:</strong> {formData.medicalHistory}
            </div>
          )}
          {formData.additionalNotes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <strong>Additional Notes:</strong> {formData.additionalNotes}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const canProceedStep1 = formData.procedure;
  const canProceedStep2 = formData.patientName && formData.email;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-rose-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <SurgeryIcon />
            </motion.div>
            <h3 className="text-xl font-semibold text-amber-700 mb-2">Calculating Your Quote</h3>
            <p className="text-gray-600">Creating your personalized surgical estimate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-rose-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-amber-600 rounded-full text-white">
              <SurgeryIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Plastic Surgery Calculator</h1>
            <Crown className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a personalized quote for your aesthetic transformation. Board-certified surgeons, premium care, beautiful results.
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
                        ? "bg-amber-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? "bg-amber-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 2: {currentStep === 1 ? "Procedure Selection" : "Patient Information"}
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
                    className="border-amber-600 text-amber-600"
                  >
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 2 ? (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedStep1}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Next: Patient Info
                  </Button>
                ) : (
                  <Button
                    onClick={calculateQuote}
                    disabled={!canProceedStep2}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <SurgeryIcon />
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
              <span>Board Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>20+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Premium Care</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}