import { ParsedQuery } from './intentDetector';
import { MOCK_SALONS, MOCK_USER, Salon } from '../app/data/mockData';
import { db, IS_MOCK } from './firebase';

export interface RecommendationResult {
  type: 'salon' | 'service';
  id: string;
  name: string;
  price?: number;
  salonId?: string;
  details: string; // Salon name or locality
  matchScore: number;
  reasons: string[];
  memoryIndicator?: string;
}

/**
 * Server-side helper to fetch salons and services from Firestore (or mock data).
 */
export async function getSalonsAndServices(): Promise<Salon[]> {
  if (IS_MOCK) {
    return MOCK_SALONS;
  }

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    
    // Fetch salons and services from Firestore
    const salonsSnapshot = await getDocs(collection(db, 'salons'));
    const servicesSnapshot = await getDocs(collection(db, 'services'));

    const servicesList = servicesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id || data.serviceId,
        salonId: data.salonId,
        name: data.serviceName,
        price: Number(data.price),
        duration: data.duration,
        category: data.category,
        isActive: data.isActive !== false,
        description: data.description || 'Verified salon service.'
      };
    });

    const salonsList = salonsSnapshot.docs.map(doc => {
      const data = doc.data();
      const salonId = doc.id || data.salonId;
      
      const salonServices = servicesList.filter(s => s.salonId === salonId && s.isActive);
      
      return {
        id: salonId,
        name: data.name || '',
        rating: Number(data.rating) || 5.0,
        reviewsCount: Number(data.reviewsCount) || data.reviews?.length || 0,
        location: data.location || '',
        locality: data.locality || data.location?.split(',')[0]?.trim() || 'Indiranagar',
        address: data.address || '',
        image: data.imageUrls?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
        gallery: data.imageUrls || [],
        description: data.description || '',
        isLuxury: data.category === 'Luxury',
        offersHomeService: data.category === 'Home Service',
        phone: data.phone || '',
        reviews: data.reviews || [],
        aiReviewSummary: data.aiReviewSummary || { pros: [], cons: [], summary: '' },
        matchScore: data.matchScore || 95,
        badges: data.badges || [],
        services: salonServices
      };
    }) as Salon[];

    return salonsList;
  } catch (error) {
    console.error('Failed to retrieve Firestore collections, falling back to mock data:', error);
    return MOCK_SALONS;
  }
}

/**
 * Searches and ranks salons/services using Firestore/Mock database.
 */
