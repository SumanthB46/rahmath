import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { CatalogFlipBook } from "@/components/catalog/CatalogFlipBook";
import { useLenis, scrollToSection } from "@/hooks/useLenis";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Sparkles,
  MapPin,
  X,
  ChevronDown,
  Layers,
  FileText,
} from "lucide-react";
import api from "@/lib/api";

// High-resolution architectural photography assets
import floorImg from "@/assets/solutions/flooring.png";
import wallImg from "@/assets/kajaria-bathroom-desktop.webp";
import porcelainImg from "@/assets/stacked_grey_slabs.png";
import slabImg from "@/assets/marble-slabs-corner-v2.png";
import countertopsImg from "@/assets/solutions/countertops.png";
import sinkImg from "@/assets/exclusive_sinks.png";
import showroomImg from "@/assets/showroom_experience.png";

export interface CatalogueItem {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  edition: string;
  pages: number;
  format?: string;
  finish?: string;
  applications?: string[];
  coverImage?: string;
  pdfUrl?: string;
  chapter: "TILES" | "SURFACES" | "SANITARYWARE";
  featured?: boolean;
}

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "The Material Library — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "A considered collection of architectural surfaces, large-format sintered porcelain slabs, and bespoke sanitaryware compendiums.",
      },
    ],
  }),
  component: MaterialLibraryPage,
});

