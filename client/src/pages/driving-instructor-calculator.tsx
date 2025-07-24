import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Car, 
  MapPin, 
  Clock,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Timer,
  Sparkles,
  Download,
  Mail,
  Settings,
  BookOpen,
  GraduationCap,
  Target
} from "lucide-react";

interface DrivingInstructorFormData {
  transmissionType: string;
  lessonType: string;
  numberOfLessons: string;
  lessonDuration: string;
  pickupLocation: string;
  preferredDays: string[];
  addOns: string[];
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PricingBreakdown {
  baseLessonRate: number;
  totalLessons: number;
  transmissionSurcharge: number;
  pickupFee: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface DrivingInstructorCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function DrivingInstructorCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: DrivingInstructorCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
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
  const [formData, setFormData] = useState<DrivingInstructorFormData>({
    transmissionType: "",
    lessonType: "",
    numberOfLessons: "",
    lessonDuration: "",
    pickupLocation: "",
    preferredDays: [],
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });

  const steps = [
    { number: 1, title: "Lesson Details", completed: currentStep > 1 },
    { number: 2, title: "Schedule & Location", completed: currentStep > 2 },
    { number: 3, title: "Add-ons & Contact", completed: currentStep > 3 },
    { number: 4, title: "Quote Ready", completed: quoteGenerated }
  ];

  const transmissionOptions = [
    { 
      label: "Manual", 
      value: "manual", 
      surcharge: 0, 
      icon: <Settings className="h-5 w-5" />,
      description: "Traditional gear shifting",
      popularity: "Standard"
    },
    { 
      label: "Automatic", 
      value: "automatic", 
      surcharge: 5, 
      icon: <Car className="h-5 w-5" />,
      description: "Easier to learn",
      popularity: "Popular",
      popular: true
    }
  ];

  const lessonTypeOptions = [
    { label: "Beginner Package", value: "beginner", baseRate: 45, icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Intensive Course", value: "intensive", baseRate: 40, icon: <Target className="h-5 w-5" />, popular: true },
    { label: "Refresher Lessons", value: "refresher", baseRate: 50, icon: <BookOpen className="h-5 w-5" /> },
    { label: "Test Preparation", value: "test_prep", baseRate: 55, icon: <Star className="h-5 w-5" /> }
  ];

  const durationOptions = [
    { label: "45 minutes", value: "45", multiplier: 0.8, icon: <Clock className="h-5 w-5" /> },
    { label: "60 minutes", value: "60", multiplier: 1, icon: <Clock className="h-5 w-5" />, popular: true },
    { label: "90 minutes", value: "90", multiplier: 1.4, icon: <Clock className="h-5 w-5" /> }
  ];

  const pickupOptions = [
    { label: "Instructor's Location", value: "instructor", fee: 0, icon: <MapPin className="h-5 w-5" /> },
    { label: "Student Address", value: "student", fee: 10, icon: <MapPin className="h-5 w-5" /> }
  ];

  const addOnOptions = [
    { 
      label: "Theory Support", 
      value: "theory", 
      price: 30, 
      icon: <BookOpen className="h-4 w-4" />,
      description: "Highway code and theory help"
    },
    { 
      label: "Mock Test", 
      value: "mock_test", 
      price: 25, 
      icon: <Target className="h-4 w-4" />,
      description: "Practice driving test"
    },
    { 
      label: "Evening/Weekend Lessons", 
      value: "flexible_time", 
      price: 10, 
      icon: <Calendar className="h-4 w-4" />,
      description: "Outside standard hours",
      perLesson: true
    }
  ];

  const dayOptions = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-driving-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to process AI request');
      }

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        transmissionType: result.transmissionType || prev.transmissionType,
        lessonType: result.lessonType || prev.lessonType,
        numberOfLessons: result.numberOfLessons || prev.numberOfLessons,
        pickupLocation: result.pickupLocation || prev.pickupLocation,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedTransmission = transmissionOptions.find(t => t.value === formData.transmissionType);
    const selectedLessonType = lessonTypeOptions.find(l => l.value === formData.lessonType);
    const selectedDuration = durationOptions.find(d => d.value === formData.lessonDuration);
    const selectedPickup = pickupOptions.find(p => p.value === formData.pickupLocation);
    
    const baseLessonRate = (selectedLessonType?.baseRate || customConfig?.basePrice || 50) * (selectedDuration?.multiplier || 1);
    const totalLessons = parseInt(formData.numberOfLessons) || 0;
    const transmissionSurcharge = (selectedTransmission?.surcharge || 0) * totalLessons;
    const pickupFee = (selectedPickup?.fee || 0) * totalLessons;
    
    // Calculate add-ons
    let addOnsTotal = 0;
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn) {
        if (addOn.perLesson) {
          addOnsTotal += addOn.price * totalLessons;
        } else {
          addOnsTotal += addOn.price;
        }
      }
    });
    
    const subtotal = (baseLessonRate * totalLessons) + transmissionSurcharge + pickupFee + addOnsTotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "drive10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${totalLessons} x ${selectedDuration?.label || '60min'} lessons: €${(baseLessonRate * totalLessons).toFixed(2)}`,
      ...(transmissionSurcharge > 0 ? [`Automatic surcharge: +€${transmissionSurcharge.toFixed(2)}`] : []),
      ...(pickupFee > 0 ? [`Home pickup: +€${pickupFee.toFixed(2)}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        const addOnTotal = addOn?.perLesson ? (addOn.price * totalLessons) : (addOn?.price || 0);
        return `${addOn?.label || 'Add-on'}: +€${addOnTotal.toFixed(2)}`;
      }),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 72 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 72);

    return {
      baseLessonRate,
      totalLessons,
      transmissionSurcharge,
      pickupFee,
      addOnsTotal,
      subtotal,
      promoDiscount,
      total,
      breakdown,
      quoteExpiry
    };
  };

  const OptionCard = ({ option, selected, onClick, icon, popular = false }: {
    option: any;
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    popular?: boolean;
  }) => (
    <Card
      className={`p-4 cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
        selected 
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-gray-50 shadow-md" 
          : "border-gray-300 hover:border-blue-400 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-gray-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {icon}
          </div>
          <span className={`font-semibold ${selected ? "text-blue-800" : "text-gray-800"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-600 mb-2"><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.popularity && (
        <p className="text-xs text-gray-500"><EditableText value={option.popularity} onSave={() => {}} /></p>
      )}
      {option.baseRate && (
        <p className="text-sm font-medium text-blue-600 mt-2">€{option.baseRate}/lesson</p>
      )}
      {option.price && (
        <p className="text-sm font-medium text-blue-600 mt-2">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.fee > 0 && (
        <p className="text-sm font-medium text-blue-600 mt-2">+€{option.fee}/lesson</p>
      )}
      {option.surcharge > 0 && (
        <p className="text-sm font-medium text-blue-600 mt-2">+€{option.surcharge}/lesson</p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-gray-700 to-blue-600 mb-4">
            <EditableText
              value={textConfig.headline || "Driving Instructor Services"}
              onSave={(value) => updateTextContent('headline', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Professional driving lessons with qualified instructors, modern vehicles, and personalized learning approaches."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-gray-700 max-w-2xl mx-auto font-medium text-lg block"
            isPreview={isPreview}
          />
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-blue-700">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Qualified ADI
            </span>
            <span className="flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Modern Vehicles
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              High Pass Rate
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-gray-300 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-600 text-white"
                          : currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-300">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Smart Fill - Describe Your Learning Needs
                </h3>
                <div className="flex gap-3">
                  <Textarea
                    placeholder="e.g., 'I need 10 lessons in automatic on weekends at my home' or 'Intensive course for manual with theory support'"
                    value={formData.naturalLanguageInput}
                    onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                    className="flex-1 bg-white border-blue-300 text-gray-900 placeholder-gray-400"
                    rows={2}
                  />
                  <Button 
                    onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                    variant="outline" 
                    size="sm"
                    disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    {isProcessingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Smart Fill
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step 1: Lesson Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      Transmission Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {transmissionOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.transmissionType === option.value}
                          onClick={() => setFormData({ ...formData, transmissionType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                      Lesson Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lessonTypeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.lessonType === option.value}
                          onClick={() => setFormData({ ...formData, lessonType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Number of Lessons</label>
                      <select
                        value={formData.numberOfLessons}
                        onChange={(e) => setFormData({ ...formData, numberOfLessons: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="">Select number</option>
                        {[...Array(40)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? 'lesson' : 'lessons'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Lesson Duration</label>
                      <div className="grid grid-cols-3 gap-2">
                        {durationOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, lessonDuration: option.value })}
                            className={`p-3 text-sm border rounded-md transition-colors ${
                              formData.lessonDuration === option.value
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.transmissionType || !formData.lessonType || !formData.numberOfLessons || !formData.lessonDuration}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule & Location */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Pick-up Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pickupOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.pickupLocation === option.value}
                          onClick={() => setFormData({ ...formData, pickupLocation: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Preferred Days
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {dayOptions.map((day) => (
                        <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={formData.preferredDays.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ 
                                  ...formData, 
                                  preferredDays: [...formData.preferredDays, day.value] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  preferredDays: formData.preferredDays.filter(d => d !== day.value) 
                                });
                              }
                            }}
                            className="border-blue-600 data-[state=checked]:bg-blue-600"
                          />
                          <span className="text-sm text-gray-700"><EditableText value={day.label} onSave={() => {}} /></span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.pickupLocation}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Contact */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-600" />
                      Additional Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addOnOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.addOns.includes(option.value)}
                          onClick={() => {
                            const newAddOns = formData.addOns.includes(option.value)
                              ? formData.addOns.filter(a => a !== option.value)
                              : [...formData.addOns, option.value];
                            setFormData({ ...formData, addOns: newAddOns });
                          }}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter promo code for discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="border-gray-300 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        className="border-gray-300 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        className="border-gray-300 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Phone</label>
                      <Input
                        placeholder="Phone number"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="border-gray-300 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                        setQuoteGenerated(true);
                      }}
                      disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                    >
                      Generate Quote
                      <Car className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Quote Generated */}
              {currentStep === 4 && quoteGenerated && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-gray-600 text-white p-6 rounded-2xl">
                    <Car className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Your Driving Lesson Quote is Ready!</h3>
                    <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your personalized lesson plan.</p>
                    <div className="mt-4 p-3 bg-white/20 rounded-lg">
                      <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Quote
                    </Button>
                    <Button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Quote
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setQuoteGenerated(false);
                      setFormData({
                        transmissionType: "",
                        lessonType: "",
                        numberOfLessons: "",
                        lessonDuration: "",
                        pickupLocation: "",
                        preferredDays: [],
                        addOns: [],
                        promoCode: "",
                        naturalLanguageInput: "",
                        contactInfo: { name: "", email: "", phone: "" }
                      });
                    }}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Create New Quote
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-gray-300 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-sm">Total Cost</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Expiry Timer */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Quote Valid For</span>
                  </div>
                  <div className="text-center text-xs text-blue-600">
                    72 hours from generation
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-gray-800 font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Car className="mr-2 h-5 w-5" />
                  Book My Lessons
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🚗 Qualified ADI • 🛡️ Insured vehicles • ⭐ High pass rate
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}