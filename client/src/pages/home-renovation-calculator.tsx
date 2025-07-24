import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Home, 
  Calculator, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Download,
  Mail,
  AlertTriangle,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

interface PricingConfig {
  baseConsultation: number;
  projectTypes: Record<string, { min: number; max: number }>;
  finishMultipliers: Record<string, number>;
  extras: Record<string, number>;
  timeframeSurcharges: Record<string, number>;
  promoCodes: Record<string, number>;
}

// Removed hardcoded pricing config - now using dynamic configuration

interface HomeRenovationCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function HomeRenovationCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: HomeRenovationCalculatorProps = {}) {
  const { toast } = useToast();
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

  // Use custom pricing configuration if available
  const getPricingConfig = () => {
    if (customConfig) {
      return {
        baseConsultation: customConfig.basePrice || 500,
        projectTypes: customConfig.groupPrices?.reduce((acc: any, group: any) => {
          acc[group.id] = { min: group.price, max: group.price * 2.5 };
          return acc;
        }, {}) || {
          "kitchen-remodel": { min: 6000, max: 15000 },
          "bathroom-remodel": { min: 4000, max: 10000 },
          "full-home": { min: 20000, max: 50000 },
          "flooring": { min: 2000, max: 8000 },
          "painting": { min: 1000, max: 5000 },
          "basement-conversion": { min: 8000, max: 20000 },
          "attic-renovation": { min: 5000, max: 15000 }
        },
        finishMultipliers: {
          "standard": 1.0,
          "premium": 1.2,
          "luxury": 1.35
        },
        extras: customConfig.enhancementPrices?.reduce((acc: any, addon: any) => {
          acc[addon.id] = addon.price;
          return acc;
        }, {}) || {
          "interior-design": 800,
          "project-management": 1200,
          "cleanup": 400,
          "permits": 350
        },
        timeframeSurcharges: {
          "flexible": 0,
          "3-months": 0,
          "asap": 500
        },
        promoCodes: {
          "LAUNCH10": 0.1,
          "NEWCLIENT": 0.15,
          "QUOTEKIT": 0.1
        }
      };
    }
    return {
      baseConsultation: 500,
      projectTypes: {
        "kitchen-remodel": { min: 6000, max: 15000 },
        "bathroom-remodel": { min: 4000, max: 10000 },
        "full-home": { min: 20000, max: 50000 },
        "flooring": { min: 2000, max: 8000 },
        "painting": { min: 1000, max: 5000 },
        "basement-conversion": { min: 8000, max: 20000 },
        "attic-renovation": { min: 5000, max: 15000 }
      },
      finishMultipliers: {
        "standard": 1.0,
        "premium": 1.2,
        "luxury": 1.35
      },
      extras: {
        "interior-design": 800,
        "project-management": 1200,
        "cleanup": 400,
        "permits": 350
      },
      timeframeSurcharges: {
        "flexible": 0,
        "3-months": 0,
        "asap": 500
      },
      promoCodes: {
        "LAUNCH10": 0.1,
        "NEWCLIENT": 0.15,
        "QUOTEKIT": 0.1
      }
    };
  };

  const pricingConfig = getPricingConfig();

  const projectTypeOptions = [
    { value: "kitchen-remodel", label: "Kitchen Remodel", popular: true },
    { value: "bathroom-remodel", label: "Bathroom Remodel", popular: true },
    { value: "full-home", label: "Full Home Makeover" },
    { value: "flooring", label: "Flooring" },
    { value: "painting", label: "Painting" },
    { value: "basement-conversion", label: "Basement Conversion" },
    { value: "attic-renovation", label: "Attic Renovation" }
  ];

