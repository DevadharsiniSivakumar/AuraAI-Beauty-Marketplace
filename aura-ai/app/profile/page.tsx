'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { userProfile, updateProfile } = useApp();
  
  // Personal Info Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [location, setLocation] = useState(userProfile.location);

  // Success indicator
  const [isSaved, setIsSaved] = useState(false);

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      location
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 sm:p-8 rounded-md">
          <h2 className="text-xl font-bold text-[#2D2926] mb-6">Profile Settings</h2>
          
          <form onSubmit={handlePersonalSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2926] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2926] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2926] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2926] mb-1">Neighborhood</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#2D2926] text-white rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors"
              >
                Save Changes
              </button>
              {isSaved && (
                <span className="text-[#9D5965] text-sm">Changes saved successfully!</span>
              )}
            </div>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
