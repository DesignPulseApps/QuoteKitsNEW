import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Car, 
  Clock, 
  MapPin, 
  Sparkles, 
  Droplets, 
  Shield,
  Mail,
  Download,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Home,
  Building,
  Calendar
} from "lucide-react";

interface CarWashFormData {
  vehicleSize: string;
  servicePackage: string;
  addOns: string[];
  serviceLocation: string;
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
  sizeAdjustment: number;
  packagePrice: number;
  addOnsTotal: number;
  urgencyFee: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
  breakdown: string[];
}

interface MobileCarWashCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
  onConfigChange?: (config: any) => void;
}

export default function MobileCarWashCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false, onConfigChange }: MobileCarWashCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
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
  
  const [formData, setFormData] = useState<CarWashFormData>({
    vehicleSize: "",
    servicePackage: "",
    addOns: [],
    serviceLocation: "",
    urgency: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: { name: "", email: "", phone: "" }
  });



  // Use custom pricing configuration if available
  const getVehicleSizePricing = () => {
    if (customConfig?.groupPrices) {
      return customConfig.groupPrices.map((group: any) => ({
        label: group.label,
        value: group.id,
        adjustment: group.price,
        icon: <Car className="h-5 w-5" />
      }));
    }
    return [
      { label: "Compact Car", value: "compact", adjustment: 0, icon: <Car className="h-5 w-5" /> },
      { label: "Sedan", value: "sedan", adjustment: 10, icon: <Car className="h-5 w-5" /> },
      { label: "SUV", value: "suv", adjustment: 20, icon: <Car className="h-6 w-6" /> },
      { label: "Truck / Van", value: "truck", adjustment: 30, icon: <Car className="h-7 w-7" /> },
    ];
  };

  const getServicePackagePricing = () => {
    if (customConfig?.sessionDurations) {
      return customConfig.sessionDurations.map((duration: any) => ({
        label: duration.label,
        value: duration.id,
        price: duration.price,
        description: duration.description || "Professional car wash service",
        icon: <Sparkles className="h-5 w-5" />,
        popular: duration.id === "ext_int"
      }));
    }
    return [
      { 
        label: "Exterior Only", 
        value: "exterior", 
        price: 30, 
        description: "Wash, rinse, and dry exterior surfaces",
        icon: <Droplets className="h-5 w-5" />
      },
      { 
        label: "Exterior + Interior", 
        value: "ext_int", 
        price: 50, 
        description: "Complete exterior wash plus interior vacuum and wipe down",
        icon: <Sparkles className="h-5 w-5" />,
        popular: true
      },
      { 
        label: "Full Detail", 
        value: "full_detail", 
        price: 110, 
        description: "Premium wash, wax, interior deep clean, and conditioning",
        icon: <Star className="h-5 w-5" />
      },
      { 
        label: "Showroom Finish", 
        value: "showroom", 
        price: 180, 
        description: "Ultimate detailing with paint correction and ceramic protection",
        icon: <Shield className="h-5 w-5" />
      },
    ];
  };

  const getAddOnPricing = () => {
    if (customConfig?.enhancementPrices) {
      return customConfig.enhancementPrices.map((addon: any) => ({
        label: addon.label,
        value: addon.id,
        price: addon.price,
        icon: addon.icon || "🔧"
      }));
    }
    return [
      { label: "Engine Bay Cleaning", value: "engine", price: 25, icon: "🔧" },
      { label: "Pet Hair Removal", value: "pet_hair", price: 20, icon: "🐕" },
      { label: "Ceramic Coating", value: "ceramic", price: 100, icon: "✨" },
      { label: "Wax & Polish", value: "wax", price: 35, icon: "🪞" },
      { label: "Headlight Restoration", value: "headlight", price: 40, icon: "💡" },
    ];
  };

  const vehicleSizeOptions = getVehicleSizePricing();
  const servicePackageOptions = getServicePackagePricing();
  const addOnOptions = getAddOnPricing();

  const locationOptions = [
    { label: "At Home", value: "home", icon: <Home className="h-5 w-5" /> },
    { label: "At Work", value: "work", icon: <Building className="h-5 w-5" /> },
    { label: "Other Location", value: "other", icon: <MapPin className="h-5 w-5" /> },
  ];

  const urgencyOptions = [
    { label: "Next 24 Hours", value: "rush", fee: 25, icon: <Zap className="h-5 w-5" /> },
    { label: "2-3 Days", value: "normal", fee: 0, icon: <Calendar className="h-5 w-5" /> },
    { label: "Flexible", value: "flexible", fee: 0, icon: <Clock className="h-5 w-5" /> },
  ];

  const processNaturalLanguage = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/process-car-wash', {
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
      
      // Update form data with AI-extracted information
      setFormData(prev => ({
        ...prev,
        vehicleSize: result.vehicleSize || prev.vehicleSize,
        servicePackage: result.servicePackage || prev.servicePackage,
        serviceLocation: result.serviceLocation || prev.serviceLocation,
        urgency: result.urgency || prev.urgency,
        addOns: result.addOns?.length ? result.addOns : prev.addOns
      }));

    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const calculatePricing = (): PricingBreakdown => {
    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    
    const selectedVehicle = vehicleSizeOptions.find(v => v.value === formData.vehicleSize);
    const selectedPackage = servicePackageOptions.find(p => p.value === formData.servicePackage);
    const selectedUrgency = urgencyOptions.find(u => u.value === formData.urgency);
    
    const basePrice = selectedPackage?.price || 0;
    const sizeAdjustment = selectedVehicle?.adjustment || 0;
    const packagePrice = basePrice;
    const addOnsTotal = formData.addOns.reduce((total, addon) => {
      const addOnPrice = addOnOptions.find(a => a.value === addon)?.price || 0;
      return total + addOnPrice;
    }, 0);
    const urgencyFee = selectedUrgency?.fee || 0;
    
    const subtotal = packagePrice + sizeAdjustment + addOnsTotal + urgencyFee;
    const promoDiscount = formData.promoCode.toLowerCase() === "wash10" ? subtotal * 0.1 : 0;
    const total = subtotal - promoDiscount;

    const breakdown = [
      `${selectedPackage?.label || "Service"}: €${packagePrice}`,
      ...(sizeAdjustment > 0 ? [`Vehicle size adjustment: €${sizeAdjustment}`] : []),
      ...formData.addOns.map(addon => {
        const addOnOption = addOnOptions.find(a => a.value === addon);
        return `${addOnOption?.label}: €${addOnOption?.price}`;
      }),
      ...(urgencyFee > 0 ? [`Rush service (24h): €${urgencyFee}`] : []),
      ...(promoDiscount > 0 ? [`Promo discount: -€${promoDiscount.toFixed(2)}`] : []),
    ];

    return {
      basePrice,
      sizeAdjustment,
      packagePrice,
      addOnsTotal,
      urgencyFee,
      subtotal,
      promoDiscount,
      total,
      breakdown
    };
  };

  const OptionCard = ({ option, selected, onClick, popular = false, icon = null }: any) => (
    <div
      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-25"
      }`}
      onClick={onClick}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className={`font-medium text-sm ${selected ? "text-blue-800" : "text-gray-700"}`}>
          {option.label}
        </div>
        {option.adjustment !== undefined && option.adjustment > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            +€{option.adjustment}
          </div>
        )}
        {option.price !== undefined && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            €{option.price}
          </div>
        )}
        {option.fee !== undefined && option.fee > 0 && (
          <div className={`text-sm mt-1 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            +€{option.fee}
          </div>
        )}
        {option.description && (
          <div className={`text-xs mt-2 ${selected ? "text-blue-600" : "text-gray-500"}`}>
            {option.description}
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Vehicle & Package", completed: !!formData.vehicleSize && !!formData.servicePackage },
    { number: 2, title: "Add-ons & Location", completed: !!formData.serviceLocation },
    { number: 3, title: "Timing & Promos", completed: !!formData.urgency },
    { number: 4, title: "Contact Info", completed: !!formData.contactInfo.email },
  ];

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-25 to-sky-100">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Calculator Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center">
            <Droplets className="h-10 w-10 mr-3 text-blue-500" />
            <EditableText
              value={textConfig.headline || "Mobile Car Wash Quote Calculator"}
              onSave={(value) => updateTextContent('headline', value)}
              className="flex-1"
              isPreview={isPreview}
            />
          </h1>
          <EditableText
            value={textConfig.description || "Get instant pricing for professional mobile car wash services. We come to you with eco-friendly solutions and sparkling results."}
            onSave={(value) => updateTextContent('description', value)}
            className="text-blue-600 max-w-2xl mx-auto font-medium"
            isPreview={isPreview}
          />
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-blue-500">
            <span className="flex items-center">
              <Droplets className="h-4 w-4 mr-1" />
              Waterless Technology
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Eco-Friendly
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Satisfaction Guaranteed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-blue-500 text-white"
                          : currentStep === step.number
                          ? "bg-blue-400 text-white"
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

              {/* Step 1: Vehicle Size & Service Package */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Car className="h-5 w-5 mr-2 text-blue-500" />
                      Select Your Vehicle Size
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vehicleSizeOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.vehicleSize === option.value}
                          onClick={() => setFormData({ ...formData, vehicleSize: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                      Choose Service Package
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {servicePackageOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.servicePackage === option.value}
                          onClick={() => setFormData({ ...formData, servicePackage: option.value })}
                          popular={option.popular}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.vehicleSize || !formData.servicePackage}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      Continue to Add-ons
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Add-ons & Location */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-500" />
                      Optional Add-ons
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
                          icon={<span className="text-2xl"><EditableText value={option.icon} onSave={() => {}} /></span>}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      Service Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {locationOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.serviceLocation === option.value}
                          onClick={() => setFormData({ ...formData, serviceLocation: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="px-8 py-3 text-lg"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.serviceLocation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      Continue to Timing
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Timing & Promos */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-500" />
                      Preferred Timing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {urgencyOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          option={option}
                          selected={formData.urgency === option.value}
                          onClick={() => setFormData({ ...formData, urgency: option.value })}
                          icon={option.icon}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Promo Code (Optional)
                    </h3>
                    <Input
                      type="text"
                      placeholder="Enter promo code (e.g., WASH10)"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="max-w-md"
                    />
                    {formData.promoCode.toLowerCase() === "wash10" && (
                      <p className="text-green-600 text-sm mt-2">✅ 10% discount applied!</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Natural Language Request (Optional)
                    </h3>
                    <Textarea
                      placeholder="e.g., 'I need a full detail on my SUV at work tomorrow with ceramic coating'"
                      value={formData.naturalLanguageInput}
                      onChange={(e) => setFormData({ ...formData, naturalLanguageInput: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 py-3 text-lg"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.urgency}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      Continue to Contact
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Information */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-500" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.contactInfo.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, name: e.target.value }
                        })}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-700">
                      📧 Your detailed quote will be emailed to you instantly. This estimate is valid for 48 hours.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 py-3 text-lg"
                    >
                      Back
                    </Button>
                    <div className="space-x-4">
                      <Button
                        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Email Quote
                      </Button>
                      <Button
                        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
                        variant="outline"
                        className="px-8 py-3 text-lg"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card id="pricing-sidebar" className="p-6 bg-white border-blue-200 rounded-3xl shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    €{pricing.total.toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-sm">Estimated Total</p>
                  {pricing.promoDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You saved €{pricing.promoDiscount.toFixed(2)}!
                    </p>
                  )}
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
                    <span>Total:</span>
                    <span className="text-blue-600">€{pricing.total.toFixed(2)} onSave={() => {}} /></span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-2xl"
                  disabled={currentStep < 4 || !formData.contactInfo.email}
                >
                  <Droplets className="mr-2 h-5 w-5" />
                  Book Mobile Wash
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    💧 Eco-friendly • 🚗 Mobile service • ⭐ Satisfaction guaranteed
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