import { forwardRef, useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowRight, BookOpen } from "lucide-react";
import { scrollToSection } from "@/hooks/useLenis";

// Featured slab photography for editorial mega menu
import slabThumb from "@/assets/marble-slabs-corner-v2.png";

interface NavItem {
  label: string;
  href: string;
  isRoute?: boolean;
  hasMegaMenu?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/products", isRoute: true, hasMegaMenu: true },
  { label: "Collections", href: "/collections", isRoute: true },
  { label: "Catalog", href: "/catalog", isRoute: true },
  { label: "Calculator", href: "/calculator", isRoute: true },
  { label: "Projects", href: "#showroom", isRoute: false },
  { label: "About", href: "#contact", isRoute: false },
];

// Clean typographic category hierarchy for luxury architectural material library
const MEGA_GROUPS = [
  {
    title: "TILES",
    items: [
      { name: "Floor Tiles", sub: "Living & High-Traffic", href: "/products?application=Living+Room" },
      { name: "Wall Tiles", sub: "Curated Wall Cladding", href: "/products?category=wall-tiles" },
      { name: "Porcelain Tiles", sub: "Vitrified European Grade", href: "/products?category=porcelain" },
    ],
  },
  {
    title: "SURFACES",
    items: [
      { name: "Large Format", sub: "120 × 240 / 120 × 280 cm", href: "/products?collection=UniTerra" },
      { name: "Grand Slabs", sub: "Continuous Sintered Veins", href: "/products?category=slabs" },
      { name: "Marble & Granite", sub: "Imported Natural Blocks", href: "/products?category=natural-stone" },
    ],
  },
  {
    title: "SANITARYWARE",
    items: [
      { name: "Bespoke Basins", sub: "Monolithic Integrated", href: "/sinks" },
      { name: "Ceramic Troughs", sub: "Precision Engineered", href: "/sinks" },
      { name: "Stone Vanities", sub: "Single-Block Italian Cut", href: "/sinks" },
    ],
  },
];

