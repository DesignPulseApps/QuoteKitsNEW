import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Heart, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Upload,
  Star,
  Zap
} from "lucide-react";

interface TattooFormData {
  size: string;
  placement: string;
  style: string;
  colorType: string;
  customArt: string;
  sessionType: string;
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
  sizeAdd: number;
  styleAdd: number;
  colorAdd: number;
  customArtAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface TattooArtistCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function TattooArtistCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: TattooArtistCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
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
  
  const [formData, setFormData] = useState<TattooFormData>({
    size: "",
    placement: "",
    style: "",
    colorType: "",
    customArt: "",
    sessionType: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const tattooSizes = [
    { id: "xs", label: "XS (fingertip-sized)", basePrice: 100, icon: "⚫", popular: false },
    { id: "small", label: "Small (palm-sized)", basePrice: 150, icon: "🔴", popular: true },
    { id: "medium", label: "Medium (forearm/calf)", basePrice: 250, icon: "🟠", popular: true },
    { id: "large", label: "Large (sleeve/back)", basePrice: 500, icon: "🔶", popular: false },
  ];

  const placements = [
    { id: "arm", label: "Arm", surcharge: 0, icon: "💪", popular: true },
    { id: "leg", label: "Leg", surcharge: 0, icon: "🦵", popular: true },
    { id: "back", label: "Back", surcharge: 25, icon: "🫸" },
    { id: "chest", label: "Chest", surcharge: 25, icon: "❤️" },
    { id: "neck", label: "Neck", surcharge: 50, icon: "🗣️" },
    { id: "hand", label: "Hand", surcharge: 75, icon: "✋" },
    { id: "face", label: "Face", surcharge: 100, icon: "😶" },
  ];

  const styles = [
    { id: "fine-line", label: "Fine Line", surcharge: 0, icon: "✒️", popular: true },
    { id: "realism", label: "Realism", surcharge: 100, icon: "🎨", popular: true },
    { id: "traditional", label: "Traditional", surcharge: 25, icon: "⚡", popular: true },
    { id: "blackwork", label: "Blackwork", surcharge: 50, icon: "⚫" },
    { id: "watercolor", label: "Color/Watercolor", surcharge: 75, icon: "🌈" },
  ];

  const colorTypes = [
    { id: "black-grey", label: "Black & Grey", multiplier: 1.0, popular: true },
    { id: "color", label: "Color", multiplier: 1.15, popular: true },
  ];

  const customArtOptions = [
    { id: "no", label: "Use existing design", surcharge: 0, popular: true },
    { id: "yes", label: "Custom artwork needed", surcharge: 75, popular: false },
  ];

  const sessionTypes = [
    { id: "one-shot", label: "Single session", surcharge: 0, popular: true },
    { id: "multiple", label: "Multiple sessions", surcharge: 50, popular: false },
  ];

  const addOnOptions = [
    { id: "priority", label: "Priority booking", price: 60, popular: true },
    { id: "aftercare", label: "Aftercare kit", price: 25, popular: true },
    { id: "touch-up", label: "Touch-up session included", price: 40, popular: false },
    { id: "consultation", label: "Design consultation", price: 50, popular: false },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const size = tattooSizes.find(s => s.id === formData.size);
    const placement = placements.find(p => p.id === formData.placement);
    const style = styles.find(s => s.id === formData.style);
    const colorType = colorTypes.find(c => c.id === formData.colorType);
    const customArt = customArtOptions.find(c => c.id === formData.customArt);
    const sessionType = sessionTypes.find(s => s.id === formData.sessionType);

    const basePrice = size?.basePrice || customConfig?.basePrice || 80;
    const sizeAdd = 0; // Already included in base price
    const styleAdd = style?.surcharge || 0;
    const colorMultiplier = colorType?.multiplier || 1.0;
    const customArtAdd = customArt?.surcharge || 0;
    const sessionAdd = sessionType?.surcharge || 0;
    const placementAdd = placement?.surcharge || 0;
    
    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base service
    breakdown.push(`${size?.label || 'Base tattoo'}: €${basePrice}`);

    // Placement surcharge
    if (placementAdd > 0) {
      breakdown.push(`${placement?.label} placement: €${placementAdd}`);
    }

    // Style surcharge
    if (styleAdd > 0) {
      breakdown.push(`${style?.label} style: €${styleAdd}`);
    }

    // Session type
    if (sessionAdd > 0) {
      breakdown.push(`${sessionType?.label}: €${sessionAdd}`);
    }

    // Custom artwork
    if (customArtAdd > 0) {
      breakdown.push(`Custom artwork: €${customArtAdd}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    let subtotal = basePrice + placementAdd + styleAdd + sessionAdd + customArtAdd + addOnsTotal;

    // Color multiplier
    if (colorMultiplier > 1.0) {
      const colorAdd = subtotal * (colorMultiplier - 1.0);
      breakdown.push(`Color work (${Math.round((colorMultiplier - 1.0) * 100)}%): €${colorAdd.toFixed(2)}`);
      subtotal = subtotal * colorMultiplier;
    }

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "ink10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      sizeAdd: 0,
      styleAdd,
      colorAdd: subtotal * (colorMultiplier - 1.0),
      customArtAdd,
      addOnsTotal,
      subtotal: subtotal,
      discount,
      total,
      breakdown,
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse size
    if (input.includes("large") || input.includes("sleeve") || input.includes("back")) newFormData.size = "large";
    else if (input.includes("medium") || input.includes("forearm") || input.includes("calf")) newFormData.size = "medium";
    else if (input.includes("small") || input.includes("palm")) newFormData.size = "small";
    else newFormData.size = "xs";

    // Parse placement
    if (input.includes("arm")) newFormData.placement = "arm";
    else if (input.includes("leg")) newFormData.placement = "leg";
    else if (input.includes("back")) newFormData.placement = "back";
    else if (input.includes("chest")) newFormData.placement = "chest";
    else if (input.includes("neck")) newFormData.placement = "neck";
    else if (input.includes("hand")) newFormData.placement = "hand";
    else if (input.includes("face")) newFormData.placement = "face";
    else newFormData.placement = "arm";

    // Parse style
    if (input.includes("realism") || input.includes("realistic")) newFormData.style = "realism";
    else if (input.includes("traditional")) newFormData.style = "traditional";
    else if (input.includes("blackwork") || input.includes("black work")) newFormData.style = "blackwork";
    else if (input.includes("watercolor") || input.includes("color")) newFormData.style = "watercolor";
    else newFormData.style = "fine-line";

    // Parse color type
    if (input.includes("color") || input.includes("watercolor")) newFormData.colorType = "color";
    else newFormData.colorType = "black-grey";

    // Parse custom art
    if (input.includes("custom") || input.includes("design")) newFormData.customArt = "yes";
    else newFormData.customArt = "no";

    // Parse session type
    if (input.includes("multiple") || input.includes("sessions")) newFormData.sessionType = "multiple";
    else newFormData.sessionType = "one-shot";

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
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-red-600 bg-red-50 shadow-lg ring-2 ring-red-200" 
          : "border-gray-600 hover:border-red-500 bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-semibold ${selected ? "text-red-800" : "text-white"}`}><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-red-600" : "text-gray-300"}`}>€{option.basePrice} onSave={() => {}} /></div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-red-600" : "text-gray-300"}`}>+€{option.surcharge} onSave={() => {}} /></div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-red-600" : "text-gray-300"}`}>+€{option.price} onSave={() => {}} /></div>
        )}
        {option.multiplier !== undefined && option.multiplier > 1.0 && (
          <div className={`text-sm mt-1 ${selected ? "text-red-600" : "text-gray-300"}`}>+{Math.round((option.multiplier - 1.0) * 100)}%</div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Tattoo Details", completed: !!formData.size && !!formData.placement && !!formData.style },
    { number: 2, title: "Color & Custom Work", completed: !!formData.colorType && !!formData.customArt },
    { number: 3, title: "Session & Add-ons", completed: !!formData.sessionType },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-white mb-2">
            Tattoo Artist Quote Calculator
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto font-body">
            Professional tattoo artistry for every style and vision. Get your personalized quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-800/90 backdrop-blur-sm border-red-600 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-red-600 text-white"
                          : currentStep === step.number
                          ? "bg-red-700 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-300">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-red-600 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Tattoo Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2 text-red-600" />
                      Describe your tattoo vision
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-red-900/30 rounded-xl border border-red-600">
                      <label className="block text-sm font-body text-gray-300 mb-2">
                        Describe your tattoo idea (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., A medium color tattoo of a snake on my arm"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-gray-800 border-red-600 text-white mb-3 resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Tattoo Size</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {tattooSizes.map((size) => (
                            <OptionCard
                              key={size.id}
                              option={size}
                              selected={formData.size === size.id}
                              onClick={() => setFormData(prev => ({ ...prev, size: size.id }))}
                              icon={size.icon}
                              popular={size.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Placement Area</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {placements.map((placement) => (
                            <OptionCard
                              key={placement.id}
                              option={placement}
                              selected={formData.placement === placement.id}
                              onClick={() => setFormData(prev => ({ ...prev, placement: placement.id }))}
                              icon={placement.icon}
                              popular={placement.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Design Style</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {styles.map((style) => (
                            <OptionCard
                              key={style.id}
                              option={style}
                              selected={formData.style === style.id}
                              onClick={() => setFormData(prev => ({ ...prev, style: style.id }))}
                              icon={style.icon}
                              popular={style.popular}
                            />
                          ))}
                        </div>

                        {formData.style === "realism" && (
                          <div className="mt-4 p-3 bg-red-900/30 rounded-xl border border-red-600">
                            <div className="text-sm text-gray-300">
                              🎨 Most booked: Medium Color + Custom Art
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.size || !formData.placement || !formData.style}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Color & Custom Work */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Zap className="h-6 w-6 mr-2 text-red-600" />
                      Color and artwork details
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Color Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {colorTypes.map((colorType) => (
                            <OptionCard
                              key={colorType.id}
                              option={colorType}
                              selected={formData.colorType === colorType.id}
                              onClick={() => setFormData(prev => ({ ...prev, colorType: colorType.id }))}
                              popular={colorType.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Custom Artwork</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {customArtOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              selected={formData.customArt === option.id}
                              onClick={() => setFormData(prev => ({ ...prev, customArt: option.id }))}
                              popular={option.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Upload Reference (Optional)</h3>
                        <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center bg-gray-800/50">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">
                            Upload images of your design inspiration
                          </p>
                          <Button variant="outline" className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700">
                            Choose Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.colorType || !formData.customArt}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Session & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-red-600" />
                      Session planning and extras
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Session Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {sessionTypes.map((session) => (
                            <OptionCard
                              key={session.id}
                              option={session}
                              selected={formData.sessionType === session.id}
                              onClick={() => setFormData(prev => ({ ...prev, sessionType: session.id }))}
                              popular={session.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Add-ons (Optional)</h3>
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
                              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-red-600 bg-red-50 shadow-lg text-red-800"
                                  : "border-gray-600 hover:border-red-500 bg-gray-800 text-white hover:bg-gray-700"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className={`font-semibold ${formData.addOns.includes(addOn.id) ? "text-red-600" : "text-gray-300"}`}>
                                  +€{addOn.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-200 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., INK10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                        />
                      </div>

                      {formData.size === "large" && formData.colorType === "color" && (
                        <div className="p-4 bg-red-900/30 rounded-xl border border-red-600">
                          <h4 className="font-semibold text-red-400 mb-2">💡 Recommended for Large Color Tattoos:</h4>
                          <div className="text-sm text-gray-300">
                            Multiple sessions are recommended for large, detailed color work to ensure optimal healing and color saturation.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.sessionType}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-red-600" />
                      Get your tattoo quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="pl-10 border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-gray-800/95 backdrop-blur-sm border-red-600 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-white mb-4">Your Tattoo Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-red-400">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span className="text-red-400"><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-red-400 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-white">
                      <span>Total</span>
                      <span className="text-red-400">€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-white">Ready for Your Ink?</h3>
                    <p className="text-sm text-gray-300">
                      This quote is valid for 72 hours. Professional artistry that tells your story.
                    </p>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Tattoo Appointment Booking";
                        const body = `I'd love to book a tattoo appointment! My quote is €${pricing.total.toLocaleString()}.`;
                        const mailtoUrl = `mailto:info@inkstudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🖋️ Book Now
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                        Professional Artist
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-700 rounded-full mr-1"></div>
                        Sterile Equipment
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-gray-600 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-gray-300">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 72 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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