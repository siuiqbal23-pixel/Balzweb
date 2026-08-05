import React, { useState } from 'react';
import {
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Zap,
  Edit2,
  Save,
  Globe,
  Mail,
} from 'lucide-react';
import { UserProfile, Order } from '../types';

interface UserProfileViewProps {
  currentUser: UserProfile | null;
  orders: Order[];
  onLoginSuccess: (user: UserProfile) => void;
  onLogOut: () => void;
  onUpdatePhone: (phone: string) => Promise<void>;
  onVerifyEmail?: (email: string, code: string) => Promise<void>;
  onOpenGmailModal?: (email?: string) => void;
  onOpenAdmin?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  orders,
  onLoginSuccess,
  onLogOut,
  onUpdatePhone,
  onVerifyEmail,
  onOpenGmailModal,
  onOpenAdmin,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(currentUser?.phoneNumber || '');
  const [copiedId, setCopiedId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanInput = usernameInput.trim().replace(/^@+/, '');
  const isBalzzLogin = cleanInput.toLowerCase() === 'balzz';

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    if (!cleanInput) {
      setUsernameError('Sila masukkan nama username anda!');
      return;
    }

    if (isBalzzLogin && !adminCodeInput.trim()) {
      setUsernameError('Sila masukkan Kod Rahsia Admin untuk username Balzz (030926)!');
      return;
    }

    setIsSubmitting(true);
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
          username: cleanInput,
          existingUserId,
          adminCode: isBalzzLogin ? adminCodeInput.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setUsernameError(data.error || 'Tak boleh, nama ini sudah digunakan!');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        localStorage.setItem('topupbalz_current_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setUsernameError('Ralat sambungan ke pelayan. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !otpInput) return;
    setIsSubmitting(true);
    setOtpError(false);

    if (onVerifyEmail) {
      await onVerifyEmail(currentUser.email, otpInput);
    } else {
      // Fallback API call
      try {
        await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, otpCode: otpInput }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setIsSubmitting(false);
    setOtpSuccess(true);
  };

  // Filter user's specific orders
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerPhone === currentUser.phoneNumber ||
          o.userId === currentUser.id ||
          o.notes?.includes(currentUser.email)
      )
    : [];

  const handleSavePhone = async () => {
    if (!phoneInput) return;
    setIsSubmitting(true);
    await onUpdatePhone(phoneInput);
    setIsSubmitting(false);
    setEditingPhone(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* If NOT logged in */}
      {!currentUser ? (
        <div className="bg-[#0D1117] border border-orange-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-8 shadow-[0_0_50px_rgba(255,140,0,0.15)] relative overflow-hidden">
          {/* Subtle Glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
            <User className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Profil TopupBalz</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Log Masuk Username Topup</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Sila masukkan username anda untuk log masuk. Simbol <strong className="text-orange-400">@</strong> sudah automatik disediakan untuk anda.
            </p>
          </div>

          {/* Username Login Form */}
          <div className="max-w-sm mx-auto space-y-4 text-left">
            {usernameError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                <span className="text-lg">🛑</span>
                <span>{usernameError}</span>
              </div>
            )}

            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Username Anda:
                </label>
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
                      setUsernameError(null);
                    }}
                    placeholder="nama_username"
                    className="w-full bg-[#121824] border border-slate-700 focus:border-orange-500 rounded-2xl pl-8 pr-4 py-3 text-white font-mono font-bold text-sm focus:outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Langkah: Contoh letak <strong className="text-orange-400">balz</strong>, automatik menjadi <strong className="text-orange-400">@balz</strong>.
                </p>
              </div>

