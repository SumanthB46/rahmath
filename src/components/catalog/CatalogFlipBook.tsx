import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Loader2 } from "lucide-react";
import type { CatalogueItem } from "@/routes/catalog";
import { generateCatalogSpreads, type CatalogSpread } from "./spreadGenerator";
import "./sketchbook.css";

const N = 18;          // 18 strips for smooth mathematical paper curve
const SPAN = 0.449;    // gutter -> outer page edge fraction
const BETA = 0.60;     // peak curl of the arc in radians
const TILT_X = 4.5;    // Max tilt degrees X
const TILT_Y = 7.0;    // Max tilt degrees Y
const ZOOM_MIN = 0.9;
const ZOOM_MAX = 1.5;
const MAG = 2.3;       // Loupe magnification factor

export function CatalogFlipBook({ item }: { item: CatalogueItem }) {
  const [spreads, setSpreads] = useState<CatalogSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoupeActive, setIsLoupeActive] = useState(false);

  // DOM Refs
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sb3dRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const zoomWrapRef = useRef<HTMLDivElement>(null);
  const zoomInnerRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const capBoxRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  // Mutable engine state (avoids React re-render lag in 60fps physics loop)
  const engineRef = useRef<{
    idx: number;
    turn: { dir: "next" | "prev"; from: number; to: number; t: number } | null;
    strips: HTMLDivElement[];
    spring:
      | { kind: "spring"; v: number; target: number; done?: () => void; k: number; c: number }
      | { kind: "tween"; from: number; target: number; dur: number; e: number; done?: () => void }
      | null;
    raf: number | null;
    lastTime: number;
    view: { rx: number; ry: number; z: number; trx: number; try_: number; tz: number };
    viewActive: boolean;
    drag: {
      dir: "next" | "prev";
      x0: number;
      w: number;
      moved: number;
      vel: number;
      tPrev: number;
    } | null;
    loupeOn: boolean;
    lx: number | null;
    ly: number | null;
    lgrab: { cx: number; cy: number; lx0: number; ly0: number } | null;
    lTarget: { x: number; y: number } | null;
    pages: CatalogSpread[];
  }>({
    idx: 0,
    turn: null,
    strips: [],
    spring: null,
    raf: null,
    lastTime: 0,
    view: { rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 },
    viewActive: false,
    drag: null,
    loupeOn: false,
    lx: null,
    ly: null,
    lgrab: null,
    lTarget: null,
    pages: [],
  });

  // 1. Generate high-resolution catalog spreads on mount
  useEffect(() => {
    let active = true;
    setLoading(true);

    generateCatalogSpreads(item)
      .then((generated) => {
        if (!active) return;
        setSpreads(generated);
        engineRef.current.pages = generated;
        engineRef.current.idx = 0;
        setCurrentSpread(0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to generate catalog spreads:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  // 2. Core MengTo 3D Strip and Loupe Methods
  const layout = useCallback(() => {
    const book = bookRef.current;
    const sb3d = sb3dRef.current;
    if (book && sb3d) {
      sb3d.style.setProperty("--bw", `${book.clientWidth}px`);
    }
  }, []);

  const syncZoomLayer = useCallback(() => {
    const book = bookRef.current;
    const zoomInner = zoomInnerRef.current;
    if (!book || !zoomInner) return;
    zoomInner.textContent = "";
    for (const c of Array.from(book.children)) {
      if ((c as HTMLElement).classList.contains("sb-zone")) continue;
      zoomInner.appendChild(c.cloneNode(true));
    }
  }, []);

  const placeLoupe = useCallback(() => {
    const engine = engineRef.current;
    const book = bookRef.current;
    const loupe = loupeRef.current;
    const zoomWrap = zoomWrapRef.current;
    const zoomInner = zoomInnerRef.current;
    if (!book || !loupe || !zoomWrap || !zoomInner || engine.lx === null || engine.ly === null) return;

    const bw = book.clientWidth;
    const bh = book.clientHeight;
    if (!bw || !bh) return;

    const R = Math.round(Math.max(160, Math.min(260, bw * 0.235))) / 2;
    const bez = R * 2 * 0.058;
    loupe.style.setProperty("--lr", `${R * 2}px`);
    loupe.style.transform = `translate3d(${(engine.lx - R).toFixed(1)}px, ${(engine.ly - R).toFixed(1)}px, 0)`;

    if (engine.loupeOn) {
      loupe.classList.add("on");
    } else {
      loupe.classList.remove("on");
    }

    const z = engine.view.z;
    const cx = bw / 2;
    const cy = bh / 2;
    const x0 = cx + (bw * 0.05 - cx) * z;
    const x1 = cx + (bw * 0.95 - cx) * z;
    const y0 = cy + (bh * 0.1 - cy) * z;
    const y1 = cy + (bh * 0.9 - cy) * z;

    const nx = Math.max(x0, Math.min(engine.lx, x1));
    const ny = Math.max(y0, Math.min(engine.ly, y1));
    const inside =
      engine.lx > x0 && engine.lx < x1 && engine.ly > y0 && engine.ly < y1
        ? Math.min(engine.lx - x0, x1 - engine.lx, engine.ly - y0, y1 - engine.ly)
        : -Math.hypot(engine.lx - nx, engine.ly - ny);

    const k = Math.max(0, Math.min(1, (inside + R * 0.3) / (R * 0.55)));
    zoomWrap.style.opacity = (engine.loupeOn ? k : 0).toFixed(3);

    if (k > 0.002) {
      const r = (R - bez).toFixed(1);
      const mask = `radial-gradient(circle ${r}px at ${engine.lx.toFixed(1)}px ${engine.ly.toFixed(1)}px, #000 calc(100% - 1px), transparent 100%)`;
      zoomWrap.style.webkitMaskImage = mask;
      zoomWrap.style.maskImage = mask;

      const px = cx + (engine.lx - cx) / z;
      const py = cy + (engine.ly - cy) / z;
      const s = MAG * z;
      zoomInner.style.transform = `translate(${(engine.lx - px * s).toFixed(1)}px, ${(engine.ly - py * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
    }
  }, []);

  const applyTurn = useCallback((t: number) => {
    const sb3d = sb3dRef.current;
    const engine = engineRef.current;
    if (!sb3d) return;

    const th = Math.PI * t;
    const beta = BETA * Math.sin(Math.PI * t);
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / N;

    sb3d.style.setProperty("--tt", `${(tt * D).toFixed(2)}deg`);
    sb3d.style.setProperty("--td", `${(td * D).toFixed(3)}deg`);
    sb3d.style.setProperty("--shade", Math.sin(Math.PI * t).toFixed(3));

    for (let i = 0; i < engine.strips.length; i++) {
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      const st = engine.strips[i].style;
      st.setProperty("--lit", l1.toFixed(3));
      st.setProperty("--a1", ((1 - l1) * 0.62).toFixed(3));
      st.setProperty("--a2", ((1 - l2) * 0.62).toFixed(3));
    }
  }, []);

  const buildCurl = useCallback((dir: "next" | "prev", from: number, to: number) => {
    const engine = engineRef.current;
    const pages = engine.pages;
    engine.strips = [];

    const curl = document.createElement("div");
    curl.className = `curl ${dir}`;
    curl.style.setProperty("--n", String(N));
    curl.style.setProperty("--span", String(SPAN));
    let host: HTMLElement = curl;

    for (let i = 0; i < N; i++) {
      const s = document.createElement("div");
      s.className = "strip";
      s.style.setProperty("--i", String(i));
      const gut = "calc(var(--bw) * 0.5)";
      const sw = `calc(var(--bw) * ${SPAN} / ${N})`;
      const A = `calc(-1 * (${gut} + ${i} * ${sw}))`;
      const B = `calc(${(i + 1)} * ${sw} - ${gut})`;

      const f = document.createElement("div");
      f.className = "face front";
      const b = document.createElement("div");
      b.className = "face back";

      const dress = (e: HTMLElement, url: string, px: string) => {
        e.style.backgroundImage = `url("${url}")`;
        e.style.backgroundPositionX = px;
      };

      if (pages[from] && pages[to]) {
        dress(f, pages[from].url, dir === "next" ? A : B);
        dress(b, pages[to].url, dir === "next" ? B : A);
      }

      const shF = document.createElement("div");
      shF.className = "sh";
      const glF = document.createElement("div");
      glF.className = "gl";
      f.appendChild(shF);
      f.appendChild(glF);

      const shB = document.createElement("div");
      shB.className = "sh";
      const glB = document.createElement("div");
      glB.className = "gl";
      b.appendChild(shB);
      b.appendChild(glB);

      s.appendChild(f);
      s.appendChild(b);
      if (i === N - 1) s.classList.add("edge");
      host.appendChild(s);
      host = s;
      engine.strips.push(s);
    }
    return curl;
  }, []);

  const halfEl = useCallback((pos: "left" | "right", pageIdx: number) => {
    const engine = engineRef.current;
    const pages = engine.pages;
    const d = document.createElement("div");
    d.className = `sb-half ${pos}`;

    if (pages[pageIdx]) {
      const im = new Image();
      im.className = `sb-half-img ${pos}`;
      im.draggable = false;
      im.alt = "";
      im.src = pages[pageIdx].url;
      d.appendChild(im);
    }

    const shade = document.createElement("div");
    shade.className = `gutter-shade ${pos}`;
    d.appendChild(shade);
    return d;
  }, []);

  const paint = useCallback(() => {
    const book = bookRef.current;
    const sb3d = sb3dRef.current;
    const engine = engineRef.current;
    if (!book || !sb3d || engine.pages.length === 0) return;

    book.textContent = "";

    if (!engine.turn) {
      const f = document.createElement("div");
      f.className = "sb-full";
      const curPage = engine.pages[engine.idx];
      if (curPage) {
        const im = new Image();
        im.src = curPage.url;
        im.alt = curPage.title;
        im.draggable = false;
        f.appendChild(im);
      }
      book.appendChild(f);
      sb3d.style.setProperty("--shade", "0");
    } else {
      const next = engine.turn.dir === "next";
      book.appendChild(halfEl("left", next ? engine.turn.from : engine.turn.to));
      book.appendChild(halfEl("right", next ? engine.turn.to : engine.turn.from));
      book.appendChild(buildCurl(engine.turn.dir, engine.turn.from, engine.turn.to));
      applyTurn(engine.turn.t);
    }

    // Touch & pointer capture zones
    const zonePrev = document.createElement("button");
    zonePrev.className = "sb-zone sb-prev";
    zonePrev.setAttribute("aria-label", "Previous Spread");

    const zoneNext = document.createElement("button");
    zoneNext.className = "sb-zone sb-next";
    zoneNext.setAttribute("aria-label", "Next Spread");

    book.appendChild(zonePrev);
    book.appendChild(zoneNext);

    layout();
    syncZoomLayer();
    placeLoupe();
    setCurrentSpread(engine.turn ? engine.turn.to : engine.idx);
  }, [applyTurn, buildCurl, halfEl, layout, placeLoupe, syncZoomLayer]);

  // Spring & animation loop
  const tick = useCallback(
    (now: number) => {
      const engine = engineRef.current;
      engine.raf = null;
      const dt = Math.min(0.032, (now - engine.lastTime) / 1000 || 0.016);
      engine.lastTime = now;

      if (engine.spring && engine.turn) {
        const s = engine.spring;
        if (s.kind === "tween") {
          s.e += dt;
          const k = Math.min(1, s.e / s.dur);
          engine.turn.t = s.from + (s.target - s.from) * k;
          applyTurn(engine.turn.t);
          if (k >= 1) {
            engine.spring = null;
            if (s.done) s.done();
          }
        } else {
          const x = engine.turn.t - s.target;
          s.v += (-s.k * x - s.c * s.v) * dt;
          engine.turn.t += s.v * dt;
          if (Math.abs(engine.turn.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
            engine.turn.t = s.target;
            engine.spring = null;
            applyTurn(engine.turn.t);
            if (s.done) s.done();
          } else {
            applyTurn(engine.turn.t);
          }
        }
      }

      // Parallax view spring
      const e = 0.14;
      let moved = false;
      const v = engine.view;
      for (const [k, t] of [
        ["rx", "trx"],
        ["ry", "try_"],
        ["z", "tz"],
      ] as const) {
        const d = v[t] - v[k];
        if (Math.abs(d) > 0.0006) {
          v[k] += d * e;
          moved = true;
        } else {
          v[k] = v[t];
        }
      }

      if (moved && sb3dRef.current) {
        sb3dRef.current.style.setProperty("--rx", `${v.rx.toFixed(2)}deg`);
        sb3dRef.current.style.setProperty("--ry", `${v.ry.toFixed(2)}deg`);
        sb3dRef.current.style.setProperty("--zoom", v.z.toFixed(3));
        setZoomLevel(v.z);
      }
      engine.viewActive = moved;

      // Loupe target ease
      let lmoved = false;
      if (engine.lTarget && engine.lx !== null && engine.ly !== null) {
        const dx = engine.lTarget.x - engine.lx;
        const dy = engine.lTarget.y - engine.ly;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          engine.lx = engine.lTarget.x;
          engine.ly = engine.lTarget.y;
          engine.lTarget = null;
          placeLoupe();
        } else {
          engine.lx += dx * 0.17;
          engine.ly += dy * 0.17;
          placeLoupe();
          lmoved = true;
        }
      }

      if ((engine.spring || engine.viewActive || lmoved) && engine.raf === null) {
        engine.raf = requestAnimationFrame(tick);
      }
    },
    [applyTurn, placeLoupe]
  );

  const kick = useCallback(() => {
    const engine = engineRef.current;
    if (engine.raf === null) {
      engine.lastTime = performance.now();
      engine.raf = requestAnimationFrame(tick);
    }
  }, [tick]);

  const animateTo = useCallback(
    (target: number, onDone?: () => void, stiff = 170, damp = 26) => {
      const engine = engineRef.current;
      engine.spring = {
        kind: "spring",
        v: 0,
        target,
        done: onDone,
        k: stiff,
        c: damp,
      };
      kick();
    },
    [kick]
  );

  const startTurn = useCallback(
    (dir: "next" | "prev", t = 0) => {
      const engine = engineRef.current;
      const M = engine.pages.length;
      if (M <= 1) return;

      engine.spring = null;
      if (engine.turn) {
        engine.idx = engine.turn.to;
        engine.turn = null;
      }

      const from = engine.idx;
      const to = dir === "next" ? (from + 1) % M : (from - 1 + M) % M;

      engine.turn = { dir, from, to, t };
      paint();
    },
    [paint]
  );

  const commit = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.turn) return;

    animateTo(
      1,
      () => {
        if (!engine.turn) return;
        engine.idx = engine.turn.to;
        engine.turn = null;
        paint();
      },
      170,
      26
    );
  }, [animateTo, paint]);

  const cancel = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.turn) return;

    animateTo(
      0,
      () => {
        engine.turn = null;
        paint();
      },
      150,
      24
    );
  }, [animateTo, paint]);

  const step = useCallback(
    (dir: "next" | "prev") => {
      const engine = engineRef.current;
      if (engine.turn) {
        engine.idx = engine.turn.to;
        engine.turn = null;
      }
      startTurn(dir, 0);
      commit();
    },
    [commit, startTurn]
  );

  const goTo = useCallback(
    (i: number) => {
      const engine = engineRef.current;
      const M = engine.pages.length;
      if (i === engine.idx || M <= 1) return;

      if (engine.turn) {
        engine.idx = engine.turn.to;
        engine.turn = null;
      }

      const fwd = (i - engine.idx + M) % M;
      const back = (engine.idx - i + M) % M;
      if (Math.min(fwd, back) === 1) {
        step(fwd === 1 ? "next" : "prev");
        return;
      }

      engine.idx = i;
      paint();
    },
    [paint, step]
  );

  const setView = useCallback(
    (rx: number, ry: number, z: number) => {
      const engine = engineRef.current;
      engine.view.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
      engine.view.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
      engine.view.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
      engine.viewActive = true;
      kick();
    },
    [kick]
  );

  // Initialize and paint once spreads are ready
  useEffect(() => {
    if (spreads.length > 0) {
      paint();
      layout();

      // Rest loupe at bottom right desk point
      const book = bookRef.current;
      if (book) {
        engineRef.current.lx = book.clientWidth * 0.88;
        engineRef.current.ly = book.clientHeight * 0.85;
      }
    }
  }, [spreads, layout, paint]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      layout();
      const book = bookRef.current;
      if (book) {
        engineRef.current.lx = book.clientWidth * 0.88;
        engineRef.current.ly = book.clientHeight * 0.85;
        placeLoupe();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [layout, placeLoupe]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step("next");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  // Drag & pointer gesture handlers
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (!target.closest(".sb-zone")) return;

      e.preventDefault();
      stage.setPointerCapture(e.pointerId);

      const book = bookRef.current;
      if (!book) return;
      const r = book.getBoundingClientRect();
      const dir = (e.clientX - r.left) / r.width > 0.5 ? "next" : "prev";

      startTurn(dir, 0);
      engineRef.current.drag = {
        dir,
        x0: e.clientX,
        w: r.width,
        moved: 0,
        vel: 0,
        tPrev: performance.now(),
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const engine = engineRef.current;
      if (!engine.drag) {
        // Desktop parallax tilt
        if (e.pointerType !== "touch" && bookRef.current) {
          const r = bookRef.current.getBoundingClientRect();
          if (r.width > 0) {
            const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.62)));
            const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
            setView(-ny * TILT_X, nx * TILT_Y, engine.view.tz);
          }
        }
        return;
      }

      const dx = e.clientX - engine.drag.x0;
      engine.drag.moved = Math.max(engine.drag.moved, Math.abs(dx));
      const raw = (engine.drag.dir === "next" ? -dx : dx) / (engine.drag.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      engine.drag.vel = (t - (engine.turn ? engine.turn.t : 0)) / Math.max(0.001, (now - engine.drag.tPrev) / 1000);
      engine.drag.tPrev = now;

      if (engine.turn) {
        engine.turn.t = t;
        applyTurn(t);
      }
    };

    const handlePointerUp = () => {
      const engine = engineRef.current;
      if (!engine.drag) return;
      const d = engine.drag;
      engine.drag = null;

      if (!engine.turn) return;
      if (d.moved < 6) {
        // Quick tap: commit turn
        commit();
        return;
      }

      const go = engine.turn.t > 0.42 || d.vel > 1.1;
      if (go) commit();
      else cancel();
    };

    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerup", handlePointerUp);
    stage.addEventListener("pointercancel", handlePointerUp);

    return () => {
      stage.removeEventListener("pointerdown", handlePointerDown);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerup", handlePointerUp);
      stage.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [applyTurn, commit, cancel, setView, startTurn]);

  // Loupe drag handlers
  useEffect(() => {
    const loupe = loupeRef.current;
    if (!loupe) return;

    const handleLoupeDown = (e: PointerEvent) => {
      const engine = engineRef.current;
      if (!engine.loupeOn || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      engine.lTarget = null;
      engine.lgrab = {
        cx: e.clientX,
        cy: e.clientY,
        lx0: engine.lx || 0,
        ly0: engine.ly || 0,
      };
      loupe.classList.add("held");
      loupe.setPointerCapture(e.pointerId);
    };

    const handleLoupeMove = (e: PointerEvent) => {
      const engine = engineRef.current;
      if (!engine.lgrab || !bookRef.current) return;
      const bw = bookRef.current.clientWidth;
      const bh = bookRef.current.clientHeight;
      const R = 110;

      engine.lx = Math.max(-R * 0.7, Math.min(bw + R * 0.7, engine.lgrab.lx0 + (e.clientX - engine.lgrab.cx)));
      engine.ly = Math.max(-R * 0.7, Math.min(bh + R * 1.0, engine.lgrab.ly0 + (e.clientY - engine.lgrab.cy)));
      placeLoupe();
    };

    const handleLoupeUp = () => {
      const engine = engineRef.current;
      engine.lgrab = null;
      loupe.classList.remove("held");
    };

    loupe.addEventListener("pointerdown", handleLoupeDown);
    loupe.addEventListener("pointermove", handleLoupeMove);
    loupe.addEventListener("pointerup", handleLoupeUp);
    loupe.addEventListener("pointercancel", handleLoupeUp);

    return () => {
      loupe.removeEventListener("pointerdown", handleLoupeDown);
      loupe.removeEventListener("pointermove", handleLoupeMove);
      loupe.removeEventListener("pointerup", handleLoupeUp);
      loupe.removeEventListener("pointercancel", handleLoupeUp);
    };
  }, [placeLoupe]);

  const toggleLoupe = useCallback(() => {
    const engine = engineRef.current;
    const nextState = !engine.loupeOn;
    engine.loupeOn = nextState;
    setIsLoupeActive(nextState);

    const book = bookRef.current;
    if (nextState && engine.lx === null && book) {
      engine.lx = book.clientWidth * 0.88;
      engine.ly = book.clientHeight * 0.85;
    }
    placeLoupe();
  }, [placeLoupe]);

  const handleZoomIn = useCallback(() => {
    const engine = engineRef.current;
    setView(engine.view.trx, engine.view.try_, engine.view.tz * 1.15);
  }, [setView]);

  const handleZoomOut = useCallback(() => {
    const engine = engineRef.current;
    setView(engine.view.trx, engine.view.try_, engine.view.tz / 1.15);
  }, [setView]);

  const handleResetZoom = useCallback(() => {
    const engine = engineRef.current;
    setView(engine.view.trx, engine.view.try_, 1);
  }, [setView]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-stone-900/60 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl min-h-[360px] w-full max-w-lg">
        <Loader2 className="h-8 w-8 text-[#C9A13A] animate-spin" />
        <div className="space-y-1">
          <h4 className="text-sm font-serif font-medium text-white tracking-wide uppercase">
            Opening Architectural Sketchbook
          </h4>
          <p className="text-xs font-mono text-stone-400">
            Rendering 3D curved surfaces for {item.title}...
          </p>
        </div>
      </div>
    );
  }

  const activeSpread = spreads[currentSpread] || spreads[0];

  return (
    <div ref={wrapRef} className="sb-wrap max-w-5xl w-full mx-auto">
      {/* ── 3D Stage with Prev/Next and Curved Paper Book ── */}
      <div ref={stageRef} className="sb-stage" onDoubleClick={handleResetZoom}>
        <button
          onClick={() => step("prev")}
          className="sb-arrow left hidden sm:inline-flex"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div ref={sb3dRef} className="sb-3d">
          <div ref={tiltRef} className="sb-tilt">
            <div className="sb-cast ambient" aria-hidden="true" />
            <div className="sb-cast contact" aria-hidden="true" />
            <div className="sb-cast hair" aria-hidden="true" />
            <div ref={bookRef} className="sb-book" />
          </div>

          {/* Secondary Magnified Layer for Loupe */}
          <div ref={zoomWrapRef} className="zoomwrap" aria-hidden="true">
            <div ref={zoomInnerRef} className="zoominner" />
          </div>

          {/* Brass Loupe Magnifier Tool */}
          <div ref={loupeRef} className="loupe">
            <span className="grip" />
            <span className="ring">
              <span className="lens" />
            </span>
          </div>
        </div>

        <button
          onClick={() => step("next")}
          className="sb-arrow right hidden sm:inline-flex"
          aria-label="Next page"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* ── Active Spread Title & Page Number ── */}
      <div ref={capBoxRef} className="sb-captions">
        {activeSpread && (
          <div className="space-y-0.5">
            <p className="sb-caption font-serif text-sm tracking-widest text-[#F1EEE7]">
              {activeSpread.title} — {activeSpread.subtitle}
            </p>
            <p className="text-[10px] font-mono tracking-widest text-[#C9A13A] uppercase">
              {activeSpread.pageRange} · SPREAD {currentSpread + 1} OF {spreads.length}
            </p>
          </div>
        )}
      </div>

      {/* ── Floating Controls Toolbar ── */}
      <div className="sb-tools" role="group" aria-label="Book View Controls">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= ZOOM_MIN + 0.01}
          className="tool"
          aria-label="Zoom out"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <span
          onClick={handleResetZoom}
          className="zoom-read cursor-pointer hover:text-white transition-colors"
          title="Click to reset 100%"
        >
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= ZOOM_MAX - 0.01}
          className="tool"
          aria-label="Zoom in"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <span className="tool-sep" aria-hidden="true" />

        <button
          onClick={toggleLoupe}
          aria-pressed={isLoupeActive}
          className="tool"
          aria-label="Toggle Magnifier Lens"
          title="Brass Loupe Magnifier (Drag over slabs)"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* ── Interactive Spread Thumbnail Navigation Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
        {spreads.map((spread, idx) => (
          <button
            key={spread.id}
            onClick={() => goTo(idx)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              idx === currentSpread
                ? "bg-[#C9A13A] text-stone-950 font-bold shadow-md scale-105"
                : "bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200 hover:bg-white/10"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${idx === currentSpread ? "bg-stone-950" : "bg-[#C9A13A]"}`} />
            <span>{spread.pageRange}</span>
          </button>
        ))}
      </div>

      <p ref={hintRef} className="sb-hint">
        Click or drag page edge to turn · Drag brass lens across stone details · Double click to reset zoom
      </p>
    </div>
  );
}
