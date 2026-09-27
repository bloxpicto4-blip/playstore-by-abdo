import React, { useState } from 'react';
import { Gamepad2, Search, Database, ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabase';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  onOpenSearch: () => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenSupabaseModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isConnected = isSupabaseConfigured();

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Gamepad2 className="w-5 h-5 text-neutral-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              GameHub
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Text with hover states) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors hover:text-white ${
              currentView === 'home' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => handleNavClick('games')}
            className={`transition-colors hover:text-white ${
              currentView === 'games' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className={`transition-colors hover:text-white ${
              currentView === 'categories' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${
              currentView.startsWith('admin') ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            <span>Admin Studio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Publish
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Search & Supabase Status) */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all text-xs"
            aria-label="Search games"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search APKs...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800 rounded border border-neutral-700">
              ⌘K
            </kbd>
          </button>

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="Supabase Storage & DB connection status"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isConnected ? 'Supabase Connected' : 'Supabase Ready'}</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left py-2 text-base font-medium text-neutral-200 hover:text-emerald-400"
          >
            Discover
          </button>
          <button
            onClick={() => handleNavClick('games')}
            className="w-full text-left py-2 text-base font-medium text-neutral-200 hover:text-emerald-400"
          >
            All Games
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="w-full text-left py-2 text-base font-medium text-neutral-200 hover:text-emerald-400"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left py-2 text-base font-medium text-emerald-400 flex items-center justify-between"
          >
            <span>Admin Studio</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Publish Game
            </span>
          </button>
          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
            <button
              onClick={() => {
                onOpenSupabaseModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-neutral-400 flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isConnected ? 'Supabase: Connected' : 'Configure Supabase'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
