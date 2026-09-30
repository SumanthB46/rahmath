import { useState, useEffect, useRef } from "react";
import showroomImg from "@/assets/showroom_experience.png";
import localVideo from "@/assets/npd-compressed.mp4";

export interface VideoShowcaseProps {
  content?: {
    video_url?: string;
    poster_image?: string;
    title?: string;
    subtitle?: string;
    badge?: string;
  };
  posterImage?: string;
}

export function VideoShowcaseSection({ content, posterImage }: VideoShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isVisibleRef = useRef<boolean>(false);

  // Active poster fallback: custom passed in content, or prop, or bundled showroom image
  const activePoster = content?.poster_image || posterImage || showroomImg;

  // Active video source: prioritize local video unless user specifies custom URL
  const videoSrc = content?.video_url || localVideo || "/assets/npd-compressed.mp4";
  const isVimeo = typeof videoSrc === "string" && (videoSrc.includes("vimeo.com") || videoSrc.includes("player.vimeo.com"));

  // Observer to detect when section enters viewport (within 400px)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setIsInView(true);
        }
        if (!isVimeo && videoRef.current) {
          if (entry.isIntersecting && !document.hidden) {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        }
      },
      { rootMargin: "400px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVimeo]);

  // Tab visibility management for HTML5 video
  useEffect(() => {
    if (isVimeo) return;
    const vid = videoRef.current;
    if (!vid) return;

    const handleVisibility = () => {
      if (document.hidden) {
        vid.pause();
      } else if (isVisibleRef.current) {
        vid.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isVimeo]);

  // Load Vimeo API player script only when Vimeo is active
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
    if (!isVimeo || !isInView) return;

    let playerInstance: any = null;
    let cleanupVisibility: (() => void) | null = null;

    const initPlayer = () => {
      const Vimeo = (window as any).Vimeo;
      if (!Vimeo?.Player || !iframeRef.current) return;

      try {
        playerInstance = new Vimeo.Player(iframeRef.current);

        playerInstance.ready().then(() => {
          playerInstance.setMuted(true).catch(() => {});
          if (isVisibleRef.current && !document.hidden) {
            playerInstance.play().catch(() => {});
          }
        }).catch(() => {});

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
      if (cleanupVisibility) cleanupVisibility();
      if (playerInstance) {
        try {
          playerInstance.destroy().catch(() => {});
        } catch {}
      }
    };
  }, [isInView, isVimeo, videoSrc]);

  const getVimeoSrc = (rawUrl?: string) => {
    let url = rawUrl || "";
    const separator = url.includes("?") ? "&" : "?";
    if (!url.includes("background=")) {
      url += `${separator}background=1&autoplay=1&loop=1&muted=1&autopause=0`;
    }
    return url;
  };

  return (
    <section
      ref={containerRef}
      className="w-full py-0 px-0 bg-[#F5F1EB] text-stone-900 relative z-10 overflow-hidden border-t border-b border-stone-200"
    >
      <div className="w-full relative z-10">
        {/* Full-width Responsive Video Banner with 28.65% Native Aspect Ratio */}
        <div
          className="relative w-full overflow-hidden bg-stone-950 gsap-batch-card group"
          style={{ padding: "28.65% 0 0 0" }}
        >
          {/* Custom High-Res Poster — loads instantly for 0ms initial render & zero layout shift */}
          {activePoster && (
            <img
              src={activePoster}
              alt={content?.title || "Video Showcase"}
              loading="eager"
              fetchPriority="high"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out pointer-events-none z-10 ${
                isVideoLoaded ? "opacity-0" : "opacity-100"
              }`}
            />
          )}

          {/* Active Player: Local HTML5 Video or Vimeo embed */}
          {isVimeo ? (
            isInView && (
              <iframe
                ref={iframeRef}
                src={getVimeoSrc(videoSrc)}
                frameBorder="0"
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => {
                  setTimeout(() => setIsVideoLoaded(true), 400);
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                className={`transition-opacity duration-1000 ease-out pointer-events-none ${
                  isVideoLoaded ? "opacity-100" : "opacity-0"
                }`}
                title="Video Showcase"
                allowFullScreen
              />
            )
          ) : (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIsVideoLoaded(true)}
              onPlay={() => setIsVideoLoaded(true)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              className={`object-cover transition-opacity duration-1000 ease-out pointer-events-none ${
                isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Cinematic Top Vignette Edge */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-stone-950/40 to-transparent z-20" />

          {/* Cinematic Bottom Vignette Edge */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-stone-950/50 to-transparent z-20" />
        </div>
      </div>
    </section>
  );
}

export default VideoShowcaseSection;

