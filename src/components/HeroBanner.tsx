import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, QrCode, MessageCircle, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { PromoBanner, Game } from '../types';

interface HeroBannerProps {
  banners: PromoBanner[];
  onSelectGame: (gameSlug: string) => void;
  onTopupNowClick: () => void;
  ownerWhatsApp?: string;
  onOpenAdmin?: () => void;
  onlineCount?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  onSelectGame,
  onTopupNowClick,
  ownerWhatsApp = '601112345678',
  onOpenAdmin,
  onlineCount = 1,
}) => {
  const cleanPhone = ownerWhatsApp.replace(/\D/g, '') || '601112345678';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeBanners = banners.filter((b) => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length, isHovered]);

  return (
    <div className="relative overflow-hidden bg-[#090B10] pt-6 pb-8 border-b border-slate-800/80">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            {/* Prominent Promo Announcement Box */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 p-3 sm:p-3.5 rounded-2xl shadow-[0_0_25px_rgba(255,140,0,0.4)] flex flex-col sm:flex-row items-center justify-between gap-2.5 border border-amber-300/50">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <Zap className="w-5 h-5 text-slate-950 fill-current animate-bounce shrink-0" />
                <span className="font-extrabold text-xs sm:text-sm tracking-tight leading-snug">
                  TOPUPBALZ PROMO: Semua Harga Topup Dijamin Murah & Pantas! Bayaran Mudah via Touch 'n Go eWallet QR
                </span>
              </div>
              <div className="bg-slate-950 text-orange-400 text-xs px-3 py-1.5 rounded-xl font-black uppercase tracking-wider shadow-md shrink-0 border border-orange-500/40 flex items-center gap-1 select-none">
                ⚡ INSTANT 24/7
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold shadow-[0_0_15px_rgba(255,140,0,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Platfom Topup #1 Paling Murah di Malaysia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Topup Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 drop-shadow-[0_0_20px_rgba(255,140,0,0.4)]">Pantas & Murah</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Topup Diamond, UC, Credits dan Item Game Kegemaran Anda dalam beberapa saat sahaja. Proses automatik 24/7 dengan bayaran paling mudah menggunakan <strong className="text-orange-300 font-semibold">Touch 'n Go eWallet QR</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onTopupNowClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_30px_rgba(255,140,0,0.6)] hover:shadow-[0_0_45px_rgba(255,140,0,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Topup Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm hover:border-orange-500/50 hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Bantuan Customer Service</span>
              </a>
            </div>

            {/* Micro Advantages Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
                <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Proses Pantas</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Masa Topup 10-30s</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Selamat</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Topup Rasmi & Legal</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Touch 'n Go QR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Bayaran Tanpa Cask</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{onlineCount} Pengguna Online</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Sesi Aktif Real-Time</p>
              </div>
            </div>

          </div>

          {/* Right Slider Column */}
          <div
            className="lg:col-span-6 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-orange-500/30 via-slate-800/50 to-orange-500/10 shadow-[0_0_35px_rgba(255,140,0,0.25)] overflow-hidden">
              <div className="relative rounded-[22px] bg-[#0D1117] overflow-hidden aspect-[16/9] group">
                
                {/* Banner Slide Content */}
                {activeBanners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/60 to-transparent p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-500 text-slate-950 uppercase tracking-wider">
                          {banner.badge}
                        </span>
                        {banner.discountText && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/90 text-amber-300 border border-amber-500/30">
                            {banner.discountText}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
                        {banner.title}
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 mt-1">
                        {banner.subtitle}
                      </p>

                      {banner.gameSlug && (
                        <div className="mt-3">
                          <button
                            onClick={() => onSelectGame(banner.gameSlug!)}
                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase transition-all shadow-[0_0_15px_rgba(255,140,0,0.5)] cursor-pointer"
                          >
                            Tebus Promo Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Slider Navigation Arrows */}
                {activeBanners.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentSlide(
                          (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700 text-white flex items-center justify-center hover:bg-orange-500 hover:text-slate-950 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700 text-white flex items-center justify-center hover:bg-orange-500 hover:text-slate-950 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5">
                      {activeBanners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentSlide ? 'w-6 bg-orange-500' : 'w-2 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
