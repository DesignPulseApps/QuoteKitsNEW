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
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare, 
  Database, 
  HeadphonesIcon,
  ChevronRight,
  CheckCircle,
  Timer,
  Calculator,
  User,
  Briefcase,
  Sparkles,
  Download,
  Phone,
  Info
} from "lucide-react";

interface VirtualAssistantQuote {
  serviceType: string;
  hoursPerWeek: string;
  availability: string;
  urgency: string;
  contractType: string;
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    discounts: { name: string; amount: number }[];
    fees: { name: string; amount: number }[];
  };
}

const serviceTypes = [
  {
    id: 'inbox',
    name: 'Inbox Management',
    icon: <Mail className="h-5 w-5" />,
    description: 'Email sorting, responses, and organization',
    popular: false
  },
  {
    id: 'calendar',
    name: 'Calendar & Booking',
    icon: <Calendar className="h-5 w-5" />,
    description: 'Appointment scheduling and calendar management',
    popular: true
  },
  {
    id: 'social',
    name: 'Social Media Scheduling',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Content scheduling and social media management',
    popular: true
  },
  {
    id: 'data',
    name: 'Data Entry',
    icon: <Database className="h-5 w-5" />,
    description: 'Data processing and database management',
    popular: false
  },
  {
    id: 'support',
    name: 'Customer Support',
    icon: <HeadphonesIcon className="h-5 w-5" />,
    description: 'Live chat and customer service support',
    popular: false
  }
];

const hoursOptions = [
  { value: '1-5', label: '1-5 hours/week', multiplier: 1 },
  { value: '6-10', label: '6-10 hours/week', multiplier: 1, popular: true },
  { value: '11-20', label: '11-20 hours/week', multiplier: 0.95 },
  { value: '20+', label: '20+ hours/week', multiplier: 0.9 }
];

const availabilityOptions = [
  { value: 'mornings', label: 'Mornings (9 AM - 12 PM)' },
  { value: 'afternoons', label: 'Afternoons (12 PM - 5 PM)' },
  { value: 'evenings', label: 'Evenings (5 PM - 9 PM)' },
  { value: 'flexible', label: 'Flexible Schedule' }
];

const urgencyOptions = [
  { value: 'asap', label: 'ASAP (Rush Fee)', fee: 50 },
  { value: '2weeks', label: 'Within 2 Weeks' },
  { value: 'month', label: 'Next Month' }
];

const contractTypes = [
  { value: 'project', label: 'One-off Project' },
  { value: 'retainer', label: 'Monthly Retainer', discount: 0.15 },
  { value: 'hourly', label: 'Ongoing Hourly' }
];

