import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processPlasticSurgeryRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes patient requests for plastic surgery procedures and extracts structured data.

Available options:
- Procedures: rhinoplasty (Rhinoplasty/Nose Job), breast-augmentation (Breast Augmentation), liposuction (Liposuction), facelift (Facelift), tummy-tuck (Tummy Tuck), eyelid-surgery (Eyelid Surgery)
- Anesthesia: local (Local Anesthesia), general (General Anesthesia)
- Additional treatments: fat-transfer (Fat Transfer), injectables (Injectables), aftercare-package (Aftercare Package), compression-garments (Compression Garments)
- Hospital stay: none (Outpatient), 1-night (1 Night), 2-nights (2+ Nights)
- Consultation: in-person (In-Person), online (Online)

Respond with JSON in this exact format:
{
  "procedure": "string or null",
  "anesthesiaType": "string or null",
  "additionalTreatments": ["array of strings or empty array"],
  "hospitalStay": "string or null",
  "consultationType": "string or null"
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