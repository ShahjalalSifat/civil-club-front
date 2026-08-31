'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, RefreshCw, Sparkles, MessageCircleQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ASSISTANT_NAME = 'Engr. Kuchu Puchu';
const GREETING_TEXT =
  'হাই! আমি **Engr. Kuchu Puchu** \n\nHSTU Civil Engineering Club এর তথ্য ও সহায়তায় আছি। নিচের বিষয়গুলোতে সাহায্য করতে পারি:\n-  ক্লাবের মেম্বারশিপ ও নিয়মকানুন\n-  সিভিল ইঞ্জিনিয়ারিং একাডেমিক তথ্য\n-  ইভেন্ট, ওয়ার্কশপ ও নোটিশ\n\nকীভাবে সাহায্য করতে পারি?';

const QUICK_SUGGESTIONS = [
  'সিভিল ইঞ্জিনিয়ারিং কি?',
  'মেম্বারশিপ কীভাবে নেওয়া যায়?',
  'সিভিল ক্লাব কী কী কাজ করে?',
];

// Instant, high-quality pre-baked answers for the most common questions
const INSTANT_ANSWERS: Record<string, string> = {
  'সিভিল ইঞ্জিনিয়ারিং কি?': `**সিভিল ইঞ্জিনিয়ারিং (Civil Engineering)** হলো মানব সভ্যতার ভৌত ও প্রাকৃতিক অবকাঠামো পরিকল্পনা, ডিজাইন, নির্মাণ এবং রক্ষণাবেক্ষণের প্রাচীনতম ও অন্যতম প্রধান প্রকৌশলবিদ্যা।

**প্রধান ৫টি শাখা ও ক্ষেত্রসমূহ:**
1.  **Structural Engineering**: বহুতল ভবন, দীর্ঘ স্প্যান ব্রিজ, ফ্লাইওভার, স্টেডিয়াম ও টাওয়ারের স্থায়িত্ব এবং ভূমিকম্প সহনশীল ডিজাইন।
2.  **Geotechnical Engineering**: মাটির বৈশিষ্ট্য, গভীর পাইল ভিত্তি (Deep Foundation) এবং রিটেইনিং ওয়াল ডিজাইন।
3.  **Transportation Engineering**: আধুনিক এক্সপ্রেসওয়ে, রেলপথ, এয়ারপোর্ট ও ট্রাফিক ম্যানেজমেন্ট।
4.  **Water Resources Engineering**: নদীশাসন, বন্যা নিয়ন্ত্রণ বাঁধ, ক্যানাল ও সেচ প্রকল্প।
5.  **Environmental Engineering**: সুপেয় পানি শোধন, বর্জ্য ব্যবস্থাপনা ও পরিবেশ দূষণ নিয়ন্ত্রণ।`,

  'মেম্বারশিপ কীভাবে নেওয়া যায়?': `**HSTU Civil Engineering Club-এর মেম্বারশিপ নেওয়ার সহজ ধাপসমূহ:**

1.  **আবেদন ফরম পূরণ**: প্রতি সেমিস্টার বা শিক্ষাবর্ষের শুরুতে ক্লাবের অফিসিয়াল ওয়েবসাইট ও ডিপার্টমেন্ট নোটিশ বোর্ডের মাধ্যমে মেম্বারশিপ রিক্রুটমেন্ট ফরম উন্মুক্ত করা হয়।
2.  **যোগ্যতা**: হাবিপ্রবির সিভিল ইঞ্জিনিয়ারিং বিভাগের ১ম থেকে ৪র্থ বর্ষের যেকোনো নিয়মিত শিক্ষার্থী ক্লাবের সদস্য হতে পারবেন।
3.  **নিবন্ধন ফি জমা**: নির্ধারিত নামমাত্র সদস্য ফি ক্লাবের ট্রেজারার বা মনোনীত প্রতিনিধির কাছে জমা দিয়ে রিসিট সংগ্রহ করতে হবে।
4.  **মেম্বার আইডি সংগ্রহ**: নিবন্ধন সম্পন্ন হলে অফিসিয়াল মেম্বারশিপ কার্ড প্রদান করা হবে এবং ক্লাবের ওয়ার্কশপ, সেমিনার ও ইভেন্টে অগ্রাধিকার পাওয়া যাবে।`,

  'সিভিল ক্লাব কী কী কাজ করে?': `**HSTU Civil Engineering Club মূলত শিক্ষার্থীদের পেশাগত ও স্কিল ডেভেলপমেন্টের জন্য কাজ করে:**

-  **সফটওয়্যার ট্রেনিং ও ওয়ার্কশপ**: AutoCAD, ETABS, Revit, STAAD.Pro, SAFE, Civil 3D ইত্যাদির প্র্যাকটিক্যাল হ্যান্ডস-অন সেশন।
-  **ইন্ডাস্ট্রিয়াল সাইট ভিজিট**: মেগা প্রজেক্ট (যেমন- ব্রিজ, ফ্লাইওভার, ওয়াটার ট্রিটমেন্ট প্ল্যান্ট ও মেগা কনস্ট্রাকশন সাইট) সরাসরি পরিদর্শন।
-  **প্রতিযোগিতা আয়োজন**: CAD Design Battle, Bridge Making Competition, Civil Olympiad ও পোস্টার প্রেজেন্টেশন।
-  **একাডেমিক সেমিনার ও নেটওয়ার্কিং**: শীর্ষস্থানীয় ইঞ্জিনিয়ার, গবেষক ও অ্যালামনাইদের সাথে ক্যারিয়ার গাইডলাইন সেশন।
-  **সাংস্কৃতিক ও স্পোর্টস ইভেন্ট**: ফ্রেশার্স রিসেপশন, বিদায় সংবর্ধনা ও বার্ষিক স্পোর্টস টুর্নামেন্ট।`,
};

