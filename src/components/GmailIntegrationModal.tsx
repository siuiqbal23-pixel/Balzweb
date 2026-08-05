import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  RefreshCw,
  Inbox,
  Sparkles,
  FileText,
  UserCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import {
  signInWithGoogleGmail,
  fetchGmailProfile,
  sendGmailEmail,
  fetchRecentGmailMessages,
  logoutGmail,
  GmailProfile,
  GmailMessageSummary,
} from '../lib/gmailService';

interface GmailIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultBodyHtml?: string;
  onSuccessToast?: (msg: string) => void;
}

export const GmailIntegrationModal: React.FC<GmailIntegrationModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = '',
  defaultSubject = 'Resit Pesanan Topup - TopupBalz',
  defaultBodyHtml = '',
  onSuccessToast,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [gmailUser, setGmailUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [recentMessages, setRecentMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [bodyText, setBodyText] = useState(
    defaultBodyHtml ||
      `Hai Pelanggan TopupBalz,\n\nTerima kasih kerana membeli di TopupBalz!\n\nPesanan anda telah berjaya diproses.\n\nNombor Rujukan: TB-${Math.floor(
        100000 + Math.random() * 900000
      )}\nJumlah: RM 15.00\n\nSalam Mesra,\nPasukan TopupBalz`
  );

  // Mandatory Confirmation Modal before sending
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (defaultRecipient) setRecipient(defaultRecipient);
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBodyHtml) setBodyText(defaultBodyHtml);
  }, [defaultRecipient, defaultSubject, defaultBodyHtml]);

  const handleConnectGmail = async () => {
    try {
      setIsLoading(true);
      const res = await signInWithGoogleGmail();
      if (res) {
        setAccessToken(res.accessToken);
        setGmailUser(res.user);

        // Fetch profile
        const prof = await fetchGmailProfile(res.accessToken);
        setProfile(prof);

        // Fetch recent messages
        const msgs = await fetchRecentGmailMessages(res.accessToken, 4);
        setRecentMessages(msgs);

        if (onSuccessToast) onSuccessToast('Berjaya disambung ke Gmail API!');
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.message?.includes('popup-closed-by-user') ||
        err?.message?.includes('closed-by-user')
      ) {
        return;
      }
      console.error(err);
      alert('Ralat semasa sambungan Gmail: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshMessages = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const prof = await fetchGmailProfile(accessToken);
      setProfile(prof);
      const msgs = await fetchRecentGmailMessages(accessToken, 5);
      setRecentMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      alert('Sila masukkan email penerima.');
      return;
    }
    // Open explicit confirmation modal (MANDATORY for Workspace Integration)
    setShowConfirmModal(true);
  };

  const handleConfirmSendEmail = async () => {
    if (!accessToken) return;
    setShowConfirmModal(false);
    setIsSending(true);

    try {
      // Convert bodyText to simple clean HTML
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #f97316;">
          <div style="border-bottom: 2px solid #f97316; padding-bottom: 12px; margin-bottom: 16px;">
            <h1 style="color: #f97316; margin: 0; font-size: 22px;">🎮 TopupBalz Service</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Sistem Topup Game Automatik Malaysia</p>
          </div>
          <div style="font-size: 14px; line-height: 1.6; color: #e2e8f0; whitespace: pre-line;">
            ${bodyText.replace(/\n/g, '<br/>')}
          </div>
          <div style="margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px; font-size: 12px; color: #64748b;">
            E-mel ini dihantar secara rasmi menggunakan Google Gmail API untuk TopupBalz.
          </div>
        </div>
      `;

      await sendGmailEmail({
        to: recipient,
        subject: subject,
        bodyHtml: htmlContent,
        accessToken,
        fromEmail: gmailUser?.email,
      });

      if (onSuccessToast) onSuccessToast(`E-mel berjaya dihantar ke ${recipient} melalui Gmail API!`);

      // Refresh sent list
      await handleRefreshMessages();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menghantar e-mel: ' + (err.message || err));
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await logoutGmail();
    setAccessToken(null);
    setGmailUser(null);
    setProfile(null);
    setRecentMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D1117] border border-orange-500/40 rounded-3xl shadow-[0_0_50px_rgba(255,140,0,0.25)] overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#121824] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/40 text-red-400 rounded-2xl shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Pusat Integrasi Google Gmail API</h2>
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold rounded-full">
                  Official OAuth
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Hantar resit, notifikasi & verifikasi e-mel terus melalui akaun Gmail anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Step 1: Gmail Connection Status */}
          {!accessToken ? (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full border border-red-500/30 text-red-400">
                <Mail className="w-10 h-10" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-extrabold text-white">Sambungkan Akaun Google Gmail</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Tekan butang di bawah untuk memberikan kebenaran Google Gmail API secara selamat. Kebenaran ini membolehkan TopupBalz menghantar resit e-mel rasmi dengan kebenaran anda.
                </p>
              </div>

              {/* Official Google Sign-In Styled Button */}
              <button
                onClick={handleConnectGmail}
                disabled={isLoading}
                className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-800 font-extrabold text-sm rounded-xl shadow-lg hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span>{isLoading ? 'Menghubungkan...' : 'Log Masuk dengan Google Gmail'}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {gmailUser?.photoURL ? (
                  <img
                    src={gmailUser.photoURL}
                    alt="Profile"
                    className="w-11 h-11 rounded-full border-2 border-emerald-400"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center border border-emerald-500/40">
                    <UserCheck className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-white">{gmailUser?.displayName || 'Pengguna Gmail'}</p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Gmail Disambung
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{gmailUser?.email || profile?.emailAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshMessages}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Kemas Kini</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-red-500/30 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Nyahsambung</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Compose & Send Email Form */}
          {accessToken && (
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-orange-400 font-extrabold text-sm">
                  <Send className="w-4 h-4" />
                  <span>Borang Penghantaran E-mel Gmail API</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('Resit Rasmi Topup - TopupBalz');
                      setBodyText(
                        `Hai ${recipient || 'Pelanggan'},\n\nTerima kasih atas pembelian anda!\n\nItem: 1,000 Diamonds Mobile Legends\nJumlah: RM 24.50\nStatus: BERJAYA DIPROSES ✓\n\nNombor Rujukan: TB-${Math.floor(
                          100000 + Math.random() * 900000
                        )}\n\nTerima kasih!\nPasukan TopupBalz`
                      );
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Template Resit Topup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('Kod Verifikasi E-mel TopupBalz');
                      setBodyText(
                        `Hai,\n\nKod verifikasi 6-digit anda ialah: ${Math.floor(
                          100000 + Math.random() * 900000
                        )}\n\nSila masukkan kod ini di aplikasi TopupBalz untuk mengesahkan akaun e-mel anda.`
                      );
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Template OTP
                  </button>
                </div>
              </div>

              <form onSubmit={handleInitiateSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">E-mel Penerima:</label>
                  <input
                    type="email"
                    required
                    placeholder="contoh: pelanggan@gmail.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tajuk E-mel (Subject):</label>
                  <input
                    type="text"
                    required
                    placeholder="Tajuk e-mel"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kandungan E-mel:</label>
                  <textarea
                    rows={5}
                    required
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Hantar E-mel via Gmail API</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Recent Messages / Log Section */}
          {accessToken && (
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                  <Inbox className="w-4 h-4" />
                  <span>Rekod Mesej Gmail Terkini</span>
                </div>
                {profile && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Jumlah Mesej: {profile.messagesTotal} | History ID: {profile.historyId}
                  </span>
                )}
              </div>

              {recentMessages.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Tiada mesej terkini ditemui atau mesej baru belum dikemas kini.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-extrabold text-orange-400 truncate max-w-[250px]">{msg.subject}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Daripada: {msg.from}</p>
                      {msg.snippet && (
                        <p className="text-[11px] text-slate-300 italic line-clamp-1 bg-slate-900/60 p-1.5 rounded">
                          "{msg.snippet}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#121824] p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Integrasi Disahkan Menggunakan Google Workspace OAuth Scope</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* MANDATORY Explicit User Confirmation Modal for Mutating/Sending Email */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121824] border-2 border-orange-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Pengesahan Hantar E-mel</h3>
                <p className="text-xs text-slate-400">Tindakan ini memerlukan kebenaran anda</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <p className="text-slate-300">
                <strong>Kepada:</strong> <span className="text-amber-300 font-mono">{recipient}</span>
              </p>
              <p className="text-slate-300">
                <strong>Tajuk:</strong> {subject}
              </p>
              <p className="text-slate-400 text-[11px] border-t border-slate-800 pt-1.5">
                E-mel rasmi akan dihantar secara langsung dari akaun Gmail <strong className="text-slate-200">{gmailUser?.email}</strong> ke akaun penerima.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSendEmail}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                Ya, Hantar Sekarang ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
