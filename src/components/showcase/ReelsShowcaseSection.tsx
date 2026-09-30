import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Sparkles,
  ArrowRight,
  Film,
} from "lucide-react";
import { getPublicReels, recordReelView, recordReelLike, ReelItem, API_BASE_URL } from "@/lib/api";
import localVideo from "@/assets/npd-compressed.mp4";

export interface ReelsShowcaseSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
  };
}

export function ReelsShowcaseSection({ content }: ReelsShowcaseSectionProps) {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const title = content?.title || "Latest from Our Showroom";
  const badge = content?.badge || "SHOWROOM REELS";
  const subtitle =
    content?.subtitle ||
    "Short-format video dispatches, live material inspections, and monolithic slab highlights.";

  useEffect(() => {
    let isMounted = true;
    getPublicReels()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.reels)) {
          setReels(res.reels);
        }
      })
      .catch(() => {
        // Fallback or seed default
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveVideoUrl = (url: string) => {
    if (!url) return localVideo;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/assets/")) return url;
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolveThumbUrl = (url?: string) => {
    if (!url) return "/assets/marble-slabs-corner-v2.png";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) return url;
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleOpenReel = (index: number) => {
    setActiveReelIndex(index);
    setIsPlaying(true);
    const selected = reels[index];
    if (selected) {
      recordReelView(selected.id).catch(() => {});
      // Optimistically update views in state
      setReels((prev) =>
        prev.map((r, i) => (i === index ? { ...r, views_count: (r.views_count || 0) + 1 } : r))
      );
    }
  };

  const handleCloseModal = () => {
    setActiveReelIndex(null);
  };

  const handleNextReel = () => {
    if (activeReelIndex === null) return;
    const nextIdx = (activeReelIndex + 1) % reels.length;
    handleOpenReel(nextIdx);
  };

  const handlePrevReel = () => {
    if (activeReelIndex === null) return;
    const prevIdx = (activeReelIndex - 1 + reels.length) % reels.length;
    handleOpenReel(prevIdx);
  };

  const handleLike = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    recordReelLike(id).catch(() => {});
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r))
    );
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // If no reels are available, don't show an empty broken block
  if (!loading && reels.length === 0) {
    return null;
  }

  const currentReel = activeReelIndex !== null ? reels[activeReelIndex] : null;

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-2">
              <Film className="h-3 w-3 text-amber-800" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-900 font-mono">
                {badge}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-stone-950 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-1 text-stone-600 text-xs sm:text-sm font-normal max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Link
              to="/reels"
              className="inline-flex items-center gap-1 text-[11px] font-mono tracking-wider uppercase text-amber-900 hover:text-amber-700 font-semibold mr-2"
            >
              <span>View All Reels</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <button
              onClick={scrollLeft}
              className="h-9 w-9 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-800 transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              className="h-9 w-9 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-800 transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Reels Carousel (Vertical 9:16 Cards) */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => handleOpenReel(idx)}
              className="group relative flex-none w-[190px] sm:w-[220px] md:w-[240px] aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer border border-stone-300/80 bg-stone-900 shadow-sm hover:shadow-xl transition-all duration-300 snap-start select-none"
            >
              {/* Cover Thumbnail Image */}
              <img
                src={resolveThumbUrl(reel.thumbnail_url)}
                alt={reel.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Ambient Dark Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30 group-hover:via-black/45 transition-colors" />

              {/* Top Bar: Category Pill & Views */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <span className="text-[9px] font-mono tracking-widest text-amber-300 uppercase bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-400/30">
                  {reel.category || "Showroom"}
                </span>

                {reel.views_count ? (
                  <span className="text-[9px] font-mono text-white/80 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5 text-stone-300" />
                    {reel.views_count.toLocaleString()}
                  </span>
                ) : null}
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-stone-950 transition-all duration-300 shadow-lg">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-10 text-left">
                <h3 className="text-sm font-serif font-medium text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-amber-200 transition-colors">
                  {reel.title}
                </h3>
                {reel.description && (
                  <p className="text-[10px] text-stone-300 font-sans line-clamp-1 mt-0.5 opacity-85">
                    {reel.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9:16 Full-screen Vertical Reel Modal Viewer */}
      {currentReel && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          {/* Close Backdrop Button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
            aria-label="Close Viewer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrevReel}
            className="hidden md:flex absolute left-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-50 cursor-pointer active:scale-95"
            aria-label="Previous Reel"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextReel}
            className="hidden md:flex absolute right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-50 cursor-pointer active:scale-95"
            aria-label="Next Reel"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Reel Card Container (Fixed 9:16 aspect ratio) */}
          <div className="relative w-full max-w-[360px] sm:max-w-[400px] h-[85vh] max-h-[720px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col justify-between">
            {/* HTML5 Video Element */}
            <video
              ref={modalVideoRef}
              src={resolveVideoUrl(currentReel.video_url)}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              onClick={() => setIsPlaying(!isPlaying)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            />

            {/* Ambient Vignette Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-transparent to-black/60" />

            {/* Top Bar Controls */}
            <div className="relative z-20 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-400/30 font-semibold">
                  {currentReel.category || "Showroom"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                  aria-label="Toggle Mute"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Middle Play/Pause Indicator (shown briefly or if paused) */}
            {!isPlaying && (
              <div
                onClick={() => {
                  modalVideoRef.current?.play();
                  setIsPlaying(true);
                }}
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
              >
                <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Info & Engagement Bar */}
            <div className="relative z-20 p-4 sm:p-5 text-left text-white space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-normal text-white leading-snug">
                  {currentReel.title}
                </h3>
                {currentReel.description && (
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2 font-normal leading-relaxed">
                    {currentReel.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              {Array.isArray(currentReel.tags) && currentReel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentReel.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[9.5px] font-mono text-stone-300 bg-white/10 px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="pt-1 flex items-center justify-between border-t border-white/15">
                <button
                  type="button"
                  onClick={(e) => handleLike(e, currentReel.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <span className="font-mono text-[11px]">
                    {(currentReel.likes_count || 0).toLocaleString()}
                  </span>
                </button>

                <a
                  href="#contact"
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--gradient-gold)] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity"
                >
                  <span>Enquire Reel</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReelsShowcaseSection;
