import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Check, CheckCheck, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  isOpen,
  onClose,
  userName = 'Pelanggan',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getEffectiveUserName = () => {
    if (userName && userName !== 'Pelanggan') return userName;
    try {
      const stored = localStorage.getItem('topupbalz_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && parsed.name !== 'Pelanggan') {
          return parsed.name;
        }
      }
    } catch (e) {}
    return userName || 'Pelanggan';
  };

  const getSessionId = () => {
    let sId = sessionStorage.getItem('topupbalz_session_id');
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('topupbalz_session_id', sId);
    }
    return sId;
  };

  const fetchMessages = async () => {
    try {
      const sId = getSessionId();
      const name = getEffectiveUserName();
      const res = await fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sId)}&userName=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2500); // 2.5s polling
      return () => clearInterval(interval);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || inputText;
    if (!textToSend.trim() || sending) return;

    setSending(true);
    const sId = getSessionId();
    const name = getEffectiveUserName();
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          sender: 'user',
          senderName: name,
          message: textToSend.trim(),
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      if (!customMsg) setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0D1117] border border-emerald-500/40 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* WhatsApp Style Green Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 flex items-center justify-between text-white shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-300 flex items-center justify-center text-emerald-400 font-bold shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>Admin TopupBalz</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-900/60 text-emerald-200 border border-emerald-400/40 uppercase">
                  24/7 Live
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                <span>Online & Sedia Membantu 24 Jam</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white transition-all cursor-pointer"
              title="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="bg-[#121824] px-3 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-300 shrink-0">
          <span className="text-[10px] text-slate-500 font-bold shrink-0">Soalan Lazim:</span>
          <button
            onClick={() => handleSendMessage(undefined, 'Hai Admin, macam mana nak semak status order topup saya?')}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap cursor-pointer"
          >
            🔍 Semak Status Order
          </button>
          <button
            onClick={() => handleSendMessage(undefined, 'Admin, game apa yang ada promo terbaik hari ini?')}
            className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap cursor-pointer"
          >
            🔥 Info Promo Game
          </button>
          <button
            onClick={() => handleSendMessage(undefined, 'Sy perlukan bantuan masalah bayaran FPX/TNG.')}
            className="px-2.5 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 whitespace-nowrap cursor-pointer"
          >
            💳 Masalah Pembayaran
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0E14] bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none border border-emerald-500/40'
                      : 'bg-[#161D2E] text-slate-200 rounded-bl-none border border-slate-700/80'
                  }`}
                >
                  {!isUser && (
                    <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{msg.senderName}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div
                    className={`mt-1 text-[9px] font-mono flex items-center justify-end gap-1 ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="p-3 bg-[#121824] border-t border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Tulis mesej kepada Admin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#080B10] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
