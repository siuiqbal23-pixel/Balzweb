import React from 'react';
import { Flame, ShieldCheck, Zap, MessageCircle, QrCode, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenOrderTracker: () => void;
  ownerWhatsApp: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenOrderTracker,
  ownerWhatsApp,
}) => {
  const cleanPhone = ownerWhatsApp.replace(/\D/g, '');

  return (
    <footer className="bg-[#07090D] border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                <div className="w-full h-full bg-[#0D1117] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight font-mono">
                TOPUP<span className="text-orange-400">BALZ</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Platform Marketplace Topup Game Premium #1 di Malaysia. Paling pantas, murah, dan selamat dengan sistem kiraan automatik serta integrasiTouch 'n Go eWallet QR.
            </p>

            <div className="flex items-center gap-2 text-slate-300 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Proses Otomatik 24 Jam Non-Stop</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
              Pautan Pantas
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-orange-400 transition-colors"
                >
                  Laman Utama
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderTracker}
                  className="hover:text-orange-400 transition-colors"
                >
                  Semak Status Pesanan
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors"
                >
                  Customer Support (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
              Rangkaian Pembayaran Rasmi
            </h4>
            <p className="text-slate-400">
              Sokongan bayaran serba lengkap menggunakan Touch 'n Go eWallet QR, DuitNow QR, dan FPX Online Banking.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 font-bold font-mono">
                Touch 'n Go eWallet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-pink-400 font-bold font-mono">
                DuitNow QR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-bold font-mono">
                FPX Banking
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} TopupBalz Gaming Marketplace. Hak Cipta Terelihara.</p>
          <div className="flex items-center gap-1">
            <span>Direka dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk Komuniti Gaming Malaysia</span>
          </div>
        </div>

      </div>

      {/* Floating WhatsApp Quick Contact Button (Elevated above Bottom Nav) */}
      <a
        href={`https://wa.me/${cleanPhone.length ? cleanPhone : '601112345678'}?text=Assalamualaikum%20admin%20TopupBalz,%20saya%20perlukan%20bantuan.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-30 p-2.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:shadow-[0_0_40px_rgba(37,211,102,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer border-2 border-white/80"
        title="Hubungi Admin via WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </div>
        <span className="font-extrabold text-slate-950 text-[11px] sm:text-xs tracking-tight hidden xs:inline sm:inline">
          WhatsApp Admin
        </span>
      </a>

    </footer>
  );
};
