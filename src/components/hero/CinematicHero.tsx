import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { GlassNav } from "./GlassNav";
import heroPosterImg from "@/assets/hero_poster.webp";
import localHeroVideo from "@/assets/hero-compressed.mp4";

export interface CinematicHeroProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    video_url?: string;
    poster_image?: string;
    cta_text?: string;
    cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
  };
}

export function CinematicHero({ content }: CinematicHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const isVisibleRef = useRef<boolean>(true);

  const title = content?.title || "";
  const ctaText = content?.cta_text || "Explore Slabs";
  const ctaLink = content?.cta_link || "/products";
  const secondaryCtaText = content?.secondary_cta_text || "Visit Showroom";
  const secondaryCtaLink = content?.secondary_cta_link || "#showroom";

  // Instant poster: custom content poster or bundled crisp first frame
  const activePoster = content?.poster_image || heroPosterImg || "/assets/hero_poster.webp";

  // Optimized video source: local compressed faststart video by default
  const videoSrc = content?.video_url || localHeroVideo || "/assets/hero-compressed.mp4";
  const isVimeo = typeof videoSrc === "string" && (videoSrc.includes("vimeo.com") || videoSrc.includes("player.vimeo.com"));

  // Fast HTML5 video playback management (IntersectionObserver & visibility change)
  useEffect(() => {
    if (isVimeo) return;
    const vid = videoRef.current;
    if (!vid) return;

    let observer: IntersectionObserver | null = null;
    if (sectionRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !document.hidden) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(sectionRef.current);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        vid.pause();
      } else if (isVisibleRef.current) {
        vid.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (observer) observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isVimeo, videoSrc]);

  // Load Vimeo API player script only if Vimeo is active
  useEffect(() => {
    if (!isVimeo) return;
    if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isVimeo]);

  // Manage Vimeo Player if a Vimeo URL is passed
  useEffect(() => {
    if (!isVimeo) return;
    let playerInstance: any = null;
    let observer: IntersectionObserver | null = null;
    let cleanupVisibility: (() => void) | null = null;

    const initPlayer = () => {
      const Vimeo = (window as any).Vimeo;
      if (!Vimeo?.Player || !iframeRef.current) return;

      try {
        playerInstance = new Vimeo.Player(iframeRef.current);
        playerRef.current = playerInstance;

        playerInstance.ready().then(() => {
          playerInstance.setMuted(true).catch(() => {});
          if (isVisibleRef.current && !document.hidden) {
            playerInstance.play().catch(() => {});
          }
        }).catch(() => {});

        if (sectionRef.current) {
          observer = new IntersectionObserver(
            ([entry]) => {
              isVisibleRef.current = entry.isIntersecting;
              if (entry.isIntersecting && !document.hidden) {
                playerInstance.play().catch(() => {});
              } else {
                playerInstance.pause().catch(() => {});
              }
            },
            { threshold: 0.15 }
          );
          observer.observe(sectionRef.current);
        }

        const handleVisibilityChange = () => {
          if (document.hidden) {
            playerInstance.pause().catch(() => {});
          } else if (isVisibleRef.current) {
            playerInstance.play().catch(() => {});
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        cleanupVisibility = () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch {}
    };

    const timer = setInterval(() => {
      if ((window as any).Vimeo?.Player && iframeRef.current) {
        clearInterval(timer);
        initPlayer();
      }
    }, 200);

    const maxTimeout = setTimeout(() => clearInterval(timer), 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(maxTimeout);
      if (observer) observer.disconnect();
      if (cleanupVisibility) cleanupVisibility();
      if (playerInstance) {
        try {
          playerInstance.destroy().catch(() => {});
        } catch {}
      }
    };
  }, [isVimeo, videoSrc]);

  const getVimeoEmbedUrl = (rawUrl?: string) => {
    let url = rawUrl || "";
    const separator = url.includes("?") ? "&" : "?";
    if (!url.includes("background=")) {
      url += `${separator}background=1&autoplay=1&muted=1&loop=1`;
    }
    return url;
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col justify-between"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Background Cinematic Video Container */}
      <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
        {/* Instant 0ms Visual Poster — eliminates blank delay */}
        {activePoster && (
          <img
            src={activePoster}
            alt="Hero Poster"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out pointer-events-none z-10 ${
              isLoaded ? "opacity-0" : "opacity-90"
            }`}
          />
        )}

        {isVimeo ? (
          <iframe
            ref={iframeRef}
            title="Hero Video"
            src={getVimeoEmbedUrl(videoSrc)}
            onLoad={() => {
              setTimeout(() => setIsLoaded(true), 300);
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.78vh] pointer-events-none border-0 scale-105 transition-opacity duration-700 ease-out ${
              isLoaded ? "opacity-90" : "opacity-0"
            }`}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={activePoster}
            onLoadedData={() => setIsLoaded(true)}
            onPlay={() => setIsLoaded(true)}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.78vh] object-cover pointer-events-none scale-105 transition-opacity duration-700 ease-out ${
              isLoaded ? "opacity-90" : "opacity-0"
            }`}
          />
        )}

        {/* Ambient Top Vignette for GlassNav */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />

        {/* Ambient Radial Soft Contrast Shield */}
        <div className="pointer-events-none absolute inset-0 bg-black/35 [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_100%)] z-10" />

        {/* Ambient Bottom Gradient to Bridge to Light Section & Enhance Text Contrast */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 sm:h-56 bg-gradient-to-t from-[#FAF8F5] via-black/60 to-transparent z-10" />
      </div>

      {/* Floating Glass Navigation */}
      <GlassNav />

      {/* Hero Bottom Content (Placed at the bottom for both Mobile & Desktop) */}
      <div className="relative z-20 flex flex-col justify-end items-center text-center px-4 sm:px-6 max-w-4xl mx-auto pb-6 sm:pb-8 mt-auto">
        {title ? (
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.2] drop-shadow-xl">
            {title}
          </h1>
        ) : null}

        {/* Hero CTAs */}
        <div className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={ctaLink}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-stone-950 transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "0 20px 40px -15px rgba(201,162,76,0.7)",
            }}
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href={secondaryCtaLink}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white/95 border border-white/30 backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          >
            <span>{secondaryCtaText}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default CinematicHero;
