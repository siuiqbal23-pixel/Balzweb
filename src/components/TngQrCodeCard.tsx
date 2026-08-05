import React from 'react';

interface TngQrCodeCardProps {
  accountName?: string;
  customQrImageUrl?: string;
  className?: string;
}

export const TngQrCodeCard: React.FC<TngQrCodeCardProps> = ({
  accountName = 'IQBALZ LTD',
  customQrImageUrl,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-sm mx-auto bg-gradient-to-b from-[#EEF4FF] to-[#E2EBFF] rounded-3xl p-5 sm:p-6 shadow-2xl border border-blue-200 text-center font-sans ${className}`}
    >
      {/* Top Touch 'n Go Header */}
      <div className="flex flex-col items-center justify-center space-y-1 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-fuchsia-800 p-2 shadow-md flex flex-col items-center justify-center border border-white/40">
          <span className="text-[11px] font-black text-white leading-tight uppercase tracking-tighter">
            Touch
          </span>
          <span className="text-[10px] font-black text-amber-300 leading-none italic">
            'n Go
          </span>
          <span className="text-[8px] font-bold text-white/90 leading-tight">
            eWallet
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          Touch 'n Go eWallet
        </h3>
      </div>

      {/* Blue Framed Container */}
      <div className="bg-white rounded-2xl border-2 border-blue-500/80 p-4 shadow-lg space-y-3">
        {/* Account Name */}
        <div className="px-2">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase break-words leading-snug">
            {accountName}
          </h2>
        </div>

        {/* Pink DuitNow QR Box */}
        <div className="bg-[#E61C5B] p-3 rounded-2xl shadow-inner text-white space-y-2">
          {/* QR Code Canvas / Image Wrapper */}
          <div className="bg-white p-3 rounded-xl shadow-md flex items-center justify-center">
            {customQrImageUrl ? (
              <img
                src={customQrImageUrl}
                alt="Touch n Go DuitNow QR Code"
                referrerPolicy="no-referrer"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              /* High-fidelity Vector DuitNow QR Graphic matching official Malaysia National QR */
              <svg
                viewBox="0 0 200 200"
                className="w-48 h-48 sm:w-56 sm:h-56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="200" height="200" fill="white" />

                {/* Top-Left Finder Pattern */}
                <rect x="10" y="10" width="50" height="50" rx="4" fill="#E61C5B" />
                <rect x="18" y="18" width="34" height="34" rx="2" fill="white" />
                <rect x="26" y="26" width="18" height="18" rx="1" fill="#E61C5B" />

                {/* Top-Right Finder Pattern */}
                <rect x="140" y="10" width="50" height="50" rx="4" fill="#E61C5B" />
                <rect x="148" y="18" width="34" height="34" rx="2" fill="white" />
                <rect x="156" y="26" width="18" height="18" rx="1" fill="#E61C5B" />

                {/* Bottom-Left Finder Pattern */}
                <rect x="10" y="140" width="50" height="50" rx="4" fill="#E61C5B" />
                <rect x="18" y="148" width="34" height="34" rx="2" fill="white" />
                <rect x="26" y="156" width="18" height="18" rx="1" fill="#E61C5B" />

                {/* DuitNow Center Logo Badge */}
                <rect x="82" y="82" width="36" height="36" rx="6" fill="#E61C5B" />
                <circle cx="100" cy="100" r="10" fill="white" />
                <path d="M96 96L104 104M104 96L96 104" stroke="#E61C5B" strokeWidth="3" strokeLinecap="round" />

                {/* QR Data Modules Matrix (#E61C5B) */}
                <path
                  d="
                  M68 12h6v6h-6z M80 12h8v6h-8z M94 12h6v6h-6z M106 12h8v6h-8z M120 12h6v6h-6z
                  M68 24h12v6h-12z M94 24h10v6h-10z M118 24h8v6h-8z
                  M68 36h6v6h-6z M82 36h6v6h-6z M94 36h12v6h-12z M120 36h6v6h-6z
                  M68 48h10v6h-10z M84 48h6v6h-6z M110 48h14v6h-14z

                  M12 68h6v6h-6z M24 68h12v6h-12z M42 68h8v6h-8z M68 68h6v6h-6z M80 68h12v6h-12z M100 68h6v6h-6z M112 68h12v6h-12z M134 68h8v6h-8z M150 68h10v6h-10z M168 68h6v6h-6z M180 68h8v6h-8z
                  M12 80h10v6h-10z M30 80h6v6h-6z M44 80h10v6h-10z M68 80h10v6h-10z M124 80h8v6h-8z M140 80h12v6h-12z M160 80h6v6h-6z M174 80h14v6h-14z
                  M12 92h6v6h-6z M26 92h8v6h-8z M40 92h6v6h-6z M68 92h8v6h-8z M126 92h10v6h-10z M144 92h6v6h-6z M158 92h10v6h-10z M176 92h12v6h-12z
                  M12 104h12v6h-12z M32 104h6v6h-6z M44 104h10v6h-10z M68 104h10v6h-10z M124 104h8v6h-8z M138 104h12v6h-12z M158 104h6v6h-6z M172 104h14v6h-14z
                  M12 116h8v6h-8z M28 116h10v6h-10z M44 116h6v6h-6z M68 116h6v6h-6z M82 116h10v6h-10z M100 116h6v6h-6z M112 116h12v6h-12z M134 116h8v6h-8z M150 116h10v6h-10z M168 116h6v6h-6z M180 116h8v6h-8z

                  M68 140h6v6h-6z M80 140h8v6h-8z M94 140h6v6h-6z M106 140h8v6h-8z M120 140h6v6h-6z M134 140h8v6h-8z M150 140h10v6h-10z M168 140h6v6h-6z M180 140h8v6h-8z
                  M68 152h12v6h-12z M94 152h10v6h-10z M118 152h8v6h-8z M138 152h12v6h-12z M160 152h6v6h-6z M174 152h14v6h-14z
                  M68 164h6v6h-6z M82 164h6v6h-6z M94 164h12v6h-12z M120 164h6v6h-6z M134 164h8v6h-8z M150 164h10v6h-10z M168 164h6v6h-6z M180 164h8v6h-8z
                  M68 176h10v6h-10z M84 176h6v6h-6z M110 176h14v6h-14z M138 176h12v6h-12z M158 176h6v6h-6z M172 176h14v6h-14z
                  "
                  fill="#E61C5B"
                />
              </svg>
            )}
          </div>

          {/* DuitNow Label */}
          <div className="pt-1 text-center">
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-white drop-shadow-sm">
              MALAYSIA NATIONAL QR
            </span>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-3 px-2 leading-tight">
        Imbas dengan aplikasi perbankan atau eWallet anda untuk pindahan atau bayaran.
      </p>
    </div>
  );
};
