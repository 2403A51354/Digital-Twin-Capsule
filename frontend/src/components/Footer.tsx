import React from 'react';
import { Hourglass, Shield, Heart, Github, Sparkles, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#05070D] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white">
                <Hourglass className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">ChronoVault</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The premier digital time capsule platform. Store letters, multimedia, and memories locked against the flow of time.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Server-Enforced Temporal Locks</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-purple-300 transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-purple-300 transition-colors">Media Vaults</a></li>
              <li><a href="#simulator" className="hover:text-purple-300 transition-colors">Countdown Engine</a></li>
              <li><a href="#security" className="hover:text-purple-300 transition-colors">Privacy Architecture</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Capsule Types</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-purple-300 cursor-default transition-colors">Personal Reflections & Diaries</li>
              <li className="hover:text-purple-300 cursor-default transition-colors">Family Milestones & Anniversaries</li>
              <li className="hover:text-purple-300 cursor-default transition-colors">Graduation & Education Goals</li>
              <li className="hover:text-purple-300 cursor-default transition-colors">Wanderlust & Travel Odysseys</li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Security & Storage</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Files are safeguarded in encrypted, private Supabase Storage buckets. Row-Level Security ensures only the capsule owner can access decrypted contents after the lock expires.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-purple-300">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>PostgreSQL RLS Protected</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} ChronoVault Digital Time Capsule. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Built with React, Express & Supabase</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" /> Future Proof
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
