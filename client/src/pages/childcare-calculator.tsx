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
  Baby,
  Home,
  Sun,
  Moon,
  Utensils,
  BookOpen,
  HeartHandshake,
  Gift
} from "lucide-react";
import { QuoteKitHeader } from "@/components/calculator-header";

// Childcare-specific icons
const TeddyBearIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="13" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="9" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="15" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="10" cy="11" r="0.5"/>
    <circle cx="14" cy="11" r="0.5"/>
    <path d="M11 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlaygroundIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L8 8h8l-4-6z" fill="none" stroke="currentColor" strokeWidth="2"/>
    <rect x="6" y="8" width="12" height="2" fill="currentColor"/>
    <path d="M8 10v6l2 2h4l2-2v-6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="10" cy="14" r="1"/>
    <circle cx="14" cy="14" r="1"/>
  </svg>
);

interface ChildcareConfig {
  careTypes: {
    [key: string]: number;
  };
  ageGroups: {
    [key: string]: number;
  };
  timeSlots: {
    [key: string]: number;
  };
  addOns: {
    [key: string]: number;
  };
  discounts: {
    multiChild: number;
    subsidy: number;
  };
  promoCodes: {
    [key: string]: number;
  };
}

const defaultConfig: ChildcareConfig = {
  careTypes: {
    "full-day": 60,
    "half-day": 35,
    "after-school": 25,
    "weekend": 70,
    "overnight": 80
  },
  ageGroups: {
    "infant": 1.2,
    "toddler": 1.1,
    "preschooler": 1.0,
    "school-age": 0.9
  },
  timeSlots: {
    "morning": 1.0,
    "afternoon": 1.0,
    "evening": 1.1,
    "overnight": 1.3
  },
  addOns: {
    "meals": 5,
    "homework": 10,
    "extra-child": 20,
    "special-needs": 15
  },
  discounts: {
    multiChild: 0.15,
    subsidy: 0.20
  },
  promoCodes: {
    "CARE10": 10,
    "FAMILY20": 20,
    "FIRSTTIME15": 15
  }
};

interface ChildcareCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function ChildcareCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: ChildcareCalculatorProps = {}) {
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
    careType: "",
    childAge: "",
    daysPerWeek: "5",
    timeSlot: "morning",
    numberOfChildren: "1",
    addOns: [] as string[],
    hasSubsidy: false,
    promoCode: "",
    
