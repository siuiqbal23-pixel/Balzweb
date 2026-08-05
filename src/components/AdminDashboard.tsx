import React, { useState } from 'react';
import {
  X,
  Lock,
  Gamepad2,
  ShoppingBag,
  Sliders,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MessageCircle,
  Save,
  RefreshCw,
  HelpCircle,
  QrCode,
  DollarSign,
  Send,
  Zap,
  Upload,
  Image as ImageIcon,
  Users,
  Activity,
  UserCheck,
  Search,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  Mail,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Game, GameItem, Order, PromoBanner, SystemSettings, UserProfile, UserActivityLog } from '../types';

interface AdminDashboardProps {
  games: Game[];
  orders: Order[];
  banners: PromoBanner[];
  settings: SystemSettings;
  users?: UserProfile[];
  activityLogs?: UserActivityLog[];
  onClose: () => void;
  onSaveGame: (game: Game) => Promise<void>;
  onDeleteGame: (id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: Order['status'], notes?: string) => Promise<void>;
  onSaveBanner: (banner: PromoBanner) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
  onSaveSettings: (settings: SystemSettings) => Promise<void>;
  onOpenGmailModal?: (recipient?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  games,
  orders,
  banners,
  settings,
  users = [],
  activityLogs = [],
  onClose,
  onSaveGame,
  onDeleteGame,
  onUpdateOrderStatus,
  onSaveBanner,
  onDeleteBanner,
  onSaveSettings,
  onOpenGmailModal,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'orders' | 'banners' | 'settings' | 'users' | 'chat'>('games');
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Live Chat Admin States
  const [chatSessions, setChatSessions] = useState<Array<{
    sessionId: string;
    senderName: string;
    lastMessage: string;
    lastTime: string;
    unreadCount: number;
    messages: Array<{
      id: string;
      sessionId: string;
      sender: 'user' | 'admin';
      senderName: string;
      message: string;
      timestamp: string;
      read: boolean;
    }>;
  }>>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchAdminChats = async () => {
    try {
      const res = await fetch('/api/chat/messages?admin=true');
      const data = await res.json();
      if (data && Array.isArray(data.sessions)) {
        setChatSessions(data.sessions);
      }
    } catch (e) {
      console.error('Error fetching admin chats:', e);
    }
  };

  React.useEffect(() => {
    fetchAdminChats();
    const interval = setInterval(fetchAdminChats, 2500);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSessionId || !adminReplyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          sender: 'admin',
          senderName: 'Admin TopupBalz 🟢 24/7',
          message: adminReplyText.trim(),
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setAdminReplyText('');
        fetchAdminChats();
      }
    } catch (err) {
      console.error('Error sending admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Edit states
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...settings });
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '030926') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // If locked, show PIN prompt
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-[#0D1117] border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-[0_0_50px_rgba(255,140,0,0.3)]">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Dashboard Admin TopupBalz</h2>
            <p className="text-xs text-slate-400 mt-1">Masukkan Katalaluan Akses Admin</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              placeholder="Masukkan Katalaluan Admin..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-[#121824] border border-slate-700 text-center font-mono text-xl text-white tracking-widest py-3 rounded-xl focus:outline-none focus:border-orange-500"
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-bold">Katalaluan Salah! Sila semak semula.</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer hover:from-orange-400 hover:to-amber-400"
              >
                Log Masuk Admin
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Batal
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-500">
            *Tekan Lelogin terus tanpa mengisi PIN untuk akses demo.
          </p>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter(
    (o) => orderStatusFilter === 'all' || o.status === orderStatusFilter
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#0D1117] border border-orange-500/30 rounded-3xl shadow-[0_0_60px_rgba(255,140,0,0.25)] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#121824] p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 relative">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white truncate">Dashboard Admin TopupBalz</h2>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                Sistem Pengurusan TopupBalz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGmailModal && (
              <button
                onClick={() => onOpenGmailModal()}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Hantar Resit / Notifikasi via Gmail API"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Gmail API</span>
              </button>
            )}

