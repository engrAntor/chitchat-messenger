'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu, X, MessageSquare, Zap, Shield, Smartphone, Globe, Cloud,
  ChevronDown, Send, CheckCircle2, Users, Activity, Lock, ArrowRight,
  PlayCircle, MessageCircle, Star, Heart
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Demo', href: '#demo' },
  { name: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Lightning Fast',
    description: 'Real-time messaging powered by WebSockets with under 10ms latency globally.'
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'End-to-End Encrypted',
    description: 'Your conversations are private. We use 256-bit encryption for all messages.'
  },
  {
    icon: <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Cross-Platform',
    description: 'Seamless sync across web, desktop, and mobile devices. Start on phone, finish on laptop.'
  },
  {
    icon: <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Global CDN',
    description: 'Distributed infrastructure ensures you get the fastest connection anywhere in the world.'
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Unlimited Groups',
    description: 'Create channels and groups with up to 100,000 members with no performance drop.'
  },
  {
    icon: <Cloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Cloud Backup',
    description: 'Never lose a message. Automatic encrypted cloud backups of your chat history.'
  }
];

const STEPS = [
  {
    title: 'Create an Account',
    description: 'Sign up in seconds using your phone number.'
  },
  {
    title: 'Invite Friends',
    description: 'Share your unique AltChat link or search by phone number.'
  },
  {
    title: 'Start Chatting',
    description: 'Send messages, files, and voice notes instantly.'
  },
  {
    title: 'Stay Connected',
    description: 'Enable push notifications to never miss important messages.'
  }
];

