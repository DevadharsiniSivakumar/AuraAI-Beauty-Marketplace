import { NextResponse } from 'next/server';
import { detectIntent } from '../../../lib/intentDetector';
import { searchAndRank } from '../../../lib/searchEngine';
import { explainRecommendations } from '../../../lib/groq';
import { buildUserMemoryContext } from '../../../lib/userMemory';

export async function POST(request: Request) {
  try {
    const { message, userProfile, bookings, userMemory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'User message query is required.' }, { status: 400 });
    }

    const clientProfile = userProfile || { name: 'Guest' };
    const clientBookings = bookings || [];
    const memoryContext = userMemory ? buildUserMemoryContext(userMemory) : '';

    // 1. Intent Detection
    const parsedQuery = detectIntent(message);

    // 2. Search & Rank Recommendations (Only if recommendation, salon search, or booking is explicitly requested)
    const lowerQuery = message.toLowerCase();
    const isRecommendationRequested = 
      parsedQuery.intent === 'service_search' ||
      parsedQuery.intent === 'salon_search' ||
      parsedQuery.intent === 'salon_comparison' ||
      lowerQuery.includes('recommend') ||
      lowerQuery.includes('suggest') ||
      lowerQuery.includes('where') ||
      lowerQuery.includes('book') ||
      lowerQuery.includes('find') ||
      lowerQuery.includes('salon') ||
      lowerQuery.includes('outlet') ||
      lowerQuery.includes('place');

    const recommendations = isRecommendationRequested
      ? await searchAndRank(parsedQuery, clientProfile, clientBookings)
      : [];

    // 3. Generate Groq Narrative Explanation
    let aiResponse = '';
    const hasApiKey = !!process.env.GROQ_API_KEY;

    if (hasApiKey) {
      try {
        aiResponse = await explainRecommendations(
          clientProfile.name,
          message,
          parsedQuery.intent,
          recommendations,
          memoryContext
        );
      } catch (apiError: any) {
        console.error('Groq API Error, falling back to simulated explanation:', apiError);
        aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory);
      }
    } else {
      console.warn('GROQ_API_KEY not found. Operating in local explanation fallback mode.');
      aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory);
    }

    return NextResponse.json({
      intent: parsedQuery.intent,
      recommendations,
      response: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

  } catch (error: any) {
    console.error('Error in concierge API handler:', error);
    return NextResponse.json({ 
      error: 'An internal error occurred while processing your request.',
      details: error.message || String(error)
    }, { status: 500 });
  }
}

/**
 * Fallback local description generator in case of missing keys or network errors.
 */
function generateLocalExplanation(userName: string, intent: string, recommendations: any[], userMemory?: any): string {
  const nameFirst = userName.split(' ')[0];
  
  // Custom personalization prefix based on userMemory
  let personalizationPrefix = '';
  if (userMemory) {
    const prefersSkincare = userMemory.preferredServices?.some((s: string) => 
      s.toLowerCase().includes('facial') || s.toLowerCase().includes('skin')
    );
    if (prefersSkincare) {
      personalizationPrefix += `since you highly rate skincare treatments like Hydra Facials, `;
    } else if (userMemory.preferredServices && userMemory.preferredServices.length > 0) {
      personalizationPrefix += `based on your previous bookings for ${userMemory.preferredServices[0]} treatments, `;
    }
    
    if (userMemory.averageBudget > 0) {
      const conjunction = personalizationPrefix ? 'and considering ' : 'considering ';
      personalizationPrefix += `${conjunction}your typical budget range of around ₹${userMemory.averageBudget}, `;
    }
    
    const luxuryScore = userMemory.preferredCategories?.find((c: any) => c.category === 'Luxury')?.score || 0;
    if (luxuryScore > 0 && !personalizationPrefix.includes('skincare')) {
      const conjunction = personalizationPrefix ? 'as well as ' : '';
      personalizationPrefix += `${conjunction}your preference for luxury salons, `;
    }
  }
  
  if (personalizationPrefix) {
    personalizationPrefix = personalizationPrefix.trim();
    if (!personalizationPrefix.endsWith(',')) {
      personalizationPrefix += ',';
    }
    personalizationPrefix = personalizationPrefix.charAt(0).toUpperCase() + personalizationPrefix.slice(1) + ' ';
  }

  if (recommendations.length === 0) {
    return `Hello ${nameFirst}, ${personalizationPrefix || 'I scanned our beauty catalog for treatments matching your request, '}but could not find matching results. 

Try broadening your search term or neighborhood preference, and I'll find alternative wellness outlets for you.`;
  }

  const recsBrief = recommendations.map((rec) => {
    if (rec.type === 'service') {
      return `• **${rec.name}** at *${rec.details}* (₹${rec.price}): Matches because it is ${rec.reasons.join(' & ').toLowerCase()}.`;
    } else {
      return `• **${rec.name}** in *${rec.details}* (${rec.matchScore}% match): Matches because it offers ${rec.reasons.join(' & ').toLowerCase()}.`;
    }
  }).join('\n');

  const greeting = personalizationPrefix 
    ? `Hello ${nameFirst}! ${personalizationPrefix}here are the personalized recommendation highlights I compiled for you:`
    : `Hello ${nameFirst}! Here are the personalized recommendation highlights I compiled for you:`;

  return `${greeting}

${recsBrief}

We recommend reserving a slot through our online scheduler to secure premium timing. Let me know if you would like me to compare rates or look in other locations!`;
}
