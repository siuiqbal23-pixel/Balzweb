import React, { useState } from 'react';
import { Search, Flame, Shield, ShieldCheck, Zap, Menu, X, User, ShoppingBag, Lock, Mail, ShoppingCart, MessageSquare, Headphones } from 'lucide-react';
import { GameCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: GameCategory;
  setActiveCategory: (cat: GameCategory) => void;
  onOpenOrderTracker: () => void;
  onOpenAdmin: () => void;
  onSelectGameClick: () => void;
  onOpenGmail?: () => void;
  onlineCount?: number;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenLiveChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onOpenOrderTracker,
  onOpenAdmin,
  onSelectGameClick,
  onOpenGmail,
  onlineCount = 1,
  cartCount = 0,
  onOpenCart,
  onOpenLiveChat,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090B10]/90 border-b border-orange-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo TopupBalz & Online Count */}
          <div 
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-0.5 shadow-[0_0_15px_rgba(255,140,0,0.6)] group-hover:shadow-[0_0_25px_rgba(255,140,0,0.9)] transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-[#0D1117] rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-base sm:text-2xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(255,140,0,0.3)]">
                  TOPUP<span className="text-orange-400">BALZ</span>
                </span>
                <span className="text-[9px] sm:text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  MY
                </span>

                {/* Real-time Active Online Users Badge */}
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-black text-emerald-300 font-mono tracking-tight">
                    {onlineCount} ONLINE
                  </span>
                </div>
              </div>

              <p className="text-[9px] sm:text-[10px] text-slate-300 font-bold tracking-wide uppercase truncate">
                Marketplace Topup #1 Malaysia
              </p>
            </div>
          </div>

          {/* Nav Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Shopping Cart Button */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 text-orange-400 border border-orange-500/40 hover:border-orange-400 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                title="Lihat Troli Pembelian"
              >
                <ShoppingCart className="w-4 h-4 text-orange-400" />
                <span>Troli</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 font-mono font-black text-[10px]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Live Chat 24/7 Button */}
            {onOpenLiveChat && (
              <button
                onClick={onOpenLiveChat}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Chat Live dengan Admin 24 Jam"
              >
                <Headphones className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Chat Admin 24/7</span>
              </button>
            )}

            <button
              onClick={onOpenOrderTracker}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
              <span>Semak Pesanan</span>
            </button>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center border border-slate-950">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {onOpenLiveChat && (
              <button
                onClick={onOpenLiveChat}
                className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 cursor-pointer"
                title="Live Chat Admin"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-orange-500/40"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 py-4 space-y-2 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 text-center"
              >
                🎮 Semua Game
              </button>
              <button
                onClick={() => {
                  setActiveCategory('popular');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-xs font-semibold bg-orange-500/10 border border-orange-500/30 text-orange-400 text-center"
              >
                🔥 Game Popular
              </button>
              <button
                onClick={() => {
                  setActiveCategory('promo');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 text-center"
              >
                ⚡ Topup Murah
              </button>
              <button
                onClick={() => {
                  onOpenOrderTracker();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center"
              >
                🔍 Semak Pesanan
              </button>
              {onOpenGmail && (
                <button
                  onClick={() => {
                    onOpenGmail();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 p-2.5 rounded-xl text-xs font-extrabold bg-red-500/15 border border-red-500/40 text-red-400 text-center flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>Pusat Gmail API</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
