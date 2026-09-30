import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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
          "Discover our collection of custom tile-integrated sinks and high-fired ceramic basins, crafted for architectural integrity.",
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
  features: string[];
}

const SINK_PRODUCTS: SinkProduct[] = [
  {
    id: "monolith-vanity-sink",
    group: "Tile-made Sinks",
    tag: "Porcelain Tile",
    name: "Monolith Vanity Sink",
    subtitle: "Seamlessly integrated large-format porcelain.",
    image: sinkDrainImg,
    dimensions: '36" L × 18" W × 6" D (Customizable)',
    material: "12mm High-Density Sintered Porcelain",
    leadTime: "Custom fabricated in 7–10 days",
    features: [
      "Zero visible surface joints",
      "Concealed linear slot drain system",
      "Stain-proof, acid-proof & scratch-resistant",
      "Compatible with wall-mount faucets",
    ],
  },
  {
    id: "linear-trough-basin",
    group: "Tile-made Sinks",
    tag: "Matte Ceramic Tile",
    name: "Linear Trough Basin",
    subtitle: "Architectural precision with minimalist grout lines.",
    image: sinkImg,
    dimensions: '48" L × 16" W × 5" D',
    material: "Artisanal Matte Glazed Ceramic Tiles",
    leadTime: "In Stock / Ready for Delivery",
    features: [
      "Sub-millimeter mitered tile edges",
      "Dual or single basin configuration",
      "Epoxy non-porous antimicrobial grouting",
      "Integrated matching stone countertop ledge",
    ],
  },
  {
    id: "artisan-vessel-bowl",
    group: "Ceramic Basins",
    tag: "Glazed Ceramic",
    name: "Artisan Vessel Bowl",
    subtitle: "High-fired clay with a tactile, earth-toned glaze.",
    image: countertopsImg,
    dimensions: '16" Diameter × 5.5" Height',
    material: "High-Fired Terracotta & Reactive Glaze",
    leadTime: "Limited Studio Batch (In Stock)",
    features: [
      "Individually hand-thrown ceramic profile",
      "Rich organic reactive mineral glaze",
      "Universal standard pop-up drain hole",
      "Easy-clean hydrophobic sealing",
    ],
  },
  {
    id: "sculpted-carrara-basin",
    group: "Ceramic Basins",
    tag: "Solid Carved Marble",
    name: "Sculpted Carrara Basin",
    subtitle: "Single-block Italian marble with nano-sealed finish.",
    image: showroomImg,
    dimensions: '18" L × 14" W × 5" D',
    material: "Authentic Italian Statuario / Carrara Marble",
    leadTime: "Hand-carved / Ready to ship",
    features: [
      "100% monolithic natural stone carving",
      "Nano-penetrating sealer against water stains",
      "Honed silk-smooth tactile surface",
      "Each piece features unique organic veining",
    ],
  },
];

