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
  Users, 
  Sparkles, 
  CheckCircle, 
  Download,
  Mail,
  Phone,
  User,
  Star,
  TrendingUp
} from "lucide-react";

interface InfluencerFormData {
  platform: string;
  deliverables: string;
  usageRights: string;
  exclusivity: string;
  addOns: string[];
  giftedProduct: string;
  promoCode: string;
  naturalLanguageInput: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    brandName: string;
  };
}

interface PricingBreakdown {
  basePrice: number;
  deliverablesAdd: number;
  usageAdd: number;
  exclusivityAdd: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: string[];
}

interface LifestyleInfluencerCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function LifestyleInfluencerCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: LifestyleInfluencerCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isQuoteLocked, setIsQuoteLocked] = useState(false);
  const [formData, setFormData] = useState<InfluencerFormData>({
    platform: "",
    deliverables: "",
    usageRights: "",
    exclusivity: "",
    addOns: [],
    giftedProduct: "",
    promoCode: "",
    naturalLanguageInput: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
      brandName: "",
    },
  });

  const platforms = [
    { id: "instagram", label: "Instagram", icon: "📸", popular: true },
    { id: "tiktok", label: "TikTok", icon: "🎵", popular: true },
    { id: "youtube", label: "YouTube", icon: "📹" },
    { id: "blog", label: "Blog / Website", icon: "✍️" },
    { id: "pinterest", label: "Pinterest", icon: "📌" },
  ];

  const deliverableOptions = [
    { id: "1-post", label: "1 Post", price: 0, icon: "📱" },
    { id: "post-stories", label: "1 Post + 3 Stories", price: 150, icon: "📖", popular: true },
    { id: "reel", label: "1 Reel / TikTok", price: 100, icon: "🎬", popular: true },
    { id: "full-campaign", label: "Full Campaign (multi-platform)", price: 400, icon: "🚀" },
    { id: "unboxing", label: "Product Unboxing / Review", price: 200, icon: "📦" },
  ];

  const usageRightsOptions = [
    { id: "organic", label: "Organic Only", price: 0, icon: "🌱" },
    { id: "paid-3m", label: "Paid Ads (3 months)", price: 150, icon: "📊" },
    { id: "paid-6m", label: "Paid Ads (6 months)", price: 250, icon: "📈", popular: true },
    { id: "paid-12m", label: "Paid Ads (12 months)", price: 300, icon: "💎" },
    { id: "whitelisting", label: "Whitelisting", price: 200, icon: "⚡" },
  ];

  const exclusivityOptions = [
    { id: "none", label: "None", price: 0, icon: "🔓" },
    { id: "30-days", label: "30 days", price: 100, icon: "📅" },
    { id: "3-months", label: "3 months", price: 200, icon: "🗓️", popular: true },
    { id: "6-months", label: "6 months", price: 400, icon: "📆" },
  ];

  const addOnOptions = [
    { id: "photography", label: "Photography + Video Production", price: 150, popular: true },
    { id: "blog-writeup", label: "Blog Write-up", price: 150 },
    { id: "link-in-bio", label: "Link in Bio", price: 75 },
    { id: "giveaway", label: "Dedicated Giveaway", price: 75, popular: true },
    { id: "bts-content", label: "Behind-the-Scenes Content", price: 100 },
  ];

  const giftedOptions = [
    { id: "no", label: "No Gifted Product", price: 0, icon: "💰" },
    { id: "yes", label: "Gifted Product (10% discount)", price: 0, icon: "🎁" },
  ];

  const calculatePricing = (): PricingBreakdown => {
    const basePost = customConfig?.basePrice || 250; // Base: 1 Post, 10K-50K followers
    let deliverablesAdd = 0;
    let usageAdd = 0;
    let exclusivityAdd = 0;
    let addOnsTotal = 0;
    const breakdown: string[] = [`Base rate (1 Post, 10K-50K followers): €${basePost}`];

    // Deliverables pricing
    const deliverable = deliverableOptions.find(d => d.id === formData.deliverables);
    if (deliverable && deliverable.price > 0) {
      deliverablesAdd = deliverable.price;
      breakdown.push(`${deliverable.label}: €${deliverablesAdd}`);
    }

    // Usage rights pricing
    const usage = usageRightsOptions.find(u => u.id === formData.usageRights);
    if (usage && usage.price > 0) {
      usageAdd = usage.price;
      breakdown.push(`${usage.label}: €${usageAdd}`);
    }

    // Exclusivity pricing
    const exclusivity = exclusivityOptions.find(e => e.id === formData.exclusivity);
    if (exclusivity && exclusivity.price > 0) {
      exclusivityAdd = exclusivity.price;
      breakdown.push(`${exclusivity.label}: €${exclusivityAdd}`);
    }

    // Add-ons pricing
    formData.addOns.forEach(addOnId => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push(`${addOn.label}: €${addOn.price}`);
      }
    });

    const subtotal = basePost + deliverablesAdd + usageAdd + exclusivityAdd + addOnsTotal;
    
    // Gifted product discount
    let discount = 0;
    if (formData.giftedProduct === "yes") {
      discount = subtotal * 0.1;
      breakdown.push(`Gifted product discount (10%): -€${discount.toFixed(2)}`);
    }

    // Promo code discount
    if (formData.promoCode.toLowerCase() === "influencer10") {
      const promoDiscount = subtotal * 0.1;
      discount += promoDiscount;
      breakdown.push(`Promo code discount (10%): -€${promoDiscount.toFixed(2)}`);
    }

    const total = subtotal - discount;

    return {
      basePrice: basePost,
      deliverablesAdd,
      usageAdd,
      exclusivityAdd,
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

    // Parse platform
    if (input.includes("tiktok") || input.includes("tik tok")) newFormData.platform = "tiktok";
    else if (input.includes("youtube") || input.includes("video")) newFormData.platform = "youtube";
    else if (input.includes("blog") || input.includes("website")) newFormData.platform = "blog";
    else if (input.includes("pinterest")) newFormData.platform = "pinterest";
    else newFormData.platform = "instagram";

    // Parse deliverables
    if (input.includes("full campaign") || input.includes("multi-platform")) {
      newFormData.deliverables = "full-campaign";
    } else if (input.includes("unboxing") || input.includes("review")) {
      newFormData.deliverables = "unboxing";
    } else if (input.includes("reel") || input.includes("tiktok")) {
      newFormData.deliverables = "reel";
    } else if (input.includes("stories") || input.includes("story")) {
      newFormData.deliverables = "post-stories";
    } else {
      newFormData.deliverables = "1-post";
    }

    // Parse usage rights
    if (input.includes("12 month") || input.includes("year")) {
      newFormData.usageRights = "paid-12m";
    } else if (input.includes("6 month")) {
      newFormData.usageRights = "paid-6m";
    } else if (input.includes("3 month") || input.includes("paid")) {
      newFormData.usageRights = "paid-3m";
    } else if (input.includes("whitelisting") || input.includes("whitelist")) {
      newFormData.usageRights = "whitelisting";
    } else {
      newFormData.usageRights = "organic";
    }

    // Parse exclusivity
    if (input.includes("6 month") && input.includes("exclusiv")) {
      newFormData.exclusivity = "6-months";
    } else if (input.includes("3 month") && input.includes("exclusiv")) {
      newFormData.exclusivity = "3-months";
    } else if (input.includes("30 day") && input.includes("exclusiv")) {
      newFormData.exclusivity = "30-days";
    } else {
      newFormData.exclusivity = "none";
    }

    // Parse add-ons
    const newAddOns: string[] = [];
    if (input.includes("photo") || input.includes("video production")) newAddOns.push("photography");
    if (input.includes("blog") || input.includes("write")) newAddOns.push("blog-writeup");
    if (input.includes("link in bio") || input.includes("bio link")) newAddOns.push("link-in-bio");
    if (input.includes("giveaway") || input.includes("contest")) newAddOns.push("giveaway");
    if (input.includes("behind") || input.includes("bts")) newAddOns.push("bts-content");
    newFormData.addOns = newAddOns;

    // Parse gifted product
    if (input.includes("gift") || input.includes("free product")) {
      newFormData.giftedProduct = "yes";
    } else {
      newFormData.giftedProduct = "no";
    }

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
          ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg" 
          : "border-purple-200 hover:border-purple-300 bg-white"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-semibold">
          Popular
        </Badge>
      )}
      <div className="text-center">
        {icon && <div className="text-2xl mb-2"><EditableText value={icon} onSave={() => {}} /></div>}
        <div className="font-semibold text-gray-800"><EditableText value={option.label} onSave={() => {}} /></div>
        {option.price !== undefined && option.price > 0 && (
          <div className="text-sm text-purple-600 mt-1">+€{option.price} onSave={() => {}} /></div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Platform & Content", completed: !!formData.platform && !!formData.deliverables },
    { number: 2, title: "Usage & Exclusivity", completed: !!formData.usageRights && !!formData.exclusivity },
    { number: 3, title: "Add-ons & Discount", completed: !!formData.giftedProduct },
    { number: 4, title: "Brand Details", completed: !!formData.contactInfo.email },
  ];

  return (
    <div className="min-h-screen&">
      {!hideHeader && <QuoteKitHeader />}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gray-800 mb-2">
            Lifestyle Influencer Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-body">
            Professional collaboration rates for lifestyle, beauty, fashion, and travel brands. Get your custom quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-purple-200 rounded-3xl shadow-xl">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : currentStep === step.number
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-purple-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Platform & Content */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 text-purple-500" />
                      Tell us about your collaboration
                    </h2>
                    
                    {/* Natural Language Input */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                      <label className="block text-sm font-body text-gray-700 mb-2">
                        Describe your campaign (optional)
                      </label>
                      <Textarea
                        placeholder="e.g., We want a TikTok and IG post with usage rights"
                        value={formData.naturalLanguageInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                        className="bg-white border-purple-200 mb-3 resize-none rounded-xl"
                        rows={2}
                      />
                      <Button 
                        onClick={parseNaturalLanguage}
                        size="sm" 
                        className="bg-purple-500 hover:bg-purple-600 text-white border-0 font-body font-semibold rounded-xl"
                        disabled={!formData.naturalLanguageInput.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Calculate with AI
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Platform</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {platforms.map((platform) => (
                            <OptionCard
                              key={platform.id}
                              option={platform}
                              selected={formData.platform === platform.id}
                              onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                              icon={platform.icon}
                              popular={platform.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Campaign Deliverables</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {deliverableOptions.map((deliverable) => (
                            <OptionCard
                              key={deliverable.id}
                              option={deliverable}
                              selected={formData.deliverables === deliverable.id}
                              onClick={() => setFormData(prev => ({ ...prev, deliverables: deliverable.id }))}
                              icon={deliverable.icon}
                              popular={deliverable.popular}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.platform || !formData.deliverables}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Usage & Exclusivity */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2 text-purple-500" />
                      Usage rights & exclusivity
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Usage Rights Required</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {usageRightsOptions.map((usage) => (
                            <OptionCard
                              key={usage.id}
                              option={usage}
                              selected={formData.usageRights === usage.id}
                              onClick={() => setFormData(prev => ({ ...prev, usageRights: usage.id }))}
                              icon={usage.icon}
                              popular={usage.popular}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Exclusivity Period</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {exclusivityOptions.map((exclusivity) => (
                            <OptionCard
                              key={exclusivity.id}
                              option={exclusivity}
                              selected={formData.exclusivity === exclusivity.id}
                              onClick={() => setFormData(prev => ({ ...prev, exclusivity: exclusivity.id }))}
                              icon={exclusivity.icon}
                              popular={exclusivity.popular}
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
                      className="px-8 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.usageRights || !formData.exclusivity}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Add-ons & Discount */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
                      Enhance your collaboration
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
                              className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                                formData.addOns.includes(addOn.id)
                                  ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
                                  : "border-purple-200 hover:border-purple-300 bg-white"
                              }`}
                            >
                              {addOn.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-semibold">
                                  Popular
                                </Badge>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="font-semibold text-gray-800"><EditableText value={addOn.label} onSave={() => {}} /></div>
                                <div className="text-purple-600 font-semibold">+€{addOn.price} onSave={() => {}} /></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {formData.addOns.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-2xl border border-green-200">
                            <div className="text-sm text-green-700">
                              ✨ Top booked combo: IG Reel + Stories + Usage
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Gifted Product</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {giftedOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              selected={formData.giftedProduct === option.id}
                              onClick={() => setFormData(prev => ({ ...prev, giftedProduct: option.id }))}
                              icon={option.icon}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display text-gray-700 mb-3">Promo Code (Optional)</h3>
                        <Input
                          placeholder="Enter promo code (e.g., INFLUENCER10)"
                          value={formData.promoCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                          className="max-w-xs border-purple-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="px-8 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.giftedProduct}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 font-semibold rounded-xl"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Brand Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display text-gray-800 mb-4 flex items-center">
                      <Mail className="h-6 w-6 mr-2 text-purple-500" />
                      Get your collaboration proposal
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand Name *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Your brand name"
                            value={formData.contactInfo.brandName}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, brandName: e.target.value }
                            }))}
                            className="pl-10 border-purple-300 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
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
                            className="pl-10 border-purple-300 rounded-xl"
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
                            placeholder="brand@company.com"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="pl-10 border-purple-300 rounded-xl"
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
                            className="pl-10 border-purple-300 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="px-8 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setIsQuoteLocked(true)}
                      disabled={!formData.contactInfo.email || !formData.contactInfo.brandName}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 font-semibold rounded-xl"
                    >
                      Get Proposal
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-purple-200 rounded-3xl shadow-xl sticky top-8">
              <h3 className="text-xl font-display text-gray-800 mb-4">Your Collaboration Rate</h3>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-purple-600">
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
                    <div className="border-t border-purple-200 pt-2 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>€{pricing.total.toLocaleString()} onSave={() => {}} /></span>
                    </div>
                  </div>
                )}

                {/* Ready to Collaborate Section */}
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-display text-gray-800">Ready to Collaborate?</h3>
                    <p className="text-sm text-gray-600">
                      This rate is valid for 7 days. Let's create amazing content together that drives results.
                    </p>
                    
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 font-semibold rounded-xl"
                      onClick={() => {
                        const subject = "Collaboration Proposal";
                        const body = `Hi! I'd love to collaborate with your brand. My rate for this campaign is €${pricing.total.toLocaleString()}. Let's discuss how we can create amazing content together!`;
                        const mailtoUrl = `mailto:${formData.contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoUrl, "_blank");
                      }}
                    >
                      ✨ Send Me a Proposal
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Authentic Content
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                        Proven Results
                      </div>
                    </div>
                  </div>
                </div>

                {isQuoteLocked && (
                  <div className="space-y-3 pt-4 border-t border-purple-200 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-2">Proposal Ready!</div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Valid for 7 days
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                        onClick={downloadQuotePDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Media Kit
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