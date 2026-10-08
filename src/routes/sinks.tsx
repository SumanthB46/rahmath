import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useLenis } from "@/hooks/useLenis";
import {
  Home,
  LayoutGrid,
  Layers,
  MapPin,
  X,
  CheckCircle2,
  ArrowLeft,
  Menu,
  Search,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { getPublicProducts } from "@/lib/api";

import sinkImg from "@/assets/exclusive_sinks.png";
import sinkDrainImg from "@/assets/Remove_taps_and_sink_drain_202607261544.jpeg";
import countertopsImg from "@/assets/solutions/countertops.png";
import showroomImg from "@/assets/showroom_experience.png";

export const Route = createFileRoute("/sinks")({
  head: () => ({
    meta: [
      { title: "Sinks & Basins — CERAMICHE | Mubarak" },
      {
        name: "description",
        content:
          "Discover our collection of custom tile-integrated sinks, monolithic basins, and high-fired ceramic basins.",
      },
    ],
  }),
  component: SinksPage,
});

interface SinkProduct {
  id: string;
  group: "Tile-made Sinks" | "Ceramic Basins";
  tag: string;
  name: string;
  subtitle: string;
  image: string;
  dimensions: string;
  material: string;
  leadTime: string;
  price: number;
  features: string[];
}

function SinksPage() {
  useLenis();
  const { cart, addToCart, openCart, totalCount } = useCart();
  const [sinksList, setSinksList] = useState<SinkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSink, setSelectedSink] = useState<SinkProduct | null>(null);

  const getCartItemQty = (sink: SinkProduct) => {
    const item = cart.find(
      (i) => String(i.id) === String(sink.id) || i.name.toLowerCase() === sink.name.toLowerCase()
    );
    return item ? item.quantity : 0;
  };
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendSinks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPublicProducts({ limit: 100 });
        if (isMounted && res?.products && Array.isArray(res.products)) {
          const apiSinks = res.products
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
              id: String(p.id),
              group: (p.name?.toLowerCase().includes("tile") || p.material?.toLowerCase().includes("porcelain")
                ? "Tile-made Sinks"
                : "Ceramic Basins") as "Tile-made Sinks" | "Ceramic Basins",
              tag: p.category_name || "Bespoke Sink",
              name: p.name,
              subtitle: p.description || "Precision engineered architectural basin.",
              image: p.main_image?.startsWith("http")
                ? p.main_image
                : p.main_image?.startsWith("/")
                ? p.main_image
                : (p.images && p.images[0]) || sinkImg,
              dimensions: p.size || '36" L × 18" W × 6" D',
              material: p.material || "High-Density Sintered Porcelain",
              leadTime: (p.stock_quantity || 0) > 0 ? "In Stock / Ready for Dispatch" : "Custom fabricated on order",
              price: typeof p.price === "string" ? parseFloat(p.price) : p.price || 18500,
              features: [
                "Zero visible surface joints",
                "Concealed linear slot drain system",
                "Stain-proof, acid-proof & scratch-resistant",
                "Factory tested & certified",
              ],
            }));

          setSinksList(apiSinks);
        } else {
          setSinksList([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch sinks:", err);
        setError(err?.message || "Failed to load sinks from server.");
        setSinksList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBackendSinks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryPhone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Spec Sheet & Price Sent for ${selectedSink?.name}!`, {
        description: "Our sanitaryware specialist will contact you on WhatsApp shortly.",
        duration: 3500,
      });
      setSelectedSink(null);
      setInquiryName("");
      setInquiryPhone("");
    }, 600);
  };

  const [activeCategory, setActiveCategory] = useState<"all" | "tile" | "ceramic">("all");

  // Prevent background scrolling when modal is open and handle ESC key to close
  useEffect(() => {
    if (selectedSink) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedSink(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedSink]);

  const tileMadeSinks = sinksList.filter((s) => s.group === "Tile-made Sinks");
  const ceramicBasins = sinksList.filter((s) => s.group === "Ceramic Basins");
  const displayedSinks =
    activeCategory === "tile"
      ? tileMadeSinks
      : activeCategory === "ceramic"
      ? ceramicBasins
      : sinksList;

  return (
    <div className="bg-[#FAF7F2] text-[#2C2523] min-h-screen flex flex-col justify-between selection:bg-amber-200">
      {/* Mobile Top Header (Exact Match to Reference Screenshot) */}
      <header className="sm:hidden sticky top-0 z-40 bg-[#FAF7F2] border-b border-[#E7E2DA] px-4 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-[#2C2523] hover:opacity-75 transition-opacity"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          to="/"
          className="text-[17px] font-serif tracking-[0.22em] text-[#2C2523] uppercase font-normal"
        >
          CERAMICHE
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCart}
            className="relative p-1 text-[#2C2523] hover:opacity-75 transition-opacity"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-800 text-white rounded-full text-[9px] font-bold h-4 w-4 flex items-center justify-center font-mono">
                {totalCount}
              </span>
            )}
          </button>

          <Link
            to="/catalog"
            className="p-1 text-[#2C2523] hover:opacity-75 transition-opacity"
            aria-label="Search catalog"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[52px] z-40 bg-[#FAF7F2] border-b border-[#E7E2DA] p-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-[0.16em] text-[#2C2523]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Home
            </Link>

            <Link to="/sinks" onClick={() => setMobileMenuOpen(false)} className="text-amber-900 font-bold py-1">
              Sinks &amp; Basins
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Products
            </Link>
            <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Catalogues
            </Link>
            <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Tile Calculator
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop Floating Navigation */}
      <div className="hidden sm:block">
        <GlassNav />
      </div>

      {/* Main Content Container - 3 cards per row architectural grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-4 sm:pt-24 pb-16">
        {/* Desktop Back Navigation */}
        <div className="hidden sm:flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs active:scale-95 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 text-stone-600 group-hover:text-stone-950" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-stone-500">
            Sanitaryware &amp; Basins
          </span>
        </div>

        {/* Page Header - Compact & Tight */}
        <div className="text-center space-y-1.5 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#1A1615] tracking-tight">
            Sinks &amp; Basins
          </h1>
          <p className="text-[#6B635B] text-xs sm:text-sm font-normal leading-relaxed max-w-lg mx-auto">
            Discover our collection of custom tile-integrated sinks and high-fired ceramic basins, crafted for architectural integrity.
          </p>

          {/* Quick Filter Tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#1A1615] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              All Sinks ({sinksList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("tile")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === "tile"
                  ? "bg-[#1A1615] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              Tile-made Sinks ({tileMadeSinks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("ceramic")}
              className={`px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === "ceramic"
                  ? "bg-[#1A1615] text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              Ceramic Basins ({ceramicBasins.length})
            </button>
          </div>
        </div>

        {/* Loading / Error / Empty States & 3 Cards In A Row Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 py-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-stone-200/80 p-4 animate-pulse space-y-3">
                <div className="aspect-[16/10] bg-stone-200/70" />
                <div className="h-4 bg-stone-200/70 w-3/4 rounded" />
                <div className="h-3 bg-stone-200/50 w-1/2 rounded" />
                <div className="h-8 bg-stone-200/70 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-stone-200 p-8 text-center max-w-md mx-auto my-8 space-y-3">
            <p className="text-xs text-stone-600 font-medium">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                getPublicProducts({ limit: 100 })
                  .then((res: any) => {
                    if (res?.products) {
                      setSinksList(res.products.filter((p: any) => p.name?.toLowerCase().includes("sink") || p.name?.toLowerCase().includes("basin")));
                    }
                  })
                  .finally(() => setLoading(false));
              }}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : displayedSinks.length === 0 ? (
          <div className="bg-white border border-stone-200 p-12 text-center max-w-lg mx-auto my-8 space-y-2">
            <h3 className="text-sm font-serif font-bold text-stone-900">No Sinks Available</h3>
            <p className="text-xs text-stone-500">
              No products currently match this category. Please select another filter or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {displayedSinks.map((sink) => {
              const inCartQty = getCartItemQty(sink);
            return (
              <article
                key={sink.id}
                className="group flex flex-col bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl border-0 rounded-none"
              >
                {/* Full-bleed architectural landscape image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <img
                    src={sink.image}
                    alt={sink.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = sinkImg;
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-block px-2 py-0.5 text-[8.5px] font-semibold tracking-wider uppercase bg-[#EFE5D8]/95 text-[#4A3E34] font-mono shadow-xs backdrop-blur-xs">
                      {sink.tag}
                    </span>
                  </div>
                </div>

                {/* Below Text Content - Snug & Compact */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-[15px] font-serif font-medium text-[#1A1615] group-hover:text-amber-900 transition-colors line-clamp-1">
                      {sink.name}
                    </h3>

                    <p className="text-[11px] text-[#6B635B] font-normal leading-relaxed line-clamp-1">
                      {sink.subtitle}
                    </p>

                    <p className="text-[10px] font-mono text-stone-500 uppercase line-clamp-1">
                      {sink.dimensions} · {sink.material}
                    </p>

                    {/* Price Row directly below dimensions */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-sm font-serif font-bold text-[#1A1615]">
                        ₹{sink.price.toLocaleString("en-IN")}{" "}
                        <span className="text-[9px] font-sans font-normal text-[#6B635B]">+ 18% GST</span>
                      </span>
                      <span className="text-[9.5px] font-mono text-[#8A7156]">
                        {sink.leadTime}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({
                          id: sink.id,
                          name: sink.name,
                          image: sink.image,
                          price: sink.price,
                          unit: "piece",
                          specs: `${sink.tag} · ${sink.material}`,
                          dimensions: sink.dimensions,
                          category: sink.group,
                        });
                        openCart();
                      }}
                      className={`py-2 text-[9.5px] font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-xs ${
                        inCartQty > 0
                          ? "bg-amber-950/90 border border-amber-500/70 text-amber-300 hover:bg-amber-900"
                          : "bg-[#1A1615] hover:bg-stone-800 text-white"
                      }`}
                    >
                      {inCartQty > 0 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-amber-400" />
                          <span>IN CART ({inCartQty})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3 w-3 text-amber-300" />
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSink(sink)}
                      className="py-2 text-center text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#1A1615] border border-[#2C2523] bg-transparent hover:bg-[#EFE5D8] transition-colors cursor-pointer active:scale-98"
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>

      {/* Details & Quote Modal */}
      {selectedSink && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setSelectedSink(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-md bg-[#FAF7F2] border border-stone-300 p-6 text-stone-900 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar scrollbar-none overscroll-contain animate-in zoom-in-95 duration-200"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSink(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-500 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#EFE5D8] text-[#4A3E34] mb-1">
                {selectedSink.tag}
              </span>
              <h3 className="text-xl font-serif text-stone-950">{selectedSink.name}</h3>
              <p className="text-xs text-[#6B635B] mt-0.5">{selectedSink.subtitle}</p>
            </div>

            {/* Specifications */}
            <div className="p-3.5 bg-white border border-[#E7E2DA] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500 font-medium">Dimensions</span>
                <span className="font-semibold text-stone-900 font-mono">{selectedSink.dimensions}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="text-stone-500 font-medium">Material Composition</span>
                <span className="font-semibold text-stone-900">{selectedSink.material}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Fabrication Timeline</span>
                <span className="font-semibold text-amber-900">{selectedSink.leadTime}</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                Features
              </span>
              <ul className="space-y-1 text-xs text-stone-600">
                {selectedSink.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing & Instant Add to Cart */}
            <div className="p-3.5 bg-stone-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                    Product Price
                  </span>
                  <span className="text-xl font-serif font-bold text-amber-200">
                    ₹{selectedSink.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-stone-400 font-sans ml-1">+ 18% GST</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      id: selectedSink.id,
                      name: selectedSink.name,
                      image: selectedSink.image,
                      price: selectedSink.price,
                      unit: "piece",
                      specs: `${selectedSink.tag} · ${selectedSink.material}`,
                      dimensions: selectedSink.dimensions,
                      category: selectedSink.group,
                    });
                    setSelectedSink(null);
                    openCart();
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {getCartItemQty(selectedSink) > 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-stone-950" />
                      <span>In Cart ({getCartItemQty(selectedSink)})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Spec & Price Request Form */}
            <form onSubmit={handleInquiry} className="space-y-3 pt-2 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Or Request CAD Spec &amp; Custom Quote
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 00000"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending Request..." : "Request Price & CAD"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Exact Match to Screenshot) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2] border-t border-[#E7E2DA] py-2 px-6 flex justify-between items-center text-[#554D45] shadow-xs">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <Home className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Home</span>
        </Link>
        <Link
          to="/products"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <Layers className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Products</span>
        </Link>
        <Link
          to="/sinks"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#1A1615]"
        >
          <LayoutGrid className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Sinks</span>
        </Link>
        <a
          href="/#showroom"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <MapPin className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Stores</span>
        </a>
      </div>

      {/* Persistent Floating Cart Button */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={openCart}
          className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-600/40"
          aria-label="View Cart"
        >
          <div className="relative">
            <ShoppingBag className="h-4.5 w-4.5 text-amber-300" />
            <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
              {totalCount}
            </span>
          </div>
          <span>Cart ({totalCount})</span>
        </button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
