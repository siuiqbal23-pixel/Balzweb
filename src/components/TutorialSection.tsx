import React, { useState } from 'react';
import { BookOpen, QrCode, ShieldCheck, Zap, HelpCircle, ChevronDown, ChevronUp, Copy, CheckCircle2, Gamepad2, ArrowRight } from 'lucide-react';

interface TutorialSectionProps {
  ownerWhatsApp: string;
}

export const TutorialSection: React.FC<TutorialSectionProps> = ({ ownerWhatsApp }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const cleanPhone = ownerWhatsApp.replace(/\D/g, '');

  const faqs = [
    {
      question: 'Berapa lama masa diambil untuk diamond/UC masuk selepas bayaran?',
      answer: 'Proses topup di TopupBalz dijalankan secara automatik 24 jam. Secara purata, kredit in-game anda akan masuk dalam tempoh 5 hingga 30 saat sejurus resit Touch n Go eWallet dimuat naik dan disahkan.',
    },
    {
      question: 'Adakah topup di TopupBalz selamat dan rasmi?',
      answer: 'Ya, 100% selamat! Kami menggunakan saluran pengagihan borong rasmi. akaun game anda tidak berdepan sebarang risiko banned atau minus diamond.',
    },
    {
      question: 'Di mana saya boleh jumpa User ID & Server ID game saya?',
      answer: 'Untuk Free Fire: Tekan gambar profil di sudut atas kiri skrin in-game, UID 9-10 digit berada di bawah nama profil. Untuk MLBB: Tekan profil, User ID dan Zone ID (4-5 digit dalam kurungan) berada di sebelah avatar.',
    },
    {
      question: 'Bagaimana jika saya tersilap isi User ID?',
      answer: 'Jika anda tersilap isi User ID, sila hubungi Customer Support kami menerusi WhatsApp secara serta-merta dengan memberikan ID Pesanan anda supaya admin dapat membantu menyemak status pesanan.',
    },
    {
      question: 'Apakah kaedah pembayaran yang diterima?',
      answer: 'Kami menerima Touch \'n Go eWallet QR, DuitNow QR dari mana-mana bank tempatan Malaysia (Maybank, CIMB, Bank Islam, RHB) dan Online Banking.',
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] border border-orange-500/30 p-6 sm:p-10 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pusat Panduan & Tutorial</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cara Mudah Topup Game Di TopupBalz
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Ikuti panduan ringkas 4 langkah di bawah untuk membuat tempahan item game pilihan anda dengan selamat dan pantas.
          </p>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-400" />
          <span>4 Langkah Mudah Topup Sepantas 10 Saat</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-3 relative group hover:border-orange-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-black text-sm flex items-center justify-center">
              01
            </div>
            <h4 className="font-extrabold text-white text-sm">Pilih Game & Pakej</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pilih game kesukaan anda di halaman utama dan tentukan jumlah Diamond, UC, atau Pass yang ingin dibeli.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-3 relative group hover:border-orange-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-sm flex items-center justify-center">
              02
            </div>
            <h4 className="font-extrabold text-white text-sm">Isi User ID Game</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Masukkan Player ID (serta Zone/Server ID jika diperlukan) dengan tepat supaya item terus masuk ke akaun anda.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-3 relative group hover:border-orange-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 font-mono font-black text-sm flex items-center justify-center">
              03
            </div>
            <h4 className="font-extrabold text-white text-sm">Imbas QR & Bayar</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan Touch 'n Go eWallet atau imbas DuitNow QR dari perbankan dalam talian anda.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-3 relative group hover:border-orange-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm flex items-center justify-center">
              04
            </div>
            <h4 className="font-extrabold text-white text-sm">Hantar Resit & Selesai</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Muat naik bukti pembayaran atau tekan pautan WhatsApp automatik untuk pemprosesan pantas.
            </p>
          </div>

        </div>
      </div>

      {/* How to Find Player ID Section */}
      <div className="rounded-3xl bg-[#0D1117] border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-orange-400" />
            <span>Cara Mencari Player ID Dalam Game Popular</span>
          </h3>
          <p className="text-xs text-slate-400">
            Pastikan anda memasukkan ID yang betul berpandukan lokasi profil in-game masing-masing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Free Fire ID */}
          <div className="p-5 rounded-2xl bg-[#07090D] border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <h4 className="font-black text-white text-sm">Free Fire (FF)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Buka aplikasi Free Fire.<br />
              2. Tekan avatar/profil di sudut kiri atas.<br />
              3. Salin 8-10 digit <strong>Player ID</strong> yang terpapar di bawah nama watak.
            </p>
          </div>

          {/* MLBB ID */}
          <div className="p-5 rounded-2xl bg-[#07090D] border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h4 className="font-black text-white text-sm">Mobile Legends (MLBB)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Buka profil akaun MLBB.<br />
              2. Di sebelah avatar, cari format: <strong>User ID (Zone ID)</strong>.<br />
              3. Contoh: User ID <code className="text-orange-400 font-mono">12345678</code>, Zone ID <code className="text-orange-400 font-mono">1234</code>.
            </p>
          </div>

          {/* PUBG Mobile */}
          <div className="p-5 rounded-2xl bg-[#07090D] border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h4 className="font-black text-white text-sm">PUBG Mobile</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Tekan profil avatar di penjuru atas.<br />
              2. Salin 9-11 digit <strong>Character ID (UID)</strong> berhampiran nama gelaran anda.
            </p>
          </div>

        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Soalan Lazim (FAQ)</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#0D1117] border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left font-extrabold text-xs sm:text-sm text-slate-200 hover:text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-900 leading-relaxed bg-[#07090D]/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Support Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-extrabold text-white text-sm">Masih Perlukan Bantuan Khas?</h4>
          <p className="text-xs text-emerald-200/80">
            Pasukan Live Customer Support TopupBalz sedia membantu anda melalui WhatsApp.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanPhone}?text=Assalamualaikum%20admin%20TopupBalz,%20saya%20perlukan%20bantuan%20tutorial%20topup.`}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>Chat Admin WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
};
