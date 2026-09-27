import React, { useState, useRef } from 'react';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  FileCheck,
  AlertTriangle,
  Loader2,
  PlusCircle,
  HardDrive,
} from 'lucide-react';
import { Game } from '../../types/game';
import { deleteGame, togglePublishGame, updateGame } from '../../services/gameService';

interface GameListProps {
  games: Game[];
  filterStatus?: 'all' | 'published' | 'draft';
  onEditGame: (game: Game) => void;
  onPreviewGame: (slug: string) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  filterStatus = 'all',
  onEditGame,
  onPreviewGame,
  onRefresh,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft'>(filterStatus);

  // Delete modal state
  const [deleteModalGame, setDeleteModalGame] = useState<Game | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Replace APK modal state
  const [replaceApkGame, setReplaceApkGame] = useState<Game | null>(null);
  const [newApkFile, setNewApkFile] = useState<File | null>(null);
  const [isReplacingApk, setIsReplacingApk] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);

  // Filter games
  const filteredGames = games.filter((g) => {
    if (activeFilter === 'published' && !g.published) return false;
    if (activeFilter === 'draft' && g.published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Publish/Unpublish toggle
  const handleTogglePublish = async (game: Game) => {
    await togglePublishGame(game.id, !game.published);
    onRefresh();
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteModalGame) return;
    setIsDeleting(true);
    await deleteGame(deleteModalGame.id);
    setIsDeleting(false);
    setDeleteModalGame(null);
    onRefresh();
  };

  // Handle APK Replacement
  const handleApkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.apk')) {
        setReplaceError('Please select a valid .apk file');
        return;
      }
      setNewApkFile(file);
      setReplaceError(null);
    }
  };

  const handleReplaceApkSubmit = async () => {
    if (!replaceApkGame || !newApkFile) return;
    setIsReplacingApk(true);
    setReplaceError(null);

    const res = await updateGame(
      replaceApkGame.id,
      {},
      newApkFile,
      (prog) => setReplaceProgress(prog)
    );

    setIsReplacingApk(false);
    if (res.success) {
      setReplaceApkGame(null);
      setNewApkFile(null);
      onRefresh();
    } else {
      setReplaceError(res.error || 'Failed to replace APK');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Game Catalog Management</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your Android game releases, toggle publication, replace APKs, and delete titles.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800/80">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({games.length})
          </button>
          <button
            onClick={() => setActiveFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'published'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Published ({games.filter((g) => g.published).length})
          </button>
          <button
            onClick={() => setActiveFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'draft'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Drafts ({games.filter((g) => !g.published).length})
          </button>
        </div>

        {/* Search field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Games Table */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/70 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3.5">Game</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Version / Size</th>
                <th className="px-5 py-3.5">Downloads</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredGames.length > 0 ? (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-neutral-800/30 transition-colors">
                    {/* Game Column */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={game.icon_path}
                          alt={game.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-neutral-700/60 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate">{game.name}</span>
                          <span className="text-[11px] text-neutral-500 font-mono">/{game.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-medium">
                        {game.category}
                      </span>
                    </td>

                    {/* Version & Size Column */}
                    <td className="px-5 py-3.5 font-mono">
                      <div>v{game.version}</div>
                      <div className="text-neutral-500 text-[11px]">{game.apk_size}</div>
                    </td>

                    {/* Downloads Column */}
                    <td className="px-5 py-3.5 font-mono font-medium text-emerald-400 tabular-nums">
                      {game.download_count.toLocaleString()}
                    </td>

                    {/* Status Column */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleTogglePublish(game)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          game.published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                        }`}
                        title="Click to toggle published status"
                      >
                        {game.published ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3.5 text-neutral-400 text-[11px]">
                      {new Date(game.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* Preview Button */}
                      <button
                        onClick={() => onPreviewGame(game.slug)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Replace APK Button */}
                      <button
                        onClick={() => {
                          setReplaceApkGame(game);
                          setNewApkFile(null);
                          setReplaceError(null);
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Replace APK File"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEditGame(game)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteModalGame(game)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Game"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-500">
                    No games found matching your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete "{deleteModalGame.name}"?</h3>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              This action will permanently delete this game from the database and remove all associated files (APK binary, cover image, icon, and screenshots) from Supabase Storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalGame(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting files...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace APK Modal */}
      {replaceApkGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Replace APK: {replaceApkGame.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Current: <span className="font-mono text-neutral-300">v{replaceApkGame.version}</span> ({replaceApkGame.apk_size})
                </p>
              </div>
              <button
                onClick={() => setReplaceApkGame(null)}
                className="text-neutral-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {replaceError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {replaceError}
              </div>
            )}

            <input
              ref={apkInputRef}
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              onChange={handleApkFileSelect}
              className="hidden"
            />

            <div
              onClick={() => apkInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-neutral-700 hover:border-cyan-500 bg-neutral-950 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
              {newApkFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    <span>{newApkFile.name}</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    New Size: {(newApkFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-200">
                    Click to select new APK package
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    The previous APK will only be replaced after new upload succeeds.
                  </p>
                </div>
              )}
            </div>

            {isReplacingApk && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Uploading new APK package...</span>
                  <span className="font-mono">{replaceProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${replaceProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplaceApkGame(null)}
                disabled={isReplacingApk}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplaceApkSubmit}
                disabled={!newApkFile || isReplacingApk}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isReplacingApk ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Replacing APK...</span>
                  </>
                ) : (
                  <span>Upload & Replace APK</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