// Curated library editions organized by material chapters
const LIBRARY_EDITIONS: CatalogueItem[] = [
  // ── CHAPTER 1: TILES ──
  {
    id: "edition-01",
    title: "Floor Collection",
    category: "Floor Tiles",
    subtitle: "Living & High-Traffic Vitrified Porcelain",
    edition: "EDITION 01 · 2026",
    pages: 32,
    format: "80 × 160 / 60 × 120 cm",
    finish: "Satin Matte & Carved Honed",
    coverImage: floorImg,
    chapter: "TILES",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-02",
    title: "Wall Cladding",
    category: "Wall Tiles",
    subtitle: "Curated Architectural Vertical Surfaces",
    edition: "EDITION 02 · 2026",
    pages: 28,
    format: "60 × 120 / 30 × 60 cm",
    finish: "Fluted Ceramic & High-Gloss",
    coverImage: wallImg,
    chapter: "TILES",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-03",
    title: "Porcelain Systems",
    category: "Porcelain Tiles",
    subtitle: "Diamond-Rectified European Grade Surfaces",
    edition: "EDITION 03 · 2026",
    pages: 36,
    format: "120 × 120 / 60 × 120 cm",
    finish: "Micro-Textured Anti-Slip",
    coverImage: porcelainImg,
    chapter: "TILES",
    pdfUrl: "/assets/npd-compressed.mp4",
  },

  // ── CHAPTER 2: SURFACES ──
  {
    id: "edition-04",
    title: "Large Format Slabs",
    category: "Slabs & Formats",
    subtitle: "120 × 240 cm Monolithic Continuous Porcelain",
    edition: "EDITION 04 · 2026",
    pages: 44,
    format: "120 × 240 / 120 × 280 cm",
    finish: "Silk Touch Velvet & Polish",
    coverImage: slabImg,
    chapter: "SURFACES",
    featured: true,
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-05",
    title: "Grand Sintered Slabs",
    category: "Sintered Stone",
    subtitle: "Continuous Bookmatched Veining & Zero Porosity",
    edition: "EDITION 05 · 2026",
    pages: 48,
    format: "120 × 240 cm (15mm & 9mm)",
    finish: "High-Gloss Mirror & Satin",
    coverImage: porcelainImg,
    chapter: "SURFACES",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-06",
    title: "Marble & Granite",
    category: "Natural Stone",
    subtitle: "Imported Italian Marble & Dense Granite Blocks",
    edition: "EDITION 06 · 2026",
    pages: 40,
    format: "Bespoke Cut-to-Size",
    finish: "Leathered & Honed Italian Finish",
    coverImage: countertopsImg,
    chapter: "SURFACES",
    pdfUrl: "/assets/npd-compressed.mp4",
  },

  // ── CHAPTER 3: SANITARYWARE ──
  {
    id: "edition-07",
    title: "Bespoke Basins",
    category: "Sanitaryware",
    subtitle: "Monolithic Sintered Stone Integrated Sinks",
    edition: "EDITION 07 · 2026",
    pages: 24,
    format: "Integrated Sloped Drain Systems",
    finish: "Mitered 45° Edge Joints",
    coverImage: sinkImg,
    chapter: "SANITARYWARE",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-08",
    title: "Ceramic Troughs",
    category: "Sanitaryware",
    subtitle: "Precision Engineered Dual & Commercial Basins",
    edition: "EDITION 08 · 2026",
    pages: 20,
    format: "Commercial & Villa Scale",
    finish: "Antibacterial Glaze Finish",
    coverImage: sinkImg,
    chapter: "SANITARYWARE",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
  {
    id: "edition-09",
    title: "Stone Vanities",
    category: "Sanitaryware",
    subtitle: "Single-Block Italian Carrara & Marquina Cuts",
    edition: "EDITION 09 · 2026",
    pages: 26,
    format: "Custom Floating Configurations",
    finish: "Honed Natural Velvet",
    coverImage: countertopsImg,
    chapter: "SANITARYWARE",
    pdfUrl: "/assets/npd-compressed.mp4",
  },
];

// Featured Edition Centerpiece
const FEATURED_EDITION: CatalogueItem = {
  id: "featured-master",
  title: "Grand Format Sintered Slabs",
  category: "Architectural Slabs",
  subtitle: "A study in scale, veining and continuous surfaces.",
  edition: "SPECIAL EDITION · 2026",
  pages: 52,
  format: "120 × 240 cm Monolithic",
  finish: "Continuous Bookmatch & Velvet Polish",
  coverImage: slabImg,
  chapter: "SURFACES",
  featured: true,
  pdfUrl: "/assets/npd-compressed.mp4",
};

interface LibrarySection {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  catalogues: CatalogueItem[];
}

function MaterialLibraryPage() {
  useLenis();
  const [sections, setSections] = useState<LibrarySection[]>([]);
  const [featuredEdition, setFeaturedEdition] = useState<CatalogueItem>(FEATURED_EDITION);
  const [activeFlipbookItem, setActiveFlipbookItem] = useState<CatalogueItem | null>(null);

  // Load live material library structure from backend CMS
  useEffect(() => {
    let active = true;
    api.catalogs.getLibrary()
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        const rawSections = res.data.sections || [];
        if (rawSections.length > 0) {
          const mapped: LibrarySection[] = rawSections.map((sec: any) => ({
            id: sec.id,
            name: sec.name,
            slug: sec.slug,
            short_description: sec.short_description,
            catalogues: (sec.catalogues || []).map((c: any) => ({
              id: String(c.id),
              title: c.title,
              category: c.category || c.title,
              subtitle: c.subtitle || "Architectural compendium",
              edition: c.edition || "EDITION 01 · 2026",
              pages: c.pages || 32,
              format: c.format || "120 × 240 cm",
              finish: c.finish || "Satin Matte & Carved Honed",
              coverImage: c.cover_image || slabImg,
              pdfUrl: c.pdf_url,
              chapter: sec.name as any,
              featured: c.is_featured,
            })),
          }));
          setSections(mapped);
        }

        if (res.data.featured) {
          const f = res.data.featured;
          setFeaturedEdition({
            id: String(f.id),
            title: f.title,
            category: f.category || "Architectural Slabs",
            subtitle: f.subtitle || "A study in scale, veining and continuous surfaces.",
            edition: f.edition || "SPECIAL EDITION · 2026",
            pages: f.pages || 52,
            format: f.format || "120 × 240 cm Monolithic",
            finish: f.finish || "Continuous Bookmatch & Velvet Polish",
            coverImage: f.cover_image || slabImg,
            pdfUrl: f.pdf_url,
            chapter: "SURFACES",
            featured: true,
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to static initial library
      });

    return () => {
      active = false;
    };
  }, []);

  // Deep linking: Open flipbook if URL has ?book= or ?open=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const bookQuery = params.get("book") || params.get("open") || params.get("id");
    if (!bookQuery) return;

    // Search in dynamic sections first
    for (const sec of sections) {
      const match = sec.catalogues.find((c) => c.id === bookQuery || c.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === bookQuery);
      if (match) {
        setActiveFlipbookItem(match);
        return;
      }
    }

    // Search in fallback
    const fallbackMatch = LIBRARY_EDITIONS.find((c) => c.id === bookQuery || c.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === bookQuery);
    if (fallbackMatch) {
      setActiveFlipbookItem(fallbackMatch);
    }
  }, [sections]);

  // Esc key listener to close immersive flipbook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeReader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openReader = (item: CatalogueItem) => {
    setActiveFlipbookItem(item);
    if (typeof window !== "undefined") {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const url = new URL(window.location.href);
      url.searchParams.set("book", slug);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const closeReader = () => {
    setActiveFlipbookItem(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("book");
      url.searchParams.delete("open");
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.pathname);
    }
  };

  const scrollToLibrary = () => {
    scrollToSection("#library-table");
  };

  // Render a physical hardcover catalogue book
  const renderPhysicalBook = (item: CatalogueItem, index: number) => {
    return (
      <div
        key={item.id}
        onClick={() => openReader(item)}
        className="group relative flex flex-col items-center cursor-pointer select-none text-left"
      >
        {/* Physical 3D Book Object laid out on architectural table */}
        <div
          className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-[3/4] rounded-r-lg overflow-hidden transition-all duration-500 ease-out transform-gpu group-hover:-translate-y-2 group-hover:rotate-1"
          style={{
            perspective: "1200px",
            boxShadow:
              "0 15px 35px -5px rgba(0,0,0,0.85), 0 5px 15px rgba(0,0,0,0.6), 4px 6px 0px -1px #22201e, 8px 10px 0px -2px #181615, 12px 14px 20px -3px rgba(0,0,0,0.95)",
            transform: "rotateY(-3deg) rotateX(1.5deg)",
          }}
        >
          {/* Hardcover Outer Spine Crease (Left Rim) */}
          <div className="absolute left-0 inset-y-0 w-3.5 bg-gradient-to-r from-black/95 via-black/40 to-transparent z-30 pointer-events-none" />
          <div className="absolute left-0 inset-y-0 w-[4px] bg-[#0a0a09] z-30" />

          {/* Cover Art Photography */}
          <img
            src={item.coverImage || slabImg}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
          />

          {/* Ambient Lighting Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25 pointer-events-none transition-opacity duration-500 group-hover:opacity-90" />

          {/* Subtle Diagonal Sheen Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

          {/* Book Cover Typography Layout */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 text-white">
            {/* Top Brand & Edition Stamp */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/90 font-medium">
                MUBARAK
              </span>
              <span className="text-[8.5px] font-mono tracking-[0.2em] uppercase text-[#C9A13A] font-semibold">
                {item.edition.split("·")[0].trim()}
              </span>
            </div>

            {/* Bottom Title on Cover */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-[0.25em] text-[#C9A13A] uppercase block">
                {item.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#F1EEE7] tracking-tight uppercase leading-tight">
                {item.title}
              </h3>
              <p className="text-[9.5px] font-mono text-[#99958C] tracking-wider uppercase pt-0.5">
                {item.pages} PAGES · {item.edition}
              </p>
            </div>
          </div>

          {/* Interactive Hover Glint */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-500 pointer-events-none" />
        </div>

        {/* Book Label & Interaction Trigger Beneath */}
        <div className="w-full max-w-[290px] sm:max-w-[320px] mt-4 pt-3 border-t border-white/[0.08] space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-mono tracking-[0.24em] text-[#C9A13A] uppercase font-semibold">
              {item.edition}
            </span>
            <span className="text-[10.5px] font-mono text-[#99958C] uppercase">
              {item.format}
            </span>
          </div>

          <h4 className="text-base font-serif font-normal text-[#F1EEE7] group-hover:text-[#C9A13A] transition-colors leading-snug">
            {item.title}
          </h4>

          <p className="text-[11.5px] font-sans text-[#99958C] leading-relaxed line-clamp-1">
            {item.subtitle}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium uppercase tracking-[0.18em] text-[#C9A13A] group-hover:text-amber-200 transition-colors">
              <span>Open Flipbook</span>
              <span className="group-hover:hidden text-xs">↗</span>
              <ArrowRight className="h-3 w-3 hidden group-hover:inline transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-400 transition-colors">
              {item.pages} pages
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render the Visual Climax (Featured Edition Centerpiece)
  const renderFeaturedEditionBlock = () => {
    return (
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-stone-900 shadow-2xl p-8 sm:p-14 lg:p-16 text-left my-8">
        {/* Architectural Background Texture */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity bg-cover bg-center pointer-events-none scale-105"
          style={{ backgroundImage: `url(${featuredEdition.coverImage || slabImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/70 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Description */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A13A]/40 bg-[#C9A13A]/10 text-[#C9A13A]">
              <Sparkles className="h-3 w-3" />
              <span className="text-[9.5px] font-mono tracking-[0.25em] uppercase font-bold">
                FEATURED EDITION
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white tracking-tight uppercase leading-tight">
              {featuredEdition.title} <br />
              <span className="text-[#C9A13A] italic font-normal">{featuredEdition.category}</span>
            </h3>

            <p className="text-sm sm:text-base font-serif text-[#99958C] font-light max-w-xl leading-relaxed">
              {featuredEdition.subtitle || "A study in scale, veining and continuous surfaces. Published for timeless living spaces."}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => openReader(featuredEdition)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C9A13A] hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <span>Open Flipbook Edition</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                {featuredEdition.pages} Full-Bleed Pages
              </span>
            </div>
          </div>

          {/* Right Centerpiece Physical Book */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              onClick={() => openReader(featuredEdition)}
              className="group relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-r-xl cursor-pointer select-none"
              style={{
                perspective: "1200px",
                transform: "rotateY(-6deg) rotateX(2deg)",
                boxShadow:
                  "0 30px 60px -15px rgba(0,0,0,0.95), 5px 6px 0px -1px #22201e, 10px 12px 0px -2px #181615",
              }}
            >
              <div className="absolute left-0 inset-y-0 w-[5px] bg-[#0c0c0b] z-30" />
              <img
                src={featuredEdition.coverImage || slabImg}
                alt={featuredEdition.title}
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-20">
                <span className="text-[10px] font-mono tracking-widest text-[#C9A13A] uppercase font-bold">
                  {featuredEdition.edition}
                </span>
                <div>
                  <h4 className="text-xl font-serif uppercase tracking-tight">{featuredEdition.title}</h4>
                  <p className="text-[10px] font-mono text-[#99958C] uppercase">{featuredEdition.format}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#171716] text-[#F1EEE7] min-h-screen font-sans selection:bg-[#C9A13A] selection:text-stone-950">
      <GlassNav />

      {/* ── 1. HERO SECTION: "THE MATERIAL LIBRARY" (WARM IVORY #E8E3D8) ── */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-5 sm:px-8 overflow-hidden bg-[#E8E3D8] text-[#171716]">
        {/* Subtle architectural grain / tone overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#171716_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* Left Column: Editorial Opening with Restrained UI */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#171716]/20 bg-[#171716]/5 text-[#171716]">
              <BookOpen className="h-3.5 w-3.5 text-[#9E7B24]" />
              <span className="text-[10px] font-mono tracking-[0.28em] uppercase font-bold text-[#171716]">
                THE MUBARAK COMPENDIUM
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-[#171716] tracking-tight leading-[1.06]">
              THE MATERIAL <br />
              <span className="italic font-normal text-[#9E7B24]">LIBRARY</span>
            </h1>

            <p className="text-base sm:text-lg font-serif text-[#4A463E] font-light max-w-xl leading-relaxed">
              A considered collection of surfaces, stone, sanitaryware and architectural finishes.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToLibrary}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#171716] hover:bg-stone-900 text-[#F1EEE7] text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
              >
                <span>Explore the Library</span>
                <ChevronDown className="h-4 w-4 text-[#C9A13A]" />
              </button>

              <button
                onClick={() => openReader(featuredEdition)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#171716]/25 hover:border-[#171716]/60 text-[#171716] text-xs font-semibold uppercase tracking-[0.18em] transition-all hover:bg-[#171716]/5 cursor-pointer"
              >
                <span>Explore Catalogues</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#9E7B24]" />
              </button>
            </div>
          </div>

          {/* Right Column: One Large Physical-Looking Catalogue Book Standing Slightly Angled */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Floor Shadow beneath the standing book */}
              <div
                className="absolute -bottom-6 -left-4 -right-4 h-12 bg-stone-950/25 blur-xl rounded-full pointer-events-none"
                style={{ transform: "rotate(-2deg)" }}
              />

              <div
                onClick={() => openReader(featuredEdition)}
                className="group relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] rounded-r-xl cursor-pointer select-none transition-all duration-500 ease-out transform-gpu group-hover:-translate-y-2"
                style={{
                  perspective: "1400px",
                  transform: "rotateY(-10deg) rotateX(3deg)",
                  boxShadow:
                    "0 30px 60px -15px rgba(23,23,22,0.45), 6px 8px 0px -1px #22201e, 12px 14px 0px -2px #181615, 18px 20px 30px -4px rgba(23,23,22,0.35)",
                }}
              >
                {/* Hardcover Spine */}
                <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/95 via-black/40 to-transparent z-30 pointer-events-none" />
                <div className="absolute left-0 inset-y-0 w-[5px] bg-[#0c0c0b] z-30" />

                {/* Cover Art */}
                <img
                  src={featuredEdition.coverImage || slabImg}
                  alt={featuredEdition.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                />

                {/* Ambient Shadow & Gold Foil Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-20 text-left">
                  <div className="border-b border-white/20 pb-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white font-bold">
                      MUBARAK
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#C9A13A] uppercase bg-black/60 px-2.5 py-0.5 rounded border border-[#C9A13A]/40 font-semibold">
                      2026
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A13A] uppercase block font-semibold">
                      {featuredEdition.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white uppercase tracking-tight leading-tight">
                      {featuredEdition.title}
                    </h2>
                    <p className="text-xs font-mono text-[#99958C] tracking-wide pt-1">
                      {featuredEdition.subtitle}
                    </p>
                    <div className="pt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-[#C9A13A] group-hover:text-amber-200 transition-colors font-semibold">
                        <span>Open Flipbook</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE CATALOGUE LIBRARY (ARCHITECTURAL READING TABLE) ── */}
      <div id="library-table" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-20 sm:space-y-28">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-semibold block">
            EXPLORE THE COLLECTION
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#F1EEE7] tracking-tight">
            Curated Material Chapters
          </h2>
          <div className="h-[1px] w-12 bg-[#C9A13A]/60 mx-auto mt-3" />
        </div>

        {/* DYNAMIC CHAPTER RENDERING */}
        {sections.length > 0 ? (
          sections.map((sec, secIdx) => {
            const isSecondSection = secIdx === 1 || sec.name === "SURFACES";
            return (
              <div key={sec.id} className="space-y-16">
                <div className="space-y-8 text-left">
                  <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-bold block mb-1">
                        CHAPTER 0{secIdx + 1}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F1EEE7] tracking-wide uppercase">
                        {sec.name}
                      </h3>
                    </div>
                    {sec.short_description && (
                      <p className="text-xs font-mono text-[#99958C] uppercase tracking-wider">
                        {sec.short_description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                    {sec.catalogues.map((book, idx) => renderPhysicalBook(book, idx))}
                  </div>
                </div>

                {/* Show Featured Edition right after Chapter 2 (or SURFACES) */}
                {isSecondSection && renderFeaturedEditionBlock()}
              </div>
            );
          })
        ) : (
          /* Static Fallback while loading */
          <>
            {/* ── CHAPTER 1: TILES ── */}
            <div className="space-y-8 text-left">
              <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-bold block mb-1">
                    CHAPTER 01
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F1EEE7] tracking-wide">
                    TILES
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#99958C] uppercase tracking-wider">
                  Floor Systems · Wall Cladding · Vitrified Porcelain
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {LIBRARY_EDITIONS.filter((item) => item.chapter === "TILES").map((book, idx) =>
                  renderPhysicalBook(book, idx)
                )}
              </div>
            </div>

            {/* ── CHAPTER 2: SURFACES ── */}
            <div className="space-y-8 text-left">
              <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-bold block mb-1">
                    CHAPTER 02
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F1EEE7] tracking-wide">
                    SURFACES
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#99958C] uppercase tracking-wider">
                  Large Format · Grand Slabs · Natural Italian Stone
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {LIBRARY_EDITIONS.filter((item) => item.chapter === "SURFACES").map((book, idx) =>
                  renderPhysicalBook(book, idx)
                )}
              </div>
            </div>

            {/* ── 3. VISUAL CLIMAX: FEATURED EDITION ── */}
            {renderFeaturedEditionBlock()}

            {/* ── CHAPTER 3: SANITARYWARE ── */}
            <div className="space-y-8 text-left">
              <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-bold block mb-1">
                    CHAPTER 03
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F1EEE7] tracking-wide">
                    SANITARYWARE
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#99958C] uppercase tracking-wider">
                  Bespoke Basins · Precision Troughs · Stone Vanities
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {LIBRARY_EDITIONS.filter((item) => item.chapter === "SANITARYWARE").map((book, idx) =>
                  renderPhysicalBook(book, idx)
                )}
              </div>
            </div>
          </>
        )}

        {/* ── 4. SHOWROOM CONNECTION & CONCLUSION ── */}
        <div className="border-t border-white/[0.08] pt-16 sm:pt-20 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A13A] uppercase font-semibold block">
              SEEN SOMETHING YOU'D LIKE TO EXPERIENCE?
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-[#F1EEE7] leading-snug">
              Our materials are best understood at full scale.
            </h3>
            <p className="text-xs sm:text-sm font-serif text-[#99958C] font-light leading-relaxed">
              Step into full-scale living mockups, inspect raw slabs under architectural daylight, and collaborate with our material consultants.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/#showroom"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--gradient-gold)] text-stone-950 font-bold text-xs tracking-[0.2em] uppercase hover:opacity-95 transition-opacity shadow-xl"
            >
              <span>Visit the Flagship Showroom</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="pt-8">
            <span className="text-xs font-serif tracking-[0.25em] text-[#F1EEE7] uppercase font-bold block">
              MUBARAK
            </span>
            <span className="text-[9px] font-sans tracking-[0.35em] text-[#99958C] uppercase mt-1 block">
              TILES &amp; GRANITE
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. IMMERSIVE DEDICATED FLIPBOOK READER MODAL ── */}
      {activeFlipbookItem && (
        <div className="fixed inset-0 z-50 bg-[#10100f] text-[#F1EEE7] flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
          {/* Top Reader Navigation Bar */}
          <header className="h-16 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-stone-950/90 backdrop-blur-md z-30">
            {/* Back Button */}
            <button
              onClick={closeReader}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#C9A13A] hover:text-amber-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Library</span>
            </button>

            {/* Book Title & Edition Stamp in Center */}
            <div className="text-center hidden sm:block">
              <h2 className="text-sm font-serif font-medium text-white tracking-wide uppercase">
                {activeFlipbookItem.title}
              </h2>
              <span className="text-[9.5px] font-mono text-[#99958C] tracking-widest uppercase">
                {activeFlipbookItem.edition} · 2026 ARCHITECTURAL COMPENDIUM
              </span>
            </div>

            {/* Action Buttons on Right */}
            <div className="flex items-center gap-3">
              <a
                href={activeFlipbookItem.coverImage || "#"}
                download={`${activeFlipbookItem.title}-Catalogue-2026.png`}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-stone-300 hover:text-white text-xs font-mono tracking-wider uppercase transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Download Spec</span>
              </a>

              <button
                onClick={closeReader}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Reader"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Flipbook Center Stage */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-4xl flex items-center justify-center">
              <CatalogFlipBook item={activeFlipbookItem} />
            </div>
          </div>

          {/* Reader Bottom Bar */}
          <footer className="h-12 px-6 border-t border-white/10 flex items-center justify-between text-[10.5px] font-mono text-[#99958C] uppercase tracking-widest shrink-0 bg-stone-950/80">
            <span>Use click or drag on page edges to flip</span>
            <span className="hidden sm:inline">Press ESC to exit</span>
          </footer>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MaterialLibraryPage;