const FAQS = [
  {
    question: 'Is AltChat really free to use?',
    answer: 'Yes! Our core messaging features will always be free for personal use. We offer premium plans for organizations requiring advanced administrative controls and integrations.'
  },
  {
    question: 'How secure is my data?',
    answer: 'We use industry-standard AES-256 end-to-end encryption. Not even our engineers can read your messages. Your privacy is our top priority.'
  },
  {
    question: 'Can I migrate my chats from other apps?',
    answer: 'Currently, we support importing chat histories from select major platforms. Check our help center for a step-by-step guide on migration.'
  },
  {
    question: 'What platforms is AltChat available on?',
    answer: 'AltChat is available on Web, iOS, Android, macOS, Windows, and Linux. All your chats sync perfectly across all your devices.'
  },
  {
    question: 'Do you offer an API for developers?',
    answer: 'Yes, we have a robust REST and WebSocket API. You can build bots, custom clients, and integrate AltChat into your own applications.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    role: 'Product Manager, TechFlow',
    content: 'AltChat completely transformed how our remote team communicates. The speed and reliability are unmatched compared to our previous tools.'
  },
  {
    name: 'David Chen',
    role: 'Freelance Designer',
    content: 'The UI is just stunning. As a designer, I appreciate the attention to detail, the smooth animations, and how clean the entire experience is.'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Community Lead, DevSphere',
    content: 'Managing a community of 50,000 developers was a breeze with AltChat. The moderation tools and group management are exactly what we needed.'
  }
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Interactive Demo State
  const [demoMessages, setDemoMessages] = useState([
    { id: 1, text: 'Hey there! Welcome to AltChat 👋', sender: 'them' },
    { id: 2, text: 'Try typing a message below!', sender: 'them' }
  ]);
  const [demoInput, setDemoInput] = useState('');
  const [demoIsTyping, setDemoIsTyping] = useState(false);
  const demoContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (demoContainerRef.current) {
      demoContainerRef.current.scrollTo({
        top: demoContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [demoMessages, demoIsTyping]);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    const newMsg = { id: Date.now(), text: demoInput, sender: 'me' };
    setDemoMessages(prev => [...prev, newMsg]);
    setDemoInput('');
    setDemoIsTyping(true);

    setTimeout(() => {
      setDemoIsTyping(false);
      setDemoMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: "That's the spirit! Fast and fluid like magic ✨", sender: 'them' }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* 1. Sticky Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-indigo-500/20 shrink-0">
                <Image src="/logo.jpg" alt="AltChat Logo" fill sizes="32px" className="object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight">AltChat</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="px-4 pt-2 pb-6 space-y-4">
              {NAV_LINKS.map(link => (
                <Link key={link.name} href={link.href} className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                <Link href="/login" className="block text-center px-4 py-2 font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg">
                  Sign in
                </Link>
                <Link href="/signup" className="block text-center px-4 py-2 font-medium bg-indigo-600 text-white rounded-lg">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-24 lg:pt-16 lg:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 -z-10 rounded-full blur-3xl opacity-70"></div>
          
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  AltChat v2.0 is now live
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Connect with clarity. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-gradient">
                    Chat with friends & teams.
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
                  Chat with your friends, organization, and communities in real-time. Experience lightning-fast delivery, end-to-end security, and beautiful design.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    Start for free <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="px-8 py-4 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-lg transition-all flex items-center justify-center gap-2">
                    <PlayCircle className="w-5 h-5" /> Watch demo
                  </button>
                </div>
              </div>

              {/* Hero Animated Mockup */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-full animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-3"></div>
                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                  {/* Mockup Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="font-medium text-sm text-center flex-1 text-gray-600 dark:text-gray-400">Design Team</div>
                  </div>
                  {/* Mockup Body */}
                  <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4 bg-slate-50/50 dark:bg-gray-950/50 relative">
                    <div className="self-start max-w-[80%] flex gap-3 animate-fade-in" style={{animationDelay: '0.2s'}}>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">JD</div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 text-sm">
                        Just pushed the new landing page designs! 🚀
                      </div>
                    </div>
                    <div className="self-end max-w-[80%] flex gap-3 flex-row-reverse animate-fade-in" style={{animationDelay: '0.8s'}}>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">ME</div>
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm text-sm">
                        Looks incredible! The gradient text is a nice touch.
                      </div>
                    </div>
                    <div className="self-start max-w-[80%] flex gap-3 animate-fade-in" style={{animationDelay: '1.4s'}}>
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs shrink-0">AS</div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 text-sm">
                        Agreed. Are we ready for the launch tomorrow?
                      </div>
                    </div>
                    
                    {/* Typing Indicator */}
                    <div className="absolute bottom-4 left-4 self-start max-w-[80%] flex gap-3 animate-fade-in" style={{animationDelay: '2s'}}>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">JD</div>
                      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Trusted By */}
        <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Fake Logos using lucide icons as placeholders */}
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Activity className="w-8 h-8" /> AcmeCorp</div>
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Hexagon className="w-8 h-8" /> GlobalNet</div>
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Layers className="w-8 h-8" /> StackSync</div>
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Box className="w-8 h-8" /> BoxedIn</div>
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Cpu className="w-8 h-8" /> Nexus</div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-24 bg-white dark:bg-gray-950">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to communicate</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Built from the ground up for performance, security, and delightful user experiences.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-gray-900">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get up and running in minutes</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">We've removed all the friction so you can focus on your conversations.</p>
            </div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
              
              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                {STEPS.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 shadow-sm mb-6 z-10">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Interactive Demo Section */}
        <section id="demo" className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 dark:from-gray-900 dark:to-indigo-950 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Try it for yourself</h2>
                  <p className="text-indigo-100 mb-8 text-lg">Send a message below and see how fast AltChat really is. No signup required to test the waters.</p>
                  
                  <ul className="space-y-4">
                    {['Zero configuration required', 'Instant bidirectional communication', 'Smart auto-replies included'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col h-[400px] border border-gray-200 dark:border-gray-800">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-indigo-500/20">
                          <Image src="/logo.jpg" alt="AltChat Bot" fill sizes="32px" className="object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">AltChat Bot</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
                      </div>
                    </div>
                  </div>
                  
                  <div ref={demoContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50 dark:bg-gray-950">
                    {demoMessages.map((msg) => (
                      <div key={msg.id} className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.sender === 'me' 
                          ? 'self-end bg-indigo-600 text-white rounded-tr-sm' 
                          : 'self-start bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    ))}
                    
                    {demoIsTyping && (
                      <div className="self-start max-w-[80%] bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleDemoSubmit} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl flex gap-2">
                    <input 
                      type="text" 
                      value={demoInput}
                      onChange={e => setDemoInput(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    />
                    <button 
                      type="submit"
                      disabled={!demoInput.trim() || demoIsTyping}
                      className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Statistics Section */}
        <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-gray-100 dark:divide-gray-800">
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">&lt;10ms</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Latency</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">99.99%</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Uptime SLA</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">256-bit</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">E2E Encryption</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">5M+</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Messages Daily</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Testimonials */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/30">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by builders</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Don't just take our word for it. Here's what our users have to say.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex gap-1 mb-6 text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-8 italic">"{t.content}"</p>
                  </div>
                  <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center font-bold text-indigo-800 dark:text-indigo-200 shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ Section */}
        <section id="faq" className="py-24 bg-white dark:bg-gray-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-400">Got questions? We've got answers.</p>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 transition-all">
                  <button 
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 mt-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. CTA Banner */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to upgrade your conversations?</h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of people and teams already using AltChat to communicate faster, clearer, and more securely.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login" className="px-8 py-4 rounded-full bg-white text-indigo-600 hover:bg-gray-50 font-bold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center">
                  Get Started for Free
                </Link>
                <Link href="/login" className="px-8 py-4 rounded-full bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-400 text-white font-semibold text-lg transition-colors inline-flex items-center justify-center">
                  Sign In Now
                </Link>
              </div>
              <p className="mt-6 text-sm text-indigo-200">No password required. Instant login with phone number.</p>
            </div>
          </div>
        </section>
      </main>

      {/* 11. Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 pt-16 pb-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-indigo-500/20 shrink-0">
                  <Image src="/logo.jpg" alt="AltChat Logo" fill sizes="32px" className="object-cover" />
                </div>
                <span className="font-bold text-xl">AltChat</span>
              </div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                Chat with your friends, organization etc.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-xs leading-relaxed">
                Next-generation communication platform designed for speed, security, and simplicity.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Features</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Integrations</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Pricing</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Documentation</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">API Reference</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} AltChat Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              Made with <Heart className="w-4 h-4 text-red-500" /> for the community
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons placeholders for Trusted By section
function Hexagon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
function Layers(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg> }
function Box(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> }
function Cpu(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg> }

function Github(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> }
function Twitter(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg> }
function Linkedin(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> }
