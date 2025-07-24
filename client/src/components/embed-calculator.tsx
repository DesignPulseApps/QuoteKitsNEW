import { useEffect, useState } from 'react';

// Import all calculator components
import PortraitPhotographyCalculator from '@/pages/portrait-photography-calculator';
import WeddingPhotographyCalculator from '@/pages/wedding-photography-calculator';
import BoudoirPhotographyCalculator from '@/pages/boudoir-photography-calculator';
import CommercialPhotographyCalculator from '@/pages/commercial-photography-calculator';
import RealEstatePhotographyCalculator from '@/pages/real-estate-photography-calculator';
import FoodPhotographyCalculator from '@/pages/food-photography-calculator';
import NewbornPhotographyCalculator from '@/pages/newborn-photography-calculator';
import MaternityPhotographyCalculator from '@/pages/maternity-photography-calculator';
import DronePhotographyCalculator from '@/pages/drone-photography-calculator';
import EventVideographyCalculator from '@/pages/event-videography-calculator';
import ElectricianCalculator from '@/pages/electrician-calculator';
import HomeRenovationCalculator from '@/pages/home-renovation-calculator-new';
import LandscapingCalculator from '@/pages/landscaping-calculator';
import MobileCarWashCalculator from '@/pages/mobile-car-wash-calculator';
import PestControlCalculator from '@/pages/pest-control-calculator';
import RoofingCalculator from '@/pages/roofing-calculator';
import PlumbingCalculator from '@/pages/plumbing-calculator';
import PaintingDecoratingCalculator from '@/pages/painting-decorating-calculator';
import WindowDoorCalculator from '@/pages/window-door-calculator';
import InteriorDesignCalculator from '@/pages/interior-design-calculator';
import SolarCalculator from '@/pages/solar-calculator';
import MassageTherapyCalculator from '@/pages/massage-therapy-calculator';
import MakeupArtistCalculator from '@/pages/makeup-artist-calculator';
import HairStylistCalculator from '@/pages/hair-stylist-calculator';
import PersonalTrainingCalculator from '@/pages/personal-training-calculator';
import NutritionistCalculator from '@/pages/nutritionist-calculator';
import LifeCoachCalculator from '@/pages/life-coach-calculator';
import HypnotherapistCalculator from '@/pages/hypnotherapist-calculator';
import TattooArtistCalculator from '@/pages/tattoo-artist-calculator';
import WebDesignerCalculator from '@/pages/web-designer-calculator';
import MarketingConsultantCalculator from '@/pages/marketing-consultant-calculator';
import SeoAgencyCalculator from '@/pages/seo-agency-calculator';
import VideoEditorCalculator from '@/pages/video-editor-calculator';
import CopywriterCalculator from '@/pages/copywriter-calculator';
import VirtualAssistantCalculator from '@/pages/virtual-assistant-calculator';
import BusinessCoachCalculator from '@/pages/business-coach-calculator';
import LegalAdvisorCalculator from '@/pages/legal-advisor-calculator';
import TaxPreparerCalculator from '@/pages/tax-preparer-calculator';
import TranslationServicesCalculator from '@/pages/translation-services-calculator';
import CleaningServicesCalculator from '@/pages/cleaning-services-calculator';
import VanRentalCalculator from '@/pages/van-rental-calculator';
import BoatCharterCalculator from '@/pages/boat-charter-calculator';
import ChauffeurLimoCalculator from '@/pages/chauffeur-limo-calculator';
import AirportTransferCalculator from '@/pages/airport-transfer-calculator';
import MovingServicesCalculator from '@/pages/moving-services-calculator';
import MotorcycleRepairCalculator from '@/pages/motorcycle-repair-calculator';
import DrivingInstructorCalculator from '@/pages/driving-instructor-calculator';
import DentistCalculator from '@/pages/dentist-calculator';
import ChildcareCalculator from '@/pages/childcare-calculator';
import PlasticSurgeryCalculator from '@/pages/plastic-surgery-calculator';
import PrivateMedicalCalculator from '@/pages/private-medical-calculator';
import LifestyleInfluencerCalculator from '@/pages/lifestyle-influencer-calculator';
import PrivateTutorCalculator from '@/pages/private-tutor-calculator';
import DogTrainerCalculator from '@/pages/dog-trainer-calculator';
import CarDetailingCalculator from '@/pages/car-detailing-calculator';
import AutoMechanicCalculator from '@/pages/auto-mechanic-calculator';