export const GlassNav = forwardRef<HTMLElement>(function GlassNav(_props, ref) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnterProducts = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveProducts = () => {
    timeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 220);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = `/${href}`;
      } else {
        e.preventDefault();
        scrollToSection(href);
      }
    }
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  return (
    <header
      ref={ref}
      onMouseLeave={handleMouseLeaveProducts}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-stone-950/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3.5 sm:py-4"
          : "bg-black/25 backdrop-blur-md border-b border-white/10 py-4 sm:py-5"
      }`}
      style={{ height: "var(--nav-height, 80px)" }}
    >
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between">
        {/* Left: Compact, Architectural White Logo */}
        <Link
          to="/"
          className="group flex flex-col items-start leading-none shrink-0 text-left transition-opacity hover:opacity-90"
        >
          <span className="text-[15px] sm:text-[17px] font-serif font-bold tracking-[0.22em] text-white uppercase group-hover:text-amber-200 transition-colors">
            MUBARAK
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-sans font-medium tracking-[0.3em] text-stone-300 uppercase mt-1">
            TILES &amp; GRANITE
          </span>
        </Link>

        {/* Center: Curated Navigation Links with Generous Spacing */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {NAV_ITEMS.map((item) => {
            if (item.hasMegaMenu) {
              return (
                <div
                  key={item.label}
                  className="relative py-2"
                  onMouseEnter={handleMouseEnterProducts}
                >
                  <Link
                    to={item.href as any}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`inline-flex items-center gap-1.5 text-xs xl:text-[13px] font-sans font-medium tracking-[0.14em] uppercase transition-colors ${
                      megaMenuOpen ? "text-amber-300" : "text-white/85 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 ${
                        megaMenuOpen ? "rotate-180 text-amber-300" : "opacity-60"
                      }`}
                    />
                  </Link>
                </div>
              );
            }

            if (item.isRoute) {
              return (
                <Link
                  key={item.label}
                  to={item.href as any}
                  className="text-xs xl:text-[13px] font-sans font-medium tracking-[0.14em] uppercase text-white/85 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-xs xl:text-[13px] font-sans font-medium tracking-[0.14em] uppercase text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Single Strong CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="hidden xs:inline-flex items-center justify-center rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-[10.5px] sm:text-xs font-sans font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-stone-950 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer shrink-0"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "0 4px 18px -4px rgba(201,162,76,0.55)",
            }}
          >
            Enquire Now
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition-all shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Editorial Luxury Material Mega-Menu (Compact Architectural Scale) */}
      {megaMenuOpen && (
        <div
          onMouseEnter={handleMouseEnterProducts}
          onMouseLeave={handleMouseLeaveProducts}
          className="absolute top-full left-1/2 -translate-x-1/2 w-[min(92vw,920px)] mt-1 bg-[#151515]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] p-4 sm:p-5 text-white animate-in fade-in slide-in-from-top-1 duration-200 hidden lg:block overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
        >
          {/* Top Editorial Eyebrow Header */}
          <div className="grid grid-cols-12 gap-6 items-baseline pb-2.5 border-b border-white/[0.08]">
            <div className="col-span-8 flex items-baseline gap-2.5">
              <span className="text-[10px] font-mono tracking-[0.22em] text-[#D5AA32] uppercase font-semibold">
                PRODUCTS
              </span>
              <span className="text-[11px] font-sans text-[#8E8A83] tracking-wide font-normal">
                Explore our material library
              </span>
            </div>
            <div className="col-span-4 pl-5 border-l border-white/[0.08]">
              <span className="text-[10px] font-mono tracking-[0.22em] text-[#D5AA32] uppercase font-semibold">
                ARCHITECTURAL CATALOG
              </span>
            </div>
          </div>

          {/* Main Content: Categories (8 cols) + Architectural Catalog (4 cols) */}
          <div className="grid grid-cols-12 gap-6 items-stretch pt-3 pb-2.5">
            {/* Columns 1, 2, 3: Typographic Category Columns */}
            <div className="col-span-8 grid grid-cols-3 gap-5">
              {MEGA_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <span className="text-[9.5px] font-mono tracking-[0.22em] text-[#D5AA32] uppercase font-semibold block">
                    {group.title}
                  </span>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href as any}
                        onClick={() => setMegaMenuOpen(false)}
                        className="group/item block text-left transition-colors py-0.5"
                      >
                        <span className="text-[12.5px] font-serif font-normal text-[#E9E5DC] group-hover/item:text-[#D5AA32] transition-colors tracking-wide block leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[9.5px] font-sans text-[#8E8A83] group-hover/item:text-stone-300 transition-colors tracking-wider block mt-0.5">
                          {item.sub}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Column 4: Architectural Catalog Editorial Comp */}
            <div className="col-span-4 border-l border-white/[0.08] pl-5 flex flex-col justify-between">
              <Link
                to="/catalog"
                onClick={() => setMegaMenuOpen(false)}
                className="group/feat flex flex-col justify-between h-full text-left cursor-pointer"
              >
                {/* Clean Editorial Catalog Cover (~92px height) */}
                <div className="relative h-[92px] w-full overflow-hidden rounded-lg border border-white/10 bg-stone-900">
                  <img
                    src={slabThumb}
                    alt="2026 Architectural Catalog & Lookbook"
                    className="w-full h-full object-cover group-hover/feat:scale-105 transition-transform duration-700 ease-out brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2">
                    <span className="text-[8px] font-mono tracking-widest text-[#D5AA32] uppercase bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#D5AA32]/30 flex items-center gap-1 font-semibold">
                      <BookOpen className="h-2.5 w-2.5" />
                      FLIPBOOK
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 left-2">
                    <span className="text-[8.5px] font-mono tracking-widest text-[#E9E5DC] uppercase bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10">
                      2026 EDITION
                    </span>
                  </div>
                </div>

                {/* Editorial Information Block */}
                <div className="pt-2">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#D5AA32] uppercase block font-semibold">
                    MATERIAL COMPENDIUM
                  </span>
                  <h4 className="text-[13.5px] font-serif font-normal text-[#E9E5DC] group-hover/feat:text-[#D5AA32] transition-colors leading-snug mt-0.5">
                    Architectural Catalog &amp; Lookbook
                  </h4>
                  <p className="text-[10px] text-[#8E8A83] font-sans leading-relaxed mt-0.5 line-clamp-2">
                    Interactive flipbook featuring full specifications and slab collections.
                  </p>
                </div>

                {/* Text Link with Arrow */}
                <div className="pt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-sans font-medium uppercase tracking-[0.16em] text-[#D5AA32] group-hover/feat:text-amber-200 transition-colors">
                    <span>Open Flipbook Catalog</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/feat:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom Full-width Divider & Architectural Links */}
          <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <Link
              to="/products"
              onClick={() => {
                setMegaMenuOpen(false);
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                if (window.__lenis) {
                  window.__lenis.scrollTo(0, { immediate: true });
                }
              }}
              className="inline-flex items-center gap-1.5 text-[10.5px] font-sans font-medium uppercase tracking-[0.18em] text-[#E9E5DC] hover:text-[#D5AA32] transition-colors group/all"
            >
              <span>View All Products</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1 text-[#D5AA32]" />
            </Link>

            <div className="flex items-center gap-3.5 text-[9.5px] font-mono uppercase tracking-widest text-[#8E8A83]">
              <Link
                to="/reels"
                onClick={() => setMegaMenuOpen(false)}
                className="hover:text-[#E9E5DC] transition-colors"
              >
                Video Blog / Reels
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/calculator"
                onClick={() => setMegaMenuOpen(false)}
                className="hover:text-[#E9E5DC] transition-colors"
              >
                Tile Calculator
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/catalog"
                onClick={() => setMegaMenuOpen(false)}
                className="hover:text-[#E9E5DC] transition-colors"
              >
                Architectural Catalog (PDF)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-stone-950/98 backdrop-blur-3xl border-b border-white/15 p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[calc(100dvh-var(--nav-height,80px))] overflow-y-auto overscroll-contain">
          <div className="flex flex-col space-y-4">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Products Catalog
            </Link>
            <Link
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Collections
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Architectural Catalog
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Tile Calculator
            </Link>
            <Link
              to="/reels"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Showroom Reels / Video Blog
            </Link>
            <a
              href="#showroom"
              onClick={(e) => handleNavClick(e, "#showroom")}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Projects &amp; Showroom
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              About &amp; Inquiries
            </a>

            <div className="pt-4 border-t border-white/10">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="w-full inline-flex items-center justify-center rounded-full py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 shadow-md"
                style={{ background: "var(--gradient-gold)" }}
              >
                Enquire Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default GlassNav;
