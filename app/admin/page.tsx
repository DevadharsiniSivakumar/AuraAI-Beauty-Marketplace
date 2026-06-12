'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp, Booking } from '../context/AppContext';
import { IS_MOCK } from '../../lib/firebase';
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Scissors, 
  PlusCircle,
  TrendingUp,
  MessageSquare,
  Trash2,
  Edit2,
  UploadCloud,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  defaultTab?: 'bookings' | 'salons' | 'services' | 'reviews';
}

export default function AdminDashboard({ defaultTab = 'bookings' }: AdminDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    salons, 
    bookings, 
    reviews, 
    cancelBooking, 
    addSalon, 
    updateSalon, 
    deleteSalon,
    addService,
    updateService,
    deleteService,
    updateBookingStatus
  } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'salons' | 'services' | 'reviews'>(defaultTab);

  // Stats State
  const [stats, setStats] = useState({
    users: 1428,
    salons: 0,
    services: 0,
    bookings: 0,
    reviews: 0
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Budget',
    location: 'Indiranagar',
    address: '',
    phone: '',
    description: '',
    image: '',
    status: 'Open'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Service Management State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServiceSalonId, setSelectedServiceSalonId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Hair',
    price: '',
    duration: '60 mins',
    isActive: true
  });

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      let usersCount = 1428;
      if (IS_MOCK) {
        const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
        if (mockUsers.length > 0) {
          usersCount = mockUsers.length;
        }
      } else {
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          const snap = await getDocs(collection(db, 'users'));
          if (!snap.empty) {
            usersCount = snap.size;
          }
        } catch (e) {
          console.error('Failed to load real users stats:', e);
        }
      }

      const totalSalons = salons.length;
      const totalServices = salons.reduce((acc, s) => acc + (s.services?.length || 0), 0);
      const totalReviews = salons.reduce((acc, s) => acc + (s.reviews?.length || 0), 0);
      const totalBookings = bookings.length;

      setStats({
        users: usersCount,
        salons: totalSalons,
        services: totalServices,
        bookings: totalBookings + 234, // Historical offset
        reviews: totalReviews
      });
    };

    fetchStats();
  }, [salons, bookings]);

  // Sync tab state with props changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Navigate on tab change
  const handleTabChange = (tab: 'bookings' | 'salons' | 'services' | 'reviews') => {
    setActiveTab(tab);
    if (tab === 'bookings') {
      router.push('/admin/dashboard');
    } else {
      router.push(`/admin/${tab}`);
    }
  };

  // Moderate / Flag state simulation
  const [flaggedReviews, setFlaggedReviews] = useState<string[]>([]);
  const toggleFlagReview = (id: string) => {
    setFlaggedReviews(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  // CRUD handlers
  const openCreateModal = () => {
    setEditingSalonId(null);
    setFormData({
      name: '',
      category: 'Budget',
      location: 'Indiranagar',
      address: '',
      phone: '',
      description: '',
      image: '',
      status: 'Open'
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (salon: any) => {
    setEditingSalonId(salon.id);
    setFormData({
      name: salon.name,
      category: salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget',
      location: salon.locality || 'Indiranagar',
      address: salon.address,
      phone: salon.phone,
      description: salon.description,
      image: salon.image,
      status: salon.status || 'Open'
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (salonId: string) => {
    if (confirm('Are you sure you want to permanently delete this salon outlet?')) {
      try {
        await deleteSalon(salonId);
      } catch (err: any) {
        alert('Failed to delete salon: ' + err.message);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus('Uploading assets and writing to database...');
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        location: formData.location + ', Bangalore',
        locality: formData.location,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        image: formData.image,
        status: formData.status
      };

      if (editingSalonId) {
        await updateSalon(editingSalonId, payload, selectedFile);
      } else {
        await addSalon(payload, selectedFile);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save salon: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  // Service Operations Handlers
  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceSalonId) return;

    try {
      const payload = {
        name: serviceFormData.name,
        category: serviceFormData.category,
        price: Number(serviceFormData.price) || 0,
        duration: serviceFormData.duration,
        isActive: serviceFormData.isActive
      };

      if (editingServiceId) {
        await updateService(editingServiceId, payload);
      } else {
        await addService(payload, selectedServiceSalonId);
      }

      setServiceFormData({
        name: '',
        category: 'Hair',
        price: '',
        duration: '60 mins',
        isActive: true
      });
      setEditingServiceId(null);
    } catch (err: any) {
      alert('Failed to save service: ' + err.message);
    }
  };

  const startEditService = (service: any) => {
    setEditingServiceId(service.id);
    setServiceFormData({
      name: service.name,
      category: service.category,
      price: String(service.price),
      duration: service.duration,
      isActive: service.isActive !== false
    });
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        if (editingServiceId === serviceId) {
          setEditingServiceId(null);
          setServiceFormData({
            name: '',
            category: 'Hair',
            price: '',
            duration: '60 mins',
            isActive: true
          });
        }
      } catch (err: any) {
        alert('Failed to delete service: ' + err.message);
      }
    }
  };

  const handleToggleServiceActive = async (service: any) => {
    try {
      await updateService(service.id, {
        name: service.name,
        category: service.category,
        price: service.price,
        duration: service.duration,
        isActive: !service.isActive
      });
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  // SaaS calculations
  const mostBookedSalonName = React.useMemo(() => {
    if (bookings.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.salonId] = (counts[b.salonId] || 0) + 1;
    });
    let mostBookedId = '';
    let max = 0;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > max) {
        max = count;
        mostBookedId = id;
      }
    });
    return salons.find(s => s.id === mostBookedId)?.name || 'N/A';
  }, [bookings, salons]);

  const mostBookedServiceName = React.useMemo(() => {
    if (bookings.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.serviceName] = (counts[b.serviceName] || 0) + 1;
    });
    let name = 'N/A';
    let max = 0;
    Object.entries(counts).forEach(([n, count]) => {
      if (count > max) {
        max = count;
        name = n;
      }
    });
    return name;
  }, [bookings]);

  const selectedSalon = salons.find(s => s.id === selectedServiceSalonId);

  // Calculate average rating
  const avgRating = salons.length > 0 
    ? parseFloat((salons.reduce((acc, s) => acc + s.rating, 0) / salons.length).toFixed(1))
    : 0;

  const localitiesList = [
    'Indiranagar',
    'Koramangala',
    'Vittal Mallya Rd',
    'Jayanagar',
    'HSR Layout',
    'Lavelle Road'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rosegold-200/40 pb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-905 dark:bg-rosegold-500/10 text-rosegold-550 flex items-center justify-center border border-rosegold-200 dark:border-charcoal-800 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-950 dark:text-white font-playfair font-playfair">Admin Console</h1>
              <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Corporate portal to oversee users, bookings, partner salons, and review moderation logs.</p>
            </div>
          </div>

          {activeTab === 'salons' && (
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark text-white text-xs font-bold shadow-md hover:scale-102 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Salon</span>
            </button>
          )}
        </div>

        {/* Overview Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Active Users</span>
              <Users className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white font-mono">{stats.users}</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12%
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Partner Salons</span>
              <MapPin className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white font-mono">{stats.salons}</span>
              <span className="text-xs font-light text-charcoal-450">Bangalore</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Services</span>
              <Scissors className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white font-mono">{stats.services}</span>
              <span className="text-xs font-light text-charcoal-450">Catalog logs</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Rating</span>
              <Star className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white font-mono">{avgRating}★</span>
              <span className="text-xs font-light text-charcoal-450">({stats.reviews} logs)</span>
            </div>
          </div>

        </section>

        {/* Dynamic Navigation & Tables Grid */}
        <section className="bg-white dark:bg-charcoal-900 rounded-3xl border border-rosegold-200 dark:border-charcoal-855 shadow-md overflow-hidden">
          
          {/* Tab Header Selector */}
          <div className="flex border-b border-rosegold-150 dark:border-charcoal-800 bg-linear-to-r from-rosegold-100/10 to-white dark:from-charcoal-905 overflow-x-auto">
            {(['bookings', 'salons', 'services', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 text-center transition-colors shrink-0 cursor-pointer ${
                  activeTab === tab 
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-gold-medium' 
                    : 'border-transparent text-charcoal-500 dark:text-rosegold-300 hover:text-rosegold-500'
                }`}
              >
                {tab} Management
              </button>
            ))}
          </div>

          {/* Tables body content */}
          <div className="p-6 overflow-x-auto">
                       {/* BOOKINGS / DASHBOARD TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-8 animate-fade-in w-full">
                {/* Advanced Analytics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/20 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-bold">Most Booked Salon</span>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white truncate">{mostBookedSalonName}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/20 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-bold">Most Booked Service</span>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white truncate">{mostBookedServiceName}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/20 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-bold">Average Rating</span>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white">{avgRating} ★</p>
                  </div>
                  <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/20 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-bold">Total Bookings</span>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white">{bookings.length}</p>
                  </div>
                </div>

                {/* Recent Feeds Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Bookings Feed (Last 5) */}
                  <div className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">Recent Bookings</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold text-[9px]">
                            <th className="py-2">Client</th>
                            <th className="py-2">Salon / Service</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rosegold-100/30 dark:divide-charcoal-800/30 text-charcoal-700 dark:text-rosegold-200 font-light">
                          {[...bookings].slice(0, 5).map((b) => (
                            <tr key={b.id}>
                              <td className="py-2 font-semibold">Rhea Sharma</td>
                              <td className="py-2">
                                <p className="font-semibold text-charcoal-900 dark:text-white">{b.serviceName}</p>
                                <p className="text-[10px] text-charcoal-400">{b.salonName}</p>
                              </td>
                              <td className="py-2">
                                <select
                                  value={b.status}
                                  onChange={(e) => updateBookingStatus(b.id, e.target.value as Booking['status'])}
                                  className="bg-transparent border border-rosegold-150 dark:border-charcoal-800 text-[10px] rounded px-1 py-0.5 text-charcoal-900 dark:text-white font-semibold cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="No Show">No Show</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                          {bookings.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-4 text-center text-charcoal-400">No recent bookings.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Reviews Feed (Last 5) */}
                  <div className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">Recent Reviews</h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {[...reviews].slice(0, 5).map((rev: any, idx: number) => (
                        <div key={rev.id || idx} className="p-3 rounded-lg border border-rosegold-100 dark:border-charcoal-800 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-charcoal-900 dark:text-white">{rev.author}</span>
                            <span className="text-rosegold-500 font-bold">{rev.rating} ★</span>
                          </div>
                          <p className="text-[10px] text-charcoal-400 mb-1">{rev.salonName}</p>
                          <p className="text-[11px] italic font-light text-charcoal-600 dark:text-rosegold-300 line-clamp-2">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                      ))}
                      {reviews.length === 0 && (
                        <p className="text-center py-4 text-xs text-charcoal-400">No recent reviews.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Bookings Table */}
                <div className="space-y-4 pt-4 border-t border-rosegold-100 dark:border-charcoal-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">All Booking Log Records</h3>
                  <div className="min-w-max w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold text-[10px]">
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Client Name</th>
                          <th className="py-3 px-4">Salon Outlet</th>
                          <th className="py-3 px-4">Service booked</th>
                          <th className="py-3 px-4">Scheduled Date</th>
                          <th className="py-3 px-4">Time Slot</th>
                          <th className="py-3 px-4">Cost</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-rosegold-500">{b.id.substring(0, 12)}</td>
                            <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">Rhea Sharma</td>
                            <td className="py-3 px-4">{b.salonName}</td>
                            <td className="py-3 px-4">{b.serviceName}</td>
                            <td className="py-3 px-4">{b.date}</td>
                            <td className="py-3 px-4">{b.time}</td>
                            <td className="py-3 px-4 font-semibold font-mono">₹{b.price}</td>
                            <td className="py-3 px-4">
                              <select
                                value={b.status}
                                onChange={(e) => updateBookingStatus(b.id, e.target.value as Booking['status'])}
                                className="bg-transparent border border-rosegold-200 dark:border-charcoal-800 text-xs rounded-lg px-2 py-1 text-charcoal-900 dark:text-white font-semibold cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="No Show">No Show</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {b.status !== 'Cancelled' && b.status !== 'Completed' && b.status !== 'No Show' ? (
                                <button
                                  onClick={() => cancelBooking(b.id)}
                                  className="text-xs px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-955/50 text-red-655 dark:text-red-350 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-charcoal-400 font-light font-sans">{b.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SALONS TABLE */}
            {activeTab === 'salons' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold text-[10px]">
                      <th className="py-3 px-4">Salon Name</th>
                      <th className="py-3 px-4">Locality</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Avg Rating</th>
                      <th className="py-3 px-4">Reviews Count</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Brand Segment</th>
                      <th className="py-3 px-4">Home Service</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {salons.map((s) => (
                      <tr key={s.id} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{s.name}</td>
                        <td className="py-3 px-4">{s.locality}</td>
                        <td className="py-3 px-4 font-mono">{s.phone}</td>
                        <td className="py-3 px-4 text-rosegold-500 font-bold font-mono">{s.rating} ★</td>
                        <td className="py-3 px-4 font-mono">{s.reviewsCount || (s.reviews?.length || 0)} logs</td>
                        <td className="py-3 px-4 font-mono">{s.status || 'Open'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            s.isLuxury ? 'bg-linear-to-r from-rosegold-500 to-gold-metallic text-white' : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-rosegold-200'
                          }`}>
                            {s.isLuxury ? 'Luxury' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-charcoal-600 dark:text-rosegold-100">
                          {s.offersHomeService ? 'Available' : 'In-Store Only'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedServiceSalonId(s.id);
                                setIsServiceModalOpen(true);
                              }}
                              className="p-1 rounded-lg border border-rosegold-200 hover:bg-rosegold-50 dark:border-charcoal-800 dark:hover:bg-charcoal-950/40 text-rosegold-500 cursor-pointer"
                              title="Manage Services"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1 rounded-lg border border-rosegold-200 hover:bg-rosegold-50 dark:border-charcoal-800 dark:hover:bg-charcoal-950/40 text-charcoal-600 dark:text-rosegold-200 cursor-pointer"
                              title="Edit Salon Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1 rounded-lg border border-red-100 hover:bg-red-55 dark:border-red-955/20 dark:hover:bg-red-955/45 text-red-550 cursor-pointer"
                              title="Delete Salon Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SERVICES TABLE */}
            {activeTab === 'services' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Standard Rate</th>
                      <th className="py-3 px-4">Partner Outlets</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {salons.flatMap(s => (s.services || []).map(ser => ({ ...ser, salonName: s.name }))).slice(0, 15).map((ser, idx) => (
                      <tr key={idx} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{ser.name}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-rosegold-500">{ser.category}</span>
                        </td>
                        <td className="py-3 px-4">{ser.duration}</td>
                        <td className="py-3 px-4 font-bold font-mono">₹{ser.price}</td>
                        <td className="py-3 px-4 text-charcoal-500">{ser.salonName}</td>
                        <td className="py-3 px-4 max-w-sm truncate text-charcoal-450 dark:text-rosegold-350 font-light">{ser.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVIEWS MODERATION TABLE */}
            {activeTab === 'reviews' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Salon Outlet</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 max-w-md">Comment</th>
                      <th className="py-3 px-4">Flags</th>
                      <th className="py-3 px-4 text-center">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {reviews.map((rev: any, idx: number) => {
                      const isFlagged = flaggedReviews.includes(rev.id);
                      return (
                        <tr key={rev.id || idx} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{rev.author}</td>
                          <td className="py-3 px-4 text-charcoal-550">{rev.salonName}</td>
                          <td className="py-3 px-4 text-rosegold-500 font-bold font-mono">{rev.rating} ★</td>
                          <td className="py-3 px-4 font-mono">{rev.date}</td>
                          <td className="py-3 px-4 max-w-xs truncate italic">&ldquo;{rev.comment}&rdquo;</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              isFlagged ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-350' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350'
                            }`}>
                              {isFlagged ? 'Flagged / Moderated' : 'Verified'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleFlagReview(rev.id)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                isFlagged 
                                  ? 'border-emerald-250 text-emerald-650 hover:bg-emerald-50' 
                                  : 'border-red-200 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20'
                              }`}
                            >
                              {isFlagged ? 'Approve & Restore' : 'Flag / Hide Comment'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* ADD / EDIT SALON MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-charcoal-900 border border-rosegold-200 dark:border-charcoal-850 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-rosegold-100 dark:border-charcoal-800">
              <h3 className="text-xl font-bold text-charcoal-950 dark:text-white font-playfair">
                {editingSalonId ? 'Edit Salon Outlet' : 'Add Salon Outlet'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitting overlay indicator */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/80 dark:bg-charcoal-900/80 z-20 flex flex-col items-center justify-center rounded-2xl space-y-3">
                <div className="w-10 h-10 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-charcoal-700 dark:text-rosegold-200">{uploadStatus}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-250 mb-1">
                    Salon Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Bounce Signature"
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Brand Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  >
                    <option value="Luxury">Luxury Brand</option>
                    <option value="Home Service">Home Service Brand</option>
                    <option value="Budget">Budget Friendly Brand</option>
                  </select>
                </div>

                {/* Locality */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Locality / Neighborhood
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  >
                    {localitiesList.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 98765 43210"
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>

                {/* Salon Status */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Salon Status
                  </label>
                  <select
                    value={formData.status || 'Open'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                  </select>
                </div>

                {/* Image Upload Area */}
                <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Flagship Image
                  </label>
                  <div className="relative border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-xl p-2.5 text-center bg-white dark:bg-charcoal-950 cursor-pointer hover:border-rosegold-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center space-x-1.5 text-xs text-charcoal-555 dark:text-rosegold-300">
                      <UploadCloud className="w-4 h-4 text-rosegold-500" />
                      <span className="truncate max-w-[160px]">
                        {selectedFile ? selectedFile.name : 'Select Salon Image File'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Complete Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. Ground Floor, No. 12, Hal 3rd Stage, Bengaluru"
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-rosegold-255 mb-1">
                    Outlet Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide highlights of the salon services and brand standards..."
                    className="block w-full px-3 py-2 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white leading-relaxed font-light"
                  />
                </div>

              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-rosegold-200 dark:border-charcoal-800 text-xs font-semibold text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-955/30 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark text-white text-xs font-bold shadow-md hover:scale-102 transition-all cursor-pointer"
                >
                  Save Outlet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MANAGE SALON SERVICES MODAL */}
      {isServiceModalOpen && selectedSalon && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-charcoal-900 border border-rosegold-200 dark:border-charcoal-850 w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-rosegold-100 dark:border-charcoal-800">
              <div>
                <h3 className="text-xl font-bold text-charcoal-950 dark:text-white font-playfair">
                  Manage Services Catalog
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-rosegold-200">Salon: {selectedSalon.name}</p>
              </div>
              <button 
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setSelectedServiceSalonId(null);
                  setEditingServiceId(null);
                  setServiceFormData({ name: '', category: 'Hair', price: '', duration: '60 mins', isActive: true });
                }}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Form Section */}
            <form onSubmit={handleServiceFormSubmit} className="p-4 rounded-xl border border-rosegold-100 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">
                {editingServiceId ? 'Edit Service' : 'Add New Service'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Hair Wash"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                    Category
                  </label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Nails">Nails</option>
                    <option value="Massages">Massages</option>
                    <option value="Bridal">Bridal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Price"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 60 mins"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-xs text-charcoal-700 dark:text-rosegold-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceFormData.isActive}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-rosegold-300 dark:border-charcoal-800 text-rosegold-500 focus:ring-rosegold-500"
                  />
                  <span>Service Is Active (Visible to users)</span>
                </label>
                
                <div className="flex space-x-2">
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceFormData({ name: '', category: 'Hair', price: '', duration: '60 mins', isActive: true });
                      }}
                      className="px-4 py-1.5 rounded-lg border border-rosegold-200 dark:border-charcoal-800 text-[11px] font-semibold text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-950/20 cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-bold text-[11px] hover:scale-102 transition-all cursor-pointer"
                  >
                    {editingServiceId ? 'Save Service Changes' : 'Add Service'}
                  </button>
                </div>
              </div>
            </form>

            {/* Services List Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">Active Service Catalog</h4>
              <div className="overflow-x-auto border border-rosegold-100 dark:border-charcoal-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-rosegold-50/50 dark:bg-charcoal-905 border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold text-[10px]">
                      <th className="py-2.5 px-3">Service Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/30 dark:divide-charcoal-800/30 text-charcoal-700 dark:text-rosegold-200 font-light">
                    {(selectedSalon.services || []).map((ser: any) => (
                      <tr key={ser.id} className="hover:bg-rosegold-50/10 dark:hover:bg-charcoal-950/10 transition-colors">
                        <td className="py-2 px-3 font-semibold text-charcoal-900 dark:text-white">{ser.name}</td>
                        <td className="py-2 px-3">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-rosegold-500">{ser.category}</span>
                        </td>
                        <td className="py-2 px-3">{ser.duration}</td>
                        <td className="py-2 px-3 font-bold font-mono">₹{ser.price}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ser.isActive !== false ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350' : 'bg-charcoal-100 text-charcoal-500'
                          }`}>
                            {ser.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleToggleServiceActive(ser)}
                              className="text-[10px] px-2 py-0.5 rounded border border-rosegold-200 hover:bg-rosegold-50 dark:border-charcoal-800 dark:hover:bg-charcoal-950/30 text-charcoal-600 dark:text-rosegold-200 cursor-pointer"
                            >
                              Toggle Status
                            </button>
                            <button
                              onClick={() => startEditService(ser)}
                              className="p-1 rounded border border-rosegold-200 hover:bg-rosegold-50 dark:border-charcoal-800 dark:hover:bg-charcoal-950/30 text-charcoal-600 dark:text-rosegold-200 cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(ser.id)}
                              className="p-1 rounded border border-red-150 hover:bg-red-50 dark:border-red-950/20 text-red-550 cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(selectedSalon.services || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-charcoal-400 text-xs">No services cataloged for this outlet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
