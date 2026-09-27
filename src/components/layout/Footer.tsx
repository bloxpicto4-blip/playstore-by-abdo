import React from 'react';
import { Gamepad2, ShieldCheck, Database, Layers, Github } from 'lucide-react';
import { GAME_CATEGORIES, GameCategory } from '../../types/game';

interface FooterProps {
  onSelectCategory: (category: GameCategory) => void;
  onNavigate: (view: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigate,
  onOpenSupabaseModal,
}) => {
  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-900 pt-16 pb-12 text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-900">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-neutral-950" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">GameHub</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The modern Android game publishing platform. Direct APK uploads, persistent Supabase cloud storage, instant game page generation, and zero download limits.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Safe APKs
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Supabase Storage
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Discover Games
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('games')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  All APK Releases
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-emerald-400 transition-colors text-emerald-400/90 font-medium"
                >
                  Publish Game (Admin)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSupabaseModal}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Database & Storage Setup
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Browse Categories
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {GAME_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className="text-left text-neutral-400 hover:text-emerald-400 transition-colors truncate"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Architecture / Deployment Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Architecture
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Powered by Supabase PostgreSQL, Supabase Storage buckets (<code className="text-neutral-300">games-apks</code>, <code className="text-neutral-300">games-images</code>), and Supabase Auth.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenSupabaseModal}
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Supabase Schema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} GameHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Android APK Distribution System</span>
            <span>·</span>
            <span>Production Ready for Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