  const extrasOptions = [
    { id: "interior-design", label: "Interior Design Consultation", price: pricingConfig.extras["interior-design"] },
    { id: "project-management", label: "Project Management", price: pricingConfig.extras["project-management"] },
    { id: "cleanup", label: "Cleanup & Disposal", price: pricingConfig.extras["cleanup"] },
    { id: "permits", label: "Permit Assistance", price: pricingConfig.extras["permits"] }
  ];

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
      phone: ""
    }
  });

  const [quote, setQuote] = useState<{
    total: number;
    breakdown: Array<{ label: string; amount: number }>;
    validUntil: Date;
  } | null>(null);

  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate quote in real-time
  useEffect(() => {
    calculateQuote();
  }, [formData.projectType, formData.propertySize, formData.finishQuality, formData.timeframe, formData.extras, formData.promoCode]);

  const calculateQuote = () => {
    if (!formData.projectType) return;

    const currency = customConfig?.currency || "EUR";
    const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "CHF" ? "CHF " : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : "€";
    const breakdown: Array<{ label: string; amount: number }> = [];
    let total = pricingConfig.baseConsultation;
    
    breakdown.push({ label: "Consultation Fee", amount: pricingConfig.baseConsultation });

    // Project type base cost
    const projectConfig = pricingConfig.projectTypes[formData.projectType];
    if (projectConfig) {
      // Use property size to determine within range
      let projectCost = projectConfig.min;
      if (formData.propertySize === "50-100") {
        projectCost = projectConfig.min + (projectConfig.max - projectConfig.min) * 0.3;
      } else if (formData.propertySize === "100-200") {
        projectCost = projectConfig.min + (projectConfig.max - projectConfig.min) * 0.6;
      } else if (formData.propertySize === "200+") {
        projectCost = projectConfig.max;
      }

      total += projectCost;
      breakdown.push({ 
        label: `${projectTypeOptions.find(p => p.value === formData.projectType)?.label} Base Cost`, 
        amount: projectCost 
      });
    }

    // Finish quality multiplier
    if (formData.finishQuality) {
      const multiplier = pricingConfig.finishMultipliers[formData.finishQuality];
      if (multiplier > 1) {
        const increase = (total - pricingConfig.baseConsultation) * (multiplier - 1);
        total += increase;
        breakdown.push({ 
          label: `${formData.finishQuality.charAt(0).toUpperCase() + formData.finishQuality.slice(1)} Finish Upgrade`, 
          amount: increase 
        });
      }
    }

    // Extras
    formData.extras.forEach(extraId => {
      const extraCost = pricingConfig.extras[extraId];
      if (extraCost) {
        total += extraCost;
        const extraLabel = extrasOptions.find(e => e.id === extraId)?.label || extraId;
        breakdown.push({ label: extraLabel, amount: extraCost });
      }
    });

    // Timeframe surcharge
    if (formData.timeframe) {
      const surcharge = pricingConfig.timeframeSurcharges[formData.timeframe];
      if (surcharge > 0) {
        total += surcharge;
        breakdown.push({ label: "Urgent Timeline Surcharge", amount: surcharge });
      }
    }

    // Promo code discount
    if (formData.promoCode) {
      const discount = pricingConfig.promoCodes[formData.promoCode.toUpperCase()];
      if (discount) {
        const discountAmount = total * discount;
        total -= discountAmount;
        breakdown.push({ label: `Promo Code (${formData.promoCode.toUpperCase()})`, amount: -discountAmount });
      }
    }

    // Quote valid for 3 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 3);

    setQuote({
      total: Math.round(total),
      breakdown,
      validUntil
    });
  };

  const handleExtraToggle = (extraId: string) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }));
  };

  const handleGetDetailedQuote = () => {
    setShowContactForm(true);
  };

  const handleSubmitQuote = async () => {
    if (!formData.contactInfo.email || !formData.contactInfo.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email to receive the detailed quote.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Quote Sent Successfully!",
        description: "Check your email for the detailed renovation quote and next steps.",
      });
      
      setShowContactForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseNaturalLanguage = () => {
    const input = formData.naturalLanguageInput.toLowerCase();
    const updates: Partial<RenovationFormData> = {};

    // Project type detection
    if (input.includes("kitchen")) updates.projectType = "kitchen-remodel";
    else if (input.includes("bathroom")) updates.projectType = "bathroom-remodel";
    else if (input.includes("full home") || input.includes("whole house")) updates.projectType = "full-home";
    else if (input.includes("floor")) updates.projectType = "flooring";
    else if (input.includes("paint")) updates.projectType = "painting";
    else if (input.includes("basement")) updates.projectType = "basement-conversion";
    else if (input.includes("attic")) updates.projectType = "attic-renovation";

    // Property size detection
    if (input.match(/\d+\s*m²/)) {
      const size = parseInt(input.match(/(\d+)\s*m²/)?.[1] || "0");
      if (size < 50) updates.propertySize = "under-50";
      else if (size <= 100) updates.propertySize = "50-100";
      else if (size <= 200) updates.propertySize = "100-200";
      else updates.propertySize = "200+";
    }

    // Quality detection
    if (input.includes("luxury") || input.includes("high-end")) updates.finishQuality = "luxury";
    else if (input.includes("premium")) updates.finishQuality = "premium";
    else if (input.includes("standard") || input.includes("basic")) updates.finishQuality = "standard";

    setFormData(prev => ({ ...prev, ...updates }));
    
    toast({
      title: "Input Parsed!",
      description: "I've automatically filled in the form based on your description.",
    });
  };

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Home className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Home Renovation Quote Estimator</h1>
              <p className="text-gray-400">Get instant pricing for your renovation project</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            {/* Natural Language Input */}
            <Card className="bg-midnight-800 border-midnight-700 p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 text-neon-400 mr-2" />
                <h3 className="text-lg font-semibold">AI-Powered Input (Optional)</h3>
              </div>
              <Textarea
                placeholder="Describe your project in plain English... e.g., 'I want to redo my kitchen and paint my apartment (80m²)'"
                value={formData.naturalLanguageInput}
                onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                className="bg-midnight-700 border-midnight-600 mb-4"
                rows={3}
              />
              <Button 
                onClick={parseNaturalLanguage}
                disabled={!formData.naturalLanguageInput.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Parse & Fill Form
              </Button>
            </Card>

            {/* Project Details Form */}
            <Card className="bg-midnight-800 border-midnight-700 p-6">
              <h3 className="text-lg font-semibold mb-6">Project Details</h3>
              
              <div className="space-y-6">
                {/* Project Type */}
                <div>
                  <Label className="text-white mb-3 block font-medium">Project Type *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {projectTypeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.projectType === option.value
                            ? "border-neon-500 bg-neon-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, projectType: option.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium"><EditableText value={option.label} onSave={() => {}} /></span>
                          {option.popular && (
                            <Badge variant="secondary" className="bg-neon-500/20 text-neon-400">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          €{pricingConfig.projectTypes[option.value]?.min.toLocaleString()} - 
                          €{pricingConfig.projectTypes[option.value]?.max.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Size */}
                <div>
                  <Label className="text-white mb-2 block">Property Size *</Label>
                  <Select value={formData.propertySize} onValueChange={(value) => setFormData(prev => ({ ...prev, propertySize: value }))}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select property size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-50">Under 50m²</SelectItem>
                      <SelectItem value="50-100">50–100m²</SelectItem>
                      <SelectItem value="100-200">100–200m²</SelectItem>
                      <SelectItem value="200+">Over 200m²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <Label className="text-white mb-2 block">Property Type</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="commercial">Commercial Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Finish Quality */}
                <div>
                  <Label className="text-white mb-2 block">Finish Quality *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(pricingConfig.finishMultipliers).map(([key, multiplier]) => (
                      <div
                        key={key}
                        className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                          formData.finishQuality === key
                            ? "border-neon-500 bg-neon-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, finishQuality: key }))}
                      >
                        <div className="font-medium capitalize"><EditableText value={key} onSave={() => {}} /></div>
                        <div className="text-sm text-gray-400">
                          {multiplier > 1 ? `+${((multiplier - 1) * 100).toFixed(0)}%` : "Base"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <Label className="text-white mb-2 block">Timeframe</Label>
                  <Select value={formData.timeframe} onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="3-months">Next 3 months</SelectItem>
                      <SelectItem value="asap">ASAP / Urgent (+€500)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Extras */}
                <div>
                  <Label className="text-white mb-3 block">Add-ons & Services</Label>
                  <div className="space-y-3">
                    {extrasOptions.map((extra) => (
                      <div key={extra.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={extra.id}
                          checked={formData.extras.includes(extra.id)}
                          onCheckedChange={() => handleExtraToggle(extra.id)}
                        />
                        <label htmlFor={extra.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <span><EditableText value={extra.label} onSave={() => {}} /></span>
                            <span className="text-neon-400 font-medium">+€{extra.price} onSave={() => {}} /></span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <Label className="text-white mb-2 block">Promo Code</Label>
                  <Input
                    placeholder="Enter promo code (e.g., LAUNCH10)"
                    value={formData.promoCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="bg-midnight-700 border-midnight-600"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    Try: LAUNCH10, NEWCLIENT, or QUOTEKIT
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quote Results */}
          <div className="space-y-6">
            <Card className="bg-midnight-800 border-midnight-700 p-6">
              <h3 className="text-lg font-semibold mb-6">Your Renovation Estimate</h3>
              
              {quote ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Total Price */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
                    <div className="text-sm text-gray-300 mb-2">Total Estimated Cost</div>
                    <div className="text-4xl font-bold text-blue-400">€{quote.total.toLocaleString()} onSave={() => {}} /></div>
                    <div className="text-sm text-gray-400 mt-2 flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Valid until {quote.validUntil.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200">Cost Breakdown:</h4>
                    {quote.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300"><EditableText value={item.label} onSave={() => {}} /></span>
                        <span className={`font-medium ${item.amount < 0 ? 'text-green-400' : 'text-white'}`}>
                          {item.amount < 0 ? '-' : ''}€{Math.abs(item.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-midnight-600" />

                  {/* CTA Buttons */}
                  {!showContactForm ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleGetDetailedQuote}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        size="lg"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Get Detailed Quote & Breakdown
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-midnight-600 hover:bg-midnight-700"
                        size="lg"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Estimate
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-200">Contact Information</h4>
                      <div className="space-y-3">
                        <Input
                          placeholder="Your Name *"
                          value={formData.contactInfo.name}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, name: e.target.value }
                          }))}
                          className="bg-midnight-700 border-midnight-600"
                        />
                        <Input
                          type="email"
                          placeholder="Email Address *"
                          value={formData.contactInfo.email}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, email: e.target.value }
                          }))}
                          className="bg-midnight-700 border-midnight-600"
                        />
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.contactInfo.phone}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, phone: e.target.value }
                          }))}
                          className="bg-midnight-700 border-midnight-600"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleSubmitQuote}
                        disabled={isSubmitting}
                        className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                        size="lg"
                      >
                        {isSubmitting ? (
                          "Sending Quote..."
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Email My Detailed Quote
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Quote Timer */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center text-orange-400">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        This quote expires in 3 days - Schedule your consultation to lock in pricing!
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill out the form to see your personalized quote</p>
                </div>
              )}
            </Card>

            {/* Popular Choices */}
            <Card className="bg-midnight-800 border-midnight-700 p-6">
              <h3 className="text-lg font-semibold mb-4">💡 Smart Suggestions</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-neon-500/10 border border-neon-500/30 rounded-lg">
                  <div className="font-medium text-neon-400">Most Popular Combo</div>
                  <div className="text-gray-300">Kitchen Remodel + Premium Finish + Project Management</div>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="font-medium text-blue-400">Best Value</div>
                  <div className="text-gray-300">Bathroom + Flooring combo saves 15% vs separate projects</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}