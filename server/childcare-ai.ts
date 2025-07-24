import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processChildcareRequest(input: string) {
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
- Care types: full-day (Full-Day Care), half-day (Half-Day Care), after-school (After-School Pickup), weekend (Weekend Care), overnight (Overnight Babysitting)
- Child ages: infant (0-1 years), toddler (1-3 years), preschooler (3-5 years), school-age (5-12 years)
- Days per week: 1-7 (as string)
- Number of children: 1-5 (as string)
- Add-ons: meals (Meals Provided), homework (Homework Help), special-needs (Special Needs Support)
- Subsidy: true/false for childcare subsidy or vouchers

Respond with JSON in this exact format:
{
  "careType": "string or null",
  "childAge": "string or null",
  "daysPerWeek": "string or null",
  "numberOfChildren": "string or null",
  "addOns": ["array of strings or empty array"],
  "hasSubsidy": "boolean or null"
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