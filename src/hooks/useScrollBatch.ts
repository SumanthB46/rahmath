import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollBatchAnimation() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({ ease: "power3.out" });

    // Instantly ensure all cards are 100% visible and sharp by default
    gsap.set(".gsap-batch-card", { opacity: 1, y: 0 });

    const batchTriggers = ScrollTrigger.batch(".gsap-batch-card", {
      start: "top 95%",
      interval: 0.08,
      batchMax: 4,
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: { each: 0.08, grid: [1, 4] },
            duration: 0.6,
            overwrite: "auto",
          }
        ),
      onEnterBack: (batch) =>
        gsap.fromTo(
          batch,
          { opacity: 0.5, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.5,
            overwrite: "auto",
          }
        ),
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      gsap.to(".gsap-batch-card", { opacity: 1, y: 0, duration: 0.3, overwrite: "auto" });
    }, 100);

    return () => {
      clearTimeout(refreshTimer);
      batchTriggers.forEach((t) => t.kill());
      gsap.set(".gsap-batch-card", { opacity: 1, y: 0 });
    };
  }, []);
}
