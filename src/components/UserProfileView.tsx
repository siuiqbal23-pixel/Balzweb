import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  Copy,
  Gamepad2,
  LogOut,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { reload, sendEmailVerification } from 'firebase/auth';
import { UserProfile, Order } from '../types';
import { auth } from '../lib/firebase';
import { UsernameLoginModal } from './UsernameLoginModal';

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
  onOpenGmailModal,
  onOpenAdmin,
}) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [verified, setVerified] = useState(Boolean(currentUser?.isEmailVerified));
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVerified(Boolean(currentUser?.isEmailVerified));
  }, [currentUser?.id, currentUser?.isEmailVerified]);

  const userOrders = useMemo(() => currentUser
    ? orders.filter((order) => order.customerPhone === currentUser.phoneNumber || order.userId === currentUser.id || order.notes?.includes(currentUser.email))
    : [], [currentUser, orders]);

  const copyMemberId = async () => {
    if (!currentUser) return;
    try {
      await navigator.clipboard.writeText(currentUser.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage('Tidak dapat menyalin ID ahli pada peranti ini.');
    }
  };

  const resendVerification = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setMessage('Sesi Firebase tamat. Sila log masuk semula.');
      return;
    }
    setVerificationBusy(true);
    setMessage('');
    try {
      await reload(firebaseUser);
      if (firebaseUser.emailVerified) {
        setVerified(true);
        setMessage('E-mel anda sudah disahkan.');
      } else {
        await sendEmailVerification(firebaseUser);
        setMessage('Pautan pengesahan telah dihantar. Semak inbox atau folder spam.');
      }
    } catch {
      setMessage('Tidak dapat menghantar pautan pengesahan. Cuba lagi sebentar lagi.');
    } finally {
      setVerificationBusy(false);
    }
  };

  if (!currentUser) {
    return (
      <>
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[30px] border border-orange-500/20 bg-gradient-to-br from-slate-900 via-[#0d1117] to-[#17120e] px-6 py-12 text-center shadow-2xl shadow-orange-950/20 sm:px-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
            <UserRound className="h-8 w-8" />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-300">
            <Sparkles className="h-3.5 w-3.5" /> Akaun TopupBalz
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Selamat datang, pemain!</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Log masuk atau cipta akaun untuk mengurus profil, melihat pesanan dan berhubung dengan pasukan sokongan.
          </p>
          <button onClick={() => setLoginOpen(true)} className="mt-7 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-orange-950/30 transition hover:brightness-110">
            Log masuk / Daftar
          </button>
        </section>
        <UsernameLoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(user) => {
            onLoginSuccess(user);
            setLoginOpen(false);
          }}
        />
      </>
    );
  }

  const isAdminAccount = currentUser.name.toLowerCase().includes('balzz') || currentUser.email.toLowerCase().startsWith('balzz');

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {isAdminAccount && onOpenAdmin && (
        <section className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/70 to-slate-900 p-5 sm:flex-row">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-300">Admin workspace</p>
            <h2 className="mt-1 text-lg font-black text-white">Panel pentadbir</h2>
          </div>
          <button onClick={onOpenAdmin} className="rounded-xl bg-rose-500 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-400">Buka panel admin</button>
        </section>
      )}

      <section className="overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-slate-900 via-[#0d1117] to-[#111820] p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-3xl border-2 border-orange-400/70 bg-slate-800 object-cover"
              onError={(event) => { event.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`; }}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="break-words text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-300">
                  <ShieldCheck className="h-3 w-3" /> Firebase
                </span>
              </div>
              <p className="mt-1 break-all text-sm text-slate-400">{currentUser.email}</p>
              <button onClick={copyMemberId} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/70 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 hover:border-orange-500/40">
                ID ahli: {currentUser.id.slice(0, 14)}{currentUser.id.length > 14 ? '…' : ''}
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {onOpenGmailModal && <button onClick={() => onOpenGmailModal(currentUser.email)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:border-orange-500/40 hover:text-white"><Mail className="h-4 w-4" /> Gmail</button>}
            <button onClick={onLogOut} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20"><LogOut className="h-4 w-4" /> Log keluar</button>
          </div>
        </div>

        <div className={`mt-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${verified ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-amber-500/25 bg-amber-500/5'}`}>
          <div className="flex items-start gap-3">
            <BadgeCheck className={`mt-0.5 h-5 w-5 shrink-0 ${verified ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <p className={`text-sm font-bold ${verified ? 'text-emerald-300' : 'text-amber-300'}`}>{verified ? 'E-mel disahkan' : 'E-mel belum disahkan'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{verified ? 'Akaun anda telah disahkan.' : 'Sahkan e-mel untuk membantu melindungi akaun anda.'}</p>
            </div>
          </div>
          {!verified && <button onClick={resendVerification} disabled={verificationBusy} className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/10 disabled:opacity-50">{verificationBusy ? 'Menghantar…' : 'Hantar pautan'}</button>}
        </div>
        {message && <p role="status" className="mt-3 text-xs text-slate-300">{message}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jumlah pesanan</p><p className="mt-1 text-xl font-black text-orange-300">{userOrders.length}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jumlah belanja</p><p className="mt-1 text-xl font-black text-emerald-300">RM {userOrders.reduce((sum, order) => sum + (Number(order.sellPrice) || 0), 0).toFixed(2)}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tarikh daftar</p><p className="mt-2 text-xs font-bold text-slate-200">{new Date(currentUser.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</p><p className="mt-2 text-xs font-bold text-emerald-300">Aktif</p></div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-slate-800 bg-[#0d1117] p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-orange-400" /><h2 className="text-lg font-black text-white">Sejarah pesanan</h2></div>
          <span className="text-xs text-slate-500">{userOrders.length} pesanan</span>
        </div>
        {userOrders.length === 0 ? (
          <div className="py-8 text-center">
            <Gamepad2 className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-300">Belum ada pesanan untuk akaun ini</p>
            <p className="mt-1 text-xs text-slate-500">Pesanan yang sepadan dengan akaun akan dipaparkan di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.map((order) => (
              <article key={order.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-300">{order.id} <span className="mx-1 text-slate-600">·</span><span className="text-slate-200">{order.gameName}</span></p>
                  <p className="mt-1 text-xs text-slate-400">{order.itemName} · {new Date(order.createdAt).toLocaleString('ms-MY')}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="text-sm font-black text-emerald-300">RM {Number(order.sellPrice || 0).toFixed(2)}</span>
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-300">{order.status}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
