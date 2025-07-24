import crypto from 'crypto';
import type { 
  Calculator, 
  User, 
  UserCalculator, 
  Lead, 
  Session,
  Subscription,
  InsertUser, 
  InsertCalculator, 
  InsertUserCalculator, 
  InsertLead,
  InsertSession,
  InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: string, data: Partial<User>): Promise<User>;
  resetUserQuotes(userId: string): Promise<void>;
  incrementUserQuotes(userId: string): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription>;
  
  // Calculators
  getCalculators(): Promise<Calculator[]>;
  getCalculatorBySlug(slug: string): Promise<Calculator | undefined>;
  getCalculatorsByCategory(category: string): Promise<Calculator[]>;
  createCalculator(calculator: InsertCalculator): Promise<Calculator>;
  
  // User Calculators
  getUserCalculators(userId: string): Promise<UserCalculator[]>;
  getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined>;
  createUserCalculator(userCalculator: InsertUserCalculator): Promise<UserCalculator>;
  updateUserCalculator(id: string, data: Partial<UserCalculator>): Promise<UserCalculator>;
  
  // Leads
  getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  
  // Two-Factor Authentication
  enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<User>;
  disableTwoFactor(userId: string): Promise<User>;
  updateUserBackupCodes(userId: string, backupCodes: string[]): Promise<User>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllCalculators(): Promise<Calculator[]>;
  getUserCount(): Promise<number>;
  getCalculatorCount(): Promise<number>;
  getActiveSubscriptionCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calculators: Map<number, Calculator>;
  private userCalculators: Map<string, UserCalculator>;
  private leads: Map<string, Lead>;
  private sessions: Map<string, Session>;
  private subscriptions: Map<string, Subscription>;
  private currentCalculatorId: number;

  constructor() {
    this.users = new Map();
    this.calculators = new Map();
    this.userCalculators = new Map();
    this.leads = new Map();
    this.sessions = new Map();
    this.subscriptions = new Map();
    this.currentCalculatorId = 1;
    this.seedCalculators();
  }

  private seedCalculators() {
    const calculators: Calculator[] = [
      {
        id: 1,
        name: "Wedding Photography Calculator",
        slug: "wedding-photography",
        category: "photography",
        description: "Professional wedding photography pricing calculator with luxurious styling",
        defaultConfig: {
          packageTypes: {
            "elopement": 950,
            "half-day": 1200,
            "full-day": 1800,
            "destination": 2500
          },
          hourOptions: {
            "4": 0,
            "6": 300,
            "8": 600,
            "10+": 900
          },
          locationOptions: {
            "1": 0,
            "2": 150,
            "3+": 350
          },
          deliveryOptions: {
            "gallery": 0,
            "usb-album": 250,
            "video-highlights": 400
          },
          addOns: {
            "engagement": 300,
            "second-photographer": 250,
            "drone": 150,
            "album": 200,
            "rehearsal": 350,
            "express": 175
          }
        },
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Painting & Decorating Calculator",
        slug: "painting-decorating",
        category: "home-services",
        description: "Professional painting and decorating pricing calculator with trade-pro styling",
        defaultConfig: {
          projectTypes: {
            "interior": 180,
            "exterior": 250,
            "wallpaper": 220,
            "decorative": 300,
            "whole-house": 800
          },
          roomCounts: {
            "1-room": 1,
            "2-3-rooms": 2.5,
            "4-5-rooms": 4.5,
            "full-home": 6.5
          },
          wallConditions: {
            "new": 0,
            "minor": 30,
            "repair": 80
          },
          paintTypes: {
            "standard": 0,
            "premium": 30,
            "eco": 25
          },
          urgencyLevels: {
            "flexible": 0,
            "two-weeks": 50,
            "asap": 100
          },
          addOns: {
            "ceiling": 25,
            "doors-trims": 40,
            "feature-wall": 50,
            "two-coat": 35,
            "protection": 45
          }
        },
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Interior Design Calculator",
        slug: "interior-design",
        category: "home-services",
        description: "Professional interior design pricing calculator with elegant styling",
        defaultConfig: {
          projectTypes: {
            "living-room": 200,
            "bedroom": 180,
            "kitchen": 300,
            "bathroom": 250,
            "whole-home": 800
          },
          propertySizes: {
            "under-50": 1.0,
            "51-100": 1.2,
            "101-150": 1.5,
            "151-plus": 2.0
          },
          serviceLevels: {
            "basic": 0,
            "full-design": 300,
            "renovation": 600,
            "virtual": -100
          },
          urgencyLevels: {
            "flexible": 0,
            "one-month": 100,
            "asap": 200
          },
          addOns: {
            "3d-render": 100,
            "furniture-sourcing": 80,
            "mood-boards": 50,
            "in-person": 120
          }
        },
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "Plumbing Services Calculator",
        slug: "plumbing",
        category: "home-services",
        description: "Professional plumbing service pricing calculator with industrial styling",
        defaultConfig: {
          serviceTypes: {
            "leak-repair": 120,
            "pipe-installation": 200,
            "water-heater": 450,
            "toilet-faucet": 90,
            "renovation": 800,
            "emergency": 150
          },
          propertyTypes: {
            "apartment": 1.0,
            "house": 1.2,
            "commercial": 1.8
          },
          urgencyLevels: {
            "flexible": 0,
            "48-hours": 50,
            "emergency": 100
          },
          addOns: {
            "inspection": 60,
            "report": 40,
            "warranty": 30
          },
          floorSurcharge: 10
        },
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Personal Training Calculator",
        slug: "personal-training",
        category: "beauty-wellness",
        description: "Professional fitness training pricing calculator with bold fitness styling",
        defaultConfig: {
          trainingTypes: {
            "general": 0,
            "strength": 10,
            "weight-loss": 15,
            "prenatal": 20,
            "online": -5
          },
          sessionFormats: {
            "one-on-one": 50,
            "small-group": 30,
            "virtual": 35,
            "outdoor": 55,
            "in-gym": 50
          },
          frequencies: {
            "1x": { sessions: 1, multiplier: 1 },
            "2-3x": { sessions: 2.5, multiplier: 2.5 },
            "4x+": { sessions: 4, multiplier: 4 }
          },
          durations: {
            "30": 0.75,
            "45": 0.9,
            "60": 1.0
          },
          addOns: {
            "meal-plan": 40,
            "progress-app": 25,
            "check-in": 20,
            "pdf-plan": 30
          }
        },
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Newborn Photography Calculator",
        slug: "newborn-photography",
        category: "photography",
        description: "Gentle newborn photography pricing calculator with soft pastel styling",
        defaultConfig: {
          sessionTypes: {
            "classic-studio": 290,
            "lifestyle": 340,
            "combo": 365,
            "mini": 190
          },
          babyAges: {
            "5-10-days": 0,
            "11-21-days": 25,
            "1-month-plus": 50
          },
          peopleOptions: {
            "baby-only": 0,
            "baby-parents": 50,
            "baby-family": 100
          },
          deliveryOptions: {
            "digital-only": 0,
            "prints-album": 140,
            "usb-album": 160
          },
          addOns: {
            "makeup": 80,
            "sibling": 50,
            "album": 140,
            "wall-art": 120,
            "retouching": 60,
            "extended": 75
          },
          weekendSurcharge: 75
        },
        createdAt: new Date(),
      },
      {
        id: 7,
        name: "Maternity Photography Calculator",
        slug: "maternity-photography",
        category: "photography",
        description: "Elegant maternity photography pricing calculator with warm neutral styling",
        defaultConfig: {
          sessionTypes: {
            "classic-studio": 280,
            "outdoor-lifestyle": 355,
            "artistic": 355,
            "combo": 450
          },
          gestationWeeks: {
            "25-29": 0,
            "30-34": 0,
            "35-38": 25
          },
          whoIncluded: {
            "mom-only": 0,
            "mom-partner": 40,
            "mom-family": 80
          },
          locationOptions: {
            "in-studio": 0,
            "outdoor": 50,
            "in-home": 75
          },
          addOns: {
            "makeup": 80,
            "dress-rental": 60,
            "hair-styling": 60,
            "partner-portraits": 40,
            "retouched-set": 65,
            "album": 140,
            "wall-art": 120
          }
        },
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Nutritionist Calculator",
        slug: "nutritionist",
        category: "beauty-wellness",
        description: "Modern wellness nutrition plan pricing calculator with green styling",
        defaultConfig: {
          goalTypes: {
            "weight-loss": 0,
            "muscle-gain": 0,
            "digestive-health": 0,
            "general-wellness": 0,
            "sports-nutrition": 0
          },
          planTypes: {
            "one-time": 90,
            "4-week": 180,
            "8-week": 300,
            "monthly": 120
          },
          dietPreferences: {
            "balanced": 0,
            "vegetarian": 0,
            "vegan": 0,
            "keto": 0,
            "gluten-free": 0,
            "custom": 0
          },
          addOns: {
            "grocery-list": 25,
            "supplement-plan": 35,
            "whatsapp-support": 15,
            "zoom-checkins": 20,
            "food-diary-review": 30
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 9,
        name: "Life Coach Calculator",
        slug: "life-coach",
        category: "beauty-wellness",
        description: "Warm, calming life coaching pricing calculator with sage green and lilac styling",
        defaultConfig: {
          coachingFocus: {
            "personal-growth": 0,
            "career-coaching": 0,
            "confidence-building": 0,
            "relationship-coaching": 0,
            "life-purpose": 0
          },
          sessionFormats: {
            "zoom-coaching": 0,
            "group-sessions": -30,
            "in-person": 40,
            "asynchronous": -20
          },
          programDurations: {
            "one-off": 80,
            "4-week": 280,
            "8-week": 480,
            "monthly": 150
          },
          addOns: {
            "accountability-checkins": 20,
            "worksheets": 30,
            "video-resources": 40,
            "whatsapp-support": 15,
            "discovery-call": 0
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 10,
        name: "Hypnotherapist Calculator",
        slug: "hypnotherapist",
        category: "beauty-wellness",
        description: "Clean therapeutic hypnotherapy pricing calculator with sage green and teal styling",
        defaultConfig: {
          treatmentTypes: {
            "stop-smoking": 0,
            "weight-loss": 0,
            "stress-anxiety": 0,
            "confidence": 0,
            "sleep-improvement": 0,
            "rtt-deep-healing": 0
          },
          sessionFormats: {
            "in-person": 0,
            "online-zoom": -20,
            "group-session": -40
          },
          sessionPlans: {
            "one-off": 100,
            "3-session": 270,
            "6-session": 500
          },
          addOns: {
            "audio-recording": 25,
            "follow-up": 20,
            "progress-journal": 15,
            "nlp-addon": 30,
            "urgent-booking": 40
          },
          clientTypes: {
            "new": 0,
            "returning": 0.1
          }
        },
        createdAt: new Date(),
      },
      {
        id: 11,
        name: "Private Tutor Calculator",
        slug: "private-tutor",
        category: "education-training",
        description: "Clean academic private tutoring pricing calculator with navy and slate styling",
        defaultConfig: {
          subjects: {
            "mathematics": 0,
            "science": 0,
            "english-languages": 0,
            "coding-it": 0,
            "music": 0
          },
          studentLevels: {
            "primary": 0,
            "secondary": 10,
            "university": 15,
            "adult": 12
          },
          sessionTypes: {
            "online": 0,
            "student-home": 10,
            "tutor-home": 5
          },
          sessionDurations: {
            "30min": 25,
            "60min": 30,
            "90min": 40
          },
          sessionFrequencies: {
            "one-off": 1,
            "weekly": 1,
            "twice-weekly": 1.9,
            "intensive": 2.7
          },
          addOns: {
            "exam-materials": 10,
            "progress-reports": 15,
            "homework-support": 10,
            "emergency-booking": 25
          }
        },
        createdAt: new Date(),
      },
      {
        id: 12,
        name: "Dog Trainer Calculator",
        slug: "dog-trainer",
        category: "animals-pets",
        description: "Friendly professional dog training pricing calculator with light blue and sage green styling",
        defaultConfig: {
          dogAges: {
            "puppy": 0,
            "adult": 0,
            "senior": 5
          },
          dogSizes: {
            "small": 0,
            "medium": 5,
            "large": 10,
            "xl": 15
          },
          trainingTypes: {
            "basic-obedience": 0,
            "puppy-socialization": 0,
            "behavioral-correction": 30,
            "leash-training": 10,
            "protection-k9": 50
          },
          sessionFormats: {
            "one-on-one": 0,
            "group-class": -15,
            "at-home": 20,
            "trainer-location": 5,
            "online": -10
          },
          sessionFrequencies: {
            "one-off": 1,
            "weekly": 1,
            "twice-weekly": 1.9,
            "full-program": 5.5
          },
          addOns: {
            "training-plan": 15,
            "progress-report": 12,
            "leash-collar-package": 25,
            "emergency-weekend": 35,
            "travel-to-client": 20
          }
        },
        createdAt: new Date(),
      },
      {
        id: 13,
        name: "Car Detailing Calculator",
        slug: "car-detailing",
        category: "automotive-transportation",
        description: "Sleek modern car detailing pricing calculator with dark grey and teal styling",
        defaultConfig: {
          vehicleTypes: {
            "sedan": 0,
            "suv": 20,
            "truck": 25,
            "van": 30,
            "coupe": 5,
            "motorcycle": -20
          },
          serviceLevels: {
            "exterior-wash": 60,
            "interior-clean": 80,
            "full-detail": 150,
            "engine-bay": 100,
            "ceramic-coating": 210
          },
          conditions: {
            "light": 0,
            "average": 10,
            "heavy": 20
          },
          serviceLocations: {
            "shop": 0,
            "mobile": 25
          },
          addOns: {
            "headlight-restoration": 40,
            "leather-conditioning": 25,
            "odor-elimination": 35,
            "stain-removal": 30,
            "water-spot-treatment": 20
          }
        },
        createdAt: new Date(),
      },
      {
        id: 14,
        name: "Auto Mechanic Calculator",
        slug: "auto-mechanic",
        category: "automotive-transportation",
        description: "Industrial clean auto repair pricing calculator with graphite grey and cobalt blue styling",
        defaultConfig: {
          vehicleTypes: {
            "sedan": 0,
            "suv": 30,
            "truck": 40,
            "van": 35,
            "electric-hybrid": 50
          },
          servicesNeeded: {
            "oil-change": 60,
            "brake-replacement": 180,
            "tire-service": 80,
            "engine-diagnostics": 120,
            "battery-replacement": 150,
            "suspension-alignment": 200
          },
          urgencyLevels: {
            "flexible": 0,
            "within-3-days": 20,
            "emergency": 50
          },
          serviceLocations: {
            "at-shop": 0,
            "mobile": 35
          },
          addOns: {
            "pickup-dropoff": 25,
            "premium-parts": 15,
            "car-wash": 20,
            "extended-warranty": 40
          }
        },
        createdAt: new Date(),
      },
      {
        id: 15,
        name: "Mobile Car Wash Calculator",
        slug: "mobile-car-wash",
        category: "automotive-transportation",
        description: "Professional mobile car wash pricing calculator with clean blue design and water droplet styling",
        defaultConfig: {
          vehicleSizes: {
            "compact": 0,
            "sedan": 10,
            "suv": 20,
            "truck": 30
          },
          servicePackages: {
            "exterior": 30,
            "ext_int": 50,
            "full_detail": 110,
            "showroom": 180
          },
          urgencyLevels: {
            "rush": 25,
            "normal": 0,
            "flexible": 0
          },
          serviceLocations: {
            "home": 0,
            "work": 0,
            "other": 0
          },
          addOns: {
            "engine": 25,
            "pet_hair": 20,
            "ceramic": 100,
            "wax": 35,
            "headlight": 40
          }
        },
        createdAt: new Date(),
      },
      {
        id: 16,
        name: "Virtual Assistant Calculator",
        slug: "virtual-assistant",
        category: "business-services",
        description: "Professional virtual assistant pricing calculator with teal and purple styling",
        defaultConfig: {
          serviceTypes: {
            "inbox-management": 0,
            "calendar-booking": 0,
            "social-media": 0,
            "data-entry": 0,
            "customer-support": 0
          },
          hoursPerWeek: {
            "1-5": 1,
            "6-10": 8,
            "11-20": 15,
            "20+": 25
          },
          availabilityOptions: {
            "mornings": 0,
            "afternoons": 0,
            "evenings": 0,
            "flexible": 0
          },
          urgencyLevels: {
            "asap": 50,
            "within-2-weeks": 0,
            "next-month": 0
          },
          contractTypes: {
            "one-off": 0,
            "monthly-retainer": -15,
            "ongoing-hourly": 0
          },
          baseRate: 30
        },
        createdAt: new Date(),
      },
      {
        id: 17,
        name: "Business Coach Calculator",
        slug: "business-coach",
        category: "business-services",
        description: "Professional business coach pricing calculator with navy, gold, and white luxury styling",
        defaultConfig: {
          coachingFocus: {
            "leadership": 0,
            "startup-growth": 0,
            "career-transition": 0,
            "productivity": 0,
            "sales-marketing": 0
          },
          sessionFrequency: {
            "one-time": 1,
            "weekly": 4,
            "biweekly": 2,
            "monthly": 1
          },
          coachingFormat: {
            "online": 0,
            "in-person": 100,
            "hybrid": 50
          },
          packageDuration: {
            "1-month": { multiplier: 1, discount: 0 },
            "3-months": { multiplier: 3, discount: 0.1 },
            "6-months": { multiplier: 6, discount: 0.15 },
            "custom": { multiplier: 1, discount: 0 }
          },
          addOns: {
            "email-support": 50,
            "worksheets": 25,
            "accountability": 40,
            "action-plans": 25
          },
          baseRate: 200
        },
        createdAt: new Date(),
      },
      {
        id: 18,
        name: "Legal Advisor Calculator",
        slug: "legal-advisor",
        category: "business-services",
        description: "Professional legal consultation pricing calculator with clean blue, white, and grey styling",
        defaultConfig: {
          serviceTypes: {
            "contract-drafting": 0,
            "business-setup": 0,
            "family-law": 0,
            "immigration": 0,
            "estate-planning": 0,
            "ip-trademark": 0
          },
          consultationTypes: {
            "30min-call": 120,
            "1hour-session": 200,
            "ongoing-retainer": 500
          },
          urgencyLevels: {
            "flexible": 0,
            "priority": 50,
            "urgent": 100
          },
          jurisdictionOptions: {
            "local": 0,
            "international": 100
          },
          addOns: {
            "document-review": 90,
            "legal-summary": 70,
            "email-support": 40,
            "in-person": 120
          },
          baseRate: 120
        },
        createdAt: new Date(),
      },
      {
        id: 19,
        name: "Tax Preparer Calculator",
        slug: "tax-preparer",
        category: "business-services",
        description: "Professional tax preparation pricing calculator with clean navy, white, and grey styling",
        defaultConfig: {
          filingTypes: {
            "individual": 80,
            "married-joint": 120,
            "married-separate": 100,
            "business": 200,
            "llc": 250,
            "corporation": 350
          },
          incomeLevels: {
            "under-30k": 1,
            "30k-70k": 1.2,
            "70k-150k": 1.5,
            "over-150k": 2
          },
          formsCounts: {
            "w2-only": 0,
            "extra-1-3": 50,
            "extra-4-plus": 125,
            "investment-crypto": 200
          },
          addOns: {
            "audit-protection": 40,
            "year-round-support": 90,
            "prior-year": 60,
            "in-person-review": 50,
            "rush-filing": 75
          },
          baseRate: 80
        },
        createdAt: new Date(),
      },
      {
        id: 20,
        name: "Translation Services Calculator",
        slug: "translation-services",
        category: "business-services",
        description: "Professional translation and language services pricing calculator with multilingual design",
        defaultConfig: {
          serviceTypes: {
            "translation": 0.12,
            "proofreading": 0.06,
            "transcription": 0.08,
            "subtitling": 0.15,
            "certified": 0.18
          },
          documentTypes: {
            "legal": 1.3,
            "marketing": 1.1,
            "technical": 1.4,
            "academic": 1.2,
            "personal": 1.0
          },
          urgencyMultipliers: {
            "standard": 1.0,
            "express": 1.25,
            "same-day": 1.5
          },
          addOns: {
            "certified-stamp": 20,
            "formatting": 10,
            "extra-proofreading": 0.04
          },
          baseRate: 0.12
        },
        createdAt: new Date(),
      },
      {
        id: 21,
        name: "Cleaning Services Calculator",
        slug: "cleaning-services",
        category: "home-services",
        description: "Professional house and commercial cleaning services pricing calculator with teal design",
        defaultConfig: {
          cleaningTypes: {
            "regular": 1.0,
            "deep-clean": 1.25,
            "move-in-out": 1.35,
            "airbnb": 1.15,
            "carpet": 1.20
          },
          propertySizes: {
            "studio": 60,
            "1-bedroom": 75,
            "2-bedroom": 90,
            "3-bedroom": 105,
            "4-bedroom": 125
          },
          frequencies: {
            "one-time": 0,
            "weekly": 0.15,
            "biweekly": 0.10,
            "monthly": 0.05
          },
          urgency: {
            "standard": 1.0,
            "express": 1.20,
            "emergency": 1.50
          },
          addOns: {
            "windows": 20,
            "fridge": 10,
            "oven": 15,
            "laundry": 15,
            "balcony": 12
          },
          baseRate: 60
        },
        createdAt: new Date(),
      },
      {
        id: 22,
        name: "Private School Tuition Calculator",
        slug: "private-school",
        category: "education",
        description: "Academic tuition estimator for private schools with navy, white, and beige design",
        defaultConfig: {
          gradeLevels: {
            "pre-k": 5000,
            "primary": 7500,
            "middle": 9000,
            "high": 11000
          },
          enrollmentTypes: {
            "full-time": 1.0,
            "part-time": 0.7,
            "boarding": 8000,
            "day-school": 1.0
          },
          siblingDiscounts: {
            "first": 0,
            "second": 0.10,
            "third": 0.15
          },
          paymentPlans: {
            "annual": 0,
            "quarterly": 0.02,
            "monthly": 0.05
          },
          addOns: {
            "aftercare": 900,
            "lunch": 750,
            "transport": 1200,
            "ib-advanced": 1500
          },
          baseRate: 7500
        },
        createdAt: new Date(),
      },
      {
        id: 23,
        name: "Dentist & Implant Clinic Calculator",
        slug: "dentist-implant",
        category: "healthcare-medical",
        description: "Dental treatment pricing calculator with clinical aqua blue design for implants, veneers, and comprehensive care",
        defaultConfig: {
          treatments: {
            "dental-implant-single": { single: 1200 },
            "dental-implant-multiple": { multiple: 1000 },
            "veneers-single": { single: 450 },
            "veneers-full": { fullSet: 4000 },
            "invisalign": { starting: 3500 },
            "teeth-whitening": { base: 300 },
            "cleaning": { base: 90 },
            "root-canal": { base: 400 }
          },
          urgency: {
            "regular": 1.0,
            "express": 75,
            "virtual": 50
          },
          addOns: {
            "xray-3d": 120,
            "sedation": 200,
            "care-package": 150
          },
          discounts: {
            multiTreatment: 0.10,
            insurance: 0.15
          },
          promoCodes: {
            "DENTAL10": 0.10,
            "SMILE20": 0.20,
            "NEWPATIENT15": 0.15
          }
        },
        createdAt: new Date(),
      },
      {
        id: 24,
        name: "Childcare Practitioner Calculator",
        slug: "childcare-practitioner",
        category: "healthcare-medical",
        description: "Parent-friendly childcare pricing calculator with gentle pastel design for nannies, daycare, and after-school care",
        defaultConfig: {
          careTypes: {
            "full-day": 60,
            "half-day": 35,
            "after-school": 25,
            "weekend": 70,
            "overnight": 80
          },
          ageGroups: {
            "infant": 1.2,
            "toddler": 1.1,
            "preschooler": 1.0,
            "school-age": 0.9
          },
          timeSlots: {
            "morning": 1.0,
            "afternoon": 1.0,
            "evening": 1.1,
            "overnight": 1.3
          },
          addOns: {
            "meals": 5,
            "homework": 10,
            "extra-child": 20,
            "special-needs": 15
          },
          discounts: {
            multiChild: 0.15,
            subsidy: 0.20
          },
          promoCodes: {
            "CARE10": 10,
            "FAMILY20": 20,
            "FIRSTTIME15": 15
          }
        },
        createdAt: new Date(),
      },
      {
        id: 25,
        name: "Plastic Surgery Calculator",
        slug: "plastic-surgery",
        category: "healthcare-medical",
        description: "Premium plastic surgery pricing calculator with monochrome/gold design for cosmetic and reconstructive procedures",
        defaultConfig: {
          procedures: {
            "rhinoplasty": 4500,
            "breast-augmentation": 5800,
            "liposuction": 3000,
            "facelift": 7500,
            "tummy-tuck": 6200,
            "eyelid-surgery": 3800
          },
          anesthesia: {
            "local": 250,
            "general": 600
          },
          additionalTreatments: {
            "fat-transfer": 1200,
            "injectables": 300,
            "aftercare-package": 450,
            "compression-garments": 180
          },
          hospitalStay: {
            "none": 0,
            "1-night": 400,
            "2-nights": 800
          },
          discounts: {
            promo: 0.10
          },
          promoCodes: {
            "BEAUTY10": 0.10,
            "CONSULTATION15": 0.15,
            "PREMIUM20": 0.20
          }
        },
        createdAt: new Date(),
      },
      {
        id: 26,
        name: "Childcare Services Calculator",
        slug: "childcare-services",
        category: "healthcare-medical",
        description: "Warm childcare services pricing calculator with playful pastel design for daycare centers and nurseries",
        defaultConfig: {
          ageGroups: {
            "infant": 950,
            "toddler": 750,
            "preschool": 650,
            "school-age": 480
          },
          schedules: {
            "full-time": 1.0,
            "part-time": 0.68,
            "after-school": 0.45,
            "holiday-care": 0.3
          },
          additionalServices: {
            "meals": 80,
            "transport": 120,
            "early-late": 60,
            "learning-support": 150
          },
          discounts: {
            sibling: 0.15,
            promo: 0.10
          },
          promoCodes: {
            "FAMILY10": 0.10,
            "WELCOME15": 0.15,
            "NEWCHILD20": 0.20
          }
        },
        createdAt: new Date(),
      },
      {
        id: 27,
        name: "Private Medical Clinic Calculator",
        slug: "private-medical",
        category: "healthcare-medical",
        description: "Clinical private medical pricing calculator with clean teal/white/navy design for GP practices and specialist clinics",
        defaultConfig: {
          consultations: {
            "general-gp": 90,
            "specialist": 150,
            "health-check": 200,
            "second-opinion": 120,
            "preventative-screening": 160
          },
          serviceCategories: {
            "diagnostics": 80,
            "preventative": 60,
            "cosmetic": 200,
            "mental-health": 140
          },
          urgency: {
            "standard": 0,
            "same-day": 60,
            "priority": 40
          },
          addOns: {
            "lab-tests": 75,
            "basic-imaging": 120,
            "advanced-imaging": 250,
            "medical-certificate": 35,
            "follow-up-call": 30
          },
          discounts: {
            promo: 0.10
          },
          promoCodes: {
            "HEALTH10": 0.10,
            "CHECKUP15": 0.15,
            "WELLNESS20": 0.20
          }
        },
        createdAt: new Date(),
      }
    ];

    calculators.forEach(calculator => {
      this.calculators.set(calculator.id, calculator);
    });
    this.currentCalculatorId = calculators.length + 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: insertUser.email,
      fullName: insertUser.fullName || null,
      passwordHash: insertUser.passwordHash || null,
      subscriptionStatus: "free",
      stripeCustomerId: null,
      quotesUsedThisMonth: 0,
      quotesLimit: 5,
      subscriptionStartDate: null,
      lastQuoteReset: new Date(),
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    for (const calculator of this.calculators.values()) {
      if (calculator.slug === slug) {
        return calculator;
      }
    }
    return undefined;
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    const result: Calculator[] = [];
    for (const calculator of this.calculators.values()) {
      if (calculator.category === category) {
        result.push(calculator);
      }
    }
    return result;
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const calculator: Calculator = {
      id: this.currentCalculatorId++,
      name: insertCalculator.name,
      slug: insertCalculator.slug,
      category: insertCalculator.category,
      description: insertCalculator.description || null,
      defaultConfig: insertCalculator.defaultConfig || {},
      createdAt: new Date(),
    };
    this.calculators.set(calculator.id, calculator);
    return calculator;
  }

  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    const result: UserCalculator[] = [];
    for (const userCalculator of this.userCalculators.values()) {
      if (userCalculator.userId === userId) {
        result.push(userCalculator);
      }
    }
    return result;
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    for (const userCalculator of this.userCalculators.values()) {
      if (userCalculator.embedId === embedId) {
        return userCalculator;
      }
    }
    return undefined;
  }

  async createUserCalculator(insertUserCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const userCalculator: UserCalculator = {
      id: crypto.randomUUID(),
      userId: insertUserCalculator.userId,
      calculatorId: insertUserCalculator.calculatorId,
      customConfig: insertUserCalculator.customConfig || {},
      embedId: insertUserCalculator.embedId || crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.userCalculators.set(userCalculator.id, userCalculator);
    return userCalculator;
  }

  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    const result: Lead[] = [];
    for (const lead of this.leads.values()) {
      if (lead.userCalculatorId === userCalculatorId) {
        result.push(lead);
      }
    }
    return result;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: crypto.randomUUID(),
      userCalculatorId: insertLead.userCalculatorId,
      name: insertLead.name || null,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      quoteData: insertLead.quoteData || {},
      estimatedValue: insertLead.estimatedValue || null,
      status: "new",
      createdAt: new Date(),
    };
    this.leads.set(lead.id, lead);
    return lead;
  }

  // Sessions
  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId: insertSession.userId,
      token: insertSession.token,
      expiresAt: insertSession.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(session.token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessions.get(token);
  }

  async deleteSession(sessionId: string): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.id === sessionId) {
        this.sessions.delete(token);
        break;
      }
    }
  }

  // Subscriptions
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      userId: insertSubscription.userId,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId || null,
      status: insertSubscription.status,
      currentPeriodStart: insertSubscription.currentPeriodStart || null,
      currentPeriodEnd: insertSubscription.currentPeriodEnd || null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.userId === userId) {
        return subscription;
      }
    }
    return undefined;
  }

  async updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    const updated = { ...subscription, ...data };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  // User subscription management
  async updateUserSubscription(userId: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updated = { ...user, ...data };
    this.users.set(userId, updated);
    return updated;
  }

  async resetUserQuotes(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updated = { 
        ...user, 
        quotesUsedThisMonth: 0, 
        lastQuoteReset: new Date() 
      };
      this.users.set(userId, updated);
    }
  }

  async incrementUserQuotes(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updated = { 
        ...user, 
        quotesUsedThisMonth: (user.quotesUsedThisMonth || 0) + 1 
      };
      this.users.set(userId, updated);
    }
  }

  // User Calculator management
  async updateUserCalculator(id: string, data: Partial<UserCalculator>): Promise<UserCalculator> {
    const userCalculator = this.userCalculators.get(id);
    if (!userCalculator) {
      throw new Error('User calculator not found');
    }
    const updated = { ...userCalculator, ...data, lastUpdated: new Date() };
    this.userCalculators.set(id, updated);
    return updated;
  }

  // Two-Factor Authentication methods
  async enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updated = { 
      ...user, 
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes: backupCodes
    };
    this.users.set(userId, updated);
    return updated;
  }

  async disableTwoFactor(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updated = { 
      ...user, 
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null
    };
    this.users.set(userId, updated);
    return updated;
  }

  async updateUserBackupCodes(userId: string, backupCodes: string[]): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updated = { 
      ...user, 
      backupCodes: backupCodes
    };
    this.users.set(userId, updated);
    return updated;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async getCalculatorCount(): Promise<number> {
    return this.calculators.size;
  }

  async getActiveSubscriptionCount(): Promise<number> {
    const subscriptions = Array.from(this.subscriptions.values());
    return subscriptions.filter(sub => sub.status === 'active').length;
  }
}

import { PostgresStorage } from "./postgres-storage";

export const storage = new PostgresStorage();