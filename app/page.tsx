'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Brain, 
  Calendar, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Sliders,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const [typedText, setTypedText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const prompts = [
    "Find a hydra facial under ₹3000 in Indiranagar...",
    "Recommend luxury salons near UB City...",
    "Suggest a hair style matching my round face...",
    "I have a friend's wedding next weekend. Suggest makeup and book..."
  ];

  // Typing effect simulation for hero section
  useEffect(() => {
    const activePrompt = prompts[promptIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(activePrompt.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 30);
    } else {
      timer = setTimeout(() => {
        setTypedText(activePrompt.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 70);
    }

    if (!isDeleting && charIndex === activePrompt.length) {
      // Pause at full text
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, promptIndex]);

  const features = [
    {
      icon: Brain,
      title: 'Personalized Beauty Memory',
      description: 'AuraAI remembers your skin type, hair structure, budget preferences, and reviews, dynamically adjusting match scores in the background.'
    },
    {
      icon: Sparkles,
      title: 'AI Style Advisor',
      description: 'Upload a quick selfie. Our vision engine determines face shape, skin undertone, and hair type to recommend perfect hair colors and makeup palettes.'
    },
    {
      icon: Search,
      title: 'Smart Salon Discovery',
      description: 'Instantly find clinics by locality, budget segments, and home service, showing tailored match scores for each selection.'
    },
    {
      icon: ShieldCheck,
      title: 'Review Intelligence',
      description: 'Skip reading hundreds of comments. AuraAI extracts actionable insights, outlining precise pros and cons for each salon automatically.'
    },
    {
      icon: Calendar,
      title: 'Beauty Journey Planning',
      description: 'Continuous planning timelines scheduling seasonal treatments, hair trim reminders, and bridal milestones in one click.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Tell AuraAI your goal',
      desc: 'Tell the AI concierge your service interest, area preference, and budget parameters in simple, conversational English.'
    },
    {
      num: '02',
      title: 'Receive recommendations',
      desc: 'Get a clean, sorted list of matches with local reviews, price points, and custom recommendations in seconds.'
    },
    {
      num: '03',
      title: 'Compare salons',
      desc: 'Browse galleries, view specific stylist portfolios, and read summaries of historical feedback.'
    },
    {
      num: '04',
      title: 'Book appointments',
      desc: 'Pick your preferred date and time slot. Receive instant confirmation alerts on your user dashboard.'
    },
    {
      num: '05',
      title: 'Leave reviews',
      desc: 'Submit feedback to help refine AuraAI’s predictions, earning loyalty coins for your next luxury visit.'
    },
    {
      num: '06',
      title: 'Get smarter suggestions',
      desc: 'The next time you open AuraAI, your experience adjusts dynamically based on your growth logs and skin health metrics.'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Marketing Lead',
      quote: 'AuraAI completely changed how I discover wellness in Bangalore. The recommendation for the hydra facial in Indiranagar was spot on! The salon interface is exceptionally premium.',
      rating: 5,
      avatarBg: 'bg-rosegold-500'
    },
    {
      name: 'Dr. Shruti Sen',
      role: 'Dermatologist',
      quote: 'As a skin specialist, I was pleasantly surprised by the AI Advisor. The skin undertone detection was accurate, and the suggested services prioritize skin health.',
      rating: 5,
      avatarBg: 'bg-gold-metallic'
    },
    {
      name: 'Malini Rao',
      role: 'Bridal Stylist',
      quote: 'I booked the Play Salon bridal package through Aura. The entire workflow was incredibly smooth. Having the global dashboard manage my wedding appointments saved hours.',
      rating: 5,
      avatarBg: 'bg-charcoal-700'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-linear-to-b from-rosegold-100/30 via-transparent to-transparent">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] rounded-full bg-linear-to-tr from-rosegold-300/30 to-gold-light/40 blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-rosegold-300 bg-white/60 dark:bg-charcoal-900/60 backdrop-blur-xs shadow-xs text-xs font-semibold text-charcoal-800 dark:text-rosegold-200">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500 animate-spin" />
            <span>Bangalore&apos;s First Proactive AI Beauty Agent</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-charcoal-950 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Beauty Decisions, <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-rosegold-600 via-gold-metallic to-rosegold-500 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-600 dark:text-rosegold-200 max-w-2xl mx-auto font-light leading-relaxed">
            Find salons, plan beauty journeys, discover styles, and book appointments with a concierge that remembers you.
          </p>

          {/* Prompt simulator container */}
          <div className="max-w-xl mx-auto rounded-2xl border border-rosegold-200 dark:border-charcoal-800 bg-white/70 dark:bg-charcoal-900/70 p-4 shadow-xl backdrop-blur-md flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-rosegold-100 dark:bg-charcoal-800 flex items-center justify-center text-rosegold-500">
              <Brain className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 text-left font-mono text-xs sm:text-sm text-charcoal-700 dark:text-rosegold-100">
              <span>{typedText}</span>
              <span className="w-2 h-4 inline-block bg-rosegold-500 ml-1 animate-pulse"></span>
            </div>
            <Link 
              href="/concierge" 
              className="p-2 rounded-lg bg-rosegold-500 text-white hover:bg-rosegold-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-medium shadow-md hover:shadow-lg hover:scale-102 transition-all group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/concierge"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-full border border-rosegold-300 dark:border-charcoal-850 hover:bg-rosegold-100/40 dark:hover:bg-charcoal-900 font-medium transition-all"
            >
              Try AuraAI
            </Link>
          </div>
        </div>
      </section>

      {/* Visual AI Concierge Journey Timeline Section */}
      <section className="py-16 bg-rosegold-50/10 dark:bg-charcoal-950/20 border-t border-b border-rosegold-200/30 dark:border-charcoal-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Intelligent Loop</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-950 dark:text-white">The AI Concierge Journey</h2>
            <p className="text-xs sm:text-sm text-charcoal-550 dark:text-rosegold-200 font-light">A continuous optimization cycle that adapts to your beauty profile over time.</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-linear-to-r from-rosegold-300 via-gold-metallic to-rosegold-400 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
              {steps.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 text-center space-y-3 hover:border-rosegold-300 transition-all shadow-2xs hover:scale-102">
                  <div className="mx-auto w-9 h-9 rounded-full bg-linear-to-tr from-rosegold-550 to-gold-metallic text-white flex items-center justify-center text-xs font-bold font-mono">
                    {item.num}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-charcoal-500 leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-charcoal-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white">
              Smarter Care, Tailored For You
            </h2>
            <p className="text-sm sm:text-base text-charcoal-500 dark:text-rosegold-200">
              AuraAI replaces standard lists with deep profile memory, computer vision advisor scans, and decision support logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-rosegold-50/20 dark:bg-charcoal-950/20 hover:scale-102 hover:shadow-lg transition-all duration-300 flex flex-col space-y-4 ${
                    idx === 3 || idx === 4 ? 'md:col-span-1.5' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-rosegold-100 dark:bg-charcoal-800 flex items-center justify-center text-rosegold-500 shadow-xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal-950 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-charcoal-500 dark:text-rosegold-300 leading-relaxed flex-grow">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-charcoal-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white">
              Approved by Discerning Clients
            </h2>
            <p className="text-sm sm:text-base text-charcoal-500 dark:text-rosegold-200">
              Read how Bangalore’s modern professionals use AuraAI for grooming, wellness, and aesthetic recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 shadow-xs flex flex-col justify-between space-y-6"
              >
                <p className="text-sm text-charcoal-600 dark:text-rosegold-200 italic leading-relaxed">
                  &ldquo;{test.quote}&rdquo;
                </p>

                <div className="flex items-center space-x-3 pt-4 border-t border-rosegold-100 dark:border-charcoal-800">
                  <div className={`w-10 h-10 rounded-full ${test.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-inner`}>
                    {test.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal-950 dark:text-white">{test.name}</h4>
                    <p className="text-xs text-charcoal-400 dark:text-charcoal-500">{test.role}</p>
                  </div>
                  <div className="ml-auto flex space-x-0.5">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-rosegold-500 fill-rosegold-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom banner */}
      <section className="py-16 bg-linear-to-r from-rosegold-100/40 via-gold-light/40 to-rosegold-100/40 dark:from-charcoal-950 dark:to-charcoal-900 border-t border-b border-rosegold-200/50 dark:border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white">
            Ready to upgrade your beauty regime?
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 dark:text-rosegold-250 max-w-xl mx-auto">
            Book appointments dynamically, analyse skin undertones, and chat with AuraAI today.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-medium shadow-md hover:shadow-lg hover:scale-102 transition-all"
            >
              Try AuraAI Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
