'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  Sparkles, 
  Search, 
  Brain, 
  Calendar, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  ChevronRight,
  Check,
  MessageSquare,
  Bookmark,
  UserCheck,
  Compass
} from 'lucide-react';

export default function LandingPage() {
  const [typedText, setTypedText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'budget' | 'wedding' | 'style'>('budget');

  const prompts = [
    "Find a hydra facial under ₹3000 in Indiranagar...",
    "Recommend luxury salons near UB City...",
    "Suggest a hair style matching my round face...",
    "My wedding is in 45 days. Suggest prep schedule..."
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
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, promptIndex]);

  const capabilities = [
    {
      icon: MessageSquare,
      title: 'Beauty Guidance',
      desc: 'Ask about skincare or haircare. Aura details safe home remedies first, explains their DIY challenges, and suggests corresponding salon services.'
    },
    {
      icon: Search,
      title: 'Salon Discovery',
      desc: 'Browse and search premier wellness clinics matching your exact neighborhood, budget range, and doorstep home-service preferences.'
    },
    {
      icon: ShieldCheck,
      title: 'Review Intelligence',
      desc: 'View AI-extracted positive strengths and recurring complaints directly on salon profiles, skipping hundreds of conflicting comments.'
    },
    {
      icon: Calendar,
      title: 'Beauty Journey Planning',
      desc: 'Generate event-specific preparation timelines (such as Wedding Prep, Hair Recovery, or Maintenance) and log status details.'
    },
    {
      icon: Brain,
      title: 'Style Recommendations',
      desc: 'Upload a selfie to run our vision analysis. Face shape, hair texture, and skin undertones are mapped into a persistent Beauty DNA Profile.'
    },
    {
      icon: Bookmark,
      title: 'Booking Management',
      desc: 'Schedule, track status, or cancel appointments directly from the user dashboard with dynamic Firestore notifications.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Tell Aura Your Goal',
      desc: 'Ask our concierge for a treatment, style advice, or an event preparation timeline in plain English.'
    },
    {
      num: '02',
      title: 'Receive Personalized Guidance',
      desc: 'Get safe DIY home alternatives followed by professional suggestions tailored to your budget and beauty profile.'
    },
    {
      num: '03',
      title: 'Understand Your Options',
      desc: 'Filter matched salons by locality, verified customer ratings, and door-step home visit services.'
    },
    {
      num: '04',
      title: 'Book Appointments',
      desc: 'Select an available time slot and book instantly, receiving automated status notifications on your dashboard.'
    },
    {
      num: '05',
      title: 'Receive Smarter Suggestions',
      desc: 'Future recommendations dynamically improve as Aura learns your booking preferences and rating history.'
    }
  ];

  const testimonials = [
    {
      name: 'Neha Sen',
      role: 'Bridal Prep Client, Indiranagar',
      quote: 'I used Aura to plan my bridal beauty appointments. It helped me organize my timeline and booking schedules without visiting multiple websites. The event calendar made tracking progress so simple!',
      rating: 5,
      avatarBg: 'bg-rosegold-500'
    },
    {
      name: 'Aman Verma',
      role: 'Regular Grooming User, HSR Layout',
      quote: 'Finding a top-rated salon that offers professional hair spas within my budget was simple. The review intelligence pros and cons summaries saved me from scanning dozens of conflicting Google reviews.',
      rating: 5,
      avatarBg: 'bg-gold-metallic'
    },
    {
      name: 'Kavitha Rao',
      role: 'Skincare Consultation, Koramangala',
      quote: 'Aura recommended home remedies like raw honey and yogurt for my dry skin, explained the extraction limits, and recommended a Hydra Facial. Booking right from the concierge interface was seamless.',
      rating: 5,
      avatarBg: 'bg-charcoal-700'
    }
  ];

  const conversationShowcases = {
    budget: {
      user: "I need a hydra facial under ₹3000",
      aura: "Here are 3 highly rated options near you matching your budget:",
      details: [
        { name: "Bodycraft Salon & Spa", price: "Starts at ₹2,500", match: "94% Match", note: "Indiranagar (Offers Doorstep Home Service)" },
        { name: "Play Salon", price: "Starts at ₹2,800", match: "91% Match", note: "Vittal Mallya Rd (Luxury Option)" },
        { name: "YLG Salon", price: "Starts at ₹1,800", match: "89% Match", note: "HSR Layout (Budget Friendly)" }
      ]
    },
    wedding: {
      user: "My wedding is in 45 days. What's my prep timeline?",
      aura: "I've generated a 45-day Event Prep Journey tailored to your wavy hair and skin type:",
      details: [
        { name: "Day 45 (6 Weeks Out)", price: "Initial Consultation", match: "Skin/Hair evaluation", note: "Evaluate skin barrier and schedule hair cut/trim." },
        { name: "Day 30 (4 Weeks Out)", price: "Structural Hair Care", match: "Kérastase Ritual", note: "Deep conditioning bond builders for maximum hair shine." },
        { name: "Day 15 (2 Weeks Out)", price: "Advanced Hydra Facial", match: "Dermal hydration", note: "Deep cleansing clean-up at Bodycraft Indiranagar." },
        { name: "Day 2 (2 Days Out)", price: "Final Grooming & Makeup", match: "Bridal Trial", note: "Manicure, pedicure, and styling check." }
      ]
    },
    style: {
      user: "What hairstyle suits me best?",
      aura: "Based on your persistent Beauty DNA Profile (selfie-analyzed):",
      details: [
        { name: "Face Shape: Oval Contour", price: "Highly compatible", match: "Hairstyle recommendation", note: "Soft Shag Cut with Curtain Bangs to highlight cheek contours." },
        { name: "Hair Type: 2C Wavy Texture", price: "Low-heat styling", match: "Frizz management", note: "Recommended products: light styling creams, argan oil masks." },
        { name: "Skin Tone: Warm Olive", price: "Warm undertones", match: "Makeup suggestion", note: "Sun-kissed Golden Glow or monochromatic peach palettes." }
      ]
    }
  };

  const outcomes = [
    "Find salons that match your budget parameters.",
    "Compare services and verified customer feedback.",
    "Create personalized beauty plans for events or weddings.",
    "Get professional guidance before important occasions.",
    "Discover hairstyles and makeup colors that suit you."
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-linear-to-b from-rosegold-100/10 via-transparent to-transparent">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] rounded-full bg-linear-to-tr from-rosegold-200/10 to-rosegold-300/10 blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Featured Brand Logo Accent */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center shadow-lg border border-rosegold-300/30 hover:scale-105 transition-all duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt="Aura Logo" 
                className="w-full h-full object-cover scale-[1.7] transform" 
              />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-rosegold-300/40 bg-white/60 dark:bg-charcoal-900/60 backdrop-blur-xs shadow-xs text-xs font-semibold text-charcoal-800 dark:text-rosegold-200">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Beauty decisions made simpler.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-charcoal-950 dark:text-white max-w-4xl mx-auto leading-[1.15] font-playfair">
            Find the right salon. <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-rosegold-600 to-rosegold-500 bg-clip-text text-transparent">
              Not just the nearest one.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-600 dark:text-rosegold-200 max-w-2xl mx-auto font-light leading-relaxed">
            Personalized beauty guidance, tailored to you.
          </p>

          {/* Prompt simulator container */}
          <div className="max-w-xl mx-auto rounded-2xl border border-rosegold-200/40 dark:border-charcoal-800/80 bg-white dark:bg-charcoal-900/80 p-3.5 shadow-sm flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-rosegold-50 dark:bg-charcoal-800 flex items-center justify-center text-rosegold-550">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left font-mono text-xs sm:text-sm text-charcoal-700 dark:text-rosegold-100">
              <span>{typedText}</span>
              <span className="w-2 h-4 inline-block bg-rosegold-500 ml-1 animate-pulse"></span>
            </div>
            <Link 
              href="/concierge" 
              className="p-2 rounded-lg bg-rosegold-500 text-white hover:bg-rosegold-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 dark:bg-white dark:hover:bg-charcoal-100 dark:text-charcoal-950 text-white font-medium shadow-xs hover:scale-102 transition-all group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/concierge"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-full border border-rosegold-300/60 dark:border-charcoal-800 text-charcoal-800 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-900 font-medium transition-all"
            >
              Chat with Aura
            </Link>
          </div>
        </div>
      </section>

      {/* AI Concierge Showcase: Hero Conversational Feature */}
      <section className="py-16 bg-white dark:bg-charcoal-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Live Simulation</span>
            <h2 className="text-3xl font-bold text-charcoal-950 dark:text-white font-playfair">Conversations with Aura</h2>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200 font-light">See how our concierge immediately addresses your styling, budgeting, and planning queries.</p>
          </div>

          {/* Tabs header */}
          <div className="flex justify-center border-b border-rosegold-200/50 dark:border-charcoal-800 mb-8 max-w-lg mx-auto">
            <button
              onClick={() => setActiveShowcaseTab('budget')}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                activeShowcaseTab === 'budget'
                  ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-200'
                  : 'border-transparent text-charcoal-400 hover:text-charcoal-600 dark:hover:text-rosegold-300'
              }`}
            >
              Budget Search
            </button>
            <button
              onClick={() => setActiveShowcaseTab('wedding')}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                activeShowcaseTab === 'wedding'
                  ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-200'
                  : 'border-transparent text-charcoal-400 hover:text-charcoal-600 dark:hover:text-rosegold-300'
              }`}
            >
              Event Prep
            </button>
            <button
              onClick={() => setActiveShowcaseTab('style')}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                activeShowcaseTab === 'style'
                  ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-200'
                  : 'border-transparent text-charcoal-400 hover:text-charcoal-600 dark:hover:text-rosegold-300'
              }`}
            >
              Style Advice
            </button>
          </div>

          {/* Showcase Bubble Panel */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-rosegold-200 dark:border-charcoal-800 bg-rosegold-50/20 dark:bg-charcoal-950/20 p-6 sm:p-8 shadow-xl space-y-6">
            {/* User message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rosegold-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                U
              </div>
              <div className="bg-white dark:bg-charcoal-900 rounded-2xl rounded-tl-none p-4 border border-rosegold-100 dark:border-charcoal-850 shadow-2xs max-w-[85%]">
                <p className="text-sm text-charcoal-800 dark:text-rosegold-100 font-medium">
                  &ldquo;{conversationShowcases[activeShowcaseTab].user}&rdquo;
                </p>
              </div>
            </div>

            {/* Aura response */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-linear-to-br from-rosegold-550 to-gold-metallic text-white rounded-2xl rounded-tr-none p-4 shadow-md max-w-[85%] space-y-4">
                <div className="flex items-center space-x-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 font-mono">Aura Concierge</span>
                </div>
                <p className="text-sm leading-relaxed">
                  {conversationShowcases[activeShowcaseTab].aura}
                </p>

                {/* Structured details inside response */}
                <div className="space-y-2 pt-2 border-t border-white/20">
                  {conversationShowcases[activeShowcaseTab].details.map((item, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-2.5 space-y-1 backdrop-blur-xs">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{item.name}</span>
                        <span className="opacity-95 font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{item.match}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] opacity-90">
                        <span>{item.note}</span>
                        <span className="font-semibold">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Outcomes Section: How AuraAI Helps You */}
      <section className="py-16 bg-rosegold-50/10 dark:bg-charcoal-950/20 border-t border-b border-rosegold-200/30 dark:border-charcoal-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Outcome Oriented</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white leading-tight font-playfair">
                How Aura Helps You
              </h2>
              <p className="text-charcoal-600 dark:text-rosegold-200 leading-relaxed font-light">
                We built Aura to solve a simple problem: finding and organizing premium beauty care should not feel like research. We focus on practical, stress-free outcomes so you can book with confidence.
              </p>
              
              {/* Checklist */}
              <ul className="space-y-3.5 pt-2">
                {outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-charcoal-850 dark:text-rosegold-100">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Credibility graphic or investor pitch points */}
            <div className="bg-white dark:bg-charcoal-900 border border-rosegold-200 dark:border-charcoal-850 rounded-3xl p-8 shadow-xl space-y-6">
              <h4 className="text-lg font-bold text-charcoal-950 dark:text-white border-b border-rosegold-100 dark:border-charcoal-800 pb-3 font-playfair">
                Why Aura is Different
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-rosegold-500">Personalization</h5>
                  <p className="text-xs text-charcoal-550 dark:text-rosegold-250 mt-1 leading-relaxed font-light">
                    Standard search directories prioritize sponsored advertisements. Aura runs a preference profile in the background, matching wellness services using actual compatibility scores.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-rosegold-500">Review Analysis</h5>
                  <p className="text-xs text-charcoal-550 dark:text-rosegold-250 mt-1 leading-relaxed font-light">
                    Instead of scanning hundreds of comments, our intelligence system analyzes historical sentiment metrics, presenting a transparent summary of positive strengths and complaints for each partner salon.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-rosegold-500">Beauty Profile</h5>
                  <p className="text-xs text-charcoal-550 dark:text-rosegold-250 mt-1 leading-relaxed font-light">
                    A single selfie analysis records your skin tone and hair density parameters. This profile is integrated with the concierge, allowing Aura to offer highly specialized style advice on the fly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Proof Section: What AuraAI Can Do */}
      <section id="proof" className="py-20 bg-white dark:bg-charcoal-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Core Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white font-playfair">
              What Aura Can Do
            </h2>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200 font-light">
              Explore the actual working features built into Aura designed to simplify your wellness bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capabilities.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-rosegold-50/20 dark:bg-charcoal-950/20 hover:scale-102 hover:shadow-lg transition-all duration-300 flex flex-col space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-rosegold-100 dark:bg-charcoal-800 flex items-center justify-center text-rosegold-500 shadow-xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-950 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-550 dark:text-rosegold-300 leading-relaxed flex-grow font-light">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Journey Section (Simplified Loop) */}
      <section className="py-20 bg-rosegold-50/10 dark:bg-charcoal-950/20 border-t border-b border-rosegold-200/30 dark:border-charcoal-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Timeline Workflow</span>
            <h2 className="text-3xl font-bold text-charcoal-950 dark:text-white font-playfair">Understand Your Journey</h2>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200 font-light">How Aura guides you from initial goal to smarter future suggestions.</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-linear-to-r from-rosegold-300 via-gold-metallic to-rosegold-400 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {steps.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 text-center space-y-3 hover:border-rosegold-300 transition-all shadow-2xs hover:scale-102">
                  <div className="mx-auto w-9 h-9 rounded-full bg-linear-to-tr from-rosegold-550 to-gold-metallic text-white flex items-center justify-center text-xs font-bold font-mono">
                    {item.num}
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-charcoal-500 leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-charcoal-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold-500">Customer Proof</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white font-playfair">
              Grounded in Real Customer Experience
            </h2>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">
              Read how our clients use Aura to discover grooming treatments and manage booking schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 shadow-xs flex flex-col justify-between space-y-6"
              >
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-rosegold-200 italic leading-relaxed font-light font-serif">
                  &ldquo;{test.quote}&rdquo;
                </p>

                <div className="flex items-center space-x-3 pt-4 border-t border-rosegold-100 dark:border-charcoal-800">
                  <div className={`w-10 h-10 rounded-full ${test.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0`}>
                    {test.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-950 dark:text-white">{test.name}</h4>
                    <p className="text-[10px] text-charcoal-400 dark:text-charcoal-500 font-semibold">{test.role}</p>
                  </div>
                  <div className="ml-auto flex space-x-0.5 shrink-0">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-rosegold-500 fill-rosegold-500" />
                    ))}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom banner */}
      <section className="py-16 bg-rosegold-50/20 dark:bg-charcoal-950/20 border-t border-b border-rosegold-200/20 dark:border-charcoal-800/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          {/* Logo Brand Icon */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center shadow-md border border-rosegold-300/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt="Aura Logo" 
                className="w-full h-full object-cover scale-[1.7] transform" 
              />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white font-playfair">
            Ready to upgrade your beauty regime?
          </h2>
          <p className="text-sm sm:text-base text-charcoal-550 dark:text-rosegold-250 max-w-xl mx-auto">
            Book appointments dynamically, analyze styles using your profile, and chat with Aura today.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 dark:bg-white dark:hover:bg-charcoal-100 dark:text-charcoal-950 text-white font-medium shadow-xs hover:scale-102 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
