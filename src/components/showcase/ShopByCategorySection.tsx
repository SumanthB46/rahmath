import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

// Real high-resolution architectural & product photography
import floorImg from "@/assets/solutions/flooring.png";
import wallImg from "@/assets/kajaria-bathroom-desktop.webp";
import porcelainImg from "@/assets/stacked_grey_slabs.png";
import slabImg from "@/assets/marble-slabs-corner-v2.png";
import marbleImg from "@/assets/solutions/countertops.png";
import sinkImg from "@/assets/exclusive_sinks.png";

interface CategoryCard {
  id: string;
  tag: string;
  title: string;
  dimensions: string;
  ctaText: string;
  href: string;
  image: string;
  colSpan: string; // Asymmetric masonry column span
}

const CATEGORIES: CategoryCard[] = [
  // Row 1: Floor Tiles (Wide 7 cols) + Wall Tiles (Standard 5 cols)
  {
    id: "floor-tiles",
    tag: "LIVING & RESIDENTIAL",
    title: "FLOOR TILES",
    dimensions: "80 × 160 / 120 × 120 CM",
    ctaText: "Explore Collection",
    href: "/products?application=Living+Room",
    image: floorImg,
    colSpan: "lg:col-span-7",
  },
  {
    id: "wall-tiles",
    tag: "INTERIOR & EXTERIOR CLADDING",
    title: "WALL TILES",
    dimensions: "60 × 120 / 80 × 160 CM",
    ctaText: "Explore",
    href: "/products?category=wall-tiles",
    image: wallImg,
    colSpan: "lg:col-span-5",
  },
  // Row 2: Porcelain (Standard 5 cols) + Large Format Slabs (Wide 7 cols)
  {
    id: "porcelain-tiles",
    tag: "HIGH-DENSITY VITRIFIED",
    title: "PORCELAIN TILES",
    dimensions: "RECTIFIED EUROPEAN GRADE",
    ctaText: "Explore",
    href: "/products?category=porcelain",
    image: porcelainImg,
    colSpan: "lg:col-span-5",
  },
  {
    id: "large-format-slabs",
    tag: "CONTINUOUS SINTERED STONE",
    title: "LARGE FORMAT SLABS",
    dimensions: "120 × 240 / 120 × 280 CM",
    ctaText: "Explore Collection",
    href: "/products?collection=UniTerra",
    image: slabImg,
    colSpan: "lg:col-span-7",
  },
  // Row 3: Marble & Granite (Wide 7 cols) + Sanitaryware (Standard 5 cols)
  {
    id: "marble-granite",
    tag: "IMPORTED NATURAL STONE",
    title: "MARBLE & GRANITE",
    dimensions: "ITALIAN BLOCKS & BESPOKE CUTS",
    ctaText: "Explore Collection",
    href: "/products?category=natural-stone",
    image: marbleImg,
    colSpan: "lg:col-span-7",
  },
  {
    id: "sanitaryware",
    tag: "HANDCRAFTED INTEGRATED",
    title: "BESPOKE SANITARYWARE",
    dimensions: "MONOLITHIC BASINS & TROUGHS",
    ctaText: "Explore",
    href: "/sinks",
    image: sinkImg,
    colSpan: "lg:col-span-5",
  },
];

export interface ShopByCategorySectionProps {
  content?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
}

export function ShopByCategorySection({ content }: ShopByCategorySectionProps) {
  const eyebrow = content?.badge || "SHOP BY CATEGORY";
  const subtitle =
    content?.subtitle ||
    "Explore our curated collection of surfaces for residential and commercial spaces.";

  return (
    <section className="w-full bg-[#FAF8F5] text-stone-900 pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 md:px-8 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-sans tracking-[0.3em] text-amber-800 uppercase font-semibold block mb-2">
            {eyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {subtitle}
          </h2>
          <div className="mt-3.5 h-[1px] w-12 bg-amber-700/40 mx-auto" />
        </div>

        {/* Asymmetric Masonry-style Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.href as any}
              className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 ease-out flex flex-col justify-end text-left h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px] ${cat.colSpan}`}
            >
              {/* Full-bleed Photography with slow 1.04x zoom */}
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Dark Gradient Overlay for perfect editorial contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-500" />

              {/* Card Content */}
              <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col justify-end">
                <span className="text-[10px] sm:text-[10.5px] font-mono tracking-[0.24em] text-amber-300/90 uppercase font-medium mb-1">
                  {cat.tag}
                </span>

                <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-medium text-white tracking-wider uppercase leading-tight">
                  {cat.title}
                </h3>

                <p className="text-[10.5px] sm:text-xs font-mono tracking-[0.16em] text-stone-300 uppercase mt-0.5 opacity-90">
                  {cat.dimensions}
                </p>

                {/* Subtle Moving CTA on Hover */}
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-sans font-medium text-amber-300 tracking-[0.16em] uppercase">
                  <span>{cat.ctaText}</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-5 sm:mt-6 text-center">
          <Link
            to="/products"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              if (window.__lenis) {
                window.__lenis.scrollTo(0, { immediate: true });
              }
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-stone-800 text-stone-900 font-sans font-medium text-xs uppercase tracking-[0.18em] hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ShopByCategorySection;
