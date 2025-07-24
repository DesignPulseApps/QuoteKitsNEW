import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processPrivateMedicalRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes patient requests for private medical consultations and extracts structured data.

Available options:
- Consultation types: general-gp (General GP Visit), specialist (Specialist Appointment), health-check (Health Check Package), second-opinion (Second Opinion), preventative-screening (Preventative Screening)
- Service categories: diagnostics (Diagnostics), preventative (Preventative), cosmetic (Cosmetic/Aesthetic), mental-health (Mental Health)
- Urgency: standard (Standard), same-day (Same-Day), priority (Priority)
- Add-ons: lab-tests (Lab Tests), basic-imaging (Basic Imaging), advanced-imaging (Advanced Imaging), medical-certificate (Medical Certificate), follow-up-call (Follow-Up Call)

Respond with JSON in this exact format:
{
  "consultationType": "string or null",
  "serviceCategory": "string or null",
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