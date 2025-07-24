import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Clock, 
  Home, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Star,
  Image,
  Sofa,
  Ruler
} from "lucide-react";

interface InteriorDesignFormData {
  projectType: string;
  propertySize: string;
  serviceLevel: string;
  addOns: string[];
  urgency: string;
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
  serviceLevelAdd: number;
  sizeAdd: number;
  urgencyAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface InteriorDesignCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function InteriorDesignCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: InteriorDesignCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
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
  const [formData, setFormData] = useState<InteriorDesignFormData>({
    projectType: "",
    propertySize: "",
    serviceLevel: "",
    addOns: [],
    urgency: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const projectTypes = [
    { id: "living-room", label: "Living Room", basePrice: 200, icon: "🛋️", popular: true },
    { id: "bedroom", label: "Bedroom", basePrice: 180, icon: "🛏️", popular: true },
    { id: "kitchen", label: "Kitchen", basePrice: 300, icon: "🍴", popular: true },
    { id: "bathroom", label: "Bathroom", basePrice: 250, icon: "🛁", popular: false },
    { id: "whole-home", label: "Whole Home", basePrice: 800, icon: "🏠", popular: true },
  ];

  const propertySizes = [
    { id: "under-50", label: "Under 50 m²", multiplier: 1.0, popular: false },
    { id: "51-100", label: "51–100 m²", multiplier: 1.2, popular: true },
    { id: "101-150", label: "101–150 m²", multiplier: 1.5, popular: true },
    { id: "151-plus", label: "151+ m²", multiplier: 2.0, popular: false },
  ];

  const serviceLevels = [
    { id: "basic", label: "Basic Styling", surcharge: 0, popular: false },
    { id: "full-design", label: "Full Design & Layout", surcharge: 300, popular: true },
    { id: "renovation", label: "Renovation & Build Support", surcharge: 600, popular: true },
    { id: "virtual", label: "Virtual Consultation Only", surcharge: -100, popular: false },
  ];

  const urgencyLevels = [
    { id: "flexible", label: "Flexible", surcharge: 0, popular: false },
    { id: "one-month", label: "Within 1 Month", surcharge: 100, popular: true },
    { id: "asap", label: "ASAP", surcharge: 200, popular: true },
  ];

  const addOnOptions = [
    { id: "3d-render", label: "3D Renderings", price: 100, popular: true, requiresFullDesign: true },
    { id: "furniture-sourcing", label: "Furniture Sourcing", price: 80, popular: true, requiresFullDesign: false },
    { id: "mood-boards", label: "Mood Boards", price: 50, popular: true, requiresFullDesign: false },
    { id: "in-person", label: "In-person Visits", price: 120, popular: false, requiresFullDesign: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const projectType = projectTypes.find(p => p.id === formData.projectType);
    const propertySize = propertySizes.find(s => s.id === formData.propertySize);
    const serviceLevel = serviceLevels.find(s => s.id === formData.serviceLevel);
    const urgency = urgencyLevels.find(u => u.id === formData.urgency);

    const basePrice = (projectType?.basePrice || customConfig?.basePrice || 180) * (propertySize?.multiplier || 1);
    const serviceLevelAdd = serviceLevel?.surcharge || 0;
    const sizeAdd = 0; // Already included in base calculation
    const urgencyAdd = urgency?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base service
    breakdown.push(`${projectType?.label || 'Base design'} (${propertySize?.label}): €${basePrice.toFixed(0)}`);

    // Service level
    if (serviceLevelAdd !== 0) {
      breakdown.push(`${serviceLevel?.label}: €${serviceLevelAdd > 0 ? '+' : ''}${serviceLevelAdd}`);
    }

    // Urgency
    if (urgencyAdd > 0) {
      breakdown.push(`${urgency?.label} urgency: €${urgencyAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        // Check if this add-on requires full design
        if (addOn.requiresFullDesign && formData.serviceLevel !== "full-design" && formData.serviceLevel !== "renovation") {
          return; // Skip this add-on
        }
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    let subtotal = basePrice + serviceLevelAdd + urgencyAdd + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "design10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      serviceLevelAdd,
      sizeAdd,
      urgencyAdd,
      addOnsTotal,
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

    // Parse project type
    if (input.includes("living room") || input.includes("lounge")) newFormData.projectType = "living-room";
    else if (input.includes("bedroom") || input.includes("bed room")) newFormData.projectType = "bedroom";
    else if (input.includes("kitchen")) newFormData.projectType = "kitchen";
    else if (input.includes("bathroom") || input.includes("bath")) newFormData.projectType = "bathroom";
    else if (input.includes("whole home") || input.includes("entire house") || input.includes("full house")) newFormData.projectType = "whole-home";

    // Parse property size
    if (input.includes("apartment") || input.includes("small")) newFormData.propertySize = "51-100";
    else if (input.includes("large") || input.includes("big")) newFormData.propertySize = "151-plus";
    else newFormData.propertySize = "101-150";

    // Parse service level
    if (input.includes("basic") || input.includes("styling")) newFormData.serviceLevel = "basic";
    else if (input.includes("virtual") || input.includes("online")) newFormData.serviceLevel = "virtual";
    else if (input.includes("renovation") || input.includes("build")) newFormData.serviceLevel = "renovation";
    else newFormData.serviceLevel = "full-design";

    // Parse urgency
    if (input.includes("asap") || input.includes("urgent") || input.includes("quickly")) newFormData.urgency = "asap";
    else if (input.includes("month") || input.includes("soon")) newFormData.urgency = "one-month";
    else newFormData.urgency = "flexible";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("3d") || input.includes("render")) newAddOns.push("3d-render");
    if (input.includes("furniture") || input.includes("sourcing")) newAddOns.push("furniture-sourcing");
    if (input.includes("mood board") || input.includes("moodboard")) newAddOns.push("mood-boards");
    if (input.includes("visit") || input.includes("in person")) newAddOns.push("in-person");
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
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-rose-300 bg-rose-50 shadow-lg" 
          : "border-neutral-200 hover:border-rose-200 bg-white hover:bg-rose-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-semibold ${selected ? "text-rose-800" : "text-neutral-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-neutral-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge !== 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-neutral-500"}`}>
            {option.surcharge > 0 ? '+' : ''}€{option.surcharge}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-neutral-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier !== 1.0 && (
          <div className={`text-sm mt-1 ${selected ? "text-rose-600" : "text-neutral-500"}`}>
            {Math.round(option.multiplier * 100)}% rate
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project Scope", completed: !!formData.projectType && !!formData.propertySize },
    { number: 2, title: "Service Level", completed: !!formData.serviceLevel && !!formData.urgency },
    { number: 3, title: "Add-ons & Promo", completed: true },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-neutral-800 mb-2">
            Interior Design Quote Calculator
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto font-body">
            Transform your space with professional interior design. Get your personalized quote for beautiful, functional interiors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-rose-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-rose-400 text-white"
                          : currentStep === step.number
                          ? "bg-rose-300 text-white"
                          : "bg-neutral-300 text-neutral-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-neutral-600">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-rose-200 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project Scope */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-neutral-800 mb-4 flex items-center">
                      <Palette className="h-6 w-6 mr-2 text-rose-400" />
                      Define your design project
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                      <label className="block text-sm font-body text-neutral-700 mb-2">
                        Describe your design needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need full design for a 2-bedroom apartment with mood board and 3D"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-rose-200 text-neutral-800 mb-3 resize-none placeholder:text-neutral-400 rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-rose-400 hover:bg-rose-500 text-white border-0 font-body font-semibold rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Project Type</h3>
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

                        {formData.projectType === "kitchen" && (
                          <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                            <div className="text-sm text-neutral-600">
                              🍴 Most booked: Kitchen + Mood Board + 3D Render
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Property Size</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {propertySizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.propertySize === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertySize: size.id }))}
                              popular={size.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.propertySize}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Service Level */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-neutral-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-rose-400" />
                      Choose your service level and timeline
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Service Level</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {serviceLevels.map((service) => (
                            <OptionCard
                              key={service.id}
                              option={service}
                              selected={formData.serviceLevel === service.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceLevel: service.id }))}
                              popular={service.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Timeline Urgency</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {urgencyLevels.map((urgency) => (
                            <OptionCard
                              key={urgency.id}
                              option={urgency}
                              selected={formData.urgency === urgency.id}
                              onClick={() => setFormData(prev => ({ ...prev, urgency: urgency.id }))}
                              popular={urgency.popular}
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
                      className="px-8 border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.serviceLevel || !formData.urgency}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Promo */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-neutral-800 mb-4 flex items-center">
                      <Image className="h-6 w-6 mr-2 text-rose-400" />
                      Enhance your design experience
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Add-ons (Optional)</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {addOnOptions.map((addOn) => {
                            const isDisabled = addOn.requiresFullDesign && 
                              formData.serviceLevel !== "full-design" && 
                              formData.serviceLevel !== "renovation";
                            
                            return (
                              <div
                                key={addOn.id}
                                onClick={() => {
                                  if (isDisabled) return;
                                  const newAddOns = formData.addOns.includes(addOn.id)
                                    ? formData.addOns.filter(id => id !== addOn.id)
                                    : [...formData.addOns, addOn.id];
                                  setFormData(prev => ({ ...prev, addOns: newAddOns }));
                                }}
                                className={`relative p-3 rounded-xl border-2 transition-all ${
                                  isDisabled 
                                    ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50"
                                    : formData.addOns.includes(addOn.id)
                                    ? "border-rose-300 bg-rose-50 shadow-lg text-neutral-800 cursor-pointer hover:shadow-lg"
                                    : "border-neutral-200 hover:border-rose-200 bg-white text-neutral-700 hover:bg-rose-25 cursor-pointer"
                                }`}
                              >
                                {addOn.popular && !isDisabled && (
                                  <Badge className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs font-semibold">
                                    Popular
                                  </Badge>
                                )}
                                <div className="flex justify-between items-center">
                                  <div className="font-semibold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                  <div className={`font-semibold ${
                                    isDisabled 
                                      ? "text-neutral-400"
                                      : formData.addOns.includes(addOn.id) 
                                      ? "text-rose-600" 
                                      : "text-neutral-500"
                                  }`}>
                                    +€{addOn.price}
                                  </div>
                                </div>
                                {isDisabled && (
                                  <div className="text-xs text-neutral-400 mt-1">
                                    Requires Full Design or Renovation service level
                                  </div>
                                )}
                                {addOn.id === "3d-render" && !isDisabled && (
                                  <div className="text-xs text-neutral-500 mt-1">
                                    🖼️ Preview your space before construction begins
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-neutral-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., DESIGN10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-neutral-300 bg-white text-neutral-800 placeholder:text-neutral-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Info */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-neutral-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-rose-400" />
                      Get your design quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            placeholder="Your full name"
                            value={formData.contactInfo.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, name: e.target.value }
                            }))}
                            className="pl-10 border-neutral-300 bg-white text-neutral-800 placeholder:text-neutral-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-neutral-300 bg-white text-neutral-800 placeholder:text-neutral-400 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            placeholder="+353 xxx xxx xxx"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="pl-10 border-neutral-300 bg-white text-neutral-800 placeholder:text-neutral-400 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-8 font-semibold rounded-xl"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-neutral-800 mb-4">Your Design Investment</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-rose-500">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-neutral-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-rose-500"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-800">
                      <span>Total</span>
                      <span className="text-rose-500">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-neutral-800">Ready to Transform Your Space?</h3>
                    <p className="text-sm text-neutral-600">
                      This quote is valid for 3 days. Award-winning designers with premium portfolio.
                    </p>
                    
                    <Button 
                      className="w-full bg-rose-400 hover:bg-rose-500 text-white py-3 font-semibold rounded-xl"
                      onClick={() => {
                        const subject = "Interior Design Consultation";
                        const body = `I'd love to book a consultation! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@ateliervisionhaus.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🎨 Book a Consultation
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-neutral-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-400 rounded-full mr-1"></div>
                        Award-winning
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div>
                        Portfolio
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-neutral-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-500 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-neutral-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 3 days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-xl"
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