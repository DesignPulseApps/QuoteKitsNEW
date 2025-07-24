import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteKitHeader } from "@/components/calculator-header";
import { EditableText } from "@/components/editable-text";
import { 
  Languages, 
  FileText, 
  Clock, 
  Zap, 
  CheckCircle,
  Calculator,
  User,
  Mail,
  Calendar,
  Download,
  Timer,
  ChevronRight,
  HelpCircle,
  Star,
  Globe,
  BookOpen,
  Shield,
  Eye,
  Layout,
  Award
} from "lucide-react";

interface TranslationQuote {
  serviceType: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  wordCount: string;
  urgency: string;
  addOns: string[];
  promoCode: string;
  clientName: string;
  clientEmail: string;
  baseRate: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    urgencyFee: number;
    addOnCosts: { name: string; amount: number }[];
    discounts: { name: string; amount: number }[];
  };
}

const serviceTypeOptions = [
  { value: "translation", label: "Translation", icon: Languages, description: "Professional document translation", baseRate: 0.12 },
  { value: "proofreading", label: "Proofreading", icon: Eye, description: "Review and correct existing translations", baseRate: 0.06 },
  { value: "transcription", label: "Transcription", icon: FileText, description: "Audio/video to text conversion", baseRate: 0.08 },
  { value: "subtitling", label: "Subtitling", icon: Layout, description: "Video subtitle creation", baseRate: 0.15 },
  { value: "certified", label: "Certified Translation", icon: Award, description: "Official certified document translation", baseRate: 0.18 }
];

const languageOptions = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "nl", label: "Dutch", flag: "🇳🇱" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" }
];

const documentTypeOptions = [
  { value: "legal", label: "Legal", icon: Shield, multiplier: 1.3 },
  { value: "marketing", label: "Marketing", icon: Star, multiplier: 1.1 },
  { value: "technical", label: "Technical", icon: BookOpen, multiplier: 1.4 },
  { value: "academic", label: "Academic", icon: BookOpen, multiplier: 1.2 },
  { value: "personal", label: "Personal", icon: User, multiplier: 1.0 }
];

const wordCountOptions = [
  { value: "0-500", label: "0–500 words", count: 250 },
  { value: "500-1000", label: "500–1,000 words", count: 750 },
  { value: "1000-5000", label: "1,000–5,000 words", count: 3000 },
  { value: "5000+", label: "5,000+ words", count: 7500 }
];

const urgencyOptions = [
  { value: "standard", label: "Standard (3–5 days)", multiplier: 1.0, icon: Clock },
  { value: "express", label: "Express (48 hours)", multiplier: 1.25, icon: Zap },
  { value: "same-day", label: "Same Day", multiplier: 1.5, icon: Zap }
];

const addOnOptions = [
  { value: "certified-stamp", label: "Certified Stamp", cost: 20, description: "Official certification seal", icon: Award },
  { value: "formatting", label: "Formatting / Layout", cost: 0, percentage: 10, description: "Maintain original document formatting", icon: Layout },
  { value: "extra-proofreading", label: "Extra Proofreading", cost: 0.04, description: "Additional quality review", icon: Eye }
];

interface TranslationServicesCalculatorProps {
  customConfig?: any;
  isPreview?: boolean;
  hideHeader?: boolean;
}

