import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Video, 
  Play,
  Film,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Download,
  Mail,
  Timer,
  Scissors,
  Camera,
  Palette,
  Type,
  Music,
  Mic,
  Zap,
  Calendar,
  Monitor
} from "lucide-react";

interface VideoEditorFormData {
  projectType: string;
  videoDuration: string;
  footageProvided: string;
  turnaroundTime: string;
  addOns: string[];
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  durationAdd: number;
  filmingAdd: number;
  rushAdd: number;
  addOnsTotal: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
  quoteExpiry: Date;
}

interface VideoEditorCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function VideoEditorCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: VideoEditorCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  
  // Use the propConfig as customConfig for consistency
  const customConfig = propConfig;
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
  
  const [formData, setFormData] = useState<VideoEditorFormData>({
    projectType: "",
    videoDuration: "",
    footageProvided: "",
    turnaroundTime: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "", company: "" }
  });

  const steps = [
    { number: 1, title: "Project & Duration", completed: currentStep > 1 },
    { number: 2, title: "Footage & Timeline", completed: currentStep > 2 },
    { number: 3, title: "Add-ons & Promo", completed: currentStep > 3 },
    { number: 4, title: "Contact & Quote", completed: quoteGenerated }
  ];

  const projectTypes = [
    { 
      label: "Wedding Video", 
      value: "wedding", 
      icon: <Video className="h-5 w-5" />,
      description: "Cinematic wedding story",
      basePrice: 150,
      popular: true
    },
    { 
      label: "YouTube Vlog", 
      value: "youtube", 
      icon: <Play className="h-5 w-5" />,
      description: "Content creator editing",
      basePrice: 100
    },
    { 
      label: "Corporate Promo", 
      value: "corporate", 
      icon: <Monitor className="h-5 w-5" />,
      description: "Business promotional video",
      basePrice: 200
    },
    { 
      label: "Event Recap", 
      value: "event", 
      icon: <Camera className="h-5 w-5" />,
      description: "Event highlights reel",
      basePrice: 120
    },
    { 
      label: "Short Film", 
      value: "shortfilm", 
      icon: <Film className="h-5 w-5" />,
      description: "Narrative storytelling",
      basePrice: 300
    }
  ];

  const videoDurations = [
    { label: "Under 2 mins", value: "under2", multiplier: 1, icon: <Clock className="h-4 w-4" />, popular: true },
    { label: "2-5 mins", value: "2to5", multiplier: 1.3, icon: <Clock className="h-4 w-4" /> },
    { label: "5-10 mins", value: "5to10", multiplier: 1.7, icon: <Clock className="h-4 w-4" /> },
    { label: "Over 10 mins", value: "over10", multiplier: 2.2, icon: <Clock className="h-4 w-4" /> }
  ];

  const footageOptions = [
    { 
      label: "Yes (Raw Files Provided)", 
      value: "provided", 
      addCost: 0, 
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Client provides all footage",
      popular: true
    },
    { 
      label: "No (Need Filming Too)", 
      value: "filming", 
      addCost: 75, 
      icon: <Camera className="h-5 w-5" />,
      description: "Include filming service"
    }
  ];

  const turnaroundTimes = [
    { 
      label: "Standard (5-7 Days)", 
      value: "standard", 
      addCost: 0, 
      icon: <Calendar className="h-5 w-5" />,
      popular: true
    },
    { 
      label: "Rush (48 Hours)", 
      value: "rush", 
      addCost: 80, 
      icon: <Zap className="h-5 w-5" />,
      description: "Priority editing"
    }
  ];

  const addOnOptions = [
    { 
      label: "Motion Graphics", 
      value: "graphics", 
      price: 40, 
      icon: <Sparkles className="h-4 w-4" />,
      description: "Animated titles and graphics",
      popular: true
    },
    { 
      label: "Color Grading", 
      value: "grading", 
      price: 30, 
      icon: <Palette className="h-4 w-4" />,
      description: "Professional color correction"
    },
    { 
      label: "Subtitles / Captions", 
      value: "captions", 
      price: 25, 
      icon: <Type className="h-4 w-4" />,
      description: "Accurate subtitle track"
    },
    { 
      label: "Licensed Music", 
      value: "music", 
      price: 20, 
      icon: <Music className="h-4 w-4" />,
      description: "Copyright-free soundtrack"
    },
    { 
      label: "Voiceover Sourcing", 
      value: "voiceover", 
      price: 60, 
      icon: <Mic className="h-4 w-4" />,
      description: "Professional voice talent"
    }
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-video-editor', {
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
        projectType: result.projectType || prev.projectType,
        videoDuration: result.videoDuration || prev.videoDuration,
        footageProvided: result.footageProvided || prev.footageProvided,
        turnaroundTime: result.turnaroundTime || prev.turnaroundTime,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const selectedProjectType = projectTypes.find(p => p.value === formData.projectType);
    const selectedDuration = videoDurations.find(d => d.value === formData.videoDuration);
    const selectedFootage = footageOptions.find(f => f.value === formData.footageProvided);
    const selectedTurnaround = turnaroundTimes.find(t => t.value === formData.turnaroundTime);
    
    const basePrice = (selectedProjectType?.basePrice || customConfig?.basePrice || 100) * (selectedDuration?.multiplier || 1);
    const durationAdd = 0; // Already included in multiplier
    const filmingAdd = selectedFootage?.addCost || 0;
    const rushAdd = selectedTurnaround?.addCost || 0;
    
    // Calculate add-ons
    let addOnsTotal = 0;
    formData.addOns.forEach(addOnValue => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      if (addOn) {
        addOnsTotal += addOn.price;
      }
    });
    
    const subtotal = basePrice + durationAdd + filmingAdd + rushAdd + addOnsTotal;
    
    // Promo code discount
    let promoDiscount = 0;
    if (formData.promoCode.toLowerCase() === "edit10") {
      promoDiscount = subtotal * 0.10;
    }

    const total = Math.max(0, subtotal - promoDiscount);
    
    const breakdown = [
      `${selectedProjectType?.label || 'Video'} editing (${selectedDuration?.label || 'under 2 mins'}): €${basePrice.toFixed(2)}`,
      ...(filmingAdd > 0 ? [`Filming service: +€${filmingAdd.toFixed(2)}`] : []),
      ...(rushAdd > 0 ? [`Rush delivery (48h): +€${rushAdd.toFixed(2)}`] : []),
      ...formData.addOns.map(addOnValue => {
        const addOn = addOnOptions.find(a => a.value === addOnValue);
        return `${addOn?.label || 'Add-on'}: +€${addOn?.price.toFixed(2) || '0.00'}`;
      }),
      ...(promoDiscount > 0 ? [`Promo discount (10%): -€${promoDiscount.toFixed(2)}`] : [])
    ];

    // Quote expires in 72 hours
    const quoteExpiry = new Date();
    quoteExpiry.setHours(quoteExpiry.getHours() + 72);

    return {
      basePrice,
      durationAdd,
      filmingAdd,
      rushAdd,
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
      className={`p-4 cursor-pointer transition-all duration-300 border hover:shadow-lg ${
        selected 
          ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md" 
          : "border-gray-700 hover:border-amber-400 bg-gray-800 hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-orange-900/20"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${selected ? "bg-amber-500 text-white" : "bg-gray-700 text-amber-400"}`}>
            {icon}
          </div>
          <span className={`font-medium ${selected ? "text-amber-900" : "text-white"}`}>
            {option.label}
          </span>
        </div>
        {popular && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs">
            Popular
          </Badge>
        )}
      </div>
      {option.description && (
        <p className={`text-sm mb-2 ml-11 ${selected ? "text-amber-700" : "text-gray-300"}`}><EditableText value={option.description} onSave={() => {}} /></p>
      )}
      {option.basePrice && (
        <p className="text-sm font-medium text-amber-400 ml-11">From €{option.basePrice} onSave={() => {}} /></p>
      )}
      {option.price !== undefined && option.price > 0 && (
        <p className="text-sm font-medium text-amber-400 ml-11">+€{option.price} onSave={() => {}} /></p>
      )}
      {option.addCost !== undefined && option.addCost > 0 && (
        <p className="text-sm font-medium text-amber-400 ml-11">+€{option.addCost} onSave={() => {}} /></p>
      )}
    </Card>
  );

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 mb-4">
            Video Editing Services
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto font-medium text-lg">
            Professional video editing that brings your vision to life. From YouTube vlogs to wedding films, get a custom quote.
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8 text-sm text-amber-400">
            <span className="flex items-center">
              <Scissors className="h-4 w-4 mr-2" />
              Expert Editing
            </span>
            <span className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Cinematic Quality
            </span>
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Fast Delivery
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-800/95 backdrop-blur-sm border-gray-700 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-amber-500 text-black"
                          : currentStep === step.number
                          ? "bg-amber-500 text-black"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-500 mx-3" />
                    )}
                  </div>
                ))}
              </div>

              {/* AI Input Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-800 to-amber-900/20 rounded-2xl border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Assistant - Describe Your Video Project
                  </h3>
                  <Switch
                    checked={showNaturalLanguage}
                    onCheckedChange={setShowNaturalLanguage}
                  />
                </div>
                {showNaturalLanguage && (
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="e.g., 'I need a 5-minute corporate edit with motion graphics and voiceover' or 'Wedding video with color grading'"
                      value={formData.naturalLanguageInput}
                      onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                    <Button 
                      onClick={() => processNaturalLanguage(formData.naturalLanguageInput)}
                      variant="outline" 
                      size="sm"
                      disabled={!formData.naturalLanguageInput.trim() || isProcessingAI}
                      className="bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
                    >
                      {isProcessingAI ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto-Fill
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 1: Project & Duration */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Video className="h-5 w-5 mr-2 text-amber-400" />
                      What type of video project?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectTypes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.projectType === option.value}
                          onClick={() => setFormData({ ...formData, projectType: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-amber-400" />
                      Video duration
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {videoDurations.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.videoDuration === option.value}
                          onClick={() => setFormData({ ...formData, videoDuration: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.videoDuration}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Footage & Timeline */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-amber-400" />
                      Footage availability
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footageOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.footageProvided === option.value}
                          onClick={() => setFormData({ ...formData, footageProvided: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-amber-400" />
                      Turnaround time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {turnaroundTimes.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.turnaroundTime === option.value}
                          onClick={() => setFormData({ ...formData, turnaroundTime: option.value })}
                          icon={option.icon}
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.footageProvided || !formData.turnaroundTime}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Promo */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-400" />
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
                          popular={option.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Promo Code</label>
                    <Input
                      placeholder="Enter 'EDIT10' for 10% discount"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white focus:border-amber-400"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact & Quote */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Name *</label>
                        <Input
                          placeholder="Your name"
                          value={formData.contactInfo.name}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, name: e.target.value }
                          })}
                          className="bg-gray-700 border-gray-600 text-white focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.contactInfo.email}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, email: e.target.value }
                          })}
                          className="bg-gray-700 border-gray-600 text-white focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Phone</label>
                        <Input
                          placeholder="Phone number"
                          value={formData.contactInfo.phone}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, phone: e.target.value }
                          })}
                          className="bg-gray-700 border-gray-600 text-white focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Company</label>
                        <Input
                          placeholder="Company name (optional)"
                          value={formData.contactInfo.company}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contactInfo: { ...formData.contactInfo, company: e.target.value }
                          })}
                          className="bg-gray-700 border-gray-600 text-white focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {!quoteGenerated ? (
                    <div className="flex justify-between">
                      <Button
                        onClick={() => setCurrentStep(3)}
                        variant="outline"
                        className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setQuoteGenerated(true)}
                        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3"
                      >
                        Generate Quote
                        <Video className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black p-6 rounded-2xl">
                        <Video className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Your Video Edit Quote is Ready!</h3>
                        <p className="text-lg">Thank you {formData.contactInfo.name}. We've prepared your customized video editing quote.</p>
                        <div className="mt-4 p-3 bg-black/20 rounded-lg">
                          <p className="text-sm">Quote valid until: {pricing.quoteExpiry.toLocaleDateString()} at {pricing.quoteExpiry.toLocaleTimeString()} onSave={() => {}} /></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="bg-gray-800 border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 py-4">
                          <Download className="mr-2 h-5 w-5" />
                          Download PDF Quote
                        </Button>
                        <Button className="bg-gray-800 border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 py-4">
                          <Mail className="mr-2 h-5 w-5" />
                          Email Quote
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          setCurrentStep(1);
                          setQuoteGenerated(false);
                          setFormData({
                            projectType: "",
                            videoDuration: "",
                            footageProvided: "",
                            turnaroundTime: "",
                            addOns: [],
                            promoCode: "",
                            naturalLanguageInput: "",
                            contactInfo: { name: "", email: "", phone: "", company: "" }
                          });
                        }}
                        variant="outline"
                        className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
                      >
                        Create New Quote
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 bg-gray-800/95 backdrop-blur-sm border-gray-700 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-amber-400 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-300 text-sm">Total Investment</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-amber-400 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Quote Validity Timer */}
                <div className="mb-6 p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-amber-400 mr-2" />
                    <span className="text-sm font-medium text-amber-400">Quote Locked For</span>
                  </div>
                  <div className="text-center text-xs text-amber-300">
                    72 hours from generation
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300"><EditableText value={item.split(':')[0]} onSave={() => {}} /></span>
                      <span className="text-white font-medium"><EditableText value={item.split(':')[1]} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-600 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-amber-400">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Book My Edit
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    🎬 Cinematic Quality • ⚡ Fast Delivery • 🎨 Creative Excellence
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