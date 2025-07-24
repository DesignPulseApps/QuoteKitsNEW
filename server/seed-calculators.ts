import { db } from "./db";
import { calculators } from "@shared/schema";

const calculatorTemplates = [
  {
    name: "Car Wash Service",
    slug: "car-wash",
    category: "Automotive",
    description: "Professional car wash and detailing services",
    defaultConfig: {
      serviceTypes: ["Basic Wash", "Premium Wash", "Full Detail"],
      vehicleTypes: ["Sedan", "SUV", "Truck", "Motorcycle"],
      addOns: ["Wax", "Interior Detail", "Engine Clean"],
      basePrice: 25,
      premiumMultiplier: 1.5,
      detailMultiplier: 2.5
    }
  },
  {
    name: "Home Renovation",
    slug: "home-renovation",
    category: "Home Services",
    description: "Complete home renovation and remodeling estimates",
    defaultConfig: {
      projectTypes: ["Kitchen", "Bathroom", "Living Room", "Full House"],
      squareFootage: [500, 1000, 2000, 3000],
      finishLevels: ["Budget", "Standard", "Premium", "Luxury"],
      basePrice: 50,
      multipliers: { Budget: 1, Standard: 1.5, Premium: 2, Luxury: 3 }
    }
  },
  {
    name: "Photography Session",
    slug: "photography",
    category: "Creative Services",
    description: "Professional photography session quotes",
    defaultConfig: {
      sessionTypes: ["Portrait", "Wedding", "Event", "Product"],
      durations: ["1 hour", "2 hours", "4 hours", "Full day"],
      deliveryOptions: ["Digital", "Prints", "Album"],
      basePrice: 150,
      hourlyRate: 100
    }
  },
  {
    name: "Legal Consultation",
    slug: "legal-advisor",
    category: "Professional Services",
    description: "Legal consultation and advisory services",
    defaultConfig: {
      serviceTypes: ["Consultation", "Document Review", "Representation"],
      practiceAreas: ["Family", "Business", "Real Estate", "Criminal"],
      complexity: ["Simple", "Moderate", "Complex"],
      hourlyRate: 250,
      minimumHours: 1
    }
  },
  {
    name: "Cleaning Services",
    slug: "cleaning-services",
    category: "Home Services", 
    description: "Professional cleaning service estimates",
    defaultConfig: {
      serviceTypes: ["Regular Cleaning", "Deep Cleaning", "Move-out Cleaning"],
      frequency: ["One-time", "Weekly", "Bi-weekly", "Monthly"],
      homeSize: ["1 bedroom", "2 bedroom", "3 bedroom", "4+ bedroom"],
      basePrice: 80,
      deepCleanMultiplier: 1.5,
      frequencyDiscounts: { Weekly: 0.9, "Bi-weekly": 0.95, Monthly: 1 }
    }
  }
];

export async function seedCalculators() {
  try {
    console.log("Seeding calculator templates...");
    
    for (const calculator of calculatorTemplates) {
      await db.insert(calculators).values(calculator).onConflictDoNothing();
    }
    
    console.log("Calculator templates seeded successfully!");
  } catch (error) {
    console.error("Error seeding calculators:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedCalculators().then(() => process.exit(0));
}