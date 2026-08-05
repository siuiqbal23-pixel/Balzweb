import React, { useState } from 'react';
import { X, Search, Clock, CheckCircle2, AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  onClose: () => void;
  onSearchOrder: (id: string) => Promise<Order[]>;
  ownerPhone: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  onClose,
  onSearchOrder,
  ownerPhone,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await onSearchOrder(searchQuery.trim());
      setOrders(res);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SELESAI</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>SEDANG DIPROSES</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>DIBATALKAN</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING / DISAMBUNG</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0D1117] border border-slate-800 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#121824]">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-black text-white">Semak Status Pesanan</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan ID Pesanan (e.g. TB-982104) atau User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#121824] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
            >
              {loading ? 'Menyemak...' : 'Cari'}
            </button>
          </form>

          {/* Search Results */}
          {orders !== null && (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="p-6 text-center bg-[#121824] rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-white">Pesanan Tidak Dijumpai</p>
                  <p>Sila pastikan ejaan ID Pesanan atau User ID anda adalah tepat.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-[#121824] rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-orange-400">
                        #{ord.id}
                      </span>
                      {getStatusBadge(ord.status)}
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Game:</span>
                        <span className="text-white font-bold">{ord.gameName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Produk:</span>
                        <span className="text-white font-bold">{ord.itemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">User ID:</span>
                        <span className="text-white font-bold">{ord.userId} {ord.serverId ? `(${ord.serverId})` : ''}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 text-sm font-sans">
                        <span className="text-slate-400">Harga Akhir:</span>
                        <span className="text-orange-400 font-bold font-mono">RM {ord.sellPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {ord.notes && (
                      <p className="text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                        💡 <strong className="text-white">Nota Admin:</strong> {ord.notes}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <a
                        href={`https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=Assalamualaikum%20admin%20TopupBalz,%20saya%20nak%20semak%20pesanan%20%23${ord.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Tanya Admin via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
