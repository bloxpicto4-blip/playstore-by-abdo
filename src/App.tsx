/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Search,
  Filter,
  Flame,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Game, GameCategory, GAME_CATEGORIES } from './types/game';
import { getAllGames, getGameBySlug } from './services/gameService';
import { getCurrentAdmin, logoutAdmin, AdminUser } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { GameCard } from './components/landing/GameCard';
import { CategoryFilter } from './components/landing/CategoryFilter';
import { WhyGameHub } from './components/landing/WhyGameHub';
import { StatsSection } from './components/landing/StatsSection';
import { GameDetailsPage } from './components/game/GameDetailsPage';
import { SearchModal } from './components/common/SearchModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GameList } from './components/admin/GameList';
import { GameForm } from './components/admin/GameForm';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { SupabaseSettings } from './components/admin/SupabaseSettings';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'games' | 'categories' | 'game-details' | 'admin'>('home');
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Games Data State
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Modals & Editing
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Load games from service
  const loadGames = async () => {
    setLoading(true);
    const data = await getAllGames(false);
    setGames(data);
    setLoading(false);
  };

  // Initial authentication & data fetch
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentAdmin();
      setAdminUser(user);
      setAuthChecking(false);
      await loadGames();
    };
    init();
  }, []);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handlers
  const handleNavigate = (view: string, slug?: string) => {
    if (view === 'game-details' && slug) {
      setSelectedGameSlug(slug);
      setCurrentView('game-details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedGameSlug(null);
      setCurrentView(view as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectGame = (slug: string) => {
    setSelectedGameSlug(slug);
    setCurrentView('game-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter games for public views
  const publishedGames = games.filter((g) => g.published);
  const categoryCounts: Record<string, number> = {};
  publishedGames.forEach((g) => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });

  const displayedGames = publishedGames.filter((g) => {
    const matchesCategory = categoryFilter === 'All' || g.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.short_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredGame = publishedGames[0];

  // Active game for details page
  const activeGame = selectedGameSlug ? games.find((g) => g.slug === selectedGameSlug) : null;

  // Render Admin View
  if (currentView === 'admin') {
    if (!adminUser) {
      return (
        <div className="min-h-screen bg-neutral-950">
          <AdminLogin
            onLoginSuccess={(user) => setAdminUser(user)}
            onBackToHome={() => handleNavigate('home')}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
          <SupabaseModal
            isOpen={supabaseModalOpen}
            onClose={() => setSupabaseModalOpen(false)}
            onConnectionChange={loadGames}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          setEditingGame(null);
        }}
        adminUser={adminUser}
        onLogout={async () => {
          await logoutAdmin();
          setAdminUser(null);
          setCurrentView('home');
        }}
        onBackToWebsite={() => handleNavigate('home')}
      >
        {editingGame || adminTab === 'add-game' ? (
          <GameForm
            initialGame={editingGame}
            allGames={games}
            onSaved={(savedGame) => {
              setEditingGame(null);
              loadGames();
              setAdminTab('all-games');
            }}
            onCancel={() => {
              setEditingGame(null);
              setAdminTab('all-games');
            }}
          />
        ) : adminTab === 'overview' ? (
          <AdminDashboard
            games={games}
            onNavigateTab={(tab) => setAdminTab(tab)}
            onSelectGame={handleSelectGame}
            onEditGame={(game) => setEditingGame(game)}
          />
        ) : adminTab === 'all-games' ? (
          <GameList
            games={games}
            filterStatus="all"
            onEditGame={(game) => setEditingGame(game)}
            onPreviewGame={handleSelectGame}
            onRefresh={loadGames}
            onAddNew={() => {
              setEditingGame(null);
              setAdminTab('add-game');
            }}
          />
        ) : adminTab === 'published' ? (
          <GameList
            games={games}
            filterStatus="published"
            onEditGame={(game) => setEditingGame(game)}
            onPreviewGame={handleSelectGame}
            onRefresh={loadGames}
            onAddNew={() => {
              setEditingGame(null);
              setAdminTab('add-game');
            }}
          />
        ) : adminTab === 'drafts' ? (
          <GameList
            games={games}
            filterStatus="draft"
            onEditGame={(game) => setEditingGame(game)}
            onPreviewGame={handleSelectGame}
            onRefresh={loadGames}
            onAddNew={() => {
              setEditingGame(null);
              setAdminTab('add-game');
            }}
          />
        ) : adminTab === 'statistics' ? (
          <AdminAnalytics games={games} onSelectGame={handleSelectGame} />
        ) : adminTab === 'settings' ? (
          <SupabaseSettings onConnectionChange={loadGames} />
        ) : null}

        <SupabaseModal
          isOpen={supabaseModalOpen}
          onClose={() => setSupabaseModalOpen(false)}
          onConnectionChange={loadGames}
        />
      </AdminLayout>
    );
  }

  // Render Public Website Views
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'game-details' && activeGame ? (
          <GameDetailsPage
            game={activeGame}
            allGames={publishedGames}
            onBack={() => handleNavigate('home')}
            onSelectGame={handleSelectGame}
          />
        ) : currentView === 'games' ? (
          /* All Games Browse View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Android Game Catalog
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Discover verified Android APK releases with instant cloud downloads.
                </p>
              </div>

              {/* Quick Search in header */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
              categoryCounts={categoryCounts}
            />

            {/* Games Grid */}
            {displayedGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedGames.map((game) => (
                  <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                <p className="text-sm text-neutral-400">No games found matching your current filter.</p>
                <button
                  onClick={() => {
                    setCategoryFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : currentView === 'categories' ? (
          /* Categories View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-150">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Game Genres & Categories</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Explore Android releases by specific gameplay genre.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {GAME_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <div
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setCurrentView('games');
                    }}
                    className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {cat[0]}
                      </span>
                      <span className="text-xs font-mono text-neutral-500 group-hover:text-emerald-400 transition-colors">
                        {count} {count === 1 ? 'Title' : 'Titles'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {cat}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Browse top-rated {cat.toLowerCase()} APK packages
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Default Landing Page View */
          <div className="space-y-16 sm:space-y-24">
            {/* Hero Section */}
            <HeroSection
              featuredGame={featuredGame}
              onExploreClick={() => {
                const el = document.getElementById('featured-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onLatestClick={() => {
                const el = document.getElementById('latest-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectGame={handleSelectGame}
            />

            {/* Featured Games Section */}
            <section id="featured-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                    Featured Releases
                  </h2>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Editor's Spotlight
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentView('games')}
                  className="text-xs text-neutral-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>View All Releases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* High-impact Bento showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedGames.slice(0, 3).map((game, idx) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelect={handleSelectGame}
                    featured={idx === 0}
                  />
                ))}
              </div>
            </section>

            {/* Latest Games with Interactive Filter */}
            <section id="latest-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                    Game Marketplace
                  </h2>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Explore by Genre
                  </h3>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <CategoryFilter
                selectedCategory={categoryFilter}
                onSelectCategory={setCategoryFilter}
                categoryCounts={categoryCounts}
              />

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {displayedGames.map((game) => (
                  <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
                ))}
              </div>
            </section>

            {/* Why GameHub Features */}
            <WhyGameHub />

            {/* Real Stats Section */}
            <StatsSection games={publishedGames} />

            {/* Publisher Call to Action Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-cyan-950/60 border border-emerald-500/30 p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>For Game Developers & Studios</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Ready to Publish Your Android APK?
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Upload your APK package, screenshots, and game details in the GameHub Admin Studio. Get an automatic dedicated page with direct cloud downloads in seconds.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Open Admin Studio</span>
                  </button>
                  <button
                    onClick={() => setSupabaseModalOpen(true)}
                    className="px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>View Cloud Schema</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        games={publishedGames}
        onSelectGame={handleSelectGame}
      />

      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onConnectionChange={loadGames}
      />

      {/* Global Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setCurrentView('games');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />
    </div>
  );
}
