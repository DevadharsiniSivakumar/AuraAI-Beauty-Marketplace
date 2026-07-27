'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db, IS_MOCK } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  Scissors, 
  Star, 
  Users, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield, 
  Check, 
  X, 
  AlertCircle, 
  Filter, 
  Phone, 
  MapPin, 
  FileText, 
  Tag, 
  Clock, 
  CircleDollarSign,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function AdminPage({ defaultTab = 'overview' }: { defaultTab?: 'overview' | 'salons' | 'bookings' | 'reviews' | 'services' | 'users' }) {
  const { role, logout } = useAuth();
  const isAdmin = role === 'admin';
  const router = useRouter();
  const { 
    salons, 
    bookings, 
    reviews, 
    updateBookingStatus, 
    addSalon, 
    updateSalon, 
    deleteSalon, 
    addService, 
    updateService, 
    deleteService,
    deleteReviewAdmin,
    updateUserRoleAdmin,
    deleteUserAdmin
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'salons' | 'bookings' | 'reviews' | 'services' | 'users'>(defaultTab);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  // User management states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Salon modal states
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<any | null>(null); // null means "Add New Salon"
  const [salonFormData, setSalonFormData] = useState({
    id: '',
    name: '',
    location: 'Indiranagar',
    address: '',
    phone: '',
    description: '',
    category: 'Budget', // Luxury, Home Service, Budget
    status: 'Open'
  });

  // Service modal states
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null); // null means "Add"
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Hair' as const,
    price: '',
    duration: '45 mins',
    description: ''
  });

  // Load and refresh user list
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      if (IS_MOCK) {
        const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
        const sanitized = mockUsers.map((u: any) => ({
          uid: u.uid,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt || new Date().toISOString()
        }));
        setUsersList(sanitized);
      } else {
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            uid: doc.id,
            name: data.name || 'Aura User',
            email: data.email || '',
            role: data.role || 'user',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
          });
        });
        setUsersList(usersData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Set default selected salon for service management once salons load
  useEffect(() => {
    if (salons.length > 0 && !selectedSalonId) {
      setSelectedSalonId(salons[0].id);
    }
  }, [salons, selectedSalonId]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="bg-white p-8 rounded-2xl border border-border text-center shadow-lg max-w-md w-full backdrop-blur-md">
          <div className="w-16 h-16 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-4 border border-rose/25">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif text-darktext mb-2 font-bold">Access Denied</h1>
          <p className="text-mutedtext mb-6 text-sm">You need administrator privileges to view the executive console. Please log in with an administrator account.</p>
          <div className="space-y-3">
            <Link href="/admin/login" className="block w-full py-2.5 bg-plum text-warmwhite rounded-xl font-medium hover:bg-plum-dark transition-all duration-200">
              Admin Login Portal
            </Link>
            <Link href="/" className="block w-full py-2.5 border border-border rounded-xl font-medium text-darktext hover:bg-cream transition-all duration-200 text-sm">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Metrics
  const totalSalons = salons.length;
  const totalServices = salons.reduce((acc, salon) => acc + (salon.services?.length || 0), 0);
  const upcomingBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const totalUsersCount = usersList.length;

  // Salon Forms
  const openAddSalon = () => {
    setEditingSalon(null);
    setSalonFormData({
      id: `salon-${Date.now()}`,
      name: '',
      location: 'Indiranagar',
      address: '',
      phone: '',
      description: '',
      category: 'Budget',
      status: 'Open'
    });
    setIsSalonModalOpen(true);
  };

  const openEditSalon = (salon: any) => {
    setEditingSalon(salon);
    setSalonFormData({
      id: salon.id,
      name: salon.name,
      location: salon.locality || 'Indiranagar',
      address: salon.address || '',
      phone: salon.phone || '',
      description: salon.description || '',
      category: salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget',
      status: salon.status || 'Open'
    });
    setIsSalonModalOpen(true);
  };

  const handleSalonFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSalon) {
        await updateSalon(salonFormData.id, salonFormData, null);
      } else {
        await addSalon(salonFormData, null);
      }
      setIsSalonModalOpen(false);
    } catch (err) {
      console.error('Error saving salon:', err);
      alert('Could not save salon.');
    }
  };

  const handleDeleteSalon = async (salonId: string) => {
    if (confirm('Are you sure you want to delete this salon? All associated services will be removed.')) {
      try {
        await deleteSalon(salonId);
      } catch (err) {
        console.error('Error deleting salon:', err);
      }
    }
  };

  // Services Forms
  const openAddService = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      category: 'Hair',
      price: '',
      duration: '45 mins',
      description: ''
    });
    setIsServiceModalOpen(true);
  };

  const openEditService = (service: any) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name || service.serviceName,
      category: service.category || 'Hair',
      price: String(service.price || ''),
      duration: service.duration || '45 mins',
      description: service.description || ''
    });
    setIsServiceModalOpen(true);
  };

  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId) return;
    try {
      if (editingService) {
        await updateService(editingService.id || editingService.serviceId, serviceFormData);
      } else {
        await addService(serviceFormData, selectedSalonId);
      }
      setIsServiceModalOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
      } catch (err) {
        console.error('Error deleting service:', err);
      }
    }
  };

  // Booking updates
  const handleBookingStatusChange = async (bookingId: string, status: any) => {
    try {
      await updateBookingStatus(bookingId, status);
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  // Review delete
  const handleDeleteReview = async (salonId: string, reviewId: string) => {
    if (confirm('Are you sure you want to delete this review? This will automatically recalculate the salon rating.')) {
      try {
        await deleteReviewAdmin(salonId, reviewId);
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  // User updates
  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRoleAdmin(userId, nextRole);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUserAccount = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user account? This cannot be undone.')) {
      try {
        await deleteUserAdmin(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  // Filter lists based on Search Query
  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter((r: any) => 
    r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSalonForServices = salons.find(s => s.id === selectedSalonId);
  const filteredServices = selectedSalonForServices
    ? selectedSalonForServices.services.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-cream overflow-hidden text-darktext">
      
      {/* Sidebar */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0 shadow-xl border-r border-plum-dark/40 z-20">
        <div className="h-20 flex items-center px-6 border-b border-plum-dark/50 gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/40">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.7]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-white">Aura Console</span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'salons', label: 'Salons', icon: Store },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'services', label: 'Services', icon: Scissors },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 text-left ${
                  activeTab === tab.id 
                    ? 'bg-plum-dark text-white shadow-inner border-l-4 border-peach' 
                    : 'text-white/70 hover:bg-plum-dark/45 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-plum-dark/50 space-y-2">
          <Link href="/" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/75 hover:text-white transition-colors font-medium">
            <span>←</span> Back to User App
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose hover:text-rose-dark transition-colors rounded-lg hover:bg-rose/10 text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out Console
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 shadow-xs z-10">
          <h2 className="text-xl font-serif font-bold text-darktext capitalize">{activeTab} Console</h2>
          
          <div className="flex items-center gap-6">
            {activeTab !== 'overview' && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-cream/70 border border-border rounded-xl text-sm text-darktext focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum w-72 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-mutedtext" />
              </div>
            )}
            <div className="flex items-center gap-3.5 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-xs font-bold text-darktext">Administrator</p>
                <p className="text-[10px] text-mutedtext">admin@auraai.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-8 bg-cream/40">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Salons Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-plum/10 text-plum flex items-center justify-center border border-plum/20">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Total Salons</p>
                    <p className="text-3xl font-serif font-bold text-darktext mt-1">{totalSalons}</p>
                  </div>
                </div>

                {/* Total Bookings Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center border border-sage/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Upcoming Bookings</p>
                    <p className="text-3xl font-serif font-bold text-darktext mt-1">{upcomingBookingsCount}</p>
                  </div>
                </div>

                {/* Total Services Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-peach/10 text-peach flex items-center justify-center border border-peach/20">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Total Services</p>
                    <p className="text-3xl font-serif font-bold text-darktext mt-1">{totalServices}</p>
                  </div>
                </div>

                {/* Total Users Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-lavender/10 text-lavender flex items-center justify-center border border-lavender/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-serif font-bold text-darktext mt-1">{totalUsersCount}</p>
                  </div>
                </div>

              </div>

              {/* Quick Action Dashboard Area */}
              <div className="bg-white p-8 rounded-2xl border border-border shadow-xs space-y-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-plum" />
                  <h3 className="text-lg font-serif font-bold text-darktext">Quick Operations Desk</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={openAddSalon}
                    className="p-4 border border-border hover:border-plum hover:bg-plum/5 rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                  >
                    <p className="font-semibold text-sm text-plum flex items-center gap-1.5 mb-1">
                      <Plus className="w-4 h-4" /> Add New Salon Outlet
                    </p>
                    <p className="text-xs text-mutedtext leading-relaxed">Establish a new vendor outlet profile in the marketplace database.</p>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('services'); openAddService(); }}
                    className="p-4 border border-border hover:border-plum hover:bg-plum/5 rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                  >
                    <p className="font-semibold text-sm text-plum flex items-center gap-1.5 mb-1">
                      <Plus className="w-4 h-4" /> Catalog Service Item
                    </p>
                    <p className="text-xs text-mutedtext leading-relaxed">Publish a beauty therapy service under an existing salon catalog.</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('users')}
                    className="p-4 border border-border hover:border-plum hover:bg-plum/5 rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                  >
                    <p className="font-semibold text-sm text-plum flex items-center gap-1.5 mb-1">
                      <UserCheck className="w-4.5 h-4.5" /> Moderate User Accounts
                    </p>
                    <p className="text-xs text-mutedtext leading-relaxed">Verify login profiles, administrative settings, and role structures.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SALONS TAB */}
          {activeTab === 'salons' && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-border flex justify-between items-center bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">Salon Directory</h3>
                <button 
                  onClick={openAddSalon}
                  className="inline-flex items-center gap-1.5 text-sm bg-plum text-warmwhite px-4 py-2 rounded-xl hover:bg-plum-dark transition-all duration-200 cursor-pointer font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Salon
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream/40 text-mutedtext uppercase tracking-wider text-xs border-b border-border font-semibold">
                      <th className="p-4 font-medium pl-6">Outlet Name</th>
                      <th className="p-4 font-medium">Locality</th>
                      <th className="p-4 font-medium">Phone</th>
                      <th className="p-4 font-medium">Rating</th>
                      <th className="p-4 font-medium">Category Badge</th>
                      <th className="p-4 font-medium text-right pr-6">Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSalons.length > 0 ? filteredSalons.map(salon => (
                      <tr key={salon.id} className="hover:bg-cream/20 transition-colors">
                        <td className="p-4 font-semibold text-darktext pl-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-cream border border-border rounded-lg overflow-hidden shrink-0">
                            <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p>{salon.name}</p>
                            <p className="text-[10px] text-mutedtext font-mono truncate max-w-xs">{salon.address}</p>
                          </div>
                        </td>
                        <td className="p-4 text-mutedtext">{salon.locality || salon.location}</td>
                        <td className="p-4 text-mutedtext font-mono">{salon.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-sage/10 text-sage px-2 py-0.5 rounded-lg text-xs font-semibold border border-sage/20">
                            ★ {salon.rating}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                            salon.isLuxury 
                              ? 'bg-gold/15 text-gold border-gold/25' 
                              : salon.offersHomeService 
                                ? 'bg-plum/15 text-plum border-plum/25' 
                                : 'bg-sage/15 text-sage border-sage/25'
                          }`}>
                            {salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget'}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-3">
                          <button 
                            onClick={() => openEditSalon(salon)}
                            className="inline-flex items-center gap-1 text-plum hover:text-plum-dark font-medium text-xs border border-plum/10 px-2 py-1 rounded bg-plum/5 hover:bg-plum/10 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteSalon(salon.id)}
                            className="inline-flex items-center gap-1 text-rose hover:text-rose-dark font-medium text-xs border border-rose/10 px-2 py-1 rounded bg-rose/5 hover:bg-rose/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-mutedtext">No salons matching search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-border bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">App Appointment Bookings</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream/40 text-mutedtext uppercase tracking-wider text-xs border-b border-border font-semibold">
                      <th className="p-4 font-medium pl-6">Booking ID</th>
                      <th className="p-4 font-medium">Customer Profile</th>
                      <th className="p-4 font-medium">Salon</th>
                      <th className="p-4 font-medium">Service Info</th>
                      <th className="p-4 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Bill Price</th>
                      <th className="p-4 font-medium text-right pr-6">Status Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBookings.length > 0 ? filteredBookings.map((booking, i) => (
                      <tr key={booking.id} className="hover:bg-cream/20 transition-colors">
                        <td className="p-4 font-mono text-xs text-mutedtext pl-6">{booking.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-darktext">{booking.userName || 'Client User'}</p>
                          <p className="text-[10px] text-mutedtext font-mono">{booking.userEmail}</p>
                        </td>
                        <td className="p-4 text-darktext">{booking.salonName}</td>
                        <td className="p-4 text-darktext font-medium">{booking.serviceName}</td>
                        <td className="p-4 text-mutedtext">{booking.date} @ {booking.time}</td>
                        <td className="p-4 text-darktext font-semibold">₹{booking.price}</td>
                        <td className="p-4 text-right pr-6">
                          <select 
                            value={booking.status}
                            onChange={(e) => handleBookingStatusChange(booking.id, e.target.value as any)}
                            className={`text-xs font-semibold px-2 py-1.5 border rounded-lg focus:outline-none ${
                              booking.status === 'Confirmed' 
                                ? 'bg-sage/10 text-sage border-sage/20' 
                                : booking.status === 'Cancelled' 
                                  ? 'bg-rose/10 text-rose-dark border-rose/20' 
                                  : 'bg-plum/10 text-plum border-plum/20'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-mutedtext">No bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-darktext uppercase tracking-wider whitespace-nowrap">Manage Catalog for:</span>
                  <select 
                    value={selectedSalonId}
                    onChange={(e) => setSelectedSalonId(e.target.value)}
                    className="px-3 py-2 bg-cream/70 border border-border rounded-xl text-sm font-semibold text-darktext focus:outline-none focus:border-plum"
                  >
                    {salons.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={openAddService}
                  className="inline-flex items-center gap-1.5 text-sm bg-plum text-warmwhite px-4 py-2 rounded-xl hover:bg-plum-dark transition-all duration-200 cursor-pointer font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Catalog Service
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-cream/40 text-mutedtext uppercase tracking-wider text-xs border-b border-border font-semibold">
                        <th className="p-4 font-medium pl-6">Service Name</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Billing Price</th>
                        <th className="p-4 font-medium">Duration</th>
                        <th className="p-4 font-medium">State</th>
                        <th className="p-4 font-medium text-right pr-6">Management Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredServices.length > 0 ? filteredServices.map((service, i) => (
                        <tr key={i} className="hover:bg-cream/20 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-semibold text-darktext">{service.name}</p>
                            <p className="text-[10px] text-mutedtext truncate max-w-xs">{service.description}</p>
                          </td>
                          <td className="p-4 text-mutedtext font-medium">{service.category}</td>
                          <td className="p-4 text-darktext font-semibold">₹{service.price}</td>
                          <td className="p-4 text-mutedtext font-mono">{service.duration}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                              service.isActive !== false 
                                ? 'bg-sage/10 text-sage border-sage/20' 
                                : 'bg-mutedtext/15 text-mutedtext border-mutedtext/25'
                            }`}>
                              {service.isActive !== false ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 space-x-3">
                            <button 
                              onClick={() => openEditService(service)}
                              className="inline-flex items-center gap-1 text-plum hover:text-plum-dark font-medium text-xs border border-plum/10 px-2 py-1 rounded bg-plum/5 hover:bg-plum/10 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteService(service.id)}
                              className="inline-flex items-center gap-1 text-rose hover:text-rose-dark font-medium text-xs border border-rose/10 px-2 py-1 rounded bg-rose/5 hover:bg-rose/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-mutedtext">No catalog services added for this outlet yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-border bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">Platform Reviews Moderation</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream/40 text-mutedtext uppercase tracking-wider text-xs border-b border-border font-semibold">
                      <th className="p-4 font-medium pl-6">Author Profile</th>
                      <th className="p-4 font-medium">Target Outlet</th>
                      <th className="p-4 font-medium">User Rating</th>
                      <th className="p-4 font-medium">Comment Logs</th>
                      <th className="p-4 font-medium text-right pr-6">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReviews.length > 0 ? (filteredReviews as any[]).map((review, i) => (
                      <tr key={i} className="hover:bg-cream/20 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-darktext">{review.author}</p>
                          <p className="text-[10px] text-mutedtext font-mono">{review.authorEmail || 'N/A'}</p>
                        </td>
                        <td className="p-4 text-mutedtext font-medium">{review.salonName}</td>
                        <td className="p-4">
                          <span className="text-gold font-bold text-xs bg-gold/10 px-2 py-0.5 rounded-lg border border-gold/20 flex items-center w-fit gap-1">
                            ★ {review.rating}
                          </span>
                        </td>
                        <td className="p-4 text-mutedtext max-w-sm leading-relaxed">{review.comment}</td>
                        <td className="p-4 text-right pr-6">
                          <button 
                            onClick={() => handleDeleteReview(review.salonId, review.id)}
                            className="inline-flex items-center gap-1 text-rose hover:text-rose-dark font-medium text-xs border border-rose/10 px-3 py-1.5 rounded-lg bg-rose/5 hover:bg-rose/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Review
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-mutedtext">No reviews found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-border bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">User Directory Panel</h3>
              </div>
              
              {loadingUsers ? (
                <div className="p-12 text-center text-mutedtext flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-plum border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing user list...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-cream/40 text-mutedtext uppercase tracking-wider text-xs border-b border-border font-semibold">
                        <th className="p-4 font-medium pl-6">Profile ID / Email</th>
                        <th className="p-4 font-medium">Full Name</th>
                        <th className="p-4 font-medium">Account Role</th>
                        <th className="p-4 font-medium">Creation Date</th>
                        <th className="p-4 font-medium text-right pr-6">Role / Account Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-cream/20 transition-colors">
                          <td className="p-4 pl-6 font-mono text-xs text-mutedtext">
                            <p className="font-semibold text-darktext">{u.email}</p>
                            <p className="text-[10px] truncate max-w-xs">{u.uid}</p>
                          </td>
                          <td className="p-4 font-medium text-darktext">{u.name}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                              u.role === 'admin' 
                                ? 'bg-plum/10 text-plum border-plum/20' 
                                : 'bg-sage/10 text-sage border-sage/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-mutedtext">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right pr-6 space-x-3">
                            <button 
                              onClick={() => handleToggleRole(u.uid, u.role)}
                              disabled={u.email === 'admin@auraai.com'}
                              className="inline-flex items-center gap-1 text-plum hover:text-plum-dark font-medium text-xs border border-plum/15 px-2.5 py-1.5 rounded-lg bg-plum/5 hover:bg-plum/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Toggle Role
                            </button>
                            <button 
                              onClick={() => handleDeleteUserAccount(u.uid)}
                              disabled={u.email === 'admin@auraai.com'}
                              className="inline-flex items-center gap-1 text-rose hover:text-rose-dark font-medium text-xs border border-rose/15 px-2.5 py-1.5 rounded-lg bg-rose/5 hover:bg-rose/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Delete Account
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-mutedtext">No users found matching query.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* SALONS CRUDS MODAL */}
      {isSalonModalOpen && (
        <div className="fixed inset-0 bg-darktext/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-cream/10">
              <h3 className="font-serif font-bold text-darktext text-lg">
                {editingSalon ? 'Modify Salon Registry' : 'Establish New Salon Profile'}
              </h3>
              <button 
                onClick={() => setIsSalonModalOpen(false)}
                className="text-mutedtext hover:text-darktext p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSalonFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Outlet Unique ID (Slug)</label>
                <input 
                  type="text"
                  required
                  disabled={!!editingSalon}
                  value={salonFormData.id}
                  onChange={(e) => setSalonFormData({ ...salonFormData, id: e.target.value })}
                  placeholder="e.g. bounce-hsr"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Salon Name</label>
                <input 
                  type="text"
                  required
                  value={salonFormData.name}
                  onChange={(e) => setSalonFormData({ ...salonFormData, name: e.target.value })}
                  placeholder="e.g. Bounce Salon & Spa"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Locality Area</label>
                  <select 
                    value={salonFormData.location}
                    onChange={(e) => setSalonFormData({ ...salonFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  >
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Vittal Mallya Rd">Vittal Mallya Rd</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Lavelle Road">Lavelle Road</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Service Category</label>
                  <select 
                    value={salonFormData.category}
                    onChange={(e) => setSalonFormData({ ...salonFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  >
                    <option value="Luxury">Luxury</option>
                    <option value="Home Service">Home Service</option>
                    <option value="Budget">Budget</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Full Postal Address</label>
                <input 
                  type="text"
                  required
                  value={salonFormData.address}
                  onChange={(e) => setSalonFormData({ ...salonFormData, address: e.target.value })}
                  placeholder="e.g. No. 36, 1st Main Rd, Koramangala 5th Block"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Contact Phone</label>
                  <input 
                    type="text"
                    required
                    value={salonFormData.phone}
                    onChange={(e) => setSalonFormData({ ...salonFormData, phone: e.target.value })}
                    placeholder="+91 80 4123 4567"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Status</label>
                  <select 
                    value={salonFormData.status}
                    onChange={(e) => setSalonFormData({ ...salonFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">About / Description</label>
                <textarea 
                  rows={3}
                  required
                  value={salonFormData.description}
                  onChange={(e) => setSalonFormData({ ...salonFormData, description: e.target.value })}
                  placeholder="Tell clients about services, dermatologists, stylists..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum resize-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsSalonModalOpen(false)}
                  className="px-4 py-2 border border-border text-xs rounded-xl font-semibold text-mutedtext hover:bg-cream"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-plum text-warmwhite text-xs rounded-xl font-semibold hover:bg-plum-dark"
                >
                  {editingSalon ? 'Apply Changes' : 'Confirm Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICES CRUD MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-darktext/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-cream/10">
              <h3 className="font-serif font-bold text-darktext text-lg">
                {editingService ? 'Modify Service Details' : 'Add Catalog Service'}
              </h3>
              <button 
                onClick={() => setIsServiceModalOpen(false)}
                className="text-mutedtext hover:text-darktext p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleServiceFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Service Name</label>
                <input 
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. Balayage Highlights"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Service Category</label>
                  <select 
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Nails">Nails</option>
                    <option value="Massages">Massages</option>
                    <option value="Bridal">Bridal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Price (INR)</label>
                  <input 
                    type="number"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Duration Description</label>
                <input 
                  type="text"
                  required
                  value={serviceFormData.duration}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                  placeholder="e.g. 60 mins"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mutedtext uppercase mb-1">Service Description</label>
                <textarea 
                  rows={3}
                  required
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="Tell clients what is included in this service treatment..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-cream/30 text-sm focus:outline-none focus:border-plum resize-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 border border-border text-xs rounded-xl font-semibold text-mutedtext hover:bg-cream"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-plum text-warmwhite text-xs rounded-xl font-semibold hover:bg-plum-dark"
                >
                  {editingService ? 'Apply Changes' : 'Confirm Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