function SinksPage() {
  useLenis();
  const [selectedSink, setSelectedSink] = useState<SinkProduct | null>(null);
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

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryPhone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Spec Sheet & Price Sent for ${selectedSink?.name}!`, {
        description: "Our sanitaryware specialist will contact you on WhatsApp shortly.",
      });
      setSelectedSink(null);
      setInquiryName("");
      setInquiryPhone("");
    }, 600);
  };

  const tileMadeSinks = SINK_PRODUCTS.filter((s) => s.group === "Tile-made Sinks");
  const ceramicBasins = SINK_PRODUCTS.filter((s) => s.group === "Ceramic Basins");

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

        <Link
          to="/catalog"
          className="p-1 text-[#2C2523] hover:opacity-75 transition-opacity"
          aria-label="Search catalog"
        >
          <Search className="h-5 w-5" />
        </Link>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[52px] z-40 bg-[#FAF7F2] border-b border-[#E7E2DA] p-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-[0.16em] text-[#2C2523]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Home
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
              Collections
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

      {/* Main Content Container */}
      <main className="flex-1 max-w-[440px] sm:max-w-xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-28 pb-24">
        {/* Desktop Back Navigation */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs active:scale-95 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 text-stone-600 group-hover:text-stone-950" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-stone-500">
            Sanitaryware
          </span>
        </div>

        {/* Page Header (Exact Typography from Screenshot) */}
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h1 className="text-[26px] sm:text-4xl font-serif font-normal text-[#1A1615] tracking-tight">
            Sinks &amp; Basins
          </h1>
          <p className="text-[#6B635B] text-[12.5px] sm:text-sm font-normal leading-relaxed max-w-[310px] sm:max-w-md mx-auto">
            Discover our collection of custom tile-integrated sinks and high-fired ceramic basins, crafted for architectural integrity.
          </p>
        </div>

        {/* Section 1: Tile-made Sinks */}
        <div className="space-y-4 mb-10 sm:mb-12">
          <h2 className="text-[21px] sm:text-2xl font-serif font-normal text-[#8A7156]">
            Tile-made Sinks
          </h2>

          <div className="space-y-7 sm:space-y-10">
            {tileMadeSinks.map((sink) => (
              <article key={sink.id} className="space-y-2.5">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 border border-[#E7E2DA]">
                  <img
                    src={sink.image}
                    alt={sink.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Block */}
                <div className="space-y-1 pt-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10.5px] font-medium tracking-wide bg-[#EFE5D8] text-[#4A3E34]">
                    {sink.tag}
                  </span>

                  <h3 className="text-[17px] sm:text-xl font-serif font-normal text-[#1A1615]">
                    {sink.name}
                  </h3>

                  <p className="text-[12px] sm:text-xs text-[#6B635B] font-normal leading-relaxed">
                    {sink.subtitle}
                  </p>
                </div>

                {/* View Details Button (Matching Screenshot Outline Style) */}
                <button
                  type="button"
                  onClick={() => setSelectedSink(sink)}
                  className="w-full py-2 sm:py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#1A1615] border border-[#2C2523] bg-transparent hover:bg-[#EFE5D8] transition-colors cursor-pointer active:scale-[0.99]"
                >
                  VIEW DETAILS
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* Section 2: Ceramic Basins */}
        <div className="space-y-4">
          <h2 className="text-[21px] sm:text-2xl font-serif font-normal text-[#8A7156]">
            Ceramic Basins
          </h2>

          <div className="space-y-7 sm:space-y-10">
            {ceramicBasins.map((sink) => (
              <article key={sink.id} className="space-y-2.5">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 border border-[#E7E2DA]">
                  <img
                    src={sink.image}
                    alt={sink.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Block */}
                <div className="space-y-1 pt-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10.5px] font-medium tracking-wide bg-[#EFE5D8] text-[#4A3E34]">
                    {sink.tag}
                  </span>

                  <h3 className="text-[17px] sm:text-xl font-serif font-normal text-[#1A1615]">
                    {sink.name}
                  </h3>

                  <p className="text-[12px] sm:text-xs text-[#6B635B] font-normal leading-relaxed">
                    {sink.subtitle}
                  </p>
                </div>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => setSelectedSink(sink)}
                  className="w-full py-2 sm:py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#1A1615] border border-[#2C2523] bg-transparent hover:bg-[#EFE5D8] transition-colors cursor-pointer active:scale-[0.99]"
                >
                  VIEW DETAILS
                </button>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Details & Quote Modal */}
      {selectedSink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FAF7F2] border border-stone-300 p-6 text-stone-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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

            {/* Quick Spec & Price Request Form */}
            <form onSubmit={handleInquiry} className="space-y-3 pt-2 border-t border-stone-200">
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
          to="/collections"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <LayoutGrid className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Collections</span>
        </Link>
        <Link
          to="/sinks"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#1A1615]"
        >
          <Layers className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Products</span>
        </Link>
        <a
          href="/#showroom"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <MapPin className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Stores</span>
        </a>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
