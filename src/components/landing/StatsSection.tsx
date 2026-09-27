import React from 'react';
import { Game } from '../../types/game';

interface StatsSectionProps {
  games: Game[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ games }) => {
  const totalDownloads = games.reduce((acc, curr) => acc + (curr.download_count || 0), 0);
  const categoriesCount = new Set(games.map((g) => g.category)).size;
  const totalGamesCount = games.length;

  return (
    <section className="w-full py-12 bg-neutral-900/30 border-y border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums tracking-tight">
              {totalGamesCount}
            </div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Games Available
            </div>
            <p className="text-[11px] text-neutral-500">Curated & community published</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tabular-nums tracking-tight">
              {totalDownloads.toLocaleString()}+
            </div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total APK Downloads
            </div>
            <p className="text-[11px] text-neutral-500">Tracked in real-time</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tabular-nums tracking-tight">
              {categoriesCount}
            </div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Gaming Genres
            </div>
            <p className="text-[11px] text-neutral-500">From Action to Strategy</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono tabular-nums tracking-tight">
              100%
            </div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Persistent Storage
            </div>
            <p className="text-[11px] text-neutral-500">Cloud powered by Supabase</p>
          </div>
        </div>
      </div>
    </section>
  );
};
