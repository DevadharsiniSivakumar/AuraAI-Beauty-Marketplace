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
  model: string = 'llama-3.3-70b-versatile',
  maxTokens: number = 800,
  responseFormat?: { type: 'json_object' }
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
        max_tokens: maxTokens,
        ...(responseFormat ? { response_format: responseFormat } : {})
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
export function getLuxurySystemPrompt(userName: string, intent: string, memoryContext?: string): string {
  const memorySection = memoryContext
    ? `\n\nClient Preference & Booking History Memory Profile:\n${memoryContext}\n`
    : '';

  return `You are Aura, the premium AI Beauty & Wellness Advisor for AuraAI, consulting for the client ${userName}.
Your tone is sophisticated, welcoming, expert, and aligned with high-end luxury wellness brands (e.g., Vogue, Kérastase).
Current active consultation context: ${intent}.${memorySection}

Core Guidelines:
1. Intelligent Beauty Consultant First: Prioritize helpful, education-focused beauty advice, style planning, skincare guidance, and haircare consultation. Avoid acting like a basic search query index.
2. Personalization Integration: Using the memory profile (if provided), naturally reference past history (e.g., "Based on your previous bookings...", "Since you highly rated...", "You usually prefer...", "Considering your typical budget range...") without forcing it or sounding repetitive.
3. Science-Based Accuracy: Provide accurate, dermatologically and trichologically sound information based on active ingredients (e.g., active acids, niacinamide, vitamins, retinoids), hair type, and skin tone. Strictly avoid spreading unscientific statements, fearmongering, or common beauty myths.
4. Explain Curated Options: If structured salon or service recommendations are provided to you, explain why they fit the query, budget, locality, or beauty profile. Do NOT mention salons/services that are not in the provided recommendation list.
5. Guidance-Only Behavior: If no structured recommendations are supplied, focus entirely on giving expert advice, planning, or style guidance. Do not try to invent or mock recommendations. Keep the response natural, conversational, and highly helpful.
6. Presentation: Keep responses concise, precise, and visually clean. Use double line breaks for paragraph separation and gentle bullet points for readability. Never output raw markdown blocks.`;
}

/**
 * Explain a set of structured recommendations using Groq.
 */
