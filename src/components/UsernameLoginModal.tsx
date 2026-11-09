import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { UserProfile } from '../types';
import { auth, db } from '../lib/firebase';

type AuthMode = 'signin' | 'signup';
interface UsernameLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  titleMessage?: string;
}

const MIN_PASSWORD_LENGTH = 8;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,20}$/;
const RESERVATION_TTL_MS = 10 * 60 * 1000;
const emailActionSettings = () => ({ url: window.location.origin, handleCodeInApp: false });

function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'username/already-taken') return 'Username ini sudah digunakan. Pilih username lain.';
  switch (code) {
    case 'auth/email-already-in-use': return 'E-mel ini sudah berdaftar. Cuba log masuk menggunakan username yang telah didaftarkan.';
    case 'auth/invalid-email': return 'Format e-mel tidak sah.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Username atau kata laluan salah. Semak ejaan dan cuba lagi.';
    case 'auth/weak-password': return `Kata laluan mesti sekurang-kurangnya ${MIN_PASSWORD_LENGTH} aksara.`;
    case 'auth/too-many-requests': return 'Terlalu banyak percubaan. Sila tunggu sebentar dan cuba lagi.';
    case 'auth/network-request-failed': return 'Sambungan internet bermasalah. Sila cuba lagi.';
    case 'auth/operation-not-allowed': return 'Kaedah e-mel/kata laluan belum diaktifkan dalam Firebase Authentication.';
    case 'auth/unauthorized-domain': return `Domain ${window.location.hostname} belum dibenarkan dalam Firebase Authentication > Settings > Authorized domains.`;
    case 'permission-denied':
    case 'firestore/permission-denied': return 'Firebase menolak semakan username. Semak Firestore Rules untuk koleksi usernames.';
    default:
      console.error('Authentication error:', code || error);
      return 'Tak dapat proses akaun. Semak sambungan internet dan cuba lagi.';
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

async function reserveUsername(username: string, reservationId: string) {
  const usernameRef = doc(db, 'usernames', username.toLowerCase());
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(usernameRef);
    if (existing.exists()) {
      const data = existing.data();
      const expiredReservation = !data.ownerUid && typeof data.reservedAt === 'number' && Date.now() - data.reservedAt > RESERVATION_TTL_MS;
      if (!expiredReservation) {
        const error = new Error('Username is already taken') as Error & { code: string };
        error.code = 'username/already-taken';
        throw error;
      }
    }
    transaction.set(usernameRef, { username: username.toLowerCase(), reservationId, reservedAt: Date.now(), ownerUid: null });
  });
}

async function finalizeUsername(username: string, reservationId: string, uid: string, email: string) {
  const usernameRef = doc(db, 'usernames', username.toLowerCase());
  await runTransaction(db, async (transaction) => {
    const reservation = await transaction.get(usernameRef);
    if (!reservation.exists() || reservation.data().reservationId !== reservationId) {
      throw new Error('Tempahan username tamat. Cuba daftar semula.');
    }
    transaction.update(usernameRef, { ownerUid: uid, email: email.toLowerCase(), reservedAt: null });
  });
}

async function releaseUsername(username: string, reservationId: string) {
  const usernameRef = doc(db, 'usernames', username.toLowerCase());
  await runTransaction(db, async (transaction) => {
    const reservation = await transaction.get(usernameRef);
    if (reservation.exists() && reservation.data().reservationId === reservationId && !reservation.data().ownerUid) transaction.delete(usernameRef);
  });
}

