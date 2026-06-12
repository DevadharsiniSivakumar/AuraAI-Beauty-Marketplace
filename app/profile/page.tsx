'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  CheckCircle, 
  SlidersHorizontal,
  Compass,
  Star,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, updateProfile, salons } = useApp();
  
  // Edit mode forms state
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [location, setLocation] = useState(userProfile.location);
  const [faceShape, setFaceShape] = useState(userProfile.faceShape);
  const [hairType, setHairType] = useState(userProfile.hairType);
  const [skinTone, setSkinTone] = useState(userProfile.skinTone);
  const [budget, setBudget] = useState(userProfile.preferredBudget);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      location,
      faceShape,
      hairType,
      skinTone,
      preferredBudget: budget
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  // Map favorite salons list
  const favoriteSalonsObj = salons.filter(s => userProfile.favoriteSalons.includes(s.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Profile Preferences Editor */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-rosegold-100 dark:border-charcoal-800">
              <h2 className="text-xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-rosegold-550" />
                Profile Information
              </h2>
              {isSaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Preferences Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Credentials Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-505"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-505"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-505"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Primary Neighborhood</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-505"
                  />
                </div>
              </div>

              {/* Beauty Profile Parameters */}
              <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-855 space-y-4">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-white uppercase tracking-wider">Beauty Topography</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Face Shape</label>
                    <select
                      value={faceShape}
                      onChange={(e) => setFaceShape(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="Oval" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Oval Contour</option>
                      <option value="Round" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Round Contour</option>
                      <option value="Square" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Square Contour</option>
                      <option value="Heart" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Heart Contour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Hair Structure</label>
                    <select
                      value={hairType}
                      onChange={(e) => setHairType(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="2C Wavy" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">2C Wavy Waves</option>
                      <option value="Straight" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">1A Coarse Straight</option>
                      <option value="Curly" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">3B Springy Curls</option>
                      <option value="Coily" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">4C Dense Coils</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Skin Tone Melanin</label>
                    <select
                      value={skinTone}
                      onChange={(e) => setSkinTone(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="Warm Beige / Olive" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Warm Honey / Olive</option>
                      <option value="Fair / Cool Pink" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Fair / Cool Pink</option>
                      <option value="Deep Bronze" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Deep Umber / Bronze</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Budget Profile Parameters */}
              <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-855 space-y-4">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-white uppercase tracking-wider">Budget Settings</h3>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Preferred Budget Range</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹ - Budget Saver (Under ₹2000)</option>
                    <option value="₹₹ - ₹₹₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹₹ - ₹₹₹ - Premium Select (₹2000 - ₹5000)</option>
                    <option value="₹₹₹ - ₹₹₹₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹₹₹ - ₹₹₹₹ - Luxury Premium (₹5000+)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-102 hover:shadow-md transition-all cursor-pointer"
                >
                  Save Settings
                </button>
              </div>

            </form>
          </div>

          {/* Right Panel: Favorites & Saved lists */}
          <aside className="space-y-6">
            
            {/* Display of current diagnostics */}
            <div className="p-6 rounded-2xl border border-rosegold-350 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/20 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-4">
              <h3 className="font-bold text-charcoal-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rosegold-500" />
                Active Diagnostics
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100">
                  <span className="text-charcoal-400">Skin Melanin</span>
                  <span className="font-semibold text-charcoal-900 dark:text-white">{userProfile.skinTone}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100">
                  <span className="text-charcoal-400">Hair Thickness</span>
                  <span className="font-semibold text-charcoal-900 dark:text-white">{userProfile.hairType}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100">
                  <span className="text-charcoal-400">Face Contour</span>
                  <span className="font-semibold text-charcoal-900 dark:text-white">{userProfile.faceShape}</span>
                </div>
              </div>
            </div>

            {/* Favorite salons listing */}
            <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4">
              <h3 className="font-bold text-charcoal-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rosegold-550 fill-rosegold-500" />
                Favorite Salons
              </h3>
              
              <div className="space-y-3">
                {favoriteSalonsObj.map((fs) => (
                  <div key={fs.id} className="p-3 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 flex justify-between items-center gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal-900 dark:text-white line-clamp-1">{fs.name}</h4>
                      <p className="text-[10px] text-charcoal-400 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-rosegold-500" />
                        {fs.location}
                      </p>
                    </div>
                    <Link
                      href={`/salons/${fs.id}`}
                      className="text-[10px] font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center"
                    >
                      View
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </main>

      <Footer />
    </div>
  );
}
