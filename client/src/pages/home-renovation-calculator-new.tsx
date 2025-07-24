import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Home, 
  Ruler, 
  Building, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Hammer
} from "lucide-react";

interface RenovationFormData {
  projectType: string;
  propertySize: string;
  propertyType: string;
  finishQuality: string;
  timeframe: string;
  extras: string[];
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
  projectTypeAdd: number;
  finishMultiplier: number;
  timeframeSurcharge: number;
  extrasCost: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface HomeRenovationCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function HomeRenovationCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: HomeRenovationCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig || null);
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
  const [formData, setFormData] = useState<RenovationFormData>({
    projectType: "",
    propertySize: "",
    propertyType: "",
    finishQuality: "",
    timeframe: "",
    extras: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const projectTypes = [
    { id: "kitchen-remodel", label: "Kitchen Remodel", icon: "🍳", popular: true, min: 6000, max: 15000 },
    { id: "bathroom-remodel", label: "Bathroom Remodel", icon: "🚿", popular: true, min: 4000, max: 10000 },
    { id: "full-home", label: "Full Home Makeover", icon: "🏠", popular: false, min: 20000, max: 50000 },
    { id: "flooring", label: "Flooring", icon: "🔲", popular: true, min: 2000, max: 8000 },
    { id: "painting", label: "Painting", icon: "🎨", popular: false, min: 1000, max: 5000 },
    { id: "basement-conversion", label: "Basement Conversion", icon: "⬇️", popular: false, min: 8000, max: 20000 },
    { id: "attic-renovation", label: "Attic Renovation", icon: "⬆️", popular: false, min: 5000, max: 15000 },
  ];

  const propertySizes = [
    { id: "under-50", label: "Under 50m²", icon: "🏢" },
    { id: "50-100", label: "50-100m²", icon: "🏡" },
    { id: "100-200", label: "100-200m²", icon: "🏘️" },
    { id: "over-200", label: "Over 200m²", icon: "🏰" },
  ];

  const propertyTypes = [
    { id: "apartment", label: "Apartment", icon: "🏢" },
    { id: "house", label: "House", icon: "🏡" },
    { id: "duplex", label: "Duplex", icon: "🏘️" },
    { id: "commercial", label: "Commercial Space", icon: "🏬" },
  ];

  const finishQualities = [
    { id: "standard", label: "Standard", multiplier: 1.0, icon: "⭐" },
    { id: "premium", label: "Premium", multiplier: 1.2, icon: "⭐⭐" },
    { id: "luxury", label: "Luxury", multiplier: 1.35, icon: "⭐⭐⭐" },
  ];

  const timeframes = [
    { id: "flexible", label: "Flexible", surcharge: 0, icon: "📅" },
    { id: "3-months", label: "Next 3 Months", surcharge: 0, icon: "⏰" },
    { id: "asap", label: "ASAP / Urgent", surcharge: 500, icon: "🚨" },
  ];

  const extraOptions = [
    { id: "interior-design", label: "Interior Design Consultation", price: 800 },
    { id: "project-management", label: "Project Management", price: 1200 },
    { id: "cleanup", label: "Cleanup & Disposal", price: 400 },
    { id: "permits", label: "Permit Assistance", price: 350 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const baseConsultation = customConfig?.basePrice || 500;
    let projectTypeAdd = 0;
    let finishMultiplier = 1.0;
    let timeframeSurcharge = 0;
    let extrasCost = 0;
    const breakdown: string[] = [`Base consultation fee: €${baseConsultation}`];

    // Project type pricing
    const project = projectTypes.find(p => p.id === formData.projectType);
    if (project) {
      projectTypeAdd = (project.min + project.max) / 2; // Use average for display
      breakdown.push(`${project.label}: €${projectTypeAdd.toLocaleString()}`);
    }

    // Finish quality multiplier
    const finish = finishQualities.find(f => f.id === formData.finishQuality);
    if (finish) {
      finishMultiplier = finish.multiplier;
      if (finishMultiplier > 1.0) {
        const percentage = Math.round((finishMultiplier - 1) * 100);
        breakdown.push(`${finish.label} finish (+${percentage}%): €${Math.round((projectTypeAdd * (finishMultiplier - 1)))}`);
      }
    }

    // Timeframe surcharge
    const timeframe = timeframes.find(t => t.id === formData.timeframe);
    if (timeframe && timeframe.surcharge > 0) {
      timeframeSurcharge = timeframe.surcharge;
      breakdown.push(`${timeframe.label} surcharge: €${timeframeSurcharge}`);
    }

    // Extras pricing
    formData.extras.forEach(extraId => {
      const extra = extraOptions.find(e => e.id === extraId);
      if (extra) {
        extrasCost += extra.price;
        breakdown.push(`${extra.label}: €${extra.price}`);
      }
    });

    const subtotal = baseConsultation + (projectTypeAdd * finishMultiplier) + timeframeSurcharge + extrasCost;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "save10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseConsultation,
      projectTypeAdd: projectTypeAdd * finishMultiplier,
      finishMultiplier,
      timeframeSurcharge,
      extrasCost,
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
    if (input.includes("kitchen")) newFormData.projectType = "kitchen-remodel";
    else if (input.includes("bathroom")) newFormData.projectType = "bathroom-remodel";
    else if (input.includes("full home") || input.includes("whole house")) newFormData.projectType = "full-home";
    else if (input.includes("floor")) newFormData.projectType = "flooring";
    else if (input.includes("paint")) newFormData.projectType = "painting";
    else if (input.includes("basement")) newFormData.projectType = "basement-conversion";
    else if (input.includes("attic")) newFormData.projectType = "attic-renovation";

    // Parse property size
    const sizeMatch = input.match(/(\d+)\s*m²?/);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      if (size < 50) newFormData.propertySize = "under-50";
      else if (size <= 100) newFormData.propertySize = "50-100";
      else if (size <= 200) newFormData.propertySize = "100-200";
      else newFormData.propertySize = "over-200";
    }

    // Parse property type
    if (input.includes("apartment") || input.includes("flat")) newFormData.propertyType = "apartment";
    else if (input.includes("duplex")) newFormData.propertyType = "duplex";
    else if (input.includes("commercial") || input.includes("office")) newFormData.propertyType = "commercial";
    else newFormData.propertyType = "house";

    // Parse finish quality
    if (input.includes("luxury") || input.includes("high-end")) newFormData.finishQuality = "luxury";
    else if (input.includes("premium") || input.includes("quality")) newFormData.finishQuality = "premium";
    else newFormData.finishQuality = "standard";

    // Parse timeframe
    if (input.includes("urgent") || input.includes("asap") || input.includes("soon")) {
      newFormData.timeframe = "asap";
    } else if (input.includes("3 months") || input.includes("spring") || input.includes("summer")) {
      newFormData.timeframe = "3-months";
    } else {
      newFormData.timeframe = "flexible";
    }

    // Parse extras
    const newExtras: string[] = [];
    if (input.includes("design") || input.includes("interior")) newExtras.push("interior-design");
    if (input.includes("management") || input.includes("project manager")) newExtras.push("project-management");
    if (input.includes("cleanup") || input.includes("disposal")) newExtras.push("cleanup");
    if (input.includes("permit") || input.includes("permits")) newExtras.push("permits");
    newFormData.extras = newExtras;

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
          ? "border-orange-500 bg-orange-50 shadow-md" 
          : "border-gray-200 hover:border-orange-300"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-gray-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && (
          <div className="text-sm text-gray-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1.0 && (
          <div className="text-sm text-gray-600 mt-1">+{Math.round((option.multiplier - 1) * 100)}%</div>
        )}
        {option.min !== undefined && option.max !== undefined && (
          <div className="text-sm text-gray-600 mt-1">€{option.min.toLocaleString()}-€{option.max.toLocaleString()} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project Type", completed: !!formData.projectType },
    { number: 2, title: "Property Details", completed: !!formData.propertySize && !!formData.propertyType },
    { number: 3, title: "Finish & Timeline", completed: !!formData.finishQuality && !!formData.timeframe },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            Home Renovation Quote Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Get an instant quote for your renovation project. Professional service, transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Hammer className="h-6 w-6 mr-2 text-orange-500" />
                      What type of renovation project?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your project in your own words (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I want to redo my kitchen and paint my apartment (80m²)"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white/80 border-orange-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        variant="outline" 
                        size="sm" 
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 font-body"
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
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Home className="h-6 w-6 mr-2 text-orange-500" />
                      Property details
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Property Size</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {propertySizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.propertySize === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertySize: size.id }))}
                              icon={size.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Property Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {propertyTypes.map((property) => (
                            <OptionCard
                              key={property.id}
                              option={property}
                              selected={formData.propertyType === property.id}
                              onClick={() => setFormData(prev => ({ ...prev, propertyType: property.id }))}
                              icon={property.icon}
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
                      className="px-8"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.propertySize || !formData.propertyType}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Finish & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-orange-500" />
                      Finish quality & timeline
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Finish Quality</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {finishQualities.map((finish) => (
                            <OptionCard
                              key={finish.id}
                              option={finish}
                              selected={formData.finishQuality === finish.id}
                              onClick={() => setFormData(prev => ({ ...prev, finishQuality: finish.id }))}
                              icon={finish.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Timeframe</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {timeframes.map((timeframe) => (
                            <OptionCard
                              key={timeframe.id}
                              option={timeframe}
                              selected={formData.timeframe === timeframe.id}
                              onClick={() => setFormData(prev => ({ ...prev, timeframe: timeframe.id }))}
                              icon={timeframe.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Additional Services</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {extraOptions.map((extra) => (
                            <div
                              key={extra.id}
                              onClick={() => {
                                const newExtras = formData.extras.includes(extra.id)
                                  ? formData.extras.filter(id => id !== extra.id)
                                  : [...formData.extras, extra.id];
                                setFormData(prev => ({ ...prev, extras: newExtras }));
                              }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.extras.includes(extra.id)
                                  ? "border-orange-500 bg-orange-50 shadow-md"
                                  : "border-gray-200 hover:border-orange-300"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-gray-800"><EditableText value={extra.label} onSave={() => {}} /></div>
                                <div className="text-sm text-gray-600 mt-1">+€{extra.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SAVE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.finishQuality || !formData.timeframe}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8"
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
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-orange-500" />
                      Get your detailed quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8"
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
            <Card className="p-6 bg-white/90 backdrop-blur-sm sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Renovation Estimate</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-orange-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 1 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {formData.projectType && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-700">
                      🏠 Most clients choose: Kitchen + Premium Finish + Project Management
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Schedule a Site Visit?</h3>
                    <p className="text-sm text-gray-600">
                      This quote is valid for 3 days. Book your consultation today.
                    </p>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                      onClick={() => {
                        const subject = "Home Renovation Consultation";
                        const body = `I'm ready to schedule a site visit for my renovation project! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@renovation.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🏠 Schedule Site Visit
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Licensed & Bonded
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                        Free Consultation
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-orange-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 3 days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
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