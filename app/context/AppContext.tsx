'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_SALONS, MOCK_USER, Salon, Service, Review, UserProfile } from '../data/mockData';
import { IS_MOCK } from '../../lib/firebase';
import { UserMemory, recalculateUserMemory } from '../../lib/userMemory';
import { useAuth } from './AuthContext';

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  createdAt?: string;
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
  comparison?: {
    feature1Comparison: {
      salonName: string;
      rating: number;
      priceRange: string;
      reviewScore: string;
      popularServices: string[];
      aiRecommendationBadge: string;
    }[];
    feature2ReviewIntelligence: {
      salonName: string;
      overallSentiment: string;
      topStrengths: string[];
      commonComplaints: string[];
      mostMentionedServices: string[];
    }[];
    recommendation: {
      recommendedSalonName: string;
      reasonText: string;
    };
  };
}

export interface JourneyStep {
  stepNumber: number;
  title: string;
  description: string;
  timeline: string;
  recommendedService: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface BeautyJourney {
  id: string;
  userId: string;
  goal: string;
  journeyType: 'Bridal' | 'Event Prep' | 'Vacation Glow-Up' | 'Hair Recovery' | 'Skin Recovery' | 'Maintenance';
  durationDays: number;
  steps: JourneyStep[];
  progressPercent: number;
  createdAt: string;
  targetDate: string;
}

export interface BeautyProfile {
  userId: string;
  imageUrl?: string;
  faceShape: string;
  hairType: string;
  hairDensity?: string;
  skinTone: string;
  undertone?: string;
  hairLength: string;
  beautySummary: string;
  recommendedHairstyles: string[];
  recommendedTreatments: string[];
  recommendedMakeupStyles: string[];
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppContextType {
  salons: Salon[];
  bookings: Booking[];
  reviews: Review[];
  chatHistory: ChatMessage[];
  userProfile: UserProfile;
  userMemory: UserMemory | null;
  beautyProfile: BeautyProfile | null;
  isDarkMode: boolean;
  addBooking: (salonId: string, serviceId: string, date: string, time: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  addReview: (salonId: string, rating: number, comment: string, tags?: string[]) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  sendChatMessage: (message: string) => void;
  toggleDarkMode: () => void;
  // Salon CRUD operations
  addSalon: (salonData: any, imageFile: File | null) => Promise<void>;
  updateSalon: (salonId: string, salonData: any, imageFile: File | null) => Promise<void>;
  deleteSalon: (salonId: string) => Promise<void>;
  // Service CRUD operations
  addService: (serviceData: any, salonId: string) => Promise<void>;
  updateService: (serviceId: string, serviceData: any) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  // Journey operations
  activeJourney: BeautyJourney | null;
  saveJourney: (journey: Omit<BeautyJourney, 'id' | 'userId' | 'progressPercent' | 'createdAt'>) => Promise<void>;
  updateJourneyStepStatus: (stepNumber: number, status: JourneyStep['status']) => Promise<void>;
  deleteActiveJourney: () => Promise<void>;
  saveBeautyProfile: (profile: Omit<BeautyProfile, 'userId' | 'lastUpdated'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Underlying DB states
  const [dbSalons, setDbSalons] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);

  // Synchronize user profile with authenticated user session
  useEffect(() => {
    if (user) {
      setUserProfile((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [activeJourney, setActiveJourney] = useState<BeautyJourney | null>(null);
  const [beautyProfile, setBeautyProfile] = useState<BeautyProfile | null>(null);

  // Load and sync Beauty Profile
  useEffect(() => {
    const email = userProfile.email || 'rhea.sen@auraai.in';
    if (IS_MOCK) {
      const savedProfile = localStorage.getItem(`aura_beauty_profile_${email}`);
      if (savedProfile) {
        setBeautyProfile(JSON.parse(savedProfile));
      } else {
        setBeautyProfile(null);
      }
    } else {
      let unsubProfile: any = () => {};
      const listenToProfile = async () => {
        try {
          const { doc, onSnapshot } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          unsubProfile = onSnapshot(doc(db, 'beauty_profiles', email), (docSnap) => {
            if (docSnap.exists()) {
              setBeautyProfile(docSnap.data() as BeautyProfile);
            } else {
              setBeautyProfile(null);
            }
          }, (err) => {
            console.error('Beauty profile snapshot listener error:', err);
          });
        } catch (error) {
          console.error('Failed to listen to beauty profile:', error);
        }
      };
      listenToProfile();
      return () => {
        if (unsubProfile) unsubProfile();
      };
    }
  }, [userProfile.email]);

  // Load and sync active Beauty Journey
  useEffect(() => {
    const email = userProfile.email || 'rhea.sen@auraai.in';
    if (IS_MOCK) {
      const savedJourney = localStorage.getItem(`aura_journey_${email}`);
      if (savedJourney) {
        setActiveJourney(JSON.parse(savedJourney));
      } else {
        setActiveJourney(null);
      }
    } else {
      let unsubJourney: any = () => {};
      const listenToJourney = async () => {
        try {
          const { doc, onSnapshot } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          unsubJourney = onSnapshot(doc(db, 'beauty_journeys', email), (docSnap) => {
            if (docSnap.exists()) {
              setActiveJourney(docSnap.data() as BeautyJourney);
            } else {
              setActiveJourney(null);
            }
          }, (err) => {
            console.error('Beauty journey snapshot listener error:', err);
          });
        } catch (error) {
          console.error('Failed to listen to beauty journey:', error);
        }
      };
      listenToJourney();
      return () => {
        if (unsubJourney) unsubJourney();
      };
    }
  }, [userProfile.email]);

  // Load state from localStorage or Firestore on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('aura_dark_mode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

    // Load Salons, Services, and Bookings
    if (IS_MOCK) {
      // 1. Salons
      const savedSalons = localStorage.getItem('aura_salons');
      if (savedSalons) {
        setDbSalons(JSON.parse(savedSalons));
      } else {
        // Strip services before storing so they live in services DB
        const salonsOnly = MOCK_SALONS.map(({ services, ...s }) => s);
        setDbSalons(salonsOnly);
        localStorage.setItem('aura_salons', JSON.stringify(salonsOnly));
      }

      // 2. Services
      const savedServices = localStorage.getItem('aura_services');
      if (savedServices) {
        setDbServices(JSON.parse(savedServices));
      } else {
        const initialServices: any[] = [];
        MOCK_SALONS.forEach((salon) => {
          salon.services.forEach((s) => {
            initialServices.push({
              serviceId: s.id,
              salonId: salon.id,
              serviceName: s.name,
              price: s.price,
              duration: s.duration,
              category: s.category,
              isActive: true,
              createdAt: new Date().toISOString()
            });
          });
        });
        setDbServices(initialServices);
        localStorage.setItem('aura_services', JSON.stringify(initialServices));
      }

      // 3. Bookings
      const savedBookings = localStorage.getItem('aura_bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
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
            status: 'Confirmed',
            createdAt: new Date().toISOString()
          }
        ];
        setBookings(initial);
        localStorage.setItem('aura_bookings', JSON.stringify(initial));
      }
    } else {
      // Real Firebase realtime syncing for all three collections
      let unsubSalons: any = () => {};
      let unsubServices: any = () => {};
      let unsubBookings: any = () => {};

      const initFirestore = async () => {
        try {
          const { collection, onSnapshot, doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');

          // 1. Salons collection listener
          unsubSalons = onSnapshot(collection(db, 'salons'), async (snapshot) => {
            try {
              if (snapshot.empty) {
                console.log('Seeding initial salons...');
                for (const salon of MOCK_SALONS) {
                  // Strip services from salon seeding document
                  const { services, ...salonData } = salon;
                  await setDoc(doc(db, 'salons', salon.id), {
                    salonId: salon.id,
                    name: salonData.name,
                    category: salonData.isLuxury ? 'Luxury' : salonData.offersHomeService ? 'Home Service' : 'Budget',
                    location: salonData.locality,
                    address: salonData.address,
                    phone: salonData.phone,
                    description: salonData.description,
                    rating: salonData.rating,
                    reviewsCount: salonData.reviewsCount,
                    imageUrls: [salonData.image, ...salonData.gallery],
                    createdAt: new Date(),
                    reviews: salonData.reviews,
                    aiReviewSummary: salonData.aiReviewSummary,
                    matchScore: salonData.matchScore,
                    badges: salonData.badges
                  });
                }
              } else {
                const fetched = snapshot.docs.map(d => {
                  const data = d.data();
                  return {
                    id: d.id || data.salonId,
                    name: data.name || '',
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
                    reviews: data.reviews || [],
                    aiReviewSummary: data.aiReviewSummary || { pros: [], cons: [], summary: '' },
                    matchScore: data.matchScore || 95,
                    badges: data.badges || [],
                    status: data.status || 'Open'
                  };
                });
                setDbSalons(fetched);
              }
            } catch (err) {
              console.error('Error handling salons snapshot:', err);
            }
          }, (err) => {
            console.error('Salons snapshot listener error:', err);
          });

          // 2. Services collection listener
          unsubServices = onSnapshot(collection(db, 'services'), async (snapshot) => {
            try {
              if (snapshot.empty) {
                console.log('Seeding initial services...');
                MOCK_SALONS.forEach(async (salon) => {
                  for (const s of salon.services) {
                    await setDoc(doc(db, 'services', s.id), {
                      serviceId: s.id,
                      salonId: salon.id,
                      serviceName: s.name,
                      price: s.price,
                      duration: s.duration,
                      category: s.category,
                      isActive: true,
                      createdAt: new Date()
                    });
                  }
                });
              } else {
                const fetched = snapshot.docs.map(d => {
                  const data = d.data();
                  return {
                    id: d.id || data.serviceId,
                    salonId: data.salonId,
                    name: data.serviceName,
                    price: Number(data.price),
                    duration: data.duration,
                    category: data.category,
                    isActive: data.isActive !== false,
                    createdAt: data.createdAt
                  };
                });
                setDbServices(fetched);
              }
            } catch (err) {
              console.error('Error handling services snapshot:', err);
            }
          }, (err) => {
            console.error('Services snapshot listener error:', err);
          });

          // 3. Bookings collection listener
          unsubBookings = onSnapshot(collection(db, 'bookings'), async (snapshot) => {
            try {
              if (snapshot.empty) {
                console.log('Seeding initial bookings...');
                const initialId = 'mock-b-1';
                await setDoc(doc(db, 'bookings', initialId), {
                  id: initialId,
                  salonId: 'bodycraft-indiranagar',
                  salonName: 'Bodycraft Salon & Spa',
                  serviceId: 'bc-facial-1',
                  serviceName: 'Advanced Hydra Facial',
                  price: 4500,
                  date: '2026-06-18',
                  time: '11:00 AM',
                  status: 'Confirmed',
                  createdAt: new Date().toISOString()
                });
              } else {
                const fetched = snapshot.docs.map(d => {
                  const data = d.data();
                  return {
                    id: d.id,
                    salonId: data.salonId,
                    salonName: data.salonName,
                    serviceId: data.serviceId,
                    serviceName: data.serviceName,
                    price: Number(data.price),
                    date: data.date,
                    time: data.time,
                    status: data.status,
                    createdAt: data.createdAt
                  };
                }) as Booking[];
                setBookings(fetched);
              }
            } catch (err) {
              console.error('Error handling bookings snapshot:', err);
            }
          }, (err) => {
            console.error('Bookings snapshot listener error:', err);
          });

        } catch (error) {
          console.error('Failed to initialize Firestore listener:', error);
        }
      };

      initFirestore();
      return () => {
        unsubSalons();
        unsubServices();
        unsubBookings();
      };
    }
  }, []);

  // Combined selector that maps services back to their parent salons for user UI
  const salons = useMemo(() => {
    return dbSalons.map((salon) => {
      const salonServices = dbServices
        .filter((s) => s.salonId === salon.id)
        .map((s) => ({
          id: s.id || s.serviceId,
          name: s.name || s.serviceName,
          price: s.price,
          duration: s.duration,
          category: s.category,
          description: s.description || 'Verified salon catalog option.',
          isActive: s.isActive
        }));
      return {
        ...salon,
        services: salonServices
      };
    });
  }, [dbSalons, dbServices]);

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

  // Save Journey
  const saveJourney = async (journeyData: Omit<BeautyJourney, 'id' | 'userId' | 'progressPercent' | 'createdAt'>) => {
    const email = userProfile.email || 'rhea.sen@auraai.in';
    const completedCount = journeyData.steps.filter(s => s.status === 'Completed').length;
    const progressPercent = journeyData.steps.length > 0 
      ? Math.round((completedCount / journeyData.steps.length) * 100) 
      : 0;

    const newJourney: BeautyJourney = {
      ...journeyData,
      id: email,
      userId: email,
      progressPercent,
      createdAt: new Date().toISOString()
    };

    if (IS_MOCK) {
      setActiveJourney(newJourney);
      localStorage.setItem(`aura_journey_${email}`, JSON.stringify(newJourney));
    } else {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await setDoc(doc(db, 'beauty_journeys', email), newJourney);
      } catch (error: any) {
        console.error('Failed to save beauty journey to Firestore, falling back to local storage:', error);
        setActiveJourney(newJourney);
        localStorage.setItem(`aura_journey_${email}`, JSON.stringify(newJourney));
        alert('Could not save journey to cloud. It has been saved locally on your device.');
      }
    }
  };

  // Update step status
  const updateJourneyStepStatus = async (stepNumber: number, status: JourneyStep['status']) => {
    if (!activeJourney) return;
    const email = userProfile.email || 'rhea.sen@auraai.in';

    const updatedSteps = activeJourney.steps.map(s => 
      s.stepNumber === stepNumber ? { ...s, status } : s
    );

    const completedCount = updatedSteps.filter(s => s.status === 'Completed').length;
    const progressPercent = updatedSteps.length > 0 
      ? Math.round((completedCount / updatedSteps.length) * 100) 
      : 0;

    const updatedJourney: BeautyJourney = {
      ...activeJourney,
      steps: updatedSteps,
      progressPercent
    };

    if (IS_MOCK) {
      setActiveJourney(updatedJourney);
      localStorage.setItem(`aura_journey_${email}`, JSON.stringify(updatedJourney));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'beauty_journeys', email), {
          steps: updatedSteps,
          progressPercent
        });
      } catch (error: any) {
        console.error('Failed to update journey step status in Firestore, falling back to local storage:', error);
        setActiveJourney(updatedJourney);
        localStorage.setItem(`aura_journey_${email}`, JSON.stringify(updatedJourney));
        alert('Could not update journey status in cloud. It has been saved locally on your device.');
      }
    }
  };

