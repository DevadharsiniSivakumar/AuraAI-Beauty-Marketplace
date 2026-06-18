import { Review, Salon, Service } from '../app/data/mockData';

export interface SentimentIndicators {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface SalonComparisonMetrics {
  salonId: string;
  salonName: string;
  averageRating: number;
  reviewCount: number;
  sentiment: SentimentIndicators;
  topServices: { name: string; mentions: number }[];
  priceRange: string;
}

/**
 * Calculates the average rating from a list of reviews.
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return parseFloat((total / reviews.length).toFixed(1));
}

/**
 * Calculates positive/neutral/negative sentiment indicators based on ratings.
 * Positive (4-5), Neutral (3), Negative (1-2)
 */
export function calculateSentimentIndicators(reviews: Review[]): SentimentIndicators {
  const indicators = { positive: 0, neutral: 0, negative: 0, total: reviews?.length || 0 };
  
  if (!reviews) return indicators;

  reviews.forEach((r) => {
    if (r.rating >= 4) {
      indicators.positive++;
    } else if (r.rating === 3) {
      indicators.neutral++;
    } else {
      indicators.negative++;
    }
  });

  return indicators;
}

/**
 * Counts how many times specific services are mentioned in the reviews.
 */
export function countServiceMentions(reviews: Review[], services: Service[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  if (!reviews || !services) return counts;

  services.forEach(s => { counts[s.name] = 0; });

  reviews.forEach(review => {
    const text = review.comment.toLowerCase();
    services.forEach(service => {
      // Basic matching by service name keywords
      const keywords = service.name.toLowerCase().split(' ').filter(w => w.length > 3);
      const matches = keywords.some(kw => text.includes(kw));
      if (matches || review.tags?.some(t => t.toLowerCase().includes(service.name.toLowerCase()))) {
        counts[service.name]++;
      }
    });
  });

  return counts;
}

/**
 * Returns the top K reviewed services based on mention count.
 */
export function getTopReviewedServices(reviews: Review[], services: Service[], topK: number = 3): { name: string; mentions: number }[] {
  const counts = countServiceMentions(reviews, services);
  
  return Object.entries(counts)
    .filter(([_, mentions]) => mentions > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([name, mentions]) => ({ name, mentions }));
}

/**
 * Compiles all metrics for a given salon to be fed into the Groq LLM context.
 */
export function generateComparisonMetrics(salons: any[]): SalonComparisonMetrics[] {
  return salons.map(salon => {
    const reviews: Review[] = salon.reviews || [];
    const services: Service[] = salon.services || [];
    
    let priceRange = 'N/A';
    if (services.length > 0) {
      const min = Math.min(...services.map(s => s.price));
      const max = Math.max(...services.map(s => s.price));
      priceRange = min === max ? `₹${min}` : `₹${min} - ₹${max}`;
    }

    return {
      salonId: salon.id || salon.salonId,
      salonName: salon.name,
      averageRating: calculateAverageRating(reviews),
      reviewCount: reviews.length,
      sentiment: calculateSentimentIndicators(reviews),
      topServices: getTopReviewedServices(reviews, services, 3),
      priceRange
    };
  });
}
