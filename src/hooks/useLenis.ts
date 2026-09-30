import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function scrollToSection(target: string) {
  if (typeof window === "undefined") return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { duration: 1.2, offset: 0 });
  } else {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
}

export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Detect mobile / touch screens to use native 60fps/120fps compositor scrolling
    const isMobile =
      window.matchMedia("(max-width: 768px)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (isMobile) {
      // Don't instantiate Lenis touch override on mobile so touch momentum scrolling is 100% native smooth
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
    });

    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      delete window.__lenis;
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);
}
