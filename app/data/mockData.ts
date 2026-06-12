export interface Service {
  id: string;
  name: string;
  category: 'Hair' | 'Skincare' | 'Nails' | 'Massages' | 'Bridal';
  price: number;
  duration: string;
  description: string;
  isActive?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  tags?: string[];
}

export interface Salon {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  locality: 'Indiranagar' | 'Koramangala' | 'Vittal Mallya Rd' | 'Jayanagar' | 'HSR Layout' | 'Lavelle Road';
  address: string;
  image: string;
  gallery: string[];
  description: string;
  isLuxury: boolean;
  offersHomeService: boolean;
  phone: string;
  services: Service[];
  reviews: Review[];
  aiReviewSummary: {
    pros: string[];
    cons: string[];
    summary: string;
    popularServices?: string[];
  };
  matchScore: number;
  badges: string[];
  status?: string;
}

export const MOCK_SALONS: Salon[] = [
  {
    id: 'bodycraft-indiranagar',
    name: 'Bodycraft Salon & Spa',
    rating: 4.8,
    reviewsCount: 340,
    location: 'Indiranagar, Bangalore',
    locality: 'Indiranagar',
    address: 'No. 70, 100 Feet Rd, Hal 2nd Stage, Indiranagar, Bengaluru, 560038',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d151?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'A premium destination for clinical wellness, luxury grooming, and aesthetic skincare. Bodycraft Indiranagar is known for its state-of-the-art facilities, expert dermatologists, and highly trained stylists who specialize in balayage, custom skincare regimes, and bridal styling.',
    isLuxury: true,
    offersHomeService: true,
    phone: '+91 80 4024 8888',
    matchScore: 96,
    badges: ['Best for Hydra Facial', 'Luxury Favorite', 'Trending'],
    services: [
      { id: 'bc-facial-1', name: 'Advanced Hydra Facial', category: 'Skincare', price: 4500, duration: '60 mins', description: 'Deep cleansing, exfoliation, and hydration infusion with customized booster serums.' },
      { id: 'bc-hair-1', name: 'Luxury Balayage & Styling', category: 'Hair', price: 8500, duration: '180 mins', description: 'Hand-painted highlights with custom toning, Plex restructuring, and blow dry styling.' },
      { id: 'bc-skincare-2', name: 'Brightening Peel', category: 'Skincare', price: 2800, duration: '45 mins', description: 'Gentle chemical exfoliation using micro-acids to restore skin tone and radiance.' },
      { id: 'bc-massage-1', name: 'Aromatherapy Full Body Massage', category: 'Massages', price: 3200, duration: '75 mins', description: 'Deeply relaxing massage using pure essential oils tailored to your body needs.' },
      { id: 'bc-nail-1', name: 'Gel Extensions with Nail Art', category: 'Nails', price: 2500, duration: '90 mins', description: 'Sculpted gel extensions with custom pastel or metallic luxury art.' }
    ],
    reviews: [
      { id: 'bc-rev-1', author: 'Ananya S.', rating: 5, date: '2026-05-28', comment: 'Got my Balayage done here by Senior Stylist Rohan. Incredible attention to detail! The soft pink interiors and service make you feel like royalty.', tags: ['#Balayage', '#Luxury'] },
      { id: 'bc-rev-2', author: 'Priyanka M.', rating: 4, date: '2026-06-02', comment: 'The Hydra Facial is absolutely worth it. My skin felt glowy for days. Deducted one star because wait times are slightly long even with prior booking.', tags: ['#HydraFacial', '#Skincare'] },
      { id: 'bc-rev-3', author: 'Meera Rao', rating: 5, date: '2026-06-10', comment: 'Always a consistent experience. Love their hygiene protocols. Highly recommend their aromatherapy massage.', tags: ['#Massages', '#Hygiene'] }
    ],
    aiReviewSummary: {
      pros: ['Professional Staff', 'Clean Environment', 'Excellent Hydra Facials', 'Consistent quality'],
      cons: ['Long Waiting Time During Weekends', 'Expensive compared to average salons'],
      summary: 'Bodycraft is highly recommended for advanced color services and clinical facials. Users praise the high standard of hygiene and expertise, though booking in advance is essential to avoid wait times.',
      popularServices: ['Advanced Hydra Facial', 'Rica Waxing', 'Luxury Balayage']
    }
  },
  {
    id: 'play-salon-vittal-mallya',
    name: 'Play Salon',
    rating: 4.9,
    reviewsCount: 180,
    location: 'Vittal Mallya Road, Bangalore',
    locality: 'Vittal Mallya Rd',
    address: '3rd Floor, UB City, Vittal Mallya Rd, Bengaluru, 560001',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'Situated inside the prestigious UB City, Play Salon caters to high-profile clients seeking the absolute best in premium hair extensions, precision cuts, and executive beauty therapies. Standard services include a premium cup of gourmet coffee and consultation.',
    isLuxury: true,
    offersHomeService: false,
    phone: '+91 80 4123 4567',
    matchScore: 91,
    badges: ['Best for Bridal Makeup', 'Luxury Favorite'],
    services: [
      { id: 'play-hair-1', name: 'Precision French Haircut', category: 'Hair', price: 3000, duration: '60 mins', description: 'Custom hair shape analysis and cutting by an Art Director.' },
      { id: 'play-facial-1', name: 'La Prairie Caviar Facial', category: 'Skincare', price: 9500, duration: '90 mins', description: 'Ultra-luxurious anti-aging treatment infused with premium caviar extracts.' },
      { id: 'play-bridal-1', name: 'Elite Bridal Makeup & Draping', category: 'Bridal', price: 25000, duration: '240 mins', description: 'HD makeup by celebrity MUA, complete with hairstyling and saree draping.' },
      { id: 'play-nail-1', name: 'Russian Luxury Manicure', category: 'Nails', price: 1800, duration: '50 mins', description: 'Advanced cuticle cleaning with electric file and nourishing vitamin oil.' }
    ],
    reviews: [
      { id: 'play-rev-1', author: 'Kavitha K.', rating: 5, date: '2026-05-15', comment: 'If you want high-end styling, look no further. The UB city outlet is spectacular. The MUA is brilliant, helped me drape my wedding silk saree beautifully.', tags: ['#Bridal', '#Luxury'] },
      { id: 'play-rev-2', author: 'Divya N.', rating: 5, date: '2026-06-05', comment: 'Premium haircut. My stylist understood my face shape immediately and gave me a long shag cut that matches my curls perfectly.', tags: ['#PrecisionCut', '#Hair'] }
    ],
    aiReviewSummary: {
      pros: ['Celebrity stylists', 'UB City premium location', 'Highly attentive personalized care', 'Exceptional hair shape analysis'],
      cons: ['Premium pricing', 'No home services available'],
      summary: 'Play Salon is an elite establishment suitable for high-end styling and specialized hair styling. Its premium UB City location offers a top-tier customer experience with complimentary hospitality.',
      popularServices: ['Precision French Haircut', 'Elite Bridal Makeup']
    }
  },
  {
    id: 'bounce-koramangala',
    name: 'Bounce Salon & Spa',
    rating: 4.6,
    reviewsCount: 290,
    location: 'Koramangala, Bangalore',
    locality: 'Koramangala',
    address: 'No. 36, 1st Main Rd, Koramangala 5th Block, Bengaluru, 560095',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d151?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d151?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'Young, vibrant, and always keeping up with globally trending styles. Bounce Koramangala is a hotspot for youth seeking creative hair coloring, organic scalp therapy, and high-fashion nail makeovers.',
    isLuxury: false,
    offersHomeService: true,
    phone: '+91 80 4211 1123',
    matchScore: 88,
    badges: ['Best for Creative Color', 'Trending This Month'],
    services: [
      { id: 'bounce-hair-1', name: 'Creative Global Hair Coloring', category: 'Hair', price: 5500, duration: '120 mins', description: 'Vibrant global shades or highlights using organic ammonia-free colors.' },
      { id: 'bounce-scalp-1', name: 'Tea Tree Scalp Detox Therapy', category: 'Skincare', price: 2200, duration: '50 mins', description: 'Invigorating cooling scalp treatment to clear build-up and nourish hair follicles.' },
      { id: 'bounce-nail-1', name: 'Classic Gel Overlay Manicure', category: 'Nails', price: 1200, duration: '45 mins', description: 'Long-lasting high shine gel overlay on natural nails.' }
    ],
    reviews: [
      { id: 'bounce-rev-1', author: 'Neha Gupta', rating: 4, date: '2026-05-20', comment: 'Got global cherry red highlights. Love the color, it is super vibrant. The staff was friendly and energetic. Price was very fair.', tags: ['#HairColor', '#Trendy'] },
      { id: 'bounce-rev-2', author: 'Sarah P.', rating: 5, date: '2026-06-08', comment: 'Really liked the Scalp Detox. Feels like a minty fresh restart for my hair. Their Indiranagar and Koramangala branches are both great.', tags: ['#ScalpDetox'] }
    ],
    aiReviewSummary: {
      pros: ['Vibrant, youth-focused styles', 'Affordable creative colors', 'Excellent customer service'],
      cons: ['Loud music/atmosphere at times', 'Busy on weekends'],
      summary: 'Bounce in Koramangala is best known for creative hair coloring and scalp therapies. It offers a lively, energetic ambiance with friendly staff and competitive prices.',
      popularServices: ['Creative Global Hair Coloring', 'Tea Tree Scalp Detox']
    }
  },
  {
    id: 'toni-guy-jayanagar',
    name: 'Toni&Guy Essentials',
    rating: 4.7,
    reviewsCount: 410,
    location: 'Jayanagar, Bangalore',
    locality: 'Jayanagar',
    address: 'Building 14, 11th Main Road, Jayanagar 4th Block, Bengaluru, 560011',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'An international brand delivering standardized excellence. Known worldwide for precision haircuts, customized hair spa therapies, and texture treatments like Keratin and cystine.',
    isLuxury: false,
    offersHomeService: false,
    phone: '+91 80 4355 9900',
    matchScore: 85,
    badges: ['Best for Haircuts', 'Most Booked'],
    services: [
      { id: 'tg-hair-1', name: 'Signature Haircut & Style', category: 'Hair', price: 1600, duration: '45 mins', description: 'Consultation, refreshing shampoo, haircut, and styling by certified stylist.' },
      { id: 'tg-hair-2', name: 'Premium Keratin Treatment', category: 'Hair', price: 7500, duration: '150 mins', description: 'Restructures damaged hair, removes frizz, and adds intense shine for 3-5 months.' },
      { id: 'tg-facial-1', name: 'O2 Brightening Skin Facial', category: 'Skincare', price: 2900, duration: '60 mins', description: 'Oxygen-infused mask to revitalize tired skin, ideal for city dwellers.' }
    ],
    reviews: [
      { id: 'tg-rev-1', author: 'Aishwarya R.', rating: 5, date: '2026-05-18', comment: 'My go-to place for haircuts. Certified stylists who know exact texture matching. My hair feels incredibly bouncy!', tags: ['#Haircut', '#Certified'] },
      { id: 'tg-rev-2', author: 'Shreya Roy', rating: 4, date: '2026-06-01', comment: 'Got the Keratin treatment. Very professionally done. Took around 2.5 hours. A bit pricey but the quality is solid.', tags: ['#Keratin', '#Professional'] }
    ],
    aiReviewSummary: {
      pros: ['Standardized global haircutting protocols', 'Expert texture and Keratin treatments', 'Courteous and expert staff'],
      cons: ['Can feel structured and less customized', 'Often fully booked'],
      summary: 'Toni&Guy Jayanagar is a highly reliable choice for precision haircuts and long-term hair treatments. Booking is highly structured and professional.',
      popularServices: ['Signature Haircut', 'Premium Keratin Treatment']
    }
  },
  {
    id: 'ylg-hsr',
    name: 'YLG Salon',
    rating: 4.4,
    reviewsCount: 150,
    location: 'HSR Layout, Bangalore',
    locality: 'HSR Layout',
    address: 'No. 24, 27th Main Rd, Sector 1, HSR Layout, Bengaluru, 560102',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'You Look Great (YLG) is a household brand in Bangalore offering extremely value-for-money combo packs, express waxing, and premium facial therapies in a clean and safe environment.',
    isLuxury: false,
    offersHomeService: true,
    phone: '+91 80 4099 2211',
    matchScore: 82,
    badges: ['Budget Friendly', 'Home Service Pro'],
    services: [
      { id: 'ylg-wax-1', name: 'Rica Liposoluble Wax Combo', category: 'Skincare', price: 1200, duration: '40 mins', description: 'Pain-free Rica waxing for full arms, underarms, and half legs.' },
      { id: 'ylg-facial-1', name: 'Tan-Clear Herbal Facial', category: 'Skincare', price: 1500, duration: '45 mins', description: 'De-tanning fruit pack and clean-up to counter Bangalore sun damage.' },
      { id: 'ylg-hair-1', name: 'Basic Hair Trimming & Blowdry', category: 'Hair', price: 800, duration: '30 mins', description: 'Quick trim and structured volume blowdry for casual outings.' }
    ],
    reviews: [
      { id: 'ylg-rev-1', author: 'Rupa V.', rating: 4, date: '2026-06-03', comment: 'YLG is the absolute best for routine wax and clean-ups. Super quick, efficient, and they have excellent packages on their app.', tags: ['#ValueForMoney', '#Routine'] },
      { id: 'ylg-rev-2', author: 'Bhavana S.', rating: 5, date: '2026-06-09', comment: 'Tried their home service. The beautician was on time, carried all disposable sheets, and did an amazing job. Very hygienic!', tags: ['#HomeService', '#Hygienic'] }
    ],
    aiReviewSummary: {
      pros: ['Very affordable pricing and combos', 'Top-tier home service sanitation', 'Great for monthly routine beauty tasks'],
      cons: ['Ambiance is simple and functional', 'Not ideal for highly complex creative coloring'],
      summary: 'YLG HSR is a fantastic choice for regular grooming, Rica waxing, and quick clean-ups. Their home-service safety standards are highly praised by local users.',
      popularServices: ['Rica Liposoluble Wax Combo', 'Tan-Clear Herbal Facial']
    }
  },
  {
    id: 'mirror-within-lavelle',
    name: 'Mirror & Within',
    rating: 5.0,
    reviewsCount: 95,
    location: 'Lavelle Road, Bangalore',
    locality: 'Lavelle Road',
    address: 'Ground Floor, Prestige Sunrise, Lavelle Road, Bengaluru, 560001',
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop'
    ],
    description: 'An exclusive boutique salon offering bespoke luxury. Known for personalized consultations where only one client is attended to at a time. Specializes in luxury French haircare (Kérastase) and organic facial oils.',
    isLuxury: true,
    offersHomeService: false,
    phone: '+91 80 4999 0001',
    matchScore: 95,
    badges: ['Luxury Favorite', 'Bespoke VIP'],
    services: [
      { id: 'mw-hair-1', name: 'Kérastase Fusio-Dose Ritual', category: 'Hair', price: 4200, duration: '60 mins', description: 'Ultra-personalized treatment combining hair care concentrated boosters and active ingredients.' },
      { id: 'mw-facial-1', name: 'Rose Gold Shimmer Facial', category: 'Skincare', price: 6800, duration: '75 mins', description: 'Luxury skin infusion using organic Bulgarian rose oils and 24K gold foil flakes.' },
      { id: 'mw-massage-1', name: 'Hot Stone Therapeutic Massage', category: 'Massages', price: 4800, duration: '90 mins', description: 'Warm volcanic stones placed on key energy points to dissolve deep muscle tension.' }
    ],
    reviews: [
      { id: 'mw-rev-1', author: 'Leila D.', rating: 5, date: '2026-05-22', comment: 'An oasis of calm. Booking is hard to get, but when you do, the entire floor is yours. The Rose Gold facial made my skin look flawless before my exhibition.', tags: ['#RoseGold', '#Bespoke'] },
      { id: 'mw-rev-2', author: 'Simran Singh', rating: 5, date: '2026-06-06', comment: 'Fusio-dose has completely saved my frizzy hair. Worth every single rupee. They treat you with fresh jasmine tea and luxury snacks.', tags: ['#Kérastase', '#VIP'] }
    ],
    aiReviewSummary: {
      pros: ['Absolute privacy (VIP feel)', 'Premium Kérastase and organic products', 'Complimentary luxury refreshments'],
      cons: ['Extremely hard to book', 'No drop-ins allowed (reservation only)'],
      summary: 'Mirror & Within is Bangalore’s premier bespoke beauty boutique on Lavelle Road. Excellent for deep-conditioning rituals and specialized facials with absolute VIP exclusivity.',
      popularServices: ['Kérastase Fusio-Dose Ritual', 'Rose Gold Shimmer Facial']
    }
  }
];

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  faceShape: string;
  hairType: string;
  skinTone: string;
  preferredBudget: string; // '₹', '₹₹', '₹₹₹', '₹₹₹₹'
  favoriteServices: string[];
  favoriteSalons: string[];
}

export const MOCK_USER: UserProfile = {
  name: 'Rhea Sen',
  email: 'rhea.sen@auraai.in',
  phone: '+91 98450 12345',
  location: 'Indiranagar, Bangalore',
  faceShape: 'Oval',
  hairType: '2C Wavy',
  skinTone: 'Warm Beige / Olive',
  preferredBudget: '₹₹ - ₹₹₹',
  favoriteServices: ['Advanced Hydra Facial', 'Kérastase Fusio-Dose Ritual'],
  favoriteSalons: ['bodycraft-indiranagar', 'mirror-within-lavelle']
};