export const UsernameLoginModal: React.FC<UsernameLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  titleMessage = 'Akaun TopupBalz',
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
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
    const cleanUsername = username.trim().replace(/^@+/, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername) {
      setErrorMessage('Masukkan username anda.');
      return;
    }
    if (mode === 'signup') {
      if (!USERNAME_PATTERN.test(cleanUsername)) {
        setErrorMessage('Username mesti 3–20 aksara: huruf, nombor, titik (.) atau garis bawah (_).');
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setErrorMessage(`Kata laluan mesti sekurang-kurangnya ${MIN_PASSWORD_LENGTH} aksara.`);
        return;
      }
      if (!cleanEmail) {
        setErrorMessage('Masukkan e-mel untuk menerima pautan pengesahan.');
        return;
      }
    }

    setLoading(true);
    let reservationId: string | null = null;
    let reservationFinalized = false;
    try {
      if (mode === 'signup') {
        reservationId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        await reserveUsername(cleanUsername, reservationId);
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(credential.user, { displayName: cleanUsername });
        await finalizeUsername(cleanUsername, reservationId, credential.user.uid, cleanEmail);
        reservationFinalized = true;

        try {
          await sendEmailVerification(credential.user, emailActionSettings());
        } catch (verificationError) {
          console.error('Could not send verification email:', verificationError);
          await signOut(auth);
          localStorage.removeItem('topupbalz_current_user');
          setErrorMessage(`Akaun @${cleanUsername} sudah diwujudkan tetapi e-mel pengesahan gagal dihantar. Semak tetapan Firebase dan cuba log masuk semula untuk minta pautan baharu. ${getAuthErrorMessage(verificationError)}`);
          return;
        }
        await signOut(auth);
        localStorage.removeItem('topupbalz_current_user');
        setMode('signin');
        setPassword('');
        setNotice(`Akaun @${cleanUsername} berjaya didaftarkan. Sahkan pautan yang dihantar ke ${cleanEmail}, kemudian log masuk menggunakan username dan kata laluan.`);
        return;
      }

      const usernameRef = doc(db, 'usernames', cleanUsername.toLowerCase());
      const usernameSnapshot = await getDoc(usernameRef);
      if (!usernameSnapshot.exists()) {
        setErrorMessage('Username belum berdaftar. Semak ejaan atau pilih Daftar untuk cipta akaun.');
        return;
      }
      const usernameData = usernameSnapshot.data();
      if (!usernameData.email || !usernameData.ownerUid) {
        setErrorMessage('Rekod username belum lengkap. Hubungi admin untuk bantuan.');
        return;
      }
      const loginEmail = String(usernameData.email).toLowerCase();
      const credential = await signInWithEmailAndPassword(auth, loginEmail, password);
      if (credential.user.uid !== usernameData.ownerUid) {
        await signOut(auth);
        setErrorMessage('Rekod username tidak sepadan dengan akaun. Hubungi admin untuk bantuan.');
        return;
      }
      if (!credential.user.emailVerified) {
        try { await sendEmailVerification(credential.user, emailActionSettings()); }
        catch (verificationError) { console.error('Could not resend verification email:', verificationError); }
        await signOut(auth);
        localStorage.removeItem('topupbalz_current_user');
        setErrorMessage('E-mel akaun belum disahkan. Kami cuba hantar semula pautan—sahkan e-mel dahulu, kemudian log masuk semula.');
        return;
      }
      completeSignIn(credential.user, String(usernameData.username || cleanUsername));
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      if (reservationId && !reservationFinalized) {
        try { await releaseUsername(cleanUsername, reservationId); }
        catch (releaseError) { console.error('Could not release username reservation:', releaseError); }
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMessage('');
    setNotice('');
    const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Masukkan username dahulu untuk menerima pautan reset ke e-mel berdaftar.');
      return;
    }
    setLoading(true);
    try {
      const usernameSnapshot = await getDoc(doc(db, 'usernames', cleanUsername));
      if (!usernameSnapshot.exists() || !usernameSnapshot.data().email) {
        setErrorMessage('Username tidak dijumpai. Semak ejaan dan cuba lagi.');
        return;
      }
      await sendPasswordResetEmail(auth, String(usernameSnapshot.data().email), emailActionSettings());
      setNotice('Jika username itu berdaftar, pautan reset kata laluan telah dihantar ke e-mel akaun.');
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
        <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 z-10 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
        <div className="relative text-center">
          <img src="/topupbalz-logo.svg" alt="Logo rasmi TopupBalz" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover" />
          <div className="auth-badge mb-3"><ShieldCheck className="h-3.5 w-3.5" /> Akaun dilindungi Firebase</div>
          <h2 id="account-modal-title" className="auth-title text-2xl font-black text-white">{mode === 'signup' ? 'Cipta akaun anda' : titleMessage}</h2>
          <p className="auth-subtitle mt-2 text-sm leading-6">{mode === 'signup' ? 'Pilih username unik untuk akaun TopupBalz.' : 'Log masuk menggunakan username dan kata laluan.'}</p>
        </div>
        <div className="auth-toggle-wrap relative mt-6">
          <button type="button" onClick={() => switchMode('signin')} aria-pressed={mode === 'signin'} className={`auth-toggle-btn ${mode === 'signin' ? 'auth-toggle-btn--active' : 'auth-toggle-btn--idle'}`}>Log Masuk</button>
          <button type="button" onClick={() => switchMode('signup')} aria-pressed={mode === 'signup'} className={`auth-toggle-btn ${mode === 'signup' ? 'auth-toggle-btn--active' : 'auth-toggle-btn--idle'}`}>Daftar</button>
        </div>
        {errorMessage && <div role="alert" className="auth-error-box mt-4 flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}
        {notice && <p role="status" className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
        <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
          <label className="block">
            <span className="auth-field-label">Username{mode === 'signup' ? ' (unik)' : ''}</span>
            <span className="auth-input-wrap"><UserRound className="auth-input-icon h-4 w-4" /><input type="text" name="username" autoComplete="username" required minLength={mode === 'signup' ? 3 : undefined} maxLength={mode === 'signup' ? 20 : 64} pattern={mode === 'signup' ? '[A-Za-z0-9_.]{3,20}' : undefined} value={username} onChange={(event) => setUsername(event.target.value)} placeholder={mode === 'signup' ? 'Contoh: pemain_balz' : 'Username anda'} className="auth-input" /></span>
            {mode === 'signup' && <span className="mt-1 block text-xs text-slate-400">3–20 aksara: huruf, nombor, titik atau _</span>}
          </label>
          {mode === 'signup' && <label className="block"><span className="auth-field-label">E-mel untuk pengesahan</span><span className="auth-input-wrap"><Mail className="auth-input-icon h-4 w-4" /><input type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="auth-input" /></span></label>}
          <label className="block">
            <span className="auth-field-label">Kata laluan</span>
            <span className="auth-input-wrap"><LockKeyhole className="auth-input-icon h-4 w-4" /><input type={showPassword ? 'text' : 'password'} name="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : 1} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'signup' ? 'Sekurang-kurangnya 8 aksara' : 'Kata laluan anda'} className="auth-input pr-12" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-orange-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
            {mode === 'signup' && <span className="mt-1 block text-xs text-slate-400">Minimum 8 aksara.</span>}
          </label>
          {mode === 'signin' && <button type="button" onClick={handlePasswordReset} disabled={loading} className="auth-link-btn text-xs disabled:opacity-50">Lupa kata laluan? (guna username)</button>}
          <button type="submit" disabled={loading} className="auth-submit-btn" style={{ display: 'flex', visibility: 'visible', opacity: 1, position: 'relative', zIndex: 2, width: '100%', minHeight: 56, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316, #fbbf24)', color: '#111827', border: '2px solid #fdba74', borderRadius: 16, fontSize: 16, fontWeight: 900, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Sedang diproses…' : mode === 'signup' ? 'Daftar akaun' : 'Log masuk'}</button>
        </form>
        <p className="auth-footnote relative mt-5 leading-5">{mode === 'signup' ? 'Pautan pengesahan dihantar melalui e-mel. Kata laluan diuruskan dengan selamat oleh Firebase.' : 'Log masuk selamat menggunakan username dan kata laluan.'}</p>
      </section>
    </div>
  );
};
