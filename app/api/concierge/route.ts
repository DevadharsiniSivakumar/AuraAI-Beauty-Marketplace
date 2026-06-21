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
      lowerQuery.includes('compare') ||
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

    // Check if comparison is requested
    const isComparisonDetected = 
      parsedQuery.intent === 'salon_comparison' || 
      lowerQuery.includes('compare') || 
      lowerQuery.includes('versus') || 
      lowerQuery.includes(' vs ');

    let comparison = undefined;
    if (isComparisonDetected) {
      try {
        const { getSalonsAndServices } = await import('../../../lib/searchEngine');
        const { generateComparisonMetrics } = await import('../../../lib/analyticsEngine');
        
        // Retrieve salons to compare
        const allSalons = await getSalonsAndServices();
        let targetSalons = allSalons;
        
        if (parsedQuery.queriedSalons.length > 0) {
          targetSalons = allSalons.filter(s => parsedQuery.queriedSalons.includes(s.id));
        } else if (recommendations.length > 0) {
          const recIds = recommendations.map(r => r.salonId || r.id);
          targetSalons = allSalons.filter(s => recIds.includes(s.id));
        }
        
        // If targetSalons has less than 2, default to top-rated ones for comparison
        if (targetSalons.length < 2) {
          targetSalons = allSalons.slice(0, 2);
        }
        
        const metrics = generateComparisonMetrics(targetSalons);
        const hasApiKey = !!process.env.GROQ_API_KEY;
        
        if (hasApiKey) {
          try {
            const { generateSalonComparison } = await import('../../../lib/groq');
            const compResponseStr = await generateSalonComparison(message, metrics, memoryContext);
            comparison = JSON.parse(compResponseStr);
          } catch (apiErr) {
            console.error('Groq comparison failed, falling back to local fallback:', apiErr);
            comparison = generateLocalComparisonFallback(targetSalons, message);
          }
        } else {
          comparison = generateLocalComparisonFallback(targetSalons, message);
        }
      } catch (err) {
        console.error('Error generating comparison in concierge route:', err);
      }
    }

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
      comparison,
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

  // 1. Basic greetings & how-it-works responses (non-beauty/non-treatment queries)
  const isGreeting = lowerQuery.includes('hello') || lowerQuery.includes('hi ') || lowerQuery.includes('hey') || lowerQuery === 'hi' || lowerQuery === 'hello';
  const isInfoQuery = lowerQuery.includes('how do you work') || lowerQuery.includes('what can you do') || lowerQuery.includes('who are you');

  if (isGreeting) {
    return `Hello ${nameFirst}! I'm Aura, your personal AI Beauty & Wellness Concierge. How can I assist you with your beauty journey today? I can guide you on hairstyles, suggest skincare routines tailored to your profile, or help you find the best luxury salons.`;
  }
  if (isInfoQuery) {
    return `Hello ${nameFirst}! I am Aura, your sophisticated AI Beauty Advisor. I analyze your unique Beauty Profile (such as your face shape, hair type, and skin tone) to recommend the most optimal treatments. I also scan premium wellness salons to match your budget and locality preferences. Simply ask me for style advice, salon recommendations, or to compare treatments!`;
  }

  // 2. Identify Category: Hair vs. Skin vs. Wedding Prep vs. General
  let category: 'hair' | 'skin' | 'wedding' | 'general' = 'general';
  if (lowerQuery.includes('hair') || lowerQuery.includes('scalp') || lowerQuery.includes('cut') || lowerQuery.includes('dandruff') || lowerQuery.includes('frizz') || lowerQuery.includes('bald') || lowerQuery.includes('fall') || lowerQuery.includes('styling') || lowerQuery.includes('shag') || lowerQuery.includes('wave') || lowerQuery.includes('curl') || lowerQuery.includes('colour') || lowerQuery.includes('color')) {
    category = 'hair';
  } else if (lowerQuery.includes('skin') || lowerQuery.includes('acne') || lowerQuery.includes('glow') || lowerQuery.includes('facial') || lowerQuery.includes('tan') || lowerQuery.includes('blackhead') || lowerQuery.includes('pore') || lowerQuery.includes('peel') || lowerQuery.includes('face') || lowerQuery.includes('undertone')) {
    category = 'skin';
  } else if (lowerQuery.includes('wed') || lowerQuery.includes('marri') || lowerQuery.includes('brid') || lowerQuery.includes('groom') || lowerQuery.includes('event') || lowerQuery.includes('party')) {
    category = 'wedding';
  }

  // Build Personalized Prefix context based on Beauty Profile/Memory
  let personalizationPrefix = '';
  if (bp) {
    const densityText = bp.hairDensity ? `, ${bp.hairDensity.toLowerCase()}-density` : '';
    const undertoneText = bp.undertone ? `, with a ${bp.undertone.toLowerCase()} undertone` : '';
    personalizationPrefix += `Considering your ${bp.faceShape.toLowerCase()} face contour${undertoneText} and ${bp.hairType.toLowerCase()}${densityText} hair type, `;
  } else if (userMemory) {
    const prefersSkincare = userMemory.preferredServices?.some((s: string) => 
      s.toLowerCase().includes('facial') || s.toLowerCase().includes('skin')
    );
    if (prefersSkincare) {
      personalizationPrefix += `Since you highly rate skincare treatments like Hydra Facials, `;
    } else if (userMemory.preferredServices && userMemory.preferredServices.length > 0) {
      personalizationPrefix += `Based on your previous bookings for ${userMemory.preferredServices[0]} treatments, `;
    }
  }

  if (userMemory && userMemory.averageBudget > 0) {
    const conjunction = personalizationPrefix ? 'and considering ' : 'Considering ';
    personalizationPrefix += `${conjunction}your typical budget range of around ₹${userMemory.averageBudget}, `;
  }

  // 3. Define Sequence Steps: Home Remedies -> Limitations/Challenges -> Suggest Salon
  let remedyText = '';
  let challengesText = '';
  let salonSuggestionHeading = '';

  if (category === 'hair') {
    remedyText = `You can certainly try some gentle, natural DIY alternatives at home to soothe your hair and scalp. Applying a lukewarm mask of organic coconut oil blended with argan oil works well to coat the hair shaft, while a paste of fresh aloe vera gel and unsweetened yogurt can help calm scalp dryness and smoothen cuticle flyaways.`;
    challengesText = `However, achieving deep structural repair (like restructuring split bonds), professional moisture replenishment, or precision styling at home is incredibly challenging. Without professional-grade bond builders, specialized steam rehydration hoods, and the experienced technique of a master stylist, home-based DIY treatments often result in heavy product buildup, scalp clogging, or uneven hair texture rather than structural rejuvenation.`;
    salonSuggestionHeading = `To give your hair the safe, expert rehydration and care it needs, I highly recommend exploring professional treatments:`;
  } else if (category === 'skin') {
    remedyText = `You can start with some safe, calming home remedies to support your skin's surface. Applying a thin layer of raw honey combined with organic yogurt is excellent for light hydration and soothing minor redness, while a cool, finely ground oatmeal compress can help calm skin irritation.`;
    challengesText = `However, performing professional-grade facials, deep pore extractions, or advanced exfoliation at home is difficult and carries significant risks. Without specialized clinical tools like vortex suction, sterile extraction loops, and professional-strength active serums, DIY attempts can lead to skin barrier disruption, increased bacterial spread, acne inflammation, or even permanent micro-tearing of the skin tissue.`;
    salonSuggestionHeading = `To achieve a deep, safe, and truly radiant transformation for your skin, professional care is the safest and most effective path:`;
  } else if (category === 'wedding') {
    remedyText = `For wedding or event preparation, you can begin with gentle home care. Consuming plenty of water, performing light herbal steam inhalation, and using mild, home-made nourishing face packs (like chickpea flour and turmeric) are great ways to keep your skin naturally refreshed in the weeks leading up to the event.`;
    challengesText = `However, achieving flawless all-day makeup longevity, perfect high-definition contouring, and advanced hairstyling that holds under professional event lighting is extremely difficult to do on your own at home. Professional-grade styling requires calibrated HD airbrushing, specialist primers, lighting-adjusted color matching, and meticulous bridal artistry that standard over-the-counter cosmetics simply cannot replicate.`;
    salonSuggestionHeading = `To ensure you look absolutely radiant and stress-free on your special day, relying on professional stylist support is highly recommended:`;
  } else {
    // General category
    remedyText = `You can start with natural, home-based self-care routines. Maintaining a consistent gentle cleansing routine, keeping your skin and hair well-moisturized with pure aloe vera, and protecting your skin barrier are wonderful daily habits to keep yourself glowing.`;
    challengesText = `However, standard over-the-counter home care lacks the targeted strength and clinical customization required to address deep beauty goals. Without professional diagnosis, high-efficacy concentrated serums, and custom wellness equipment, generic at-home routines are often slow to show results and cannot be calibrated to your exact physical beauty profile characteristics.`;
    salonSuggestionHeading = `For optimal, personalized results that are scientifically tailored to your exact profile, professional salon consultations are exceptionally effective:`;
  }

  // 4. Format the final recommendations list or suggest general professional options
  let recsText = '';
  if (recommendations.length > 0) {
    recsText = recommendations.map((rec) => {
      if (rec.type === 'service') {
        return `• **${rec.name}** at *${rec.details}* (₹${rec.price}): Matches because it is ${rec.reasons.join(' & ').toLowerCase()}.`;
      } else {
        return `• **${rec.name}** in *${rec.details}* (${rec.matchScore}% match): Matches because it offers ${rec.reasons.join(' & ').toLowerCase()}.`;
      }
    }).join('\n');
    recsText += `\n\nDid you know? Outlets like **Bodycraft Salon & Spa** also offer premium doorstep home services, allowing you to enjoy elite salon treatments in the comfort and privacy of your own home!`;
  } else {
    if (category === 'hair') {
      recsText = `I suggest looking into professional salon treatments like a Kérastase deep conditioning ritual, a scalp recovery spa, or custom styling at top-rated outlets like **Bounce Salon** or **Play Salon**.`;
    } else if (category === 'skin') {
      recsText = `I recommend considering professional treatments like an Advanced Hydra Facial, a deep cleansing clean-up, or a skin barrier therapy at wellness clinics like **Bodycraft Salon & Spa** or **Mirror & Within**.`;
    } else if (category === 'wedding') {
      recsText = `I recommend booking a professional bridal/groom trial or scheduling event styling packages at premium outlets like **Play Salon Vittal Mallya** or **Bodycraft Indiranagar** for a flawless look.`;
    } else {
      recsText = `I suggest exploring top-rated salons near Koramangala or Indiranagar where expert estheticians can design a customized regimen just for you.`;
    }
  }

  // Combine into a pleasing, sophisticated, convincing luxury narrative response
  const bodyText = `${personalizationPrefix ? `*${personalizationPrefix.trim()}*\n\n` : ''}${remedyText}\n\n${challengesText}\n\n${salonSuggestionHeading}\n\n${recsText}`;

  return `Hello ${nameFirst}! 

${bodyText}

Please let me know if you would like me to help you compare these salons, check prices, or schedule an online booking!`;
}

