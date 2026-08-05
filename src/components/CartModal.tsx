import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, MessageCircle, CheckCircle2, ShieldCheck, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { CartItem, SystemSettings } from '../types';
import { TngQrCodeCard } from './TngQrCodeCard';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: CartItem[];
  items?: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemUserId?: (id: string, userId: string, serverId?: string) => void;
  onUpdateUserId?: (id: string, userId: string, serverId?: string) => void;
  onClearCart: () => void;
  settings: SystemSettings;
  onSubmitCartOrders: (orderPayload: {
    items: CartItem[];
    paymentMethod: string;
    customerPhone?: string;
    proofImageUrl?: string;
  }) => Promise<{ success: boolean; whatsappUrl?: string }>;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemUserId,
  onUpdateUserId,
  onClearCart,
  settings,
  onSubmitCartOrders,
}) => {
  const activeCart = (cart && cart.length > 0 ? cart : items) || [];
  const handleUpdateUserId = onUpdateItemUserId || onUpdateUserId || (() => {});

  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tng' | 'fpx' | 'duitnow'>('tng');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleteUrl, setOrderCompleteUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = activeCart.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0);
  const grandTotal = activeCart.length > 0 ? subtotal : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Saiz gambar resit melebihi 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCart.length === 0) return;

    // Check if all items have User ID filled
    const missingUserIdItem = activeCart.find((i) => !i.userId.trim());
    if (missingUserIdItem) {
      alert(`Sila masukkan Player/User ID untuk item (${missingUserIdItem.gameName} - ${missingUserIdItem.itemName}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitCartOrders({
        items: activeCart,
        paymentMethod:
          paymentMethod === 'tng'
            ? "Touch 'n Go eWallet"
            : paymentMethod === 'fpx'
            ? 'FPX Online Banking'
            : 'DuitNow QR',
        customerPhone: customerPhone.trim() || undefined,
        proofImageUrl: proofImage || undefined,
      });

      if (res.success && res.whatsappUrl) {
        setOrderCompleteUrl(res.whatsappUrl);
        onClearCart();
      }
    } catch (err: any) {
      alert('Gagal membuat pesanan trolley: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-orange-500/40 rounded-3xl shadow-[0_0_50px_rgba(255,140,0,0.25)] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#121824] via-[#161D2E] to-[#121824] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/30">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Troli Pembelian Topup</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500 text-slate-950">
                  {activeCart.reduce((a, b) => a + b.quantity, 0)} Item
                </span>
              </h2>
              <p className="text-xs text-slate-400">Beli pelbagai topup game sekaligus dalam satu transaksi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleteUrl ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Pesanan Troli Berjaya Dibuat!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Sila tekan butang di bawah untuk terus ke WhatsApp Admin bagi mengesahkan pembelian troli anda.
              </p>
            </div>
            <a
              href={orderCompleteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all uppercase tracking-wide"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Hantar Pesanan ke WhatsApp Admin</span>
            </a>
          </div>
        ) : activeCart.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Troli pembelian anda masih kosong.</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Pilih Game & Topup Sekarang
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Cart Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Senarai Pakej Dalam Troli</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-rose-400 hover:underline cursor-pointer text-[11px]"
                >
                  Kosongkan Troli
                </button>
              </div>

              {activeCart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#080B10] border border-slate-800 space-y-3 hover:border-orange-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.gameLogo && (
                        <img
                          src={item.gameLogo}
                          alt={item.gameName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{item.gameName}</h4>
                        <p className="text-xs text-orange-400 font-bold">{item.itemName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#121824] border border-slate-700 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-2">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-mono font-black text-amber-400">
                        RM {(item.sellPrice * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Buang item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player User ID input */}
                  <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        User ID / Player ID ({item.gameName}) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan ID Akaun Game"
                        value={item.userId}
                        onChange={(e) => handleUpdateUserId(item.id, e.target.value, item.serverId)}
                        className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        Server / Zone ID (Jika Ada)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 1234 / Asia"
                        value={item.serverId || ''}
                        onChange={(e) => handleUpdateUserId(item.id, item.userId, e.target.value)}
                        className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-200">
                Pilih Kaedah Pembayaran Pukal
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tng')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'tng'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-[#080B10] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-bold">Touch 'n Go</span>
                  <span className="text-[10px] text-blue-400 font-mono">eWallet / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('fpx')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'fpx'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white'
                      : 'bg-[#080B10] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-bold">FPX Bank</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Online Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('duitnow')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'duitnow'
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-[#080B10] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-bold">DuitNow</span>
                  <span className="text-[10px] text-rose-400 font-mono">Instant QR</span>
                </button>
              </div>

              {/* Display QR Card if TNG/Duitnow */}
              {(paymentMethod === 'tng' || paymentMethod === 'duitnow') && (
                <TngQrCodeCard settings={settings} amount={grandTotal} />
              )}

              {/* Upload Proof Receipt */}
              <div className="p-3 bg-[#080B10] border border-slate-800 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Muat Naik Resit Pembayaran Pukal (Pilihan)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombor Telefon WhatsApp Anda
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 0123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Total Price & Checkout Action Bar */}
            <div className="p-4 bg-[#161D2E] rounded-2xl border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Jumlah Harga Produk ({cart.length} Jenis):</span>
                <span className="font-mono text-white">RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Jumlah Keseluruhan Troli</span>
                  <span className="text-2xl font-black text-orange-400 font-mono">
                    RM {grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(255,140,0,0.5)] hover:shadow-[0_0_35px_rgba(255,140,0,0.8)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span>Bayar Semua ({cart.length}) via WhatsApp</span>
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
