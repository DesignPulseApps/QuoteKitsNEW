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
  Paintbrush, 
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
  Palette,
  Shield,
  HelpCircle
} from "lucide-react";

interface PaintingFormData {
  projectType: string;
  roomCount: string;
  wallCondition: string;
  paintType: string;
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
  prepWork: number;
  paintUpgrade: number;
  urgencyAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface PaintingDecoratingCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function PaintingDecoratingCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: PaintingDecoratingCalculatorProps = {}) {
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
  const [formData, setFormData] = useState<PaintingFormData>({
    projectType: "",
    roomCount: "",
    wallCondition: "",
    paintType: "",
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
    { id: "interior", label: "Interior Painting", basePrice: 180, icon: "🏠", popular: true },
    { id: "exterior", label: "Exterior Painting", basePrice: 250, icon: "🏘️", popular: true },
    { id: "wallpaper", label: "Wallpapering", basePrice: 220, icon: "📜", popular: false },
    { id: "decorative", label: "Decorative Finishing", basePrice: 300, icon: "✨", popular: false },
    { id: "whole-house", label: "Whole House Redecorating", basePrice: 800, icon: "🏡", popular: true },
  ];

  const roomCounts = [
    { id: "1-room", label: "1 Room", multiplier: 1, popular: false },
    { id: "2-3-rooms", label: "2–3 Rooms", multiplier: 2.5, popular: true },
    { id: "4-5-rooms", label: "4–5 Rooms", multiplier: 4.5, popular: true },
    { id: "full-home", label: "Full Home (6+)", multiplier: 6.5, popular: false },
  ];

  const wallConditions = [
    { id: "new", label: "New / Recently Plastered", prepCost: 0, popular: false },
    { id: "minor", label: "Minor Imperfections", prepCost: 30, popular: true },
    { id: "repair", label: "Needs Prep / Repair Work", prepCost: 80, popular: false },
  ];

  const paintTypes = [
    { id: "standard", label: "Standard", upgrade: 0, popular: true },
    { id: "premium", label: "Premium / Washable", upgrade: 30, popular: true },
    { id: "eco", label: "Eco-Friendly", upgrade: 25, popular: false },
  ];

  const urgencyLevels = [
    { id: "flexible", label: "Flexible", surcharge: 0, popular: false },
    { id: "two-weeks", label: "Within 2 Weeks", surcharge: 50, popular: true },
    { id: "asap", label: "ASAP", surcharge: 100, popular: true },
  ];

  const addOnOptions = [
    { id: "ceiling", label: "Ceiling Included", price: 25, popular: true },
    { id: "doors-trims", label: "Doors / Trims", price: 40, popular: true },
    { id: "feature-wall", label: "Feature Wall / Accent", price: 50, popular: false },
    { id: "two-coat", label: "Two-Coat Finish", price: 35, popular: true },
    { id: "protection", label: "Furniture Protection & Cleanup", price: 45, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const projectType = projectTypes.find(p => p.id === formData.projectType);
    const roomCount = roomCounts.find(r => r.id === formData.roomCount);
    const wallCondition = wallConditions.find(w => w.id === formData.wallCondition);
    const paintType = paintTypes.find(p => p.id === formData.paintType);
    const urgency = urgencyLevels.find(u => u.id === formData.urgency);

    const basePrice = (projectType?.basePrice || customConfig?.basePrice || 180) * (roomCount?.multiplier || 1);
    const prepWork = (wallCondition?.prepCost || 0) * (roomCount?.multiplier || 1);
    const paintUpgrade = (paintType?.upgrade || 0) * (roomCount?.multiplier || 1);
    const urgencyAdd = urgency?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base service
    breakdown.push(`${projectType?.label || 'Base painting'} (${roomCount?.label}): €${basePrice.toFixed(0)}`);

    // Prep work
    if (prepWork > 0) {
      breakdown.push(`Wall preparation (${wallCondition?.label}): €${prepWork}`);
    }

    // Paint upgrade
    if (paintUpgrade > 0) {
      breakdown.push(`${paintType?.label} paint upgrade: €${paintUpgrade}`);
    }

    // Urgency
    if (urgencyAdd > 0) {
      breakdown.push(`${urgency?.label} urgency fee: €${urgencyAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    // Auto-add furniture protection for full-home projects
    if (formData.projectType === "whole-house" && !formData.addOns.includes("protection")) {
      const protectionPrice = 45;
      addOnsTotal += protectionPrice;
      breakdown.push(`Furniture protection (auto-added): €${protectionPrice}`);
    }

    let subtotal = basePrice + prepWork + paintUpgrade + urgencyAdd + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "paint10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      prepWork,
      paintUpgrade,
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
    if (input.includes("exterior") || input.includes("outside")) newFormData.projectType = "exterior";
    else if (input.includes("wallpaper") || input.includes("wallpapering")) newFormData.projectType = "wallpaper";
    else if (input.includes("decorative") || input.includes("finishing")) newFormData.projectType = "decorative";
    else if (input.includes("whole house") || input.includes("full house")) newFormData.projectType = "whole-house";
    else newFormData.projectType = "interior";

    // Parse room count
    if (input.includes("1 room") || input.includes("one room")) newFormData.roomCount = "1-room";
    else if (input.includes("2") || input.includes("3") || input.includes("two") || input.includes("three")) newFormData.roomCount = "2-3-rooms";
    else if (input.includes("4") || input.includes("5") || input.includes("four") || input.includes("five")) newFormData.roomCount = "4-5-rooms";
    else newFormData.roomCount = "full-home";

    // Parse wall condition
    if (input.includes("new") || input.includes("recently")) newFormData.wallCondition = "new";
    else if (input.includes("repair") || input.includes("prep")) newFormData.wallCondition = "repair";
    else newFormData.wallCondition = "minor";

    // Parse paint type
    if (input.includes("premium") || input.includes("washable")) newFormData.paintType = "premium";
    else if (input.includes("eco") || input.includes("eco-friendly")) newFormData.paintType = "eco";
    else newFormData.paintType = "standard";

    // Parse urgency
    if (input.includes("asap") || input.includes("urgent") || input.includes("quickly")) newFormData.urgency = "asap";
    else if (input.includes("weeks") || input.includes("soon")) newFormData.urgency = "two-weeks";
    else newFormData.urgency = "flexible";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("ceiling")) newAddOns.push("ceiling");
    if (input.includes("doors") || input.includes("trim")) newAddOns.push("doors-trims");
    if (input.includes("feature") || input.includes("accent")) newAddOns.push("feature-wall");
    if (input.includes("two coat") || input.includes("double coat")) newAddOns.push("two-coat");
    if (input.includes("protection") || input.includes("cleanup")) newAddOns.push("protection");
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
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-blue-600 bg-blue-50 shadow-lg" 
          : "border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-25"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-semibold ${selected ? "text-blue-800" : "text-gray-700"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.prepCost !== undefined && option.prepCost > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>+€{option.prepCost}/room</div>
        )}
        {option.upgrade !== undefined && option.upgrade > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>+€{option.upgrade}/room</div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            {option.multiplier}x rate
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Project Details", completed: !!formData.projectType && !!formData.roomCount },
    { number: 2, title: "Condition & Paint", completed: !!formData.wallCondition && !!formData.paintType },
    { number: 3, title: "Add-ons & Timeline", completed: !!formData.urgency },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            Professional Painting & Decorating Quote
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Get an instant, professional estimate for your painting and decorating project. Trusted by homeowners and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-blue-200 rounded-xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
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
                      <div className="w-8 h-px bg-blue-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Project Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Paintbrush className="h-6 w-6 mr-2 text-blue-600" />
                      What painting project do you need?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your painting project (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Need to repaint 3 rooms with premium paint and trim"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-blue-200 text-gray-800 mb-3 resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Project Type</h3>
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

                        {formData.projectType === "interior" && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="text-sm text-gray-600">
                              🎨 Most booked: Interior + Ceiling + Doors + Two-Coats
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Number of Rooms / Area</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {roomCounts.map((room) => (
                            <OptionCard
                              key={room.id}
                              option={room}
                              selected={formData.roomCount === room.id}
                              onClick={() => setFormData(prev => ({ ...prev, roomCount: room.id }))}
                              popular={room.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.projectType || !formData.roomCount}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Condition & Paint */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-blue-600" />
                      Surface condition and paint quality
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Condition of Walls</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {wallConditions.map((condition) => (
                            <OptionCard
                              key={condition.id}
                              option={condition}
                              selected={formData.wallCondition === condition.id}
                              onClick={() => setFormData(prev => ({ ...prev, wallCondition: condition.id }))}
                              popular={condition.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Paint Type Preference</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {paintTypes.map((paint) => (
                            <div key={paint.id} className="relative">
                              <OptionCard
                                option={paint}
                                selected={formData.paintType === paint.id}
                                onClick={() => setFormData(prev => ({ ...prev, paintType: paint.id }))}
                                popular={paint.popular}
                              />
                              {paint.id === "premium" && (
                                <div className="absolute top-2 right-2" title="Premium paint explained: Higher durability, easier cleaning, better coverage">
                                  <HelpCircle 
                                    className="h-4 w-4 text-gray-400 cursor-help" 
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.wallCondition || !formData.paintType}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-blue-600" />
                      Additional services and timeline
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Add-ons (Optional)</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {addOnOptions.map((addOn) => (
                            <div
                              key={addOn.id}
                              onClick={() => {
                                const newAddOns = formData.addOns.includes(addOn.id)
                                  ? formData.addOns.filter(id => id !== addOn.id)
                                  : [...formData.addOns, addOn.id];
                                setFormData(prev => ({ ...prev, addOns: newAddOns }));
                              }}
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-blue-600 bg-blue-50 shadow-lg text-gray-800"
                                  : "border-gray-300 hover:border-blue-400 bg-white text-gray-700 hover:bg-blue-25"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-semibold ${formData.addOns.includes(addOn.id) ? "text-blue-600" : "text-gray-500"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                              {addOn.id === "feature-wall" && (
                                <div className="text-xs text-gray-500 mt-1">
                                  💡 What is a feature wall? → An accent wall with different color or finish to create visual interest
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Timeline</h3>
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

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., PAINT10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.urgency}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-blue-600" />
                      Get your painting quote
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
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
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
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
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
                            className="pl-10 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-blue-200 rounded-xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Painting Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-blue-600"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Transform Your Space?</h3>
                    <p className="text-sm text-gray-600">
                      This price is valid for 48 hours. Professional painters with full insurance coverage.
                    </p>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Painting Project Callback";
                        const body = `I'd like to request a callback for my painting project! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@finishprovienna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🎨 Request Callback
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        Professional
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                        Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-700 rounded-full mr-1"></div>
                        Guaranteed
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
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