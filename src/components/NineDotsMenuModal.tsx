import React from 'react';
import { X, ShoppingCart, RotateCcw, Star, BookOpen, Calculator } from 'lucide-react';
import { NavTab } from './BottomNav';

interface NineDotsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavTab) => void;
  onOpenOrderTracker: () => void;
  onOpenCalculator: () => void;
}

export const NineDotsMenuModal: React.FC<NineDotsMenuModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenOrderTracker,
  onOpenCalculator,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'store',
      label: 'Kedai Akaun / Topup',
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/10 border-blue-500/20',
      action: () => {
        setActiveTab('menu');
        onClose();
        const el = document.getElementById('game-categories');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'tracker',
      label: 'Semak Transaksi',
      icon: RotateCcw,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-600/10 border-indigo-500/20',
      action: () => {
        onClose();
        onOpenOrderTracker();
      },
    },
    {
      id: 'reviews',
      label: 'Semua Ulasan',
      icon: Star,
      color: 'text-amber-400',
      bgColor: 'bg-amber-600/10 border-amber-500/20',
      action: () => {
        setActiveTab('reviews');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'services',
      label: 'Senarai Perkhidmatan',
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600/10 border-emerald-500/20',
      action: () => {
        setActiveTab('tutorials');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'calculator',
      label: 'Kalkulator',
      icon: Calculator,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/10 border-orange-500/20',
      action: () => {
        onClose();
        onOpenCalculator();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#030611]/85 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Card Box matching the screenshot deep blue theme */}
      <div className="relative w-full max-w-lg bg-[#060a1d] border-t sm:border border-blue-600/30 rounded-t-3xl sm:rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.5)] p-5 sm:p-7 overflow-hidden space-y-6 max-h-[85vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-blue-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-widest uppercase">MENU</h2>
              <p className="text-[11px] text-blue-300/70 font-medium">TopupBalz Navigation & Utilities</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Columns Grid Menu Tiles (Matching User Screenshot Layout) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl bg-[#0b1330] hover:bg-[#121d45] border border-blue-900/60 hover:border-blue-500/50 transition-all duration-200 group cursor-pointer shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 aspect-square`}
              >
                <div className={`p-3 rounded-2xl mb-2.5 transition-transform group-hover:scale-110 ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.color}`} />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-slate-200 group-hover:text-white leading-tight line-clamp-2">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Footer hint */}
        <div className="pt-2 border-t border-blue-950/80 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            ⚡ TopupBalz Quick Actions & Gaming Utilities
          </p>
        </div>

      </div>
    </div>
  );
};
