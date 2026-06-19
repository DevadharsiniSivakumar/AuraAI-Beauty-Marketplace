import { NextResponse } from 'next/server';
import { detectIntent } from '../../../lib/intentDetector';
import { searchAndRank } from '../../../lib/searchEngine';
import { explainRecommendations } from '../../../lib/groq';
import { buildUserMemoryContext } from '../../../lib/userMemory';

export async function POST(request: Request) {
  try {
    const { message, userProfile, bookings, userMemory, beautyProfile } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'User message query is required.' }, { status: 400 });
    }

    const clientProfile = userProfile || { name: 'Guest' };
    const clientBookings = bookings || [];
    
    // Construct memoryContext integrating user memory and Beauty Profile Selfie Analysis details
    let memoryContext = userMemory ? buildUserMemoryContext(userMemory) : '';
    if (beautyProfile) {
      memoryContext += `\n\nClient Beauty Profile (Selfie Analysis):
* Face Shape: ${beautyProfile.faceShape}
* Hair Type: ${beautyProfile.hairType}
* Hair Density: ${beautyProfile.hairDensity || 'High'}
* Skin Tone: ${beautyProfile.skinTone}
* Skin Undertone: ${beautyProfile.undertone || 'Warm'}
* Hair Length: ${beautyProfile.hairLength}
* Beauty Summary: ${beautyProfile.beautySummary || ''}
* Recommended Hairstyles: ${beautyProfile.recommendedHairstyles?.join(', ')}
* Recommended Treatments: ${beautyProfile.recommendedTreatments?.join(', ')}
* Recommended Makeup Look: ${beautyProfile.recommendedMakeupStyles?.join(', ')}`;
    } else if (clientProfile.faceShape || clientProfile.hairType || clientProfile.skinTone) {
      memoryContext += `\n\nClient Beauty Profile:
* Face Shape: ${clientProfile.faceShape || 'Not analyzed'}
* Hair Type: ${clientProfile.hairType || 'Not analyzed'}
* Skin Tone: ${clientProfile.skinTone || 'Not analyzed'}`;
    }

    // 1. Intent Detection
    const parsedQuery = detectIntent(message);

    // 2. Search & Rank Recommendations (Only if salon search, comparison, booking or location is explicitly requested)
    const lowerQuery = message.toLowerCase();
    
    // Explicit requests for salon recommendations include: salon, outlet, place, where to, book, find, near, price/rates, vs/compare, etc.
    const isExplicitRecommendationQuery = 
      lowerQuery.includes('salon') ||
      lowerQuery.includes('outlet') ||
      lowerQuery.includes('place') ||
      lowerQuery.includes('where') ||
      lowerQuery.includes('book') ||
      lowerQuery.includes('find') ||
      lowerQuery.includes('near') ||
      lowerQuery.includes('rate') ||
      lowerQuery.includes('cost') ||
      lowerQuery.includes('price') ||
      lowerQuery.includes('fee') ||
      lowerQuery.includes('comparison') ||
      lowerQuery.includes('versus') ||
      lowerQuery.includes(' vs ');

    const isRecommendationRequested = 
      (parsedQuery.intent === 'service_search' ||
       parsedQuery.intent === 'salon_search' ||
       parsedQuery.intent === 'salon_comparison' ||
       parsedQuery.intent === 'booking_help') &&
      isExplicitRecommendationQuery;

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
        aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory, beautyProfile);
      }
    } else {
      console.warn('GROQ_API_KEY not found. Operating in local explanation fallback mode.');
      aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory, beautyProfile);
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
function generateLocalExplanation(
  userName: string, 
  intent: string, 
  recommendations: any[], 
  userMemory?: any,
  beautyProfile?: any
): string {
  const nameFirst = userName.split(' ')[0];
  
  // 1. Check if the user is asking for styling/planning insights and we don't have recommendations
  if (recommendations.length === 0) {
    if (intent === 'style_advice' || intent === 'beauty_planning') {
      const bp = beautyProfile || {
        faceShape: 'Oval',
        hairType: '2C Wavy',
        hairDensity: 'High',
        skinTone: 'Warm Honey / Olive',
        undertone: 'Warm',
        hairLength: 'Medium',
        recommendedHairstyles: ['Soft Shag Cut with Curtain Bangs', 'Long Layered Beach Waves'],
        recommendedTreatments: ['Advanced Hydra Facial', 'Kérastase Fusio-Dose Ritual'],
        recommendedMakeupStyles: ['Sun-kissed Golden Glow', 'Monochromatic Peach Look']
      };

      const densityText = bp.hairDensity ? `, ${bp.hairDensity.toLowerCase()}-density` : '';
      const undertoneText = bp.undertone ? `, ${bp.undertone.toLowerCase()} undertone` : '';
      let responseText = `Hello ${nameFirst}! Based on your ${bp.faceShape.toLowerCase()} face shape${undertoneText}${densityText} and ${bp.hairType.toLowerCase()} hair, I've compiled some specialized beauty insights for you:`;

      if (intent === 'style_advice') {
        responseText += `\n\n**Hairstyle Advice:**\nConsidering your ${bp.hairLength.toLowerCase()} hair, styles like **${bp.recommendedHairstyles.join(', ')}** would suit you beautifully by complementing your ${bp.faceShape.toLowerCase()} facial contour.
        
**Makeup Look Suggestions:**\nFor your ${bp.skinTone.toLowerCase()} skin tone, I suggest a **${bp.recommendedMakeupStyles.join(' or ')}** look to highlight your natural undertones.`;
      } else {
        responseText += `\n\n**Wedding & Event Preparation:**\nTo prep for a major event, we want to focus on high-performance hair and skin prep. Since you have a ${bp.skinTone.toLowerCase()} tone and ${bp.hairType.toLowerCase()} hair texture, I highly recommend starting with treatments like **${bp.recommendedTreatments.join(' and ')}** about 2-4 weeks prior to ensure your skin barrier is perfectly hydrated and your hair has maximum shine.`;
      }

      responseText += `\n\nLet me know if you would like me to find specific local salons or treatments in Bangalore that offer these services!`;
      return responseText;
    }
  }
  
  // Custom personalization prefix based on userMemory & beautyProfile
  let personalizationPrefix = '';
  const bp = beautyProfile;
  if (bp) {
    const densityText = bp.hairDensity ? `, ${bp.hairDensity.toLowerCase()}-density` : '';
    const undertoneText = bp.undertone ? `, with a ${bp.undertone.toLowerCase()} undertone` : '';
    personalizationPrefix += `considering your ${bp.faceShape.toLowerCase()} face contour${undertoneText} and ${bp.hairType.toLowerCase()}${densityText} hair type, `;
  } else if (userMemory) {
    const prefersSkincare = userMemory.preferredServices?.some((s: string) => 
      s.toLowerCase().includes('facial') || s.toLowerCase().includes('skin')
    );
    if (prefersSkincare) {
      personalizationPrefix += `since you highly rate skincare treatments like Hydra Facials, `;
    } else if (userMemory.preferredServices && userMemory.preferredServices.length > 0) {
      personalizationPrefix += `based on your previous bookings for ${userMemory.preferredServices[0]} treatments, `;
    }
  }
  
  if (userMemory && userMemory.averageBudget > 0) {
    const conjunction = personalizationPrefix ? 'and considering ' : 'considering ';
    personalizationPrefix += `${conjunction}your typical budget range of around ₹${userMemory.averageBudget}, `;
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
