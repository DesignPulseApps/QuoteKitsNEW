import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, ArrowLeft, CheckCircle, Sparkles, Lightbulb, Home, Clock, AlertTriangle, Bug, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Calculator as CalculatorType } from "@shared/schema";
import { Link } from "wouter";

interface CalculatorFormData {
  eventType?: string;
  duration?: number;
  guestCount?: number;
  location?: string;
  complexity?: string;
  materials?: string;
  packageType?: string;
  squareFootage?: number;
  // Home renovation fields
  projectType?: string;
  propertySize?: string;
  propertyType?: string;
  finishQuality?: string;
  timeframe?: string;
  extras?: string[];
  promoCode?: string;
  naturalLanguageInput?: string;
  // Pest control fields
  pestType?: string;
  infestationLevel?: string;
  serviceType?: string;
  addOns?: string[];
  // Boudoir photography fields
  sessionType?: string;
  boudoirDuration?: string;
  boudoirLocation?: string;
  outfitCount?: string;
  retouchingLevel?: string;
}

interface QuoteResult {
  basePrice: number;
  adjustedPrice: number;
  factors: Record<string, number>;
  breakdown: string[];
}

interface CalculatorPageProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function CalculatorPage({ customConfig: propConfig, isPreview = false, hideHeader = false }: CalculatorPageProps = {}) {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState<CalculatorFormData>({
    extras: [],
    addOns: []
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const { data: calculator, isLoading } = useQuery<CalculatorType>({
    queryKey: ["/api/calculators", slug],
    enabled: !!slug
  });

  const leadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/embed/demo-${slug}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit lead");
      return response.json();
    },
    onSuccess: () => {
      setShowLeadForm(false);
      setLeadData({ name: "", email: "", phone: "" });
    }
  });

  const calculateQuote = () => {
    if (!calculator?.defaultConfig) return;

    const config = calculator.defaultConfig as any;
    let basePrice = config.basePrice || 0;
    let adjustedPrice = basePrice;
    const factors: Record<string, number> = {};
    const breakdown: string[] = [];

    // Wedding Photography Calculator
    if (calculator.slug === "wedding-photography") {
      breakdown.push(`Base wedding photography package: $${basePrice}`);

      if (formData.duration) {
        const durationFactor = config.factors?.duration?.min + 
          ((formData.duration - 4) / 8) * (config.factors?.duration?.max - config.factors?.duration?.min);
        factors.duration = durationFactor;
        adjustedPrice *= durationFactor;
        breakdown.push(`Duration adjustment (${formData.duration}h): ${(durationFactor * 100 - 100).toFixed(0)}%`);
      }

      if (formData.guestCount) {
        const guestFactor = formData.guestCount > 150 ? 1.3 : formData.guestCount > 100 ? 1.1 : 1.0;
        factors.guests = guestFactor;
        adjustedPrice *= guestFactor;
        if (guestFactor > 1) {
          breakdown.push(`Large event surcharge (${formData.guestCount} guests): ${(guestFactor * 100 - 100).toFixed(0)}%`);
        }
      }

      if (formData.location && formData.location !== "indoor") {
        const locationFactor = config.factors?.location?.[formData.location] || 1.0;
        factors.location = locationFactor;
        adjustedPrice *= locationFactor;
        breakdown.push(`${formData.location} location: ${(locationFactor * 100 - 100).toFixed(0)}%`);
      }
    }

    // Personal Training Calculator
    if (calculator.slug === "personal-training") {
      const sessions = formData.packageType === "single" ? 1 : 
                     formData.packageType === "package_4" ? 4 :
                     formData.packageType === "package_8" ? 8 : 12;
      
      const packageDiscount = config.packageDiscounts?.[formData.packageType || "single"] || 1.0;
      adjustedPrice = basePrice * sessions * packageDiscount;
      
      breakdown.push(`${sessions} session${sessions > 1 ? 's' : ''} at $${basePrice} each`);
      if (packageDiscount < 1) {
        breakdown.push(`Package discount: ${((1 - packageDiscount) * 100).toFixed(0)}% off`);
      }
    }

    // Landscaping Calculator
    if (calculator.slug === "landscaping") {
      breakdown.push(`Base landscaping service: $${basePrice}`);
      
      if (formData.squareFootage) {
        const areaPrice = formData.squareFootage * (config.squareFootRate || 2.5);
        adjustedPrice += areaPrice;
        breakdown.push(`Area coverage (${formData.squareFootage} sq ft): $${areaPrice.toFixed(0)}`);
      }

      if (formData.complexity && formData.complexity !== "basic") {
        const complexityFactor = config.factors?.complexity?.[formData.complexity] || 1.0;
        factors.complexity = complexityFactor;
        adjustedPrice *= complexityFactor;
        breakdown.push(`${formData.complexity} complexity: ${(complexityFactor * 100 - 100).toFixed(0)}%`);
      }

      if (formData.materials && formData.materials !== "standard") {
        const materialFactor = config.factors?.materials?.[formData.materials] || 1.0;
        factors.materials = materialFactor;
        adjustedPrice *= materialFactor;
        breakdown.push(`${formData.materials} materials: ${(materialFactor * 100 - 100).toFixed(0)}%`);
      }
    }

    // Home Renovation Calculator
    if (calculator.slug === "home-renovation") {
      let total = config.baseConsultation || 500;
      breakdown.push(`Consultation Fee: €${total}`);

      // Project type base cost
      if (formData.projectType) {
        const projectConfig = config.projectTypes?.[formData.projectType];
        if (projectConfig) {
          let projectCost = projectConfig.min;
          if (formData.propertySize === "50-100") {
            projectCost = projectConfig.min + (projectConfig.max - projectConfig.min) * 0.3;
          } else if (formData.propertySize === "100-200") {
            projectCost = projectConfig.min + (projectConfig.max - projectConfig.min) * 0.6;
          } else if (formData.propertySize === "200+") {
            projectCost = projectConfig.max;
          }
          
          total += projectCost;
          const projectName = formData.projectType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          breakdown.push(`${projectName} Base Cost: €${projectCost.toFixed(0)}`);
        }
      }

      // Finish quality multiplier
      if (formData.finishQuality && formData.finishQuality !== "standard") {
        const multiplier = config.finishMultipliers?.[formData.finishQuality] || 1.0;
        if (multiplier > 1) {
          const increase = (total - config.baseConsultation) * (multiplier - 1);
          total += increase;
          breakdown.push(`${formData.finishQuality.charAt(0).toUpperCase() + formData.finishQuality.slice(1)} Finish Upgrade: €${increase.toFixed(0)}`);
        }
      }

      // Extras
      if (formData.extras && formData.extras.length > 0) {
        formData.extras.forEach(extraId => {
          const extraCost = config.extras?.[extraId];
          if (extraCost) {
            total += extraCost;
            const extraLabel = extraId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            breakdown.push(`${extraLabel}: €${extraCost}`);
          }
        });
      }

      // Timeframe surcharge
      if (formData.timeframe === "asap") {
        const surcharge = config.timeframeSurcharges?.asap || 500;
        total += surcharge;
        breakdown.push(`Urgent Timeline Surcharge: €${surcharge}`);
      }

      // Promo code discount
      if (formData.promoCode) {
        const discount = config.promoCodes?.[formData.promoCode.toUpperCase()];
        if (discount) {
          const discountAmount = total * discount;
          total -= discountAmount;
          breakdown.push(`Promo Code (${formData.promoCode.toUpperCase()}): -€${discountAmount.toFixed(0)}`);
        }
      }

      adjustedPrice = total;
    }

    // Pest Control Calculator
    if (calculator.slug === "pest-control") {
      let total = config.baseVisit || 100;
      breakdown.push(`Base Visit: €${total}`);

      // Pest type cost
      if (formData.pestType) {
        const pestCost = config.pestTypes?.[formData.pestType] || 0;
        total += pestCost;
        const pestName = formData.pestType.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        breakdown.push(`${pestName} Treatment: €${pestCost}`);
      }

      // Infestation level
      if (formData.infestationLevel && formData.infestationLevel !== "light") {
        const infestationCost = config.infestationLevels?.[formData.infestationLevel] || 0;
        total += infestationCost;
        breakdown.push(`${formData.infestationLevel.charAt(0).toUpperCase() + formData.infestationLevel.slice(1)} Infestation: €${infestationCost}`);
      }

      // Property type multiplier
      if (formData.propertyType) {
        const propertyMultiplier = config.propertyTypes?.[formData.propertyType] || 1.0;
        if (propertyMultiplier > 1) {
          const increase = (total - config.baseVisit) * (propertyMultiplier - 1);
          total += increase;
          const propertyName = formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1);
          breakdown.push(`${propertyName} Property Surcharge: €${increase.toFixed(0)}`);
        }
      }

      // Service type multiplier
      if (formData.serviceType && formData.serviceType !== "one-time") {
        const serviceMultiplier = config.serviceTypes?.[formData.serviceType] || 1.0;
        if (serviceMultiplier < 1) {
          const discount = total * (1 - serviceMultiplier);
          total -= discount;
          const serviceName = formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1);
          breakdown.push(`${serviceName} Service Discount: -€${discount.toFixed(0)}`);
        }
      }

      // Add-ons
      if (formData.addOns && formData.addOns.length > 0) {
        formData.addOns.forEach(addOnId => {
          const addOnCost = config.addOns?.[addOnId];
          if (addOnCost) {
            total += addOnCost;
            const addOnLabel = addOnId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            breakdown.push(`${addOnLabel}: €${addOnCost}`);
          }
        });
      }

      // Promo code discount
      if (formData.promoCode) {
        const discount = config.promoCodes?.[formData.promoCode.toUpperCase()];
        if (discount) {
          const discountAmount = total * discount;
          total -= discountAmount;
          breakdown.push(`Promo Code (${formData.promoCode.toUpperCase()}): -€${discountAmount.toFixed(0)}`);
        }
      }

      adjustedPrice = total;
    }

    // Boudoir Photography Calculator
    if (calculator.slug === "boudoir-photography") {
      let total = config.basePrice || 250;
      breakdown.push(`Base Session (1hr, studio, 1 outfit): €${total}`);

      // Session type adjustment
      if (formData.sessionType && formData.sessionType !== "classic") {
        const sessionCost = config.sessionTypes?.[formData.sessionType] || 0;
        total += sessionCost;
        const sessionName = formData.sessionType.charAt(0).toUpperCase() + formData.sessionType.slice(1);
        breakdown.push(`${sessionName} Session: +€${sessionCost}`);
      }

      // Duration adjustment
      if (formData.boudoirDuration && formData.boudoirDuration !== "1hr") {
        const durationCost = config.durations?.[formData.boudoirDuration] || 0;
        total += durationCost;
        breakdown.push(`${formData.boudoirDuration} Duration: +€${durationCost}`);
      }

      // Location adjustment
      if (formData.boudoirLocation && formData.boudoirLocation !== "studio") {
        const locationCost = config.locations?.[formData.boudoirLocation] || 0;
        total += locationCost;
        const locationName = formData.boudoirLocation === "location" ? "On-Location" : "Hotel Suite";
        breakdown.push(`${locationName}: +€${locationCost}`);
      }

      // Outfit count adjustment
      if (formData.outfitCount && formData.outfitCount !== "1") {
        const outfitCost = config.outfitPricing?.[formData.outfitCount] || 0;
        total += outfitCost;
        breakdown.push(`${formData.outfitCount} Outfits: +€${outfitCost}`);
      }

      // Add-ons
      if (formData.addOns && formData.addOns.length > 0) {
        formData.addOns.forEach(addOnId => {
          const addOnCost = config.addOns?.[addOnId];
          if (addOnCost) {
            total += addOnCost;
            let addOnLabel = addOnId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            if (addOnId === "deluxe-retouching") addOnLabel = "Deluxe Retouching";
            breakdown.push(`${addOnLabel}: +€${addOnCost}`);
          }
        });
      }

      // Retouching level (if not in addOns)
      if (formData.retouchingLevel === "deluxe" && !formData.addOns?.includes("deluxe-retouching")) {
        const retouchingCost = config.addOns?.["deluxe-retouching"] || 75;
        total += retouchingCost;
        breakdown.push(`Deluxe Retouching: +€${retouchingCost}`);
      }

      // Promo code discount
      if (formData.promoCode) {
        const discount = config.promoCodes?.[formData.promoCode.toUpperCase()];
        if (discount) {
          const discountAmount = total * discount;
          total -= discountAmount;
          breakdown.push(`Promo Code (${formData.promoCode.toUpperCase()}): -€${discountAmount.toFixed(0)}`);
        }
      }

      adjustedPrice = total;
    }

    setQuote({
      basePrice,
      adjustedPrice: Math.round(adjustedPrice),
      factors,
      breakdown
    });
  };

  const handleGetQuote = () => {
    calculateQuote();
    setShowLeadForm(true);
  };

  const handleLeadSubmit = () => {
    leadMutation.mutate({
      ...leadData,
      quoteData: formData,
      estimatedValue: quote?.adjustedPrice.toString()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading calculator...</div>
      </div>
    );
  }

  if (!calculator) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Calculator Not Found</h1>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 text-white">
      {!hideHeader && (
        <div className="bg-midnight-800 border-b border-midnight-700">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      )}
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
            <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center">
              <Calculator className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold"><EditableText value={calculator.name} onSave={() => {}} /></h1>
              <p className="text-gray-400"><EditableText value={calculator.description} onSave={() => {}} /></p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <h2 className="text-xl font-bold mb-6">Calculate Your Quote</h2>
            
            {/* Wedding Photography Form */}
            {calculator.slug === "wedding-photography" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Event Type</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceremony-reception">Ceremony + Reception</SelectItem>
                      <SelectItem value="ceremony-only">Ceremony Only</SelectItem>
                      <SelectItem value="reception-only">Reception Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Duration: {formData.duration || 8} hours</Label>
                  <Slider
                    value={[formData.duration || 8]}
                    onValueChange={(value) => setFormData({...formData, duration: value[0]})}
                    min={4}
                    max={12}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>4 hours</span>
                    <span>12 hours</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Number of Guests</Label>
                  <Input
                    type="number"
                    value={formData.guestCount || ""}
                    onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value) || 0})}
                    className="bg-midnight-700 border-midnight-600"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Location Type</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor Venue</SelectItem>
                      <SelectItem value="outdoor">Outdoor Venue</SelectItem>
                      <SelectItem value="destination">Destination Wedding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Personal Training Form */}
            {calculator.slug === "personal-training" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Package Type</Label>
                  <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Session</SelectItem>
                      <SelectItem value="package_4">4-Session Package (5% off)</SelectItem>
                      <SelectItem value="package_8">8-Session Package (10% off)</SelectItem>
                      <SelectItem value="package_12">12-Session Package (15% off)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Landscaping Form */}
            {calculator.slug === "landscaping" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">Project Area (sq ft)</Label>
                  <Input
                    type="number"
                    value={formData.squareFootage || ""}
                    onChange={(e) => setFormData({...formData, squareFootage: parseInt(e.target.value) || 0})}
                    className="bg-midnight-700 border-midnight-600"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Project Complexity</Label>
                  <Select value={formData.complexity} onValueChange={(value) => setFormData({...formData, complexity: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (lawn, simple planting)</SelectItem>
                      <SelectItem value="moderate">Moderate (multiple features)</SelectItem>
                      <SelectItem value="complex">Complex (custom design, hardscaping)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Material Quality</Label>
                  <Select value={formData.materials} onValueChange={(value) => setFormData({...formData, materials: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select materials" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Materials</SelectItem>
                      <SelectItem value="premium">Premium Materials</SelectItem>
                      <SelectItem value="luxury">Luxury Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Boudoir Photography Form */}
            {calculator.slug === "boudoir-photography" && (
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Sparkles className="h-5 w-5 text-rose-400 mr-2" />
                    <Label className="text-rose-400 font-semibold font-serif">AI-Powered Input (Optional)</Label>
                  </div>
                  <Textarea
                    placeholder="Describe your vision... e.g., 'I want a 2-hour boudoir shoot at a hotel with 3 outfits and professional makeup'"
                    value={formData.naturalLanguageInput || ""}
                    onChange={(e) => setFormData({...formData, naturalLanguageInput: e.target.value})}
                    className="bg-midnight-700 border-midnight-600 mb-3"
                    rows={2}
                  />
                  <Button 
                    onClick={() => {
                      const input = formData.naturalLanguageInput?.toLowerCase() || "";
                      const updates: Partial<CalculatorFormData> = {};
                      
                      if (input.includes("2 hour") || input.includes("2hr")) updates.boudoirDuration = "2hr";
                      else if (input.includes("3 hour") || input.includes("3hr")) updates.boudoirDuration = "3hr";
                      else if (input.includes("1 hour") || input.includes("1hr")) updates.boudoirDuration = "1hr";
                      
                      if (input.includes("hotel")) updates.boudoirLocation = "hotel";
                      else if (input.includes("location") || input.includes("on-location")) updates.boudoirLocation = "location";
                      else if (input.includes("studio")) updates.boudoirLocation = "studio";
                      
                      if (input.includes("lingerie")) updates.sessionType = "lingerie";
                      else if (input.includes("nude")) updates.sessionType = "nude";
                      else if (input.includes("glamour")) updates.sessionType = "glamour";
                      else updates.sessionType = "classic";
                      
                      if (input.includes("5 outfit")) updates.outfitCount = "5";
                      else if (input.includes("4 outfit")) updates.outfitCount = "4";
                      else if (input.includes("3 outfit")) updates.outfitCount = "3";
                      else if (input.includes("2 outfit")) updates.outfitCount = "2";
                      else updates.outfitCount = "1";
                      
                      const addOns = [];
                      if (input.includes("makeup")) addOns.push("makeup");
                      if (input.includes("album")) addOns.push("album");
                      if (input.includes("deluxe") || input.includes("premium retouching")) addOns.push("deluxe-retouching");
                      if (addOns.length > 0) updates.addOns = addOns;
                      
                      setFormData({...formData, ...updates});
                    }}
                    variant="outline" 
                    size="sm" 
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </Button>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-serif text-lg">Session Type</Label>
                  <Select value={formData.sessionType} onValueChange={(value) => setFormData({...formData, sessionType: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Choose your session style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic Boudoir</SelectItem>
                      <SelectItem value="lingerie">Lingerie Session (+€25)</SelectItem>
                      <SelectItem value="nude">Fine Art Nude (+€50)</SelectItem>
                      <SelectItem value="glamour">Glamour Session (+€30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-serif text-lg">Session Duration</Label>
                  <Select value={formData.boudoirDuration} onValueChange={(value) => setFormData({...formData, boudoirDuration: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="How long should your session be?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hr">1 Hour</SelectItem>
                      <SelectItem value="2hr">2 Hours (+€75) ⭐ Most Popular</SelectItem>
                      <SelectItem value="3hr">3 Hours (+€150)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-serif text-lg">Location</Label>
                  <Select value={formData.boudoirLocation} onValueChange={(value) => setFormData({...formData, boudoirLocation: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Where would you like to shoot?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">In-Studio</SelectItem>
                      <SelectItem value="location">On-Location (+€100)</SelectItem>
                      <SelectItem value="hotel">Hotel Suite (+€100)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-serif text-lg">Number of Outfits</Label>
                  <Select value={formData.outfitCount} onValueChange={(value) => setFormData({...formData, outfitCount: value})}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="How many looks?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Outfit</SelectItem>
                      <SelectItem value="2">2 Outfits (+€50)</SelectItem>
                      <SelectItem value="3">3 Outfits (+€100) ⭐ Most Popular</SelectItem>
                      <SelectItem value="4">4 Outfits (+€150)</SelectItem>
                      <SelectItem value="5">5 Outfits (+€200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-3 block font-serif text-lg">Add-Ons</Label>
                  <div className="space-y-3">
                    {[
                      { id: "makeup", label: "Professional Makeup (+€60)" },
                      { id: "album", label: "Printed Album (+€120)" },
                      { id: "deluxe-retouching", label: "Deluxe Retouching (+€75)" }
                    ].map((addOn) => (
                      <div key={addOn.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={addOn.id}
                          checked={formData.addOns?.includes(addOn.id) || false}
                          onChange={(e) => {
                            const currentAddOns = formData.addOns || [];
                            if (e.target.checked) {
                              setFormData({...formData, addOns: [...currentAddOns, addOn.id]});
                            } else {
                              setFormData({...formData, addOns: currentAddOns.filter(id => id !== addOn.id)});
                            }
                          }}
                          className="w-4 h-4 text-rose-600 bg-midnight-700 border-midnight-600 rounded focus:ring-rose-500"
                        />
                        <Label htmlFor={addOn.id} className="text-white font-normal"><EditableText value={addOn.label} onSave={() => {}} /></Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-serif text-lg">Promo Code (Optional)</Label>
                  <Input
                    placeholder="Enter promo code"
                    value={formData.promoCode || ""}
                    onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                    className="bg-midnight-700 border-midnight-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Try: BOUDOIR10, NEWCLIENT, or GODDESS</p>
                </div>
              </div>
            )}

            {/* Home Renovation Form */}
            {calculator.slug === "home-renovation" && (
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
                    <Label className="text-blue-400 font-semibold">AI-Powered Input (Optional)</Label>
                  </div>
                  <Textarea
                    placeholder="Describe your project in plain English... e.g., 'I want to redo my kitchen and paint my apartment (80m²)'"
                    value={formData.naturalLanguageInput || ""}
                    onChange={(e) => setFormData({...formData, naturalLanguageInput: e.target.value})}
                    className="bg-midnight-700 border-midnight-600 mb-3"
                    rows={2}
                  />
                  <Button 
                    onClick={() => {
                      const input = formData.naturalLanguageInput?.toLowerCase() || "";
                      const updates: Partial<CalculatorFormData> = {};
                      
                      if (input.includes("kitchen")) updates.projectType = "kitchen-remodel";
                      else if (input.includes("bathroom")) updates.projectType = "bathroom-remodel";
                      else if (input.includes("paint")) updates.projectType = "painting";
                      
                      if (input.match(/\d+\s*m²/)) {
                        const size = parseInt(input.match(/(\d+)\s*m²/)?.[1] || "0");
                        if (size < 50) updates.propertySize = "under-50";
                        else if (size <= 100) updates.propertySize = "50-100";
                        else if (size <= 200) updates.propertySize = "100-200";
                        else updates.propertySize = "200+";
                      }
                      
                      setFormData(prev => ({ ...prev, ...updates }));
                    }}
                    disabled={!formData.naturalLanguageInput?.trim()}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Parse & Fill Form
                  </Button>
                </div>

                {/* Project Type */}
                <div>
                  <Label className="text-white mb-3 block font-medium">Project Type *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "kitchen-remodel", label: "Kitchen Remodel", price: "€6,000-€15,000", popular: true },
                      { value: "bathroom-remodel", label: "Bathroom Remodel", price: "€4,000-€10,000", popular: true },
                      { value: "full-home", label: "Full Home Makeover", price: "€20,000+" },
                      { value: "flooring", label: "Flooring", price: "€2,000-€8,000" },
                      { value: "painting", label: "Painting", price: "€1,000-€5,000" },
                      { value: "basement-conversion", label: "Basement Conversion", price: "€8,000-€20,000" },
                      { value: "attic-renovation", label: "Attic Renovation", price: "€5,000-€15,000" }
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.projectType === option.value
                            ? "border-blue-500 bg-blue-500/10"
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
                        <div className="text-sm text-gray-400 mt-1"><EditableText value={option.price} onSave={() => {}} /></div>
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

                {/* Finish Quality */}
                <div>
                  <Label className="text-white mb-2 block">Finish Quality *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "standard", label: "Standard", multiplier: "Base" },
                      { key: "premium", label: "Premium", multiplier: "+20%" },
                      { key: "luxury", label: "Luxury", multiplier: "+35%" }
                    ].map((option) => (
                      <div
                        key={option.key}
                        className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                          formData.finishQuality === option.key
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, finishQuality: option.key }))}
                      >
                        <div className="font-medium"><EditableText value={option.label} onSave={() => {}} /></div>
                        <div className="text-sm text-gray-400"><EditableText value={option.multiplier} onSave={() => {}} /></div>
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
                    {[
                      { id: "interior-design", label: "Interior Design Consultation", price: 800 },
                      { id: "project-management", label: "Project Management", price: 1200 },
                      { id: "cleanup", label: "Cleanup & Disposal", price: 400 },
                      { id: "permits", label: "Permit Assistance", price: 350 }
                    ].map((extra) => (
                      <div key={extra.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={extra.id}
                          checked={formData.extras?.includes(extra.id) || false}
                          onCheckedChange={(checked) => {
                            const currentExtras = formData.extras || [];
                            if (checked) {
                              setFormData(prev => ({ ...prev, extras: [...currentExtras, extra.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, extras: currentExtras.filter(id => id !== extra.id) }));
                            }
                          }}
                        />
                        <label htmlFor={extra.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <span><EditableText value={extra.label} onSave={() => {}} /></span>
                            <span className="text-blue-400 font-medium">+€{extra.price} onSave={() => {}} /></span>
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
                    value={formData.promoCode || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="bg-midnight-700 border-midnight-600"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    Try: LAUNCH10, NEWCLIENT, or QUOTEKIT
                  </div>
                </div>
              </div>
            )}

            {/* Pest Control Form */}
            {calculator.slug === "pest-control" && (
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Bug className="h-5 w-5 text-green-400 mr-2" />
                    <Label className="text-green-400 font-semibold">AI-Powered Input (Optional)</Label>
                  </div>
                  <Textarea
                    placeholder="Describe your pest problem... e.g., 'I have a mice problem in my warehouse' or 'Ants in my kitchen'"
                    value={formData.naturalLanguageInput || ""}
                    onChange={(e) => setFormData({...formData, naturalLanguageInput: e.target.value})}
                    className="bg-midnight-700 border-midnight-600 mb-3"
                    rows={2}
                  />
                  <Button 
                    onClick={() => {
                      const input = formData.naturalLanguageInput?.toLowerCase() || "";
                      const updates: Partial<CalculatorFormData> = {};
                      
                      if (input.includes("mice") || input.includes("mouse") || input.includes("rat")) updates.pestType = "rodents";
                      else if (input.includes("ant")) updates.pestType = "ants";
                      else if (input.includes("cockroach")) updates.pestType = "cockroaches";
                      else if (input.includes("wasp") || input.includes("bee")) updates.pestType = "wasps-bees";
                      else if (input.includes("bedbug") || input.includes("bed bug")) updates.pestType = "bedbugs";
                      else if (input.includes("termite")) updates.pestType = "termites";
                      
                      if (input.includes("warehouse") || input.includes("industrial")) updates.propertyType = "warehouse";
                      else if (input.includes("commercial") || input.includes("office")) updates.propertyType = "commercial";
                      else if (input.includes("apartment")) updates.propertyType = "apartment";
                      else if (input.includes("house") || input.includes("home")) updates.propertyType = "house";
                      
                      if (input.includes("severe") || input.includes("bad") || input.includes("everywhere")) updates.infestationLevel = "severe";
                      else if (input.includes("moderate") || input.includes("some")) updates.infestationLevel = "moderate";
                      else updates.infestationLevel = "light";
                      
                      setFormData(prev => ({ ...prev, ...updates }));
                    }}
                    disabled={!formData.naturalLanguageInput?.trim()}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Parse & Fill Form
                  </Button>
                </div>

                {/* Pest Type */}
                <div>
                  <Label className="text-white mb-3 block font-medium">Pest Type *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "cockroaches", label: "Cockroaches", icon: "🪳", price: "€75" },
                      { value: "ants", label: "Ants", icon: "🐜", price: "€50" },
                      { value: "wasps-bees", label: "Wasps/Bees", icon: "🐝", price: "€100" },
                      { value: "bedbugs", label: "Bedbugs", icon: "🐛", price: "€250", popular: true },
                      { value: "rodents", label: "Rodents (Mice/Rats)", icon: "🐭", price: "€150", popular: true },
                      { value: "termites", label: "Termites", icon: "🪲", price: "€300" },
                      { value: "general-prevention", label: "General Prevention", icon: "🛡️", price: "€60" }
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.pestType === option.value
                            ? "border-green-500 bg-green-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, pestType: option.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3"><EditableText value={option.icon} onSave={() => {}} /></span>
                            <span className="font-medium"><EditableText value={option.label} onSave={() => {}} /></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-medium"><EditableText value={option.price} onSave={() => {}} /></span>
                            {option.popular && (
                              <Badge variant="secondary" className="bg-neon-500/20 text-neon-400">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infestation Level */}
                <div>
                  <Label className="text-white mb-2 block">Infestation Level *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "light", label: "Light", description: "Few sightings", surcharge: "Base" },
                      { key: "moderate", label: "Moderate", description: "Regular sightings", surcharge: "+€75" },
                      { key: "severe", label: "Severe", description: "Heavy infestation", surcharge: "+€150" }
                    ].map((option) => (
                      <div
                        key={option.key}
                        className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                          formData.infestationLevel === option.key
                            ? "border-green-500 bg-green-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, infestationLevel: option.key }))}
                      >
                        <div className="font-medium"><EditableText value={option.label} onSave={() => {}} /></div>
                        <div className="text-sm text-gray-400 mt-1"><EditableText value={option.description} onSave={() => {}} /></div>
                        <div className="text-sm text-green-400 font-medium mt-1"><EditableText value={option.surcharge} onSave={() => {}} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <Label className="text-white mb-2 block">Property Type *</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger className="bg-midnight-700 border-midnight-600">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment (Base)</SelectItem>
                      <SelectItem value="house">Detached House (+20%)</SelectItem>
                      <SelectItem value="commercial">Commercial Unit (+50%)</SelectItem>
                      <SelectItem value="warehouse">Warehouse/Industrial (+100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Type */}
                <div>
                  <Label className="text-white mb-2 block">Service Type *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: "one-time", label: "One-Time Treatment", description: "Single visit treatment", discount: "Standard Rate" },
                      { key: "monthly", label: "Monthly Maintenance", description: "Regular monthly service", discount: "20% Off" },
                      { key: "quarterly", label: "Quarterly Prevention", description: "Seasonal treatments", discount: "10% Off" }
                    ].map((option) => (
                      <div
                        key={option.key}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.serviceType === option.key
                            ? "border-green-500 bg-green-500/10"
                            : "border-midnight-600 hover:border-midnight-500"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, serviceType: option.key }))}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium"><EditableText value={option.label} onSave={() => {}} /></div>
                            <div className="text-sm text-gray-400 mt-1"><EditableText value={option.description} onSave={() => {}} /></div>
                          </div>
                          <div className="text-sm text-green-400 font-medium"><EditableText value={option.discount} onSave={() => {}} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <Label className="text-white mb-3 block">Add-on Services</Label>
                  <div className="space-y-3">
                    {[
                      { id: "eco-friendly", label: "Eco-Friendly Chemicals", price: 40, icon: "🌱" },
                      { id: "same-day", label: "Same-Day Service", price: 80, icon: "⚡" },
                      { id: "follow-up", label: "Follow-Up Visit", price: 50, icon: "📅" },
                      { id: "pet-safe", label: "Pet-Safe Treatment", price: 40, icon: "🐕" }
                    ].map((addOn) => (
                      <div key={addOn.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={addOn.id}
                          checked={formData.addOns?.includes(addOn.id) || false}
                          onCheckedChange={(checked) => {
                            const currentAddOns = formData.addOns || [];
                            if (checked) {
                              setFormData(prev => ({ ...prev, addOns: [...currentAddOns, addOn.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, addOns: currentAddOns.filter(id => id !== addOn.id) }));
                            }
                          }}
                        />
                        <label htmlFor={addOn.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="mr-2"><EditableText value={addOn.icon} onSave={() => {}} /></span>
                              <span><EditableText value={addOn.label} onSave={() => {}} /></span>
                            </div>
                            <span className="text-green-400 font-medium">+€{addOn.price} onSave={() => {}} /></span>
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
                    placeholder="Enter promo code (e.g., PEST20)"
                    value={formData.promoCode || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="bg-midnight-700 border-midnight-600"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    Try: LAUNCH10, NEWCLIENT, or PEST20
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={calculateQuote}
              className={`w-full mt-6 text-white ${
                calculator.slug === "boudoir-photography" 
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-serif" 
                  : "bg-neon-500 hover:bg-neon-600"
              }`}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {calculator.slug === "boudoir-photography" ? "Calculate Your Boudoir Experience" : "Calculate Quote"}
            </Button>
          </Card>

          {/* Quote Results */}
          <Card className="bg-midnight-800 border-midnight-700 p-6">
            <h2 className={`text-xl font-bold mb-6 ${
              calculator.slug === "boudoir-photography" ? "font-serif text-rose-300" : ""
            }`}>
              {calculator.slug === "boudoir-photography" ? "Your Boudoir Experience" : "Your Quote"}
            </h2>
            
            {quote ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`text-center p-6 rounded-lg border ${
                  calculator.slug === "boudoir-photography" 
                    ? "bg-gradient-to-br from-rose-500/20 to-pink-600/20 border-rose-500/30" 
                    : "bg-gradient-to-br from-neon-500/20 to-neon-600/20 border-neon-500/30"
                }`}>
                  <div className="text-sm text-gray-300 mb-2">
                    {calculator.slug === "boudoir-photography" ? "Investment Total" : "Estimated Total"}
                  </div>
                  <div className={`text-4xl font-bold ${
                    calculator.slug === "boudoir-photography" 
                      ? "text-rose-400 font-serif" 
                      : "text-neon-400"
                  }`}>
                    €{quote.adjustedPrice.toLocaleString()}
                  </div>
                  {calculator.slug === "boudoir-photography" && (
                    <div className="text-xs text-rose-300 mt-2 font-serif italic">
                      This price is locked for 48 hours
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-200">Quote Breakdown:</h3>
                  {quote.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300"><EditableText value={item} onSave={() => {}} /></span>
                    </div>
                  ))}
                </div>

                {!showLeadForm ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleGetQuote}
                      className={`w-full text-white ${
                        calculator.slug === "boudoir-photography" 
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-serif" 
                          : "bg-neon-500 hover:bg-neon-600"
                      }`}
                    >
                      {calculator.slug === "boudoir-photography" ? "Save My Quote & Contact Details" : "Get Detailed Quote"}
                    </Button>
                    {calculator.slug === "boudoir-photography" && (
                      <Button 
                        variant="outline"
                        className="w-full border-rose-500 text-rose-400 hover:bg-rose-500/10 font-serif"
                        onClick={() => {
                          // This would integrate with booking system in production
                          window.open("mailto:studio@example.com?subject=Boudoir Session Booking&body=I'm interested in booking a boudoir session. My quote is €" + quote.adjustedPrice, "_blank");
                        }}
                      >
                        💌 Book My Session Now
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-200">Get Your Detailed Quote:</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Your Name"
                        value={leadData.name}
                        onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={leadData.email}
                        onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone Number (optional)"
                        value={leadData.phone}
                        onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                        className="bg-midnight-700 border-midnight-600"
                      />
                    </div>
                    <Button 
                      onClick={handleLeadSubmit}
                      disabled={!leadData.name || !leadData.email || leadMutation.isPending}
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                    >
                      {leadMutation.isPending ? "Sending..." : "Send Detailed Quote"}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Fill out the form to see your personalized quote</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}