interface VirtualAssistantCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function VirtualAssistantCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: VirtualAssistantCalculatorProps = {}) {
  const [step, setStep] = useState(1);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiInput, setAiInput] = useState("");
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
  const [quote, setQuote] = useState<VirtualAssistantQuote>({
    serviceType: '',
    hoursPerWeek: '',
    availability: '',
    urgency: '',
    contractType: '',
    promoCode: '',
    clientName: '',
    clientEmail: '',
    baseRate: 30,
    totalCost: 0,
    breakdown: {
      baseCost: 0,
      discounts: [],
      fees: []
    }
  });
  const [timeRemaining, setTimeRemaining] = useState(48 * 60 * 60); // 48 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    calculateQuote();
  }, [quote.serviceType, quote.hoursPerWeek, quote.urgency, quote.contractType, quote.promoCode]);

  const calculateQuote = () => {
    if (!quote.serviceType || !quote.hoursPerWeek) return;

    const hoursOption = hoursOptions.find(h => h.value === quote.hoursPerWeek);
    if (!hoursOption) return;

    const weeklyHours = quote.hoursPerWeek === '20+' ? 25 : 
                      quote.hoursPerWeek === '11-20' ? 15 :
                      quote.hoursPerWeek === '6-10' ? 8 : 3;

    const monthlyCost = weeklyHours * 4 * quote.baseRate;
    let finalCost = monthlyCost * hoursOption.multiplier;

    const discounts: { name: string; amount: number }[] = [];
    const fees: { name: string; amount: number }[] = [];

    // Contract type discounts
    const contractOption = contractTypes.find(c => c.value === quote.contractType);
    if (contractOption?.discount) {
      const discountAmount = monthlyCost * contractOption.discount;
      discounts.push({ name: 'Monthly Retainer Discount', amount: discountAmount });
      finalCost -= discountAmount;
    }

    // Rush fee
    const urgencyOption = urgencyOptions.find(u => u.value === quote.urgency);
    if (urgencyOption?.fee) {
      fees.push({ name: 'Rush Start Fee', amount: urgencyOption.fee });
      finalCost += urgencyOption.fee;
    }

    // Promo code
    if (quote.promoCode.toLowerCase() === 'save10') {
      const promoDiscount = monthlyCost * 0.1;
      discounts.push({ name: 'Promo Code (SAVE10)', amount: promoDiscount });
      finalCost -= promoDiscount;
    }

    setQuote(prev => ({
      ...prev,
      totalCost: Math.round(finalCost),
      breakdown: {
        baseCost: monthlyCost,
        discounts,
        fees
      }
    }));
  };

  const handleAIProcessing = () => {
    // Simple AI parsing simulation
    const input = aiInput.toLowerCase();
    
    if (input.includes('inbox') || input.includes('email')) {
      setQuote(prev => ({ ...prev, serviceType: 'inbox' }));
    }
    if (input.includes('calendar') || input.includes('scheduling')) {
      setQuote(prev => ({ ...prev, serviceType: 'calendar' }));
    }
    if (input.includes('social media') || input.includes('social')) {
      setQuote(prev => ({ ...prev, serviceType: 'social' }));
    }
    
    if (input.includes('5 hour')) {
      setQuote(prev => ({ ...prev, hoursPerWeek: '1-5' }));
    } else if (input.includes('10 hour')) {
      setQuote(prev => ({ ...prev, hoursPerWeek: '6-10' }));
    }
    
    if (input.includes('asap') || input.includes('urgent')) {
      setQuote(prev => ({ ...prev, urgency: 'asap' }));
    }
    
    if (input.includes('retainer') || input.includes('monthly')) {
      setQuote(prev => ({ ...prev, contractType: 'retainer' }));
    }

    setShowAIAssistant(false);
    setStep(4);
  };

  const nextStep = () => setStep(Math.min(step + 1, 5));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <EditableText
              value={textConfig.headline || "Virtual Assistant Quote Calculator"}
              onSave={(value) => updateTextContent('headline', value)}
              className="text-4xl font-bold text-gray-900 mb-4"
              isPreview={isPreview}
            />
            <EditableText
              value={textConfig.description || "Get an instant estimate for professional virtual assistant services tailored to your business needs"}
              onSave={(value) => updateTextContent('description', value)}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              isPreview={isPreview}
            />
          </motion.div>

          {/* AI Assistant Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6"
          >
            <Button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {showAIAssistant ? 'Use Form Instead' : 'Try AI Assistant'}
            </Button>
          </motion.div>

          <AnimatePresence>
            {showAIAssistant && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-teal-50">
                  <CardHeader>
                    <CardTitle className="text-purple-800">AI Assistant</CardTitle>
                    <CardDescription>
                      Describe your VA needs in plain English, and I'll configure your quote automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ai-input">What VA services do you need?</Label>
                      <Input
                        id="ai-input"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g., I need inbox management for 10 hours/week, starting ASAP"
                        className="bg-white"
                      />
                    </div>
                    <Button 
                      onClick={handleAIProcessing}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    >
                      Generate Quote
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAIAssistant && (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {step} of 4</span>
                  <span><EditableText value={Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Content */}
              <Card className="bg-white/80 backdrop-blur border-purple-100 shadow-lg">
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service Type</h2>
                          <p className="text-gray-600">Choose the primary virtual assistant service you need</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {serviceTypes.map((service) => (
                            <div
                              key={service.id}
                              onClick={() => setQuote(prev => ({ ...prev, serviceType: service.id }))}
                              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                quote.serviceType === service.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                              }`}
                            >
                              {service.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-teal-500">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex items-start space-x-3">
                                <div className="text-purple-600"><EditableText value={service.icon} onSave={() => {}} /></div>
                                <div>
                                  <h3 className="font-semibold text-gray-900"><EditableText value={service.name} onSave={() => {}} /></h3>
                                  <p className="text-sm text-gray-600"><EditableText value={service.description} onSave={() => {}} /></p>
                                </div>
                              </div>
                              {quote.serviceType === service.id && (
                                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hours & Availability</h2>
                          <p className="text-gray-600">How many hours per week do you need assistance?</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-lg font-medium mb-3 block">Hours Per Week</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {hoursOptions.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => setQuote(prev => ({ ...prev, hoursPerWeek: option.value }))}
                                  className={`relative p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                    quote.hoursPerWeek === option.value
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  {option.popular && (
                                    <Badge className="absolute -top-2 -right-2 bg-teal-500 text-xs">
                                      Most Popular
                                    </Badge>
                                  )}
                                  <div className="font-medium"><EditableText value={option.label} onSave={() => {}} /></div>
                                  {option.multiplier < 1 && (
                                    <div className="text-xs text-green-600 mt-1">
                                      Save {Math.round((1 - option.multiplier) * 100)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-lg font-medium mb-3 block">Preferred Availability</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {availabilityOptions.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => setQuote(prev => ({ ...prev, availability: option.value }))}
                                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    quote.availability === option.value
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span><EditableText value={option.label} onSave={() => {}} /></span>
                                    {quote.availability === option.value && (
                                      <CheckCircle className="h-5 w-5 text-purple-600" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline & Contract</h2>
                          <p className="text-gray-600">When do you need to start and what type of engagement?</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-lg font-medium mb-3 block">Start Date</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {urgencyOptions.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => setQuote(prev => ({ ...prev, urgency: option.value }))}
                                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    quote.urgency === option.value
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span><EditableText value={option.label} onSave={() => {}} /></span>
                                    {option.fee && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        +€{option.fee}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-lg font-medium mb-3 block">Contract Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {contractTypes.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => setQuote(prev => ({ ...prev, contractType: option.value }))}
                                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    quote.contractType === option.value
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span><EditableText value={option.label} onSave={() => {}} /></span>
                                    {option.discount && (
                                      <Badge className="bg-green-500">
                                        Save {Math.round(option.discount * 100)}%
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="promo" className="text-lg font-medium">Promo Code (Optional)</Label>
                            <Input
                              id="promo"
                              value={quote.promoCode}
                              onChange={(e) => setQuote(prev => ({ ...prev, promoCode: e.target.value }))}
                              placeholder="Enter promo code"
                              className="bg-white border-purple-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Try: SAVE10 for 10% off</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
                          <p className="text-gray-600">Almost done! Just need a few details to send your quote</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={quote.clientName}
                              onChange={(e) => setQuote(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Your full name"
                              className="bg-white border-purple-200"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={quote.clientEmail}
                              onChange={(e) => setQuote(prev => ({ ...prev, clientEmail: e.target.value }))}
                              placeholder="your@email.com"
                              className="bg-white border-purple-200"
                            />
                          </div>
                        </div>

                        {/* Quote Validity Timer */}
                        <Card className="border-orange-200 bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Timer className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-medium text-orange-800">Quote Valid For</p>
                                <p className="text-sm text-orange-600">
                                  {formatTime(timeRemaining)} remaining
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      disabled={step === 1}
                      className="border-purple-200"
                    >
                      Previous
                    </Button>
                    
                    {step < 4 ? (
                      <Button
                        onClick={nextStep}
                        disabled={
                          (step === 1 && !quote.serviceType) ||
                          (step === 2 && (!quote.hoursPerWeek || !quote.availability)) ||
                          (step === 3 && (!quote.urgency || !quote.contractType))
                        }
                        className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                      >
                        Next Step
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        disabled={!quote.clientName || !quote.clientEmail}
                        className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                      >
                        Generate Quote
                        <Briefcase className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Live Quote Preview */}
          {(quote.serviceType && quote.hoursPerWeek && quote.totalCost > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Your Quote Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Investment:</span>
                      <span className="text-3xl font-bold text-teal-700">€{quote.totalCost} onSave={() => {}} /></span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Rate (€{quote.baseRate}/hour)</span>
                        <span>€{quote.breakdown.baseCost} onSave={() => {}} /></span>
                      </div>
                      
                      {quote.breakdown.discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span><EditableText value={discount.name} onSave={() => {}} /></span>
                          <span>-€{Math.round(discount.amount)} onSave={() => {}} /></span>
                        </div>
                      ))}
                      
                      {quote.breakdown.fees.map((fee, index) => (
                        <div key={index} className="flex justify-between text-orange-600">
                          <span><EditableText value={fee.name} onSave={() => {}} /></span>
                          <span>+€{fee.amount} onSave={() => {}} /></span>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button size="sm" variant="outline" className="border-teal-300">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Phone className="h-4 w-4 mr-2" />
                        Book Discovery Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}