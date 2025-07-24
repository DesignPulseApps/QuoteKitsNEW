import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processChildcareServicesRequest(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes parent requests for childcare services and extracts structured data.

Available options:
- Age groups: infant (0-2 years), toddler (2-3 years), preschool (3-5 years), school-age (6-10 years)
- Schedules: full-time (5 days/week), part-time (3 days/week), after-school (after school only), holiday-care (holiday care)
- Duration: monthly, quarterly, annual
- Additional services: meals (Meals & Snacks), transport (Transportation), early-late (Early/Late Hours), learning-support (Learning Support)
- Number of children: 1, 2, 3, or 4

Respond with JSON in this exact format:
{
  "ageGroup": "string or null",
  "schedule": "string or null", 
  "duration": "string or null",
  "additionalServices": ["array of strings or empty array"],
  "numberOfChildren": "string or null"
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