export async function explainRecommendations(
  userName: string,
  userQuery: string,
  intent: string,
  recommendations: any[],
  memoryContext?: string,
  model?: string
): Promise<string> {
  const systemPrompt = getLuxurySystemPrompt(userName, intent, memoryContext);
  
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

/**
 * Local fallback generator for Beauty Journeys in case the Groq API is offline/not configured.
 */
export function generateLocalJourneyFallback(userGoal: string): any {
  const goalLower = userGoal.toLowerCase();
  
  if (goalLower.includes('wed') || goalLower.includes('marri') || goalLower.includes('brid') || goalLower.includes('groom')) {
    return {
      journeyType: 'Bridal',
      durationDays: 45,
      steps: [
        {
          stepNumber: 1,
          title: 'Initial Consultation & Detox',
          description: 'Evaluate skin barrier and hair porosity. Start with a calming hair treatment and hydrating skin routine.',
          timeline: 'Day 45 (6 Weeks Out)',
          recommendedService: 'Advanced Hydra Facial'
        },
        {
          stepNumber: 2,
          title: 'Deep Exfoliation & Nourishment',
          description: 'Focus on brightening skin and repairing dry hair strands with protein moisture infusions.',
          timeline: 'Day 30 (4 Weeks Out)',
          recommendedService: 'Olaplex Hair Treatment'
        },
        {
          stepNumber: 3,
          title: 'Rejuvenation & Care',
          description: 'Soften hands and feet. Perform final deep hydration hair treatments to lock in shine.',
          timeline: 'Day 15 (2 Weeks Out)',
          recommendedService: 'Manicure & Pedicure'
        },
        {
          stepNumber: 4,
          title: 'The Final Bridal Glow',
          description: 'Gentle hydrating facial mask to prep for perfect makeup application. Avoid intensive treatments now.',
          timeline: 'Day 3 (3 Days Out)',
          recommendedService: 'Rose Gold Shimmer Facial'
        }
      ]
    };
  }

  if (goalLower.includes('part') || goalLower.includes('event') || goalLower.includes('week') || goalLower.includes('birthday')) {
    return {
      journeyType: 'Event Prep',
      durationDays: 7,
      steps: [
        {
          stepNumber: 1,
          title: 'Deep Cleansing & Exfoliation',
          description: 'Clear the skin canvas of impurities using gentle hydration to prevent event-day congestion.',
          timeline: 'Day 7 (1 Week Out)',
          recommendedService: 'Advanced Hydra Facial'
        },
        {
          stepNumber: 2,
          title: 'Hair Rehydration & Styling Prep',
          description: 'Steam-hydrate hair fibers to optimize shine and volume for your event-day hairstyle.',
          timeline: 'Day 3 (3 Days Out)',
          recommendedService: 'Hair Spa'
        },
        {
          stepNumber: 3,
          title: 'Manicure & Pedicure Grooming',
          description: 'Clean, shape, and paint nails to match your event outfit perfectly.',
          timeline: 'Day 1 (1 Day Out)',
          recommendedService: 'Manicure & Pedicure'
        }
      ]
    };
  }

  if (goalLower.includes('vacation') || goalLower.includes('trip') || goalLower.includes('travel') || goalLower.includes('beach') || goalLower.includes('holiday')) {
    return {
      journeyType: 'Vacation Glow-Up',
      durationDays: 14,
      steps: [
        {
          stepNumber: 1,
          title: 'Hydration Barrier Defense',
          description: 'Prep skin to handle changing climates and UV rays with intensive hydration and antioxidants.',
          timeline: '14 Days Out',
          recommendedService: 'Advanced Hydra Facial'
        },
        {
          stepNumber: 2,
          title: 'Smooth & Glow Exfoliation',
          description: 'A full body scrub and waxing to get summer-ready skin that glows in photos.',
          timeline: '7 Days Out',
          recommendedService: 'Deep Tissue Massage'
        },
        {
          stepNumber: 3,
          title: 'Fresh Trim & Color Refresh',
          description: 'Clean hair ends and optional light gloss/color to keep hair vibrant and resilient in the sun.',
          timeline: '2 Days Out',
          recommendedService: 'Hair Color & Blow Dry'
        }
      ]
    };
  }

  if (goalLower.includes('hair') || goalLower.includes('scalp') || goalLower.includes('dandruff') || goalLower.includes('damage')) {
    return {
      journeyType: 'Hair Recovery',
      durationDays: 30,
      steps: [
        {
          stepNumber: 1,
          title: 'Scalp Exfoliation & Detox',
          description: 'Clear hair follicles of styling buildup and sebum to support healthy hair growth.',
          timeline: 'Week 1',
          recommendedService: 'Hair Spa'
        },
        {
          stepNumber: 2,
          title: 'Internal Bond Restoration',
          description: 'Apply active bond rebuilding treatments to dry and brittle shafts to reduce breakage.',
          timeline: 'Week 2',
          recommendedService: 'Olaplex Hair Treatment'
        },
        {
          stepNumber: 3,
          title: 'Cuticle Scaling & Shine Seal',
          description: 'Seal moisture inside the hair shaft with a keratin treatment to combat humidity and frizz.',
          timeline: 'Week 4',
          recommendedService: 'Keratin Hair Treatment'
        }
      ]
    };
  }

  if (goalLower.includes('skin') || goalLower.includes('glow') || goalLower.includes('acne') || goalLower.includes('face') || goalLower.includes('facial') || goalLower.includes('pigment')) {
    return {
      journeyType: 'Skin Recovery',
      durationDays: 30,
      steps: [
        {
          stepNumber: 1,
          title: 'Exfoliate & Resurface',
          description: 'Exfoliate dead surface cells using enzymes to boost cellular turnover and clear the path for moisture.',
          timeline: 'Week 1',
          recommendedService: 'Advanced Hydra Facial'
        },
        {
          stepNumber: 2,
          title: 'Deep Skin Barrier Nourishment',
          description: 'Rebuild natural moisture lipids using vitamin infusions and a calming mask to soothe irritation.',
          timeline: 'Week 2',
          recommendedService: 'Rose Gold Shimmer Facial'
        },
        {
          stepNumber: 3,
          title: 'Maintenance & Glow Seal',
          description: 'Protect the glow. Lock in moisture with hyaluronic acid booster therapy.',
          timeline: 'Week 4',
          recommendedService: 'Advanced Hydra Facial'
        }
      ]
    };
  }

  // General Maintenance Default
  return {
    journeyType: 'Maintenance',
    durationDays: 30,
    steps: [
      {
        stepNumber: 1,
        title: 'Monthly Skincare Reset',
        description: 'Deep cleanse and hydrate skin to keep pores clear and texture refined.',
        timeline: 'Week 1',
        recommendedService: 'Advanced Hydra Facial'
      },
      {
        stepNumber: 2,
        title: 'Stress Relief & Drainage',
        description: 'Relieve muscle tightness in shoulder and back to improve blood flow and skin oxygenation.',
        timeline: 'Week 2',
        recommendedService: 'Deep Tissue Massage'
      },
      {
        stepNumber: 3,
        title: 'Hand & Foot Grooming',
        description: 'Moisturize cuticles, trim nails, and scrub away calluses to maintain neatness.',
        timeline: 'Week 4',
        recommendedService: 'Manicure & Pedicure'
      }
    ]
  };
}

/**
 * Generate a personalized, structured beauty journey plan via Groq.
 */
export async function generateAiJourneyPlan(
  userGoal: string,
  userName: string,
  memoryContext?: string
): Promise<string> {
  const systemPrompt = `You are Aura, the expert Beauty & Wellness Journey Planner.
Your task is to create a structured, scientific, and highly personalized beauty timeline based on the user's goal.
You MUST respond with a single valid JSON object. Do not include any other text, markdown wrapper (like \`\`\`json), or conversational preamble.

The JSON object must match this schema:
{
  "journeyType": "Bridal" | "Event Prep" | "Vacation Glow-Up" | "Hair Recovery" | "Skin Recovery" | "Maintenance",
  "durationDays": number,
  "steps": [
    {
      "stepNumber": number,
      "title": string,
      "description": string,
      "timeline": string,
      "recommendedService": string
    }
  ]
}

Guidelines:
1. Journey type should be one of the listed values. Pick the best match.
2. Formulate 3 to 6 logical chronological steps.
3. Steps should outline specific treatments or procedures, detailing the scientific reason or expert advice in "description".
4. Recommended services should be generic, premium wellness service names that are searchable (e.g. "Advanced Hydra Facial", "Hair Spa", "Pedicure", "Balayage Hair Color", etc.).
5. Incorporate user memory context (preferred categories, budget level, or skin/hair preferences) if provided.`;

  const userPrompt = `Client: ${userName}
Goal: "${userGoal}"
${memoryContext ? `Memory Context: ${memoryContext}` : ''}`;

  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return generateGroqResponse(messages, 'llama-3.3-70b-versatile', 1500, { type: 'json_object' });
}
