import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useLenis } from "@/hooks/useLenis";
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
  Film,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getPublicReels, recordReelView, recordReelLike, ReelItem, API_BASE_URL } from "@/lib/api";
import localVideo from "@/assets/npd-compressed.mp4";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Showroom Reels & Video Blog — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "Explore short-format architectural reels, continuous slab veining walkthroughs, and live showroom exhibitions.",
      },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  useLenis();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getPublicReels(selectedCategory)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.reels)) {
          setReels(res.reels);
          if (res.categories && res.categories.length > 0) {
            setCategories(["All", ...res.categories]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const resolveVideoUrl = (url: string) => {
    if (!url) return localVideo;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) return url;
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

  const currentReel = activeReelIndex !== null ? reels[activeReelIndex] : null;

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans">
      <GlassNav />

      {/* Hero Header */}
      <section className="pt-28 pb-10 sm:pt-36 sm:pb-14 px-4 sm:px-8 bg-gradient-to-b from-stone-950 via-stone-900 to-[#1C1816] text-white relative">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/25 bg-amber-500/10 text-amber-300">
            <Film className="h-3.5 w-3.5" />
            <span className="text-[10.5px] font-mono tracking-[0.25em] uppercase font-semibold">
              SHOWROOM VIDEO JOURNAL
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#E9E5DC]">
            Video Blog &amp; Showroom Reels
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed font-light">
            Short-format walkthroughs, full-slab scale tests, and live material installations direct from our flagship experience centers.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[var(--gradient-gold)] text-stone-950 font-bold shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reels Grid Section */}
      <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-mono tracking-widest uppercase">Loading Active Reels...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
            <Film className="h-10 w-10 text-stone-400 mx-auto" />
            <h3 className="text-lg font-serif text-stone-800">No Active Reels</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              There are currently no active video reels in this category or they have concluded their publication window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {reels.map((reel, idx) => (
              <div
                key={reel.id}
                onClick={() => handleOpenReel(idx)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer border border-stone-300/80 bg-stone-900 shadow-sm hover:shadow-2xl transition-all duration-300 select-none flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <img
                  src={resolveThumbUrl(reel.thumbnail_url)}
                  alt={reel.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/30 group-hover:via-black/45 transition-colors" />

                {/* Top Badge */}
                <div className="relative z-10 p-3 flex items-center justify-between">
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

                {/* Center Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-stone-950 transition-all duration-300 shadow-lg">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Title & Description */}
                <div className="relative z-10 p-3.5 text-left">
                  <h3 className="text-sm font-serif font-medium text-white leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {reel.title}
                  </h3>
                  {reel.description && (
                    <p className="text-[10.5px] text-stone-300 font-sans line-clamp-1 mt-0.5 opacity-85">
                      {reel.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 9:16 Full-screen Vertical Reel Modal Viewer */}
      {currentReel && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
            aria-label="Close Viewer"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={handlePrevReel}
            className="hidden md:flex absolute left-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-50 cursor-pointer active:scale-95"
            aria-label="Previous Reel"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNextReel}
            className="hidden md:flex absolute right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-50 cursor-pointer active:scale-95"
            aria-label="Next Reel"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-[360px] sm:max-w-[400px] h-[85vh] max-h-[720px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col justify-between">
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

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-transparent to-black/60" />

            <div className="relative z-20 p-4 flex items-center justify-between text-white">
              <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-400/30 font-semibold">
                {currentReel.category || "Showroom"}
              </span>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Toggle Mute"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

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

                <Link
                  to="/contact"
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--gradient-gold)] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity"
                >
                  <span>Enquire Reel</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default ReelsPage;
