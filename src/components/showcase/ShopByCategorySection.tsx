import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Package } from "lucide-react";
import { getPublicCategories } from "@/lib/api";

import floorImg from "@/assets/solutions/flooring.png";
import wallImg from "@/assets/kajaria-bathroom-desktop.webp";
import marbleImg from "@/assets/solutions/countertops.png";
import slabImg from "@/assets/marble-slabs-corner-v2.png";
import commercialImg from "@/assets/solutions/commercial.png";

const FALLBACK_CATEGORY_IMAGES = [floorImg, wallImg, marbleImg, slabImg, commercialImg];

export interface CategoryCardItem {
  id: string | number;
  title: string;
  description?: string;
  href: string;
  image: string;
  colSpan: string;
}

export interface ShopByCategorySectionProps {
  content?: {
    heading?: string;
    title?: string;
    badge?: string;
    subtitle?: string;
    description?: string;
    cta_text?: string;
    cta_link?: string;
    categories?: any[];
  };
}

export function ShopByCategorySection({ content }: ShopByCategorySectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState<CategoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eyebrow = content?.badge || "SHOP BY CATEGORY";
  const heading = content?.heading || content?.title || "Curated Collections";
  const rawSubtitle = (content?.description || content?.subtitle || "").trim();
  const subtitle =
    !rawSubtitle ||
    rawSubtitle.toLowerCase().includes("finest materials") ||
    rawSubtitle.toLowerCase().includes("attention to detail") ||
    rawSubtitle.toLowerCase().includes("discover our high-end")
      ? "Collections crafted for every space."
      : rawSubtitle;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // If CMS passes specific custom categories, use them; otherwise fetch from DB
      if (content?.categories && Array.isArray(content.categories) && content.categories.length > 0) {
        setCategories(formatCategories(content.categories));
        return;
      }

      const res = await getPublicCategories();
      if (res?.success && Array.isArray(res.categories)) {
        setCategories(formatCategories(res.categories));
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error("Failed to load categories for homepage:", err);
      setError(err?.message || "Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCategories = (items: any[]): CategoryCardItem[] => {
    return items.map((cat, idx) => {
      // Alternate asymmetric column span (7 then 5) to preserve the editorial masonry look
      const isSeven = idx % 4 === 0 || idx % 4 === 3;
      const defaultImg = FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];
      const image = cat.image?.startsWith("http") || cat.image?.startsWith("/") ? cat.image : defaultImg;
      const targetSlug = cat.slug || cat.name || "";

      return {
        id: cat.id || idx,
        title: (cat.name || "Category").toUpperCase(),
        description: cat.description || "",
        href: `/products?category=${encodeURIComponent(targetSlug)}`,
        image,
        colSpan: isSeven ? "lg:col-span-7" : "lg:col-span-5",
      };
    });
  };

  useEffect(() => {
    fetchCategories();
  }, [content?.categories]);

  // By default, view only 4 categories; rest shown by clicking more
  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <section
      id="shop-by-space"
      className="w-full bg-[#FAF8F5] text-stone-900 pt-8 pb-5 sm:pt-12 sm:pb-7 px-4 sm:px-6 md:px-8 border-t border-stone-200/80 font-sans"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-3">
            <Compass className="h-3 w-3 text-amber-800" />
            <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-amber-900 font-mono">
              {eyebrow}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {heading}
          </h2>

          <p className="mt-2.5 text-stone-600 text-xs sm:text-sm font-normal max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Loading / Error / Empty / Masonry Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6 py-6">
            <div className="lg:col-span-7 h-[280px] bg-stone-200/60 animate-pulse rounded-none" />
            <div className="lg:col-span-5 h-[280px] bg-stone-200/60 animate-pulse rounded-none" />
            <div className="lg:col-span-5 h-[280px] bg-stone-200/60 animate-pulse rounded-none" />
            <div className="lg:col-span-7 h-[280px] bg-stone-200/60 animate-pulse rounded-none" />
          </div>
        ) : error ? (
          <div className="bg-white border border-stone-200 p-8 text-center max-w-md mx-auto my-6 space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-700 mx-auto" />
            <p className="text-xs text-stone-600 font-medium">{error}</p>
            <button
              onClick={fetchCategories}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-stone-200 p-10 text-center max-w-md mx-auto my-6 space-y-3">
            <Package className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-stone-800">No Categories Found</h3>
            <p className="text-xs text-stone-500">Categories added in Admin will display here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
            {visibleCategories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.href as any}
                className={`group relative rounded-none overflow-hidden shadow-2xs hover:shadow-2xl transition-all duration-500 ease-out flex flex-col justify-end text-left h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px] ${cat.colSpan}`}
              >
                {/* Full-bleed Photography with slow hover zoom */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for optimal typographic contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent group-hover:from-black/95 group-hover:via-black/55 transition-colors duration-500" />

                {/* Card Content - Clean title, sharp edges */}
                <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-medium text-white tracking-wider uppercase leading-tight group-hover:text-amber-200 transition-colors">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-stone-300 line-clamp-1 mt-1 opacity-90">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Toggle Button: View only 4 initially, rest by clicking more */}
        {!loading && categories.length > 4 && (
          <div className="mt-4 sm:mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-800 bg-white hover:bg-stone-950 text-stone-900 hover:text-white font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer active:scale-95 group"
            >
              {showAll ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  <span>View More (+{categories.length - 4})</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopByCategorySection;
