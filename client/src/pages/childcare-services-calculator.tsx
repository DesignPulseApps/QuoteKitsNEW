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
  Baby,
  Home,
  Award,
  Info,
  Smile,
  BookOpen,
  Utensils,
  Car,
  Sun,
  Moon,
  Palette,
  Gift
} from "lucide-react";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";

// Childcare specific icons
const TeddyBearIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" fill="currentColor"/>
    <circle cx="8" cy="8" r="2" fill="currentColor"/>
    <circle cx="16" cy="8" r="2" fill="currentColor"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
    <path d="M10 14 Q12 16 14 14" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const SchoolBagIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" opacity="0.8"/>
    <path d="M10 11h4" stroke="white" strokeWidth="2"/>
  </svg>
);

const CrayonIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 21 L9 15 L13 19 L21 3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="9" cy="15" r="2" fill="currentColor"/>
    <circle cx="13" cy="19" r="2" fill="currentColor"/>
  </svg>
);

interface ChildcareConfig {
  ageGroups: {
    [key: string]: number;
  };
  schedules: {
    [key: string]: number;
  };
  additionalServices: {
    [key: string]: number;
  };
  discounts: {
    sibling: number;
    promo: number;
  };
  promoCodes: {
    [key: string]: number;
  };
}

const defaultConfig: ChildcareConfig = {
  ageGroups: {
    "infant": 950,      // 0-2 years
    "toddler": 750,     // 2-3 years
    "preschool": 650,   // 3-5 years
    "school-age": 480   // 6-10 years
  },
  schedules: {
    "full-time": 1.0,       // 5 days/week
    "part-time": 0.68,      // 3 days/week
    "after-school": 0.45,   // After school only
    "holiday-care": 0.3     // Holiday care only
  },
  additionalServices: {
    "meals": 80,
    "transport": 120,
    "early-late": 60,
    "learning-support": 150
  },
  discounts: {
    sibling: 0.15,  // 15% per sibling
    promo: 0.10     // 10% promo discount
  },
  promoCodes: {
    "FAMILY10": 0.10,
    "WELCOME15": 0.15,
    "NEWCHILD20": 0.20
  }
};