export async function searchAndRank(
  parsed: ParsedQuery,
  userProfile: any,
  userBookings: any[] = []
): Promise<RecommendationResult[]> {
  const salons = await getSalonsAndServices();
  const results: RecommendationResult[] = [];

  const {
    intent,
    locality,
    maxPrice,
    isLuxury,
    offersHomeService,
    serviceKeywords,
    queriedSalons
  } = parsed;

  const userFavSalons = userProfile?.favoriteSalons || [];
  const userLocality = userProfile?.location?.split(',')[0]?.trim() || '';

  // ----------------------------------------------------
  // BRANCH 1: SERVICE SEARCH INTENT
  // ----------------------------------------------------
  if (intent === 'service_search' || serviceKeywords.length > 0) {
    let matchedServices: { service: any; salon: Salon }[] = [];

    // Filter services from all salons
    salons.forEach(salon => {
      salon.services.forEach(service => {
        // Keyword matching
        const serviceName = service.name.toLowerCase();
        const serviceCat = service.category.toLowerCase();
        
        const matchesKeyword = serviceKeywords.some(kw => 
          serviceName.includes(kw) || serviceCat.includes(kw)
        );

        if (matchesKeyword) {
          matchedServices.push({ service, salon });
        }
      });
    });

    // Handle price and locality filtering
    let filtered = matchedServices;

    // Apply locality filter if specified in query
    if (locality) {
      filtered = filtered.filter(item => 
        item.salon.locality.toLowerCase() === locality.toLowerCase()
      );
    }

    // Apply price filter if specified in query
    let priceFallbackActive = false;
    if (maxPrice !== null) {
      const withinPrice = filtered.filter(item => item.service.price <= maxPrice);
      if (withinPrice.length > 0) {
        filtered = withinPrice;
      } else {
        // Fallback: If no services are within price, keep all but mark as above budget
        priceFallbackActive = true;
      }
    }

    // Calculate match scores and build recommendations
    filtered.forEach(item => {
      const { service, salon } = item;
      const serviceName = service.name.toLowerCase();
      const serviceCat = service.category.toLowerCase();
      let score = 75;
      const reasons: string[] = [];
      let memoryIndicator: string | undefined;

      // Locality alignment
      if (locality && salon.locality.toLowerCase() === locality.toLowerCase()) {
        score += 15;
        reasons.push(`Located in queried locality (${salon.locality})`);
      } else if (userLocality && salon.locality.toLowerCase() === userLocality.toLowerCase()) {
        score += 5;
        reasons.push(`Matches your neighborhood profile (${salon.locality})`);
      }

      // Price alignment
      if (maxPrice !== null) {
        if (service.price <= maxPrice) {
          score += 15;
          reasons.push(`Under your budget limit of ₹${maxPrice}`);
        } else if (priceFallbackActive) {
          score -= 20;
          reasons.push(`Above target budget of ₹${maxPrice} (best local alternative)`);
        }
      }

      // Rating bonus
      if (salon.rating >= 4.7) {
        score += 10;
        reasons.push(`Offered by a top-rated outlet (${salon.rating}★)`);
      }

      // Luxury or Home Service tags alignment
      if (isLuxury && salon.isLuxury) {
        score += 10;
        reasons.push('Matches luxury outlet preference');
      }
      if (offersHomeService && salon.offersHomeService) {
        score += 10;
        reasons.push('Offers doorstep home service');
      }

      // Past Booking Memory alignment
      const pastBooking = userBookings.find(b => b.serviceId === service.id && b.status !== 'Cancelled');
      if (pastBooking) {
        score += 12;
        memoryIndicator = `You booked this treatment on ${pastBooking.date}`;
        reasons.push('Rebook your previous preferred service');
      }

      // Favorite Salon bonus
      if (userFavSalons.includes(salon.id)) {
        score += 8;
        reasons.push('From your favorite salons list');
      }

      // Hair/Skin profile matching
      const userHair = userProfile?.hairType?.toLowerCase() || '';
      const userSkin = userProfile?.skinTone?.toLowerCase() || '';
      if (serviceCat.includes('hair') && userHair) {
        if (service.description.toLowerCase().includes(userHair) || serviceName.includes('hair')) {
          score += 5;
          reasons.push(`Optimized for your ${userProfile.hairType} hair structure`);
        }
      }
      if (serviceCat.includes('skin') && userSkin) {
        score += 5;
        reasons.push('Matched with your skin tone diagnostics');
      }

      results.push({
        type: 'service',
        id: service.id,
        name: service.name,
        price: service.price,
        salonId: salon.id,
        details: salon.name,
        matchScore: Math.min(score, 99),
        reasons,
        memoryIndicator
      });
    });
  }

  // ----------------------------------------------------
  // BRANCH 2: SALON SEARCH / COMPARISON / OTHER INTENTS
  // ----------------------------------------------------
  else {
    let targetSalons = salons;

    // Filter by specific queried salons if mentioned
    if (queriedSalons.length > 0) {
      targetSalons = salons.filter(s => queriedSalons.includes(s.id));
    }

    // Filter by locality if specified in query
    if (locality) {
      targetSalons = targetSalons.filter(s => 
        s.locality.toLowerCase() === locality.toLowerCase()
      );
    }

    targetSalons.forEach(salon => {
      let score = 70;
      const reasons: string[] = [];
      let memoryIndicator: string | undefined;

      // Locality matching
      if (locality && salon.locality.toLowerCase() === locality.toLowerCase()) {
        score += 15;
        reasons.push(`Located in ${salon.locality}`);
      } else if (userLocality && salon.locality.toLowerCase() === userLocality.toLowerCase()) {
        score += 5;
        reasons.push(`Matches your area profile (${salon.locality})`);
      }

      // Rating check
      if (salon.rating >= 4.8) {
        score += 15;
        reasons.push(`Excellent customer satisfaction (${salon.rating}★)`);
      } else if (salon.rating >= 4.5) {
        score += 8;
        reasons.push(`Highly rated service quality (${salon.rating}★)`);
      }

      // Category matching
      if (isLuxury) {
        if (salon.isLuxury) {
          score += 15;
          reasons.push('Bespoke luxury brand segment');
        } else {
          score -= 15;
        }
      } else if (salon.isLuxury) {
        score += 5; // general luxury is positive
      }

      if (offersHomeService) {
        if (salon.offersHomeService) {
          score += 15;
          reasons.push('Offers professional home service visits');
        } else {
          score -= 10;
        }
      }

      // Favorite list memory check
      if (userFavSalons.includes(salon.id)) {
        score += 15;
        memoryIndicator = 'Saved in your favorite outlets list';
        reasons.push('You frequently consult this brand');
      }

      // Budget category compatibility
      if (salon.isLuxury && userProfile?.preferredBudget?.includes('₹₹₹')) {
        score += 5;
        reasons.push('Matches premium budget settings');
      }

      // Reviews summary context
      if (salon.aiReviewSummary?.pros?.length > 0) {
        reasons.push(`Highly reviewed for: ${salon.aiReviewSummary.pros[0]}`);
      }

      results.push({
        type: 'salon',
        id: salon.id,
        name: salon.name,
        details: salon.locality,
        matchScore: Math.min(score, 99),
        reasons,
        memoryIndicator
      });
    });
  }

  // Sort by match score descending and return top 3
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
