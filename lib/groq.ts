export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Base helper function to invoke the Groq Chat Completions API.
 * Reusable for any future AI features.
 */
export async function generateGroqResponse(
  messages: GroqMessage[],
  model: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not defined.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Error in generateGroqResponse:', error);
    throw new Error(error.message || 'Failed to generate response from Groq API');
  }
}

/**
 * Reusable system prompt builder for luxury AuraAI responses.
 */
export function getLuxurySystemPrompt(userName: string, intent: string): string {
  return `You are Aura, the premium AI Beauty & Wellness Advisor for AuraAI, consulting for the client ${userName}.
Your tone is sophisticated, welcoming, expert, and aligned with high-end luxury wellness brands (e.g., Vogue, Kérastase).
Current active consultation context: ${intent}.

Core Guidelines:
1. Intelligent Beauty Consultant First: Prioritize helpful, education-focused beauty advice, style planning, skincare guidance, and haircare consultation. Avoid acting like a basic search query index.
2. Science-Based Accuracy: Provide accurate, dermatologically and trichologically sound information based on active ingredients (e.g., niacinamide, salicylic acid, retinoids), hair porosity, and contour shapes. Strictly avoid spreading unscientific statements, fearmongering, or common beauty myths (e.g., "daily hair washing causes hair loss," "products that permanently close pores," or "completely chemical-free" claims).
3. Explain Curated Options: If structured salon or service recommendations are provided to you, explain why they fit the query, budget, locality, or beauty profile. Do NOT mention salons/services that are not in the provided recommendation list.
4. Guidance-Only Behavior: If no structured recommendations are supplied, focus entirely on giving expert advice, planning, or style guidance. Do not try to invent or mock recommendations. Keep the response natural, conversational, and highly helpful.
5. Presentation: Keep responses concise, precise, and visually clean. Use double line breaks for paragraph separation and gentle bullet points for readability. Never output raw markdown blocks.`;
}

/**
 * Explain a set of structured recommendations using Groq.
 */
export async function explainRecommendations(
  userName: string,
  userQuery: string,
  intent: string,
  recommendations: any[],
  model?: string
): Promise<string> {
  const systemPrompt = getLuxurySystemPrompt(userName, intent);
  
  const recommendationsText = recommendations.length > 0
    ? recommendations.map((rec, idx) => {
        if (rec.type === 'service') {
          return `${idx + 1}. Service: "${rec.name}" at Salon: "${rec.salonName}"
             Price: ₹${rec.price} | Locality: ${rec.details}
             Why recommended: ${rec.reasons.join(', ')}`;
        } else {
          return `${idx + 1}. Salon: "${rec.name}"
             Locality: ${rec.location} | Match score: ${rec.matchScore}%
             Why recommended: ${rec.reasons.join(', ')}`;
        }
      }).join('\n\n')
    : 'None. No salon or service matches were requested or found.';

  const userPrompt = recommendations.length > 0
    ? `Client Query: "${userQuery}"
Detected Intent: "${intent}"

Structured Matches Found:
${recommendationsText}

Aura, please explain these recommendations to the client, explaining why they match their profile or search query.`
    : `Client Query: "${userQuery}"
Detected Intent: "${intent}"

No matching recommendations were requested or provided.
Aura, please answer the client's query directly as an expert beauty consultant. Provide scientific, helpful guidance, education, or style tips as appropriate, without recommending specific salons.`;

  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return generateGroqResponse(messages, model);
}