interface ChildcareServicesCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function ChildcareServicesCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: ChildcareServicesCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 24 * 60 * 60); // 5 days in seconds
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
    ageGroup: "",
    schedule: "full-time",
    duration: "monthly",
    additionalServices: [] as string[],
    numberOfChildren: "1",
    promoCode: "",
    
    // Parent contact
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    startDate: "",
    specialNeeds: "",
    additionalNotes: ""
  });

  const [quote, setQuote] = useState({
    baseCost: 0,
    additionalCost: 0,
    siblingDiscount: 0,
    promoDiscount: 0,
    total: 0,
    breakdown: [] as Array<{name: string, price: number, type: 'base' | 'additional' | 'discount'}>
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
      const response = await fetch("/api/ai/process-childcare-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          ageGroup: result.ageGroup || prev.ageGroup,
          schedule: result.schedule || prev.schedule,
          duration: result.duration || prev.duration,
          additionalServices: result.additionalServices || prev.additionalServices,
          numberOfChildren: result.numberOfChildren || prev.numberOfChildren
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
      let baseCost = 0;
      let additionalCost = 0;
      let siblingDiscount = 0;
      let promoDiscount = 0;
      const breakdown: Array<{name: string, price: number, type: 'base' | 'additional' | 'discount'}> = [];

      // Calculate base cost
      const ageGroupCost = defaultConfig.ageGroups[formData.ageGroup] || customConfig?.basePrice || 800;
      const scheduleMultiplier = defaultConfig.schedules[formData.schedule] || 1.0;
      baseCost = ageGroupCost * scheduleMultiplier;
      
      const ageGroupNames: {[key: string]: string} = {
        "infant": "Infant Care (0-2 years)",
        "toddler": "Toddler Care (2-3 years)",
        "preschool": "Preschool Care (3-5 years)",
        "school-age": "School Age Care (6-10 years)"
      };
      
      const scheduleNames: {[key: string]: string} = {
        "full-time": "Full-Time (5 days/week)",
        "part-time": "Part-Time (3 days/week)",
        "after-school": "After School Only",
        "holiday-care": "Holiday Care"
      };
      
      if (baseCost > 0) {
        breakdown.push({
          name: `${ageGroupNames[formData.ageGroup]} - ${scheduleNames[formData.schedule]}`,
          price: baseCost,
          type: 'base'
        });
      }

      // Calculate additional services
      formData.additionalServices.forEach(service => {
        const serviceCost = defaultConfig.additionalServices[service] || 0;
        additionalCost += serviceCost;
        
        const serviceNames: {[key: string]: string} = {
          "meals": "Meals & Snacks",
          "transport": "Transportation Service",
          "early-late": "Early Drop-Off / Late Pick-Up",
          "learning-support": "Special Learning Support"
        };
        
        if (serviceCost > 0) {
          breakdown.push({
            name: serviceNames[service] || service,
            price: serviceCost,
            type: 'additional'
          });
        }
      });

      // Calculate sibling discount
      const numChildren = parseInt(formData.numberOfChildren) || 1;
      if (numChildren > 1) {
        const subtotal = baseCost + additionalCost;
        siblingDiscount = subtotal * defaultConfig.discounts.sibling * (numChildren - 1);
        breakdown.push({
          name: `Sibling Discount (${numChildren - 1} additional child${numChildren > 2 ? 'ren' : ''})`,
          price: -siblingDiscount,
          type: 'discount'
        });
      }

      // Calculate promo discount
      const subtotal = baseCost + additionalCost - siblingDiscount;
      if (formData.promoCode && defaultConfig.promoCodes[formData.promoCode.toUpperCase()]) {
        promoDiscount = subtotal * defaultConfig.promoCodes[formData.promoCode.toUpperCase()];
        breakdown.push({
          name: `Promo Code: ${formData.promoCode.toUpperCase()}`,
          price: -promoDiscount,
          type: 'discount'
        });
      }

      const total = baseCost + additionalCost - siblingDiscount - promoDiscount;

      setQuote({
        baseCost,
        additionalCost,
        siblingDiscount,
        promoDiscount,
        total,
        breakdown
      });

      setIsCalculating(false);
      setShowQuote(true);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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
            <Label className="text-emerald-700 font-medium">
              <EditableText
                value={textConfig.naturalLanguageLabel || "Tell Us About Your Childcare Needs"}
                onSave={(value) => updateTextContent('naturalLanguageLabel', value)}
                className="text-emerald-700 font-medium"
                isPreview={isPreview}
              />
            </Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., 'I need full-time care for my toddler with meals and transport' or 'After school care for 2 school-age children'"
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
                <EditableText
                  value={textConfig.helpMeButtonText || "Help Me"}
                  onSave={(value) => updateTextContent('helpMeButtonText', value)}
                  className="font-medium"
                  isPreview={isPreview}
                />
              )}
            </Button>
          </div>
          <p className="text-xs text-emerald-600 mt-2">AI will help fill out the form based on your description</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Baby className="w-4 h-4 text-emerald-600" />
              Child Age Group *
            </Label>
            <Select value={formData.ageGroup} onValueChange={(value) => setFormData(prev => ({...prev, ageGroup: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infant">Infant (0-2 years) - €950/month</SelectItem>
                <SelectItem value="toddler">Toddler (2-3 years) - €750/month</SelectItem>
                <SelectItem value="preschool">Preschool (3-5 years) - €650/month</SelectItem>
                <SelectItem value="school-age">School Age (6-10 years) - €480/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Care Schedule
            </Label>
            <Select value={formData.schedule} onValueChange={(value) => setFormData(prev => ({...prev, schedule: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-Time (5 days/week)</SelectItem>
                <SelectItem value="part-time">Part-Time (3 days/week)</SelectItem>
                <SelectItem value="after-school">After School Only</SelectItem>
                <SelectItem value="holiday-care">Holiday Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Care Duration
            </Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({...prev, duration: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                <SelectItem value="annual">Annual (12 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Number of Children
            </Label>
            <Select value={formData.numberOfChildren} onValueChange={(value) => setFormData(prev => ({...prev, numberOfChildren: value}))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Child</SelectItem>
                <SelectItem value="2">2 Children (15% sibling discount)</SelectItem>
                <SelectItem value="3">3 Children (30% sibling discount)</SelectItem>
                <SelectItem value="4">4 Children (45% sibling discount)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-600" />
              Additional Services
            </Label>
            <div className="space-y-3 mt-2">
              <TooltipProvider>
                {[
                  { id: "meals", label: "Meals & Snacks", price: "€80/month", tooltip: "Nutritious breakfast, lunch, and afternoon snacks included", icon: <Utensils className="w-4 h-4" /> },
                  { id: "transport", label: "Transportation", price: "€120/month", tooltip: "Safe pickup and drop-off service with certified drivers", icon: <Car className="w-4 h-4" /> },
                  { id: "early-late", label: "Early/Late Hours", price: "€60/month", tooltip: "Extended hours for early drop-off (7 AM) and late pickup (7 PM)", icon: <Clock className="w-4 h-4" /> },
                  { id: "learning-support", label: "Learning Support", price: "€150/month", tooltip: "Specialized educational activities and developmental support", icon: <BookOpen className="w-4 h-4" /> }
                ].map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                    <Checkbox
                      id={service.id}
                      checked={formData.additionalServices.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({...prev, additionalServices: [...prev.additionalServices, service.id]}));
                        } else {
                          setFormData(prev => ({...prev, additionalServices: prev.additionalServices.filter(s => s !== service.id)}));
                        }
                      }}
                    />
                    <div className="text-emerald-600"><EditableText value={service.icon} onSave={() => {}} /></div>
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
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      {service.price}
                    </Badge>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              Promo Code (Optional)
            </Label>
            <Input
              placeholder="Enter promo code"
              value={formData.promoCode}
              onChange={(e) => setFormData(prev => ({...prev, promoCode: e.target.value}))}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Valid codes: FAMILY10, WELCOME15, NEWCHILD20</p>
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

          <div>
            <Label className="text-gray-700 font-medium">Child's Name</Label>
            <Input
              value={formData.childName}
              onChange={(e) => setFormData(prev => ({...prev, childName: e.target.value}))}
              placeholder="Enter child's name"
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4">
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
            <Label className="text-gray-700 font-medium">Special Needs or Allergies</Label>
            <Textarea
              value={formData.specialNeeds}
              onChange={(e) => setFormData(prev => ({...prev, specialNeeds: e.target.value}))}
              placeholder="Food allergies, medical conditions, developmental needs..."
              rows={3}
              className="border-gray-300"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
              placeholder="Any other information or questions..."
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
            <div className="text-xl font-bold text-rose-600">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / (5 * 24 * 60 * 60)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Quote breakdown */}
      <Card className="border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <TeddyBearIcon />
            Your Childcare Quote
            <Heart className="w-5 h-5 text-emerald-600" />
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
                  {item.type === 'base' && <span className="text-sm text-gray-500">/month</span>}
                </span>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-2xl font-bold text-emerald-700">
              <span>Total Monthly Cost:</span>
              <span>€{quote.total.toFixed(0)} onSave={() => {}} /></span>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-2 p-3 bg-emerald-50 rounded-lg">
              <Heart className="w-4 h-4 inline mr-1" />
              <span>Licensed care • Qualified staff • Safe environment • Nutritious meals</span>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.open('mailto:enrollment@childcare.com?subject=Enrollment Inquiry', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Enroll Now
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
          <CardTitle className="text-gray-700 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Enrollment Details
          </CardTitle>
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
              {formData.startDate && <><strong>Start Date:</strong> {formData.startDate}<br /></>}
              <strong>Age Group:</strong> {formData.ageGroup.replace('-', ' ')}<br />
              <strong>Schedule:</strong> {formData.schedule.replace('-', ' ')}<br />
              <strong>Children:</strong> {formData.numberOfChildren}
            </div>
          </div>
          {formData.specialNeeds && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <strong className="text-yellow-700">Special Needs/Allergies:</strong> {formData.specialNeeds}
            </div>
          )}
          {formData.additionalNotes && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <strong className="text-emerald-700">Additional Notes:</strong> {formData.additionalNotes}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const canProceedStep1 = formData.ageGroup;
  const canProceedStep2 = formData.parentName && formData.email;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 mx-auto mb-4 text-emerald-600"
            >
              <TeddyBearIcon />
            </motion.div>
            <h3 className="text-xl font-semibold text-emerald-700 mb-2">Calculating Your Quote</h3>
            <p className="text-gray-600">Creating your personalized childcare estimate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-600 rounded-full text-white">
              <TeddyBearIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Childcare Services Calculator</h1>
            <div className="p-3 bg-yellow-400 rounded-full text-white">
              <CrayonIcon />
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a personalized quote for quality childcare services. Licensed providers, qualified staff, nurturing environment.
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
              Step {currentStep} of 2: {currentStep === 1 ? "Care Requirements" : "Family Information"}
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
                    Next: Family Info
                  </Button>
                ) : (
                  <Button
                    onClick={calculateQuote}
                    disabled={!canProceedStep2}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Heart className="w-4 h-4 mr-2" />
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
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Qualified Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Safe Environment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}