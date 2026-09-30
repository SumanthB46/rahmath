import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useLenis } from "@/hooks/useLenis";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Home,
  LayoutGrid,
  Layers,
  MapPin,
  ArrowUpRight,
  ArrowLeft,
  Menu,
  Search,
  X,
} from "lucide-react";

import countertopsImg from "@/assets/solutions/countertops.png";
import flooringImg from "@/assets/solutions/flooring.png";
import bathroomImg from "@/assets/kajaria-bathroom-desktop.webp";
import outdoorImg from "@/assets/kajaria-outdoor-dektop1.webp";
import commercialImg from "@/assets/solutions/commercial.png";
import cabinetsImg from "@/assets/solutions/cabinets.png";
import showroomImg from "@/assets/showroom_experience.png";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — CERAMICHE | Mubarak" },
      {
        name: "description",
        content:
          "Explore our curated selection of architectural surfaces designed for precise applications.",
      },
    ],
  }),
  component: CollectionsPage,
});

interface CollectionItem {
  id: string;
  title: string;
  category: "porcelain" | "marble" | "granite" | "all";
  href: string;
  image: string;
  layoutType: "half" | "full";
  itemCount: string;
  description: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: "kitchen",
    title: "Kitchen",
    category: "granite",
    href: "/catalog?application=Kitchen",
    image: countertopsImg,
    layoutType: "half",
    itemCount: "42 Slab Finishes",
    description: "Heat-resistant quartz, ultra-compact sintered stone, and polished granite.",
  },
  {
    id: "stairs",
    title: "Stairs",
    category: "granite",
    href: "/catalog?application=Staircases",
    image: countertopsImg,
    layoutType: "half",
    itemCount: "26 Profiles",
    description: "Bullnose, full-body vitrified risers, and anti-skid grooved treads.",
  },
  {
    id: "floor",
    title: "Floor",
    category: "porcelain",
    href: "/catalog?application=Living+Room",
    image: flooringImg,
    layoutType: "full",
    itemCount: "80+ Master Formats",
    description: "Continuous veining, high-traffic vitrified slabs, and honed porcelain tiles.",
  },
  {
    id: "commercial",
    title: "Commercial",
    category: "porcelain",
    href: "/catalog?application=Commercial+Spaces",
    image: commercialImg,
    layoutType: "half",
    itemCount: "34 Formats",
    description: "Heavy duty, high breaking strength anti-abrasion industrial surfaces.",
  },
  {
    id: "bathroom",
    title: "Bathroom",
    category: "marble",
    href: "/catalog?application=Bathroom",
    image: bathroomImg,
    layoutType: "half",
    itemCount: "58 Formats",
    description: "Zero-absorption porcelain walls, bookmatched marble, and textured anti-slip floors.",
  },
  {
    id: "outdoor",
    title: "Outdoor",
    category: "granite",
    href: "/catalog?application=Outdoor",
    image: outdoorImg,
    layoutType: "full",
    itemCount: "29 Thick Slabs",
    description: "20mm thick exterior pavers, bush-hammered granite, and textured stone.",
  },
  {
    id: "living-room",
    title: "Living Room",
    category: "marble",
    href: "/catalog?application=Living+Room",
    image: showroomImg,
    layoutType: "half",
    itemCount: "64 Formats",
    description: "Large format book-matched Italian marble, polished glazed vitrified slabs.",
  },
  {
    id: "bedroom",
    title: "Bedroom",
    category: "porcelain",
    href: "/catalog?application=Bedroom",
    image: flooringImg,
    layoutType: "half",
    itemCount: "38 Warm Surfaces",
    description: "Matte finish acoustic tiles and warm travertine texture floorings.",
  },
];

const FILTERS = [
  { key: "all", label: "ALL" },
  { key: "new", label: "NEW IN" },
  { key: "porcelain", label: "PORCELAIN" },
  { key: "marble", label: "MARBLE" },
  { key: "granite", label: "GRANITE" },
];

function CollectionsPage() {
  useLenis();
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  const filteredItems = COLLECTIONS.filter(
    (item) => activeFilter === "all" || item.category === activeFilter || activeFilter === "all"
  ).sort((a, b) => (sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  return (
    <div className="bg-[#FAF7F2] text-[#2C2523] min-h-screen flex flex-col justify-between selection:bg-amber-200">
      {/* Mobile Top Header (Matching Screenshot) */}
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
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="text-amber-900 font-bold py-1">
              Collections
            </Link>
            <Link to="/sinks" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-800 py-1">
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-stone-700 group-hover:text-stone-950" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[10.5px] font-mono font-bold uppercase tracking-[0.2em] text-stone-500">
            Mubarak Collections
          </span>
        </div>

        {/* Page Header */}
        <div className="space-y-2 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-stone-950 tracking-tight">
            Collections
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl">
            Explore our curated selection of architectural surfaces designed for precise applications.
          </p>
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pb-6 sm:pb-8 border-b border-stone-200/90 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-stone-500 mr-1 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>FILTER</span>
            </div>

            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer shrink-0 ${isActive
                    ? "bg-stone-800 text-white shadow-xs"
                    : "bg-stone-200/70 hover:bg-stone-300/80 text-stone-700"
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sort Button */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-stone-700 hover:text-stone-950 transition-colors shrink-0 cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 self-end xs:self-auto"
          >
            <span>SORT</span>
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Collections Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8 sm:gap-y-10">
          {filteredItems.map((item) => {
            const isFullWidth = item.layoutType === "full";
            const colClass = isFullWidth ? "sm:col-span-2" : "sm:col-span-1";
            const aspectClass = isFullWidth
              ? "aspect-[16/9] sm:aspect-[21/9]"
              : "aspect-[4/3] sm:aspect-[1/1]";

            return (
              <Link
                key={item.id}
                to={item.href}
                className={`group block cursor-pointer ${colClass}`}
              >
                {/* Image Container with Rounded Corners matching the reference image */}
                <div
                  className={`relative ${aspectClass} rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-xs group-hover:shadow-xl transition-all duration-500`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Corner Item Count Indicator */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-stone-900 border border-stone-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.itemCount}
                  </span>
                </div>

                {/* Typography Label Underneath */}
                <div className="mt-2.5 flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-serif text-stone-950 font-normal tracking-tight group-hover:text-amber-800 transition-colors">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-[11.5px] text-stone-500 font-normal line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar (Exact Match to Screenshot) */}
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
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#1A1615]"
        >
          <LayoutGrid className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Collections</span>
        </Link>
        <Link
          to="/sinks"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
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
