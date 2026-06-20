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
        aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory, beautyProfile, message);
      }
    } else {
      console.warn('GROQ_API_KEY not found. Operating in local explanation fallback mode.');
      aiResponse = generateLocalExplanation(clientProfile.name, parsedQuery.intent, recommendations, userMemory, beautyProfile, message);
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
  beautyProfile?: any,
  userQuery?: string
): string {
  const nameFirst = userName.split(' ')[0];
  const bp = beautyProfile;
  const lowerQuery = userQuery ? userQuery.toLowerCase().trim() : '';

  // Check if the user is asking about performing a treatment at home, or expresses reluctance to visit a salon
  const isHomeQuery = lowerQuery.includes('home') || lowerQuery.includes('diy') || lowerQuery.includes('self') || lowerQuery.includes('myself') || lowerQuery.includes('remed');

  if (isHomeQuery) {
    let remedyText = '';
    let category = 'skin';
    if (lowerQuery.includes('hair') || lowerQuery.includes('scalp') || lowerQuery.includes('cut')) {
      category = 'hair';
    }

    if (category === 'hair') {
      remedyText = `You can certainly try some natural DIY alternatives at home for your hair, such as applying a warm coconut oil or argan oil mask, or using a mixture of fresh aloe vera gel and organic yogurt to soothe the scalp and smooth down hair cuticles.`;
    } else {
      remedyText = `You can certainly try some gentle, natural home remedies for your skin, such as applying a raw honey and organic yogurt mask to hydrate and soothe the epidermis, or using a warm oatmeal compress to calm minor redness.`;
    }

    const challengesText = category === 'hair'
      ? `However, achieving deep hair restructuring, structural damage repair, or precision styling at home is incredibly challenging. Without professional-grade bond builders (like Olaplex), localized steam rehydration hoods, and the experienced technique of a stylist, DIY attempts often fail to deliver long-term results and can lead to product buildup or uneven texture.`
      : `However, performing professional-grade facials or deep exfoliation at home is difficult and carries risks. Without specialized tools like clinical vortex suction, high-efficacy active ingredient serums, and sterile extraction techniques, DIY facial attempts can lead to skin barrier irritation, clogged pores, or even micro-tears in the skin.`;

    let recsText = '';
    if (recommendations.length > 0) {
      recsText = `To give your ${category === 'hair' ? 'hair' : 'skin'} the safe, expert treatment it deserves, I highly recommend considering these curated salon options:\n\n` + 
        recommendations.map((rec) => {
          if (rec.type === 'service') {
            return `• **${rec.name}** at *${rec.details}* (₹${rec.price}): Matches because it is ${rec.reasons.join(' & ').toLowerCase()}.`;
          } else {
            return `• **${rec.name}** in *${rec.details}* (${rec.matchScore}% match): Matches because it offers ${rec.reasons.join(' & ').toLowerCase()}.`;
          }
        }).join('\n') + `\n\nDid you know? Outlets like **Bodycraft Salon & Spa** offer premium doorstep home services, meaning you can get professional treatment in the comfort of your own home!`;
    } else {
      recsText = `For optimal safety and satisfying results, I suggest looking into professional salon treatments like a professional Hydra Facial or a scalp recovery spa, where experts can tailor the care to your specific hair/skin profile.`;
    }

    return `Hello ${nameFirst}! 

${remedyText}

${challengesText}

${recsText}

Let me know if you would like me to help you schedule a booking or compare these options!`;
  }

  // Custom personalization prefix based on userMemory & beautyProfile
  let personalizationPrefix = '';
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
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi ') || lowerQuery.includes('hey')) {
      return `Hello ${nameFirst}! I'm Aura, your personal AI Beauty & Wellness Concierge. How can I assist you with your beauty journey today? I can guide you on hairstyles, suggest skincare routines tailored to your profile, or help you find the best luxury salons in Bangalore.`;
    }
    if (lowerQuery.includes('how do you work') || lowerQuery.includes('what can you do') || lowerQuery.includes('who are you')) {
      return `Hello ${nameFirst}! I am Aura, your sophisticated AI Beauty Advisor. I analyze your unique Beauty Profile (such as your face shape, hair type, and skin tone) to recommend the most optimal treatments. I also scan premium wellness salons in Bangalore to match your budget and locality preferences. Simply ask me for style advice, salon recommendations, or to compare treatments!`;
    }
    if (lowerQuery.includes('dry skin') || lowerQuery.includes('acne') || lowerQuery.includes('glow') || lowerQuery.includes('facial')) {
      return `Hello ${nameFirst}! For glowing and healthy skin, maintaining your skin barrier is essential. I suggest focusing on hydrating ingredients like hyaluronic acid, niacinamide, and ceramides. Professional facials (like a Hydra Facial) are highly effective because they use advanced vortex suction and serum infusion that cannot be replicated at home. Let me know if you'd like me to find top-rated skincare treatments in your area!`;
    }
    if (lowerQuery.includes('hair') || lowerQuery.includes('dandruff') || lowerQuery.includes('frizz')) {
      return `Hello ${nameFirst}! Healthy hair starts with scalp care and structural hydration. If you are experiencing frizz or damage, treatments like Keratin infusions or deep conditioning bond builders work wonders. Since home styling can sometimes lead to heat damage, professional stylists can safely restore your hair's natural strength. Let me know if you would like me to recommend a specialist salon in Bangalore!`;
    }

    if (intent === 'style_advice' || intent === 'beauty_planning') {
      const bpData = bp || {
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

      const densityText = bpData.hairDensity ? `, ${bpData.hairDensity.toLowerCase()}-density` : '';
      const undertoneText = bpData.undertone ? `, ${bpData.undertone.toLowerCase()} undertone` : '';
      let responseText = `Hello ${nameFirst}! Based on your ${bpData.faceShape.toLowerCase()} face shape${undertoneText}${densityText} and ${bpData.hairType.toLowerCase()} hair, I've compiled some specialized beauty insights for you:`;

      if (intent === 'style_advice') {
        responseText += `\n\n**Hairstyle Advice:**\nConsidering your ${bpData.hairLength.toLowerCase()} hair, styles like **${bpData.recommendedHairstyles.join(', ')}** would suit you beautifully by complementing your ${bpData.faceShape.toLowerCase()} facial contour.
        
**Makeup Look Suggestions:**\nFor your ${bpData.skinTone.toLowerCase()} skin tone, I suggest a **${bpData.recommendedMakeupStyles.join(' or ')}** look to highlight your natural undertones.`;
      } else {
        responseText += `\n\n**Wedding & Event Preparation:**\nTo prep for a major event, we want to focus on high-performance hair and skin prep. Since you have a ${bpData.skinTone.toLowerCase()} tone and ${bpData.hairType.toLowerCase()} hair texture, I highly recommend starting with treatments like **${bpData.recommendedTreatments.join(' and ')}** about 2-4 weeks prior to ensure your skin barrier is perfectly hydrated and your hair has maximum shine.`;
      }

      responseText += `\n\nLet me know if you would like me to find specific local salons or treatments in Bangalore that offer these services!`;
      return responseText;
    }

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
