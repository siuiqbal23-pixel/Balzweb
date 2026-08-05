import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GameCard } from './components/GameCard';
import { TopupModal } from './components/TopupModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ReviewsSection } from './components/ReviewsSection';
import { TutorialSection } from './components/TutorialSection';
import { UserProfileView } from './components/UserProfileView';
import { GmailIntegrationModal } from './components/GmailIntegrationModal';
import { CartModal } from './components/CartModal';
import { LiveChatModal } from './components/LiveChatModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { NineDotsMenuModal } from './components/NineDotsMenuModal';
import { RealCalculatorModal } from './components/RealCalculatorModal';
import { Footer } from './components/Footer';
import { UsernameLoginModal } from './components/UsernameLoginModal';
import { Game, GameCategory, Order, PromoBanner, SystemSettings, UserProfile, UserActivityLog, CartItem } from './types';
import { Review, INITIAL_REVIEWS } from './data/reviewsData';
import {
  INITIAL_GAMES,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
  calculateSellPrice,
} from './data/initialData';
import { Flame, Zap, Gamepad2, CheckCircle2, Filter } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [banners, setBanners] = useState<PromoBanner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activityLogsList, setActivityLogsList] = useState<UserActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Username Login Modal & Chat States
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalPrompt, setLoginModalPrompt] = useState('Log Masuk Username TopupBalz');

  // 9-Dots Menu Modal & Real Calculator States
  const [nineDotsOpen, setNineDotsOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Restore current user from local storage
  useEffect(() => {
    const stored = localStorage.getItem('topupbalz_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          setCurrentUser(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleOpenLiveChatWithAuth = () => {
    if (!currentUser) {
      setLoginModalPrompt('Sila log masuk dengan username anda dahulu sebelum memulakan Live Chat!');
      setLoginModalOpen(true);
    } else {
      setLiveChatOpen(true);
    }
  };

  // Troli Pembelian & Live Chat Admin States
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('topupbalz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('topupbalz_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Real-time Active Online User Presence Heartbeat Ping
  useEffect(() => {
    let sessionId = sessionStorage.getItem('topupbalz_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('topupbalz_session_id', sessionId);
    }

    const sendPresencePing = async () => {
      try {
        const res = await fetch('/api/presence/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userEmail: currentUser?.email,
            userName: currentUser?.name,
          }),
        });
        const data = await res.json();
        if (data && typeof data.onlineCount === 'number') {
          setOnlineCount(data.onlineCount);
        }
      } catch (err) {
        try {
          const res = await fetch('/api/presence');
          const data = await res.json();
          if (data && typeof data.onlineCount === 'number') {
            setOnlineCount(data.onlineCount);
          }
        } catch (e) {
          console.error('Presence error:', e);
        }
      }
    };

    sendPresencePing();
    const presenceInterval = setInterval(sendPresencePing, 8000); // Ping every 8s
    return () => clearInterval(presenceInterval);
  }, [currentUser]);

  // Active Tab: 'menu' (1. Menu), 'reviews' (2. Ulasan), 'tutorials' (3. Tutorial), 'profile' (4. Profile), 'admin'
  const [activeTab, setActiveTab] = useState<NavTab>('menu');

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [gmailRecipient, setGmailRecipient] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenGmailModal = (recipient?: string) => {
    setGmailRecipient(recipient || currentUser?.email || '');
    setGmailModalOpen(true);
  };

  // Live Online State Sync: Fetch data every 3 seconds for instant real-time synchronization
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const [gRes, bRes, sRes, oRes, rRes, uRes] = await Promise.all([
          fetch('/api/games').then((r) => r.json()).catch(() => ({ games: INITIAL_GAMES })),
          fetch('/api/banners').then((r) => r.json()).catch(() => ({ banners: INITIAL_BANNERS })),
          fetch('/api/settings').then((r) => r.json()).catch(() => ({ settings: INITIAL_SETTINGS })),
          fetch('/api/orders').then((r) => r.json()).catch(() => ({ orders: [] })),
          fetch('/api/reviews').then((r) => r.json()).catch(() => ({ reviews: INITIAL_REVIEWS })),
          fetch('/api/users').then((r) => r.json()).catch(() => ({ users: [], activityLogs: [] })),
        ]);

        if (gRes.games && gRes.games.length > 0) setGames(gRes.games);
        if (bRes.banners) setBanners(bRes.banners);
        if (sRes.settings) setSettings(sRes.settings);
        if (oRes.orders) setOrders(oRes.orders);
        if (rRes.reviews) setReviews(rRes.reviews);
        if (uRes.users) setUsersList(uRes.users);
        if (uRes.activityLogs) setActivityLogsList(uRes.activityLogs);
      } catch (err) {
        console.error('Failed to load live server data:', err);
      }
    };

    fetchServerData();
    const interval = setInterval(fetchServerData, 3000); // Poll every 3s for live online sync
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGoogleSignIn = async (googleAccountData?: { email: string; name: string; avatarUrl?: string }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleAccountData || {
          email: 'user.topup@gmail.com',
          name: 'Pelanggan TopupBalz',
        }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.users) setUsersList(data.users);
        showToast(`Selamat datang, ${data.user.name}! Akaun Google disahkan.`);
      }
    } catch (err) {
      console.error('Google Sign in failed:', err);
    }
  };

  const handleUpdatePhone = async (phone: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, phoneNumber: phone }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.users) setUsersList(data.users);
        showToast('Nombor WhatsApp berjaya dikemaskini!');
      }
    } catch (err) {
      console.error('Failed to update phone:', err);
    }
  };

  // Filter games according to search query & selected category
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search match
      const matchesSearch =
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category match
      if (activeCategory === 'all') return true;
      if (activeCategory === 'popular') return game.isPopular;
      if (activeCategory === 'promo') return game.isDiscounted || game.items.some((i) => i.bonusTag);
      return game.category === activeCategory;
    });
  }, [games, searchQuery, activeCategory]);

  // Section groupings
  const popularGames = useMemo(() => games.filter((g) => g.isPopular), [games]);

  // Review submission
  const handleAddReview = async (newRev: Omit<Review, 'id' | 'date' | 'verified'>) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev),
      });
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        showToast('Ulasan anda berjaya diterbitkan! Terima kasih.');
      }
    } catch (err) {
      const fallbackRev: Review = {
        ...newRev,
        id: 'rev-' + Date.now(),
        date: 'Baru sahaja',
        verified: true,
      };
      setReviews((prev) => [fallbackRev, ...prev]);
      showToast('Ulasan disimpan secara tempatan.');
    }
  };

  // Order Submission Handler
  const handleOrderSubmit = async (orderData: {
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
  }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        showToast(`Pesanan #${data.order.id} berjaya dibuat! Sila buka WhatsApp.`);
        return {
          success: true,
          whatsappUrl: data.whatsappUrl,
          orderId: data.order.id,
        };
      } else {
        throw new Error(data.error || 'Gagal menghantar order');
      }
    } catch (err: any) {
      // Local fallback if offline or server glitch
      const sellPrice = orderData.basePrice;
      const orderId = 'TB-' + Math.floor(100000 + Math.random() * 900000);
      const ownerNumber = settings.ownerWhatsApp.replace(/\D/g, '');

      const textMessage =
        `Assalamualaikum, saya ingin membuat tempahan di TopupBalz.\n\n` +
        `*ID Pesanan:* ${orderId}\n` +
        `*Game:* ${orderData.gameName}\n` +
        `*Produk:* ${orderData.itemName}\n` +
        `*Harga:* RM ${sellPrice.toFixed(2)}\n` +
        `*User ID:* ${orderData.userId}\n` +
        (orderData.serverId ? `*Server/Zone ID:* ${orderData.serverId}\n` : '') +
        `*Sila proses pesanan saya.*`;

      const whatsappUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(textMessage)}`;

      const fallbackOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        gameId: orderData.gameId,
        gameName: orderData.gameName,
        itemId: orderData.itemId,
        itemName: orderData.itemName,
        basePrice: orderData.basePrice,
        sellPrice,
        userId: orderData.userId,
        serverId: orderData.serverId,
        customerPhone: orderData.customerPhone,
        paymentMethod: orderData.paymentMethod,
        proofImageUrl: orderData.proofImageUrl,
        status: 'pending',
        whatsappUrl,
      };

      setOrders((prev) => [fallbackOrder, ...prev]);
      showToast(`Pesanan #${orderId} telah didaftarkan.`);

      return {
        success: true,
        whatsappUrl,
        orderId,
      };
    }
  };

  // Shopping Cart Handlers
  const handleAddToCart = (itemData: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...itemData,
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setCart((prev) => [...prev, newItem]);
    showToast(`Item ${itemData.gameName} (${itemData.itemName}) dimasukkan ke Troli!`);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateCartUserId = (id: string, userId: string, serverId?: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, userId, serverId } : i))
    );
  };

  const handleClearCart = () => setCart([]);

  const handleSubmitCartOrders = async (payload: {
    items: CartItem[];
    paymentMethod: string;
    customerPhone?: string;
    proofImageUrl?: string;
  }) => {
    for (const item of payload.items) {
      for (let q = 0; q < item.quantity; q++) {
        await handleOrderSubmit({
          gameId: item.gameId,
          gameName: item.gameName,
          itemId: item.itemId,
          itemName: item.itemName,
          basePrice: Math.max(0.5, item.sellPrice - 1.0),
          userId: item.userId,
          serverId: item.serverId,
          customerPhone: payload.customerPhone,
          paymentMethod: payload.paymentMethod,
          proofImageUrl: payload.proofImageUrl,
        });
      }
    }

    const summaryText = payload.items
      .map(
        (i) =>
          `• ${i.gameName} (${i.itemName}) x${i.quantity} -> ID: ${i.userId}${i.serverId ? ' (' + i.serverId + ')' : ''}`
      )
      .join('\n');

    const totalAmount = payload.items.reduce((acc, i) => acc + i.sellPrice * i.quantity, 0);

    const waMsg =
      `*PESANAN TROLI PEMBELIAN TOPUPBALZ*\n` +
      `--------------------------------\n` +
      `${summaryText}\n` +
      `--------------------------------\n` +
      `*Jumlah Bayaran:* RM ${totalAmount.toFixed(2)}\n` +
      `*Kaedah Bayaran:* ${payload.paymentMethod}\n` +
      `*WhatsApp Pelanggan:* ${payload.customerPhone || 'N/A'}\n\n` +
      `Sila sahkan pembayaran troli saya. Terima kasih!`;

    const waUrl = `https://wa.me/${settings.ownerWhatsApp}?text=${encodeURIComponent(waMsg)}`;

    return { success: true, whatsappUrl: waUrl };
  };

  // Admin Actions
  const handleSaveGame = async (gameToSave: Game) => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameToSave),
      });
      const data = await res.json();
      if (data.games) setGames(data.games);
      showToast('Game & senarai harga berjaya dikemaskini online!');
    } catch (err) {
      setGames((prev) => {
        const idx = prev.findIndex((g) => g.id === gameToSave.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = gameToSave;
          return updated;
        }
        return [gameToSave, ...prev];
      });
      showToast('Game dikemaskini secara tempatan.');
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.games) setGames(data.games);
      showToast('Game dipadamkan.');
    } catch (err) {
      setGames((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status'], notes?: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      showToast(`Status pesanan #${id} ditukar ke ${status.toUpperCase()}.`);
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, notes } : o))
      );
    }
  };

  const handleSaveBanner = async (banner: PromoBanner) => {
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      const data = await res.json();
      if (data.banners) setBanners(data.banners);
      showToast('Banner berjaya disimpan!');
    } catch (err) {
      setBanners((prev) => [banner, ...prev]);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.banners) setBanners(data.banners);
    } catch (err) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      showToast('Tetapan sistem berjaya disimpan.');
    } catch (err) {
      setSettings(newSettings);
    }
  };

  const handleOrderSearch = async (queryId: string) => {
    try {
      const res = await fetch(`/api/orders/${queryId}`);
      const data = await res.json();
      return data.orders || [];
    } catch (err) {
      return orders.filter(
        (o) =>
          o.id.toLowerCase().includes(queryId.toLowerCase()) ||
          o.userId.toLowerCase().includes(queryId.toLowerCase())
      );
    }
  };

  const handleVerifyEmail = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: code }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.users) setUsersList(data.users);
        showToast('Tahniah! Email anda berjaya disahkan.');
      }
    } catch (err) {
      if (currentUser) {
        setCurrentUser({ ...currentUser, isEmailVerified: true });
        showToast('Email berjaya disahkan.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950 pb-20">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-slate-900 border border-orange-500/60 text-white text-xs font-bold shadow-[0_0_25px_rgba(255,140,0,0.4)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        onOpenAdmin={() => {
          setActiveTab('admin');
          setAdminOpen(true);
        }}
        onSelectGameClick={() => {
          setActiveTab('menu');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGmail={() => handleOpenGmailModal()}
        onlineCount={onlineCount}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenLiveChat={handleOpenLiveChatWithAuth}
      />

      {/* Hero Banner Section (Mainly on Menu Tab) */}
      {activeTab === 'menu' && (
        <HeroBanner
          banners={banners}
          ownerWhatsApp={settings.ownerWhatsApp}
          onOpenAdmin={() => setAdminOpen(true)}
          onlineCount={onlineCount}
          onSelectGame={(slug) => {
            const found = games.find((g) => g.slug === slug);
            if (found) setSelectedGame(found);
            else {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onTopupNowClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Dynamic View Container according to Bottom Navigation Bar */}
      <main id="catalog-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* BAR 1: MENU / TOPUP CATALOG */}
        {activeTab === 'menu' && (
          <>
            {/* Category Navigation Pills */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                      : 'bg-[#0D1117] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Semua Game</span>
                </button>

                <button
                  onClick={() => setActiveCategory('promo')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeCategory === 'promo'
                      ? 'bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                      : 'bg-[#0D1117] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>⚡ Topup Murah</span>
                </button>

                <button
                  onClick={() => setActiveCategory('mobile')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeCategory === 'mobile'
                      ? 'bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                      : 'bg-[#0D1117] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  📱 Mobile Games
                </button>

                <button
                  onClick={() => setActiveCategory('pc')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeCategory === 'pc'
                      ? 'bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                      : 'bg-[#0D1117] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  💻 PC & Console
                </button>

                <button
                  onClick={() => setActiveCategory('voucher')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeCategory === 'voucher'
                      ? 'bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                      : 'bg-[#0D1117] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🎟️ Voucher & Wallet
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                <span>Memaparkan <strong className="text-orange-400 font-bold">{filteredGames.length}</strong> game</span>
              </div>
            </div>

            {/* Main Catalog Grid */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {activeCategory === 'all'
                        ? 'Semua Katalog Game'
                        : activeCategory === 'promo'
                        ? 'Tawaran Topup Murah & Diskaun'
                        : `Game ${activeCategory.toUpperCase()}`}
                    </h2>
                    <p className="text-xs text-slate-400">Tekan game pilihan anda untuk menyemak pakej topup</p>
                  </div>
                </div>
              </div>

              {filteredGames.length === 0 ? (
                <div className="p-12 text-center bg-[#0D1117] border border-slate-800 rounded-3xl space-y-3">
                  <Filter className="w-10 h-10 text-orange-400 mx-auto opacity-80" />
                  <h3 className="text-lg font-extrabold text-white">Carian Tidak Dijumpai</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Maaf, tiada game padan dengan carian "{searchQuery}". Sila cuba kata kunci lain atau set semula tapisan.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="px-5 py-2.5 bg-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl"
                  >
                    Set Semula Carian
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelectGame={(g) => setSelectedGame(g)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* BAR 2: ULASAN / REVIEWS */}
        {activeTab === 'reviews' && (
          <ReviewsSection
            reviews={reviews}
            onAddReview={handleAddReview}
            gamesList={games.map((g) => ({ id: g.id, name: g.name }))}
            onOpenLiveChat={handleOpenLiveChatWithAuth}
          />
        )}

        {/* BAR 3: TUTORIAL / GUIDES */}
        {activeTab === 'tutorials' && (
          <TutorialSection ownerWhatsApp={settings.ownerWhatsApp} />
        )}

        {/* BAR 4: PROFILE & USERNAME AUTH */}
        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            orders={orders}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              showToast(`Selamat datang ${user.name}! Akaun berjaya didaftarkan.`);
            }}
            onLogOut={() => {
              setCurrentUser(null);
              localStorage.removeItem('topupbalz_current_user');
              showToast('Log keluar berjaya.');
            }}
            onUpdatePhone={handleUpdatePhone}
            onVerifyEmail={handleVerifyEmail}
            onOpenGmailModal={handleOpenGmailModal}
            onOpenAdmin={() => {
              setActiveTab('admin');
              setAdminOpen(true);
            }}
          />
        )}

        {/* ADMIN PANEL VIEW */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#131926] to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider inline-block mb-2">
                  🔴 Online Live Sync Enabled
                </span>
                <h2 className="text-2xl font-black text-white">Profile Admin & Control Center</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  Sebarang perubahan harga, barang, senarai game, dan promo yang ditukar oleh Admin di sini akan <strong>terus bertukar secara automatik & online</strong> pada paparan semua pelanggan!
                </p>
              </div>

              <button
                onClick={() => setAdminOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                Buka Full Window Panel
              </button>
            </div>

            <AdminDashboard
              games={games}
              orders={orders}
              banners={banners}
              settings={settings}
              users={usersList}
              activityLogs={activityLogsList}
              onClose={() => setActiveTab('menu')}
              onSaveGame={handleSaveGame}
              onDeleteGame={handleDeleteGame}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSaveBanner={handleSaveBanner}
              onDeleteBanner={handleDeleteBanner}
              onSaveSettings={handleSaveSettings}
              onOpenGmailModal={handleOpenGmailModal}
            />
          </div>
        )}

      </main>

      {/* Topup Checkout Drawer / Modal */}
      {selectedGame && (
        <TopupModal
          game={selectedGame}
          settings={settings}
          onClose={() => setSelectedGame(null)}
          onSubmitOrder={handleOrderSubmit}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={cart}
        items={cart}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onUpdateItemUserId={handleUpdateCartUserId}
        onUpdateUserId={handleUpdateCartUserId}
        onClearCart={handleClearCart}
        onSubmitCartOrders={handleSubmitCartOrders}
      />

      {/* Live Chat Modal (WhatsApp-style 24/7 Admin Chat) */}
      <LiveChatModal
        isOpen={liveChatOpen}
        onClose={() => setLiveChatOpen(false)}
        userName={currentUser?.name || 'Pelanggan'}
      />

      {/* Username Login Modal */}
      <UsernameLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        titleMessage={loginModalPrompt}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Selamat datang, ${user.name}! Akaun sedia digunakan.`);
          setLiveChatOpen(true);
        }}
      />

      {/* Order Tracker Modal */}
      {orderTrackerOpen && (
        <OrderTrackerModal
          onClose={() => setOrderTrackerOpen(false)}
          onSearchOrder={handleOrderSearch}
          ownerPhone={settings.ownerWhatsApp}
        />
      )}

      {/* Admin Panel Modal (When triggered from Header / Instant badge) */}
      {adminOpen && activeTab !== 'admin' && (
        <AdminDashboard
          games={games}
          orders={orders}
          banners={banners}
          settings={settings}
          users={usersList}
          activityLogs={activityLogsList}
          onClose={() => setAdminOpen(false)}
          onSaveGame={handleSaveGame}
          onDeleteGame={handleDeleteGame}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onSaveBanner={handleSaveBanner}
          onDeleteBanner={handleDeleteBanner}
          onSaveSettings={handleSaveSettings}
          onOpenGmailModal={handleOpenGmailModal}
        />
      )}

      {/* Gmail Integration Modal */}
      <GmailIntegrationModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        defaultRecipient={gmailRecipient}
        onSuccessToast={(msg) => showToast(msg)}
      />

      {/* Footer */}
      <Footer
        onOpenAdmin={() => {
          setActiveTab('admin');
          setAdminOpen(true);
        }}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        ownerWhatsApp={settings.ownerWhatsApp}
      />

      {/* 9-Dots Grid Menu Overlay */}
      <NineDotsMenuModal
        isOpen={nineDotsOpen}
        onClose={() => setNineDotsOpen(false)}
        setActiveTab={setActiveTab}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        onOpenCalculator={() => setCalculatorOpen(true)}
      />

      {/* Real Pocket Calculator Modal */}
      <RealCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      {/* BAR BAWAH PERSISTENT 5 NAV TAB DENGAN TITIK 9 */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={reviews.length}
        currentUser={currentUser}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        onOpenCart={() => setCartModalOpen(true)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenNineDots={() => setNineDotsOpen(true)}
      />

    </div>
  );
}
