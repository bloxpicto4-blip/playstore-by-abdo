import React from 'react';
import { ArrowDown, Flame, Sparkles, DownloadCloud, ShieldCheck, Zap } from 'lucide-react';
import { Game } from '../../types/game';
import heroBannerImg from '../../assets/images/hero_banner_gaming_1790511595362.jpg';

interface HeroSectionProps {
  featuredGame?: Game;
  onExploreClick: () => void;
  onLatestClick: () => void;
  onSelectGame: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredGame,
  onExploreClick,
  onLatestClick,
  onSelectGame,
}) => {
  return (
    <section className="relative w-full overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Dynamic Background Art with Volumetric Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <img
          src={heroBannerImg}
          alt="Hero Background Art"
          className="w-full h-full object-cover object-center opacity-25 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/90 to-neutral-950" />
        {/* Subtle radial emerald & sapphire illumination */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Android APK Publishing Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] text-balance">
              DISCOVER YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                NEXT GAME
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed">
              Explore high-octane indie games and AAA Android titles. Direct APK package downloads, verified safe releases, and instant cloud-backed publishing for developers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Flame className="w-4 h-4 fill-neutral-950" />
                <span>EXPLORE GAMES</span>
              </button>

              <button
                onClick={onLatestClick}
                className="px-6 py-3.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-600 text-neutral-200 font-semibold text-sm transition-all duration-200 flex items-center gap-2"
              >
                <span>LATEST RELEASES</span>
                <ArrowDown className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Quantitative Proof Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                  52,500+
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">APK Downloads</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                  100%
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">Direct APK Cloud</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tabular-nums">
                  0s
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">Wait Time</div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Marquee Game Card */}
          {featuredGame && (
            <div className="lg:col-span-5 relative">
              {/* Decorative background aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-50" />

              <div
                onClick={() => onSelectGame(featuredGame.slug)}
                className="relative rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl overflow-hidden group cursor-pointer hover:border-emerald-500/60 transition-all duration-300"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-950">
                  <img
                    src={featuredGame.cover_path}
                    alt={featuredGame.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-md">
                      Featured Pick
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-neutral-200 text-xs font-mono border border-white/10">
                      {featuredGame.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <img
                      src={featuredGame.icon_path}
                      alt={featuredGame.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shadow-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {featuredGame.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-300 mt-0.5">
                        <span className="font-mono">v{featuredGame.version}</span>
                        <span>·</span>
                        <span>{featuredGame.apk_size}</span>
                        <span>·</span>
                        <span>{featuredGame.download_count.toLocaleString()} Downloads</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Safe package verified</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Download APK</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
