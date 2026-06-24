import { Booking } from '../app/context/AppContext';
import { Salon, Review } from '../app/data/mockData';

export interface UserMemory {
  userId: string;
  preferredServices: string[];
  preferredLocations: string[];
  preferredCategories: { category: string; score: number }[];
  averageBudget: number;
  favoriteSalons: string[];
  likedServices: string[];
  dislikedServices: string[];
  bookingHistory: {
    bookingId: string;
    serviceName: string;
    salonName: string;
    date: string;
    price: number;
    status: string;
  }[];
  reviewHistory: {
    reviewId: string;
    serviceName: string;
    salonName: string;
    rating: number;
    comment: string;
  }[];
  lastUpdated: string;
}

export function recalculateUserMemory(
  bookings: Booking[],
  reviews: any[],
  salons: Salon[],
  userId: string
): UserMemory {
  // Filter out Cancelled bookings to avoid counting cancelled services
  const validBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  // 1. Calculate preferred services sorted by frequency descending
  const serviceCounts: { [name: string]: number } = {};
  validBookings.forEach(b => {
    if (b.serviceName) {
      serviceCounts[b.serviceName] = (serviceCounts[b.serviceName] || 0) + 1;
    }
  });
  const preferredServices = Object.keys(serviceCounts)
    .sort((a, b) => serviceCounts[b] - serviceCounts[a]);

  // 2. Calculate preferred locations (localities) sorted by frequency descending
  const locationCounts: { [loc: string]: number } = {};
  validBookings.forEach(b => {
    const salon = salons.find(s => s.id === b.salonId);
    const locality = salon?.locality || 'Indiranagar';
    locationCounts[locality] = (locationCounts[locality] || 0) + 1;
  });
  const preferredLocations = Object.keys(locationCounts)
    .sort((a, b) => locationCounts[b] - locationCounts[a]);

  // 3. Calculate preferred categories (Luxury / Budget / Home Service) with score
  const categoryCounts: { [cat: string]: number } = {
    'Luxury': 0,
    'Home Service': 0,
    'Budget': 0
  };
  validBookings.forEach(b => {
    const salon = salons.find(s => s.id === b.salonId);
    let cat = 'Budget';
    if (salon) {
      cat = salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget';
    }
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const preferredCategories = Object.keys(categoryCounts)
    .map(cat => ({ category: cat, score: categoryCounts[cat] }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // 4. Calculate average spending
  const totalPrice = validBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const averageBudget = validBookings.length > 0 ? Math.round(totalPrice / validBookings.length) : 0;

  // 5. Build review history, resolving service via user's most recent bookings at that salon
  const likedServicesSet = new Set<string>();
  const dislikedServicesSet = new Set<string>();
  
  const reviewHistory = reviews
    .map(rev => {
      // Find bookings at the reviewed salon
      const salonBookings = bookings.filter(b => b.salonId === rev.salonId);
      // Prioritize Completed status
      const completedBookings = salonBookings.filter(b => b.status === 'Completed');
      const targetBookings = completedBookings.length > 0 ? completedBookings : salonBookings;
      
      // Sort by date descending
      const sorted = [...targetBookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const recentBooking = sorted[0];
      const serviceName = recentBooking ? recentBooking.serviceName : 'Unknown Service';

      if (serviceName !== 'Unknown Service') {
        if (rev.rating >= 4) {
          likedServicesSet.add(serviceName);
        } else if (rev.rating <= 2) {
          dislikedServicesSet.add(serviceName);
        }
      }

      return {
        reviewId: rev.id,
        serviceName,
        salonName: rev.salonName || salons.find(s => s.id === rev.salonId)?.name || 'Unknown Salon',
        rating: rev.rating,
        comment: rev.comment
      };
    });

  const likedServices = Array.from(likedServicesSet);
  const dislikedServices = Array.from(dislikedServicesSet);

  // Simplified booking history
  const bookingHistory = bookings.map(b => ({
    bookingId: b.id,
    serviceName: b.serviceName,
    salonName: b.salonName,
    date: b.date,
    price: b.price,
    status: b.status
  }));

  return {
    userId,
    preferredServices,
    preferredLocations,
    preferredCategories,
    averageBudget,
    favoriteSalons: [],
    likedServices,
    dislikedServices,
    bookingHistory,
    reviewHistory,
    lastUpdated: new Date().toISOString()
  };
}

export function buildUserMemoryContext(memory: UserMemory): string {
  if (!memory) return '';

  const preferredServices = memory.preferredServices || [];
  const preferredCategories = memory.preferredCategories || [];
  const preferredLocations = memory.preferredLocations || [];
  const dislikedServices = memory.dislikedServices || [];
  const reviewHistory = memory.reviewHistory || [];

  const preferredServicesText = preferredServices.length > 0
    ? preferredServices.slice(0, 3).map(s => `* ${s}`).join('\n')
    : '* None';

  const preferredCategoriesText = preferredCategories.length > 0
    ? preferredCategories.slice(0, 2).map(c => `* ${c.category} Salons`).join('\n')
    : '* None';

  const preferredLocationsText = preferredLocations.length > 0
    ? preferredLocations.slice(0, 2).map(l => `* ${l} Area`).join('\n')
    : '* None';

  let budgetRange = '';
  if (memory.averageBudget && memory.averageBudget > 0) {
    const lower = Math.max(0, Math.floor(memory.averageBudget / 500) * 500);
    const upper = lower + 500;
    budgetRange = `₹${lower}-${upper}`;
  } else {
    budgetRange = 'No bookings recorded yet';
  }

  const ratedServices = reviewHistory
    .map(r => `${r.serviceName} (${r.rating}★)`)
    .join('\n');

  const avoidServicesText = dislikedServices.length > 0
    ? dislikedServices.map(s => `* ${s}`).join('\n')
    : '* None';

  return `User prefers:
${preferredServicesText}
${preferredCategoriesText}
${preferredLocationsText}

Average Budget:
${budgetRange}

Frequently Rated Services:
${ratedServices || 'None'}

Avoid:
${avoidServicesText}`;
}
