import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Home, 
  Clock, 
  Building, 
  Frame, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  DoorOpen,
  Plus,
  Minus
} from "lucide-react";

interface WindowDoorFormData {
  serviceType: string;
  unitCount: number;
  productType: string;
  materialType: string;
  accessType: string;
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
  materialSurcharge: number;
  accessSurcharge: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
  pricePerUnit: number;
}

interface WindowDoorCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function WindowDoorCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: WindowDoorCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<WindowDoorFormData>({
    serviceType: "",
    unitCount: 1,
    productType: "",
    materialType: "",
    accessType: "",
    addOns: [],
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const serviceTypes = [
    { id: "windows", label: "Window Installation", basePrice: 300, icon: "🪟", popular: true },
    { id: "doors", label: "Door Installation", basePrice: 450, icon: "🚪", popular: true },
    { id: "both", label: "Both Windows & Doors", basePrice: 375, icon: "🏠" },
  ];

  const productTypes = [
    { id: "standard", label: "Standard", surcharge: 0, icon: "🏠", popular: true },
    { id: "energy-efficient", label: "Energy Efficient", surcharge: 150, icon: "⚡", popular: true },
    { id: "premium-custom", label: "Premium Custom", surcharge: 300, icon: "✨" },
  ];

  const materialTypes = [
    { id: "pvc", label: "PVC / uPVC", surcharge: 0, icon: "🔧", popular: true },
    { id: "wood", label: "Wood", surcharge: 100, icon: "🌳" },
    { id: "aluminum", label: "Aluminum", surcharge: 75, icon: "🔩", popular: true },
    { id: "composite", label: "Composite", surcharge: 125, icon: "🧱" },
  ];

  const accessTypes = [
    { id: "ground", label: "Ground Floor", surcharge: 0, icon: "🏠", popular: true },
    { id: "first-floor", label: "First/Second Floor", surcharge: 75, icon: "🏢" },
    { id: "scaffolding", label: "Scaffolding Required", surcharge: 150, icon: "🚧" },
  ];

  const addOnOptions = [
    { id: "frame-removal", label: "Old Frame Removal", price: 80, popular: true },
    { id: "waste-disposal", label: "Disposal of Waste", price: 50, popular: true },
    { id: "fast-track", label: "Fast Track Install", price: 120 },
    { id: "extra-locks", label: "Extra Locking Features", price: 90 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const service = serviceTypes.find(s => s.id === formData.serviceType);
    const product = productTypes.find(p => p.id === formData.productType);
    const material = materialTypes.find(m => m.id === formData.materialType);
    const access = accessTypes.find(a => a.id === formData.accessType);

    const baseUnitPrice = service?.basePrice || customConfig?.basePrice || 150;
    const productSurcharge = product?.surcharge || 0;
    const materialSurcharge = material?.surcharge || 0;
    const accessSurchargePerUnit = access?.surcharge || 0;

    const pricePerUnit = baseUnitPrice + productSurcharge + materialSurcharge;
    const basePrice = pricePerUnit * formData.unitCount;
    const accessSurcharge = accessSurchargePerUnit * formData.unitCount;

    let addOnsTotal = 0;

    const breakdown: string[] = [];

    // Base pricing
    breakdown.push(`${service?.label} (${formData.unitCount} unit${formData.unitCount !== 1 ? 's' : ''}): €${basePrice.toLocaleString()}`);

    // Access surcharge
    if (accessSurcharge > 0) {
      breakdown.push(`${access?.label} (${formData.unitCount} unit${formData.unitCount !== 1 ? 's' : ''}): €${accessSurcharge.toLocaleString()}`);
    }

    // Add-ons
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    let subtotal = basePrice + accessSurcharge + addOnsTotal;

    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "install10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice,
      materialSurcharge,
      accessSurcharge,
      addOnsTotal,
      subtotal,
      discount,
      total,
      breakdown,
      pricePerUnit: pricePerUnit + (accessSurchargePerUnit || 0),
    };
  };

  const pricing = calculatePricing();

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const newFormData = { ...formData };

    // Parse service type
    if (input.includes("window") && input.includes("door")) newFormData.serviceType = "both";
    else if (input.includes("door")) newFormData.serviceType = "doors";
    else newFormData.serviceType = "windows";

    // Parse unit count
    const numbers = input.match(/(\d+)/g);
    if (numbers) {
      const totalUnits = numbers.reduce((sum, num) => sum + parseInt(num), 0);
      newFormData.unitCount = Math.max(1, Math.min(20, totalUnits));
    }

    // Parse material type
    if (input.includes("aluminum") || input.includes("aluminium")) newFormData.materialType = "aluminum";
    else if (input.includes("wood") || input.includes("wooden")) newFormData.materialType = "wood";
    else if (input.includes("composite")) newFormData.materialType = "composite";
    else newFormData.materialType = "pvc";

    // Parse product type
    if (input.includes("premium") || input.includes("custom")) newFormData.productType = "premium-custom";
    else if (input.includes("energy") || input.includes("efficient")) newFormData.productType = "energy-efficient";
    else newFormData.productType = "standard";

    // Parse access type
    if (input.includes("upstairs") || input.includes("first floor") || input.includes("second floor")) newFormData.accessType = "first-floor";
    else if (input.includes("scaffolding") || input.includes("high")) newFormData.accessType = "scaffolding";
    else newFormData.accessType = "ground";

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("removal") || input.includes("remove")) newAddOns.push("frame-removal");
    if (input.includes("waste") || input.includes("disposal")) newAddOns.push("waste-disposal");
    if (input.includes("fast") || input.includes("quick") || input.includes("urgent")) newAddOns.push("fast-track");
    if (input.includes("lock") || input.includes("security")) newAddOns.push("extra-locks");
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
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        selected 
          ? "border-slate-600 bg-slate-50 shadow-lg" 
          : "border-slate-300 hover:border-slate-500 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.basePrice !== undefined && (
          <div className="text-sm text-slate-600 mt-1">€{option.basePrice}/unit</div>
        )}
        {option.surcharge !== undefined && option.surcharge > 0 && (
          <div className="text-sm text-slate-600 mt-1">+€{option.surcharge}/unit</div>
        )}
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-slate-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Service & Units", completed: !!formData.serviceType && formData.unitCount > 0 },
    { number: 2, title: "Product & Material", completed: !!formData.productType && !!formData.materialType },
    { number: 3, title: "Access & Add-ons", completed: !!formData.accessType },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-slate-800 mb-2">
            Window & Door Installation Calculator
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-body">
            Professional window and door installation services. Get your custom quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-slate-300 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-slate-600 text-white"
                          : currentStep === step.number
                          ? "bg-slate-700 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Service & Units */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Frame className="h-6 w-6 mr-2 text-slate-600" />
                      What installation service do you need?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="block text-sm font-body text-slate-700 mb-2">
                        Describe your installation needs (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., I need 3 aluminum windows and 2 sliding doors upstairs"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-slate-200 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-slate-700 hover:bg-slate-800 text-white border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Service Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {serviceTypes.map((service) => (
                            <OptionCard
                              key={service.id}
                              option={service}
                              selected={formData.serviceType === service.id}
                              onClick={() => setFormData(prev => ({ ...prev, serviceType: service.id }))}
                              icon={service.icon}
                              popular={service.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Number of Units</h3>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, unitCount: Math.max(1, prev.unitCount - 1) }))}
                            disabled={formData.unitCount <= 1}
                            className="border-slate-300"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="text-2xl font-bold text-slate-800 min-w-[3rem] text-center">
                            {formData.unitCount}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, unitCount: Math.min(20, prev.unitCount + 1) }))}
                            disabled={formData.unitCount >= 20}
                            className="border-slate-300"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-slate-600">units (max 20)</span>
                        </div>

                        {formData.serviceType === "windows" && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-sm text-slate-700">
                              🪟 Most selected: PVC windows + waste removal
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.serviceType || formData.unitCount === 0}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Product & Material */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Building className="h-6 w-6 mr-2 text-slate-600" />
                      Product specifications and materials
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Product Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {productTypes.map((product) => (
                            <OptionCard
                              key={product.id}
                              option={product}
                              selected={formData.productType === product.id}
                              onClick={() => setFormData(prev => ({ ...prev, productType: product.id }))}
                              icon={product.icon}
                              popular={product.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Material Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {materialTypes.map((material) => (
                            <OptionCard
                              key={material.id}
                              option={material}
                              selected={formData.materialType === material.id}
                              onClick={() => setFormData(prev => ({ ...prev, materialType: material.id }))}
                              icon={material.icon}
                              popular={material.popular}
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
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.productType || !formData.materialType}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Access & Add-ons */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Home className="h-6 w-6 mr-2 text-slate-600" />
                      Access requirements and additional services
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Access Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {accessTypes.map((access) => (
                            <OptionCard
                              key={access.id}
                              option={access}
                              selected={formData.accessType === access.id}
                              onClick={() => setFormData(prev => ({ ...prev, accessType: access.id }))}
                              icon={access.icon}
                              popular={access.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Add-ons (Optional)</h3>
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
                                  ? "border-slate-600 bg-slate-50 shadow-lg"
                                  : "border-slate-300 hover:border-slate-500 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-slate-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-slate-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-slate-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., INSTALL10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.accessType}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 font-semibold"
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
                    <h2 className="text-2xl font-display text-slate-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-slate-600" />
                      Get your installation quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="pl-10 border-slate-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="pl-10 border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-slate-300 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-slate-800 mb-4">Your Installation Quote</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-slate-700">
                  €{pricing.total.toLocaleString()}
                </div>
                
                {formData.unitCount > 0 && (
                  <div className="text-lg text-slate-600 font-semibold">
                    €{pricing.pricePerUnit.toLocaleString()}/unit × {formData.unitCount}
                  </div>
                )}
                
                {pricing.breakdown.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
                        <span><EditableText value={item.split(': ')[0]} onSave={() => {}} /></span>
                        <span><EditableText value={item.split(': ')[1]} onSave={() => {}} /></span>
                      </div>
                    ))}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-slate-600 font-semibold">
                        <span>Discount</span>
                        <span>-€{pricing.discount.toFixed(2)} onSave={() => {}} /></span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Install Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-slate-800">Ready to Upgrade Your Home?</h3>
                    <p className="text-sm text-slate-600">
                      This quote is valid for 3 business days. Professional installation guaranteed.
                    </p>
                    
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 font-semibold"
                      onClick={() => {
                        const subject = "Window & Door Installation Quote";
                        const body = `I'm interested in window/door installation! My quote is €${pricing.total.toLocaleString()} for ${formData.unitCount} unit${formData.unitCount !== 1 ? 's' : ''}.`;
                        const mailtoUrl = `mailto:info@windowdoorpro.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🚪 Book Installation
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-600 rounded-full mr-1"></div>
                        Licensed & Insured
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        10-Year Warranty
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-700 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 3 business days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
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