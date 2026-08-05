export interface Review {
  id: string;
  customerName: string;
  gameName: string;
  itemName: string;
  rating: number; // 1 - 5
  comment: string;
  date: string;
  verified: boolean;
  avatarUrl?: string;
}

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Aiman Syafiq',
    gameName: 'Free Fire',
    itemName: '520 Diamond',
    rating: 5,
    comment: 'Pantas gilerrr! Tak sampai 15 saat diamond terus masuk. Owner ramah melayan kat WhatsApp. Trusted seller TopupBalz 🔥',
    date: '2 jam yang lalu',
    verified: true,
  },
  {
    id: 'rev-2',
    customerName: 'Daniel Haqim',
    gameName: 'Mobile Legends: Bang Bang',
    itemName: 'Weekly Diamond Pass',
    rating: 5,
    comment: 'Harga memang tersangat murah berbanding kedai lain. Bayar guna Touch n Go eWallet imbas QR terus selesai.',
    date: '5 jam yang lalu',
    verified: true,
  },
  {
    id: 'rev-3',
    customerName: 'Nur Farhana',
    gameName: 'PUBG Mobile',
    itemName: '325 UC',
    rating: 5,
    comment: 'First time topup kat sini, memula ragu-ragu jugak tapi bila try terus mantap! Resit whatsapp terus admin reply.',
    date: 'Semalam',
    verified: true,
  },
  {
    id: 'rev-4',
    customerName: 'Luqman Hakim',
    gameName: 'Honor of Kings (HOK)',
    itemName: '400 Tokens',
    rating: 5,
    comment: 'Servis terpantas 24 jam. Malam buta pun order jalan terus. Highly recommended untuk gamers Malaysia!',
    date: '2 hari yang lalu',
    verified: true,
  },
  {
    id: 'rev-5',
    customerName: 'Khairol Nizam',
    gameName: 'Genshin Impact',
    itemName: 'Blessing of the Welkin Moon',
    rating: 5,
    comment: 'Murah giler + RM1 je dari harga asal. Memang berbaloi topup sini!',
    date: '3 hari yang lalu',
    verified: true,
  },
];