            {/* Prominent Three Dots Menu Button (⋮ Tetapan) */}
            <div className="relative">
              <button
                onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                  showThreeDotsMenu
                    ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                    : 'bg-slate-900 hover:bg-slate-850 text-orange-400 border-orange-500/40'
                }`}
                title="Pilihan Menu Tetapan Admin"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="hidden sm:inline">Pilih Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showThreeDotsMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Three Dots Popup Menu */}
              {showThreeDotsMenu && (
                <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 bg-[#121824] border-2 border-orange-500/60 rounded-2xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-1.5 animate-fadeIn">
                  <div className="p-2 border-b border-slate-800 flex items-center justify-between">
                    <p className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MoreVertical className="w-4 h-4" />
                      <span>Menu Tetapan & View Admin</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Pilih Tab</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('games');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'games'
                        ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-sm">1. Senarai Game & Harga</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-mono">
                      {games.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm">2. Pesanan Pelanggan</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-mono">
                      {orders.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('banners');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'banners'
                        ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4" />
                      <span className="text-sm">3. Banner & Promosi</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-mono">
                      {banners.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">4. Tetapan Owner & Notifikasi</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                        : 'text-cyan-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">5. Pengguna & Log Aktiviti</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-mono">
                      {users.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setShowThreeDotsMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'chat'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'text-emerald-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">6. Chat Live Pelanggan 24/7</span>
                    </div>
                    {chatSessions.reduce((acc, s) => acc + s.unreadCount, 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] animate-bounce">
                        {chatSessions.reduce((acc, s) => acc + s.unreadCount, 0)} NEW
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Navigation Tabs (Larger Text & Clean Horizontal Layout) */}
        <div className="bg-[#090B10] px-4 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'games'
                ? 'bg-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(255,140,0,0.4)]'
                : 'text-slate-300 hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Senarai Game ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(255,140,0,0.4)]'
                : 'text-slate-300 hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesanan ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-emerald-400 hover:bg-slate-800/80 bg-slate-900/60 border border-emerald-500/40'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Chat Live 24/7</span>
            {chatSessions.reduce((acc, s) => acc + s.unreadCount, 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px]">
                {chatSessions.reduce((acc, s) => acc + s.unreadCount, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'banners'
                ? 'bg-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(255,140,0,0.4)]'
                : 'text-slate-300 hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Banner ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(255,140,0,0.4)]'
                : 'text-slate-300 hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tetapan Owner</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-cyan-400 hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengguna ({users.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: GAMES & PRICING */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              
              {/* Formula Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/40 text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-orange-400 block uppercase font-mono">
                    ⚙️ PENGURUSAN HARGA PRODUK
                  </span>
                  <p className="text-xs text-slate-300">
                    Harga jualan adalah mengikut harga yang ditetapkan bagi setiap pakej item tanpa sebarang caj tambahan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingGame({
                      id: 'g_' + Date.now(),
                      name: '',
                      slug: '',
                      category: 'mobile',
                      serverType: 'none',
                      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                      idGuideText: 'Sila masukkan User ID anda.',
                      items: [
                        { id: 'item_1', name: '86 Diamonds', basePrice: 5.00, sellPrice: 6.00 },
                      ],
                    })
                  }
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Game Baru</span>
                </button>
              </div>

              {/* Game Editor Modal Popup */}
              {editingGame && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
                  <div className="relative w-full max-w-2xl bg-[#0D1117] border border-orange-500/50 rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_0_60px_rgba(255,140,0,0.35)] my-auto max-h-[90vh] flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl">
                          <Edit2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base">
                            {editingGame.id ? `Edit Game: ${editingGame.name || 'Game'}` : 'Tambah Game Baru'}
                          </h3>
                          <p className="text-[11px] text-slate-400">Kemaskini maklumat game, pakej topup, dan penetapan harga</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingGame(null)}
                        className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form Body - Scrollable */}
                    <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Nama Game</label>
                          <input
                            type="text"
                            value={editingGame.name}
                            onChange={(e) =>
                              setEditingGame({
                                ...editingGame,
                                name: e.target.value,
                                slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                              })
                            }
                            placeholder="Contoh: Mobile Legends"
                            className="w-full bg-[#121824] border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Kategori</label>
                          <select
                            value={editingGame.category}
                            onChange={(e) =>
                              setEditingGame({
                                ...editingGame,
                                category: e.target.value as any,
                              })
                            }
                            className="w-full bg-[#121824] border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-orange-500"
                          >
                            <option value="mobile">Mobile Game</option>
                            <option value="pc">PC Game</option>
                            <option value="voucher">Voucher / Wallet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Jenis Server/Zone ID</label>
                          <select
                            value={editingGame.serverType}
                            onChange={(e) =>
                              setEditingGame({
                                ...editingGame,
                                serverType: e.target.value as any,
                              })
                            }
                            className="w-full bg-[#121824] border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-orange-500"
                          >
                            <option value="none">Tiada Server (Hanya User ID)</option>
                            <option value="zone_id">Zone ID / Server ID (MLBB)</option>
                            <option value="server_list">Senarai Server (Genshin)</option>
                            <option value="tag">Tagline (Valorant / Riot)</option>
                          </select>
                        </div>

                        {/* Gallery Upload & Preset Picker Box */}
                        <div className="col-span-1 sm:col-span-2 space-y-2 p-3 bg-[#121824] border border-slate-800 rounded-2xl">
                          <label className="block text-slate-300 font-bold text-xs">Logo / Cover Game (Pilih Dari Galeri)</label>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Image Preview Box */}
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 relative flex items-center justify-center">
                              {editingGame.logoUrl ? (
                                <img
                                  src={editingGame.logoUrl}
                                  alt={editingGame.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-600" />
                              )}
                            </div>

                            {/* Gallery & Upload Controls */}
                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Gallery Upload Button */}
                                <label className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all">
                                  <Upload className="w-4 h-4" />
                                  <span>Pilih Dari Galeri Telefon / Galeri Foto</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          if (typeof reader.result === 'string') {
                                            setEditingGame({ ...editingGame, logoUrl: reader.result });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>

                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                                  ✓ Sedia Simpan
                                </span>
                              </div>

                              {/* Preset Gallery Selector */}
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Atau Pilih Dari Preset Logo Game:</span>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                  {[
                                    { name: 'Mobile Legends', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Free Fire', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'PUBG Mobile', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Genshin Impact', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Honor of Kings', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Roblox', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Valorant', url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Sports/FC', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80' },
                                    { name: 'Voucher', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80' },
                                  ].map((preset, pIdx) => (
                                    <button
                                      key={pIdx}
                                      type="button"
                                      onClick={() => setEditingGame({ ...editingGame, logoUrl: preset.url })}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 cursor-pointer transition-all ${
                                        editingGame.logoUrl === preset.url
                                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-extrabold'
                                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-orange-500/50'
                                      }`}
                                    >
                                      {preset.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items list manager */}
                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="font-extrabold text-white text-xs">Senarai Pakej & Harga</h4>
                            <p className="text-[10px] text-slate-400">Taipkan harga terus mengikut kehendak anda.</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingGame({
                                  ...editingGame,
                                  items: [
                                    ...editingGame.items,
                                    {
                                      id: 'item_' + Date.now(),
                                      name: 'Pakej Baru',
                                      basePrice: 10.00,
                                      sellPrice: 10.00,
                                    },
                                  ],
                                })
                              }
                              className="px-3 py-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Item</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                          {editingGame.items.map((item, idx) => (
                            <div
                              key={item.id}
                              className="p-3 bg-[#121824] border border-slate-800 hover:border-slate-700 rounded-xl grid grid-cols-12 gap-2 items-center text-xs"
                            >
                              <div className="col-span-12 sm:col-span-5">
                                <label className="text-[9px] text-slate-400 block font-mono mb-0.5">Nama Item / Diamond</label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => {
                                    const newItems = [...editingGame.items];
                                    newItems[idx].name = e.target.value;
                                    setEditingGame({ ...editingGame, items: newItems });
                                  }}
                                  className="w-full bg-[#0D1117] border border-slate-700 rounded-lg p-2 text-white font-bold"
                                  placeholder="Nama Pakej"
                                />
                              </div>

                              <div className="col-span-5 sm:col-span-3">
                                <label className="text-[9px] text-slate-400 block font-mono mb-0.5">
                                  Harga Asal (RM)
                                </label>
                                <input
                                  type="number"
                                  step="0.10"
                                  value={item.basePrice}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const newItems = [...editingGame.items];
                                    newItems[idx].basePrice = val;
                                    newItems[idx].sellPrice = val;
                                    setEditingGame({ ...editingGame, items: newItems });
                                  }}
                                  className="w-full bg-[#0D1117] border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                                />
                              </div>

                              <div className="col-span-5 sm:col-span-3">
                                <label className="text-[9px] text-orange-400 block font-mono font-bold mb-0.5">
                                  Harga Jual (RM)
                                </label>
                                <input
                                  type="number"
                                  step="0.10"
                                  value={item.sellPrice}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const newItems = [...editingGame.items];
                                    newItems[idx].sellPrice = val;
                                    setEditingGame({ ...editingGame, items: newItems });
                                  }}
                                  className="w-full bg-[#0D1117] border border-orange-500/50 rounded-lg p-2 text-orange-400 font-mono font-black"
                                />
                              </div>

                              <div className="col-span-2 sm:col-span-1 text-right flex items-center justify-end pt-3 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = editingGame.items.filter((_, i) => i !== idx);
                                    setEditingGame({ ...editingGame, items: newItems });
                                  }}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                                  title="Padam Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingGame(null)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await onSaveGame(editingGame);
                          setEditingGame(null);
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer"
                      >
                        Simpan Game & Harga
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Games Grid - Dua Kotak Dua Kotak (2-Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {games.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setEditingGame(JSON.parse(JSON.stringify(g)))}
                    className="group relative p-4 sm:p-5 bg-gradient-to-b from-[#121824] to-[#0B0E14] border border-slate-800 hover:border-orange-500/80 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,140,0,0.25)] flex flex-col justify-between space-y-4 cursor-pointer"
                  >
                    {/* Header Kotak Game */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-orange-500/40 group-hover:border-orange-400 shrink-0 shadow-md">
                        <img
                          src={g.logoUrl}
                          alt={g.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold font-mono text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-md">
                            {g.category === 'mobile' ? '🎮 Mobile Game' : g.category === 'pc' ? '💻 PC Game' : '🎟️ Voucher'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                            {g.serverType === 'zone_id' ? 'Zone ID' : g.serverType === 'server_list' ? 'Server List' : g.serverType === 'tag' ? 'Tagline' : 'User ID'}
                          </span>
                        </div>

                        <h4 className="font-black text-white text-base sm:text-lg mt-1 truncate group-hover:text-orange-400 transition-colors">
                          {g.name}
                        </h4>

                        <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                          ⚡ {g.items.length} Pakej Item Disediakan
                        </p>
                      </div>
                    </div>

                    {/* Senarai Harga Ringkas */}
                    <div className="space-y-1.5 text-xs bg-[#080B10] p-3 rounded-2xl border border-slate-800/80 font-mono">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between border-b border-slate-800 pb-1">
                        <span>Ringkasan Pakej (Wholesale → Jual)</span>
                        <span className="text-orange-400 font-bold">Harga Jualan</span>
                      </div>
                      {g.items.slice(0, 3).map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-[11px] text-slate-300">
                          <span className="truncate max-w-[150px] font-medium">{it.name}</span>
                          <span>
                            <span className="text-slate-400 line-through mr-1">RM {it.basePrice.toFixed(2)}</span>
                            <strong className="text-orange-400 font-black">RM {it.sellPrice.toFixed(2)}</strong>
                          </span>
                        </div>
                      ))}
                      {g.items.length > 3 && (
                        <span className="text-[10px] text-slate-500 italic block text-right pt-0.5">
                          +{g.items.length - 3} lagi pakej...
                        </span>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGame(JSON.parse(JSON.stringify(g)));
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Tekan Untuk Edit Game & Pakej</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Adakah anda pasti mahu memadam game "${g.name}"?`)) {
                            onDeleteGame(g.id);
                          }
                        }}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
                        title="Padam Game"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121824] p-3 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-white">Tapis Pesanan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                          orderStatusFilter === st
                            ? 'bg-orange-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'all' ? 'Semua' : st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Orders Table / Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-[#121824] rounded-2xl border border-slate-800">
                    Tiada pesanan dijumpai untuk status ini.
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-[#121824] border border-slate-800 rounded-2xl space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-orange-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-orange-500/30">
                            #{ord.id}
                          </span>
                          <span className="text-xs font-bold text-white">{ord.gameName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>

                        {/* Status Updater */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(ord.id, e.target.value as Order['status'])
                            }
                            className="bg-[#0D1117] border border-slate-700 text-xs font-bold rounded-lg px-2.5 py-1 text-white focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Diproses</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>

                          {ord.proofImageUrl && (
                            <button
                              onClick={() => setViewingProof(ord.proofImageUrl!)}
                              className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-lg hover:bg-blue-500/30 text-xs font-bold flex items-center gap-1"
                              title="Lihat Resit Transfer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Resit</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Produk:</span>
                          <span className="text-white font-bold">{ord.itemName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">User ID & Server:</span>
                          <span className="text-amber-300 font-bold">{ord.userId} {ord.serverId ? `(${ord.serverId})` : ''}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Harga Jual:</span>
                          <span className="text-orange-400 font-bold">RM {ord.sellPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bayaran:</span>
                          <span className="text-slate-300">{ord.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <a
                          href={`https://wa.me/${localSettings.ownerWhatsApp.replace(/\D/g, '')}?text=Hai%20pelanggan,%20pesanan%20TopupBalz%20%23${ord.id}%20(${ord.gameName})%20anda%20kini%20status:%20${ord.status.toUpperCase()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Mesej Pembeli di WhatsApp</span>
                        </a>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PROMO BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Pengurusan Slaid Banner Promosi Homepage</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Banner akan bertukar secara automatik di skrin utama (Auto Slider). Anda boleh tukar gambar banner dengan memilih foto dari galeri telefon/komputer.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingBanner({
                      id: 'b_' + Date.now(),
                      title: 'Promosi Hebat Balz',
                      subtitle: 'Nikmati diskaun topup khas hari ini!',
                      badge: 'PROMO',
                      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
                      isActive: true,
                    })
                  }
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Banner Baru</span>
                </button>
              </div>

              {editingBanner && (
                <div className="p-5 bg-[#121824] border-2 border-orange-500/50 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(255,140,0,0.15)] animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>{editingBanner.id ? 'Sunting Banner Promosi' : 'Tambah Banner Promosi Baru'}</span>
                    </span>
                    <button
                      onClick={() => setEditingBanner(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Banner Image Preview Box */}
                  <div className="p-3 bg-[#0D1117] border border-slate-800 rounded-xl space-y-2">
                    <label className="text-slate-300 font-bold text-xs block">Pratonton Gambar Banner (Live Preview):</label>
                    <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center">
                      {editingBanner.imageUrl ? (
                        <img
                          src={editingBanner.imageUrl}
                          alt="Banner Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-slate-500 text-xs">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span>Tiada Gambar Dipilih</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-orange-500 text-slate-950 font-black text-[10px] uppercase rounded-full shadow">
                        {editingBanner.badge || 'PROMO'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Tajuk Banner</label>
                      <input
                        type="text"
                        value={editingBanner.title}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, title: e.target.value })
                        }
                        className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Penerangan Subtitle</label>
                      <input
                        type="text"
                        value={editingBanner.subtitle}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                        }
                        className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Lencana Promo (Badge Label)</label>
                      <input
                        type="text"
                        value={editingBanner.badge}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, badge: e.target.value })
                        }
                        placeholder="cth: SPECIAL, HOT, DISCOUNT 20%"
                        className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Teks Diskaun (Pilihan)</label>
                      <input
                        type="text"
                        value={editingBanner.discountText || ''}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, discountText: e.target.value })
                        }
                        placeholder="cth: REBAT RM5"
                        className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* GALLERY IMAGE PICKER & URL INPUT */}
                  <div className="p-4 bg-[#0D1117] border border-orange-500/40 rounded-xl space-y-3">
                    <label className="text-xs font-black text-white uppercase tracking-wider block">
                      📁 Pilih Gambar Dari Galeri Device / Muat Naik Gambar Baru:
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] transition-all">
                        <Upload className="w-4 h-4 text-slate-950" />
                        <span>Pilih Foto Dari Galeri Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setEditingBanner({
                                    ...editingBanner,
                                    imageUrl: reader.result,
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">Format disokong: PNG, JPG, WEBP, GIF</span>
                    </div>

                    {/* Presets Gallery Quick Buttons */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 block">Atau Pilih Gambar Preset Templat Game:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Mobile Legends', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'PUBG Mobile', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Free Fire', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Genshin Impact', url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Roblox / General', url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingBanner({ ...editingBanner, imageUrl: preset.url })}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-orange-500 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            📷 {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual URL Input */}
                    <div className="pt-2 border-t border-slate-800">
                      <label className="text-[11px] text-slate-400 block mb-1 font-mono">Atau Pautan URL Gambar Direct:</label>
                      <input
                        type="text"
                        value={editingBanner.imageUrl}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, imageUrl: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full bg-[#121824] border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingBanner(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        await onSaveBanner(editingBanner);
                        setEditingBanner(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer"
                    >
                      Simpan Banner ✓
                    </button>
                  </div>
                </div>
              )}

              {/* BANNERS LIST GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((bn) => (
                  <div
                    key={bn.id}
                    className="p-3.5 bg-[#121824] border border-slate-800 hover:border-slate-700 rounded-2xl flex gap-3.5 items-center justify-between shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-28 h-18 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                        <img
                          src={bn.imageUrl}
                          alt={bn.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500 text-slate-950 font-black rounded text-[8px] uppercase">
                          {bn.badge}
                        </span>
                      </div>

                      <div className="min-w-0 text-xs space-y-1">
                        <h4 className="font-extrabold text-white truncate text-sm">{bn.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{bn.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditingBanner({ ...bn })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                        title="Tukar Gambar / Sunting Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sunting</span>
                      </button>
                      <button
                        onClick={() => onDeleteBanner(bn.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        title="Padam Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-5 bg-[#121824] border border-slate-800 rounded-2xl space-y-4 text-xs">
                <h3 className="font-black text-white text-base">Tetapan Owner & Notifikasi</h3>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Nombor Telefon WhatsApp Owner (Order Direct)
                  </label>
                  <input
                    type="text"
                    value={localSettings.ownerWhatsApp}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, ownerWhatsApp: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    placeholder="e.g. 601112345678"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Nama Pemegang Akaun Touch 'n Go eWallet
                  </label>
                  <input
                    type="text"
                    value={localSettings.tngAccountName}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, tngAccountName: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                {/* Touch 'n Go / DuitNow QR Image Gallery Upload */}
                <div className="p-4 bg-[#0D1117] border border-blue-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-white font-black text-xs uppercase tracking-wide">
                      Gambar QR Code Bayaran (Touch 'n Go / DuitNow)
                    </label>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] rounded-md border border-emerald-500/30">
                      ✓ Papar Online 24/7
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* QR Image Preview Box */}
                    <div className="w-28 h-28 bg-white p-2 rounded-2xl border-2 border-blue-500 shadow-md flex items-center justify-center shrink-0 overflow-hidden relative group">
                      {localSettings.tngQrImageUrl ? (
                        <img
                          src={localSettings.tngQrImageUrl}
                          alt="QR Code Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1 w-full text-xs">
                      {/* Upload Button */}
                      <label className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] transition-all">
                        <Upload className="w-4 h-4 text-cyan-300" />
                        <span>Pilih Gambar QR Dari Galeri Telefon</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setLocalSettings({
                                    ...localSettings,
                                    tngQrImageUrl: reader.result,
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <p className="text-[11px] text-slate-400">
                        Sila muat naik foto QR Code Touch 'n Go / DuitNow anda dari galeri. Selepas simpan, gambar ini akan automatik terpapar secara online kepada semua pelanggan.
                      </p>

                      <div className="pt-1">
                        <label className="text-[10px] text-slate-400 block mb-1 font-mono">Atau Tampal URL Gambar QR (Pilihan):</label>
                        <input
                          type="text"
                          value={localSettings.tngQrImageUrl}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, tngQrImageUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full bg-[#121824] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Telegram Bot Token (Pilihan untuk Alert Notifikasi Instant)
                  </label>
                  <input
                    type="text"
                    value={localSettings.telegramBotToken}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, telegramBotToken: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrs..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Telegram Chat ID Owner
                  </label>
                  <input
                    type="text"
                    value={localSettings.telegramChatId}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, telegramChatId: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    placeholder="e.g. 987654321"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={async () => {
                      await onSaveSettings(localSettings);
                      alert('Tetapan berjaya disimpan!');
                    }}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USERS & LIVE ACTIVITY LOGS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#121824] border border-cyan-500/30 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jumlah Pengguna Registered</p>
                    <p className="text-2xl font-black text-white">{users.length}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#121824] border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Akaun Username Unik</p>
                    <p className="text-2xl font-black text-emerald-400">{users.length}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#121824] border border-orange-500/30 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/30">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Log Aktiviti System</p>
                    <p className="text-2xl font-black text-orange-400">{activityLogs.length}</p>
                  </div>
                </div>
              </div>

              {/* Registered Users Table */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span>Senarai Akaun Username Terdaftar</span>
                    </h3>
                    <p className="text-xs text-slate-400">Setiap pengguna yang mendaftar atau log masuk menggunakan username unik dipaparkan di sini.</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari username atau ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-[#0D1117] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {users.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada pengguna yang mendaftar.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-3">Username Pengguna</th>
                          <th className="py-3 px-3">ID Akaun</th>
                          <th className="py-3 px-3">No Phone</th>
                          <th className="py-3 px-3">Tarikh Daftar & Log Aktif</th>
                          <th className="py-3 px-3">Pesanan</th>
                          <th className="py-3 px-3 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {users
                          .filter(
                            (u) =>
                              !userSearch ||
                              u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                              u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (u.phoneNumber && u.phoneNumber.includes(userSearch))
                          )
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full object-cover border border-cyan-400/50"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`;
                                    }}
                                  />
                                  <div>
                                    <p className="font-mono font-black text-white text-sm text-amber-400 leading-tight">
                                      {u.name.startsWith('@') ? u.name : `@${u.name}`}
                                    </p>
                                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Username Verified
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 font-mono text-slate-300">
                                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                                  {u.id}
                                </span>
                              </td>

                              <td className="py-3 px-3 font-mono text-slate-300">
                                {u.phoneNumber ? u.phoneNumber : <span className="text-slate-500 italic">Belum isi</span>}
                              </td>

                              <td className="py-3 px-3 text-slate-300 text-[11px]">
                                <div>Daftar: {new Date(u.createdAt).toLocaleDateString('ms-MY')}</div>
                                <div className="text-cyan-400 text-[10px]">Aktif: {new Date(u.lastLoginAt).toLocaleTimeString('ms-MY')}</div>
                              </td>

                              <td className="py-3 px-3">
                                <span className="font-bold text-orange-400">{u.totalOrders || 0} Tx</span>
                                <span className="text-slate-400 text-[10px] block">RM {(u.totalSpent || 0).toFixed(2)}</span>
                              </td>

                              <td className="py-3 px-3 text-right">
                                {u.phoneNumber && (
                                  <a
                                    href={`https://wa.me/60${u.phoneNumber.replace(/\D/g, '').replace(/^0/, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                  >
                                    <span>WhatsApp</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Live Activity Logs */}
              <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-white">Log Aktiviti & Login Live</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{activityLogs.length} Rekod</span>
                </div>

                {activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Tiada rekod aktiviti.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-[#0D1117] border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`p-1.5 rounded-lg text-[10px] font-black uppercase ${
                              log.type === 'register'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : log.type === 'login'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}
                          >
                            {log.type === 'register' ? 'NEW USER' : log.type === 'login' ? 'LOGIN' : 'LOG'}
                          </span>
                          <div>
                            <p className="font-mono font-black text-amber-400">
                              {log.userName.startsWith('@') ? log.userName : `@${log.userName}`}
                            </p>
                            <p className="text-[11px] text-slate-300">{log.details}</p>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('ms-MY')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REAL-TIME LIVE CHAT ADMIN */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/40 text-xs text-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-emerald-400 uppercase font-mono block">
                    💬 LIVE CHAT ADMIN 24/7 (SAMA SEPERTI WHATSAPP)
                  </span>
                  <p className="text-slate-300">
                    Balas perbualan pelanggan secara langsung secara real-time. Notifikasi pesanan baharu akan dikemaskini automatik.
                  </p>
                </div>
                <button
                  onClick={fetchAdminChats}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-emerald-400 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Chat</span>
                </button>
              </div>

              {/* Chat Interface Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-[550px] bg-[#07090D] rounded-2xl border border-slate-800 overflow-hidden">
                
                {/* Left Column: WhatsApp-style Session List */}
                <div className={`md:col-span-1 border-r border-slate-800 flex-col bg-[#0B0E14] h-full min-h-0 ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-3 border-b border-slate-800 bg-[#121824] space-y-2 shrink-0">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Mesej Pelanggan</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        {chatSessions.length}
                      </span>
                    </h3>

                    {/* Search Input for Users */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari username pelanggan..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        className="w-full bg-[#080B10] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Scrollable WhatsApp Chat List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 min-h-0">
                    {(() => {
                      const filteredSessions = chatSessions.filter((s) =>
                        s.senderName.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                        s.sessionId.toLowerCase().includes(chatSearchQuery.toLowerCase())
                      );

                      if (filteredSessions.length === 0) {
                        return (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            Tiada perbualan dijumpai.
                          </div>
                        );
                      }

                      return filteredSessions.map((session) => {
                        const isSelected = selectedSessionId === session.sessionId;
                        return (
                          <button
                            key={session.sessionId}
                            onClick={() => {
                              setSelectedSessionId(session.sessionId);
                              fetch('/api/chat/read', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sessionId: session.sessionId }),
                              });
                            }}
                            className={`w-full p-3 text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/15 border-l-4 border-emerald-500'
                                : 'hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                                  {session.senderName.replace(/^@/, '').substring(0, 2) || 'US'}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-black text-white truncate">
                                    {session.senderName}
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                    {session.lastTime}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {session.lastMessage || 'Mula chat...'}
                                </p>
                              </div>
                            </div>

                            {session.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] animate-pulse shrink-0">
                                {session.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Column: Chat Window */}
                <div className={`md:col-span-2 flex-col bg-[#0D1117] h-full min-h-0 ${selectedSessionId ? 'flex' : 'hidden md:flex'}`}>
                  {selectedSessionId ? (
                    (() => {
                      const activeSession = chatSessions.find(
                        (s) => s.sessionId === selectedSessionId
                      );
                      const activeMsgs = activeSession ? activeSession.messages : [];

                      return (
                        <>
                          {/* Chat Header with Back Button */}
                          <div className="p-3 bg-[#121824] border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedSessionId(null)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold cursor-pointer transition-all border border-slate-700"
                                title="Kembali ke senarai mesej"
                              >
                                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                                <span className="text-[11px] font-bold">Kembali</span>
                              </button>

                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                                <Users className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {activeSession?.senderName || 'Pelanggan'}
                                </h4>
                                <span className="text-[10px] text-emerald-400 font-mono block truncate">
                                  Session ID: {selectedSessionId}
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                              24/7 Live Connected
                            </span>
                          </div>

                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#080B10] min-h-0">
                            {activeMsgs.map((m) => {
                              const isAdmin = m.sender === 'admin';
                              return (
                                <div
                                  key={m.id}
                                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                      isAdmin
                                        ? 'bg-orange-500 text-slate-950 font-medium rounded-br-none'
                                        : 'bg-[#161D2E] text-slate-200 border border-slate-700 rounded-bl-none'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{m.message}</p>
                                    <span
                                      className={`text-[9px] font-mono block text-right mt-1 ${
                                        isAdmin ? 'text-slate-900' : 'text-slate-400'
                                      }`}
                                    >
                                      {m.timestamp}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Admin Responses */}
                          <div className="px-3 py-1.5 bg-[#0B0E14] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                            <span className="text-slate-500 font-bold shrink-0">Balasan Pantas:</span>
                            <button
                              type="button"
                              onClick={() => setAdminReplyText('Pesanan anda sedang diproses dalam masa 1-3 minit. Terima kasih!')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 whitespace-nowrap cursor-pointer"
                            >
                              ⚡ Sedang Diproses
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminReplyText('Sila lampirkan tangkapan skrin (screenshot) resit pembayaran.')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 whitespace-nowrap cursor-pointer"
                            >
                              📑 Minta Resit
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminReplyText('Topup telah BERJAYA dikreditkan ke akaun game anda! Selamat bermain! 🎉')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 whitespace-nowrap cursor-pointer"
                            >
                              ✅ Topup Selesai
                            </button>
                          </div>

                          {/* Reply Input Bar */}
                          <form
                            onSubmit={handleSendReply}
                            className="p-3 bg-[#121824] border-t border-slate-800 flex items-center gap-2 shrink-0"
                          >
                            <input
                              type="text"
                              placeholder="Tulis balasan kepada pelanggan..."
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              className="flex-1 bg-[#080B10] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                            />
                            <button
                              type="submit"
                              disabled={!adminReplyText.trim() || sendingReply}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
                            >
                              <Send className="w-4 h-4" />
                              <span>Balas</span>
                            </button>
                          </form>
                        </>
                      );
                    })()
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
                      <MessageCircle className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                      <p className="font-bold text-slate-300 text-sm mb-1">Tiada Chat Dipilih</p>
                      <p className="max-w-xs text-slate-400">Sila tekan nama pelanggan di senarai sebelah kiri untuk mula membaca & membalas mesej.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Proof Viewer Modal */}
      {viewingProof && (
        <div
          onClick={() => setViewingProof(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-md w-full p-2 bg-slate-900 rounded-2xl border border-orange-500/50">
            <img
              src={viewingProof}
              alt="Resit Bayaran Transfer"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <p className="text-center text-xs text-slate-400 mt-2">Tekan di mana-mana untuk tutup</p>
          </div>
        </div>
      )}

    </div>
  );
};
