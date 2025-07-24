import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalculatorPage from "@/pages/calculator";
import NichesPage from "@/pages/niches";
import BoudoirPhotographyCalculator from "@/pages/boudoir-photography-calculator";
import ElectricianCalculator from "@/pages/electrician-calculator";
import HomeRenovationCalculator from "@/pages/home-renovation-calculator-new";
import DronePhotographyCalculator from "@/pages/drone-photography-calculator";
import EventVideographyCalculator from "@/pages/event-videography-calculator";
import RealEstatePhotographyCalculator from "@/pages/real-estate-photography-calculator";
import FoodPhotographyCalculator from "@/pages/food-photography-calculator";
import CommercialPhotographyCalculator from "@/pages/commercial-photography-calculator";
import PortraitPhotographyCalculator from "@/pages/portrait-photography-calculator";
import LifestyleInfluencerCalculator from "@/pages/lifestyle-influencer-calculator";
import LandscapingCalculator from "@/pages/landscaping-calculator";
import RoofingCalculator from "@/pages/roofing-calculator";
import SolarCalculator from "@/pages/solar-calculator";
import PestControlCalculator from "@/pages/pest-control-calculator";
import WindowDoorCalculator from "@/pages/window-door-calculator";
import MakeupArtistCalculator from "@/pages/makeup-artist-calculator";
import HairStylistCalculator from "@/pages/hair-stylist-calculator";
import TattooArtistCalculator from "@/pages/tattoo-artist-calculator";
import MassageTherapyCalculator from "@/pages/massage-therapy-calculator";
import PersonalTrainingCalculator from "@/pages/personal-training-calculator";
import PlumbingCalculator from "@/pages/plumbing-calculator";
import InteriorDesignCalculator from "@/pages/interior-design-calculator";
import PaintingDecoratingCalculator from "@/pages/painting-decorating-calculator";
import WeddingPhotographyCalculator from "@/pages/wedding-photography-calculator";
import NewbornPhotographyCalculator from "@/pages/newborn-photography-calculator";
import MaternityPhotographyCalculator from "@/pages/maternity-photography-calculator";
import NutritionistCalculator from "@/pages/nutritionist-calculator";
import LifeCoachCalculator from "@/pages/life-coach-calculator";
import HypnotherapistCalculator from "@/pages/hypnotherapist-calculator";
import PrivateTutorCalculator from "@/pages/private-tutor-calculator";
import DogTrainerCalculator from "@/pages/dog-trainer-calculator";
import CarDetailingCalculator from "@/pages/car-detailing-calculator";
import AutoMechanicCalculator from "@/pages/auto-mechanic-calculator";
import MobileCarWashCalculator from "@/pages/mobile-car-wash-calculator";
import ChauffeurLimoCalculator from "@/pages/chauffeur-limo-calculator";
import AirportTransferCalculator from "@/pages/airport-transfer-calculator";
import VanRentalCalculator from "@/pages/van-rental-calculator";
import BoatCharterCalculator from "@/pages/boat-charter-calculator";
import MovingServicesCalculator from "@/pages/moving-services-calculator";
import MotorcycleRepairCalculator from "@/pages/motorcycle-repair-calculator";
import DrivingInstructorCalculator from "@/pages/driving-instructor-calculator";
import WebDesignerCalculator from "@/pages/web-designer-calculator";
import MarketingConsultantCalculator from "@/pages/marketing-consultant-calculator";
import SEOAgencyCalculator from "@/pages/seo-agency-calculator";
import VideoEditorCalculator from "@/pages/video-editor-calculator";
import CopywriterCalculator from "@/pages/copywriter-calculator";
import VirtualAssistantCalculator from "@/pages/virtual-assistant-calculator";
import BusinessCoachCalculator from "@/pages/business-coach-calculator";
import LegalAdvisorCalculator from "@/pages/legal-advisor-calculator";
import TaxPreparerCalculator from "@/pages/tax-preparer-calculator";
import TranslationServicesCalculator from "@/pages/translation-services-calculator";
import CleaningServicesCalculator from "@/pages/cleaning-services-calculator";
import PrivateSchoolCalculator from "@/pages/private-school-calculator";
import DentistCalculator from "@/pages/dentist-calculator";
import ChildcareCalculator from "@/pages/childcare-calculator";
import PlasticSurgeryCalculator from "@/pages/plastic-surgery-calculator";
import ChildcareServicesCalculator from "@/pages/childcare-services-calculator";
import PrivateMedicalCalculator from "@/pages/private-medical-calculator";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Subscribe from "@/pages/subscribe";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Upgrade from "@/pages/upgrade";
import AdminDashboard from "@/pages/admin";
import EmbedCalculator from "@/components/embed-calculator";
import Profile from "@/pages/profile";
import TwoFactorSetup from "@/pages/two-factor-setup";
import TwoFactorVerify from "@/pages/two-factor-verify";

