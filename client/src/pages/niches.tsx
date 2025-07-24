import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/header";
import { 
  Search, 
  Camera, 
  Dumbbell, 
  TreePine, 
  Wrench, 
  Zap, 
  Building, 
  Home, 
  Shield,
  Palette,
  Scissors,
  Stethoscope,
  GraduationCap,
  Car,
  Truck,
  Utensils,
  Coffee,
  Heart,
  Music,
  Monitor,
  Smartphone,
  Wifi,
  Server,
  Code,
  PenTool,
  Video,
  Edit,
  BarChart3,
  Users,
  Briefcase,
  Globe,
  Calculator,
  Scale,
  Clock,
  Package,
  Settings,
  Hammer,
  Paintbrush,
  Bath,
  Droplets,
  Star,
  Crown,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Users2,
  Gem,
  Sparkles,
  Flower,
  Sun,
  Baby,
  Apple
} from "lucide-react";

// Comprehensive list of all launch calculators
const allNiches = [
  // Photography & Videography (10 calculators)
  { id: 1, name: "Wedding Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "wedding-photography", description: "Wedding packages with engagement and reception coverage" },
  { id: 2, name: "Boudoir Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "boudoir-photography", description: "Intimate and artistic boudoir photography sessions" },
  { id: 3, name: "Newborn Photography", icon: Heart, category: "Photography & Videography", available: true, slug: "newborn-photography", description: "Gentle newborn and baby photography sessions" },
  { id: 4, name: "Maternity Photography", icon: Flower, category: "Photography & Videography", available: true, slug: "maternity-photography", description: "Elegant maternity sessions celebrating expecting mothers" },

  { id: 5, name: "Drone/Aerial Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "drone-photography", description: "Aerial photography and videography services" },
  { id: 6, name: "Event Videography", icon: Video, category: "Photography & Videography", available: true, slug: "event-videography", description: "Event video production and live streaming" },
  { id: 7, name: "Real Estate Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "real-estate-photography", description: "Property photos for listings and marketing" },
  { id: 8, name: "Food Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "food-photography", description: "Restaurant and culinary photography services" },
  { id: 9, name: "Commercial Photography", icon: Camera, category: "Photography & Videography", available: true, slug: "commercial-photography", description: "E-commerce and catalog product photography" },
  { id: 10, name: "Portrait Studios", icon: Camera, category: "Photography & Videography", available: true, slug: "portrait-photography", description: "Family portraits, headshots, and personal sessions" },
  { id: 11, name: "Lifestyle Influencer Videography", icon: Video, category: "Photography & Videography", available: true, slug: "lifestyle-influencer", description: "Content creation for social media influencers" },

  // Home Services (10 calculators)
  { id: 12, name: "Home Renovation", icon: Hammer, category: "Home Services", available: true, slug: "home-renovation", description: "Kitchen, bathroom, and full home renovations with AI pricing" },
  { id: 13, name: "Landscaping", icon: TreePine, category: "Home Services", available: true, slug: "landscaping", description: "Garden design, maintenance, and outdoor projects" },
  { id: 14, name: "Interior Design", icon: Palette, category: "Home Services", available: true, slug: "interior-design", description: "Room design, furniture selection, and space planning" },
  { id: 15, name: "Painting & Decorating", icon: Paintbrush, category: "Home Services", available: true, slug: "painting-decorating", description: "Interior and exterior painting and decorating services" },
  { id: 16, name: "Electrical Services", icon: Zap, category: "Home Services", available: true, slug: "electrician", description: "Wiring, lighting installation, and electrical repairs" },
  { id: 17, name: "Plumbing Services", icon: Wrench, category: "Home Services", available: true, slug: "plumbing", description: "Pipe repair, installation, and emergency plumbing services" },
  { id: 18, name: "Roofing", icon: Home, category: "Home Services", available: true, slug: "roofing", description: "Roof repair, replacement, and maintenance services" },
  { id: 19, name: "Solar Panel Installation", icon: Sun, category: "Home Services", available: true, slug: "solar", description: "Solar energy system installation and maintenance" },
  { id: 20, name: "Pest Control", icon: Shield, category: "Home Services", available: true, slug: "pest-control", description: "Residential and commercial pest management services" },
  { id: 21, name: "Window & Door Installation", icon: Home, category: "Home Services", available: true, slug: "window-door", description: "Window and door replacement and installation" },
  { id: 58, name: "Cleaning Services", icon: Sparkles, category: "Home Services", available: true, slug: "cleaning-services", description: "Professional house and commercial cleaning services" },

  // Beauty & Wellness (8 calculators)
  { id: 22, name: "Makeup Artist", icon: Palette, category: "Beauty & Wellness", available: true, slug: "makeup-artist", description: "Bridal, event, and special occasion makeup" },
  { id: 23, name: "Hair Stylist", icon: Scissors, category: "Beauty & Wellness", available: true, slug: "hair-stylist", description: "Cuts, coloring, and styling services" },
  { id: 24, name: "Tattoo Artist", icon: Sparkles, category: "Beauty & Wellness", available: true, slug: "tattoo-artist", description: "Custom tattoo design and tattooing services" },
  { id: 25, name: "Massage Therapy", icon: Heart, category: "Beauty & Wellness", available: true, slug: "massage-therapy", description: "Therapeutic and relaxation massage services" },
  { id: 26, name: "Personal Training", icon: Dumbbell, category: "Beauty & Wellness", available: true, slug: "personal-training", description: "1-on-1 and group fitness training sessions" },
  { id: 27, name: "Nutritionist", icon: Stethoscope, category: "Beauty & Wellness", available: true, slug: "nutritionist", description: "Meal planning and dietary consultation services" },
  { id: 28, name: "Life Coach", icon: Target, category: "Beauty & Wellness", available: true, slug: "life-coach", description: "Personal development and goal achievement coaching" },
  { id: 29, name: "Hypnotherapist", icon: Heart, category: "Beauty & Wellness", available: true, slug: "hypnotherapist", description: "Hypnosis therapy and mental wellness services" },

  // Education & Training (3 calculators)
  { id: 30, name: "Private Tutor", icon: GraduationCap, category: "Education & Training", available: true, slug: "private-tutor", description: "Academic tutoring and test preparation" },
  { id: 31, name: "Private Schools", icon: GraduationCap, category: "Education & Training", available: true, slug: "private-school", description: "Private education tuition and enrollment services" },
  { id: 32, name: "Driving Instructor", icon: Car, category: "Education & Training", available: true, slug: "driving-instructor", description: "Driver education and road test preparation" },

  // Healthcare & Medical (5 calculators)
  { id: 33, name: "Dentist & Implant Clinics", icon: Stethoscope, category: "Healthcare & Medical", available: true, slug: "dentist-implant", description: "Dental care, implants, and oral surgery services" },
  { id: 34, name: "Private Medical Clinics", icon: Stethoscope, category: "Healthcare & Medical", available: true, slug: "private-medical", description: "Private healthcare consultations and treatments" },
  { id: 35, name: "Plastic Surgery", icon: Stethoscope, category: "Healthcare & Medical", available: true, slug: "plastic-surgery", description: "Cosmetic and reconstructive surgery procedures" },
  { id: 36, name: "Childcare Practitioners", icon: Heart, category: "Healthcare & Medical", available: true, slug: "childcare-practitioner", description: "Individual childcare and nanny services" },
  { id: 37, name: "Childcare Clinics", icon: Heart, category: "Healthcare & Medical", available: true, slug: "childcare-services", description: "Pediatric care and child wellness clinics" },

  // Pet Services (1 calculator)
  { id: 38, name: "Dog Trainer", icon: Heart, category: "Pet Services", available: true, slug: "dog-trainer", description: "Dog training and behavioral modification services" },

  // Automotive & Transportation (9 calculators)
  { id: 39, name: "Car Detailing", icon: Car, category: "Automotive & Transportation", available: true, slug: "car-detailing", description: "Professional car cleaning and detailing services" },
  { id: 40, name: "Auto Mechanic", icon: Wrench, category: "Automotive & Transportation", available: true, slug: "auto-mechanic", description: "Car maintenance and mechanical repair services" },
  { id: 41, name: "Mobile Car Wash", icon: Droplets, category: "Automotive & Transportation", available: true, slug: "mobile-car-wash", description: "On-site car washing and cleaning services" },
  { id: 42, name: "Moving Services", icon: Truck, category: "Automotive & Transportation", available: true, slug: "moving-services", description: "Residential and commercial moving services" },
  { id: 43, name: "Chauffeur/Limo Services", icon: Car, category: "Automotive & Transportation", available: true, slug: "chauffeur-limo", description: "Luxury transportation and chauffeur services" },
  { id: 44, name: "Airport Transfers", icon: Car, category: "Automotive & Transportation", available: true, slug: "airport-transfer", description: "Airport pickup and drop-off services" },
  { id: 45, name: "Van Rentals", icon: Truck, category: "Automotive & Transportation", available: true, slug: "van-rental", description: "Van and vehicle rental services" },
  { id: 46, name: "Boat Charters", icon: Truck, category: "Automotive & Transportation", available: true, slug: "boat-charter", description: "Boat rental and charter services" },
  { id: 47, name: "Motorcycle Repair", icon: Wrench, category: "Automotive & Transportation", available: true, slug: "motorcycle-repair", description: "Motorcycle maintenance and repair services" },

  // Business & Digital Services (11 calculators)
  { id: 48, name: "Web Designer", icon: Code, category: "Business & Digital Services", available: true, slug: "web-designer", description: "Website design and development services" },
  { id: 49, name: "Marketing Consultant", icon: BarChart3, category: "Business & Digital Services", available: true, slug: "marketing-consultant", description: "Marketing strategy and campaign management" },
  { id: 50, name: "SEO Agency", icon: TrendingUp, category: "Business & Digital Services", available: true, slug: "seo-agency", description: "Search engine optimization and digital marketing" },
  { id: 51, name: "Video Editor", icon: Video, category: "Business & Digital Services", available: true, slug: "video-editor", description: "Video editing and post-production services" },
  { id: 52, name: "Copywriter", icon: Edit, category: "Business & Digital Services", available: true, slug: "copywriter", description: "Content writing and copywriting services" },
  { id: 53, name: "Virtual Assistant", icon: Users, category: "Business & Digital Services", available: true, slug: "virtual-assistant", description: "Administrative support and virtual assistance" },
  { id: 54, name: "Business Coach", icon: Briefcase, category: "Business & Digital Services", available: true, slug: "business-coach", description: "Business strategy and coaching services" },
  { id: 55, name: "Legal Advisor", icon: Scale, category: "Business & Digital Services", available: true, slug: "legal-advisor", description: "Legal consultation and document preparation" },
  { id: 56, name: "Tax Preparer", icon: Calculator, category: "Business & Digital Services", available: true, slug: "tax-preparer", description: "Tax preparation and accounting services" },
  { id: 57, name: "Translation Services", icon: Globe, category: "Business & Digital Services", available: true, slug: "translation-services", description: "Document and verbal translation services" },
];

export default function NichesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(allNiches.map(niche => niche.category)))];

  const filteredNiches = allNiches.filter(niche => {
    const matchesSearch = niche.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         niche.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || niche.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCount = allNiches.filter(niche => niche.available).length;
  const totalCount = allNiches.length;

  return (
    <div className="min-h-screen" style={{backgroundColor: '#060517'}}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            💡 Explore 58 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400">Lead-Generating Calculators</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            One for every service niche. All powered by AI. All ready to embed.<br />
            Instant quotes. More bookings. Less back-and-forth.<br />
            Browse live demos, pick your niche, and launch in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-300 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">✓</span>
              </div>
              <span>58 Niches Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">✓</span>
              </div>
              <span>Fully Customizable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">✓</span>
              </div>
              <span>Add to Any Website in Seconds</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <Badge variant="secondary" className="bg-neon-500/20 text-neon-400">
              {availableCount} Live Demos Available
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {totalCount - availableCount} Available in Full Version
            </Badge>
            <Badge variant="outline" className="border-neon-400 text-neon-400">
              €5/month Launch Price
            </Badge>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search calculators by name or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-midnight-700 border-midnight-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className={
                  selectedCategory === category
                    ? "bg-green-500 hover:bg-green-600 text-black"
                    : "border-midnight-600 text-gray-300 hover:border-green-400 hover:text-white"
                }
              >
                {category}
                {category !== "All" && (
                  <Badge variant="secondary" className={`ml-2 ${
                    selectedCategory === category 
                      ? "bg-green-600 text-white" 
                      : "bg-midnight-600 text-gray-300"
                  }`}>
                    {allNiches.filter(n => n.category === category).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-400">
            Showing <span className="text-neon-400 font-medium">{filteredNiches.length}</span> of {totalCount} calculators
          </p>
        </div>

        {/* Calculator Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredNiches.map((niche, index) => (
            <motion.div
              key={niche.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`relative p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${
                niche.available
                  ? "bg-midnight-800 border-midnight-700 hover:border-neon-400 hover:shadow-lg"
                  : "bg-midnight-800/50 border-midnight-700/50"
              }`}
            >
              {niche.available && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-midnight-900"></div>
              )}
              
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg mr-4 ${
                  niche.available 
                    ? "bg-neon-500/10 border border-neon-500/30" 
                    : "bg-gray-500/10 border border-gray-500/30"
                }`}>
                  <niche.icon className={`h-6 w-6 ${
                    niche.available ? "text-neon-400" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{niche.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{niche.category}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{niche.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {niche.available ? (
                  <>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      <Star className="h-3 w-3 mr-1" />
                      Live Demo Available
                    </Badge>
                    <div className="space-y-2">
                      {niche.slug ? (
                        <Link href={`/calculator/${niche.slug}`}>
                          <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                            Try Live Demo
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white">
                          Try Live Demo
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Full Version Only
                    </Badge>
                    <Button 
                      disabled 
                      className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                    >
                      Available for €5/month
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredNiches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-4">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No calculators found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              variant="outline"
              className="border-neon-400 text-neon-400 hover:bg-neon-400 hover:text-midnight-900"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Category Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {categories.slice(1).map((category) => {
            const categoryNiches = allNiches.filter(n => n.category === category);
            const availableInCategory = categoryNiches.filter(n => n.available).length;
            return (
              <div key={category} className="bg-midnight-800/50 rounded-lg p-4 border border-midnight-700 text-center">
                <div className="text-2xl font-bold text-neon-400">{categoryNiches.length}</div>
                <div className="text-sm text-gray-300 mb-1">{category}</div>
                <div className="text-xs text-gray-400">{availableInCategory} demos available</div>
              </div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-neon-500/10 to-neon-600/10 rounded-lg border border-neon-500/30"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to <span className="text-neon-400">10X Your Conversion Rate?</span>
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Stop losing leads to "I'll think about it" and start closing deals with instant quotes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/#pricing">
                <Button size="lg" className="bg-neon-500 hover:bg-neon-600 text-white px-8 py-4 text-lg">
                  Get All {totalCount} Calculators for €5/month
                </Button>
              </Link>
              <Link href="/calculator/wedding-photography">
                <Button size="lg" variant="outline" className="border-neon-400 text-neon-400 hover:bg-neon-400 hover:text-midnight-900 px-8 py-4 text-lg">
                  Try Demo First
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Crown className="h-4 w-4 mr-2 text-neon-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-neon-400" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-neon-400" />
                <span>300% More Conversions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}