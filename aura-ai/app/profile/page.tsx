'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'account' | 'preferences' | 'privacy'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Changes saved successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-2">Settings</h1>
          <p className="text-mutedtext">Manage your account details and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {[
                { id: 'account', label: 'Account Details' },
                { id: 'preferences', label: 'Beauty Preferences' },
                { id: 'privacy', label: 'Privacy & Security' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? 'bg-plum text-warmwhite' 
                      : 'text-darktext hover:bg-cream border border-transparent hover:border-border'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Panel */}
          <div className="flex-grow max-w-3xl">
            <div className="bg-white border border-border rounded-xl shadow-sm p-6 md:p-10">
              
              {activeSection === 'account' && (
                <div className="animate-in fade-in">
                  <div className="mb-8 border-b border-border pb-6">
                    <h2 className="text-xl font-medium text-darktext mb-1">Account Details</h2>
                    <p className="text-sm text-mutedtext">Update your personal information and contact details.</p>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-8">
                    
                    {/* Group: Personal Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-darktext uppercase tracking-wider mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-darktext mb-1">Full Name</label>
                          <input 
                            type="text" 
                            defaultValue={user?.displayName || ''} 
                            className="w-full p-2.5 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-darktext mb-1">Email Address</label>
                          <input 
                            type="email" 
                            defaultValue={user?.email || ''} 
                            disabled
                            className="w-full p-2.5 bg-border-dark/10 border border-border rounded-lg text-mutedtext cursor-not-allowed"
                          />
                          <p className="text-xs text-mutedtext mt-1">Contact support to change email</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-darktext mb-1">Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="+91"
                            className="w-full p-2.5 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
                      {saveMessage && (
                        <span className="text-sm text-sage font-medium animate-in fade-in">{saveMessage}</span>
                      )}
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-plum text-warmwhite px-6 py-2.5 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="animate-in fade-in">
                  <div className="mb-8 border-b border-border pb-6">
                    <h2 className="text-xl font-medium text-darktext mb-1">Beauty Preferences</h2>
                    <p className="text-sm text-mutedtext">Help Aura provide better recommendations by sharing your preferences.</p>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-8">
                    
                    <div>
                      <h3 className="text-sm font-semibold text-darktext uppercase tracking-wider mb-4">Focus Areas</h3>
                      <div className="space-y-3">
                        {['Hair Care & Styling', 'Skincare & Facials', 'Nail Art & Care', 'Massage & Spa', 'Bridal & Makeup'].map((pref, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-cream cursor-pointer transition-colors">
                            <input type="checkbox" className="w-4 h-4 text-plum rounded border-border focus:ring-plum" defaultChecked={i < 2} />
                            <span className="text-sm text-darktext font-medium">{pref}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-darktext uppercase tracking-wider mb-4">Budget Preference</h3>
                      <select className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum">
                        <option>Standard (Essential care)</option>
                        <option>Premium (Complete experience)</option>
                        <option>Luxury (The finest treatments)</option>
                      </select>
                    </div>

                    <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
                      {saveMessage && (
                        <span className="text-sm text-sage font-medium animate-in fade-in">{saveMessage}</span>
                      )}
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-plum text-warmwhite px-6 py-2.5 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
                      >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="animate-in fade-in">
                  <div className="mb-8 border-b border-border pb-6">
                    <h2 className="text-xl font-medium text-darktext mb-1">Privacy & Security</h2>
                    <p className="text-sm text-mutedtext">Manage your password and data sharing preferences.</p>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-8">
                    
                    <div>
                      <h3 className="text-sm font-semibold text-darktext uppercase tracking-wider mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-darktext mb-1">Current Password</label>
                          <input 
                            type="password" 
                            className="w-full p-2.5 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-darktext mb-1">New Password</label>
                          <input 
                            type="password" 
                            className="w-full p-2.5 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
                      {saveMessage && (
                        <span className="text-sm text-sage font-medium animate-in fade-in">{saveMessage}</span>
                      )}
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-plum text-warmwhite px-6 py-2.5 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