export default function TranslationServicesCalculator({ customConfig: propConfig, isPreview = false, hideHeader = false }: TranslationServicesCalculatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: "",
    sourceLanguage: "",
    targetLanguage: "",
    documentType: "",
    wordCount: "",
    urgency: "",
    addOns: [] as string[],
    promoCode: "",
    clientName: "",
    clientEmail: "",
    naturalLanguageInput: ""
  });
  const [quote, setQuote] = useState<TranslationQuote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showNLInput, setShowNLInput] = useState(false);
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(propConfig || null);

  // Listen for configuration updates from parent dashboard
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CONFIG') {
        console.log('Translation calculator received config:', event.data.config);
        applyCustomConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const applyCustomConfig = (config: any) => {
    console.log('Applying config to translation calculator:', config);
    setCustomConfig(config);
    
    // Apply primary color
    if (config.brandColors?.primary) {
      document.documentElement.style.setProperty('--primary', config.brandColors.primary);
      document.documentElement.style.setProperty('--blue-500', config.brandColors.primary);
      document.documentElement.style.setProperty('--indigo-500', config.brandColors.primary);
    }
    
    // Apply secondary color
    if (config.brandColors?.secondary) {
      document.documentElement.style.setProperty('--secondary', config.brandColors.secondary);
      document.documentElement.style.setProperty('--slate-700', config.brandColors.secondary);
    }
    
    // Apply accent color
    if (config.brandColors?.accent) {
      document.documentElement.style.setProperty('--accent', config.brandColors.accent);
      document.documentElement.style.setProperty('--amber-500', config.brandColors.accent);
    }
  };

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const calculateQuote = () => {
    const service = serviceTypeOptions.find(s => s.value === formData.serviceType);
    const docType = documentTypeOptions.find(d => d.value === formData.documentType);
    const wordCountOption = wordCountOptions.find(w => w.value === formData.wordCount);
    const urgency = urgencyOptions.find(u => u.value === formData.urgency);
    
    if (!service || !docType || !wordCountOption || !urgency) return null;

    // Calculate base cost
    const wordsCount = wordCountOption.count;
    const baseRatePerWord = (service.baseRate || customConfig?.basePrice || 0.15) * docType.multiplier;
    const baseCost = wordsCount * baseRatePerWord;
    
    // Apply urgency multiplier
    const urgencyFee = baseCost * (urgency.multiplier - 1);
    
    // Calculate add-ons - use dynamic pricing
    const addOnCosts = formData.addOns.map(addOn => {
      const option = addOnOptions.find(a => a.value === addOn);
      if (!option) return { name: "", amount: 0 };
      
      if (option.value === "formatting") {
        return { name: option.label, amount: (baseCost + urgencyFee) * (option.percentage! / 100) };
      } else if (option.value === "extra-proofreading") {
        return { name: option.label, amount: wordsCount * (option.cost || 0) };
      } else {
        return { name: option.label, amount: option.cost || 0 };
      }
    }).filter(a => a.name && a.amount > 0);

    // Apply discounts
    const discounts = [];
    
    // Promo code discount (10% off base + urgency)
    if (formData.promoCode.toLowerCase() === "translate10") {
      const promoDiscount = (baseCost + urgencyFee) * 0.1;
      discounts.push({ name: "Promo Code Discount", amount: promoDiscount });
    }

    const totalAddOnCost = addOnCosts.reduce((sum, addon) => sum + addon.amount, 0);
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalCost = baseCost + urgencyFee + totalAddOnCost - totalDiscounts;

    return {
      serviceType: formData.serviceType,
      sourceLanguage: formData.sourceLanguage,
      targetLanguage: formData.targetLanguage,
      documentType: formData.documentType,
      wordCount: formData.wordCount,
      urgency: formData.urgency,
      addOns: formData.addOns,
      promoCode: formData.promoCode,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      baseRate: service.baseRate,
      totalCost: Math.round(totalCost * 100) / 100,
      breakdown: {
        baseCost: Math.round(baseCost * 100) / 100,
        urgencyFee: Math.round(urgencyFee * 100) / 100,
        addOnCosts,
        discounts
      }
    };
  };

  const processNaturalLanguage = async () => {
    if (!formData.naturalLanguageInput.trim()) return;
    
    setIsProcessingNL(true);
    try {
      const response = await fetch('/api/ai/process-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData.naturalLanguageInput })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          serviceType: result.serviceType || prev.serviceType,
          sourceLanguage: result.sourceLanguage || prev.sourceLanguage,
          targetLanguage: result.targetLanguage || prev.targetLanguage,
          documentType: result.documentType || prev.documentType,
          wordCount: result.wordCount || prev.wordCount,
          urgency: result.urgency || prev.urgency,
          addOns: result.addOns || prev.addOns,
          naturalLanguageInput: ""
        }));
        setShowNLInput(false);
      }
    } catch (error) {
      console.error("Error processing natural language:", error);
    } finally {
      setIsProcessingNL(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateQuote();
    }
  };

  const generateQuote = async () => {
    setIsGenerating(true);
    try {
      const calculatedQuote = calculateQuote();
      if (calculatedQuote) {
        setQuote(calculatedQuote);
        setShowEmailCapture(true);
      }
    } catch (error) {
      console.error("Error generating quote:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddOnToggle = (addOn: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter(a => a !== addOn)
        : [...prev.addOns, addOn]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What service do you need?</h2>
              <p className="text-slate-600">Select the type of language service</p>
              
              <Button
                variant="outline"
                onClick={() => setShowNLInput(!showNLInput)}
                className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Try Natural Language Input
              </Button>
            </div>

            {showNLInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <Label className="text-sm font-medium text-slate-800 mb-2 block">
                  Describe your translation needs in plain English
                </Label>
                <Input
                  value={formData.naturalLanguageInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, naturalLanguageInput: e.target.value }))}
                  placeholder="e.g., Translate 2500 words from English to German, express delivery"
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={processNaturalLanguage}
                    disabled={isProcessingNL || !formData.naturalLanguageInput.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingNL ? "Processing..." : "Auto-fill Form"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNLInput(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="grid gap-4">
              {serviceTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.serviceType === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, serviceType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.serviceType === option.value ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.serviceType === option.value ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                          <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            €{option.baseRate}/word
                          </Badge>
                          {formData.serviceType === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-2 ml-auto" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Source & Target Languages</h2>
              <p className="text-slate-600">Select the languages for your translation</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-slate-800 mb-3 block">
                  From (Source Language)
                </Label>
                <Select value={formData.sourceLanguage} onValueChange={(value) => setFormData(prev => ({ ...prev, sourceLanguage: value }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg"><EditableText value={lang.flag} onSave={() => {}} /></span>
                          <span><EditableText value={lang.label} onSave={() => {}} /></span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-800 mb-3 block">
                  To (Target Language)
                </Label>
                <Select value={formData.targetLanguage} onValueChange={(value) => setFormData(prev => ({ ...prev, targetLanguage: value }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg"><EditableText value={lang.flag} onSave={() => {}} /></span>
                          <span><EditableText value={lang.label} onSave={() => {}} /></span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.sourceLanguage && formData.targetLanguage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center justify-center space-x-4 text-sm text-blue-800">
                  <span className="flex items-center">
                    <span className="text-lg mr-2">
                      {languageOptions.find(l => l.value === formData.sourceLanguage)?.flag}
                    </span>
                    {languageOptions.find(l => l.value === formData.sourceLanguage)?.label}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="flex items-center">
                    <span className="text-lg mr-2">
                      {languageOptions.find(l => l.value === formData.targetLanguage)?.flag}
                    </span>
                    {languageOptions.find(l => l.value === formData.targetLanguage)?.label}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Document type?</h2>
              <p className="text-slate-600">Different types require specialized expertise</p>
            </div>
            
            <div className="grid gap-4">
              {documentTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.documentType === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, documentType: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.documentType === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.documentType === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="mb-2">
                              {option.multiplier}x rate
                            </Badge>
                          )}
                          {formData.documentType === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How many words?</h2>
              <p className="text-slate-600">Estimate your document length</p>
            </div>
            
            <div className="grid gap-4">
              {wordCountOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.wordCount === option.value
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, wordCount: option.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          formData.wordCount === option.value ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <FileText className={`h-6 w-6 ${
                            formData.wordCount === option.value ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          ~{option.count} words
                        </Badge>
                        {formData.wordCount === option.value && (
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-2 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">When do you need it?</h2>
              <p className="text-slate-600">Faster delivery may include rush fees</p>
            </div>
            
            <div className="grid gap-4">
              {urgencyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.urgency === option.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.urgency === option.value ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.urgency === option.value ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                        </div>
                        <div className="text-right">
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="mb-2">
                              +{Math.round((option.multiplier - 1) * 100)}%
                            </Badge>
                          )}
                          {formData.urgency === option.value && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Additional services</h2>
              <p className="text-slate-600">Enhance your translation with optional add-ons</p>
            </div>
            
            <div className="grid gap-4 mb-6">
              {addOnOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.addOns.includes(option.value)
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleAddOnToggle(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.addOns.includes(option.value) ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              formData.addOns.includes(option.value) ? "text-blue-600" : "text-slate-600"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800"><EditableText value={option.label} onSave={() => {}} /></h3>
                            <p className="text-sm text-slate-600"><EditableText value={option.description} onSave={() => {}} /></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            {option.percentage ? `+${option.percentage}%` : option.cost === 0 ? `€${option.cost}/word` : `€${option.cost}`}
                          </Badge>
                          {formData.addOns.includes(option.value) && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <Label htmlFor="promoCode" className="text-sm font-medium text-slate-800">
                  Promo Code (Optional)
                </Label>
                <Input
                  id="promoCode"
                  value={formData.promoCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="Enter promo code"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Try "TRANSLATE10" for 10% off your translation
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!hideHeader && <QuoteKitHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Translation Services Pricing Calculator
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Get an instant quote for professional translation services
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-slate-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Main Calculator */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              {renderStep()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.serviceType) ||
                    (currentStep === 2 && (!formData.sourceLanguage || !formData.targetLanguage)) ||
                    (currentStep === 3 && !formData.documentType) ||
                    (currentStep === 4 && !formData.wordCount) ||
                    (currentStep === 5 && !formData.urgency) ||
                    isGenerating
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : currentStep === totalSteps ? (
                    "Get My Quote"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote Results */}
          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center">
                      <Languages className="h-5 w-5 mr-2" />
                      Your Translation Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Service Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Service Type:</span>
                            <span className="font-medium">
                              {serviceTypeOptions.find(o => o.value === quote.serviceType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Languages:</span>
                            <span className="font-medium flex items-center">
                              <span className="mr-1">
                                {languageOptions.find(l => l.value === quote.sourceLanguage)?.flag}
                              </span>
                              <ChevronRight className="h-3 w-3 mx-1" />
                              <span className="ml-1">
                                {languageOptions.find(l => l.value === quote.targetLanguage)?.flag}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Document Type:</span>
                            <span className="font-medium">
                              {documentTypeOptions.find(o => o.value === quote.documentType)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Word Count:</span>
                            <span className="font-medium">
                              {wordCountOptions.find(o => o.value === quote.wordCount)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgency:</span>
                            <span className="font-medium">
                              {urgencyOptions.find(o => o.value === quote.urgency)?.label}
                            </span>
                          </div>
                          {quote.addOns.length > 0 && (
                            <div className="flex justify-between">
                              <span>Add-ons:</span>
                              <span className="font-medium">
                                {quote.addOns.length} selected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Cost Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Translation:</span>
                            <span>€{quote.breakdown.baseCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                          
                          {quote.breakdown.urgencyFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Urgency Fee:</span>
                              <span>+€{quote.breakdown.urgencyFee.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          )}
                          
                          {quote.breakdown.addOnCosts.map((addon, index) => (
                            <div key={index} className="flex justify-between text-blue-600">
                              <span><EditableText value={addon.name}:</span>
                              <span>+€{addon.amount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          {quote.breakdown.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-green-600">
                              <span><EditableText value={discount.name}:</span>
                              <span>-€{discount.amount.toFixed(2)} onSave={() => {}} /></span>
                            </div>
                          ))}
                          
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg text-slate-800">
                            <span>Total Cost:</span>
                            <span>€{quote.totalCost.toFixed(2)} onSave={() => {}} /></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showEmailCapture && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-blue-200"
                      >
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="clientName">Your Name</Label>
                            <Input
                              id="clientName"
                              value={formData.clientName}
                              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Enter your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientEmail">Email Address</Label>
                            <Input
                              id="clientEmail"
                              type="email"
                              value={formData.clientEmail}
                              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            Get Started
                          </Button>
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <Download className="mr-2 h-4 w-4" />
                            Download Quote
                          </Button>
                          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Quote
                          </Button>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center text-blue-800">
                            <Timer className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              This quote is valid for 48 hours
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}