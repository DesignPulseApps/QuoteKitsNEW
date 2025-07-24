import React, { Suspense, lazy, useEffect } from 'react';

// Dynamic calculator component imports
const calculatorComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  'electrician': lazy(() => import('../pages/electrician-calculator')),
  'home-renovation': lazy(() => import('../pages/home-renovation-calculator')),
  'landscaping': lazy(() => import('../pages/landscaping-calculator')),
  'wedding-photography': lazy(() => import('../pages/wedding-photography-calculator')),
  'pest-control': lazy(() => import('../pages/pest-control-calculator')),
  'roofing': lazy(() => import('../pages/roofing-calculator')),
  'plumbing': lazy(() => import('../pages/plumbing-calculator')),
  'cleaning-services': lazy(() => import('../pages/cleaning-services-calculator')),
  'personal-training': lazy(() => import('../pages/personal-training-calculator')),
  'makeup-artist': lazy(() => import('../pages/makeup-artist-calculator')),
  'hair-stylist': lazy(() => import('../pages/hair-stylist-calculator')),
  'massage-therapy': lazy(() => import('../pages/massage-therapy-calculator')),
  'nutritionist': lazy(() => import('../pages/nutritionist-calculator')),
  'life-coach': lazy(() => import('../pages/life-coach-calculator')),
  'business-coach': lazy(() => import('../pages/business-coach-calculator')),
  'legal-advisor': lazy(() => import('../pages/legal-advisor-calculator')),
  'tax-preparer': lazy(() => import('../pages/tax-preparer-calculator')),
  'translation-services': lazy(() => import('../pages/translation-services-calculator')),
  'virtual-assistant': lazy(() => import('../pages/virtual-assistant-calculator')),
  'private-school': lazy(() => import('../pages/private-school-calculator')),
  'private-tutor': lazy(() => import('../pages/private-tutor-calculator')),
  'driving-instructor': lazy(() => import('../pages/driving-instructor-calculator')),
  'dentist': lazy(() => import('../pages/dentist-calculator')),
  'private-medical': lazy(() => import('../pages/private-medical-calculator')),
  'plastic-surgery': lazy(() => import('../pages/plastic-surgery-calculator')),
  'childcare': lazy(() => import('../pages/childcare-calculator')),
  'childcare-services': lazy(() => import('../pages/childcare-services-calculator')),
  'boudoir-photography': lazy(() => import('../pages/boudoir-photography-calculator')),
  'drone-photography': lazy(() => import('../pages/drone-photography-calculator')),
  'event-videography': lazy(() => import('../pages/event-videography-calculator')),
  'real-estate-photography': lazy(() => import('../pages/real-estate-photography-calculator')),
  'food-photography': lazy(() => import('../pages/food-photography-calculator')),
  'commercial-photography': lazy(() => import('../pages/commercial-photography-calculator')),
  'portrait-photography': lazy(() => import('../pages/portrait-photography-calculator')),
  'lifestyle-influencer': lazy(() => import('../pages/lifestyle-influencer-calculator')),
  'solar-panels': lazy(() => import('../pages/solar-calculator')),
  'windows-doors': lazy(() => import('../pages/window-door-calculator')),
  'painting-decorating': lazy(() => import('../pages/painting-decorating-calculator')),
  'interior-design': lazy(() => import('../pages/interior-design-calculator')),
  'auto-mechanic': lazy(() => import('../pages/auto-mechanic-calculator')),
  'motorcycle-repair': lazy(() => import('../pages/motorcycle-repair-calculator')),
  'car-detailing': lazy(() => import('../pages/car-detailing-calculator')),
  'mobile-car-wash': lazy(() => import('../pages/mobile-car-wash-calculator')),
  'moving-services': lazy(() => import('../pages/moving-services-calculator')),
  'van-rental': lazy(() => import('../pages/van-rental-calculator')),
  'boat-charter': lazy(() => import('../pages/boat-charter-calculator')),
  'chauffeur-limo': lazy(() => import('../pages/chauffeur-limo-calculator')),
  'airport-transfer': lazy(() => import('../pages/airport-transfer-calculator')),
  'tattoo-artist': lazy(() => import('../pages/tattoo-artist-calculator')),
  'hypnotherapist': lazy(() => import('../pages/hypnotherapist-calculator')),
  'web-designer': lazy(() => import('../pages/web-designer-calculator')),
  'video-editor': lazy(() => import('../pages/video-editor-calculator')),
  'seo-agency': lazy(() => import('../pages/seo-agency-calculator')),
  'marketing-consultant': lazy(() => import('../pages/marketing-consultant-calculator')),
  'copywriter': lazy(() => import('../pages/copywriter-calculator')),
  'dog-trainer': lazy(() => import('../pages/dog-trainer-calculator')),
  'maternity-photography': lazy(() => import('../pages/maternity-photography-calculator')),
  'newborn-photography': lazy(() => import('../pages/newborn-photography-calculator'))
};

