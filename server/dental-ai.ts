import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processDentistRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes patient requests for dental treatments and extracts structured data.

Available options:
- Treatment types: dental-implant-single (Single Implant), dental-implant-multiple (Multiple Implants), veneers-single (Single Veneer), veneers-full (Full Set Veneers), invisalign (Invisalign/Braces), teeth-whitening (Teeth Whitening), cleaning (Dental Cleaning), root-canal (Root Canal)
- Urgency: regular (Regular Booking), express (Express 48h), virtual (Virtual Consultation)
- Add-ons: xray-3d (3D X-Ray), sedation (Sedation), care-package (Care Package)
- Payment plans: full (Pay in Full), monthly (Monthly Plan), quarterly (Quarterly Plan)

Respond with JSON in this exact format:
{
  "treatmentType": "string or null",
  "treatmentCount": "string or null",
  "urgency": "string or null", 
  "addOns": ["array of strings or empty array"],
  "paymentPlan": "string or null",
  "insurance": "boolean or null"
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