import React, { useState } from 'react';
import { Review } from '../data/reviewsData';
import { Star, ShieldCheck, MessageSquarePlus, ThumbsUp, Sparkles, CheckCircle2, User, X, MessageSquare, Headphones } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (newReview: Omit<Review, 'id' | 'date' | 'verified'>) => void;
  gamesList: { id: string; name: string }[];
  onOpenLiveChat?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onAddReview,
  gamesList,
  onOpenLiveChat,
}) => {
  const [filterRating, setFilterRating] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [game, setGame] = useState(gamesList[0]?.name || 'Free Fire');
  const [item, setItem] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const filteredReviews = filterRating === 0
    ? reviews
    : reviews.filter((r) => r.rating === filterRating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      alert('Aktiviti spam dikesan.');
      return;
    }

    if (!name.trim() || !comment.trim()) return;

    setSubmitting(true);
    onAddReview({
      customerName: name,
      gameName: game,
      itemName: item || 'Pakej Topup',
      rating,
      comment,
    });

    setSubmitting(false);
    setIsModalOpen(false);
    setName('');
    setComment('');
    setItem('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117] border border-orange-500/30 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Testimoni & Ulasan Pelanggan</span>
              </span>

              {/* Chat Live Admin Button Badge */}
              {onOpenLiveChat && (
                <button
                  onClick={onOpenLiveChat}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all inline-flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Chat Live Admin (24/7)</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Apa Kata Komuniti Gamers Malaysia?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Lihat pengalaman sebenar ribuan pembeli yang telah bertukar ke TopupBalz untuk keperluan topup pantas dan telus.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="p-5 rounded-2xl bg-[#07090D]/80 border border-slate-800 flex items-center gap-5 shrink-0 w-full md:w-auto justify-center">
            <div className="text-center">
              <div className="text-4xl font-black text-orange-400 font-mono tracking-tight">
                {averageRating}
              </div>
              <div className="flex items-center gap-0.5 text-amber-400 my-1 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {reviews.length} Ulasan Disahkan
              </p>
            </div>

            <div className="h-12 w-px bg-slate-800" />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Pembeli Asli</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(255,140,0,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Tulis Ulasan</span>
                </button>

                {onOpenLiveChat && (
                  <button
                    onClick={onOpenLiveChat}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Admin</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterRating(0)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRating === 0
                  ? 'bg-orange-500 text-slate-950 font-black'
                  : 'bg-[#0D1117] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua Ulasan ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((num) => (
              <button
                key={num}
                onClick={() => setFilterRating(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  filterRating === num
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'bg-[#0D1117] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{num}</span>
                <Star className="w-3 h-3 fill-current text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800/80 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center text-orange-400 font-bold text-sm">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>{rev.customerName}</span>
                        {rev.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" title="Pembeli Disahkan" />
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {rev.gameName} • <span className="text-orange-400">{rev.itemName}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {rev.date}
                  </span>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Topup Berjaya
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ThumbsUp className="w-3 h-3" /> Membantu
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tulis Ulasan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1117] border border-orange-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(255,140,0,0.2)] animate-scaleUp">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Kongsi Pengalaman Topup</h3>
                <p className="text-xs text-slate-400">Berikan ulasan jujur anda mengenai servis TopupBalz</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Anda / Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aiman FF PRO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#07090D] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Game Ditopup</label>
                  <select
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="w-full bg-[#07090D] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    {gamesList.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                    <option value="Lain-lain">Lain-lain Game</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pakej / Item (Pilihan)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 520 Diamond"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-[#07090D] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Penarafan Bintang (Rating)</label>
                <div className="flex items-center gap-2 p-3 bg-[#07090D] border border-slate-800 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto font-mono text-orange-400 font-bold">{rating} / 5 Bintang</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Ulasan Anda</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ceritakan kepantasan servis, kemudahan pembayaran, atau khidmat pelanggan..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#07090D] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Anti-Spam Honeypot Trap */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot_field"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-wider hover:from-orange-400 hover:to-amber-400 shadow-[0_0_20px_rgba(255,140,0,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Hantar Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
