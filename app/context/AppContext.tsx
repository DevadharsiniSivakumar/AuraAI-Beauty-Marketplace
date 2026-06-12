'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_SALONS, MOCK_USER, Salon, Service, Review, UserProfile } from '../data/mockData';
import { IS_MOCK } from '../../lib/firebase';

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: string;
  recommendations?: {
    type: 'salon' | 'service';
    id: string;
    name: string;
    price?: number;
    salonId?: string;
    details?: string;
    matchScore?: number;
    reasons?: string[];
    memoryIndicator?: string;
  }[];
}

interface AppContextType {
  salons: Salon[];
  bookings: Booking[];
  reviews: Review[];
  chatHistory: ChatMessage[];
  userProfile: UserProfile;
  isDarkMode: boolean;
  addBooking: (salonId: string, serviceId: string, date: string, time: string) => void;
  cancelBooking: (bookingId: string) => void;
  addReview: (salonId: string, rating: number, comment: string, tags?: string[]) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  sendChatMessage: (message: string) => void;
  toggleDarkMode: () => void;
  // Salon CRUD operations
  addSalon: (salonData: any, imageFile: File | null) => Promise<void>;
  updateSalon: (salonId: string, salonData: any, imageFile: File | null) => Promise<void>;
  deleteSalon: (salonId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load state from localStorage or Firestore on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('aura_dark_mode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedBookings = localStorage.getItem('aura_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      // Default initial mock booking
      const initial: Booking[] = [
        {
          id: 'mock-b-1',
          salonId: 'bodycraft-indiranagar',
          salonName: 'Bodycraft Salon & Spa',
          serviceId: 'bc-facial-1',
          serviceName: 'Advanced Hydra Facial',
          price: 4500,
          date: '2026-06-18',
          time: '11:00 AM',
          status: 'Confirmed'
        }
      ];
      setBookings(initial);
      localStorage.setItem('aura_bookings', JSON.stringify(initial));
    }

    const savedProfile = localStorage.getItem('aura_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedChat = localStorage.getItem('aura_chat');
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    } else {
      const initialChat: ChatMessage[] = [
        {
          id: 'welcome-msg',
          sender: 'aura',
          text: `Hello ${MOCK_USER.name.split(' ')[0]}! I'm Aura, your personal AI Beauty Concierge. Whether you're looking for a relaxing hydra facial, top-tier styling in Indiranagar, or preparing for an upcoming wedding, tell me what you need and I'll find the perfect options for you.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setChatHistory(initialChat);
      localStorage.setItem('aura_chat', JSON.stringify(initialChat));
    }

    // Load Salons
    if (IS_MOCK) {
      const savedSalons = localStorage.getItem('aura_salons');
      if (savedSalons) {
        setSalons(JSON.parse(savedSalons));
      } else {
        setSalons(MOCK_SALONS);
        localStorage.setItem('aura_salons', JSON.stringify(MOCK_SALONS));
      }
    } else {
      // Real Firebase realtime syncing
      let unsubscribe: any = () => {};
      const initFirestoreSalons = async () => {
        try {
          const { collection, onSnapshot, doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');

          unsubscribe = onSnapshot(collection(db, 'salons'), async (snapshot) => {
            if (snapshot.empty) {
              console.log('Firestore salons collection is empty. Seeding initial mock salons...');
              for (const salon of MOCK_SALONS) {
                await setDoc(doc(db, 'salons', salon.id), {
                  salonId: salon.id,
                  name: salon.name,
                  category: salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget',
                  location: salon.locality,
                  address: salon.address,
                  phone: salon.phone,
                  description: salon.description,
                  rating: salon.rating,
                  imageUrls: [salon.image, ...salon.gallery],
                  createdAt: new Date(),
                  services: salon.services,
                  reviews: salon.reviews,
                  aiReviewSummary: salon.aiReviewSummary,
                  matchScore: salon.matchScore,
                  badges: salon.badges
                });
              }
            } else {
              const fetchedSalons: Salon[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id || data.salonId,
                  name: data.name || 'Aura Outlet',
                  rating: Number(data.rating) || 5.0,
                  reviewsCount: data.reviewsCount || data.reviews?.length || 0,
                  location: data.location || '',
                  locality: data.locality || data.location?.split(',')[0]?.trim() || 'Indiranagar',
                  address: data.address || '',
                  image: data.imageUrls?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
                  gallery: data.imageUrls || [],
                  description: data.description || '',
                  isLuxury: data.category === 'Luxury',
                  offersHomeService: data.category === 'Home Service',
                  phone: data.phone || '',
                  services: data.services || [],
                  reviews: data.reviews || [],
                  aiReviewSummary: data.aiReviewSummary || { pros: [], cons: [], summary: '' },
                  matchScore: data.matchScore || 95,
                  badges: data.badges || (data.category === 'Luxury' ? ['Luxury Favorite'] : data.category === 'Home Service' ? ['Home Service Pro'] : ['Budget Friendly'])
                };
              });
              setSalons(fetchedSalons);
            }
          });
        } catch (error) {
          console.error('Failed to initialize Firestore salons listener:', error);
        }
      };

      initFirestoreSalons();
      return () => unsubscribe();
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('aura_dark_mode', String(nextMode));
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addBooking = (salonId: string, serviceId: string, date: string, time: string) => {
    const salon = salons.find(s => s.id === salonId);
    const service = salon?.services.find(s => s.id === serviceId);
    if (!salon || !service) return;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      salonId,
      salonName: salon.name,
      serviceId,
      serviceName: service.name,
      price: service.price,
      date,
      time,
      status: 'Confirmed'
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('aura_bookings', JSON.stringify(updated));
  };

  const cancelBooking = (bookingId: string) => {
    const updated = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b
    );
    setBookings(updated);
    localStorage.setItem('aura_bookings', JSON.stringify(updated));
  };

  const addReview = (salonId: string, rating: number, comment: string, tags?: string[]) => {
    const targetSalon = salons.find(s => s.id === salonId);
    if (!targetSalon) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: userProfile.name,
      rating,
      date: new Date().toISOString().split('T')[0],
      comment,
      tags: tags || []
    };

    const updatedReviews = [newReview, ...targetSalon.reviews];
    const newRating = parseFloat(
      ((targetSalon.rating * targetSalon.reviewsCount + rating) / (targetSalon.reviewsCount + 1)).toFixed(1)
    );

    const updatedSalons = salons.map(s => {
      if (s.id === salonId) {
        return {
          ...s,
          reviews: updatedReviews,
          rating: newRating,
          reviewsCount: s.reviewsCount + 1
        };
      }
      return s;
    });

    setSalons(updatedSalons);
    localStorage.setItem('aura_salons', JSON.stringify(updatedSalons));
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    localStorage.setItem('aura_profile', JSON.stringify(updated));
  };

  // Extract all reviews across all salons
  const reviews = salons.flatMap(s => 
    (s.reviews || []).map(r => ({ ...r, salonName: s.name, salonId: s.id }))
  ) as any;

  // AI response helper
  const getAIResponse = (text: string): { text: string; recommendations?: ChatMessage['recommendations'] } => {
    const query = text.toLowerCase();

    if (query.includes('facial') || query.includes('skin') || query.includes('hydra')) {
      const isUnder3k = query.includes('3000') || query.includes('3k') || query.includes('under');
      if (isUnder3k) {
        return {
          text: "I found a great option matching your budget! Bodycraft Salon in Indiranagar offers an Brightening Peel for ₹2,800, or YLG HSR has their Tan-Clear Herbal Facial for ₹1,500. However, if you can stretch your budget slightly, the Advanced Hydra Facial at Bodycraft for ₹4,500 is highly recommended by local users for city dust recovery.",
          recommendations: [
            { 
              type: 'service', 
              id: 'bc-skincare-2', 
              name: 'Brightening Peel (₹2,800)', 
              price: 2800, 
              salonId: 'bodycraft-indiranagar', 
              details: 'Bodycraft Salon & Spa',
              matchScore: 96,
              reasons: ['Matches your budget limit (under ₹3000)', 'Highly rated for quick skin brightening', 'Located in Indiranagar (your preferred neighborhood)'],
              memoryIndicator: 'Based on your preferred budget constraints and skin profile...'
            },
            { 
              type: 'service', 
              id: 'ylg-facial-1', 
              name: 'Tan-Clear Herbal Facial (₹1,500)', 
              price: 1500, 
              salonId: 'ylg-hsr', 
              details: 'YLG HSR',
              matchScore: 82,
              reasons: ['Extremely budget friendly', 'Excellent for de-tanning skin cleanups', 'Located in HSR Layout'],
              memoryIndicator: 'Based on your preferred budget constraints...'
            }
          ]
        };
      }
      return {
        text: "For skincare, I highly recommend the Advanced Hydra Facial at Bodycraft Salon & Spa in Indiranagar. It has an aggregate rating of 4.8/5, and users praise its deep cleaning and instant skin radiance. Another premium choice is the Rose Gold Shimmer Facial at Mirror & Within on Lavelle Road.",
        recommendations: [
          { 
            type: 'service', 
            id: 'bc-facial-1', 
            name: 'Advanced Hydra Facial', 
            price: 4500, 
            salonId: 'bodycraft-indiranagar', 
            details: 'Bodycraft Salon & Spa',
            matchScore: 96,
            reasons: ['Fits your exact Indiranagar location preference', 'You booked this 24 days ago and rated it highly', 'Highly rated for deep hydration by similar users'],
            memoryIndicator: 'Based on your previous Hydra Facial bookings and high rating...'
          },
          { 
            type: 'service', 
            id: 'mw-facial-1', 
            name: 'Rose Gold Shimmer Facial', 
            price: 6800, 
            salonId: 'mirror-within-lavelle', 
            details: 'Mirror & Within',
            matchScore: 95,
            reasons: ['Matches your luxury standard preference', 'Uses premium organic oils suitable for warm beige skin tone', 'Exclusive 1-on-1 private VIP service'],
            memoryIndicator: 'Based on your preference for luxury bespoke experiences...'
          }
        ]
      };
    }

    if (query.includes('indiranagar')) {
      return {
        text: "In Indiranagar, Bodycraft Salon & Spa is the clear favorite. They have a 4.8-star rating over 340+ reviews. They offer expert services in creative coloring (Balayage) and clinical skincare, plus they offer Home Service in Indiranagar too!",
        recommendations: [
          { 
            type: 'salon', 
            id: 'bodycraft-indiranagar', 
            name: 'Bodycraft Salon & Spa', 
            details: '100 Feet Rd, Indiranagar',
            matchScore: 96,
            reasons: ['Located in Indiranagar (your preferred neighborhood)', 'You rated them 5 stars on your previous visit', 'Offers premium home service options'],
            memoryIndicator: 'Based on your neighborhood profile preference and booking history...'
          }
        ]
      };
    }

    if (query.includes('luxury') || query.includes('expensive') || query.includes('vip') || query.includes('ub city') || query.includes('lavelle')) {
      return {
        text: "For high-end, premium VIP experiences in Bangalore, Play Salon inside UB City and Mirror & Within on Lavelle Road are elite. Mirror & Within offers complete privacy as they only host one client on the floor at a time.",
        recommendations: [
          { 
            type: 'salon', 
            id: 'mirror-within-lavelle', 
            name: 'Mirror & Within', 
            details: 'Lavelle Road',
            matchScore: 95,
            reasons: ['VIP bespoke salon matching your luxury tag preference', '100% private single-client scheduling', 'Highly rated for scalp and hair rituals'],
            memoryIndicator: 'Based on your preference for luxury salons...'
          },
          { 
            type: 'salon', 
            id: 'play-salon-vittal-mallya', 
            name: 'Play Salon', 
            details: 'UB City',
            matchScore: 91,
            reasons: ['Elite UB City retail ambiance', 'Celebrity stylists on site', 'Complementary gourmet hospitality'],
            memoryIndicator: 'Based on your preference for luxury salons...'
          }
        ]
      };
    }

    if (query.includes('wedding') || query.includes('bridal') || query.includes('marry') || query.includes('makeup')) {
      return {
        text: "Congratulations! Preparing for your big day? Play Salon at UB City offers an Elite Bridal Makeup & Draping package for ₹25,000, managed by celebrity makeup artists. I've linked it below. You can book a preliminary consultation directly.",
        recommendations: [
          { 
            type: 'service', 
            id: 'play-bridal-1', 
            name: 'Elite Bridal Makeup & Draping', 
            price: 25000, 
            salonId: 'play-salon-vittal-mallya', 
            details: 'Play Salon (UB City)',
            matchScore: 91,
            reasons: ['Celebrity-grade wedding styling profile', 'Includes complete draping and styling support', 'Private dressing cabinets available'],
            memoryIndicator: 'Recognizing your wedding countdown timeline...'
          }
        ]
      };
    }

    if (query.includes('haircut') || query.includes('hair') || query.includes('style') || query.includes('cut')) {
      return {
        text: "For a signature haircut, Toni&Guy in Jayanagar has highly certified stylists for ₹1,600. If you are looking for celebrity-grade shape customization, the French Precision Haircut at Play Salon (UB City) for ₹3,000 is unmatched.",
        recommendations: [
          { 
            type: 'service', 
            id: 'tg-hair-1', 
            name: 'Signature Haircut', 
            price: 1600, 
            salonId: 'toni-guy-jayanagar', 
            details: 'Toni&Guy Jayanagar',
            matchScore: 85,
            reasons: ['Great texture shaping for 2C Wavy hair types', 'Affordable certified stylists', 'Standardized hair wash included'],
            memoryIndicator: 'Based on your 2C Wavy hair topography profile...'
          },
          { 
            type: 'service', 
            id: 'play-hair-1', 
            name: 'Precision French Haircut', 
            price: 3000, 
            salonId: 'play-salon-vittal-mallya', 
            details: 'Play Salon (UB City)',
            matchScore: 91,
            reasons: ['Art Director custom contouring matches Oval Face contours', 'Highly rated for precision texturing', 'UB City premium consultation included'],
            memoryIndicator: 'Based on your Oval Face Shape and hair type...'
          }
        ]
      };
    }

    // Default response
    return {
      text: "I can help you locate the best salons in Bangalore for haircuts, organic facials, bridal packages, and spa massages. Just type a location (e.g. Indiranagar, UB City, HSR Layout), a budget limits, or service goals like 'Kérastase scalp therapy'."
    };
  };

  const sendChatMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    localStorage.setItem('aura_chat', JSON.stringify(newHistory));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(messageText);
      const auraMsg: ChatMessage = {
        id: `msg-${Date.now()}-aura`,
        sender: 'aura',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: aiResponse.recommendations
      };
      
      setChatHistory(prev => {
        const updated = [...prev, auraMsg];
        localStorage.setItem('aura_chat', JSON.stringify(updated));
        return updated;
      });
    }, 1200);
  };

  // Add Salon method (Firestore or localStorage fallback)
  const addSalon = async (salonData: any, imageFile: File | null) => {
    const salonId = salonData.id || `salon-${Date.now()}`;
    let imageUrl = salonData.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop';

    if (imageFile) {
      if (IS_MOCK) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      } else {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        const storageRef = ref(storage, `salons/${salonId}/${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
    }

    const newSalon: Salon = {
      id: salonId,
      name: salonData.name,
      rating: Number(salonData.rating) || 5.0,
      reviewsCount: 0,
      location: salonData.location,
      locality: salonData.locality || salonData.location.split(',')[0].trim() as any,
      address: salonData.address,
      image: imageUrl,
      gallery: [imageUrl],
      description: salonData.description,
      isLuxury: salonData.category === 'Luxury',
      offersHomeService: salonData.category === 'Home Service',
      phone: salonData.phone,
      services: [],
      reviews: [],
      aiReviewSummary: { pros: [], cons: [], summary: 'No AI summary logs available yet for this new outlet.' },
      matchScore: 95,
      badges: salonData.category === 'Luxury' ? ['Luxury Favorite'] : salonData.category === 'Home Service' ? ['Home Service Pro'] : ['Budget Friendly']
    };

    if (IS_MOCK) {
      const updated = [...salons, newSalon];
      setSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));
    } else {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await setDoc(doc(db, 'salons', salonId), {
        salonId,
        name: newSalon.name,
        category: salonData.category,
        location: newSalon.location,
        address: newSalon.address,
        phone: newSalon.phone,
        description: newSalon.description,
        rating: newSalon.rating,
        imageUrls: newSalon.gallery,
        createdAt: new Date(),
        services: newSalon.services,
        reviews: newSalon.reviews,
        aiReviewSummary: newSalon.aiReviewSummary,
        matchScore: newSalon.matchScore,
        badges: newSalon.badges
      });
    }
  };

  // Edit Salon method
  const updateSalon = async (salonId: string, salonData: any, imageFile: File | null) => {
    let imageUrl = salonData.image;

    if (imageFile) {
      if (IS_MOCK) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      } else {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        const storageRef = ref(storage, `salons/${salonId}/${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
    }

    const currentSalon = salons.find(s => s.id === salonId);
    const updatedSalon: Salon = {
      ...currentSalon,
      id: salonId,
      name: salonData.name,
      rating: Number(salonData.rating) || currentSalon?.rating || 5.0,
      location: salonData.location,
      locality: salonData.locality || salonData.location.split(',')[0].trim() as any,
      address: salonData.address,
      image: imageUrl || currentSalon?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
      gallery: imageUrl ? [imageUrl, ...(currentSalon?.gallery || [])] : (currentSalon?.gallery || []),
      description: salonData.description,
      isLuxury: salonData.category === 'Luxury',
      offersHomeService: salonData.category === 'Home Service',
      phone: salonData.phone,
      badges: salonData.category === 'Luxury' ? ['Luxury Favorite'] : salonData.category === 'Home Service' ? ['Home Service Pro'] : ['Budget Friendly']
    } as Salon;

    if (IS_MOCK) {
      const updated = salons.map(s => s.id === salonId ? updatedSalon : s);
      setSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));
    } else {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await updateDoc(doc(db, 'salons', salonId), {
        name: updatedSalon.name,
        category: salonData.category,
        location: updatedSalon.location,
        address: updatedSalon.address,
        phone: updatedSalon.phone,
        description: updatedSalon.description,
        rating: updatedSalon.rating,
        imageUrls: updatedSalon.gallery,
        badges: updatedSalon.badges
      });
    }
  };

  // Delete Salon method
  const deleteSalon = async (salonId: string) => {
    if (IS_MOCK) {
      const updated = salons.filter(s => s.id !== salonId);
      setSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));
    } else {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await deleteDoc(doc(db, 'salons', salonId));
    }
  };

  return (
    <AppContext.Provider
      value={{
        salons,
        bookings,
        reviews,
        chatHistory,
        userProfile,
        isDarkMode,
        addBooking,
        cancelBooking,
        addReview,
        updateProfile,
        sendChatMessage,
        toggleDarkMode,
        addSalon,
        updateSalon,
        deleteSalon
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
