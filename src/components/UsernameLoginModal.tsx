import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, Sparkles, LogIn, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

interface UsernameLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  titleMessage?: string;
}

export const UsernameLoginModal: React.FC<UsernameLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  titleMessage = 'Log Masuk Username TopupBalz',
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const clean = usernameInput.trim().replace(/^@+/, '');
  const isBalzz = clean.toLowerCase() === 'balzz';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clean) {
      setErrorMessage('Sila letak nama username anda dahulu!');
      return;
    }

    if (isBalzz && !adminCodeInput.trim()) {
      setErrorMessage('Sila masukkan Kod Rahsia Admin untuk username Balzz (030926)!');
      return;
    }

    setLoading(true);
    try {
      const storedUserJson = localStorage.getItem('topupbalz_current_user');
      let existingUserId = '';
      if (storedUserJson) {
        try {
          const u = JSON.parse(storedUserJson);
          existingUserId = u.id || '';
        } catch (e) {}
      }

      const res = await fetch('/api/auth/username-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: clean,
          existingUserId,
          adminCode: isBalzz ? adminCodeInput.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Tak boleh, nama ini sudah digunakan!');
        setLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem('topupbalz_current_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage('Ralat sambungan ke pelayan. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0D1117] border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(255,140,0,0.2)] overflow-hidden">
        
        {/* Glow Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-orange-500 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-0.5 mx-auto shadow-lg">
            <div className="w-full h-full bg-[#0D1117] rounded-[14px] flex items-center justify-center text-orange-400">
              <UserCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Akaun Username</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">{titleMessage}</h3>
          <p className="text-xs text-slate-300">
            Sila tetapkan username unik anda. Username ini akan digunakan untuk identiti tempahan & perbualan Live Chat dengan Admin.
          </p>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Username Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Username Anda:
            </label>

            {/* Input with Auto Prefix @ */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-orange-400 font-mono font-black text-base select-none">
                @
              </span>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value.replace(/\s+/g, ''));
                  setErrorMessage(null);
                }}
                placeholder="masukkan_username_anda"
                className="w-full bg-[#121824] border border-slate-700 focus:border-orange-500 rounded-2xl pl-8 pr-4 py-3.5 text-white font-mono font-bold text-sm focus:outline-none transition-all placeholder:text-slate-600 shadow-inner"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Contoh: Jika anda taip <span className="text-orange-400 font-bold">balz</span>, username anda menjadi <span className="text-orange-400 font-bold">@balz</span>.
            </p>
          </div>

          {/* Special Admin Password Code input for Balzz */}
          {isBalzz && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs">
                <span>🔐 Akses Pentadbir Admin Balzz</span>
              </div>
              <label className="text-xs font-bold text-slate-300 block">
                Kod Rahsia Admin (Balzz):
              </label>
              <input
                type="password"
                required
                value={adminCodeInput}
                onChange={(e) => {
                  setAdminCodeInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Masukkan 6-digit kod admin (030926)"
                className="w-full bg-[#121824] border border-rose-500/60 focus:border-rose-400 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none transition-all placeholder:text-slate-600"
              />
              <p className="text-[10px] text-rose-300 font-mono">
                Sila masukkan kod pengesahan 030926 untuk log masuk sebagai Admin Balzz.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !usernameInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,140,0,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono pt-1">
          🔒 Username dilindungi. Setiap pengguna mempunyai username unik.
        </p>

      </div>
    </div>
  );
};
