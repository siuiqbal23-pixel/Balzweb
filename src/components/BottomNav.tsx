import React from 'react';
import { Gamepad2, Star, BookOpen, User } from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 'menu' | 'reviews' | 'tutorials' | 'profile' | 'admin';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  reviewCount: number;
  currentUser?: UserProfile | null;
  onOpenOrderTracker?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  onOpenNineDots?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  currentUser,
  onOpenNineDots,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090D]/95 backdrop-blur-md border-t border-slate-800/90 py-2 px-2 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-5 gap-1 items-center relative">
        
        {/* Bar 1: Menu Topup */}
        <button
          onClick={() => {
            setActiveTab('menu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-gradient-to-b from-orange-500/20 to-orange-500/5 text-orange-400 font-extrabold border border-orange-500/30 shadow-[0_0_15px_rgba(255,140,0,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <div className="relative">
            <Gamepad2 className={`w-5 h-5 ${activeTab === 'menu' ? 'scale-110' : ''} transition-transform`} />
            {activeTab === 'menu' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] sm:text-xs tracking-tight font-sans mt-0.5 font-bold">
            1. Menu
          </span>
        </button>

        {/* Bar 2: Ulasan */}
        <button
          onClick={() => {
            setActiveTab('reviews');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-400 font-extrabold border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <div className="relative">
            <Star className={`w-5 h-5 ${activeTab === 'reviews' ? 'scale-110 fill-amber-400' : ''} transition-transform`} />
            {reviewCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                {reviewCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs tracking-tight font-sans mt-0.5 font-bold">
            2. Ulasan
          </span>
        </button>

        {/* Bar Tengah: Titik 9 Floating Button */}
        <div className="relative flex justify-center items-center h-full">
          <button
            onClick={() => {
              if (onOpenNineDots) {
                onOpenNineDots();
              } else {
                setActiveTab('menu');
              }
            }}
            className="absolute -top-7 sm:-top-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 hover:from-blue-600 hover:to-indigo-400 active:scale-95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.7)] border-4 border-[#07090D] cursor-pointer transition-all z-20 group"
            title="Menu Kategori & Kalkulator"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2.2" />
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="19" cy="5" r="2.2" />
              <circle cx="5" cy="12" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="19" cy="12" r="2.2" />
              <circle cx="5" cy="19" r="2.2" />
              <circle cx="12" cy="19" r="2.2" />
              <circle cx="19" cy="19" r="2.2" />
            </svg>
          </button>
        </div>

        {/* Bar 3: Tutorial */}
        <button
          onClick={() => {
            setActiveTab('tutorials');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'tutorials'
              ? 'bg-gradient-to-b from-blue-500/20 to-blue-500/5 text-blue-400 font-extrabold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'tutorials' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] sm:text-xs tracking-tight font-sans mt-0.5 font-bold">
            3. Tutorial
          </span>
        </button>

        {/* Bar 4: Profile / Akaun */}
        <button
          onClick={() => {
            setActiveTab('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 text-cyan-400 font-extrabold border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-cyan-400/60"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
              </div>
            ) : (
              <User className={`w-5 h-5 ${activeTab === 'profile' ? 'scale-110' : ''} transition-transform`} />
            )}
          </div>
          <span className="text-[10px] sm:text-xs tracking-tight font-sans mt-0.5 font-bold">
            4. Profile
          </span>
        </button>

      </div>
    </nav>
  );
};

