export interface ParsedQuery {
  intent: 'service_search' | 'salon_search' | 'salon_comparison' | 'beauty_planning' | 'style_advice' | 'booking_help' | 'general_query';
  locality: string | null;
  maxPrice: number | null;
  isLuxury: boolean;
  offersHomeService: boolean;
  serviceKeywords: string[];
  queriedSalons: string[];
}

/**
 * Parses user input to detect query intent and extract structured criteria.
 * Supports: service_search, salon_search, salon_comparison, beauty_planning, style_advice, booking_help, general_query.
 */
export function detectIntent(query: string): ParsedQuery {
  const text = query.toLowerCase().trim();
  
  // 1. Extract price constraints (e.g. "under 3000", "below 2500", "budget of 1500")
  let maxPrice: number | null = null;
  const priceRegex = /(?:under|below|less\s+than|budget\s+of|within)\s*(?:rs\.?|₹)?\s*(\d+)/i;
  const priceMatch = text.match(priceRegex);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // 2. Extract localities in Bangalore
  let locality: string | null = null;
  const localities = [
    { name: 'Indiranagar', patterns: ['indiranagar', 'indira nagar'] },
    { name: 'Koramangala', patterns: ['koramangala', 'kora mangala'] },
    { name: 'Vittal Mallya Rd', patterns: ['vittal mallya', 'vittal mallya road', 'vittal mallya rd', 'ub city'] },
    { name: 'Jayanagar', patterns: ['jayanagar', 'jaya nagar'] },
    { name: 'HSR Layout', patterns: ['hsr', 'hsr layout'] },
    { name: 'Lavelle Road', patterns: ['lavelle', 'lavelle road'] }
  ];
  for (const loc of localities) {
    if (loc.patterns.some(p => text.includes(p))) {
      locality = loc.name;
      break;
    }
  }

  // 3. Extract category or pricing segment indicators
  const isLuxury = text.includes('luxury') || text.includes('premium') || text.includes('high-end') || text.includes('elite') || text.includes('exclusive');
  const offersHomeService = text.includes('home service') || text.includes('at home') || text.includes('home visit') || text.includes('doorstep') || text.includes('in-house');

  // 4. Extract service keywords
  const serviceKeywords: string[] = [];
  const keywordMap = ['facial', 'hair', 'nail', 'massage', 'spa', 'cut', 'styling', 'balayage', 'waxing', 'treatment', 'grooming', 'makeup', 'pedicure', 'manicure'];
  for (const kw of keywordMap) {
    if (text.includes(kw)) {
      serviceKeywords.push(kw);
    }
  }

  // 5. Extract specific salon names
  const queriedSalons: string[] = [];
  const salonNames = [
    { id: 'bodycraft-indiranagar', patterns: ['bodycraft'] },
    { id: 'play-salon-vittal-mallya', patterns: ['play salon', 'play'] },
    { id: 'bounce-salon-koramangala', patterns: ['bounce'] },
    { id: 'ylg-salon-hsr', patterns: ['ylg', 'you look great'] },
    { id: 'mirror-within-lavelle', patterns: ['mirror & within', 'mirror and within', 'mirror within'] }
  ];
  for (const sal of salonNames) {
    if (sal.patterns.some(p => text.includes(p))) {
      queriedSalons.push(sal.id);
    }
  }

  // 6. Classify Intent
  let intent: ParsedQuery['intent'] = 'general_query';

  if (text.includes('compare') || text.includes('versus') || text.includes(' vs ') || text.includes('difference between') || (queriedSalons.length >= 2)) {
    intent = 'salon_comparison';
  } else if (text.includes('book') || text.includes('appointment') || text.includes('schedule') || text.includes('cancel') || text.includes('reserve') || text.includes('visit')) {
    intent = 'booking_help';
  } else if (text.includes('wedding') || text.includes('marriage') || text.includes('event') || text.includes('party') || text.includes('plan') || text.includes('bridal') || text.includes('bride')) {
    intent = 'beauty_planning';
  } else if (text.includes('hairstyle') || text.includes('suit') || text.includes('face shape') || text.includes('skin tone') || text.includes('look good') || text.includes('haircut') || text.includes('style') || text.includes('contour') || text.includes('melanin')) {
    intent = 'style_advice';
  } else if (serviceKeywords.length > 0 && (maxPrice !== null || text.includes('price') || text.includes('cost') || text.includes('charge') || text.includes('rate') || text.includes('fee'))) {
    intent = 'service_search';
  } else if (text.includes('salon') || text.includes('place') || text.includes('outlet') || locality !== null || isLuxury) {
    intent = 'salon_search';
  } else if (serviceKeywords.length > 0) {
    intent = 'service_search';
  }

  return {
    intent,
    locality,
    maxPrice,
    isLuxury,
    offersHomeService,
    serviceKeywords,
    queriedSalons
  };
}
