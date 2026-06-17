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
}

interface AppContextType {
  salons: Salon[];
  bookings: Booking[];
  reviews: Review[];
  chatHistory: ChatMessage[];
  userProfile: UserProfile;
  userMemory: UserMemory | null;
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
          });

          // 2. Services collection listener
          unsubServices = onSnapshot(collection(db, 'services'), async (snapshot) => {
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
          });

          // 3. Bookings collection listener
          unsubBookings = onSnapshot(collection(db, 'bookings'), async (snapshot) => {
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
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'Cancelled'
      });
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
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await updateDoc(doc(db, 'bookings', bookingId), {
        status
      });
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
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await updateDoc(doc(db, 'salons', salonId), {
        reviews: updatedReviews,
        rating: newRating,
        reviewsCount: updatedReviews.length
      });
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
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        const storageRef = ref(storage, `salons/${salonId}/${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
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
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await setDoc(doc(db, 'services', serviceId), newService);
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
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await updateDoc(doc(db, 'services', serviceId), {
        serviceName: serviceData.name,
        price: Number(serviceData.price),
        duration: serviceData.duration,
        category: serviceData.category,
        isActive: serviceData.isActive !== false
      });
    }
  };

  // Delete Service
  const deleteService = async (serviceId: string) => {
    if (IS_MOCK) {
      const updated = dbServices.filter(s => s.serviceId !== serviceId);
      setDbServices(updated);
      localStorage.setItem('aura_services', JSON.stringify(updated));
    } else {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      await deleteDoc(doc(db, 'services', serviceId));
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

  return (
    <AppContext.Provider
      value={{
        salons,
        bookings,
        reviews,
        chatHistory,
        userProfile,
        userMemory,
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
        deleteService
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
