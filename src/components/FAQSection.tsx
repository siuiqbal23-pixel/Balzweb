import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'Berapa lama topup diproses?',
    a: 'Topup diproses dalam 1-5 minit setelah pembayaran disahkan. Jika lebih dari 10 minit, hubungi admin melalui WhatsApp atau Live Chat.',
  },
  {
    q: 'Metode pembayaran apa saja yang diterima?',
    a: 'Kami terima TnG eWallet, FPX, dan pembayaran langsung via WhatsApp. Transfer bank juga boleh dengan konfirmasi admin.',
  },
  {
    q: 'Bagaimana cara order?',
    a: 'Pilih game, pilih paket topup, masukkan User ID, pilih kaedah bayar, dan lakukan pembayaran. Admin akan proses otomatis dalam beberapa minit.',
  },
  {
    q: 'Apakah transaksi selamat?',
    a: 'Ya, semua transaksi dienkripsi dan dilindungi. Kami juga mempunyai sistem verifikasi berlapis untuk keselamatan anda.',
  },
  {
    q: 'Bagaimana jika topup gagal atau salah?',
    a: 'Hubungi admin melalui Live Chat atau WhatsApp dengan bukti pembayaran. Kami akan refund atau proses ulang dalam 1 jam.',
  },
  {
    q: 'Adakah diskaun untuk pembelian banyak?',
    a: 'Ya! Pelanggan setia dan pembelian bulk mendapat special pricing. Tanya admin untuk details.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Soalan Lazim</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            FAQ - Soalan Sering Ditanya
          </h2>
          <p className="text-sm text-slate-400">
            Cari jawapan untuk soalan umum tentang TopupBalz
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left card-hover rounded-2xl border border-slate-800 bg-[#0d1117]/80 p-6 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-black text-white leading-snug pr-4">{faq.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-orange-400 shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {openIndex === idx && (
                <p className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-300 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-6 md:p-8 text-center">
          <p className="text-sm text-slate-300 mb-4">
            Masih ada soalan lain? Hubungi admin kami sekarang!
          </p>
          <button className="btn-premium">
            📞 Chat dengan Admin
          </button>
        </div>
      </div>
    </section>
  );
}