  // Delete active journey
  const deleteActiveJourney = async () => {
    const email = userProfile.email || 'rhea.sen@auraai.in';
    if (IS_MOCK) {
      setActiveJourney(null);
      localStorage.removeItem(`aura_journey_${email}`);
    } else {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await deleteDoc(doc(db, 'beauty_journeys', email));
        setActiveJourney(null);
      } catch (error: any) {
        console.error('Failed to delete beauty journey from Firestore, falling back to local storage:', error);
        setActiveJourney(null);
        localStorage.removeItem(`aura_journey_${email}`);
        alert('Could not delete journey from cloud. It has been removed locally on your device.');
      }
    }
  };

  // Create Booking
  const addBooking = async (salonId: string, serviceId: string, date: string, time: string) => {
    const salon = salons.find((s: any) => s.id === salonId);
    const service = salon?.services.find((s: any) => s.id === serviceId);
    if (!salon || !service) return;

    const bookingId = `booking-${Date.now()}`;
    const newBooking: Booking = {
      id: bookingId,
      salonId,
      salonName: salon.name,
      serviceId,
      serviceName: service.name,
      price: service.price,
      date,
      time,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    if (IS_MOCK) {
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem('aura_bookings', JSON.stringify(updated));
    } else {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await setDoc(doc(db, 'bookings', bookingId), {
          id: bookingId,
          salonId,
          salonName: newBooking.salonName,
          serviceId,
          serviceName: newBooking.serviceName,
          price: newBooking.price,
          date,
          time,
          status: newBooking.status,
          createdAt: newBooking.createdAt
        });
      } catch (error: any) {
        console.error('Failed to add booking to Firestore, falling back to local storage:', error);
        const updated = [newBooking, ...bookings];
        setBookings(updated);
        localStorage.setItem('aura_bookings', JSON.stringify(updated));
        alert('Could not confirm booking in cloud. It has been saved locally on your device.');
      }
    }
  };

