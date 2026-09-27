import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Download, Tag, ArrowRight } from 'lucide-react';
import { Game } from '../../types/game';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onSelectGame: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(games.map((g) => g.category)))];

  const filteredGames = games.filter((game) => {
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesName = game.name.toLowerCase().includes(q);
    const matchesDesc = game.short_description.toLowerCase().includes(q) || game.description.toLowerCase().includes(q);
    const matchesCat = game.category.toLowerCase().includes(q);
    return matchesCategory && (matchesName || matchesDesc || matchesCat);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div 
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-neutral-800 bg-neutral-950/60">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search games by title, category, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-200 mr-2"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono text-neutral-400 bg-neutral-800 rounded border border-neutral-700 hover:text-neutral-200"
          >
            ESC
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-neutral-800/60 bg-neutral-900/40 text-xs">
          <span className="text-neutral-500 mr-1 shrink-0">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-800/60 p-2">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  onSelectGame(game.slug);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={game.icon_path}
                    alt={game.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-700/60"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors truncate">
                        {game.name}
                      </h4>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs font-mono text-neutral-400">{game.version}</span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate max-w-md">
                      {game.short_description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                      <span>{game.category}</span>
                      <span>·</span>
                      <span>{game.apk_size}</span>
                      <span>·</span>
                      <span>{game.download_count.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Game
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-400 text-sm">No games found matching "{query}"</p>
              <p className="text-neutral-600 text-xs mt-1">Try another title, category, or clear search filters</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-neutral-950/80 border-t border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
          <span>Found {filteredGames.length} games</span>
          <span>Tip: Press ESC anytime to dismiss</span>
        </div>
      </div>
    </div>
  );
};
