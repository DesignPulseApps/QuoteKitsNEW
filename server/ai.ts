import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processCarWashRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for mobile car wash services and extracts structured data. 

Available options:
- Vehicle sizes: compact, sedan, suv, truck
- Service packages: exterior (exterior only), ext_int (exterior + interior), full_detail (full detail), showroom (showroom finish)
- Locations: home, work, other
- Urgency: rush (24 hours), normal (2-3 days), flexible
- Add-ons: engine (engine bay cleaning), pet_hair (pet hair removal), ceramic (ceramic coating), wax (wax & polish), headlight (headlight restoration)

Respond with JSON in this exact format:
{
  "vehicleSize": "string or null",
  "servicePackage": "string or null", 
  "serviceLocation": "string or null",
  "urgency": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processChauffeurRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for chauffeur and limousine services and extracts structured data.

Available options:
- Service types: airport (Airport Transfer), hourly (Hourly Hire), wedding (Wedding/Event), corporate (Corporate Booking)
- Vehicle types: sedan (Luxury Sedan), suv (Executive SUV), limo (Stretch Limousine), party_bus (Party Bus)
- Duration: 1hr (1 Hour), 2-4hr (2-4 Hours), 5hr+ (5+ Hours), full_day (Full Day)
- Add-ons: red_carpet (Red Carpet Service), champagne (Champagne & Refreshments), decorations (Wedding Decorations), extra_stops (Extra Stopovers)

Respond with JSON in this exact format:
{
  "serviceType": "string or null",
  "vehicleType": "string or null",
  "duration": "string or null", 
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processAirportTransferRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for airport transfer services and extracts structured data.

Available options:
- Destination airports: vie (Vienna International Airport), muc (Munich Airport), fra (Frankfurt Airport), zur (Zurich Airport), prg (Prague Airport), other (Other Airport)
- Vehicle types: economy (Economy Car), sedan (Executive Sedan), suv (SUV), van (Van), shuttle (Shuttle Bus)
- Passengers: number from 1-8
- Add-ons: baby_seat (Baby Seat), extra_luggage (Extra Luggage), meet_greet (Meet & Greet), flight_tracking (Flight Tracking)
- Return trip: true or false

Respond with JSON in this exact format:
{
  "destinationAirport": "string or null",
  "vehicleType": "string or null",
  "passengers": "number or null",
  "addOns": ["array of strings or empty array"],
  "returnTrip": "boolean or null"
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processVanRentalRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for van rental services and extracts structured data.

Available options:
- Rental types: cargo (Cargo Van), passenger (Passenger Van), luton (Luton/Box Van), camper (Campervan)
- Duration: half_day (Half Day), full_day (Full Day), weekend (Weekend), weekly (Weekly)
- Kilometre limits: 100 (100km/day), 200 (200km/day), unlimited (Unlimited)
- Extras: gps (GPS Navigation), baby_seat (Child/Baby Seat), trolley (Sack Trolley), extra_driver (Additional Driver), insurance (Insurance Upgrade)

Respond with JSON in this exact format:
{
  "rentalType": "string or null",
  "duration": "string or null",
  "kmLimit": "string or null",
  "extras": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processBoatCharterRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for boat charter services and extracts structured data.

Available options:
- Boat types: sailboat (Sailboat), catamaran (Catamaran), motor_yacht (Motor Yacht), speedboat (Speedboat), fishing_boat (Fishing Boat), party_boat (Party Boat)
- Duration: 2_hours (2 Hours), half_day (Half Day), full_day (Full Day), sunset (Sunset Cruise), multi_day (Multi-Day)
- Guests: number from 1-50+ as string
- Extras: captain_crew (Captain & Crew), catering (Catering / Drinks), water_toys (Water Toys), photographer (Photographer), dj_music (Live DJ / Music)

Respond with JSON in this exact format:
{
  "boatType": "string or null",
  "duration": "string or null",
  "guests": "string or null",
  "extras": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processMovingServicesRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for moving services and extracts structured data.

Available options:
- Moving types: local (Local Move), long_distance (Long Distance), international (International), office (Office Relocation)
- Property types: studio (Studio/1BR), 2br (2 Bedroom), 3br (3 Bedroom), 4br (4+ Bedroom), office_space (Office Space)
- Distance: local_short (Under 10 miles), local_medium (10-50 miles), regional (50-200 miles), long_distance (200+ miles)
- Extras: packing (Packing Services), unpacking (Unpacking Services), assembly (Furniture Assembly), storage (Storage Service), cleaning (Cleaning Service)

Respond with JSON in this exact format:
{
  "movingType": "string or null",
  "propertyType": "string or null",
  "distance": "string or null",
  "extras": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processMotorcycleRepairRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for motorcycle repair services and extracts structured data.

Available options:
- Bike types: cruiser (Cruiser), sportbike (Sportbike), touring (Touring), dirt_bike (Dirt Bike), scooter (Scooter / Moped), electric (Electric / Hybrid)
- Service types: maintenance (General Maintenance), engine (Engine Repair), brakes (Brake Replacement), tires (Tire Change), suspension (Suspension Service), electrical (Electrical Diagnostics)
- Urgency: standard (Standard), express (Express), emergency (Emergency)
- Add-ons: oil_change (Oil & Filter Change), chain (Chain Replacement), valves (Valve Adjustment), pickup (Pickup & Dropoff)

Respond with JSON in this exact format:
{
  "bikeType": "string or null",
  "serviceType": "string or null",
  "urgency": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processDrivingInstructorRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for driving instructor services and extracts structured data.

Available options:
- Transmission types: manual (Manual), automatic (Automatic)
- Lesson types: beginner (Beginner Package), intensive (Intensive Course), refresher (Refresher Lessons), test_prep (Test Preparation)
- Number of lessons: any number from 1-40 as string
- Pickup locations: instructor (Instructor's Location), student (Student Address)
- Add-ons: theory (Theory Support), mock_test (Mock Test), flexible_time (Evening/Weekend Lessons)

Respond with JSON in this exact format:
{
  "transmissionType": "string or null",
  "lessonType": "string or null",
  "numberOfLessons": "string or null",
  "pickupLocation": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processWebDesignerRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for web design services and extracts structured data.

Available options:
- Website types: landing (Landing Page), portfolio (Portfolio Site), business (Business Website), blog (Blog), ecommerce (E-Commerce)
- Page counts: 1-3 (1-3 Pages), 4-6 (4-6 Pages), 7-10 (7-10 Pages), 10+ (10+ Pages)
- Platforms: wordpress (WordPress), webflow (Webflow), squarespace (Squarespace), shopify (Shopify), custom (Custom HTML)
- Timeline: 2weeks (2 Weeks), 1month (1 Month), flexible (Flexible), urgent (Urgent - 7 days)
- Add-ons: logo (Logo Design), seo (SEO Setup), blog (Blog Integration), booking (Booking System), copywriting (Copywriting), ecommerce (E-Commerce Integration)

Respond with JSON in this exact format:
{
  "websiteType": "string or null",
  "pageCount": "string or null",
  "platform": "string or null",
  "timeline": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processMarketingConsultantRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for marketing consulting services and extracts structured data.

Available options:
- Marketing goals: traffic (Increase Website Traffic), social (Grow Social Media Audience), launch (Launch a New Product), branding (Improve Branding), leads (Generate Leads)
- Service focus: seo (SEO), ppc (Google Ads / PPC), social (Social Media Strategy), email (Email Marketing), branding (Branding & Positioning)
- Business sizes: solo (Solo / Startup), small (Small Business), medium (Mid-size), enterprise (Enterprise)
- Engagement types: audit (One-time Audit), monthly (Monthly Consulting), full (Full Strategy & Execution)
- Timeline: immediate (Immediate), month (Within a Month), flexible (Flexible), unsure (Not Sure Yet)
- Add-ons: content (Content Plan), competitor (Competitor Audit), analytics (Analytics Setup), automation (Marketing Automation), social_ads (Social Ads Management)

Respond with JSON in this exact format:
{
  "marketingGoal": "string or null",
  "serviceFocus": "string or null",
  "businessSize": "string or null",
  "engagementType": "string or null",
  "timeline": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processSEOAgencyRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for SEO agency services and extracts structured data.

Available options:
- Primary goals: ranking (Rank Higher on Google), local (Local SEO), vitals (Improve Core Web Vitals), content (Keyword Strategy & Blog Content), ecommerce (E-commerce SEO)
- Website sizes: small (1-5 Pages), medium (6-15 Pages), large (16-30 Pages), enterprise (30+ Pages)
- Technical audit: true or false
- Blog plans: 0 (No Blogging), 2 (2 Blogs/Month), 4 (4 Blogs/Month), 8 (8 Blogs/Month)
- Backlink campaigns: none (No Backlinks), basic (Basic 5 links/mo), pro (Pro 10 links/mo), premium (Premium 20+ links/mo)
- Add-ons: competitor (Competitor Analysis), keywords (Keyword Research Pack), speed (Site Speed Optimization), reporting (Monthly Reporting), landing (Landing Page Optimization)

Respond with JSON in this exact format:
{
  "primaryGoal": "string or null",
  "websiteSize": "string or null",
  "technicalAudit": "boolean or null",
  "blogPlan": "string or null",
  "backlinkCampaign": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processVideoEditorRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for video editing services and extracts structured data.

Available options:
- Project types: wedding (Wedding Video), youtube (YouTube Vlog), corporate (Corporate Promo), event (Event Recap), shortfilm (Short Film)
- Video durations: under2 (Under 2 mins), 2to5 (2-5 mins), 5to10 (5-10 mins), over10 (Over 10 mins)
- Footage provided: provided (Yes - Raw Files Provided), filming (No - Need Filming Too)
- Turnaround times: standard (Standard 5-7 Days), rush (Rush 48 Hours)
- Add-ons: graphics (Motion Graphics), grading (Color Grading), captions (Subtitles/Captions), music (Licensed Music), voiceover (Voiceover Sourcing)

Respond with JSON in this exact format:
{
  "projectType": "string or null",
  "videoDuration": "string or null",
  "footageProvided": "string or null",
  "turnaroundTime": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processCopywriterRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for copywriting services and extracts structured data.

Available options:
- Project types: website (Website Copy), blog (Blog Post), sales (Sales Page), product (Product Description), email (Email Sequence)
- Word counts: under500 (Under 500), 500to1000 (500-1,000), 1000to2000 (1,000-2,000), over2000 (Over 2,000)
- Tone of voice: professional (Professional), friendly (Friendly), persuasive (Persuasive), witty (Witty)
- Urgency: standard (Standard 5 days), express (Express 48 hours)
- Add-ons: keywords (Keyword Research), seo (SEO Optimization), competitor (Competitor Analysis), format (Upload-ready Format), revisions (Revisions Package)

Respond with JSON in this exact format:
{
  "projectType": "string or null",
  "wordCount": "string or null",
  "toneOfVoice": "string or null",
  "urgency": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processLegalAdvisorRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for legal advisor services and extracts structured data.

Available options:
- Service types: contract-drafting (Contract Drafting), business-setup (Business Setup Advice), family-law (Family Law Consultation), immigration (Immigration Services), estate-planning (Estate & Will Planning), ip-trademark (IP / Trademark Advice)
- Consultation types: 30min-call (Initial 30-min Call), 1hour-session (1-Hour Strategy Session), ongoing-retainer (Ongoing Retainer)
- Urgency levels: flexible (Flexible within 1-2 weeks), priority (Priority within 3 days), urgent (Urgent within 24h)
- Jurisdiction: local (Local / In-Country), international (International)
- Add-ons: document-review (Document Review), legal-summary (Written Legal Summary), email-support (Follow-up Email Support), in-person (In-person Meeting)

Respond with JSON in this exact format:
{
  "serviceType": "string or null",
  "consultationType": "string or null",
  "urgencyLevel": "string or null", 
  "jurisdiction": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processTaxPreparerRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for tax preparation services and extracts structured data.

Available options:
- Filing types: individual (Individual), married-joint (Married Joint), married-separate (Married Separate), business (Business / Self-Employed), llc (LLC), corporation (Corporation)
- Income levels: under-30k (Under €30k), 30k-70k (€30k–€70k), 70k-150k (€70k–€150k), over-150k (Over €150k)
- Number of forms: w2-only (W2 only), extra-1-3 (1–3 extra forms), extra-4-plus (4+ forms), investment-crypto (Investment / Crypto forms)
- Add-ons: audit-protection (Audit Protection), year-round-support (Year-Round Support), prior-year (Prior-Year Filing), in-person-review (In-Person Review Session), rush-filing (Rush Filing 48hr)

Respond with JSON in this exact format:
{
  "filingType": "string or null",
  "incomeLevel": "string or null",
  "formsCount": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processTranslationServicesRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for translation services and extracts structured data.

Available options:
- Service types: translation (Translation), proofreading (Proofreading), transcription (Transcription), subtitling (Subtitling), certified (Certified Translation)
- Source languages: en (English), de (German), es (Spanish), fr (French), it (Italian), pt (Portuguese), nl (Dutch), ru (Russian), zh (Chinese), ja (Japanese), ar (Arabic)
- Target languages: en (English), de (German), es (Spanish), fr (French), it (Italian), pt (Portuguese), nl (Dutch), ru (Russian), zh (Chinese), ja (Japanese), ar (Arabic)
- Document types: legal (Legal), marketing (Marketing), technical (Technical), academic (Academic), personal (Personal)
- Word counts: 0-500 (0–500 words), 500-1000 (500–1,000 words), 1000-5000 (1,000–5,000 words), 5000+ (5,000+ words)
- Urgency: standard (Standard 3–5 days), express (Express 48 hours), same-day (Same Day)
- Add-ons: certified-stamp (Certified Stamp), formatting (Formatting / Layout), extra-proofreading (Extra Proofreading)

Respond with JSON in this exact format:
{
  "serviceType": "string or null",
  "sourceLanguage": "string or null",
  "targetLanguage": "string or null",
  "documentType": "string or null",
  "wordCount": "string or null",
  "urgency": "string or null",
  "addOns": ["array of strings or empty array"]
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processCleaningServicesRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes customer requests for cleaning services and extracts structured data.

Available options:
- Cleaning types: regular (Regular / Weekly), deep-clean (Deep Clean), move-in-out (Move-in / Move-out), airbnb (Airbnb Turnaround), carpet (Carpet / Upholstery)
- Property sizes: studio (Studio), 1-bedroom (1 Bedroom), 2-bedroom (2 Bedroom), 3-bedroom (3 Bedroom), 4-bedroom (4+ Bedroom)
- Add-ons: windows (Window Cleaning), fridge (Inside Fridge), oven (Inside Oven), laundry (Laundry & Folding), balcony (Balcony / Patio)
- Frequency: one-time (One-time), weekly (Weekly), biweekly (Biweekly), monthly (Monthly)
- Urgency: standard (Standard 2–3 days), express (Express Next Day), emergency (Emergency Same Day)

Respond with JSON in this exact format:
{
  "cleaningType": "string or null",
  "propertySize": "string or null",
  "addOns": ["array of strings or empty array"],
  "frequency": "string or null",
  "urgency": "string or null"
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}

export async function processPrivateSchoolRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes parent requests for private school tuition and extracts structured data.

Available options:
- Grade levels: pre-k (Pre-K / Kindergarten), primary (Primary 1–5), middle (Middle School 6–8), high (High School 9–12)
- Enrollment types: full-time (Full-Time), part-time (Part-Time), boarding (Boarding), day-school (Day School)
- Sibling status: first (First Child), second (Second Child), third (Third+ Child)
- Add-ons: aftercare (After-School Care), lunch (Lunch Plan), transport (Transportation), ib-advanced (IB / Advanced Curriculum)
- Payment plans: annual (Annual), quarterly (Quarterly), monthly (Monthly)

Respond with JSON in this exact format:
{
  "gradeLevel": "string or null",
  "enrollmentType": "string or null",
  "siblingStatus": "string or null",
  "addOns": ["array of strings or empty array"],
  "paymentPlan": "string or null"
}`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error("Failed to process request");
  }
}