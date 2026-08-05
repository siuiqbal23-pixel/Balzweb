export type GameCategory = 'all' | 'mobile' | 'pc' | 'voucher' | 'popular' | 'promo';

export interface GameItem {
  id: string;
  name: string;
  basePrice: number; // Harga asal (RM)
  sellPrice: number; // Harga jualan TopupBalz (RM)
  icon?: string;
  bonusTag?: string; // e.g. "+10 Bonus" or "Paling Popular"
  isPopular?: boolean;
}

export type ServerType = 'none' | 'zone_id' | 'server_list' | 'tag';

export interface Game {
  id: string;
  name: string;
  slug: string;
  category: 'mobile' | 'pc' | 'voucher';
  logoUrl: string;
  bannerUrl?: string;
  isPopular?: boolean;
  isDiscounted?: boolean;
  serverType: ServerType;
  serverOptions?: string[]; // e.g. ["Asia", "America", "Europe", "TW/HK/MO"] for Genshin
  idGuideText: string;
  items: GameItem[];
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string; // e.g. TB-883921
  createdAt: string;
  gameId: string;
  gameName: string;
  itemId: string;
  itemName: string;
  basePrice: number;
  sellPrice: number;
  userId: string;
  serverId?: string;
  customerPhone?: string;
  paymentMethod: string;
  proofImageUrl?: string; // Base64 or uploaded image URL
  status: OrderStatus;
  notes?: string;
  whatsappUrl?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  gameSlug?: string;
  discountText?: string;
  isActive: boolean;
}

export interface SystemSettings {
  ownerWhatsApp: string;
  telegramBotToken: string;
  telegramChatId: string;
  tngAccountName: string;
  tngQrImageUrl: string;
  fpxEnabled: boolean;
  autoFeeAmount: number;
}

export interface UserProfile {
  id: string; // e.g. TB-USER-9821
  email: string;
  name: string;
  avatarUrl: string;
  googleId: string;
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt: string;
  totalOrders: number;
  totalSpent: number;
  isOnline?: boolean;
  isEmailVerified?: boolean;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'login' | 'register' | 'order_placed' | 'profile_updated';
  details: string;
  timestamp: string;
}

export interface CartItem {
  id: string;
  gameId: string;
  gameName: string;
  gameLogo?: string;
  itemId: string;
  itemName: string;
  sellPrice: number;
  userId: string;
  serverId?: string;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
  read?: boolean;
}


