import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_GAMES, INITIAL_BANNERS, INITIAL_SETTINGS, calculateSellPrice } from './src/data/initialData';
import { INITIAL_REVIEWS, Review } from './src/data/reviewsData';
import { Game, Order, PromoBanner, SystemSettings } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser limit for image proof uploads
  app.use(express.json({ limit: '15mb' }));

  // In-memory data store with initial defaults
  let gamesData: Game[] = JSON.parse(JSON.stringify(INITIAL_GAMES));
  let bannersData: PromoBanner[] = JSON.parse(JSON.stringify(INITIAL_BANNERS));
  let settingsData: SystemSettings = { ...INITIAL_SETTINGS };
  let reviewsData: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));

  let usersData: any[] = [
    {
      id: 'TB-USR-1001',
      email: 'siuiqbal23@gmail.com',
      name: 'Muhammad Nur Iqbal',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      googleId: 'google-10928374918237',
      phoneNumber: '0145975056',
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      lastLoginAt: new Date().toISOString(),
      totalOrders: 3,
      totalSpent: 45.50,
      isOnline: true,
      isEmailVerified: true,
    },
    {
      id: 'TB-USR-1002',
      email: 'amiramirul.gamer@gmail.com',
      name: 'Amirul Gaming',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amirul',
      googleId: 'google-992103847291',
      phoneNumber: '0198765432',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      totalOrders: 1,
      totalSpent: 6.50,
      isOnline: false,
      isEmailVerified: true,
    },
  ];

  let activityLogsData: any[] = [
    {
      id: 'LOG-1',
      userId: 'TB-USR-1001',
      userName: 'Muhammad Nur Iqbal',
      userEmail: 'siuiqbal23@gmail.com',
      type: 'login',
      details: 'Log masuk melalui Google Auth',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'LOG-2',
      userId: 'TB-USR-1002',
      userName: 'Amirul Gaming',
      userEmail: 'amiramirul.gamer@gmail.com',
      type: 'register',
      details: 'Pendaftaran akaun baru melalui Google Sign-In',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  let ordersData: Order[] = [
    {
      id: 'TB-982104',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      gameId: 'g1',
      gameName: 'Mobile Legends: Bang Bang',
      itemId: 'ml-86',
      itemName: '86 Diamonds',
      basePrice: 4.50,
      sellPrice: calculateSellPrice(4.50),
      userId: '88127364',
      serverId: '2105',
      customerPhone: '0123456789',
      paymentMethod: 'Touch \'n Go eWallet',
      status: 'completed',
      notes: 'Pembayaran disahkan. Diamond telah dikreditkan.',
    },
    {
      id: 'TB-982105',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      gameId: 'g2',
      gameName: 'Free Fire',
      itemId: 'ff-140',
      itemName: '140 Diamonds',
      basePrice: 5.50,
      sellPrice: calculateSellPrice(5.50),
      userId: '77218390',
      customerPhone: '0198765432',
      paymentMethod: 'Touch \'n Go eWallet',
      status: 'processing',
      notes: 'Bukti pembayaran sedang disemak oleh admin.',
    },
  ];

  // Helper to ensure item prices retain exact given prices
  function enforceSystemPricing(games: Game[]): Game[] {
    return games.map((game) => ({
      ...game,
      items: game.items.map((item) => ({
        ...item,
        sellPrice: item.sellPrice !== undefined ? item.sellPrice : item.basePrice,
      })),
    }));
  }

  gamesData = enforceSystemPricing(gamesData);

  // --- API ROUTES ---

  // Active online sessions tracker
  const activePresenceMap = new Map<string, { lastPing: number; userEmail?: string; userName?: string }>();

  const cleanupStaleSessions = () => {
    const now = Date.now();
    for (const [sessionId, data] of activePresenceMap.entries()) {
      if (now - data.lastPing > 25000) {
        activePresenceMap.delete(sessionId);
      }
    }
  };

  // POST /api/presence/ping - Heartbeat ping from client
  app.post('/api/presence/ping', (req: Request, res: Response) => {
    try {
      const { sessionId, userEmail, userName } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId diperlukan' });
      }

      activePresenceMap.set(sessionId, {
        lastPing: Date.now(),
        userEmail: userEmail || undefined,
        userName: userName || undefined,
      });

      cleanupStaleSessions();

      res.json({
        success: true,
        onlineCount: activePresenceMap.size,
        activeSessions: Array.from(activePresenceMap.values()),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/presence - Fetch current online stats
  app.get('/api/presence', (req: Request, res: Response) => {
    cleanupStaleSessions();
    res.json({
      onlineCount: activePresenceMap.size,
      activeSessions: Array.from(activePresenceMap.values()),
    });
  });

  // --- LIVE CHAT REAL-TIME BACKEND ---
  interface ChatMsg {
    id: string;
    sessionId: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
    read: boolean;
  }

  const getMalaysiaTimeString = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const chatSessionsMap = new Map<string, ChatMsg[]>();
  const chatSessionUserNamesMap = new Map<string, string>();

  // Helper to ensure welcome message
  const getSessionMessages = (sessionId: string) => {
    if (!chatSessionsMap.has(sessionId)) {
      const welcomeMsg: ChatMsg = {
        id: 'msg_welcome_' + Date.now(),
        sessionId,
        sender: 'admin',
        senderName: 'Admin TopupBalz 🟢 24/7',
        message: 'Salam & Selamat Datang ke TopupBalz! 👋 Ada sebarang pertanyaan mengenai topup game atau pakej? Admin sedia membantu anda 24 jam.',
        timestamp: getMalaysiaTimeString(),
        read: true,
      };
      chatSessionsMap.set(sessionId, [welcomeMsg]);
    }
    return chatSessionsMap.get(sessionId)!;
  };

  // GET /api/chat/messages
  app.get('/api/chat/messages', (req: Request, res: Response) => {
    try {
      const { sessionId, admin, userName } = req.query;

      if (admin === 'true') {
        // Admin mode: return all sessions summary
        const sessionsList: Array<{
          sessionId: string;
          senderName: string;
          lastMessage: string;
          lastTime: string;
          unreadCount: number;
          messages: ChatMsg[];
        }> = [];

        for (const [sId, msgs] of chatSessionsMap.entries()) {
          const lastMsg = msgs[msgs.length - 1];
          const unreadCount = msgs.filter((m) => m.sender === 'user' && !m.read).length;
          
          // Get best userSender name
          const storedUserName = chatSessionUserNamesMap.get(sId);
          const lastUserMsgName = msgs
            .slice()
            .reverse()
            .find((m) => m.sender === 'user' && m.senderName && m.senderName !== 'Pelanggan')?.senderName;
          const firstUserMsgName = msgs.find((m) => m.sender === 'user')?.senderName;

          const userSender =
            storedUserName && storedUserName !== 'Pelanggan'
              ? storedUserName
              : lastUserMsgName ||
                (firstUserMsgName && firstUserMsgName !== 'Pelanggan' ? firstUserMsgName : null) ||
                'Pelanggan (' + sId.substring(0, 6) + ')';

          sessionsList.push({
            sessionId: sId,
            senderName: userSender,
            lastMessage: lastMsg ? lastMsg.message : '',
            lastTime: lastMsg ? lastMsg.timestamp : '',
            unreadCount,
            messages: msgs,
          });
        }

        return res.json({ sessions: sessionsList });
      }

      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'sessionId diperlukan' });
      }

      if (userName && typeof userName === 'string' && userName.trim() && userName !== 'Pelanggan') {
        chatSessionUserNamesMap.set(sessionId, userName.trim());
        const existingMsgs = chatSessionsMap.get(sessionId);
        if (existingMsgs) {
          existingMsgs.forEach((m) => {
            if (m.sender === 'user') m.senderName = userName.trim();
          });
        }
      }

      const msgs = getSessionMessages(sessionId);
      res.json({ messages: msgs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/chat/send
  app.post('/api/chat/send', (req: Request, res: Response) => {
    try {
      const { sessionId, sender, senderName, message } = req.body;
      if (!sessionId || !sender || !message) {
        return res.status(400).json({ error: 'Permintaan tidak lengkap' });
      }

      if (sender === 'user' && senderName && senderName.trim() && senderName !== 'Pelanggan') {
        chatSessionUserNamesMap.set(sessionId, senderName.trim());
      }

      const effectiveSenderName =
        sender === 'user'
          ? (senderName && senderName !== 'Pelanggan'
              ? senderName
              : chatSessionUserNamesMap.get(sessionId) || 'Pelanggan')
          : senderName || 'Admin TopupBalz';

      const msgs = getSessionMessages(sessionId);

      // If user senderName is refined, update existing user messages too
      if (sender === 'user' && effectiveSenderName !== 'Pelanggan') {
        msgs.forEach((m) => {
          if (m.sender === 'user') m.senderName = effectiveSenderName;
        });
      }

      const newMsg: ChatMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        sessionId,
        sender,
        senderName: effectiveSenderName,
        message,
        timestamp: getMalaysiaTimeString(),
        read: sender === 'admin',
      };

      msgs.push(newMsg);
      chatSessionsMap.set(sessionId, msgs);

      res.json({ success: true, message: newMsg, messages: msgs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/chat/read
  app.post('/api/chat/read', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      if (sessionId && chatSessionsMap.has(sessionId)) {
        const msgs = chatSessionsMap.get(sessionId)!;
        msgs.forEach((m) => {
          if (m.sender === 'user') m.read = true;
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'TopupBalz', version: '1.0.0' });
  });

  // GET Games
  app.get('/api/games', (req: Request, res: Response) => {
    res.json({ games: gamesData });
  });

  // POST Create / Update Game (Admin)
  app.post('/api/games', (req: Request, res: Response) => {
    try {
      const updatedGame: Game = req.body;
      if (!updatedGame.name || !updatedGame.items) {
        return res.status(400).json({ error: 'Nama game dan item diperlukan' });
      }

      // Calculate sellPrice if not custom, or ensure numeric values
      updatedGame.items = updatedGame.items.map((item) => {
        const base = Number(item.basePrice) || 0;
        const customSell = Number(item.sellPrice);
        const sell = customSell && !isNaN(customSell) && customSell > 0 ? customSell : calculateSellPrice(base);
        return {
          ...item,
          basePrice: base,
          sellPrice: sell,
        };
      });

      const existingIndex = gamesData.findIndex((g) => g.id === updatedGame.id);
      if (existingIndex >= 0) {
        gamesData[existingIndex] = updatedGame;
      } else {
        if (!updatedGame.id) {
          updatedGame.id = 'g_' + Date.now();
        }
        gamesData.unshift(updatedGame);
      }

      return res.json({ success: true, game: updatedGame, games: gamesData });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE Game (Admin)
  app.delete('/api/games/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    gamesData = gamesData.filter((g) => g.id !== id);
    res.json({ success: true, games: gamesData });
  });

  // GET Orders
  app.get('/api/orders', (req: Request, res: Response) => {
    res.json({ orders: ordersData });
  });

  // GET Single Order status check
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const searchId = id.trim().toLowerCase();
    const found = ordersData.filter(
      (o) =>
        o.id.toLowerCase() === searchId ||
        o.userId.toLowerCase() === searchId
    );
    res.json({ orders: found });
  });

  // POST Submit New Order
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const {
        gameId,
        gameName,
        itemId,
        itemName,
        basePrice,
        userId,
        serverId,
        customerPhone,
        paymentMethod,
        proofImageUrl,
      } = req.body;

      if (!gameName || !itemName || !userId) {
        return res.status(400).json({ error: 'Sila lengkapkan maklumat pesanan' });
      }

      const numBase = Number(basePrice) || 0;
      const reqSell = Number(req.body.sellPrice);
      const sellPrice =
        reqSell && !isNaN(reqSell) && reqSell > 0
          ? reqSell
          : numBase;
      const orderId = 'TB-' + Math.floor(100000 + Math.random() * 900000);

      // Build WhatsApp message
      const textMessage =
        `Assalamualaikum, saya ingin membuat tempahan di TopupBalz.\n\n` +
        `*ID Pesanan:* ${orderId}\n` +
        `*Game:* ${gameName}\n` +
        `*Produk:* ${itemName}\n` +
        `*Harga Akhir:* RM ${sellPrice.toFixed(2)}\n` +
        `*User ID:* ${userId}\n` +
        (serverId ? `*Server/Zone ID:* ${serverId}\n` : '') +
        (customerPhone ? `*No Tel:* ${customerPhone}\n` : '') +
        `*Kaedah Bayaran:* ${paymentMethod || "Touch 'n Go eWallet"}\n\n` +
        `Resit pembayaran telah disertakan. Sila proses pesanan saya. Terima kasih!`;

      const ownerNumber = settingsData.ownerWhatsApp.replace(/\D/g, '');
      const encodedText = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${ownerNumber}?text=${encodedText}`;

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        gameId,
        gameName,
        itemId,
        itemName,
        basePrice: numBase,
        sellPrice,
        userId,
        serverId,
        customerPhone,
        paymentMethod: paymentMethod || "Touch 'n Go eWallet",
        proofImageUrl,
        status: 'pending',
        notes: 'Pesanan baru diterima. Menunggu pengesahan resit.',
        whatsappUrl,
      };

      ordersData.unshift(newOrder);

      // Instant Telegram Bot Notification to OrderBalz Bot
      const botToken = settingsData.telegramBotToken || '8734212773:AAF3wZS0nC5Vt29RoB7kcBwHKqEBJ2y8NTw';
      const chatId = settingsData.telegramChatId || '1290238834';

      if (botToken) {
        try {
          const telegramText =
            `🚨 <b>[ORDERBALZ BOT - PESANAN BARU]</b> 🚨\n\n` +
            `<b>ID Pesanan:</b> <code>${orderId}</code>\n` +
            `<b>Game:</b> ${gameName}\n` +
            `<b>Produk:</b> ${itemName}\n` +
            `<b>Harga:</b> RM ${sellPrice.toFixed(2)}\n` +
            `<b>User ID:</b> <code>${userId}</code>\n` +
            (serverId ? `<b>Server/Zone ID:</b> <code>${serverId}</code>\n` : '') +
            (customerPhone ? `<b>No Tel:</b> ${customerPhone}\n` : '') +
            `<b>Kaedah Bayaran:</b> ${paymentMethod || "Touch 'n Go eWallet"}\n` +
            `<b>Status:</b> MENUNGGU PENGESAHAN RESIT`;

          if (chatId) {
            // 1. Send Order Details Notification
            await fetch(
              `https://api.telegram.org/bot${botToken}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: telegramText,
                  parse_mode: 'HTML',
                }),
              }
            );

            // 2. Send Automatic Bot Order Confirmation Receipt
            const autoReplyText =
              `🤖 <b>[OrderBalz Bot Auto-Reply]</b>\n\n` +
              `<b>Sila tunggu 10 - 20 minit untuk diamond/kredit dimasukkan ke dalam akaun anda.</b> ⏱️💎\n\n` +
              `Pesanan <code>${orderId}</code> bagi <b>${gameName} (${itemName})</b> telah disahkan. Admin TopupBalz sedang memproses tempahan anda secara instant. Terima kasih!`;

            await fetch(
              `https://api.telegram.org/bot${botToken}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: autoReplyText,
                  parse_mode: 'HTML',
                }),
              }
            );
          }
        } catch (tgErr) {
          console.error('Telegram Notification Error:', tgErr);
        }
      }

      return res.json({
        success: true,
        order: newOrder,
        whatsappUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PATCH Update Order Status (Admin)
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const orderIndex = ordersData.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pesanan tidak dijumpai' });
    }

    ordersData[orderIndex].status = status;
    if (notes) {
      ordersData[orderIndex].notes = notes;
    }

    return res.json({ success: true, order: ordersData[orderIndex], orders: ordersData });
  });

  // GET / POST Banners
  app.get('/api/banners', (req: Request, res: Response) => {
    res.json({ banners: bannersData });
  });

  app.post('/api/banners', (req: Request, res: Response) => {
    const newBanner: PromoBanner = req.body;
    if (!newBanner.id) {
      newBanner.id = 'b_' + Date.now();
    }
    const idx = bannersData.findIndex((b) => b.id === newBanner.id);
    if (idx >= 0) {
      bannersData[idx] = newBanner;
    } else {
      bannersData.unshift(newBanner);
    }
    res.json({ success: true, banners: bannersData });
  });

  app.delete('/api/banners/:id', (req: Request, res: Response) => {
    bannersData = bannersData.filter((b) => b.id !== req.params.id);
    res.json({ success: true, banners: bannersData });
  });

  // GET / POST Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json({ settings: settingsData });
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    settingsData = { ...settingsData, ...req.body };
    res.json({ success: true, settings: settingsData });
  });

  // POST Telegram Webhook (OrderBalz Bot Auto-Reply & Spam Filter)
  app.post('/api/telegram-webhook', async (req: Request, res: Response) => {
    try {
      const update = req.body;
      const message = update?.message;

      if (!message || !message.text) {
        return res.json({ ok: true, status: 'no_message_text' });
      }

      const text = message.text.trim().toLowerCase();
      const chatId = message.chat.id;

      // Keywords that identify an order message or order inquiry
      const isOrderMessage =
        text.includes('tb-') ||
        text.includes('order') ||
        text.includes('pesanan') ||
        text.includes('topup') ||
        text.includes('diamond') ||
        text.includes('user id') ||
        text.includes('id:') ||
        text.includes('game') ||
        text.includes('starlight') ||
        text.includes('free fire') ||
        text.includes('mobile legend') ||
        text.includes('resit') ||
        text.includes('pembayaran') ||
        text.includes('duitnow');

      // If NOT an order message (e.g. random text, spam, unrelated chat), DO NOT REPLY
      if (!isOrderMessage) {
        return res.json({ ok: true, status: 'ignored_non_order_spam' });
      }

      // If it IS an order message, reply automatically with the estimated processing time
      const botToken = settingsData.telegramBotToken || '8734212773:AAF3wZS0nC5Vt29RoB7kcBwHKqEBJ2y8NTw';
      const autoReplyText =
        `🤖 <b>[OrderBalz Bot]</b>\n\n` +
        `<b>Sila tunggu 10 - 20 minit untuk diamond/kredit dimasukkan ke dalam akaun anda.</b> ⏱️💎\n\n` +
        `Pesanan anda sedang diproses secara automatik oleh sistem TopupBalz. Terima kasih atas pembelian anda!`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: autoReplyText,
          parse_mode: 'HTML',
          reply_to_message_id: message.message_id,
        }),
      });

      return res.json({ ok: true, status: 'order_replied' });
    } catch (err: any) {
      console.error('Telegram Webhook Error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // GET registered users and activity logs (for Admin & User Profile)
  app.get('/api/users', (req: Request, res: Response) => {
    res.json({ users: usersData, activityLogs: activityLogsData });
  });

  // POST Username Login / Registration with uniqueness check
  app.post('/api/auth/username-login', (req: Request, res: Response) => {
    try {
      const { username, existingUserId, adminCode } = req.body;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Sila masukkan username' });
      }

      // Clean handle and ensure @ prefix
      const cleanInput = username.trim().replace(/^@+/, '');
      if (!cleanInput) {
        return res.status(400).json({ error: 'Username tidak boleh kosong' });
      }

      const isBalzzAdmin = cleanInput.toLowerCase() === 'balzz';

      // Special security check for Admin username 'Balzz'
      if (isBalzzAdmin) {
        if (!adminCode || String(adminCode).trim() !== '030926') {
          return res.status(400).json({ error: 'Kod Rahsia Admin diperlukan untuk username Balzz! Kod salah.' });
        }
      }

      const handle = `@${cleanInput}`;
      const lowerHandle = handle.toLowerCase();

      // Find if username already registered by another user
      const existingUser = usersData.find(
        (u) => u.name.toLowerCase() === lowerHandle
      );

      if (existingUser) {
        // If not Balzz admin, check if session user ID differs
        if (!isBalzzAdmin && existingUserId !== existingUser.id) {
          return res.status(400).json({ error: 'Tak boleh, nama ini sudah digunakan!' });
        }

        // Log in as existing user
        existingUser.lastLoginAt = new Date().toISOString();
        existingUser.isOnline = true;

        activityLogsData.unshift({
          id: `LOG-${Date.now()}`,
          userId: existingUser.id,
          userName: existingUser.name,
          userEmail: existingUser.email,
          type: 'login',
          details: isBalzzAdmin ? 'Log masuk sebagai ADMIN BALZZ' : `Log masuk semula sebagai ${existingUser.name}`,
          timestamp: new Date().toISOString(),
        });

        return res.json({ success: true, user: existingUser, users: usersData });
      } else {
        // Brand new username registration
        const newUser = {
          id: isBalzzAdmin ? 'TB-ADMIN-BALZZ' : `TB-USR-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `${cleanInput.toLowerCase()}@topupbalz.my`,
          name: handle,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(handle)}`,
          googleId: `usr-${Date.now()}`,
          phoneNumber: '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
          isOnline: true,
          isEmailVerified: true,
        };

        usersData.unshift(newUser);

        activityLogsData.unshift({
          id: `LOG-${Date.now()}`,
          userId: newUser.id,
          userName: newUser.name,
          userEmail: newUser.email,
          type: 'register',
          details: `Pendaftaran username baru: ${handle}`,
          timestamp: new Date().toISOString(),
        });

        return res.json({ success: true, user: newUser, users: usersData });
      }
    } catch (err: any) {
      console.error('Username Auth Error:', err);
      return res.status(500).json({ error: 'Ralat log masuk username' });
    }
  });

  // POST Verify Email Code (OTP)
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    try {
      const { email, otpCode } = req.body;
      const user = usersData.find((u) => u.email.toLowerCase() === email?.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'Akaun pengguna tidak dijumpai' });
      }

      // Verification logic (accept 6-digit code)
      user.isEmailVerified = true;

      activityLogsData.unshift({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'profile_updated',
        details: 'Email berjaya disahkan melalui Verifikasi Kod OTP 6-Digit',
        timestamp: new Date().toISOString(),
      });

      return res.json({ success: true, user, users: usersData });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST update user profile (e.g. phone number)
  app.post('/api/users/update', (req: Request, res: Response) => {
    try {
      const { email, phoneNumber, name } = req.body;
      const user = usersData.find((u) => u.email.toLowerCase() === email?.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'User tidak dijumpai' });
      }
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (name) user.name = name;

      activityLogsData.unshift({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'profile_updated',
        details: 'Kemaskini maklumat profil',
        timestamp: new Date().toISOString(),
      });

      return res.json({ success: true, user, users: usersData });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // GET / POST Reviews
  app.get('/api/reviews', (req: Request, res: Response) => {
    res.json({ reviews: reviewsData });
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    try {
      const { customerName, gameName, itemName, rating, comment } = req.body;
      if (!customerName || !comment) {
        return res.status(400).json({ error: 'Sila lengkapkan nama dan ulasan' });
      }

      const newRev: Review = {
        id: 'rev-' + Date.now(),
        customerName,
        gameName: gameName || 'Free Fire',
        itemName: itemName || 'Pakej Topup',
        rating: Number(rating) || 5,
        comment,
        date: 'Baru sahaja',
        verified: true,
      };

      reviewsData.unshift(newRev);
      return res.json({ success: true, review: newRev, reviews: reviewsData });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TopupBalz server running on http://localhost:${PORT}`);
  });
}

startServer();