// Beautiful high-fidelity SVG Robot matching user reference
function RobotAvatar({ isWaving = false, size = 'md' }: { isWaving?: boolean; size?: 'sm' | 'md' | 'lg' | 'trigger' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const isTrigger = size === 'trigger';

  if (isSmall || isTrigger) {
    return (
      <div className={`relative ${isTrigger ? 'w-12 h-12' : 'w-9 h-9'} flex items-center justify-center select-none shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
          {/* Head White Shell */}
          <rect x="18" y="16" width="64" height="46" rx="23" fill="url(#botSmallWhite)" stroke="#CBD5E1" strokeWidth="2" />
          {/* Ears */}
          <rect x="12" y="28" width="8" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="80" y="28" width="8" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Dark Glass Visor */}
          <rect x="26" y="22" width="48" height="34" rx="15" fill="#0B132B" />
          {/* Visor Glare */}
          <path d="M 28 30 Q 50 24 72 30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" fill="none" />
          {/* Cyan Glow Eyes */}
          <path d="M 35 38 Q 41 31 47 38" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 53 38 Q 59 31 65 38" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Smile */}
          <path d="M 45 47 Q 50 51 55 47" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Body */}
          <path d="M 34 64 Q 50 63 66 64 C 66 75 59 86 50 86 C 41 86 34 75 34 64 Z" fill="url(#botSmallWhite)" stroke="#CBD5E1" strokeWidth="2" />
          <defs>
            <linearGradient id="botSmallWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Large Interactive Robot
  return (
    <div className={`relative ${isLarge ? 'w-44 h-48' : 'w-24 h-28'} flex items-center justify-center select-none`}>
      {/* Floating Shadow */}
      <motion.div
        className="absolute bottom-1 w-24 h-3.5 rounded-full bg-slate-400/20 dark:bg-black/40 blur-sm"
        animate={{ scale: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Robot Body */}
      <motion.div
        className="relative w-full h-full flex flex-col items-center justify-start"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 200 210" className="w-full h-full overflow-visible drop-shadow-2xl">
          <defs>
            <linearGradient id="shellWhite" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F8FAFC" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            <linearGradient id="torsoWhite" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="earPodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="darkVisorGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="60%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <filter id="cyanGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Ear */}
          <rect x="22" y="44" width="16" height="42" rx="8" fill="url(#earPodGrad)" stroke="#CBD5E1" strokeWidth="2" />
          {/* Right Ear */}
          <rect x="162" y="44" width="16" height="42" rx="8" fill="url(#earPodGrad)" stroke="#CBD5E1" strokeWidth="2" />

          {/* Left Arm */}
          <path
            d="M 52 108 C 30 115 24 135 32 155 C 38 168 50 162 50 150 C 44 138 48 124 58 116 Z"
            fill="url(#shellWhite)"
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />

          {/* Right Arm (Waving) */}
          <g>
            {isWaving ? (
              <motion.g
                style={{ originX: '148px', originY: '110px' }}
                animate={{ rotate: [0, 26, -14, 26, -8, 18, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3, ease: 'easeInOut' }}
              >
                {/* Arm raised up to wave */}
                <path
                  d="M 148 110 C 168 100 178 84 172 65 C 166 54 154 58 152 70 C 154 84 148 96 140 104 Z"
                  fill="url(#shellWhite)"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                />
                {/* Hand Palm */}
                <circle cx="166" cy="60" r="10" fill="url(#shellWhite)" stroke="#CBD5E1" strokeWidth="2" />
              </motion.g>
            ) : (
              <path
                d="M 148 108 C 170 115 176 135 168 155 C 162 168 150 162 150 150 C 156 138 152 124 142 116 Z"
                fill="url(#shellWhite)"
                stroke="#CBD5E1"
                strokeWidth="2.5"
              />
            )}
          </g>

          {/* Body */}
          <g>
            <path
              d="M 62 102 C 90 98 110 98 138 102 C 146 126 132 170 100 170 C 68 170 54 126 62 102 Z"
              fill="url(#torsoWhite)"
              stroke="#CBD5E1"
              strokeWidth="3"
            />
            <ellipse cx="78" cy="116" rx="14" ry="20" fill="#FFFFFF" opacity="0.6" transform="rotate(-15 78 116)" />
            <path d="M 68 134 Q 100 137 132 134" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 86 135 L 86 146 Q 100 148 114 146 L 114 135" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* Neck */}
          <rect x="86" y="90" width="28" height="14" rx="6" fill="#94A3B8" />

          {/* Head Shell */}
          <g>
            <rect
              x="34"
              y="18"
              width="132"
              height="88"
              rx="44"
              fill="url(#shellWhite)"
              stroke="#CBD5E1"
              strokeWidth="3"
            />
            {/* Specular Highlight */}
            <path d="M 58 26 Q 100 20 142 26" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Dark Visor */}
            <rect x="48" y="32" width="104" height="62" rx="28" fill="url(#darkVisorGrad)" stroke="#1E293B" strokeWidth="2" />
            
            {/* Visor Glare */}
            <path d="M 52 46 C 70 36 130 36 148 46 C 144 54 130 44 100 44 C 70 44 56 54 52 46 Z" fill="#FFFFFF" opacity="0.2" />

            {/* Cyan Eyes (Happy Winks) */}
            <g filter="url(#cyanGlowEffect)">
              <path d="M 68 58 Q 78 48 88 58" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 70 60 Q 78 52 86 60" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              <path d="M 112 58 Q 122 48 132 58" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 114 60 Q 122 52 130 60" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Cyan Mouth */}
              <path d="M 94 72 Q 100 78 106 72" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 95 72 Q 100 76 105 72" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}

// Crisp, Smooth Typewriter Effect for AI Messages
function TypewriterMessage({ text, animate = false }: { text: string; animate?: boolean }) {
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) return;

    const totalChars = text.length;
    const stepSize = totalChars > 250 ? 6 : totalChars > 100 ? 3 : 2;
    const intervalTime = 16; // ~60fps smooth typing

    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + stepSize;
        if (next >= totalChars) {
          clearInterval(timer);
          return totalChars;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [text, animate]);

  const currentText = animate ? text.slice(0, displayedLength) : text;
  const isTyping = animate && displayedLength < text.length;

  return (
    <div className="relative font-bangla text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-800 dark:text-slate-100 space-y-1.5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-bold [&_strong]:text-slate-950 dark:[&_strong]:text-white [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline font-normal tracking-wide">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 underline font-medium"
            />
          ),
        }}
      >
        {currentText}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-1.5 h-4 bg-blue-500 rounded-xs ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
}

function MessageBubble({ text, isUser, animate = false }: { text: string; isUser: boolean; animate?: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-line font-bangla text-[13.5px] sm:text-[14.5px] leading-relaxed">{text}</span>;
  }
  return <TypewriterMessage text={text} animate={animate} />;
}

export function FaqAiBubble() {
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentTime = useRef<number>(0);
  const responseCache = useRef<Record<string, string>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (introTimer.current) clearTimeout(introTimer.current);
    };
  }, []);

  function handleBubbleClick() {
    if (hasIntroduced) {
      setOpen(true);
      return;
    }

    // Ultra-Fast, Crisp 0.7s Greeting Overlay
    setShowIntroOverlay(true);
    introTimer.current = setTimeout(() => {
      setShowIntroOverlay(false);
      setHasIntroduced(true);
      setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
      setOpen(true);
    }, 700);
  }

  function skipIntro() {
    if (introTimer.current) clearTimeout(introTimer.current);
    setShowIntroOverlay(false);
    setHasIntroduced(true);
    setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
    setOpen(true);
  }

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || loading) return;

    // Check if we have an instant pre-cached response for suggested/common queries
    const directAns = INSTANT_ANSWERS[text] || responseCache.current[text.toLowerCase()];

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    if (directAns) {
      // Instant ultra-fast zero-latency response with smooth typewriter animation
      setLoading(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: directAns }]);
        setLoading(false);
      }, 100);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));
      const reply = data.reply || data.error || 'দুঃখিত, উত্তর দিতে পারলাম না।';
      if (data.reply) {
        responseCache.current[text.toLowerCase()] = data.reply;
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'নেটওয়ার্ক সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
  };

  return (
    <>
      {/* Super Fast, Eye-Catching Fullscreen Intro Overlay (Click to Skip instantly) */}
      <AnimatePresence>
        {showIntroOverlay && (
          <motion.div
            id="faq-ai-intro-overlay"
            onClick={skipIntro}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <motion.div
              className="relative rounded-[32px] p-7 flex flex-col items-center text-center max-w-sm w-full mx-auto bg-gradient-to-b from-white/95 to-slate-100/90 dark:from-slate-900/95 dark:to-slate-950/90 border border-white/60 dark:border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl font-bangla"
              initial={{ scale: 0.75, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: -15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Bot Avatar */}
              <div className="mb-2">
                <RobotAvatar size="lg" isWaving={true} />
              </div>

              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 font-semibold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span> হ্যালো !</span>
              </div>

              <h2 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                আমি {ASSISTANT_NAME}
              </h2>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-bangla">
                সিভিল ইঞ্জিনিয়ারিং ক্লাবের তথ্য ও সহায়তায় আছি!
              </p>

              <button
                onClick={skipIntro}
                className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95 cursor-pointer font-bangla"
              >
                কথা বলো
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perfectly Circular, Eye-Catching Round Floating Action Button */}
      <motion.button
        id="faq-ai-bubble-trigger"
        onClick={handleBubbleClick}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_12px_35px_rgba(37,99,235,0.3)] border-2 border-white dark:border-white/20 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 backdrop-blur-xl hover:shadow-[0_18px_45px_rgba(37,99,235,0.45)] transition-shadow duration-200 cursor-pointer select-none group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: open || showIntroOverlay ? 0 : 1,
          opacity: open || showIntroOverlay ? 0 : 1,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        aria-label={`Open ${ASSISTANT_NAME} assistant`}
      >
        <div className="relative flex items-center justify-center">
          <RobotAvatar size="trigger" isWaving={true} />
          {/* Online green indicator dot */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
        </div>
      </motion.button>

      {/* Beautiful, High-Performance Chat Panel with Fast Smooth Spring Animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="faq-ai-chat-panel"
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] max-w-sm sm:max-w-md h-[80vh] max-h-[620px] rounded-[28px] flex flex-col overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl font-bangla"
            style={{ transformOrigin: 'bottom right' }}
            initial={{ opacity: 0, scale: 0.85, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 25 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/70 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <RobotAvatar size="sm" isWaving={false} />
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-[16px] sm:text-[17px] text-slate-900 dark:text-white leading-normal flex items-center gap-2">
                    {ASSISTANT_NAME}
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide">
                      AI
                    </span>
                  </h3>
                  <p className="text-[13px] sm:text-[13.5px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed tracking-wide">
                    HSTU Civil Engineering Club AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Clear chat"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                    aria-label="Clear chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-slate-800 dark:text-slate-100 font-bangla">
              {messages.map((m, i) => {
                const isLatestAssistantMessage = m.role === 'assistant' && i === messages.length - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start items-start gap-2'}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0 border border-sky-300/40 mt-0.5">
                        <RobotAvatar size="sm" isWaving={false} />
                      </div>
                    )}
                    <div
                      className={
                        'max-w-[85%] px-4 py-2.5 rounded-[20px] shadow-xs ' +
                        (m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-500/20'
                          : 'bg-slate-100/90 dark:bg-slate-800/90 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100')
                      }
                    >
                      <MessageBubble text={m.text} isUser={m.role === 'user'} animate={isLatestAssistantMessage} />
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0 border border-sky-300/40">
                    <RobotAvatar size="sm" isWaving={false} />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-[18px] rounded-bl-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                </motion.div>
              )}

              {/* Quick suggestions if 1 message */}
              {messages.length === 1 && (
                <div className="pt-2 font-bangla">
                  <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                    <MessageCircleQuestion className="w-3.5 h-3.5" />
                    সাজেস্টেড প্রশ্নসমূহ:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_SUGGESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-left text-[13px] px-3.5 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-700/50 transition-all active:scale-[0.98] cursor-pointer font-bangla"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="যেকোনো প্রশ্ন লিখুন..."
                maxLength={500}
                className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-300/70 dark:border-slate-700/70 rounded-full px-4 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner font-bangla"
              />
              <motion.button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                aria-label="Send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
