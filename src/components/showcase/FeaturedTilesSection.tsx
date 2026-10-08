import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShoppingBag, Eye, RefreshCw, AlertCircle, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getPublicProducts } from "@/lib/api";

import monolithImg from "@/assets/Remove_taps_and_sink_drain_202607261544.jpeg";

export interface FeaturedProduct {
  id: number | string;
  name: string;
  slug?: string;
  sku?: string;
  tag?: string;
  size?: string;
  finish?: string;
  thickness?: string;
  material?: string;
  price?: number;
  unit?: string;
  main_image?: string;
  images?: string[];
  description?: string;
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
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rawHeading = content?.heading || content?.title;
  const isOldTileHeading =
    !rawHeading ||
    rawHeading.toLowerCase().includes("featured tiles") ||
    rawHeading.toLowerCase().includes("slabs") ||
    rawHeading.toLowerCase().includes("best-selling") ||
    rawHeading.toLowerCase().includes("quick sinks");

  const heading = isOldTileHeading ? "Premium Sinks & Basins Collection" : rawHeading;

  const description =
    content?.description ||
    content?.subtitle ||
    "Engineered monolithic basins crafted with zero visible joints and hydrophobic nano-sealed surfaces.";

  const badge = content?.badge || "BESPOKE SANITARYWARE";
  const ctaText = content?.cta_text || "Explore All Architectural Sinks";
  const ctaLink = content?.cta_link || "/sinks";
  const maxDisplay = content?.max_display || 4;

  const [backendSinks, setBackendSinks] = useState<FeaturedProduct[]>([]);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [errorBackend, setErrorBackend] = useState<string | null>(null);

  const fetchBackendProducts = async () => {
    try {
      setLoadingBackend(true);
      setErrorBackend(null);
      // Fetch authoritative products from GET /api/products
      const res = await getPublicProducts({ limit: 50 });
      if (res?.products && Array.isArray(res.products)) {
        const sinkMatches = res.products
          .filter((p: any) => {
            const name = (p.name || "").toLowerCase();
            const cat = (p.category_name || "").toLowerCase();
            const sku = (p.sku || "").toLowerCase();
            return (
              name.includes("sink") ||
              name.includes("basin") ||
              name.includes("vanity") ||
              cat.includes("sanitary") ||
              cat.includes("sink") ||
              sku.includes("snk")
            );
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            tag: p.category_name || "Bespoke Sink",
            size: p.size || '36" × 18" × 6"',
            finish: p.finish || "Matte",
            material: p.material || "Sintered Porcelain",
            price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
            unit: p.unit || "piece",
            main_image: p.main_image?.startsWith("http")
              ? p.main_image
              : p.main_image?.startsWith("/")
              ? p.main_image
              : (p.images && p.images[0]) || monolithImg,
            description: p.description,
          }));

        setBackendSinks(sinkMatches);
      } else {
        setBackendSinks([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch sinks for showcase:", err);
      setErrorBackend(err?.message || "Unable to load sinks from server.");
      setBackendSinks([]);
    } finally {
      setLoadingBackend(false);
    }
  };

  useEffect(() => {
    fetchBackendProducts();
  }, []);

  // Authoritative source: CMS selected products if defined, else backend sinks from DB
  const displayProducts = (
    content?.selected_products && content.selected_products.length > 0
      ? content.selected_products
      : backendSinks
  ).slice(0, maxDisplay);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, prod: FeaturedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: prod.id,
      name: prod.name,
      price: prod.price || 0,
      image: prod.main_image || monolithImg,
      unit: prod.unit || "piece",
      dimensions: prod.size,
      specs: `${prod.material || "Sanitaryware"} · ${prod.finish || "Standard"}`,
      category: "Sinks & Basins",
    });
  };

  return (
    <section
      id="featured-sinks"
      className="pt-6 pb-12 sm:pt-8 sm:pb-16 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10 font-sans"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
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

        {/* Loading State */}
        {loadingBackend ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-stone-200/70 p-4 animate-pulse space-y-3">
                <div className="aspect-[4/3] rounded-xl bg-stone-200/70" />
                <div className="h-4 bg-stone-200/70 rounded w-3/4" />
                <div className="h-3 bg-stone-200/50 rounded w-1/2" />
                <div className="h-8 bg-stone-200/70 rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : errorBackend ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center max-w-md mx-auto my-6 space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-700 mx-auto" />
            <p className="text-xs text-stone-600 font-medium">{errorBackend}</p>
            <button
              onClick={fetchBackendProducts}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-10 text-center max-w-md mx-auto my-6 space-y-3">
            <Package className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-stone-800">No Sinks Currently Available</h3>
            <p className="text-xs text-stone-500">
              New bespoke basins and vanity sinks are being added. Check back soon or visit our showroom.
            </p>
          </div>
        ) : (
          <div>
            <div
              ref={scrollContainerRef}
              className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible gap-5 sm:gap-6 lg:gap-7 snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {displayProducts.map((prod) => {
                const sizeText = prod.size || '36" × 18"';
                const finishText = prod.finish || "Matte";
                const tagLabel = prod.tag || "Sink";

                return (
                  <div
                    key={prod.id}
                    className="group flex-none w-[78vw] max-w-[300px] sm:w-auto snap-center flex flex-col justify-between bg-white rounded-2xl border border-stone-200/90 hover:border-amber-700/40 p-4 transition-all duration-300 shadow-2xs hover:shadow-lg"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 mb-3.5">
                        <img
                          src={prod.main_image}
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="inline-block px-2 py-0.5 text-[9.5px] font-semibold tracking-wider uppercase bg-[#EFE5D8]/95 text-[#4A3E34] rounded-md shadow-xs backdrop-blur-xs font-mono">
                            {tagLabel}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-[15px] font-serif font-bold text-stone-900 tracking-tight leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>

                        <p className="text-xs text-stone-500 font-sans tracking-wide">
                          {sizeText}
                        </p>

                        <p className="text-xs text-stone-600 font-sans font-medium line-clamp-1">
                          {finishText} · {prod.material}
                        </p>

                        {prod.price && Number(prod.price) > 0 ? (
                          <p className="text-sm sm:text-base font-serif font-bold text-stone-950 pt-1">
                            ₹{Number(prod.price).toLocaleString("en-IN")}{" "}
                            <span className="text-[10px] font-sans font-normal text-stone-500">
                              / {prod.unit || "pc"}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Actions: Add to Cart + View Details */}
                    <div className="pt-3.5 mt-3 border-t border-stone-100 space-y-2">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-amber-300" />
                        <span>Add to Cart</span>
                      </button>

                      <Link
                        to="/sinks"
                        onClick={handleScrollToTop}
                        className="w-full py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors block"
                      >
                        View Specs &amp; CAD →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile swipe indicator */}
            <div className="flex sm:hidden items-center justify-center gap-2 mt-4 text-[10.5px] font-mono uppercase tracking-[0.2em] text-stone-400">
              <span>← Swipe Sinks →</span>
            </div>
          </div>
        )}

        {/* View All Sinks CTA Button at Bottom */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            to={ctaLink as any}
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-amber-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export { FeaturedTilesSection as QuickSinksSection, FeaturedTilesSection as FeaturedSinksSection };
export default FeaturedTilesSection;
