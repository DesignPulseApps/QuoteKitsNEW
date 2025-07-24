import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Video, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  Sparkles, 
  Download,
  Mail,
  Phone,
  User,
  Camera
} from "lucide-react";

interface VideographyFormData {
  eventType: string;
  duration: string;
  deliverables: string[];
  crewSize: string;
  addOns: string[];
  locationType: string;
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
  durationAdd: number;
  deliverablesAdd: number;
  crewAdd: number;
  addOnsCost: number;
  locationAdd: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface EventVideographyCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function EventVideographyCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: EventVideographyCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<VideographyFormData>({
    eventType: "",
    duration: "",
    deliverables: [],
    crewSize: "",
    addOns: [],
    locationType: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const eventTypes = [
    { id: "wedding", label: "Wedding", icon: "💒", popular: true },
    { id: "corporate", label: "Corporate", icon: "🏢", popular: true },
    { id: "birthday", label: "Birthday / Private Party", icon: "🎉", popular: false },
    { id: "concert", label: "Concert / Festival", icon: "🎵", popular: false },
    { id: "product-launch", label: "Product Launch", icon: "🚀", popular: true },
    { id: "sports", label: "Sports Event", icon: "⚽", popular: false },
  ];

  const durations = [
    { id: "2-hours", label: "Up to 2 hours", price: 0, icon: "⚡" },
    { id: "half-day", label: "Half-day (4 hrs)", price: 300, icon: "🌅" },
    { id: "full-day", label: "Full-day (8 hrs)", price: 600, icon: "☀️" },
    { id: "multi-day", label: "Multi-day", price: 1200, icon: "📅" },
  ];

  const deliverableOptions = [
    { id: "full-video", label: "Full Event Video", price: 0 },
    { id: "highlights", label: "Highlights Video", price: 250 },
    { id: "raw-footage", label: "Raw Footage", price: 0 },
    { id: "social-teasers", label: "Social Media Teasers", price: 120 },
    { id: "drone", label: "Drone Footage", price: 200 },
    { id: "same-day-edit", label: "Same-day Edit", price: 400 },
  ];

  const crewSizes = [
    { id: "solo", label: "Solo Operator", price: 0, icon: "👤" },
    { id: "duo", label: "2 Videographers", price: 200, icon: "👥" },
    { id: "full-team", label: "Full Team (3+)", price: 400, icon: "👥👥" },
  ];

  const locationTypes = [
    { id: "local", label: "Local (within 30km)", price: 0, icon: "🏠" },
    { id: "regional", label: "Regional (30-100km)", price: 100, icon: "🚗" },
    { id: "destination", label: "Destination (100km+)", price: 300, icon: "✈️" },
  ];

  const addOnOptions = [
    { id: "voiceover", label: "Voiceover", price: 80 },
    { id: "music", label: "Licensed Music", price: 100 },
    { id: "titles", label: "On-screen Titles", price: 60 },
    { id: "livestream", label: "Livestream Setup", price: 300 },
    { id: "express", label: "Express Delivery (48h)", price: 100 },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const baseEvent = customConfig?.basePrice || 450; // 2 hours, solo shooter
    let durationAdd = 0;
    let deliverablesAdd = 0;
    let crewAdd = 0;
    let addOnsCost = 0;
    let locationAdd = 0;
    const breakdown: string[] = [`Base event (2 hours, solo shooter): €${baseEvent}`];

    // Duration pricing
    const duration = durations.find(d => d.id === formData.duration);
    if (duration && duration.price > 0) {
      durationAdd = duration.price;
      breakdown.push(`${duration.label}: €${durationAdd}`);
    }

    // Deliverables pricing
    formData.deliverables.forEach(delivId => {
      const deliv = deliverableOptions.find(d => d.id === delivId);
      if (deliv && deliv.price > 0) {
        deliverablesAdd += deliv.price;
        breakdown.push(`${deliv.label}: €${deliv.price}`);
      }
    });

    // Crew size pricing
    const crew = crewSizes.find(c => c.id === formData.crewSize);
    if (crew && crew.price > 0) {
      crewAdd = crew.price;
      breakdown.push(`${crew.label}: €${crewAdd}`);
    }

    // Location pricing
    const location = locationTypes.find(l => l.id === formData.locationType);
    if (location && location.price > 0) {
      locationAdd = location.price;
      breakdown.push(`${location.label}: €${locationAdd}`);
    }

    // Add-ons pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsCost += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    const subtotal = baseEvent + durationAdd + deliverablesAdd + crewAdd + locationAdd + addOnsCost;
    
    // Promo code discount
    let discount = 0;
    if (formData.promoCode.toLowerCase() === "save10") {
      discount = subtotal * 0.1;
      breakdown.push(`Promo code discount (10%): -€${discount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: baseEvent,
      durationAdd,
      deliverablesAdd,
      crewAdd,
      addOnsCost,
      locationAdd,
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

    // Parse event types
    if (input.includes("wedding")) newFormData.eventType = "wedding";
    else if (input.includes("corporate") || input.includes("business")) newFormData.eventType = "corporate";
    else if (input.includes("birthday") || input.includes("party") || input.includes("private")) newFormData.eventType = "birthday";
    else if (input.includes("concert") || input.includes("festival") || input.includes("music")) newFormData.eventType = "concert";
    else if (input.includes("product") || input.includes("launch")) newFormData.eventType = "product-launch";
    else if (input.includes("sports") || input.includes("game")) newFormData.eventType = "sports";

    // Parse duration
    if (input.includes("full day") || input.includes("8 hour") || input.includes("all day")) {
      newFormData.duration = "full-day";
    } else if (input.includes("half day") || input.includes("4 hour")) {
      newFormData.duration = "half-day";
    } else if (input.includes("multi day") || input.includes("multiple days")) {
      newFormData.duration = "multi-day";
    } else {
      newFormData.duration = "2-hours";
    }

    // Parse deliverables
    const newDeliverables: string[] = [];
    if (input.includes("highlights")) newDeliverables.push("highlights");
    if (input.includes("drone")) newDeliverables.push("drone");
    if (input.includes("social") || input.includes("teaser")) newDeliverables.push("social-teasers");
    if (input.includes("raw") || input.includes("footage")) newDeliverables.push("raw-footage");
    if (input.includes("same day") || input.includes("same-day")) newDeliverables.push("same-day-edit");
    if (newDeliverables.length === 0) newDeliverables.push("full-video");
    newFormData.deliverables = newDeliverables;

    // Parse crew size
    if (input.includes("full team") || input.includes("team") || input.includes("3")) {
      newFormData.crewSize = "full-team";
    } else if (input.includes("2") || input.includes("duo") || input.includes("two")) {
      newFormData.crewSize = "duo";
    } else {
      newFormData.crewSize = "solo";
    }

    // Parse location
    if (input.includes("destination") || input.includes("travel") || input.includes("far")) {
      newFormData.locationType = "destination";
    } else if (input.includes("regional") || input.includes("nearby")) {
      newFormData.locationType = "regional";
    } else {
      newFormData.locationType = "local";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("voiceover") || input.includes("narration")) newAddOns.push("voiceover");
    if (input.includes("music") || input.includes("soundtrack")) newAddOns.push("music");
    if (input.includes("titles") || input.includes("text")) newAddOns.push("titles");
    if (input.includes("livestream") || input.includes("live")) newAddOns.push("livestream");
    if (input.includes("express") || input.includes("rush") || input.includes("48")) newAddOns.push("express");
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
          ? "border-amber-500 bg-amber-950/30 shadow-md" 
          : "border-gray-600 hover:border-amber-500/50 bg-slate-800/50"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-white"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && (
          <div className="text-sm text-amber-300 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Event Type", completed: !!formData.eventType },
    { number: 2, title: "Duration & Crew", completed: !!formData.duration && !!formData.crewSize },
    { number: 3, title: "Deliverables & Location", completed: formData.deliverables.length > 0 && !!formData.locationType },
    { number: 4, title: "Contact Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-white mb-2">
            Event Videography Quote Calculator
          </h1>
          <p className="text-amber-200 max-w-2xl mx-auto font-body">
            Get an instant quote for your event videography. Professional coverage, cinematic results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
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
                      <div className="w-8 h-px bg-gray-600 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Event Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Video className="h-6 w-6 mr-2 text-amber-400" />
                      What type of event are you filming?
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-amber-950/30 rounded-lg border border-amber-500/20">
                      <label className="block text-sm font-body text-amber-100 mb-2">
                        Describe your event in your own words (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Need full-day coverage for a wedding with drone and highlights video"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-slate-800/50 border-amber-500/30 text-white placeholder-gray-400 mb-3 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-amber-500 hover:bg-amber-600 text-black border-0 font-body font-semibold"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {eventTypes.map((event) => (
                        <OptionCard
                          key={event.id}
                          option={event}
                          selected={formData.eventType === event.id}
                          onClick={() => setFormData(prev => ({ ...prev, eventType: event.id }))}
                          icon={event.icon}
                          popular={event.popular}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.eventType}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Duration & Crew */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-amber-400" />
                      Coverage duration & crew size
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-amber-100 mb-3">Coverage Duration</h3>
                        <div className="grid grid-cols-2 gap-4">
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
                        <h3 className="text-lg font-display text-amber-100 mb-3">Crew Size</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {crewSizes.map((crew) => (
                            <OptionCard
                              key={crew.id}
                              option={crew}
                              selected={formData.crewSize === crew.id}
                              onClick={() => setFormData(prev => ({ ...prev, crewSize: crew.id }))}
                              icon={crew.icon}
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
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-800"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.duration || !formData.crewSize}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-semibold"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Deliverables & Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-4 flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-amber-400" />
                      Deliverables & location
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-amber-100 mb-3">Deliverables</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {deliverableOptions.map((deliverable) => (
                            <div
                              key={deliverable.id}
                              onClick={() => {
                                const newDeliverables = formData.deliverables.includes(deliverable.id)
                                  ? formData.deliverables.filter(id => id !== deliverable.id)
                                  : [...formData.deliverables, deliverable.id];
                                setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
                              }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                formData.deliverables.includes(deliverable.id)
                                  ? "border-amber-500 bg-amber-950/30 shadow-md"
                                  : "border-gray-600 hover:border-amber-500/50 bg-slate-800/50"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-white"><EditableText value={deliverable.label} onSave={() => {}} /></div>
                                {deliverable.price > 0 && (
                                  <div className="text-sm text-amber-300 mt-1">+€{deliverable.price} onSave={() => {}} /></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-amber-100 mb-3">Location</h3>
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
                        <h3 className="text-lg font-display text-amber-100 mb-3">Add-on Services</h3>
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
                                  ? "border-amber-500 bg-amber-950/30 shadow-md"
                                  : "border-gray-600 hover:border-amber-500/50 bg-slate-800/50"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-white"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-sm text-amber-300 mt-1">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-amber-100 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., SAVE10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs bg-slate-800/50 border-amber-500/30 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-800"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={formData.deliverables.length === 0 || !formData.locationType}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-semibold"
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
                      <Mail className="h-6 w-6 mr-2 text-amber-400" />
                      Get your detailed quote
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-100 mb-2">
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
                            className="pl-10 bg-slate-800/50 border-amber-500/30 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-amber-100 mb-2">
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
                            className="pl-10 bg-slate-800/50 border-amber-500/30 text-white placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-amber-100 mb-2">
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
                            className="pl-10 bg-slate-800/50 border-amber-500/30 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-gray-600 text-gray-300 hover:bg-slate-800"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold"
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
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-amber-500/20 sticky top-8">
              <h3 className="text-xl font-display text-white mb-4">Your Event Video Package</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-amber-400">
                  €{pricing.total.toLocaleString()}
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
                    <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-amber-100">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {formData.eventType && (
                  <div className="mt-4 p-3 bg-amber-950/30 rounded-lg border border-amber-500/20">
                    <div className="text-sm text-amber-200">
                      🎬 Most popular: 8 hrs + highlights + drone
                    </div>
                  </div>
                )}

                {/* Ready to Book Section */}
                <div className="mt-6 pt-6 border-t border-amber-500/20">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-white">Ready to Book This Package?</h3>
                    <p className="text-sm text-amber-200">
                      This quote is valid for 48 hours. Secure your event date today.
                    </p>
                    
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 font-semibold"
                      onClick={() => {
                        const subject = "Event Videography Booking";
                        const body = `I'm ready to book my event videography package! My quote is €${pricing.total.toLocaleString()}`;
                        const mailtoUrl = `mailto:info@eventvideography.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      🎬 Book This Package
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Professional Equipment
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                        Cinematic Quality
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-amber-500/20 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400 mb-2">Quote Locked!</div>
                      <div className="flex items-center justify-center text-sm text-amber-200">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 48 hours
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-amber-400 text-amber-400 hover:bg-amber-950/50"
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