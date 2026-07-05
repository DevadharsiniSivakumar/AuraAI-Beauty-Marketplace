'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useApp, ChatMessage } from '../context/AppContext';

export default function StyleAdvisor() {
  const { salons, userProfile, beautyProfile } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'aura',
      text: `Hello! I'm your Style Advisor.\n\nUpload a photo or describe your features (e.g., "I have an oval face and 2C wavy hair") and I'll suggest styles, makeup, and treatments for you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Recommend a haircut for an oval face",
    "What makeup suits warm olive skin?",
    "Build a 30-day hair recovery plan",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);

    // Mock response for Style Advisor since it might not have a dedicated API route in this simplified version
    setTimeout(() => {
      const auraMsg: ChatMessage = {
        id: `msg-${Date.now()}-aura`,
        sender: 'aura',
        text: `Based on your request, I recommend a layered cut to add volume, and a hydrating facial to prep your skin.\n\nHere are some salons that specialize in these services:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: [
          { type: 'service', id: 'bc-hair-1', name: 'Luxury Balayage & Styling', salonId: 'bodycraft-indiranagar' },
          { type: 'service', id: 'bc-facial-1', name: 'Advanced Hydra Facial', salonId: 'bodycraft-indiranagar' }
        ]
      };
      
      setMessages(prev => [...prev, auraMsg]);
      setIsAiTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FCFAF8]">
      <Navbar />

      <div className="flex-grow flex overflow-hidden max-w-7xl w-full mx-auto sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        
        {/* Left Sidebar - History */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#FFFFFF] border border-[#E5DED8] rounded-md overflow-hidden h-full">
          <div className="p-4 border-b border-[#E5DED8] bg-[#FCFAF8]">
            <h3 className="font-bold text-[#2D2926]">Chat History</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            <p className="text-[#716A65] text-xs italic">No previous chats.</p>
          </div>
        </aside>

        {/* Right Chat Container */}
        <section className="flex-1 flex flex-col bg-[#FFFFFF] border-y sm:border border-[#E5DED8] sm:rounded-md overflow-hidden h-full relative">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[#E5DED8] bg-[#FCFAF8] flex items-center shrink-0">
            <div>
              <h2 className="text-base font-bold text-[#2D2926]">Style Advisor</h2>
              <p className="text-xs text-[#716A65]">Active</p>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FCFAF8]">
            {messages.map((msg) => {
              const isAura = msg.sender === 'aura';
              return (
                <div key={msg.id} className={`flex max-w-[85%] ${isAura ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`p-3 rounded-lg text-sm ${
                    isAura 
                      ? 'bg-[#FFFFFF] border border-[#E5DED8] text-[#2D2926]' 
                      : 'bg-[#2D2926] text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Render basic recommendations if available */}
                    {isAura && msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-[#E5DED8] pt-3">
                        {msg.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-[#FCFAF8] p-2 rounded border border-[#E5DED8] text-xs">
                            <strong className="block text-[#2D2926]">{rec.name}</strong>
                            <Link 
                              href={rec.type === 'salon' ? `/salons/${rec.id}` : `/booking?salon=${rec.salonId}&service=${rec.id}`}
                              className="text-[#9D5965] hover:underline mt-1 inline-block"
                            >
                              View &rarr;
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className={`block text-[10px] mt-2 text-right ${isAura ? 'text-[#716A65]' : 'text-gray-300'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex max-w-[85%] mr-auto">
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DED8] text-[#716A65] text-sm flex items-center gap-1">
                  Typing...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat input controls */}
          <div className="p-4 border-t border-[#E5DED8] bg-[#FFFFFF] shrink-0">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(p)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-[#E5DED8] bg-[#FCFAF8] text-[#716A65] hover:text-[#2D2926] hover:border-[#9D5965] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask your Style Advisor..."
                className="flex-1 text-sm bg-[#FCFAF8] border border-[#E5DED8] rounded-full px-4 py-3 focus:outline-none focus:border-[#9D5965] text-[#2D2926]"
              />
              <button
                type="submit"
                className="p-3 rounded-full bg-[#2D2926] text-white hover:bg-[#1a1715] transition-colors"
              >
                Send
              </button>
            </form>
          </div>

        </section>

      </div>
    </div>
  );
}
