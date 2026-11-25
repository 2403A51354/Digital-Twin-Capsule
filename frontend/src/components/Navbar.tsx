import React, { useState } from 'react';
import { Hourglass, Lock, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigateHome }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#070A12]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                ChronoVault
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-purple-400 font-semibold -mt-1">
                Digital Time Capsule
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-purple-300 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-purple-300 transition-colors">
              Features
            </a>
            <a href="#simulator" className="hover:text-purple-300 transition-colors">
              Vault Simulator
            </a>
            <a href="#security" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden shadow-lg shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700"></div>
              <span className="relative flex items-center gap-2">
                <span>Create Capsule</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-base font-medium text-gray-300">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-purple-300 py-1"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-purple-300 py-1"
            >
              Features
            </a>
            <a 
              href="#simulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-purple-300 py-1"
            >
              Vault Simulator
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-purple-300 py-1 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security
            </a>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('register');
              }}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