function generateLocalComparisonFallback(salonsToCompare: any[], queryText: string): any {
  const feature1Comparison = salonsToCompare.map(salon => {
    const startPrice = salon.services && salon.services.length > 0
      ? Math.min(...salon.services.map((s: any) => s.price))
      : 1500;
    return {
      salonName: salon.name,
      rating: salon.rating,
      priceRange: `Starts at ₹${startPrice}`,
      reviewScore: `Excellent (${Math.round(salon.rating * 20)}% Positive)`,
      popularServices: salon.services && salon.services.length > 0 
        ? salon.services.slice(0, 3).map((s: any) => s.name || s.serviceName) 
        : ['Facial', 'Haircut', 'Spa Treatment'],
      aiRecommendationBadge: salon.rating >= 4.8 ? 'Top Rated' : 'Highly Recommended'
    };
  });

  const feature2ReviewIntelligence = salonsToCompare.map(salon => {
    return {
      salonName: salon.name,
      overallSentiment: salon.rating >= 4.7 ? 'Positive' : 'Neutral',
      topStrengths: salon.aiReviewSummary?.pros?.slice(0, 3) || ['Professional staff', 'Excellent services', 'Clean environment'],
      commonComplaints: salon.aiReviewSummary?.cons?.slice(0, 1) || ['Weekend waiting times'],
      mostMentionedServices: salon.services && salon.services.length > 0
        ? salon.services.slice(0, 2).map((s: any) => s.name || s.serviceName)
        : ['Facial']
    };
  });

  // Recommend the one with higher rating
  const sorted = [...salonsToCompare].sort((a, b) => b.rating - a.rating);
  const recommended = sorted[0] || { name: 'Bodycraft Salon & Spa', rating: 4.8 };

  return {
    feature1Comparison,
    feature2ReviewIntelligence,
    recommendation: {
      recommendedSalonName: recommended.name,
      reasonText: `Based on your request "${queryText}" and analysis of user reviews, ${recommended.name} is highly recommended. It stands out with a satisfaction rating of ${recommended.rating}★ and matches your preferences perfectly.`
    }
  };
}
