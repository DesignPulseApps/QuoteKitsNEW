import { 
  users, 
  calculators, 
  userCalculators, 
  leads,
  type User, 
  type InsertUser,
  type Calculator,
  type InsertCalculator,
  type UserCalculator,
  type InsertUserCalculator,
  type Lead,
  type InsertLead
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calculators
  getCalculators(): Promise<Calculator[]>;
  getCalculatorBySlug(slug: string): Promise<Calculator | undefined>;
  getCalculatorsByCategory(category: string): Promise<Calculator[]>;
  createCalculator(calculator: InsertCalculator): Promise<Calculator>;
  
  // User Calculators
  getUserCalculators(userId: string): Promise<UserCalculator[]>;
  getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined>;
  createUserCalculator(userCalculator: InsertUserCalculator): Promise<UserCalculator>;
  
  // Leads
  getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calculators: Map<number, Calculator>;
  private userCalculators: Map<string, UserCalculator>;
  private leads: Map<string, Lead>;
  private currentCalculatorId: number;

  constructor() {
    this.users = new Map();
    this.calculators = new Map();
    this.userCalculators = new Map();
    this.leads = new Map();
    this.currentCalculatorId = 1;
    
    // Seed with default calculators
    this.seedCalculators();
  }

  private seedCalculators() {
    const defaultCalculators: InsertCalculator[] = [
      {
        name: "Electrician Services Calculator",
        slug: "electrician",
        category: "home-services",
        description: "Professional electrical services quote calculator with AI input",
        defaultConfig: {
          baseCallOut: 80,
          roomRate: 60,
          serviceTypes: {
            "new-installation": 50,
            "rewiring": 150,
            "fault-finding": 40,
            "fuse-box-upgrade": 120,
            "lighting-installation": 80,
            "ev-charger": 200,
            "smart-home": 225
          },
          urgencyRates: {
            "standard": 0,
            "next-day": 50,
            "emergency": 100
          },
          addOns: {
            "certificate": 40,
            "cleanup": 50,
            "materials": 100,
            "extra-tech": 70
          }
        }
      },
      {
        name: "Drone & Aerial Photography Calculator",
        slug: "drone-photography",
        category: "photography",
        description: "Professional aerial photography and videography quote calculator",
        defaultConfig: {
          baseShoot: 200,
          durationMultipliers: {
            "under-1hr": 1.0,
            "half-day": 2.5,
            "full-day": 4.0
          },
          outputTypes: {
            "video-only": 100,
            "stills-only": 0,
            "both": 150,
            "edited-highlights": 250,
            "raw-footage": 50
          },
          locationTypes: {
            "rural": 0,
            "urban": 75,
            "restricted": 200
          },
          addOns: {
            "voiceover": 50,
            "music": 80,
            "promo-video": 300,
            "cloud-delivery": 40,
            "express-delivery": 100
          }
        }
      },
      {
        name: "Event Videography Calculator",
        slug: "event-videography",
        category: "photography",
        description: "Professional event videography quote calculator with cinematic quality",
        defaultConfig: {
          baseEvent: 450,
          durations: {
            "2-hours": 0,
            "half-day": 300,
            "full-day": 600,
            "multi-day": 1200
          },
          deliverables: {
            "full-video": 0,
            "highlights": 250,
            "raw-footage": 0,
            "social-teasers": 120,
            "drone": 200,
            "same-day-edit": 400
          },
          crewSizes: {
            "solo": 0,
            "duo": 200,
            "full-team": 400
          },
          locations: {
            "local": 0,
            "regional": 100,
            "destination": 300
          },
          addOns: {
            "voiceover": 80,
            "music": 100,
            "titles": 60,
            "livestream": 300,
            "express": 100
          }
        }
      },
      {
        name: "Real Estate Photography Calculator",
        slug: "real-estate-photography",
        category: "photography",
        description: "Professional property photography quote calculator with competitive pricing",
        defaultConfig: {
          baseApartment: 150,
          propertyTypes: {
            "apartment": 0,
            "house": 50,
            "villa": 100,
            "commercial": 100
          },
          services: {
            "interior": 0,
            "exterior": 30,
            "aerial": 80,
            "twilight": 90,
            "floor-plan": 60,
            "virtual-tour": 120
          },
          timeframes: {
            "standard": 0,
            "rush": 50,
            "same-day": 90
          },
          locations: {
            "city": 0,
            "nearby": 25,
            "distant": 75
          }
        }
      },
      {
        name: "Food Photography Calculator",
        slug: "food-photography",
        category: "photography",
        description: "Professional food photography quote calculator with elegant styling",
        defaultConfig: {
          baseStudio: 180,
          dishCounts: {
            "1-5": 0,
            "6-10": 100,
            "11-20": 200,
            "20+": 300
          },
          locations: {
            "studio": 0,
            "on-location": 75,
            "outdoor": 50
          },
          styles: {
            "overhead": 0,
            "lifestyle": 80,
            "studio": 0,
            "process": 60
          },
          addOns: {
            "stylist": 150,
            "props": 100,
            "fast": 80,
            "raw": 50,
            "commercial": 200
          },
          delivery: {
            "jpeg": 0,
            "social": 40,
            "tiff": 60,
            "web": 30
          }
        }
      },
      {
        name: "Commercial Photography",
        slug: "commercial-photography",
        category: "photography",
        description: "Professional commercial photography quote calculator with corporate styling",
        defaultConfig: {
          baseStudio: 350,
          imageCounts: {
            "1-5": 0,
            "6-15": 300,
            "16-30": 750,
            "30+": 1200
          },
          durations: {
            "1-hour": 0,
            "half-day": 250,
            "full-day": 600,
            "multi-day": 1200
          },
          locations: {
            "studio": 0,
            "on-location": 100,
            "hybrid": 200
          },
          addOns: {
            "creative-director": 200,
            "stylist": 150,
            "basic-retouching": 50,
            "advanced-retouching": 100,
            "casting": 300,
            "set-design": 180,
            "local-rights": 100,
            "national-rights": 250,
            "global-rights": 500
          },
          delivery: {
            "standard": 0,
            "rush": 90,
            "same-day": 150
          }
        }
      },
      {
        name: "Portrait Photography Calculator",
        slug: "portrait-photography",
        category: "photography",
        description: "Professional portrait photography quote calculator with warm styling",
        defaultConfig: {
          baseSession: 150,
          durations: {
            "30-min": 0,
            "1-hour": 75,
            "2-hours": 150
          },
          locations: {
            "studio": 0,
            "outdoor": 60,
            "client-location": 60
          },
          wardrobe: {
            "1": 0,
            "2": 40,
            "3+": 80
          },
          addOns: {
            "makeup": 80,
            "standard-retouching": 0,
            "deluxe-retouching": 50,
            "express-delivery": 50,
            "extra-images": 100,
            "headshot-bundle": 75
          },
          usage: {
            "personal": 0,
            "commercial": 120
          }
        }
      },
      {
        name: "Lifestyle Influencer Calculator",
        slug: "lifestyle-influencer",
        category: "digital-marketing",
        description: "Professional influencer collaboration rate calculator with modern styling",
        defaultConfig: {
          basePost: 250,
          deliverables: {
            "1-post": 0,
            "post-stories": 150,
            "reel": 100,
            "full-campaign": 400,
            "unboxing": 200
          },
          usageRights: {
            "organic": 0,
            "paid-3m": 150,
            "paid-6m": 250,
            "paid-12m": 300,
            "whitelisting": 200
          },
          exclusivity: {
            "none": 0,
            "30-days": 100,
            "3-months": 200,
            "6-months": 400
          },
          addOns: {
            "photography": 150,
            "blog-writeup": 150,
            "link-in-bio": 75,
            "giveaway": 75,
            "bts-content": 100
          }
        }
      },
      {
        name: "Landscaping Calculator",
        slug: "landscaping",
        category: "home-services",
        description: "Professional landscaping quote calculator with earthy styling",
        defaultConfig: {
          baseLawnMowing: 120,
          services: {
            "mowing": 0,
            "tree-trimming": 100,
            "garden-design": 200,
            "irrigation": 300,
            "patio": 900,
            "lighting": 250,
            "fence": 800,
            "cleanup": 80
          },
          sizes: {
            "small": 0,
            "medium": 50,
            "large": 100,
            "very-large": 150
          },
          frequencies: {
            "one-time": 0,
            "weekly": 0.10,
            "bi-weekly": 0.07,
            "monthly": 0.05
          },
          addOns: {
            "soil-treatment": 120,
            "sod": 200,
            "pressure-washing": 80,
            "mulching": 90,
            "garden-redesign": 150
          }
        }
      },
      {
        name: "Roofing Calculator",
        slug: "roofing",
        category: "home-services",
        description: "Professional roofing quote calculator with contractor-friendly styling",
        defaultConfig: {
          services: {
            "leak-repair": 150,
            "replacement": 120,
            "gutter-cleaning": 150,
            "tile-replacement": 200,
            "inspection": 75
          },
          roofTypes: {
            "flat": 1,
            "pitched": 1,
            "metal": 1.15,
            "tile": 1.2,
            "asphalt": 1
          },
          accessFees: {
            "easy": 0,
            "moderate": 100,
            "difficult": 200
          },
          buildingMultipliers: {
            "house": 1,
            "apartment": 1.1,
            "commercial": 1.2
          },
          addOns: {
            "gutter-guard": 180,
            "waterproof": 150,
            "skylight": 250,
            "fascia": 120,
            "emergency": 100
          }
        }
      },
      {
        name: "Solar Panel Installation Calculator",
        slug: "solar",
        category: "home-services",
        description: "Professional solar panel installation quote calculator with eco-tech styling",
        defaultConfig: {
          basePrice: 5000,
          pricePerKW: 1000,
          propertyMultipliers: {
            "house": 1,
            "apartment": 1.2,
            "commercial": 1.5
          },
          roofComplexity: {
            "flat": 1.1,
            "sloped-south": 1,
            "sloped-eastwest": 1.05,
            "metal": 1.15,
            "tile": 1.2,
            "asphalt": 1
          },
          powerUsage: {
            "low": 3,
            "medium": 5,
            "high": 8,
            "very-high": 12
          },
          batteryStorage: 4500,
          addOns: {
            "ev-charger": 1200,
            "smart-monitoring": 400,
            "solar-roof-tiles": 2000
          }
        }
      },
      {
        name: "Pest Control Calculator",
        slug: "pest-control",
        category: "home-services",
        description: "Professional pest control pricing calculator with nature-friendly styling",
        defaultConfig: {
          basePrice: 100,
          pestTypes: {
            "cockroaches": 50,
            "ants": 25,
            "wasps": 75,
            "bedbugs": 150,
            "rodents": 100,
            "termites": 250,
            "general": 0
          },
          infestationLevels: {
            "light": 0,
            "moderate": 75,
            "severe": 150
          },
          propertyMultipliers: {
            "apartment": 1,
            "house": 1.2,
            "commercial": 1.5,
            "warehouse": 2
          },
          serviceMultipliers: {
            "one-time": 1,
            "monthly": 0.8,
            "quarterly": 0.9
          },
          addOns: {
            "eco-friendly": 40,
            "same-day": 80,
            "follow-up": 50,
            "pet-safe": 40
          }
        }
      },
      {
        name: "Window & Door Installation Calculator",
        slug: "window-door",
        category: "home-services",
        description: "Professional window and door installation pricing calculator with contractor styling",
        defaultConfig: {
          basePrice: {
            "windows": 300,
            "doors": 450,
            "both": 375
          },
          productTypes: {
            "standard": 0,
            "energy-efficient": 150,
            "premium-custom": 300
          },
          materials: {
            "pvc": 0,
            "wood": 100,
            "aluminum": 75,
            "composite": 125
          },
          accessTypes: {
            "ground": 0,
            "first-floor": 75,
            "scaffolding": 150
          },
          addOns: {
            "frame-removal": 80,
            "waste-disposal": 50,
            "fast-track": 120,
            "extra-locks": 90
          }
        }
      },
      {
        name: "Makeup Artist Calculator",
        slug: "makeup-artist",
        category: "beauty-wellness",
        description: "Professional makeup artistry pricing calculator with elegant rose gold styling",
        defaultConfig: {
          occasionTypes: {
            "bridal": 150,
            "bridesmaid": 120,
            "event-glam": 100,
            "photoshoot": 130,
            "prom": 90
          },
          makeupStyles: {
            "natural": 0,
            "full-glam": 25,
            "editorial": 40,
            "hd-ready": 30
          },
          locations: {
            "studio": 0,
            "on-site": 50
          },
          additionalPersonPrice: 80,
          addOns: {
            "lashes": 15,
            "hair-styling": 40,
            "skincare-prep": 20,
            "touch-up-kit": 25,
            "travel": 75
          }
        }
      },
      {
        name: "Hair Stylist Calculator",
        slug: "hair-stylist",
        category: "beauty-wellness",
        description: "Professional hair styling pricing calculator with elegant blush pink styling",
        defaultConfig: {
          serviceTypes: {
            "blow-dry": 40,
            "haircut-style": 60,
            "bridal-updo": 150,
            "coloring": 120,
            "keratin": 200
          },
          hairLengths: {
            "short": 0,
            "medium": 15,
            "long": 25,
            "extra-long": 40
          },
          locations: {
            "salon": 0,
            "mobile": 50
          },
          addOns: {
            "olaplex": 25,
            "extensions": 40,
            "trial": 50,
            "extra-time": 30,
            "travel": 75
          }
        }
      },
      {
        name: "Tattoo Artist Calculator",
        slug: "tattoo-artist",
        category: "beauty-wellness",
        description: "Professional tattoo artistry pricing calculator with urban dark styling",
        defaultConfig: {
          sizes: {
            "xs": 100,
            "small": 150,
            "medium": 250,
            "large": 500
          },
          placements: {
            "arm": 0,
            "leg": 0,
            "back": 25,
            "chest": 25,
            "neck": 50,
            "hand": 75,
            "face": 100
          },
          styles: {
            "fine-line": 0,
            "realism": 100,
            "traditional": 25,
            "blackwork": 50,
            "watercolor": 75
          },
          colorMultiplier: {
            "black-grey": 1.0,
            "color": 1.15
          },
          customArt: 75,
          addOns: {
            "priority": 60,
            "aftercare": 25,
            "touch-up": 40,
            "consultation": 50
          }
        }
      },
      {
        name: "Massage Therapy Calculator",
        slug: "massage-therapy",
        category: "beauty-wellness",
        description: "Professional therapeutic massage pricing calculator with wellness styling",
        defaultConfig: {
          massageTypes: {
            "swedish": 0,
            "deep-tissue": 20,
            "sports": 25,
            "prenatal": 15,
            "hot-stone": 20
          },
          sessionLengths: {
            "30": 40,
            "60": 65,
            "90": 90,
            "120": 115
          },
          locations: {
            "studio": 0,
            "mobile": 30
          },
          addOns: {
            "aromatherapy": 15,
            "hot-stones": 20,
            "cupping": 25,
            "cbd-oil": 20,
            "head-scalp": 10
          }
        }
      },
      {
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
        }
      },
      {
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
        }
      },
      {
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
        }
      },
      {
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
        }
      },
      {
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
        }
      }
    ];

    this.calculators.set(1, calculators[0]);
    this.calculators.set(2, calculators[1]);
    this.calculators.set(3, calculators[2]);
    this.calculators.set(4, calculators[3]);
    this.calculators.set(5, calculators[4]);
    this.calculators.set(6, calculators[5]);
    this.calculators.set(7, calculators[6]);
    this.calculators.set(8, calculators[7]);
    this.calculators.set(9, calculators[8]);
    this.calculators.set(10, calculators[9]);
    this.calculators.set(11, calculators[10]);
    this.calculators.set(12, calculators[11]);
    this.calculators.set(13, calculators[12]);
    this.calculators.set(14, calculators[13]);
    this.calculators.set(15, calculators[14]);
    this.calculators.set(16, calculators[15]);
    this.calculators.set(17, calculators[16]);
    this.calculators.set(18, calculators[17]);
    this.calculators.set(19, calculators[18]);
    this.calculators.set(20, calculators[19]);
    this.calculators.set(21, calculators[20]);
    this.calculators.set(22, calculators[21]);
    this.calculators.set(23, calculators[22]);
    this.calculators.set(24, calculators[23]);
    this.calculators.set(25, calculators[24]);
    this.calculators.set(26, calculators[25]);
    this.calculators.set(27, calculators[26]);
    this.calculators.set(28, calculators[27]);
    this.calculators.set(29, calculators[28]);
    this.calculators.set(30, calculators[29]);
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
      name: insertUser.name || null,
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
    return this.userCalculators.get(embedId);
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
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone || null,
      quoteData: insertLead.quoteData || {},
      estimatedValue: insertLead.estimatedValue || 0,
      status: insertLead.status || "new",
      createdAt: new Date(),
    };
    this.leads.set(lead.id, lead);
    return lead;
  }
}

