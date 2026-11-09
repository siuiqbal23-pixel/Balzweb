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
  signOut,
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
      return 'E-mel ini sudah berdaftar. Sila log masuk.';
    case 'auth/invalid-email':
      return 'Format e-mel tidak sah.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mel atau kata laluan salah, atau akaun belum didaftarkan. Jika belum ada akaun, pilih Daftar.';
    case 'auth/weak-password':
      return 'Kata laluan terlalu lemah. Gunakan sekurang-kurangnya 6 aksara.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percubaan. Sila tunggu sebentar dan cuba lagi.';
    case 'auth/network-request-failed':
      return 'Sambungan internet bermasalah. Sila cuba lagi.';
    case 'auth/operation-not-allowed':
      return 'Kaedah ini belum diaktifkan dalam Firebase Authentication.';
    case 'auth/unauthorized-domain':
      return `Domain ${window.location.hostname} belum dibenarkan. Tambah domain ini dalam Firebase Authentication > Settings > Authorized domains.`;
    case 'auth/invalid-api-key':
      return 'Firebase API key tidak sah. Semak konfigurasi Firebase projek web.';
    case 'auth/popup-closed-by-user':
      return 'Tetingkap Google ditutup sebelum proses selesai.';
    case 'auth/popup-blocked':
      return 'Pelayar menyekat tetingkap Google. Benarkan pop-up dan cuba lagi.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan Google dibatalkan. Cuba sekali lagi.';
    default:
      console.error('Firebase Authentication error:', code || error);
      return 'Tidak dapat memproses akaun. Cuba semula; jika masalah berulang, semak domain Authorized domains dan Firebase Console.';
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

const emailActionSettings = () => ({ url: window.location.origin, handleCodeInApp: false });

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
          await sendEmailVerification(credential.user, emailActionSettings());
        } catch (verificationError) {
          console.error('Could not send verification email:', verificationError);
          setErrorMessage(`Akaun telah dibuat, tetapi pautan pengesahan gagal dihantar. ${getAuthErrorMessage(verificationError)}`);
          return;
        }
        await signOut(auth);
        localStorage.removeItem('topupbalz_current_user');
        setMode('signin');
        setPassword('');
        setNotice(`Pautan pengesahan dihantar ke ${email.trim()}. Sahkan e-mel dahulu sebelum log masuk.`);
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        try {
          await sendEmailVerification(credential.user, emailActionSettings());
        } catch (verificationError) {
          console.error('Could not resend verification email:', verificationError);
        }
        await signOut(auth);
        localStorage.removeItem('topupbalz_current_user');
        setErrorMessage('E-mel belum disahkan. Kami cuba hantar semula pautan—sahkan e-mel dahulu, kemudian log masuk.');
        return;
      }
      completeSignIn(credential.user);
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
      setErrorMessage('Masukkan e-mel berdaftar dahulu untuk menerima pautan tetapan semula.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), emailActionSettings());
      setNotice('Jika e-mel ini berdaftar, Firebase akan menghantar pautan selamat untuk menetapkan kata laluan baharu.');
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
    <div className="auth-modal-backdrop fixed inset-0 z-[130] flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="account-modal-title" className="auth-modal-panel relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] p-6 sm:p-8">
        <div className="auth-glow" />
        <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 z-10 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-orange-500/50 hover:text-white"><X className="h-4 w-4" /></button>
        <div className="relative text-center">
          <div className="auth-brand-mark mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-slate-950"><Flame className="h-7 w-7 fill-current" /></div>
          <div className="auth-badge mb-3"><ShieldCheck className="h-3.5 w-3.5" /> Akaun dilindungi Firebase</div>
          <h2 id="account-modal-title" className="auth-title text-2xl font-black text-white">{mode === 'signup' ? 'Cipta akaun anda' : titleMessage}</h2>
          <p className="auth-subtitle mt-2 text-sm leading-6">{mode === 'signup' ? 'Daftar untuk mula menggunakan akaun TopupBalz.' : 'Log masuk untuk meneruskan ke akaun TopupBalz.'}</p>
        </div>
        <div className="auth-toggle-wrap relative mt-6">
          <button type="button" onClick={() => switchMode('signin')} aria-pressed={mode === 'signin'} className={`auth-toggle-btn ${mode === 'signin' ? 'auth-toggle-btn--active' : 'auth-toggle-btn--idle'}`}>Log Masuk</button>
          <button type="button" onClick={() => switchMode('signup')} aria-pressed={mode === 'signup'} className={`auth-toggle-btn ${mode === 'signup' ? 'auth-toggle-btn--active' : 'auth-toggle-btn--idle'}`}>Daftar</button>
        </div>
        {errorMessage && <div role="alert" className="auth-error-box mt-4 flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}
        {notice && <p role="status" className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
        <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
          {mode === 'signup' && <label className="block"><span className="auth-field-label">Nama paparan</span><span className="auth-input-wrap"><UserRound className="auth-input-icon h-4 w-4" /><input type="text" autoComplete="name" required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama anda" className="auth-input" /></span></label>}
          <label className="block"><span className="auth-field-label">E-mel</span><span className="auth-input-wrap"><Mail className="auth-input-icon h-4 w-4" /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="auth-input" /></span></label>
          <label className="block"><span className="auth-field-label">Kata laluan</span><span className="auth-input-wrap"><LockKeyhole className="auth-input-icon h-4 w-4" /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sekurang-kurangnya 6 aksara" className="auth-input pr-12" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-orange-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
          {mode === 'signin' && <button type="button" onClick={handlePasswordReset} disabled={loading} className="auth-link-btn text-xs disabled:opacity-50">Lupa kata laluan? Hantar pautan ke e-mel</button>}
          <button type="submit" disabled={loading} className="auth-submit-btn" style={{ display: 'flex', visibility: 'visible', opacity: 1, position: 'relative', zIndex: 2, width: '100%', minHeight: 56, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316, #fbbf24)', color: '#111827', border: '2px solid #fdba74', borderRadius: 16, fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Sedang diproses…' : mode === 'signup' ? 'Daftar akaun' : 'Log masuk'}
          </button>
        </form>
        <div className="relative my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-slate-700" /> atau <span className="h-px flex-1 bg-slate-700" /></div>
        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="auth-btn-google relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 transition disabled:opacity-50"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600">G</span>Teruskan dengan Google</button>
        <p className="auth-footnote relative mt-5 leading-5">Kata laluan diuruskan oleh Firebase Authentication dan tidak dihantar ke pelayan aplikasi.</p>
      </section>
    </div>
  );
};
