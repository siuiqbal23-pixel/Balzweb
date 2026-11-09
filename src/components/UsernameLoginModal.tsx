import React, { useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';

type AuthMode = 'signin' | 'signup';

interface UsernameLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  titleMessage?: string;
}

function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'E-mel ini sudah mempunyai akaun. Cuba log masuk.';
    case 'auth/invalid-email':
      return 'Format e-mel tidak sah.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mel atau kata laluan tidak betul.';
    case 'auth/weak-password':
      return 'Kata laluan terlalu lemah. Gunakan sekurang-kurangnya 6 aksara.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percubaan. Sila tunggu sebentar dan cuba lagi.';
    case 'auth/network-request-failed':
      return 'Sambungan internet bermasalah. Sila cuba lagi.';
    case 'auth/operation-not-allowed':
      return 'Penyedia log masuk ini belum diaktifkan dalam Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Tetingkap Google ditutup sebelum proses selesai.';
    case 'auth/popup-blocked':
      return 'Pelayar menyekat tetingkap Google. Benarkan pop-up dan cuba lagi.';
    default:
      return 'Tidak dapat memproses akaun sekarang. Sila cuba lagi.';
  }
}

function toUserProfile(user: typeof auth.currentUser, fallbackName = ''): UserProfile {
  if (!user) throw new Error('Firebase user is missing');
  const name = user.displayName || fallbackName || user.email?.split('@')[0] || 'TopupBalz User';
  return {
    id: user.uid,
    email: user.email || '',
    name,
    avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    googleId: user.uid,
    phoneNumber: user.phoneNumber || '',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
    totalOrders: 0,
    totalSpent: 0,
    isOnline: true,
    isEmailVerified: user.emailVerified,
  };
}

export const UsernameLoginModal: React.FC<UsernameLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  titleMessage = 'Akaun TopupBalz',
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const completeSignIn = (user: typeof auth.currentUser, fallbackName = '') => {
    const profile = toUserProfile(user, fallbackName);
    localStorage.setItem('topupbalz_current_user', JSON.stringify(profile));
    onLoginSuccess(profile);
    onClose();
    setPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = name.trim();
        if (displayName) await updateProfile(credential.user, { displayName });
        try {
          await sendEmailVerification(credential.user);
          setNotice('Pautan pengesahan telah dihantar ke e-mel anda.');
        } catch (verificationError) {
          console.warn('Could not send verification email:', verificationError);
        }
        completeSignIn(credential.user, displayName);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        completeSignIn(credential.user);
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setNotice('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      completeSignIn(credential.user);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMessage('');
    setNotice('');
    if (!email.trim()) {
      setErrorMessage('Masukkan e-mel anda dahulu untuk menerima pautan tetapan semula.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice('Jika akaun dengan e-mel itu wujud, pautan tetapan semula telah dihantar.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage('');
    setNotice('');
  };

  return (
    <div
      className="auth-shell fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="auth-card relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 z-10 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-orange-500/50 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative text-center">
          <div className="auth-brand-mark mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-slate-950">
            <Flame className="h-7 w-7 fill-current" />
          </div>
          <div className="auth-pill mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Akaun dilindungi Firebase
          </div>
          <h2 id="account-modal-title" className="text-2xl font-black tracking-tight text-white">
            {mode === 'signup' ? 'Cipta akaun anda' : titleMessage}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {mode === 'signup'
              ? 'Daftar untuk mula menggunakan akaun TopupBalz.'
              : 'Log masuk untuk meneruskan ke akaun TopupBalz.'}
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
          <button type="button" onClick={() => switchMode('signin')} aria-pressed={mode === 'signin'} className={`auth-tab rounded-xl px-3 py-2.5 text-sm font-bold transition ${mode === 'signin' ? 'auth-tab active bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            Log Masuk
          </button>
          <button type="button" onClick={() => switchMode('signup')} aria-pressed={mode === 'signup'} className={`auth-tab rounded-xl px-3 py-2.5 text-sm font-bold transition ${mode === 'signup' ? 'auth-tab active bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            Daftar
          </button>
        </div>

        {errorMessage && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {notice && <p role="status" className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}

        <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
          {mode === 'signup' && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Nama paparan</span>
              <span className="relative block">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="text" autoComplete="name" required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama anda" className="auth-field w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
              </span>
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">E-mel</span>
            <span className="relative block">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="auth-field w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
            </span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Kata laluan</span>
            <span className="relative block">
              <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sekurang-kurangnya 6 aksara" className="auth-field w-full rounded-xl py-3 pl-10 pr-12 text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>
          {mode === 'signin' && (
            <button type="button" onClick={handlePasswordReset} disabled={loading} className="text-xs font-semibold text-orange-300 hover:text-orange-200 disabled:opacity-50">
              Lupa kata laluan?
            </button>
          )}
          <button type="submit" disabled={loading} className="auth-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Sedang diproses…' : mode === 'signup' ? 'Daftar akaun' : 'Log masuk'}
          </button>
        </form>

        <div className="relative my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          <span className="h-px flex-1 bg-slate-800" /> atau <span className="h-px flex-1 bg-slate-800" />
        </div>
        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="auth-btn-google relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 transition disabled:opacity-50">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600">G</span>
          Teruskan dengan Google
        </button>

        <p className="relative mt-5 text-center text-[11px] leading-5 text-slate-500">
          Kata laluan diuruskan oleh Firebase Authentication dan tidak dihantar ke pelayan aplikasi.
        </p>
      </section>
    </div>
  );
};
