import React from 'react';
import {
  FolderKanban,
  CheckCircle,
  DownloadCloud,
  Clock,
  PlusCircle,
  Eye,
  HardDrive,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Game } from '../../types/game';

interface AdminDashboardProps {
  games: Game[];
  onNavigateTab: (tab: any) => void;
  onSelectGame: (slug: string) => void;
  onEditGame: (game: Game) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  games,
  onNavigateTab,
  onSelectGame,
  onEditGame,
}) => {
  const totalGames = games.length;
  const publishedGames = games.filter((g) => g.published).length;
  const draftGames = totalGames - publishedGames;
  const totalDownloads = games.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  const recentGames = [...games]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time catalog analytics, Android APK releases, and storage metrics.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('add-game')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Game</span>
        </button>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Games */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Games</span>
            <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {totalGames}
          </div>
          <p className="text-[11px] text-neutral-500">In database registry</p>
        </div>

        {/* Published Games */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Published Games</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
            {publishedGames}
          </div>
          <p className="text-[11px] text-neutral-500">{draftGames} drafts pending</p>
        </div>

        {/* Total Downloads */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Downloads</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DownloadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
            {totalDownloads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Active installs tracked</span>
          </div>
        </div>

        {/* Storage State */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Storage Buckets</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono tabular-nums">
            2 Active
          </div>
          <p className="text-[11px] text-neutral-500">games-apks & games-images</p>
        </div>
      </div>

      {/* Recent Games Table */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Recently Added Games</h2>
          </div>
          <button
            onClick={() => onNavigateTab('all-games')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3.5">Game</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Version / Size</th>
                <th className="px-5 py-3.5">Downloads</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {recentGames.map((game) => (
                <tr key={game.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={game.icon_path}
                        alt={game.name}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-700/60 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">{game.name}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">/{game.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                      {game.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <div>v{game.version}</div>
                    <div className="text-neutral-500 text-[11px]">{game.apk_size}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-medium text-emerald-400 tabular-nums">
                    {game.download_count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    {game.published ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onSelectGame(game.slug)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      title="Preview Page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditGame(game)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium text-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
