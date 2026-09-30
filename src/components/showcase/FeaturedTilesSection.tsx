import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export interface FeaturedProduct {
  id: number | string;
  name: string;
  slug?: string;
  sku?: string;
  size?: string;
  finish?: string;
  thickness?: string;
  material?: string;
  price?: number;
  unit?: string;
  main_image?: string;
  images?: string[];
}

export interface FeaturedTilesSectionProps {
  content?: {
    heading?: string;
    title?: string;
    description?: string;
    subtitle?: string;
    badge?: string;
    cta_text?: string;
    cta_link?: string;
    max_display?: number;
    product_ids?: (number | string)[];
    selected_products?: FeaturedProduct[];
  };
}

export function FeaturedTilesSection({ content }: FeaturedTilesSectionProps) {
  const [products, setProducts] = useState<FeaturedProduct[]>(content?.selected_products || []);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const heading = content?.heading || content?.title || "Featured Tiles & Slabs";
  const description =
    content?.description ||
    content?.subtitle ||
    "Explore our curated selection of premium tiles, porcelain surfaces and large-format slabs for contemporary residential and commercial spaces.";
  const badge = content?.badge || "FEATURED TILES & SLABS";
  const ctaText = content?.cta_text || "View All Products";
  const ctaLink = content?.cta_link || "/products";
  const maxDisplay = content?.max_display || 4;

  useEffect(() => {
    // If selected_products were provided by the CMS, use them in exact order
    if (content?.selected_products && content.selected_products.length > 0) {
      setProducts(content.selected_products.slice(0, maxDisplay));
      return;
    }

    // Otherwise, fetch real products from backend and sort by product_ids if configured
    let isMounted = true;
    setLoading(true);

    fetch("http://localhost:5000/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.products)) {
          let list: FeaturedProduct[] = data.products;

          if (content?.product_ids && content.product_ids.length > 0) {
            const idMap = new Map<string, FeaturedProduct>(
              data.products.map((p: FeaturedProduct) => [String(p.id), p])
            );
            const ordered: FeaturedProduct[] = [];
            for (const pid of content.product_ids) {
              const found = idMap.get(String(pid));
              if (found) ordered.push(found);
            }
            if (ordered.length > 0) {
              list = ordered;
            }
          }

          setProducts(list.slice(0, maxDisplay));
        }
      })
      .catch(() => {
        // Fallback or offline state
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [content?.selected_products, content?.product_ids, maxDisplay]);

  const resolveImage = (prod: FeaturedProduct) => {
    const raw = prod.main_image || prod.images?.[0];
    if (!raw) return "/assets/marble-slabs-corner-v2.png";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/assets/")) {
      return raw;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  };

  return (
    <section
      id="featured-tiles"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10 font-sans"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-3.5">
            <Sparkles className="h-3 w-3 text-amber-800" />
            <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-amber-900 font-mono">
              {badge}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight leading-tight">
            {heading}
          </h2>

          <p className="mt-3 text-stone-600 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* 4-Column Desktop Grid / Horizontal Swipe Carousel on Mobile */}
        {loading && products.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-stone-400">
            <div className="h-8 w-8 rounded-full border-2 border-amber-800 border-t-transparent animate-spin mb-3" />
            <span className="text-xs font-mono tracking-widest uppercase">Loading Curated Slabs...</span>
          </div>
        ) : (
          <div>
            <div
              ref={scrollContainerRef}
              className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible gap-5 sm:gap-6 lg:gap-7 snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {products.map((prod) => {
                const sizeText = prod.size || "120 × 240 cm";
                const thicknessText = prod.thickness ? ` · ${prod.thickness}` : "";
                const finishText = prod.finish || "Polished";
                const unitLabel = prod.unit === "slab" ? "Slab" : prod.unit === "piece" ? "Pc" : "Box";

                return (
                  <Link
                    key={prod.id}
                    to="/products"
                    search={{ id: prod.id } as any}
                    onClick={handleScrollToTop}
                    className="group flex-none w-[78vw] max-w-[300px] sm:w-auto snap-center flex flex-col text-left cursor-pointer transition-colors"
                  >
                    {/* Large Product Image with subtle hover zoom */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-stone-200/60 border border-stone-200/80 mb-3.5 sm:mb-4">
                      <img
                        src={resolveImage(prod)}
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* Content Details: Name -> Size & Finish -> Price -> View Product */}
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-[15px] font-serif font-bold text-stone-900 uppercase tracking-wide leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-stone-500 font-sans tracking-wide">
                        {sizeText}
                        {thicknessText}
                      </p>

                      <p className="text-xs text-stone-600 font-sans font-medium">
                        {finishText}
                      </p>

                      {prod.price && Number(prod.price) > 0 ? (
                        <p className="text-xs sm:text-[13px] font-serif font-semibold text-stone-900 pt-0.5">
                          ₹{Number(prod.price).toLocaleString("en-IN")} / {unitLabel}
                        </p>
                      ) : null}

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold tracking-wider uppercase text-amber-900 group-hover:text-amber-700 transition-colors">
                          <span>View Product</span>
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile swipe indicator */}
            <div className="flex sm:hidden items-center justify-center gap-2 mt-4 text-[10.5px] font-mono uppercase tracking-[0.2em] text-stone-400">
              <span>← Swipe →</span>
            </div>
          </div>
        )}

        {/* View All Products CTA Button at Bottom */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            to={ctaLink as any}
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-stone-800 text-stone-900 font-sans font-medium text-xs uppercase tracking-[0.2em] hover:bg-stone-950 hover:text-white transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer active:scale-95"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedTilesSection;
