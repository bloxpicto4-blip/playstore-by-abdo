import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: string[];
  gameName: string;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
  screenshots,
  gameName,
}) => {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // If no screenshots provided
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
        No screenshots uploaded for this game yet.
      </div>
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      if (e.key === 'Escape') {
        setFullscreenIndex(null);
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setFullscreenIndex((prev) => (prev !== null ? (prev + 1) % screenshots.length : 0));
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        setFullscreenIndex((prev) =>
          prev !== null ? (prev - 1 + screenshots.length) % screenshots.length : 0
        );
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, screenshots.length]);

  return (
    <div className="relative w-full">
      {/* Scroll Controls (Desktop) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Screenshots & Gameplay</h3>
        {screenshots.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
        style={{ scrollbarGutter: 'stable' }}
      >
        {screenshots.map((imgUrl, index) => (
          <div
            key={index}
            onClick={() => setFullscreenIndex(index)}
            className="group relative shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-emerald-500/50 transition-all duration-200 bg-neutral-900 w-72 sm:w-80 md:w-96 aspect-[16/9]"
          >
            <img
              src={imgUrl}
              alt={`${gameName} screenshot ${index + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="p-3 rounded-xl bg-neutral-950/80 text-white backdrop-blur-md border border-white/10 shadow-lg">
                <Maximize2 className="w-5 h-5 text-emerald-400" />
              </span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
              {index + 1} / {screenshots.length}
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-150"
          onClick={() => {
            setFullscreenIndex(null);
            setIsZoomed(false);
          }}
        >
          {/* Top action bar */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setFullscreenIndex(null);
                setIsZoomed(false);
              }}
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenIndex((fullscreenIndex - 1 + screenshots.length) % screenshots.length);
                setIsZoomed(false);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenIndex((fullscreenIndex + 1) % screenshots.length);
                setIsZoomed(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Active Image container */}
          <div
            className="max-w-6xl max-h-[85vh] flex items-center justify-center overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={screenshots[fullscreenIndex]}
              alt={`${gameName} fullscreen view`}
              referrerPolicy="no-referrer"
              className={`rounded-xl object-contain transition-transform duration-200 select-none ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[80vh] cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          {/* Bottom Counter & Thumbnail strip */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-mono text-neutral-300">
              {fullscreenIndex + 1} of {screenshots.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
