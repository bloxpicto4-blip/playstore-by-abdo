import React, { useState } from 'react';
import {
  Download,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  Share2,
  Sparkles,
  Smartphone,
  HardDrive,
  Clock,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Game } from '../../types/game';
import { ScreenshotGallery } from './ScreenshotGallery';
import { GameCard } from '../landing/GameCard';
import { downloadRealApk } from '../../services/storageService';
import { incrementDownloadCount } from '../../services/gameService';

interface GameDetailsPageProps {
  game: Game;
  allGames: Game[];
  onBack: () => void;
  onSelectGame: (slug: string) => void;
}

export const GameDetailsPage: React.FC<GameDetailsPageProps> = ({
  game,
  allGames,
  onBack,
  onSelectGame,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadCount, setDownloadCount] = useState(game.download_count);
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedGames = allGames
    .filter((g) => g.id !== game.id && g.category === game.category && g.published)
    .slice(0, 3);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      // 1. Increment download count in database / storage
      const newCount = await incrementDownloadCount(game.id);
      setDownloadCount(newCount);

      // 2. Download the real APK file
      const result = await downloadRealApk(game.apk_path, game.name, game.version);

      if (result.success) {
        setDownloadSuccess(true);
        // Fire confetti celebration!
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1'],
        });

        setTimeout(() => setDownloadSuccess(false), 5000);
      } else {
        alert(result.error || 'Failed to download APK package');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Unable to complete APK download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?game=${encodeURIComponent(game.slug)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Helper to parse description sections (headings, bullet points)
  const renderDescription = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-white mt-6 mb-2">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        return (
          <li key={idx} className="text-sm text-neutral-300 ml-4 list-disc mb-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm text-neutral-300 leading-relaxed mb-3">
          <span dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />
        </p>
      );
    });
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  };

  return (
    <div className="w-full pb-24 text-neutral-100 animate-in fade-in duration-200">
      {/* Back Button & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Games</span>
        </button>
      </div>

      {/* Cinematic Cover Backdrop & Hero Area */}
      <div className="relative w-full overflow-hidden bg-neutral-950 border-y border-neutral-850">
        {/* Blurred ambient background image */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <img
            src={game.cover_path}
            alt={game.name}
            className="w-full h-full object-cover object-center filter blur-xl opacity-30 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/90" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Game Identity & Meta */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={game.icon_path}
                alt={`${game.name} icon`}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-2 border-neutral-700/80 shadow-2xl shrink-0 bg-neutral-900"
              />

              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
                    {game.category}
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Safe APK
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs text-neutral-400 font-mono">v{game.version}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {game.name}
                </h1>

                <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                  {game.short_description}
                </p>

                {/* Metadata strip */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-neutral-200">{game.apk_size}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                      {downloadCount.toLocaleString()} Downloads
                    </span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Updated {new Date(game.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Download Action Card */}
            <div className="lg:col-span-4 w-full">
              <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                  <span>Android Package (.apk)</span>
                  <span className="font-mono text-neutral-200">{game.apk_size}</span>
                </div>

                {/* Primary Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl relative overflow-hidden group ${
                    downloadSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
                      <span>Preparing Real APK...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>APK Download Started!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      <span>DOWNLOAD APK ({game.apk_size})</span>
                    </>
                  )}
                </button>

                {/* Share and Info */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Android 8.0+ Compatible</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 leading-tight">
                  <span className="font-semibold text-neutral-300">Direct Cloud Link: </span>
                  Stored in Supabase <code className="text-emerald-400">games-apks</code> bucket. No third-party redirect ads.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Screenshots & Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Screenshot Gallery Section */}
        {game.screenshots && game.screenshots.length > 0 && (
          <section>
            <ScreenshotGallery screenshots={game.screenshots} gameName={game.name} />
          </section>
        )}

        {/* Game Details & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-3">
              About {game.name}
            </h3>
            <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
              {renderDescription(game.description)}
            </div>
          </div>

          {/* Sidebar Specs Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Technical Information
              </h4>
              <dl className="divide-y divide-neutral-800/80 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">Package Format</dt>
                  <dd className="font-mono text-neutral-200">Android APK (.apk)</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">Package Version</dt>
                  <dd className="font-mono text-neutral-200">v{game.version}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">File Size</dt>
                  <dd className="font-mono text-neutral-200">{game.apk_size}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">Category</dt>
                  <dd className="text-neutral-200">{game.category}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">Release Date</dt>
                  <dd className="text-neutral-200">{new Date(game.created_at).toLocaleDateString()}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-neutral-400">Storage Provider</dt>
                  <dd className="text-emerald-400 font-medium">Supabase Storage</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Similar Games in Category */}
        {relatedGames.length > 0 && (
          <section className="pt-8 border-t border-neutral-850">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                More in {game.category}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedGames.map((related) => (
                <GameCard key={related.id} game={related} onSelect={onSelectGame} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
