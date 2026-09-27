import React from 'react';
import { Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Game } from '../../types/game';

interface GameCardProps {
  game: Game;
  onSelect: (slug: string) => void;
  featured?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, featured = false }) => {
  return (
    <div
      onClick={() => onSelect(game.slug)}
      className={`group relative flex flex-col rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 hover:bg-neutral-850/90 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-emerald-950/20 hover:-translate-y-1.5 ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      {/* Cover / Media Area */}
      <div
        className={`relative overflow-hidden bg-neutral-950 shrink-0 ${
          featured ? 'md:w-3/5 h-64 md:h-auto min-h-[220px]' : 'h-48 w-full'
        }`}
      >
        <img
          src={game.cover_path}
          alt={game.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Cinematic gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category & Status watermark indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-emerald-400 border border-white/10">
            {game.category}
          </span>
        </div>

        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-neutral-300 border border-white/10">
            {game.apk_size}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col justify-between p-5 flex-1 min-w-0">
        <div>
          {/* Header with Icon and Title */}
          <div className="flex items-start gap-3.5 mb-2.5">
            <img
              src={game.icon_path}
              alt={`${game.name} icon`}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-neutral-700/80 shrink-0 shadow-md group-hover:border-emerald-500/50 transition-colors"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors truncate">
                {game.name}
              </h3>
              {/* Zero-pill metadata line with typographic separator */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span>{game.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-neutral-400">v{game.version}</span>
                <span aria-hidden="true">·</span>
                <span>{game.download_count.toLocaleString()} DL</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
            {game.short_description}
          </p>
        </div>

        {/* Card Footer: Action & Verification */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>APK Verified</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Get APK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