interface CalculatorPreviewProps {
  slug: string;
  customConfig?: any;
  className?: string;
  onConfigChange?: (config: any) => void;
}

export default function CalculatorPreview({ slug, customConfig, className = "", onConfigChange }: CalculatorPreviewProps) {
  console.log('Applying config to', slug, 'calculator:', customConfig);
  
  const CalculatorComponent = calculatorComponents[slug];

  if (!CalculatorComponent) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-xl font-semibold mb-2">Calculator Preview</div>
          <div className="text-sm">Calculator "{slug}" not found</div>
        </div>
      </div>
    );
  }

  // Apply custom styling from config with dynamic CSS injection
  useEffect(() => {
    if (customConfig && Object.keys(customConfig).length > 0) {
      const styleId = `preview-styles-${slug}`;
      let existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = styleId;
      
      const primaryColor = customConfig.brandColors?.primary || '#06D6A0';
      const secondaryColor = customConfig.brandColors?.secondary || '#2563eb';
      const accentColor = customConfig.brandColors?.accent || '#f59e0b';
      const fontFamily = customConfig.styling?.fontFamily || 'Inter';
      const borderRadius = customConfig.styling?.borderRadius || '0.5rem';
      
      style.textContent = `
        .calculator-preview-${slug} {
          font-family: ${fontFamily} !important;
        }
        
        .calculator-preview-${slug} * {
          font-family: inherit !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-"], 
        .calculator-preview-${slug} [class*="border-rose-"], 
        .calculator-preview-${slug} [class*="text-rose-"] {
          color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-50"] {
          background-color: ${primaryColor}15 !important;
        }
        
        .calculator-preview-${slug} [class*="bg-rose-400"] {
          background-color: ${primaryColor} !important;
          color: white !important;
        }
        
        .calculator-preview-${slug} button:not([class*="outline"]) {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }
        
        .calculator-preview-${slug} [class*="rounded"] {
          border-radius: ${borderRadius} !important;
        }
      `;
      
      document.head.appendChild(style);
    }
  }, [customConfig, slug]);

  const previewStyles = {
    fontFamily: customConfig?.styling?.fontFamily || 'Inter',
    borderRadius: customConfig?.styling?.borderRadius || '0.5rem',
    '--primary-color': customConfig?.brandColors?.primary || '#06D6A0',
    '--secondary-color': customConfig?.brandColors?.secondary || '#2563eb',
    '--accent-color': customConfig?.brandColors?.accent || '#f59e0b',
  } as React.CSSProperties;

  return (
    <div 
      className={`calculator-preview-${slug} bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
      style={previewStyles}
    >
      <Suspense fallback={
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <div className="text-sm text-gray-500">Loading calculator...</div>
        </div>
      }>
        <CalculatorComponent 
          customConfig={customConfig}
          onConfigChange={onConfigChange}
          isPreview={true}
          hideHeader={true}
          forceDetailedView={customConfig?.forceDetailedView}
          useComprehensiveCalculator={customConfig?.useComprehensiveCalculator}
          calculatorType={customConfig?.calculatorType}
        />
      </Suspense>
    </div>
  );
}