    // Lead capture
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    startDate: "",
    additionalNotes: ""
  });

  const [quote, setQuote] = useState({
    dailyRate: 0,
    weeklyRate: 0,
    addOnTotal: 0,
    discount: 0,
    total: 0,
    breakdown: [] as Array<{name: string, price: number, type: 'care' | 'addon' | 'discount'}>
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
      const response = await fetch("/api/ai/process-childcare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          careType: result.careType || prev.careType,
          childAge: result.childAge || prev.childAge,
          daysPerWeek: result.daysPerWeek || prev.daysPerWeek,
          numberOfChildren: result.numberOfChildren || prev.numberOfChildren,
          addOns: result.addOns || prev.addOns,
          hasSubsidy: result.hasSubsidy !== undefined ? result.hasSubsidy : prev.hasSubsidy
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
      let dailyRate = 0;
      let addOnTotal = 0;
      let discount = 0;
      const breakdown: Array<{name: string, price: number, type: 'care' | 'addon' | 'discount'}> = [];

      // Calculate base daily rate
      const baseCare = defaultConfig.careTypes[formData.careType] || customConfig?.basePrice || 45;
      const ageMultiplier = defaultConfig.ageGroups[formData.childAge] || 1.0;
      const timeMultiplier = defaultConfig.timeSlots[formData.timeSlot] || 1.0;
      
      dailyRate = baseCare * ageMultiplier * timeMultiplier;
      
      const careTypeNames: {[key: string]: string} = {
        "full-day": "Full-Day Care (8 hours)",
        "half-day": "Half-Day Care (4 hours)",
        "after-school": "After-School Care",
        "weekend": "Weekend Care",
        "overnight": "Overnight Care"
      };
      
      const ageNames: {[key: string]: string} = {
        "infant": "Infant Care (0-1 yrs)",
        "toddler": "Toddler Care (1-3 yrs)",
        "preschooler": "Preschooler Care (3-5 yrs)",
        "school-age": "School-Age Care (5-12 yrs)"
      };
      
      breakdown.push({
        name: `${careTypeNames[formData.careType]} - ${ageNames[formData.childAge]}`,
        price: dailyRate,
        type: 'care'
      });

      // Calculate add-ons
      formData.addOns.forEach(addon => {
        const addonPrice = defaultConfig.addOns[addon] || 0;
        addOnTotal += addonPrice;
        
        const addonNames: {[key: string]: string} = {
          "meals": "Meals Provided",
          "homework": "Homework Help",
          "extra-child": "Additional Child",
          "special-needs": "Special Needs Support"
        };
        
        breakdown.push({
          name: addonNames[addon] || addon,
          price: addonPrice,
          type: 'addon'
        });
      });

      // Calculate weekly rate
      const daysPerWeek = parseInt(formData.daysPerWeek);
      const numberOfChildren = parseInt(formData.numberOfChildren);
      let weeklyBase = (dailyRate + addOnTotal) * daysPerWeek * numberOfChildren;
      
      if (numberOfChildren > 1) {
        breakdown.push({
          name: `Multiple Children (${numberOfChildren} children)`,
          price: (dailyRate + addOnTotal) * daysPerWeek * (numberOfChildren - 1),
          type: 'care'
        });
      }

      // Calculate discounts
      if (numberOfChildren > 1) {
        const multiChildDiscount = weeklyBase * defaultConfig.discounts.multiChild;
        discount += multiChildDiscount;
        breakdown.push({
          name: "Multi-Child Discount (15%)",
          price: -multiChildDiscount,
          type: 'discount'
        });
      }
      
      if (formData.hasSubsidy) {
        const subsidyDiscount = weeklyBase * defaultConfig.discounts.subsidy;
        discount += subsidyDiscount;
        breakdown.push({
          name: "Childcare Subsidy (20%)",
          price: -subsidyDiscount,
          type: 'discount'
        });
      }
      
      if (formData.promoCode && defaultConfig.promoCodes[formData.promoCode.toUpperCase()]) {
        const promoDiscount = defaultConfig.promoCodes[formData.promoCode.toUpperCase()];
        discount += promoDiscount;
        breakdown.push({
          name: `Promo Code: ${formData.promoCode.toUpperCase()}`,
          price: -promoDiscount,
          type: 'discount'
        });
      }

      const total = weeklyBase - discount;

      setQuote({
        dailyRate,
        weeklyRate: weeklyBase,
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
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-emerald-600" />
            <Label className="text-emerald-700 font-medium">Tell Us About Your Childcare Needs</Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., 'I need full-day care for 2 toddlers with meals included' or 'After-school care for a 6-year-old with homework help'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={processNaturalLanguage}
              disabled={isProcessingNL || !naturalLanguageInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
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
          <p className="text-xs text-emerald-600 mt-2">AI will auto-fill the form based on your description</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Type of Care Needed *</Label>
            <Select value={formData.careType} onValueChange={(value) => setFormData(prev => ({...prev, careType: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select care type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-day">Full-Day Care (8 hours)</SelectItem>
                <SelectItem value="half-day">Half-Day Care (4 hours)</SelectItem>
                <SelectItem value="after-school">After-School Pickup</SelectItem>
                <SelectItem value="weekend">Weekend Care</SelectItem>
                <SelectItem value="overnight">Overnight Babysitting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Child's Age Group *</Label>
            <Select value={formData.childAge} onValueChange={(value) => setFormData(prev => ({...prev, childAge: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infant">Infant (0-1 years)</SelectItem>
                <SelectItem value="toddler">Toddler (1-3 years)</SelectItem>
                <SelectItem value="preschooler">Preschooler (3-5 years)</SelectItem>
                <SelectItem value="school-age">School-Age (5-12 years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Days Per Week</Label>
            <Select value={formData.daysPerWeek} onValueChange={(value) => setFormData(prev => ({...prev, daysPerWeek: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day} {day === 1 ? 'day' : 'days'} per week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Number of Children</Label>
            <Select value={formData.numberOfChildren} onValueChange={(value) => setFormData(prev => ({...prev, numberOfChildren: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'child' : 'children'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Preferred Time Slot</Label>
            <Select value={formData.timeSlot} onValueChange={(value) => setFormData(prev => ({...prev, timeSlot: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (7 AM - 12 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                <SelectItem value="overnight">Overnight (10 PM - 7 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Services</Label>
            <div className="space-y-3 mt-2">
              {[
                { id: "meals", label: "Meals Provided", price: "€5/day", icon: Utensils },
                { id: "homework", label: "Homework Help", price: "€10/day", icon: BookOpen },
                { id: "special-needs", label: "Special Needs Support", price: "€15/day", icon: HeartHandshake }
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
                  <addon.icon className="w-4 h-4 text-emerald-600" />
                  <Label htmlFor={addon.id} className="flex-1 cursor-pointer">
                    {addon.label}
                  </Label>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {addon.price}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="subsidy"
                checked={formData.hasSubsidy}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, hasSubsidy: !!checked}))}
              />
              <Gift className="w-4 h-4 text-emerald-600" />
              <Label htmlFor="subsidy" className="cursor-pointer">
                I have childcare subsidy/vouchers (20% discount)
              </Label>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Promo Code (Optional)</Label>
              <Input
                placeholder="Enter promo code"
                value={formData.promoCode}
                onChange={(e) => setFormData(prev => ({...prev, promoCode: e.target.value}))}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Valid codes: CARE10, FAMILY20, FIRSTTIME15</p>
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
            <Label className="text-gray-700 font-medium">Parent/Guardian Name *</Label>
            <Input
              value={formData.parentName}
              onChange={(e) => setFormData(prev => ({...prev, parentName: e.target.value}))}
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
            <Label className="text-gray-700 font-medium">Child's Name</Label>
            <Input
              value={formData.childName}
              onChange={(e) => setFormData(prev => ({...prev, childName: e.target.value}))}
              placeholder="Child's first name"
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Preferred Start Date</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
              className="border-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
              placeholder="Any special requirements, allergies, or additional information..."
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
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-700">Quote Valid For:</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / (48 * 60 * 60)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Quote breakdown */}
      <Card className="border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <TeddyBearIcon />
            Your Weekly Childcare Estimate
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
                  {item.type === 'care' && item.name.includes('Day Care') ? '/day' : ''}
                  {item.type === 'addon' && !item.name.includes('Child') ? '/day' : ''}
                </span>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-xl font-bold text-emerald-700">
              <span>Total Weekly Cost:</span>
              <span>€{quote.total.toFixed(0)} onSave={() => {}} /></span>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-2">
              <span>Daily average: €{(quote.total / parseInt(formData.daysPerWeek)).toFixed(0)} onSave={() => {}} /></span>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.open('mailto:hello@childcareservice.com?subject=Childcare Booking Request', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Request Childcare
            </Button>
            <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              <Download className="w-4 h-4 mr-2" />
              Download Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family information summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700">Care Details Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Parent:</strong> {formData.parentName}<br />
              <strong>Email:</strong> {formData.email}<br />
              {formData.phone && <><strong>Phone:</strong> {formData.phone}<br /></>}
              {formData.childName && <><strong>Child:</strong> {formData.childName}<br /></>}
            </div>
            <div>
              <strong>Care Type:</strong> {formData.careType.replace('-', ' ')}<br />
              <strong>Days:</strong> {formData.daysPerWeek} days/week<br />
              <strong>Children:</strong> {formData.numberOfChildren}<br />
              {formData.startDate && <><strong>Start Date:</strong> {formData.startDate}<br /></>}
            </div>
          </div>
          {formData.additionalNotes && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <strong>Additional Notes:</strong> {formData.additionalNotes}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const canProceedStep1 = formData.careType && formData.childAge;
  const canProceedStep2 = formData.parentName && formData.email;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <TeddyBearIcon />
            </motion.div>
            <h3 className="text-xl font-semibold text-emerald-700 mb-2">Calculating Your Childcare Quote</h3>
            <p className="text-gray-600">Creating a personalized care plan for your family...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-orange-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-600 rounded-full text-white">
              <TeddyBearIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Childcare Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a personalized quote for quality childcare services. Safe, nurturing, and affordable care for your little ones.
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
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 2: {currentStep === 1 ? "Care Requirements" : "Contact Information"}
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
                    className="border-emerald-600 text-emerald-600"
                  >
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 2 ? (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedStep1}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next: Contact Info
                  </Button>
                ) : (
                  <Button
                    onClick={calculateQuote}
                    disabled={!canProceedStep2}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <TeddyBearIcon />
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
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Background Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Caring & Professional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}