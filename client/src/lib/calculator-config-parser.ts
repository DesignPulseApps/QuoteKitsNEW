// Calculator Configuration Parser
// Extracts actual configuration from calculator files to generate customization options

export interface CalculatorField {
  id: string;
  type: 'select' | 'multi-select' | 'input' | 'range' | 'toggle';
  label: string;
  description?: string;
  options?: Array<{
    value: string;
    label: string;
    price?: number;
    percentage?: number;
    multiplier?: number;
    description?: string;
  }>;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface CalculatorConfig {
  id: string;
  name: string;
  fields: CalculatorField[];
  steps: Array<{
    id: string;
    title: string;
    fields: string[];
  }>;
  pricing: {
    baseRates?: Record<string, number>;
    multipliers?: Record<string, number>;
    addOns?: Record<string, { cost?: number; percentage?: number }>;
  };
}

// Translation Services Calculator Configuration
export const translationServicesConfig: CalculatorConfig = {
  id: 'translation-services',
  name: 'Translation Services',
  fields: [
    {
      id: 'serviceType',
      type: 'select',
      label: 'Service Type',
      description: 'Select the type of translation service you need',
      options: [
        { value: 'translation', label: 'Translation', description: 'Professional document translation', price: 0.12 },
        { value: 'proofreading', label: 'Proofreading', description: 'Review and correct existing translations', price: 0.06 },
        { value: 'transcription', label: 'Transcription', description: 'Audio/video to text conversion', price: 0.08 },
        { value: 'subtitling', label: 'Subtitling', description: 'Video subtitle creation', price: 0.15 },
        { value: 'certified', label: 'Certified Translation', description: 'Official certified document translation', price: 0.18 }
      ],
      validation: { required: true }
    },
    {
      id: 'sourceLanguage',
      type: 'select',
      label: 'Source Language',
      description: 'Language of the original document',
      options: [
        { value: 'en', label: 'English 🇺🇸' },
        { value: 'de', label: 'German 🇩🇪' },
        { value: 'es', label: 'Spanish 🇪🇸' },
        { value: 'fr', label: 'French 🇫🇷' },
        { value: 'it', label: 'Italian 🇮🇹' },
        { value: 'pt', label: 'Portuguese 🇵🇹' },
        { value: 'nl', label: 'Dutch 🇳🇱' },
        { value: 'ru', label: 'Russian 🇷🇺' },
        { value: 'zh', label: 'Chinese 🇨🇳' },
        { value: 'ja', label: 'Japanese 🇯🇵' },
        { value: 'ar', label: 'Arabic 🇸🇦' }
      ],
      validation: { required: true }
    },
    {
      id: 'targetLanguage',
      type: 'select',
      label: 'Target Language',
      description: 'Language to translate to',
      options: [
        { value: 'en', label: 'English 🇺🇸' },
        { value: 'de', label: 'German 🇩🇪' },
        { value: 'es', label: 'Spanish 🇪🇸' },
        { value: 'fr', label: 'French 🇫🇷' },
        { value: 'it', label: 'Italian 🇮🇹' },
        { value: 'pt', label: 'Portuguese 🇵🇹' },
        { value: 'nl', label: 'Dutch 🇳🇱' },
        { value: 'ru', label: 'Russian 🇷🇺' },
        { value: 'zh', label: 'Chinese 🇨🇳' },
        { value: 'ja', label: 'Japanese 🇯🇵' },
        { value: 'ar', label: 'Arabic 🇸🇦' }
      ],
      validation: { required: true }
    },
    {
      id: 'documentType',
      type: 'select',
      label: 'Document Type',
      description: 'Different types require specialized expertise',
      options: [
        { value: 'legal', label: 'Legal', multiplier: 1.3 },
        { value: 'marketing', label: 'Marketing', multiplier: 1.1 },
        { value: 'technical', label: 'Technical', multiplier: 1.4 },
        { value: 'academic', label: 'Academic', multiplier: 1.2 },
        { value: 'personal', label: 'Personal', multiplier: 1.0 }
      ],
      validation: { required: true }
    },
    {
      id: 'wordCount',
      type: 'select',
      label: 'Word Count',
      description: 'Estimate your document length',
      options: [
        { value: '0-500', label: '0–500 words' },
        { value: '500-1000', label: '500–1,000 words' },
        { value: '1000-5000', label: '1,000–5,000 words' },
        { value: '5000+', label: '5,000+ words' }
      ],
      validation: { required: true }
    },
    {
      id: 'urgency',
      type: 'select',
      label: 'Delivery Time',
      description: 'Faster delivery may include rush fees',
      options: [
        { value: 'standard', label: 'Standard (3–5 days)', multiplier: 1.0 },
        { value: 'express', label: 'Express (48 hours)', multiplier: 1.25 },
        { value: 'same-day', label: 'Same Day', multiplier: 1.5 }
      ],
      validation: { required: true }
    },
    {
      id: 'addOns',
      type: 'multi-select',
      label: 'Additional Services',
      description: 'Enhance your translation with optional add-ons',
      options: [
        { value: 'certified-stamp', label: 'Certified Stamp', description: 'Official certification seal', price: 20 },
        { value: 'formatting', label: 'Formatting / Layout', description: 'Maintain original document formatting', percentage: 10 },
        { value: 'extra-proofreading', label: 'Extra Proofreading', description: 'Additional quality review', price: 0.04 }
      ]
    },
    {
      id: 'promoCode',
      type: 'input',
      label: 'Promo Code',
      description: 'Enter promo code for discounts'
    }
  ],
  steps: [
    { id: 'service', title: 'Service Type', fields: ['serviceType'] },
    { id: 'languages', title: 'Languages', fields: ['sourceLanguage', 'targetLanguage'] },
    { id: 'document', title: 'Document Type', fields: ['documentType'] },
    { id: 'wordcount', title: 'Word Count', fields: ['wordCount'] },
    { id: 'urgency', title: 'Delivery Time', fields: ['urgency'] },
    { id: 'addons', title: 'Additional Services', fields: ['addOns', 'promoCode'] }
  ],
  pricing: {
    baseRates: {
      'translation': 0.12,
      'proofreading': 0.06,
      'transcription': 0.08,
      'subtitling': 0.15,
      'certified': 0.18
    },
    multipliers: {
      'legal': 1.3,
      'marketing': 1.1,
      'technical': 1.4,
      'academic': 1.2,
      'personal': 1.0,
      'standard': 1.0,
      'express': 1.25,
      'same-day': 1.5
    },
    addOns: {
      'certified-stamp': { cost: 20 },
      'formatting': { percentage: 10 },
      'extra-proofreading': { cost: 0.04 }
    }
  }
};

// Plastic Surgery Calculator Configuration
export const plasticSurgeryConfig: CalculatorConfig = {
  id: 'plastic-surgery',
  name: 'Plastic Surgery',
  fields: [
    {
      id: 'procedure',
      type: 'select',
      label: 'Procedure Type',
      description: 'Select the surgical procedure you are interested in',
      options: [
        { value: 'rhinoplasty', label: 'Rhinoplasty (Nose Job)', price: 4500 },
        { value: 'breast-augmentation', label: 'Breast Augmentation', price: 5800 },
        { value: 'liposuction', label: 'Liposuction', price: 3000 },
        { value: 'facelift', label: 'Facelift', price: 7500 },
        { value: 'tummy-tuck', label: 'Tummy Tuck (Abdominoplasty)', price: 6200 },
        { value: 'eyelid-surgery', label: 'Eyelid Surgery (Blepharoplasty)', price: 3800 }
      ],
      validation: { required: true }
    },
    {
      id: 'anesthesiaType',
      type: 'select',
      label: 'Anesthesia Type',
      description: 'Select the type of anesthesia required',
      options: [
        { value: 'local', label: 'Local Anesthesia', price: 250 },
        { value: 'general', label: 'General Anesthesia', price: 600 }
      ],
      validation: { required: true }
    },
    {
      id: 'additionalTreatments',
      type: 'multi-select',
      label: 'Additional Treatments',
      description: 'Optional add-on treatments and services',
      options: [
        { value: 'fat-transfer', label: 'Fat Transfer Enhancement', price: 1200 },
        { value: 'injectables', label: 'Injectables (Botox/Fillers)', price: 300 },
        { value: 'aftercare-package', label: 'Post-Op Aftercare Package', price: 450 },
        { value: 'compression-garments', label: 'Compression Garments', price: 180 }
      ]
    },
    {
      id: 'hospitalStay',
      type: 'select',
      label: 'Hospital Stay',
      description: 'Duration of required hospital stay',
      options: [
        { value: 'none', label: 'Outpatient (No Stay)', price: 0 },
        { value: '1-night', label: '1 Night Stay', price: 400 },
        { value: '2-nights', label: '2 Nights Stay', price: 800 }
      ],
      validation: { required: true }
    },
    {
      id: 'promoCode',
      type: 'input',
      label: 'Promo Code',
      description: 'Enter promotional code for discounts'
    }
  ],
  steps: [
    { id: 'procedure', title: 'Procedure Selection', fields: ['procedure'] },
    { id: 'anesthesia', title: 'Anesthesia', fields: ['anesthesiaType'] },
    { id: 'additional', title: 'Additional Treatments', fields: ['additionalTreatments'] },
    { id: 'hospital', title: 'Hospital Stay', fields: ['hospitalStay'] },
    { id: 'promo', title: 'Promo Code', fields: ['promoCode'] }
  ],
  pricing: {
    baseRates: {
      'rhinoplasty': 4500,
      'breast-augmentation': 5800,
      'liposuction': 3000,
      'facelift': 7500,
      'tummy-tuck': 6200,
      'eyelid-surgery': 3800
    },
    addOns: {
      'local': { cost: 250 },
      'general': { cost: 600 },
      'fat-transfer': { cost: 1200 },
      'injectables': { cost: 300 },
      'aftercare-package': { cost: 450 },
      'compression-garments': { cost: 180 },
      'none': { cost: 0 },
      '1-night': { cost: 400 },
      '2-nights': { cost: 800 }
    }
  }
};

// Plumbing Calculator Configuration
export const plumbingConfig: CalculatorConfig = {
  id: 'plumbing',
  name: 'Plumbing Services',
  fields: [
    {
      id: 'serviceType',
      type: 'select',
      label: 'Service Type',
      description: 'Select the type of plumbing service needed',
      options: [
        { value: 'emergency-repair', label: 'Emergency Repair', price: 150, multiplier: 1.5 },
        { value: 'leak-repair', label: 'Leak Repair', price: 120 },
        { value: 'drain-cleaning', label: 'Drain Cleaning', price: 100 },
        { value: 'installation', label: 'New Installation', price: 200 },
        { value: 'maintenance', label: 'Routine Maintenance', price: 80 }
      ],
      validation: { required: true }
    },
    {
      id: 'complexity',
      type: 'select',
      label: 'Job Complexity',
      description: 'How complex is the plumbing work?',
      options: [
        { value: 'simple', label: 'Simple Fix', multiplier: 1.0 },
        { value: 'moderate', label: 'Moderate Complexity', multiplier: 1.3 },
        { value: 'complex', label: 'Complex Installation', multiplier: 1.6 }
      ],
      validation: { required: true }
    },
    {
      id: 'urgency',
      type: 'select',
      label: 'Urgency Level',
      description: 'When do you need this completed?',
      options: [
        { value: 'standard', label: 'Standard (3-5 days)', multiplier: 1.0 },
        { value: 'priority', label: 'Priority (24-48 hours)', multiplier: 1.25 },
        { value: 'emergency', label: 'Emergency (Same day)', multiplier: 1.5 }
      ],
      validation: { required: true }
    },
    {
      id: 'additionalServices',
      type: 'multi-select',
      label: 'Additional Services',
      description: 'Optional additional services',
      options: [
        { value: 'inspection', label: 'Full System Inspection', price: 75 },
        { value: 'warranty', label: 'Extended Warranty', percentage: 15 },
        { value: 'cleanup', label: 'Post-Work Cleanup', price: 50 }
      ]
    }
  ],
  steps: [
    { id: 'service', title: 'Service Type', fields: ['serviceType'] },
    { id: 'complexity', title: 'Complexity', fields: ['complexity'] },
    { id: 'timing', title: 'Urgency', fields: ['urgency'] },
    { id: 'extras', title: 'Additional Services', fields: ['additionalServices'] }
  ],
  pricing: {
    baseRates: {
      'emergency-repair': 150,
      'leak-repair': 120,
      'drain-cleaning': 100,
      'installation': 200,
      'maintenance': 80
    },
    multipliers: {
      'simple': 1.0,
      'moderate': 1.3,
      'complex': 1.6,
      'standard': 1.0,
      'priority': 1.25,
      'emergency': 1.5
    },
    addOns: {
      'inspection': { cost: 75 },
      'warranty': { percentage: 15 },
      'cleanup': { cost: 50 }
    }
  }
};

// Calculator configurations registry
export const calculatorConfigs: Record<string, CalculatorConfig> = {
  'translation-services': translationServicesConfig,
  'plastic-surgery': plasticSurgeryConfig,
  'plumbing': plumbingConfig,
  // Add more calculator configs here as needed
};

// Function to get calculator configuration by slug
export function getCalculatorConfig(slug: string): CalculatorConfig | null {
  // Remove common suffixes and variations
  const baseSlug = slug
    .replace(/-calculator$/, '')
    .replace(/-services$/, '-services')
    .replace(/^(.+)-temp_\d+-\d+$/, '$1');
    
  return calculatorConfigs[baseSlug] || null;
}

// Function to generate customization fields from calculator config
export function generateCustomizationFields(config: CalculatorConfig) {
  // Get all service-related fields for customization
  const serviceFields = config.fields.filter(field => 
    field.type === 'select' && (
      field.id === 'serviceType' || 
      field.options?.some(opt => opt.price || opt.multiplier)
    )
  );

  // Get additional fields with options for customization
  const customizableFields = config.fields.filter(field => 
    field.type === 'select' || field.type === 'multi-select'
  );



  return {
    services: serviceFields.length > 0 ? serviceFields : customizableFields.slice(0, 3), // Fallback to first 3 select fields
    pricing: {
      baseRates: config.pricing.baseRates || {},
      multipliers: config.pricing.multipliers || {},
      addOns: config.pricing.addOns || {}
    },
    fields: config.fields,
    steps: config.steps
  };
}