// Check if this is an embed route at startup
function EmbedHandler() {
  const embedConfig = (window as any).__EMBED_CONFIG__;
  
  if (embedConfig) {
    return (
      <EmbedCalculator
        embedId={embedConfig.embedId}
        templateSlug={embedConfig.templateSlug}
        customConfig={embedConfig.customConfig}
      />
    );
  }
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator/boudoir-photography" component={BoudoirPhotographyCalculator} />
      <Route path="/boudoir-photography-calculator" component={BoudoirPhotographyCalculator} />
      <Route path="/calculator/electrician" component={ElectricianCalculator} />
      <Route path="/electrician-calculator" component={ElectricianCalculator} />
      <Route path="/wedding-photography-calculator" component={WeddingPhotographyCalculator} />
      <Route path="/portrait-photography-calculator" component={PortraitPhotographyCalculator} />
      <Route path="/event-videography-calculator" component={EventVideographyCalculator} />
      <Route path="/home-renovation-new-calculator" component={HomeRenovationCalculator} />
      <Route path="/calculator/home-renovation" component={HomeRenovationCalculator} />
      <Route path="/calculator/drone-photography" component={DronePhotographyCalculator} />
      <Route path="/calculator/event-videography" component={EventVideographyCalculator} />
      <Route path="/calculator/real-estate-photography" component={RealEstatePhotographyCalculator} />
      <Route path="/calculator/food-photography" component={FoodPhotographyCalculator} />
      <Route path="/calculator/commercial-photography" component={CommercialPhotographyCalculator} />
      <Route path="/calculator/portrait-photography" component={PortraitPhotographyCalculator} />
      <Route path="/calculator/lifestyle-influencer" component={LifestyleInfluencerCalculator} />
      <Route path="/calculator/landscaping" component={LandscapingCalculator} />
      <Route path="/calculator/roofing" component={RoofingCalculator} />
      <Route path="/calculator/solar" component={SolarCalculator} />
      <Route path="/calculator/pest-control" component={PestControlCalculator} />
      <Route path="/calculator/window-door" component={WindowDoorCalculator} />
      <Route path="/calculator/makeup-artist" component={MakeupArtistCalculator} />
      <Route path="/calculator/hair-stylist" component={HairStylistCalculator} />
      <Route path="/calculator/tattoo-artist" component={TattooArtistCalculator} />
      <Route path="/calculator/massage-therapy" component={MassageTherapyCalculator} />
      <Route path="/calculator/personal-training" component={PersonalTrainingCalculator} />
      <Route path="/calculator/plumbing" component={PlumbingCalculator} />
      <Route path="/calculator/interior-design" component={InteriorDesignCalculator} />
      <Route path="/calculator/painting-decorating" component={PaintingDecoratingCalculator} />
      <Route path="/calculator/wedding-photography" component={WeddingPhotographyCalculator} />
      <Route path="/calculator/newborn-photography" component={NewbornPhotographyCalculator} />
      <Route path="/calculator/maternity-photography" component={MaternityPhotographyCalculator} />
      <Route path="/calculator/nutritionist" component={NutritionistCalculator} />
      <Route path="/calculator/life-coach" component={LifeCoachCalculator} />
      <Route path="/calculator/hypnotherapist" component={HypnotherapistCalculator} />
      <Route path="/calculator/private-tutor" component={PrivateTutorCalculator} />
      <Route path="/calculator/dog-trainer" component={DogTrainerCalculator} />
      <Route path="/calculator/car-detailing" component={CarDetailingCalculator} />
      <Route path="/calculator/auto-mechanic" component={AutoMechanicCalculator} />
      <Route path="/calculator/mobile-car-wash" component={MobileCarWashCalculator} />
      <Route path="/calculator/chauffeur-limo" component={ChauffeurLimoCalculator} />
      <Route path="/calculator/airport-transfer" component={AirportTransferCalculator} />
      <Route path="/calculator/van-rental" component={VanRentalCalculator} />
      <Route path="/calculator/boat-charter" component={BoatCharterCalculator} />
      <Route path="/calculator/moving-services" component={MovingServicesCalculator} />
      <Route path="/calculator/motorcycle-repair" component={MotorcycleRepairCalculator} />
      <Route path="/calculator/driving-instructor" component={DrivingInstructorCalculator} />
      <Route path="/calculator/web-designer" component={WebDesignerCalculator} />
      <Route path="/calculator/marketing-consultant" component={MarketingConsultantCalculator} />
      <Route path="/calculator/seo-agency" component={SEOAgencyCalculator} />
      <Route path="/calculator/video-editor" component={VideoEditorCalculator} />
      <Route path="/calculator/copywriter" component={CopywriterCalculator} />
      <Route path="/calculator/virtual-assistant" component={VirtualAssistantCalculator} />
      <Route path="/calculator/business-coach" component={BusinessCoachCalculator} />
      <Route path="/calculator/legal-advisor" component={LegalAdvisorCalculator} />
      <Route path="/calculator/tax-preparer" component={TaxPreparerCalculator} />
      <Route path="/calculator/translation-services" component={TranslationServicesCalculator} />
      <Route path="/calculator/cleaning-services" component={CleaningServicesCalculator} />
      <Route path="/calculator/private-school" component={PrivateSchoolCalculator} />
      <Route path="/calculator/dentist-implant" component={DentistCalculator} />
      <Route path="/calculator/childcare-practitioner" component={ChildcareCalculator} />
      <Route path="/calculator/plastic-surgery" component={PlasticSurgeryCalculator} />
      <Route path="/plastic-surgery-calculator" component={PlasticSurgeryCalculator} />
      <Route path="/calculator/childcare-services" component={ChildcareServicesCalculator} />
      <Route path="/childcare-services-calculator" component={ChildcareServicesCalculator} />
      <Route path="/calculator/private-medical" component={PrivateMedicalCalculator} />
      <Route path="/private-medical-calculator" component={PrivateMedicalCalculator} />
      <Route path="/drone-photography-calculator" component={DronePhotographyCalculator} />
      <Route path="/food-photography-calculator" component={FoodPhotographyCalculator} />
      <Route path="/real-estate-photography-calculator" component={RealEstatePhotographyCalculator} />
      <Route path="/commercial-photography-calculator" component={CommercialPhotographyCalculator} />
      <Route path="/lifestyle-influencer-calculator" component={LifestyleInfluencerCalculator} />
      <Route path="/landscaping-calculator" component={LandscapingCalculator} />
      <Route path="/roofing-calculator" component={RoofingCalculator} />
      <Route path="/solar-calculator" component={SolarCalculator} />
      <Route path="/pest-control-calculator" component={PestControlCalculator} />
      <Route path="/window-door-calculator" component={WindowDoorCalculator} />
      <Route path="/makeup-artist-calculator" component={MakeupArtistCalculator} />
      <Route path="/hair-stylist-calculator" component={HairStylistCalculator} />
      <Route path="/tattoo-artist-calculator" component={TattooArtistCalculator} />
      <Route path="/massage-therapy-calculator" component={MassageTherapyCalculator} />
      <Route path="/personal-training-calculator" component={PersonalTrainingCalculator} />
      <Route path="/plumbing-calculator" component={PlumbingCalculator} />
      <Route path="/interior-design-calculator" component={InteriorDesignCalculator} />
      <Route path="/painting-decorating-calculator" component={PaintingDecoratingCalculator} />
      <Route path="/newborn-photography-calculator" component={NewbornPhotographyCalculator} />
      <Route path="/maternity-photography-calculator" component={MaternityPhotographyCalculator} />
      <Route path="/nutritionist-calculator" component={NutritionistCalculator} />
      <Route path="/life-coach-calculator" component={LifeCoachCalculator} />
      <Route path="/hypnotherapist-calculator" component={HypnotherapistCalculator} />
      <Route path="/private-tutor-calculator" component={PrivateTutorCalculator} />
      <Route path="/dog-trainer-calculator" component={DogTrainerCalculator} />
      <Route path="/car-detailing-calculator" component={CarDetailingCalculator} />
      <Route path="/auto-mechanic-calculator" component={AutoMechanicCalculator} />
      <Route path="/mobile-car-wash-calculator" component={MobileCarWashCalculator} />
      <Route path="/chauffeur-limo-calculator" component={ChauffeurLimoCalculator} />
      <Route path="/airport-transfer-calculator" component={AirportTransferCalculator} />
      <Route path="/van-rental-calculator" component={VanRentalCalculator} />
      <Route path="/boat-charter-calculator" component={BoatCharterCalculator} />
      <Route path="/moving-services-calculator" component={MovingServicesCalculator} />
      <Route path="/motorcycle-repair-calculator" component={MotorcycleRepairCalculator} />
      <Route path="/driving-instructor-calculator" component={DrivingInstructorCalculator} />
      <Route path="/web-designer-calculator" component={WebDesignerCalculator} />
      <Route path="/marketing-consultant-calculator" component={MarketingConsultantCalculator} />
      <Route path="/seo-agency-calculator" component={SEOAgencyCalculator} />
      <Route path="/video-editor-calculator" component={VideoEditorCalculator} />
      <Route path="/copywriter-calculator" component={CopywriterCalculator} />
      <Route path="/virtual-assistant-calculator" component={VirtualAssistantCalculator} />
      <Route path="/business-coach-calculator" component={BusinessCoachCalculator} />
      <Route path="/legal-advisor-calculator" component={LegalAdvisorCalculator} />
      <Route path="/tax-preparer-calculator" component={TaxPreparerCalculator} />
      <Route path="/translation-services-calculator" component={TranslationServicesCalculator} />
      <Route path="/cleaning-services-calculator" component={CleaningServicesCalculator} />
      <Route path="/private-school-calculator" component={PrivateSchoolCalculator} />
      <Route path="/dentist-calculator" component={DentistCalculator} />
      <Route path="/childcare-calculator" component={ChildcareCalculator} />
      <Route path="/calculator/:slug" component={CalculatorPage} />
      <Route path="/niches" component={NichesPage} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/profile" component={Profile} />
      <Route path="/two-factor-setup" component={TwoFactorSetup} />
      <Route path="/two-factor-verify" component={TwoFactorVerify} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/niches/:niche" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if this is an embed page
  const embedConfig = (window as any).__EMBED_CONFIG__;
  
  if (embedConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <EmbedHandler />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
