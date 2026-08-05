import React from 'react';
import { Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onSelectGame: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group relative rounded-2xl bg-[#0D1117] border border-slate-800 hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(255,140,0,0.35)] cursor-pointer flex flex-col justify-between overflow-hidden backdrop-blur-md"
    >
      {/* Top Image Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={game.logoUrl}
          alt={game.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/20 to-transparent" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {game.isDiscounted && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3 fill-current" />
              <span>PROMO</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-orange-400 transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Proses Otomatik 24 Jam</span>
          </p>
        </div>

        {/* Action Button Row - Price hidden on outside card as requested */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pakej Sedia</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectGame(game);
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:from-orange-400 hover:to-amber-400 shadow-[0_0_12px_rgba(255,140,0,0.4)] group-hover:shadow-[0_0_20px_rgba(255,140,0,0.7)] transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Top Up Sekarang</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
