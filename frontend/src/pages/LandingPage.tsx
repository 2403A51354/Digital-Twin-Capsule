import React, { useState, useEffect } from 'react';
import {
  Hourglass,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Clock,
  Unlock,
  CheckCircle,
  Eye,
  KeyRound,
  Heart,
  Globe,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  // Live Countdown state for Hero preview
  const [heroCountdown, setHeroCountdown] = useState({
    days: 412,
    hours: 8,
    minutes: 34,
    seconds: 19,
  });

  // Simulator date selection
  const [simulatorYears, setSimulatorYears] = useState(1);
  const [simDays, setSimDays] = useState(365);
  const [simHours, setSimHours] = useState(0);
  const [simMins, setSimMins] = useState(0);
  const [simSecs, setSimSecs] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulator calculations
  useEffect(() => {
    const target = new Date();
    target.setFullYear(target.getFullYear() + simulatorYears);
    const updateSim = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setSimDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setSimHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
      setSimMins(Math.floor((diff / (1000 * 60)) % 60));
      setSimSecs(Math.floor((diff / 1000) % 60));
    };
    updateSim();
    const simInterval = setInterval(updateSim, 1000);
    return () => clearInterval(simInterval);
  }, [simulatorYears]);

  return (
    <div className="relative overflow-hidden">
      
      {/* Background ambient light orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-500/30 shadow-inner shadow-purple-900/40">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Cryptographic Time Preservation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              Seal memories <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">today</span>, unlock them <span className="underline decoration-purple-500/50 decoration-wavy underline-offset-8">tomorrow</span>.
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Capture poignant letters, high-resolution photographs, videos, and private documents. Lock them into tamper-proof digital capsules until your chosen moment arrives.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Create Your Time Capsule</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="#simulator"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-base text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Try Vault Simulator</span>
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict Server-Side Temporal Enforcing</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Zero Premature Decryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Timezone Aware</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Live Capsule Mockup */}
          <div className="lg:col-span-5 relative">
            {/* Ambient glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>

            <div className="relative bg-[#0D1322] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              
              {/* Capsule Status Tag */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
                    STATUS: LOCKED
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Category: Personal
                </span>
              </div>

              {/* Capsule Name */}
              <div className="mt-5 space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Letters to My 30-Year-Old Self</span>
                  <Lock className="w-4 h-4 text-purple-400" />
                </h3>
                <p className="text-xs text-gray-400">
                  Target Opening: <span className="text-purple-300 font-semibold">November 16, 2028 &bull; 00:00 UTC</span>
                </p>
              </div>

              {/* Dynamic Countdown Grid */}
              <div className="my-6">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-2">
                  Temporal Lock Countdown
                </span>
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-3">
                    <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      {heroCountdown.days}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium uppercase tracking-wider">Days</span>
                  </div>
                  <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-3">
                    <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      {heroCountdown.hours}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium uppercase tracking-wider">Hours</span>
                  </div>
                  <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-3">
                    <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      {heroCountdown.minutes}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium uppercase tracking-wider">Mins</span>
                  </div>
                  <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-3">
                    <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      {heroCountdown.seconds}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium uppercase tracking-wider">Secs</span>
                  </div>
                </div>
              </div>

              {/* Encrypted Vault Contents Indicator */}
              <div className="bg-[#141B2D]/60 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-purple-400" /> 3 Sealed Artifacts Inside
                  </span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-300">
                    <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">letter.pdf</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-300">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">memories.jpg</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-300">
                    <Video className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">video.mp4</span>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-4 pt-3 text-center">
                <span className="text-[11px] text-gray-400 italic">
                  Content remains completely inaccessible until scheduled opening timestamp.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. HOW IT WORKS SECTION */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 bg-[#050811] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold">
              The Journey of a Memory
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How ChronoVault Works
            </h2>
            <p className="text-base sm:text-lg text-gray-400">
              Three simple steps guarantee that your thoughts and moments travel securely through time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="glass-card rounded-3xl p-8 relative flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl mb-6 shadow-lg shadow-purple-900/30">
                  01
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Compose & Curate</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Write heartfelt letters, record video messages, and upload treasured photos, audio recordings, or PDF journals. Categorize your capsule for personal reflection, family, or travel.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-purple-300">
                <FileText className="w-4 h-4" /> Letters, Images, Videos & Docs
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-3xl p-8 relative flex flex-col justify-between border-purple-500/30 bg-purple-950/20">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white">
                Cryptographic Lock
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl mb-6 shadow-lg shadow-indigo-900/30">
                  02
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Set Opening Date & Seal</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Select your exact future unlock date, time, and timezone. Once sealed, PostgreSQL Row-Level Security and strict backend middleware prevent anyone—even you—from reading it early.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-indigo-300">
                <Lock className="w-4 h-4" /> Server-Verified Temporal Defense
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-3xl p-8 relative flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xl mb-6 shadow-lg shadow-cyan-900/30">
                  03
                </div>
                <h3 className="text-xl font-bold text-white mb-3">The Grand Unveiling</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When the scheduled timestamp arrives, the vault unlocks automatically. Revisit your past thoughts, celebrate your growth, and download private media with time-limited signed links.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-300">
                <Unlock className="w-4 h-4" /> Confetti Celebration & Full Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURES GRID SECTION */}
      {/* ========================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
            Built Without Compromise
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Features Crafted for Immortality
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Engineered with modern web standards and security-first architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Tamper-Proof Temporal Locks</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We never trust client devices. The backend server verifies the exact UTC timestamp before releasing letters or decrypting file links.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Full Multimedia Storage</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Store high-res images, 4K video clips, audio voice notes, and PDF journals in private Supabase Storage buckets with strict MIME validation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Precision Live Countdowns</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Real-time countdown clocks display remaining days, hours, minutes, and seconds until the moment your memory is set free.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Rich Categories & Tags</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Organize capsules across Personal, Friends, Family, Education, Love, and Travel themes with personalized badges and visual themes.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">PostgreSQL Row-Level Security</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each user capsule is isolated in PostgreSQL. No other user—nor external requests—can query or read your sealed capsule content.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Celebratory Reveal Experience</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the time arrives, open your capsule with animated unboxing celebrations, sound effects, and celebratory confetti effects.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE VAULT SIMULATOR */}
      {/* ========================================================= */}
      <section id="simulator" className="py-24 bg-[#050811] border-y border-white/5 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold">
              Try It Live
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Interactive Vault Simulator
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Select when you'd like your future capsule to unlock and watch the temporal engine calculate your countdown in real time.
            </p>
          </div>

          {/* Simulator Box */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-purple-500/20 shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { label: '6 Months', years: 0.5 },
                { label: '1 Year', years: 1 },
                { label: '2 Years', years: 2 },
                { label: '5 Years', years: 5 },
                { label: '10 Years', years: 10 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSimulatorYears(opt.years)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    simulatorYears === opt.years
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Countdown Display */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center max-w-2xl mx-auto mb-8">
              <div className="bg-[#090D18] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-inner">
                <span className="block text-3xl sm:text-5xl font-extrabold font-mono text-purple-300">
                  {simDays}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                  Days
                </span>
              </div>
              <div className="bg-[#090D18] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-inner">
                <span className="block text-3xl sm:text-5xl font-extrabold font-mono text-purple-300">
                  {simHours}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                  Hours
                </span>
              </div>
              <div className="bg-[#090D18] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-inner">
                <span className="block text-3xl sm:text-5xl font-extrabold font-mono text-purple-300">
                  {simMins}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                  Minutes
                </span>
              </div>
              <div className="bg-[#090D18] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-inner">
                <span className="block text-3xl sm:text-5xl font-extrabold font-mono text-purple-300">
                  {simSecs}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1 block">
                  Seconds
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-xl shadow-purple-600/30 transition-all"
              >
                <span>Lock a Real Capsule For This Date</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SECURITY & ARCHITECTURE */}
      {/* ========================================================= */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
              Uncompromising Security
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Your Memories Are Safe With Us
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              A digital time capsule is only as good as its lock. Unlike basic apps that simply hide data with CSS or JavaScript countdowns, ChronoVault enforces temporal integrity at the database and server API boundary.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Row Level Security (RLS)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PostgreSQL database policies guarantee users can only query their own capsules and records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 mt-1">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Time-Limited Signed URLs</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Storage files are strictly private. The server generates ephemeral 60-second download tokens only after the unlock date has passed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Server-Verified UTC Timestamps</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Adjusting your device's local clock will never open a capsule early; all validations check atomic server time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#0A0E1A] border border-white/10 rounded-3xl p-6 font-mono text-xs text-purple-200 space-y-3 shadow-2xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-gray-400">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-[11px] ml-2">server-security-enforcer.ts</span>
              </div>
              <p className="text-gray-400">// Server-side temporal gatekeeper</p>
              <p className="text-indigo-400">
                const <span className="text-white">nowUTC</span> = new Date().toISOString();
              </p>
              <p className="text-purple-300">
                if (<span className="text-white">capsule.opening_date</span> &gt; nowUTC) &#123;
              </p>
              <p className="pl-4 text-amber-300">
                // Sanitize response: redact message and purge media URLs
              </p>
              <p className="pl-4 text-emerald-400">
                return res.status(200).json(&#123; ...metadata, message: '[LOCKED UNTIL ARRIVAL]' &#125;);
              </p>
              <p className="text-purple-300">&#125;</p>
              <p className="text-gray-400">// Capsule eligible for full decryption</p>
              <p className="text-cyan-300">return res.status(200).json(unlockedCapsulePayload);</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. CALL TO ACTION BANNER */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-purple-950/60 border border-purple-500/30 p-8 sm:p-16 text-center shadow-2xl shadow-purple-950/40">
          
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to send a message to the future?
            </h2>
            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed">
              Start preserving your memories right now. Create your first time capsule in less than 2 minutes.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-xl shadow-purple-600/40 transition-all inline-flex items-center gap-2"
              >
                <span>Get Started For Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
