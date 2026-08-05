import React, { useState } from 'react';
import {
  X,
  Zap,
  ShieldCheck,
  QrCode,
  Upload,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Game, GameItem, SystemSettings, CartItem } from '../types';
import { ShoppingCart } from 'lucide-react';
import { TngQrCodeCard } from './TngQrCodeCard';
import { Shield, AlertTriangle } from 'lucide-react';

interface TopupModalProps {
  game: Game | null;
  settings: SystemSettings;
  onClose: () => void;
  onAddToCart?: (cartItem: Omit<CartItem, 'id'>) => void;
  onSubmitOrder: (orderData: {
    gameId: string;
    gameName: string;
    itemId: string;
    itemName: string;
    basePrice: number;
    userId: string;
    serverId?: string;
    customerPhone?: string;
    paymentMethod: string;
    proofImageUrl?: string;
  }) => Promise<{ success: boolean; whatsappUrl?: string; orderId?: string }>;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  game,
  settings,
  onClose,
  onAddToCart,
  onSubmitOrder,
}) => {
  if (!game) return null;

  const [selectedItem, setSelectedItem] = useState<GameItem | null>(
    game.items && game.items.length > 0 ? game.items[0] : null
  );
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState(
    game.serverOptions && game.serverOptions.length > 0 ? game.serverOptions[0] : ''
  );
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tng' | 'fpx' | 'duitnow'>('tng');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [showIdGuide, setShowIdGuide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{
    whatsappUrl: string;
    orderId: string;
  } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [spamError, setSpamError] = useState('');
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  // File handle for proof receipt image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Saiz gambar resit melebihi 10MB. Sila pilih gambar yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyAccountName = () => {
    navigator.clipboard.writeText(settings.tngAccountName);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleAddToCartClick = () => {
    if (!selectedItem) {
      alert('Sila pilih item topup terlebih dahulu.');
      return;
    }
    if (!userId.trim()) {
      alert('Sila masukkan Player/User ID anda.');
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        gameId: game.id,
        gameName: game.name,
        gameLogo: game.logoUrl,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        sellPrice: selectedItem.sellPrice,
        userId: userId.trim(),
        serverId: serverId.trim() || undefined,
        quantity: 1,
      });

      setAddedToCartToast(true);
      setTimeout(() => setAddedToCartToast(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpamError('');

    // 1. Anti-Spam Honeypot check
    if (honeypot.trim() !== '') {
      console.warn('Spam bot trap triggered');
      alert('Pesanan ditolak oleh sistem anti-spam.');
      return;
    }

    // 2. Anti-Spam Rate Limiting check (15 seconds cooldown)
    const lastOrderTime = localStorage.getItem('topupbalz_last_order');
    if (lastOrderTime) {
      const timeDiff = (Date.now() - parseInt(lastOrderTime, 10)) / 1000;
      if (timeDiff < 15) {
        const remaining = Math.ceil(15 - timeDiff);
        setSpamError(`Aktiviti dikesan terlalu pantas (Rate Limit). Sila tunggu ${remaining} saat lagi.`);
        return;
      }
    }

    if (!userId.trim()) {
      alert('Sila masukkan User ID anda terlebih dahulu!');
      return;
    }
    if (!selectedItem) {
      alert('Sila pilih jumlah item/diamond topup!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitOrder({
        gameId: game.id,
        gameName: game.name,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        basePrice: selectedItem.basePrice,
        userId: userId.trim(),
        serverId: serverId.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod:
          paymentMethod === 'tng'
            ? "Touch 'n Go eWallet"
            : paymentMethod === 'fpx'
            ? 'FPX Online Banking'
            : 'DuitNow QR',
        proofImageUrl: proofImage || undefined,
      });

      if (res.success && res.whatsappUrl && res.orderId) {
        localStorage.setItem('topupbalz_last_order', Date.now().toString());
        setOrderComplete({
          whatsappUrl: res.whatsappUrl,
          orderId: res.orderId,
        });
      }
    } catch (err: any) {
      alert('Gagal menghantar pesanan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0D1117] border border-orange-500/30 rounded-3xl shadow-[0_0_50px_rgba(255,140,0,0.3)] overflow-hidden my-auto">
        
        {/* Header Bar Modal */}
        <div className="bg-gradient-to-r from-[#121824] via-[#161D2E] to-[#121824] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={game.logoUrl}
              alt={game.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-orange-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{game.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                  Topup Instant
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kiraan Automatik Harga TopupBalz</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/50 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Success View */}
        {orderComplete ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-slate-900 text-orange-400 border border-orange-500/30">
                PESANAN #{orderComplete.orderId}
              </span>
              <h3 className="text-2xl font-black text-white">Pesanan Anda Berjaya Dihantar!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Sila tekan butang di bawah untuk membuka WhatsApp secara terus dan menghantar resit bukti pembayaran.
              </p>
            </div>

            {/* Telegram OrderBalz Bot Alert Notice */}
            <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-cyan-900/40 border border-cyan-500/50 rounded-2xl max-w-md mx-auto text-left shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-cyan-500/30">
                  🤖 OrderBalz Bot Status
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Telegram Dihantar ✓
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                <strong className="text-cyan-300">Sila tunggu 10 - 20 minit</strong> untuk diamond/kredit dimasukkan ke dalam akaun anda secara automatik.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Game:</span>
                <span className="text-white font-bold">{game.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Produk:</span>
                <span className="text-orange-400 font-bold">{selectedItem?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="text-white font-bold">{userId} {serverId ? `(${serverId})` : ''}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-sans font-black">
                <span className="text-slate-300">Jumlah Akhir:</span>
                <span className="text-orange-400 font-mono">RM {selectedItem?.sellPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={orderComplete.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.8)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Buka WhatsApp & Hantar Pesanan</span>
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Account Info */}
            <div className="bg-[#121824] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    Masukkan Maklumat Akaun Game
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIdGuide(!showIdGuide)}
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Cara Cari User ID</span>
                </button>
              </div>

              {/* ID Guide Popup Accordion */}
              {showIdGuide && (
                <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs text-slate-200 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-orange-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Panduan Carian User ID ({game.name})</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{game.idGuideText}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    User ID <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 12345678"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                {game.serverType === 'zone_id' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Zone ID / Server ID <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 2001"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      className="w-full bg-[#0D1117] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {game.serverType === 'server_list' && game.serverOptions && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pilih Server Game <span className="text-orange-400">*</span>
                    </label>
                    <select
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      className="w-full bg-[#0D1117] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                    >
                      {game.serverOptions.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {game.serverType === 'tag' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tagline / Server <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: #MY1"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      className="w-full bg-[#0D1117] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Choose Topup Package */}
            <div className="bg-[#121824] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    Pilih Pakej Diamond / Item
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Sistem Harga TopupBalz
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {game.items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-orange-500/20 to-amber-500/10 border-orange-500 shadow-[0_0_15px_rgba(255,140,0,0.3)] ring-1 ring-orange-500/50'
                          : 'bg-[#0D1117] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {item.bonusTag && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-500 text-slate-950 uppercase tracking-tight">
                          {item.bonusTag}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-white">
                          <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                          <span className="line-clamp-1">{item.name}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-black font-mono text-orange-400 block">
                          RM {item.sellPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-[#121824] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="font-extrabold text-white text-sm sm:text-base">
                  Pilih Kaedah Pembayaran
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Touch n Go option */}
                <div
                  onClick={() => setPaymentMethod('tng')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'tng'
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-[0_0_15px_rgba(255,140,0,0.2)]'
                      : 'bg-[#0D1117] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1">
                      <span>Touch 'n Go QR</span>
                      <span className="text-[9px] bg-orange-500 text-slate-950 px-1 rounded uppercase font-bold">PANTAS</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Imbas QR Code eWallet</p>
                  </div>
                </div>

                {/* FPX option */}
                <div
                  onClick={() => setPaymentMethod('fpx')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'fpx'
                      ? 'bg-orange-500/15 border-orange-500 text-white'
                      : 'bg-[#0D1117] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
                    FPX
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Online Banking</div>
                    <p className="text-[10px] text-slate-400">Maybank, CIMB, Bank Islam</p>
                  </div>
                </div>

                {/* DuitNow option */}
                <div
                  onClick={() => setPaymentMethod('duitnow')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'duitnow'
                      ? 'bg-orange-500/15 border-orange-500 text-white'
                      : 'bg-[#0D1117] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">DuitNow QR</div>
                    <p className="text-[10px] text-slate-400">Semua E-Wallet & Bank</p>
                  </div>
                </div>
              </div>

              {/* Touch 'n Go / DuitNow QR Display Box */}
              {(paymentMethod === 'tng' || paymentMethod === 'duitnow') && (
                <div className="p-4 bg-[#0D1117] border border-orange-500/40 rounded-2xl space-y-4 animate-fadeIn">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <TngQrCodeCard
                      accountName={settings.tngAccountName}
                      customQrImageUrl={settings.tngQrImageUrl}
                    />

                    <div className="text-center space-y-2 pt-1 max-w-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-slate-300">Nama Pemegang:</span>
                        <span className="text-xs font-mono font-bold text-orange-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                          {settings.tngAccountName}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccountName}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Salin Nama Akaun"
                        >
                          {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bayar RM <strong className="text-orange-400 font-extrabold">{selectedItem?.sellPrice.toFixed(2)}</strong> menggunakan Touch 'n Go eWallet / Mana-mana App Bank DuitNow.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Upload Receipt / Transfer Proof */}
            <div className="bg-[#121824] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="font-extrabold text-white text-sm sm:text-base">
                  Muat Naik Bukti Transfer (Resit Bayaran)
                </h3>
              </div>

              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-2xl p-4 text-center bg-[#0D1117] transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofImage ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={proofImage}
                        alt="Resit Transfer"
                        className="w-16 h-16 object-cover rounded-xl border border-orange-500/50"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resit Berjaya Dimuat Naik</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Tekan untuk tukar gambar resit lain</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          Tekan atau Tarik Gambar Resit Di Sini
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Format PNG, JPG atau Screenshot (Maks 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombor Telefon WhatsApp Anda (Pilihan untuk Notifikasi)
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 0123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Anti-Spam Honeypot Trap (Hidden from users) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_address_trap"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Added to Cart Notification Toast */}
            {addedToCartToast && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Item dimasukkan ke Troli Pembelian!</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                  Troli Updated
                </span>
              </div>
            )}

            {/* Spam Rate Limit Warning Alert */}
            {spamError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{spamError}</span>
              </div>
            )}

            {/* Price Summary & Action Buttons Bar */}
            <div className="bg-[#161D2E] p-4 sm:p-5 rounded-2xl border border-orange-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Harga Produk ({selectedItem?.name}):</span>
                <span className="font-mono text-white">RM {selectedItem?.sellPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Jumlah Bayaran Akhir</span>
                  <span className="text-2xl font-black text-orange-400 font-mono">
                    RM {selectedItem?.sellPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={handleAddToCartClick}
                      className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold text-xs uppercase tracking-wide border border-orange-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Tambah Troli</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(255,140,0,0.5)] hover:shadow-[0_0_35px_rgba(255,140,0,0.8)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sedang Memproses...</span>
                    ) : (
                      <>
                        <span>Topup Sekarang</span>
                        <MessageCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