// Calculator component mapping
const calculatorComponents: { [key: string]: React.ComponentType<any> } = {
  'portrait-photography': PortraitPhotographyCalculator,
  'wedding-photography': WeddingPhotographyCalculator,
  'boudoir-photography': BoudoirPhotographyCalculator,
  'commercial-photography': CommercialPhotographyCalculator,
  'real-estate-photography': RealEstatePhotographyCalculator,
  'food-photography': FoodPhotographyCalculator,
  'newborn-photography': NewbornPhotographyCalculator,
  'maternity-photography': MaternityPhotographyCalculator,
  'drone-photography': DronePhotographyCalculator,
  'event-videography': EventVideographyCalculator,
  'electrician': ElectricianCalculator,
  'home-renovation': HomeRenovationCalculator,
  'landscaping': LandscapingCalculator,
  'mobile-car-wash': MobileCarWashCalculator,
  'pest-control': PestControlCalculator,
  'roofing': RoofingCalculator,
  'plumbing': PlumbingCalculator,
  'painting-decorating': PaintingDecoratingCalculator,
  'window-door': WindowDoorCalculator,
  'interior-design': InteriorDesignCalculator,
  'solar': SolarCalculator,
  'massage-therapy': MassageTherapyCalculator,
  'makeup-artist': MakeupArtistCalculator,
  'hair-stylist': HairStylistCalculator,
  'personal-training': PersonalTrainingCalculator,
  'nutritionist': NutritionistCalculator,
  'life-coach': LifeCoachCalculator,
  'hypnotherapist': HypnotherapistCalculator,
  'tattoo-artist': TattooArtistCalculator,
  'web-designer': WebDesignerCalculator,
  'marketing-consultant': MarketingConsultantCalculator,
  'seo-agency': SeoAgencyCalculator,
  'video-editor': VideoEditorCalculator,
  'copywriter': CopywriterCalculator,
  'virtual-assistant': VirtualAssistantCalculator,
  'business-coach': BusinessCoachCalculator,
  'legal-advisor': LegalAdvisorCalculator,
  'tax-preparer': TaxPreparerCalculator,
  'translation-services': TranslationServicesCalculator,
  'cleaning-services': CleaningServicesCalculator,
  'van-rental': VanRentalCalculator,
  'boat-charter': BoatCharterCalculator,
  'chauffeur-limo': ChauffeurLimoCalculator,
  'airport-transfer': AirportTransferCalculator,
  'moving-services': MovingServicesCalculator,
  'motorcycle-repair': MotorcycleRepairCalculator,
  'driving-instructor': DrivingInstructorCalculator,
  'dentist': DentistCalculator,
  'childcare': ChildcareCalculator,
  'plastic-surgery': PlasticSurgeryCalculator,
  'private-medical': PrivateMedicalCalculator,
  'lifestyle-influencer': LifestyleInfluencerCalculator,
  'private-tutor': PrivateTutorCalculator,
  'dog-trainer': DogTrainerCalculator,
  'car-detailing': CarDetailingCalculator,
  'auto-mechanic': AutoMechanicCalculator,
};

interface EmbedCalculatorProps {
  embedId: string;
  templateSlug: string;
  customConfig: any;
}

export default function EmbedCalculator({ embedId, templateSlug, customConfig }: EmbedCalculatorProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a moment for the component to initialize
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  const CalculatorComponent = calculatorComponents[templateSlug];

  if (!CalculatorComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calculator Not Found</h2>
          <p className="text-gray-600">The requested calculator template "{templateSlug}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <CalculatorComponent
      customConfig={customConfig}
      isPreview={false}
      hideHeader={true}
      embedId={embedId}
    />
  );
}