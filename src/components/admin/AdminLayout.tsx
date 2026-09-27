import React, { useState } from 'react';
import {
  Gamepad2,
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  CheckCircle,
  FileEdit,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { AdminUser } from '../../services/authService';

export type AdminTab =
  | 'overview'
  | 'all-games'
  | 'add-game'
  | 'published'
  | 'drafts'
  | 'statistics'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminUser: AdminUser;
  onLogout: () => void;
  onBackToWebsite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  onLogout,
  onBackToWebsite,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: { tab: AdminTab; label: string; icon: React.ElementType }[] = [
    { tab: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { tab: 'all-games', label: 'All Games', icon: FolderKanban },
    { tab: 'add-game', label: 'Add New Game', icon: PlusCircle },
    { tab: 'published', label: 'Published Games', icon: CheckCircle },
    { tab: 'drafts', label: 'Draft Games', icon: FileEdit },
    { tab: 'statistics', label: 'Download Analytics', icon: BarChart3 },
    { tab: 'settings', label: 'Supabase & Storage', icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-neutral-950" />
          </div>
          <span className="font-bold text-white tracking-tight">GameHub Studio</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900/95 border-r border-neutral-800 backdrop-blur-xl flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Brand Wordmark */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Gamepad2 className="w-5 h-5 text-neutral-950" />
              </div>
              <div>
                <span className="text-base font-bold text-white block">GameHub</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold block">
                  Publishing Studio
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-neutral-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleTabClick(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Website Links */}
        <div className="p-6 border-t border-neutral-800/80 space-y-3">
          {/* Return to website */}
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </button>

          {/* User profile & logout */}
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-white truncate">{adminUser.email}</p>
              <p className="text-[10px] text-emerald-400">Authenticated Admin</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
