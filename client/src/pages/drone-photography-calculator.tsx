import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Camera, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Plane
} from "lucide-react";

interface DroneFormData {
  projectType: string;
  duration: string;
  outputType: string;
  locationType: string;
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
  basePrice: number;
  outputAdd: number;
  locationAdd: number;
  durationAdd: number;
  addOnsCost: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface DronePhotographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function DronePhotographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: DronePhotographyCalculatorProps = {}) {
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
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<DroneFormData>({
    projectType: "",
    duration: "",
    outputType: "",
    locationType: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const projectTypes = [
    { id: "real-estate", label: "Real Estate Shoot", icon: "🏡", popular: true },
    { id: "event-coverage", label: "Event Coverage", icon: "🎉", popular: true },
    { id: "construction", label: "Construction Site", icon: "🏗️", popular: false },
    { id: "inspection", label: "Roof/Property Inspection", icon: "🔍", popular: true },
    { id: "agricultural", label: "Agricultural Mapping", icon: "🌾", popular: false },
    { id: "custom", label: "Custom Job", icon: "✨", popular: false },
  ];

  const durations = [
    { id: "under-1hr", label: "Under 1 hour", multiplier: 1.0, icon: "⚡" },
    { id: "half-day", label: "Half-day (3-4 hrs)", multiplier: 2.5, icon: "🌅" },
    { id: "full-day", label: "Full-day (6-8 hrs)", multiplier: 4.0, icon: "☀️" },
  ];

  const outputTypes = [
    { id: "video-only", label: "Video Only", price: 100, icon: "🎥" },
    { id: "stills-only", label: "Stills Only", price: 0, icon: "📸" },
    { id: "both", label: "Both Video & Stills", price: 150, icon: "📽️" },
    { id: "edited-highlights", label: "Edited Highlights", price: 250, icon: "✂️" },
    { id: "raw-footage", label: "Raw Footage", price: 50, icon: "💾" },
  ];

  const locationTypes = [
    { id: "rural", label: "Rural / Open Field", price: 0, icon: "🌾" },
    { id: "urban", label: "Urban / Suburban", price: 75, icon: "🏙️" },
    { id: "restricted", label: "Restricted Airspace", price: 200, icon: "🚫" },
  ];

  const addOnOptions = [
    { id: "voiceover", label: "Voiceover / Narration", price: 50 },
    { id: "music", label: "Licensed Background Music", price: 80 },
    { id: "promo-video", label: "Edited Promo Video", price: 300 },
    { id: "cloud-delivery", label: "Cloud Delivery & Backup", price: 40 },
    { id: "express-delivery", label: "Express Delivery (48hr)", price: 100 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const baseShoot = customConfig?.basePrice || 200; // Base 1hr, stills only, open field
    let outputAdd = 0;
    let locationAdd = 0;
    let durationAdd = 0;
    let addOnsCost = 0;
    const breakdown: string[] = [`Base shoot (1hr, stills, open field): ${currencySymbol}${baseShoot}`];

    // Duration multiplier
    const duration = durations.find(d => d.id === formData.duration);
    if (duration && duration.multiplier > 1.0) {
      durationAdd = baseShoot * (duration.multiplier - 1);
      breakdown.push(`${duration.label}: ${currencySymbol}${Math.round(durationAdd)}`);
    }

    // Output type pricing
    const output = outputTypes.find(o => o.id === formData.outputType);
    if (output && output.price > 0) {
      outputAdd = output.price;
      breakdown.push(`${output.label}: ${currencySymbol}${outputAdd}`);
    }

    // Location pricing
    const location = locationTypes.find(l => l.id === formData.locationType);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: ${currencySymbol}${locationAdd}`);
    }

    // Add-ons pricing - use dynamic pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn && addOn.price > 0) {
        addOnsCost += addOn.price;
        breakdown.push(`${addOn.label}: ${currencySymbol}${addOn.price}`);
      }
    });

    const subtotal = baseShoot + durationAdd + outputAdd + locationAdd + addOnsCost;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "save10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -${currencySymbol}${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseShoot,
      outputAdd,
      locationAdd,
      durationAdd,
      addOnsCost,
      subtotal,
      discount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse project types
    if (input.includes("real estate") || input.includes("property")) newFormData.projectType = "real-estate";
    else if (input.includes("event") || input.includes("wedding") || input.includes("party")) newFormData.projectType = "event-coverage";
    else if (input.includes("construction") || input.includes("building")) newFormData.projectType = "construction";
    else if (input.includes("inspection") || input.includes("roof")) newFormData.projectType = "inspection";
    else if (input.includes("agricultural") || input.includes("farm") || input.includes("crop")) newFormData.projectType = "agricultural";
    else newFormData.projectType = "custom";

    // Parse duration
    if (input.includes("full day") || input.includes("8 hour") || input.includes("all day")) {
      newFormData.duration = "full-day";
    } else if (input.includes("half day") || input.includes("3 hour") || input.includes("4 hour")) {
      newFormData.duration = "half-day";
    } else {
      newFormData.duration = "under-1hr";
    }

    // Parse output type
    if (input.includes("video and") || input.includes("both") || input.includes("photos and video")) {
      newFormData.outputType = "both";
    } else if (input.includes("edited") || input.includes("highlights") || input.includes("promo")) {
      newFormData.outputType = "edited-highlights";
    } else if (input.includes("video")) {
      newFormData.outputType = "video-only";
    } else if (input.includes("raw") || input.includes("unedited")) {
      newFormData.outputType = "raw-footage";
    } else {
      newFormData.outputType = "stills-only";
    }

    // Parse location
    if (input.includes("city") || input.includes("urban") || input.includes("suburb")) {
      newFormData.locationType = "urban";
    } else if (input.includes("restricted") || input.includes("airport") || input.includes("permit")) {
      newFormData.locationType = "restricted";
    } else {
      newFormData.locationType = "rural";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("voiceover") || input.includes("narration")) newAddOns.push("voiceover");
    if (input.includes("music") || input.includes("soundtrack")) newAddOns.push("music");
    if (input.includes("promo video") || input.includes("marketing video")) newAddOns.push("promo-video");
    if (input.includes("cloud") || input.includes("backup")) newAddOns.push("cloud-delivery");
    if (input.includes("express") || input.includes("rush") || input.includes("48 hour")) newAddOns.push("express-delivery");
    newFormData.addOns = newAddOns;

    setFormData(newFormData);
  };

  const downloadQuotePDF = () => {
    console.log("Downloading PDF quote...");
  };

  const OptionCard = ({ 
    option, 
    selected, 
    onClick, 
    icon, 
    popular = false 
  }: { 
    option: any; 
    selected: boolean; 
    onClick: () => void; 
    icon?: string; 
    popular?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        selected 
          ? "border-cyan-500 bg-cyan-950/50 shadow-md" 
          : "border-gray-600 hover:border-cyan-500/50 bg-slate-700/30"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-white"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && (
          <div className="text-sm text-cyan-300 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1.0 && (
          <div className="text-sm text-cyan-300 mt-1">×{option.multiplier} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project Type", completed: !!formData.projectType },
    { number: 2, title: "Duration & Output", completed: !!formData.duration && !!formData.outputType },
    { number: 3, title: "Location & Add-ons", completed: !!formData.locationType },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-white mb-2">
            <EditableText
              value={textConfig.heroTitle || "Drone & Aerial Photography Calculator"}
              onSave={(value) => updateTextContent('heroTitle', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </h1>
          <p className="text-cyan-200 max-w-2xl mx-auto font-body">
            <EditableText
              value={textConfig.heroDescription || "Get an instant quote for your aerial photography project. Professional pilots, cinematic results."}
              onSave={(value) => updateTextContent('heroDescription', value)}
              className="inline-block"
              isPreview={isPreview}
            />
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-slate-800/80 backdrop-blur-sm border-cyan-500/20">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-600 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Plane className="h-6 w-6 mr-2 text-cyan-400" />
                      What type of aerial project?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-cyan-950/50 rounded-lg border border-cyan-500/20">
                      <label className="block text-sm font-body text-cyan-100 mb-2">
                        Describe your project in your own words (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need a real estate shoot in the city with a short promo video"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-slate-700/50 border-cyan-500/30 text-white placeholder-gray-400 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 font-body"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {projectTypes.map((project) => (
                        <OptionCard
                          key={project.id}
                          option={project}
                          selected={formData.projectType === project.id}
                          onClick={() => setFormData(prev => ({ ...prev, projectType: project.id }))}
                          icon={project.icon}
                          popular={project.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Duration & Output */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-cyan-400" />
                      Duration & output type
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-cyan-100 mb-3">Duration Needed</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {durations.map((duration) => (
                            <OptionCard
                              key={duration.id}
                              option={duration}
                              selected={formData.duration === duration.id}
                              onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                              icon={duration.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-cyan-100 mb-3">Output Required</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {outputTypes.map((output) => (
                            <OptionCard
                              key={output.id}
                              option={output}
                              selected={formData.outputType === output.id}
                              onClick={() => setFormData(prev => ({ ...prev, outputType: output.id }))}
                              icon={output.icon}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.duration || !formData.outputType}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Location & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-cyan-400" />
                      Location & additional services
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-cyan-100 mb-3">Location Type</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {locationTypes.map((location) => (
                            <OptionCard
                              key={location.id}
                              option={location}
                              selected={formData.locationType === location.id}
                              onClick={() => setFormData(prev => ({ ...prev, locationType: location.id }))}
                              icon={location.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-cyan-100 mb-3">Add-on Services</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-cyan-500 bg-cyan-950/50 shadow-md"
                                  : "border-gray-600 hover:border-cyan-500/50 bg-slate-700/30"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-cyan-100"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-sm text-cyan-300 mt-1">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-cyan-100 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SAVE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs bg-slate-700/50 border-cyan-500/30 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.locationType}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-cyan-400" />
                      Get your detailed quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 bg-slate-700/50 border-cyan-500/30 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 bg-slate-700/50 border-cyan-500/30 text-white placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 bg-slate-700/50 border-cyan-500/30 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-green-500 hover:bg-green-600 text-white px-8"
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-slate-800/90 backdrop-blur-sm border-cyan-500/20 sticky top-8">
              <h3 className="text-xl font-display text-white mb-4">Your Drone Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-cyan-400">
                  €{pricing.total.toFixed(2)}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-400 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-cyan-100">
                      <span>Total</span>
                      <span>€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {formData.projectType && (
                  <div className="mt-4 p-3 bg-cyan-950/50 rounded-lg border border-cyan-500/20">
                    <div className="text-sm text-cyan-200">
                      🚁 Most clients choose: 1hr + edited video + music
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-white">Ready to Book Your Flight?</h3>
                    <p className="text-sm text-cyan-200">
                      This quote is valid for 72 hours. Secure your aerial session today.
                    </p>
                    
                    <Button 
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3"
                      onClick={() => {
                        const subject = "Drone Photography Booking";
                        const body = `I'm ready to book my aerial photography session! My quote is €${pricing.total.toFixed(2)}`;
                        const mailtoUrl = `mailto:info@aerialphotography.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🚁 Book My Flight
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Licensed Pilot
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mr-1"></div>
                        Insured
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-cyan-500/20 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-cyan-200">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-950/50"
                        onClick={downloadQuotePDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Quote PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}