  // Cancel Booking
  const cancelBooking = async (bookingId: string) => {
    if (IS_MOCK) {
      const updated = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b
      );
      setBookings(updated);
      localStorage.setItem('aura_bookings', JSON.stringify(updated));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: 'Cancelled'
        });
      } catch (error: any) {
        console.error('Failed to cancel booking in Firestore, falling back to local storage:', error);
        const updated = bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b
        );
        setBookings(updated);
        localStorage.setItem('aura_bookings', JSON.stringify(updated));
        alert('Could not cancel booking in cloud. The change has been saved locally on your device.');
      }
    }
  };

  // Admin Update Booking Status
  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    if (IS_MOCK) {
      const updated = bookings.map(b => 
        b.id === bookingId ? { ...b, status } : b
      );
      setBookings(updated);
      localStorage.setItem('aura_bookings', JSON.stringify(updated));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'bookings', bookingId), {
          status
        });
      } catch (error: any) {
        console.error('Failed to update booking status in Firestore, falling back to local storage:', error);
        const updated = bookings.map(b => 
          b.id === bookingId ? { ...b, status } : b
        );
        setBookings(updated);
        localStorage.setItem('aura_bookings', JSON.stringify(updated));
        alert('Could not update booking status in cloud. The change has been saved locally on your device.');
      }
    }
  };

  // Submit Review and recalculate salon rating automatically
  const addReview = async (salonId: string, rating: number, comment: string, tags?: string[]) => {
    const targetSalon = dbSalons.find(s => s.id === salonId);
    if (!targetSalon) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: userProfile.name,
      rating,
      date: new Date().toISOString().split('T')[0],
      comment,
      tags: tags || []
    };

    const currentReviews = targetSalon.reviews || [];
    const updatedReviews = [newReview, ...currentReviews];
    const newRating = parseFloat(
      (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
    );

    if (IS_MOCK) {
      const updatedSalons = dbSalons.map(s => {
        if (s.id === salonId) {
          return {
            ...s,
            reviews: updatedReviews,
            rating: newRating,
            reviewsCount: updatedReviews.length
          };
        }
        return s;
      });
      setDbSalons(updatedSalons);
      localStorage.setItem('aura_salons', JSON.stringify(updatedSalons));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'salons', salonId), {
          reviews: updatedReviews,
          rating: newRating,
          reviewsCount: updatedReviews.length
        });
      } catch (error: any) {
        console.error('Failed to add review to Firestore, falling back to local storage:', error);
        const updatedSalons = dbSalons.map(s => {
          if (s.id === salonId) {
            return {
              ...s,
              reviews: updatedReviews,
              rating: newRating,
              reviewsCount: updatedReviews.length
            };
          }
          return s;
        });
        setDbSalons(updatedSalons);
        localStorage.setItem('aura_salons', JSON.stringify(updatedSalons));
        alert('Could not submit review to cloud. It has been saved locally on your device.');
      }
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    localStorage.setItem('aura_profile', JSON.stringify(updated));
  };

  // Extract reviews across all salons
  const reviews = useMemo(() => {
    return dbSalons.flatMap(s => 
      (s.reviews || []).map((r: any) => ({ ...r, salonName: s.name, salonId: s.id }))
    );
  }, [dbSalons]);

  // AI response helper
  const getAIResponse = (text: string): { text: string; recommendations?: ChatMessage['recommendations'] } => {
    const query = text.toLowerCase();

    if (query.includes('facial') || query.includes('skin') || query.includes('hydra')) {
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
          }
        ]
      };
    }
    return {
      text: "I can help you locate the best salons in Bangalore for haircuts, organic facials, bridal packages, and spa massages. Just tell me what neighborhood or budget limitations you have."
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
        try {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const { storage } = await import('../../lib/firebase');
          const storageRef = ref(storage, `salons/${salonId}/${imageFile.name}`);
          const uploadResult = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (storageErr: any) {
          console.error('Firebase Storage failed, falling back to data URL:', storageErr);
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
        }
      }
    }

    const newSalon = {
      id: salonId,
      name: salonData.name,
      rating: 5.0, // Initial default rating
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
      reviews: [],
      aiReviewSummary: { pros: [], cons: [], summary: 'No AI summary logs available yet for this new outlet.' },
      matchScore: 95,
      badges: salonData.category === 'Luxury' ? ['Luxury Favorite'] : salonData.category === 'Home Service' ? ['Home Service Pro'] : ['Budget Friendly'],
      status: salonData.status || 'Open'
    };

    if (IS_MOCK) {
      const updated = [...dbSalons, newSalon];
      setDbSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));
    } else {
      try {
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
          reviewsCount: newSalon.reviewsCount,
          imageUrls: newSalon.gallery,
          createdAt: new Date(),
          reviews: newSalon.reviews,
          aiReviewSummary: newSalon.aiReviewSummary,
          matchScore: newSalon.matchScore,
          badges: newSalon.badges,
          status: newSalon.status
        });
      } catch (error: any) {
        console.error('Failed to add salon to Firestore, falling back to local storage:', error);
        const updated = [...dbSalons, newSalon];
        setDbSalons(updated);
        localStorage.setItem('aura_salons', JSON.stringify(updated));
        alert('Could not save salon to cloud. It has been saved locally on your device.');
      }
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
        try {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const { storage } = await import('../../lib/firebase');
          const storageRef = ref(storage, `salons/${salonId}/${imageFile.name}`);
          const uploadResult = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (storageErr: any) {
          console.error('Firebase Storage failed, falling back to data URL:', storageErr);
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
        }
      }
    }

    const currentSalon = dbSalons.find(s => s.id === salonId);
    const updatedSalon = {
      ...currentSalon,
      id: salonId,
      name: salonData.name,
      location: salonData.location,
      locality: salonData.locality || salonData.location.split(',')[0].trim() as any,
      address: salonData.address,
      image: imageUrl || currentSalon?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
      gallery: imageUrl ? [imageUrl, ...(currentSalon?.gallery || [])] : (currentSalon?.gallery || []),
      description: salonData.description,
      isLuxury: salonData.category === 'Luxury',
      offersHomeService: salonData.category === 'Home Service',
      phone: salonData.phone,
      badges: salonData.category === 'Luxury' ? ['Luxury Favorite'] : salonData.category === 'Home Service' ? ['Home Service Pro'] : ['Budget Friendly'],
      status: salonData.status || currentSalon?.status || 'Open'
    };

    if (IS_MOCK) {
      const updated = dbSalons.map(s => s.id === salonId ? updatedSalon : s);
      setDbSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'salons', salonId), {
          name: updatedSalon.name,
          category: salonData.category,
          location: updatedSalon.location,
          address: updatedSalon.address,
          phone: updatedSalon.phone,
          description: updatedSalon.description,
          imageUrls: updatedSalon.gallery,
          badges: updatedSalon.badges,
          status: updatedSalon.status
        });
      } catch (error: any) {
        console.error('Failed to update salon in Firestore, falling back to local storage:', error);
        const updated = dbSalons.map(s => s.id === salonId ? updatedSalon : s);
        setDbSalons(updated);
        localStorage.setItem('aura_salons', JSON.stringify(updated));
        alert('Could not update salon in cloud. The changes have been saved locally on your device.');
      }
    }
  };

  // Delete Salon method
  const deleteSalon = async (salonId: string) => {
    if (IS_MOCK) {
      const updated = dbSalons.filter(s => s.id !== salonId);
      setDbSalons(updated);
      localStorage.setItem('aura_salons', JSON.stringify(updated));

      // Cascade delete services
      const filteredServices = dbServices.filter(s => s.salonId !== salonId);
      setDbServices(filteredServices);
      localStorage.setItem('aura_services', JSON.stringify(filteredServices));
    } else {
      try {
        const { doc, deleteDoc, collection, query, where, getDocs, writeBatch } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await deleteDoc(doc(db, 'salons', salonId));

        // Cascade delete services in Firestore
        const q = query(collection(db, 'services'), where('salonId', '==', salonId));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.docs.forEach((docRef) => {
          batch.delete(docRef.ref);
        });
        await batch.commit();
      } catch (error: any) {
        console.error('Failed to delete salon from Firestore, falling back to local storage:', error);
        const updated = dbSalons.filter(s => s.id !== salonId);
        setDbSalons(updated);
        localStorage.setItem('aura_salons', JSON.stringify(updated));

        const filteredServices = dbServices.filter(s => s.salonId !== salonId);
        setDbServices(filteredServices);
        localStorage.setItem('aura_services', JSON.stringify(filteredServices));
        alert('Could not delete salon from cloud. It has been removed locally on your device.');
      }
    }
  };

  // Add Service
  const addService = async (serviceData: any, salonId: string) => {
    const serviceId = `service-${Date.now()}`;
    const newService = {
      serviceId,
      salonId,
      serviceName: serviceData.name,
      price: Number(serviceData.price),
      duration: serviceData.duration,
      category: serviceData.category,
      isActive: serviceData.isActive !== false,
      createdAt: new Date().toISOString()
    };

    if (IS_MOCK) {
      const updated = [...dbServices, newService];
      setDbServices(updated);
      localStorage.setItem('aura_services', JSON.stringify(updated));
    } else {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await setDoc(doc(db, 'services', serviceId), newService);
      } catch (error: any) {
        console.error('Failed to add service to Firestore, falling back to local storage:', error);
        const updated = [...dbServices, newService];
        setDbServices(updated);
        localStorage.setItem('aura_services', JSON.stringify(updated));
        alert('Could not add service to cloud. It has been saved locally on your device.');
      }
    }
  };

  // Edit Service
  const updateService = async (serviceId: string, serviceData: any) => {
    if (IS_MOCK) {
      const updated = dbServices.map(s => {
        if (s.serviceId === serviceId) {
          return {
            ...s,
            serviceName: serviceData.name,
            price: Number(serviceData.price),
            duration: serviceData.duration,
            category: serviceData.category,
            isActive: serviceData.isActive !== false
          };
        }
        return s;
      });
      setDbServices(updated);
      localStorage.setItem('aura_services', JSON.stringify(updated));
    } else {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await updateDoc(doc(db, 'services', serviceId), {
          serviceName: serviceData.name,
          price: Number(serviceData.price),
          duration: serviceData.duration,
          category: serviceData.category,
          isActive: serviceData.isActive !== false
        });
      } catch (error: any) {
        console.error('Failed to update service in Firestore, falling back to local storage:', error);
        const updated = dbServices.map(s => {
          if (s.serviceId === serviceId) {
            return {
              ...s,
              serviceName: serviceData.name,
              price: Number(serviceData.price),
              duration: serviceData.duration,
              category: serviceData.category,
              isActive: serviceData.isActive !== false
            };
          }
          return s;
        });
        setDbServices(updated);
        localStorage.setItem('aura_services', JSON.stringify(updated));
        alert('Could not update service in cloud. The changes have been saved locally on your device.');
      }
    }
  };

  // Delete Service
  const deleteService = async (serviceId: string) => {
    if (IS_MOCK) {
      const updated = dbServices.filter(s => s.serviceId !== serviceId);
      setDbServices(updated);
      localStorage.setItem('aura_services', JSON.stringify(updated));
    } else {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await deleteDoc(doc(db, 'services', serviceId));
      } catch (error: any) {
        console.error('Failed to delete service from Firestore, falling back to local storage:', error);
        const updated = dbServices.filter(s => s.serviceId !== serviceId);
        setDbServices(updated);
        localStorage.setItem('aura_services', JSON.stringify(updated));
        alert('Could not delete service from cloud. It has been removed locally on your device.');
      }
    }
  };

  // Reactive User Memory Syncing & Computation
  useEffect(() => {
    if (salons.length === 0) return;

    const email = userProfile.email || 'rhea.sen@auraai.in';
    const computedMemory = recalculateUserMemory(bookings, reviews, salons, email);

    // Sync favorite salons from userProfile
    computedMemory.favoriteSalons = userProfile.favoriteSalons || [];

    setUserMemory(computedMemory);

    const persistMemory = async () => {
      if (IS_MOCK) {
        localStorage.setItem('aura_user_memory', JSON.stringify(computedMemory));
      } else {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          await setDoc(doc(db, 'user_memory', email), computedMemory);
        } catch (error) {
          console.error('Failed to sync user memory to Firestore:', error);
        }
      }
    };

    persistMemory();
  }, [bookings, reviews, salons, userProfile.email, userProfile.favoriteSalons]);

  // Save Beauty Profile to Firestore / localStorage and update userProfile fields
  const saveBeautyProfile = async (profileData: Omit<BeautyProfile, 'userId' | 'lastUpdated'>) => {
    const email = userProfile.email || 'rhea.sen@auraai.in';
    const nowIso = new Date().toISOString();
    let finalImageUrl = profileData.imageUrl;

    if (!IS_MOCK && profileData.imageUrl?.startsWith('data:')) {
      try {
        const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        const storageRef = ref(storage, `beauty_profiles/${email}/selfie.jpg`);
        const uploadResult = await uploadString(storageRef, profileData.imageUrl, 'data_url');
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      } catch (uploadErr) {
        console.error('Failed to upload profile picture to Firebase Storage:', uploadErr);
      }
    }

    const newProfile: BeautyProfile = {
      ...profileData,
      imageUrl: finalImageUrl,
      userId: email,
      lastUpdated: nowIso,
      createdAt: beautyProfile?.createdAt || nowIso,
      updatedAt: nowIso
    };

    if (IS_MOCK) {
      setBeautyProfile(newProfile);
      localStorage.setItem(`aura_beauty_profile_${email}`, JSON.stringify(newProfile));
    } else {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await setDoc(doc(db, 'beauty_profiles', email), newProfile);
      } catch (error: any) {
        console.error('Failed to save beauty profile to Firestore, falling back to local storage:', error);
        setBeautyProfile(newProfile);
        localStorage.setItem(`aura_beauty_profile_${email}`, JSON.stringify(newProfile));
        alert('Could not save beauty profile to cloud. It has been saved locally on your device.');
      }
    }

    // Sync changes back to the main user profile
    updateProfile({
      faceShape: profileData.faceShape,
      hairType: profileData.hairType,
      skinTone: profileData.skinTone
    });
  };

  return (
    <AppContext.Provider
      value={{
        salons,
        bookings,
        reviews,
        chatHistory,
        userProfile,
        userMemory,
        beautyProfile,
        isDarkMode,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        addReview,
        updateProfile,
        sendChatMessage,
        toggleDarkMode,
        addSalon,
        updateSalon,
        deleteSalon,
        addService,
        updateService,
        deleteService,
        activeJourney,
        saveJourney,
        updateJourneyStepStatus,
        deleteActiveJourney,
        saveBeautyProfile
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