              {/* Special Admin Password Code input for Balzz */}
              {isBalzzLogin && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 animate-fadeIn text-left">
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
                      setUsernameError(null);
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
                disabled={isSubmitting || !usernameInput.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,140,0,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log Masuk Sekarang</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-500 text-center">
              🔒 Pengesahan selamat melalui sistem akaun username TopupBalz.
            </p>
          </div>
        </div>
      ) : (
        /* LOGGED IN USER PROFILE */
        <div className="space-y-6">

          {/* Bar Admin Access Section - Khusus jika login sebagai Balzz */}
          {currentUser && (currentUser.name.toLowerCase().includes('balzz') || currentUser.email.toLowerCase().startsWith('balzz')) && onOpenAdmin && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/90 via-[#181124] to-slate-900 border-2 border-rose-500/60 shadow-[0_0_40px_rgba(244,63,94,0.35)] flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeIn">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                  <ShieldCheck className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      ★ Khas Admin Balzz
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight">Bar Admin & Control Center</h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Akses penuh panel pentadbir untuk kemaskini senarai game, harga barang, pantau pesanan, ubah banner promo & tetapan.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAdmin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.6)] cursor-pointer transition-all transform active:scale-95 shrink-0 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Masuk Bar Admin</span>
              </button>
            </div>
          )}

          {/* User Header Profile Card */}
          <div className="bg-gradient-to-r from-[#0D1117] via-[#121824] to-[#0D1117] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email)}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-950 text-slate-950" title="Google Authenticated Online">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">{currentUser.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      Google Auth
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Email Disahkan ✓
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 font-mono">{currentUser.email}</p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                    <span className="text-slate-400">ID Ahli:</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.id)}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>{currentUser.id}</span>
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-center sm:self-start">
                {onOpenGmailModal && (
                  <button
                    onClick={() => onOpenGmailModal(currentUser.email)}
                    className="px-3.5 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/40 text-red-300 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <Mail className="w-4 h-4 text-red-400" />
                    <span>Hantar Resit via Gmail API</span>
                  </button>
                )}

                <button
                  onClick={onLogOut}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Keluar</span>
                </button>
              </div>

            </div>

            {/* Profile Detail Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jumlah Pesanan</p>
                <p className="text-xl font-black text-orange-400 mt-0.5">{currentUser.totalOrders || userOrders.length}</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jumlah Belanja</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">RM {(currentUser.totalSpent || 0).toFixed(2)}</p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tarikh Daftar</p>
                <p className="text-xs font-bold text-slate-200 mt-1">
                  {new Date(currentUser.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Log Aktif Terakhir</p>
                <p className="text-xs font-bold text-cyan-300 mt-1">
                  {new Date(currentUser.lastLoginAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Nombor WhatsApp Didaftarkan:</span>
                {editingPhone ? (
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 0145975056"
                    className="bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
                  />
                ) : (
                  <strong className="text-white font-mono text-sm">{currentUser.phoneNumber || 'Belum diisi'}</strong>
                )}
              </div>

              {editingPhone ? (
                <button
                  onClick={handleSavePhone}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPhoneInput(currentUser.phoneNumber || '');
                    setEditingPhone(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Kemaskini Phone</span>
                </button>
              )}
            </div>
          </div>

          {/* User Orders History */}
          <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-black text-white">Sejarah Pesanan Topup Anda</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{userOrders.length} Pesanan</span>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <p className="text-sm">Tiada rekod pesanan lagi bawah akaun ini.</p>
                <p className="text-xs text-slate-500">
                  Lakukan topup di tab <strong>1. Menu</strong> untuk melihat rekod transaksi secara automatik di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-orange-400">{ord.id}</span>
                        <span className="text-xs font-extrabold text-white">{ord.gameName}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{ord.itemName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        User ID: {ord.userId} {ord.serverId ? `(${ord.serverId})` : ''} • {new Date(ord.createdAt).toLocaleString('ms-MY')}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <p className="text-sm font-black text-emerald-400">RM {ord.sellPrice.toFixed(2)}</p>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {ord.status === 'completed' ? 'Selesai ✓' : ord.status === 'processing' ? 'Diproses ⏱️' : 'Menunggu Resit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