export const storage = new MemStorage();
        description: "Calculate quotes for landscaping projects",
        defaultConfig: {
          basePrice: 500,
          squareFootRate: 2.5,
          factors: {
            complexity: { basic: 1.0, moderate: 1.3, complex: 1.8 },
            materials: { standard: 1.0, premium: 1.4, luxury: 2.0 }
          }
        }
      },
      {
        name: "Home Renovation AI Calculator",
        slug: "home-renovation",
        category: "home-services",
        description: "AI-powered home renovation quotes with natural language input",
        defaultConfig: {
          baseConsultation: 500,
          projectTypes: {
            "kitchen-remodel": { min: 6000, max: 15000 },
            "bathroom-remodel": { min: 4000, max: 10000 },
            "full-home": { min: 20000, max: 50000 },
            "flooring": { min: 2000, max: 8000 },
            "painting": { min: 1000, max: 5000 },
            "basement-conversion": { min: 8000, max: 20000 },
            "attic-renovation": { min: 5000, max: 15000 }
          },
          finishMultipliers: {
            "standard": 1.0,
            "premium": 1.2,
            "luxury": 1.35
          },
          extras: {
            "interior-design": 800,
            "project-management": 1200,
            "cleanup": 400,
            "permits": 350
          },
          timeframeSurcharges: {
            "flexible": 0,
            "3-months": 0,
            "asap": 500
          },
          promoCodes: {
            "LAUNCH10": 0.1,
            "NEWCLIENT": 0.15,
            "QUOTEKIT": 0.1
          }
        }
      },
      {
        name: "Boudoir Photography Calculator",
        slug: "boudoir-photography",
        category: "photography",
        description: "AI-powered boudoir photography quotes with natural language input",
        defaultConfig: {
          basePrice: 250,
          sessionTypes: {
            "classic": 0,
            "lingerie": 25,
            "nude": 50,
            "glamour": 30
          },
          durations: {
            "1hr": 0,
            "2hr": 75,
            "3hr": 150
          },
          locations: {
            "studio": 0,
            "location": 100,
            "hotel": 100
          },
          outfitPricing: {
            "1": 0,
            "2": 50,
            "3": 100,
            "4": 150,
            "5": 200
          },
          addOns: {
            "makeup": 60,
            "album": 120,
            "deluxe-retouching": 75
          },
          promoCodes: {
            "BOUDOIR10": 0.1,
            "NEWCLIENT": 0.15,
            "GODDESS": 0.2
          }
        }
      },
      {
        name: "Pest Control Services Calculator",
        slug: "pest-control",
        category: "home-services",
        description: "Professional pest control quotes for residential and commercial properties",
        defaultConfig: {
          baseVisit: 100,
          pestTypes: {
            "cockroaches": 75,
            "ants": 50,
            "wasps-bees": 100,
            "bedbugs": 250,
            "rodents": 150,
            "termites": 300,
            "general-prevention": 60
          },
          infestationLevels: {
            "light": 0,
            "moderate": 75,
            "severe": 150
          },
          propertyTypes: {
            "apartment": 1.0,
            "house": 1.2,
            "commercial": 1.5,
            "warehouse": 2.0
          },
          serviceTypes: {
            "one-time": 1.0,
            "monthly": 0.8,
            "quarterly": 0.9
          },
          addOns: {
            "eco-friendly": 40,
            "same-day": 80,
            "follow-up": 50,
            "pet-safe": 40
          },
          promoCodes: {
            "LAUNCH10": 0.1,
            "NEWCLIENT": 0.15,
            "PEST20": 0.2
          }
        }
      }
    ];

    defaultCalculators.forEach(calc => {
      const calculator: Calculator = {
        ...calc,
        id: this.currentCalculatorId++,
        description: calc.description || null,
        defaultConfig: calc.defaultConfig || null,
        createdAt: new Date()
      };
      this.calculators.set(calculator.id, calculator);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: crypto.randomUUID(),
      fullName: insertUser.fullName || null,
      subscriptionStatus: "free",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  // Calculators
  async getCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    return Array.from(this.calculators.values()).find(calc => calc.slug === slug);
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    return Array.from(this.calculators.values()).filter(calc => calc.category === category);
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const calculator: Calculator = {
      ...insertCalculator,
      id: this.currentCalculatorId++,
      description: insertCalculator.description || null,
      defaultConfig: insertCalculator.defaultConfig || null,
      createdAt: new Date()
    };
    this.calculators.set(calculator.id, calculator);
    return calculator;
  }

  // User Calculators
  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    return Array.from(this.userCalculators.values()).filter(uc => uc.userId === userId);
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    return Array.from(this.userCalculators.values()).find(uc => uc.embedId === embedId);
  }

  async createUserCalculator(insertUserCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const userCalculator: UserCalculator = {
      ...insertUserCalculator,
      id: crypto.randomUUID(),
      config: insertUserCalculator.config || null,
      isActive: true,
      createdAt: new Date()
    };
    this.userCalculators.set(userCalculator.id, userCalculator);
    return userCalculator;
  }

  // Leads
  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.userCalculatorId === userCalculatorId);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: crypto.randomUUID(),
      userCalculatorId: insertLead.userCalculatorId,
      name: insertLead.name || null,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      quoteData: insertLead.quoteData || null,
      estimatedValue: insertLead.estimatedValue || null,
      status: "new",
      createdAt: new Date()
    };
    this.leads.set(lead.id, lead);
    return lead;
  }
}

export const storage = new MemStorage();
