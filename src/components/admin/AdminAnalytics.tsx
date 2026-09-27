import React from 'react';
import { BarChart3, TrendingUp, DownloadCloud, Trophy, Layers } from 'lucide-react';
import { Game, GAME_CATEGORIES } from '../../types/game';

interface AdminAnalyticsProps {
  games: Game[];
  onSelectGame: (slug: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ games, onSelectGame }) => {
  const totalDownloads = games.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  // Group by category
  const categoryStats: Record<string, { count: number; downloads: number }> = {};
  GAME_CATEGORIES.forEach((cat) => {
    categoryStats[cat] = { count: 0, downloads: 0 };
  });

  games.forEach((game) => {
    if (!categoryStats[game.category]) {
      categoryStats[game.category] = { count: 0, downloads: 0 };
    }
    categoryStats[game.category].count += 1;
    categoryStats[game.category].downloads += game.download_count || 0;
  });

  // Top games by downloads
  const topGames = [...games]
    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    .slice(0, 6);

  const maxCategoryDownloads = Math.max(
    ...Object.values(categoryStats).map((s) => s.downloads),
    1
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Download Analytics</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Track real-time Android APK installations, popular gaming genres, and traffic distribution.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">All-Time Downloads</span>
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">
            {totalDownloads.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500">Real completed APK downloads</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Average Per Title</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono tabular-nums">
            {games.length > 0 ? Math.round(totalDownloads / games.length).toLocaleString() : 0}
          </div>
          <p className="text-[11px] text-neutral-500">Across {games.length} catalog items</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Top Performing Title</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white truncate">
            {topGames[0]?.name || 'N/A'}
          </div>
          <p className="text-[11px] text-amber-400 font-mono">
            {topGames[0]?.download_count?.toLocaleString() || 0} downloads
          </p>
        </div>
      </div>

      {/* Two Column Layout: Category Breakdown & Top Games Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Downloads by Category
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryStats).map(([cat, stats]) => {
              const percent = Math.round((stats.downloads / maxCategoryDownloads) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">{cat}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-neutral-500">{stats.count} games</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-emerald-400 font-medium tabular-nums">
                        {stats.downloads.toLocaleString()} DL
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Titles Leaderboard */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Top Downloaded Games
            </h2>
          </div>

          <div className="space-y-3">
            {topGames.map((game, idx) => (
              <div
                key={game.id}
                onClick={() => onSelectGame(game.slug)}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800/80 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-5 text-center font-mono font-bold text-xs ${
                      idx === 0
                        ? 'text-amber-400'
                        : idx === 1
                        ? 'text-neutral-300'
                        : idx === 2
                        ? 'text-amber-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <img
                    src={game.icon_path}
                    alt={game.name}
                    className="w-9 h-9 rounded-lg object-cover border border-neutral-700/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-emerald-400 truncate">
                      {game.name}
                    </h4>
                    <span className="text-[10px] text-neutral-500">{game.category}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                    {game.download_count.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-neutral-500">downloads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
