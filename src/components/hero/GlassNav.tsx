import { forwardRef, useEffect, useState, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowRight, ShoppingBag, User } from "lucide-react";
import { scrollToSection } from "@/hooks/useLenis";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { LoginSignupModal } from "@/components/auth/LoginSignupModal";
import { getPublicCategories } from "@/lib/api";

interface NavItem {
  label: string;
  href: string;
  isRoute?: boolean;
  hasMegaMenu?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/products", isRoute: true, hasMegaMenu: true },
  { label: "Sinks", href: "/sinks", isRoute: true },
  { label: "Catalog", href: "/catalog", isRoute: true },
  { label: "Calculator", href: "/calculator", isRoute: true },
];

export const GlassNav = forwardRef<HTMLElement>(function GlassNav(_props, ref) {
  const { openCart, totalCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ name: string; slug: string }[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load backend categories for live mega-menu taxonomy
  useEffect(() => {
    let isMounted = true;
    getPublicCategories()
      .then((res: any) => {
        if (isMounted && res?.categories && Array.isArray(res.categories)) {
          setDbCategories(
            res.categories.map((c: any) => ({ name: c.name, slug: c.slug || c.name }))
          );
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const dynamicMegaGroups = useMemo(
    () => [
      {
        title: "SHOP BY SPACE",
        items: [
          { name: "Living Room & Bedroom", href: "/products?application=Living+Room" },
          { name: "Bathroom & Kitchen", href: "/products?application=Bathroom" },
          { name: "Outdoor & Commercial", href: "/products?application=Outdoor" },
          { name: "Stairs & Elevation", href: "/products?application=Elevation" },
        ],
      },
      {
        title: "CATEGORIES & SURFACES",
        items:
          dbCategories.length > 0
            ? dbCategories.slice(0, 5).map((cat) => ({
                name: cat.name,
                href: `/products?category=${encodeURIComponent(cat.slug)}`,
              }))
            : [
                { name: "Large Format Slabs", href: "/products" },
                { name: "Vitrified Porcelain", href: "/products" },
                { name: "Natural Marble & Granite", href: "/products" },
                { name: "Ceramic Wall Tiles", href: "/products" },
              ],
      },
      {
        title: "SINKS & BASINS",
        items: [
          { name: "Monolith Vanity Sinks", href: "/sinks" },
          { name: "Custom Fabricated Basins", href: "/sinks" },
          { name: "Architectural Wall Basins", href: "/sinks" },
          { name: "Artisan Vessel Bowls", href: "/sinks" },
        ],
      },
    ],
    [dbCategories]
  );

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
    <>
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

          {/* Customer Login / Account link in primary navigation */}
          {isAuthenticated ? (
            <Link
              to="/account"
              className="text-xs xl:text-[13px] font-sans font-medium tracking-[0.14em] uppercase text-amber-300 hover:text-white transition-colors"
            >
              My Account
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="text-xs xl:text-[13px] font-sans font-medium tracking-[0.14em] uppercase text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              Customer Login
            </button>
          )}
        </nav>

        {/* Right: Cart Button + Strong CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Top Cart Button */}
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm group"
            aria-label="View Cart"
            title="View Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4 text-amber-300 group-hover:scale-105 transition-transform" />
            <span className="hidden sm:inline text-[11px] font-sans font-semibold uppercase tracking-[0.14em]">
              Cart
            </span>
            {totalCount > 0 && (
              <span className="inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] leading-none shadow-sm font-mono animate-in zoom-in-75 duration-200">
                {totalCount}
              </span>
            )}
          </button>

          {/* Customer Auth Button: Login for guests, My Account when logged in */}
          {isAuthenticated ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-amber-400/35 bg-amber-400/15 hover:bg-amber-400/25 text-amber-200 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm group"
              aria-label="My Account"
              title="View Customer Portal & Orders"
            >
              <User className="h-4 w-4 text-amber-300 group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em]">
                {user?.name ? user.name.split(" ")[0] : "Account"}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm group"
              aria-label="Customer Login"
              title="Customer Login with Mobile"
            >
              <User className="h-4 w-4 text-amber-300 group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em]">
                Login
              </span>
            </button>
          )}

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

      {/* Short & Simple Products Dropdown */}
      {megaMenuOpen && (
        <div
          onMouseEnter={handleMouseEnterProducts}
          onMouseLeave={handleMouseLeaveProducts}
          className="absolute top-full left-1/2 -translate-x-1/2 w-[min(92vw,620px)] mt-1.5 bg-[#141414]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.65)] p-5 text-white animate-in fade-in slide-in-from-top-1 duration-150 hidden lg:block before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
        >
          {/* 3 Clean Compact Columns */}
          <div className="grid grid-cols-3 gap-6">
            {dynamicMegaGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <span className="text-[10px] font-mono tracking-[0.16em] text-[#D5AA32] uppercase font-semibold block border-b border-white/[0.08] pb-1.5">
                  {group.title}
                </span>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href as any}
                      onClick={() => setMegaMenuOpen(false)}
                      className="block text-xs font-sans text-stone-200 hover:text-[#D5AA32] hover:translate-x-0.5 transition-all py-1"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Simple Clean Bottom Bar */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <Link
              to="/products"
              onClick={() => {
                setMegaMenuOpen(false);
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                if (window.__lenis) {
                  window.__lenis.scrollTo(0, { immediate: true });
                }
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-[#D5AA32] hover:text-amber-200 transition-colors group/all"
            >
              <span>View All Products</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1" />
            </Link>

            <Link
              to="/sinks"
              onClick={() => setMegaMenuOpen(false)}
              className="text-[11px] font-sans text-stone-400 hover:text-white transition-colors"
            >
              Sinks &amp; Basins Collection →
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-stone-950/98 backdrop-blur-3xl border-b border-white/15 p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[calc(100dvh-var(--nav-height,80px))] overflow-y-auto overscroll-contain">
          <div className="flex flex-col space-y-4">
            {/* Customer Login / My Account at top of mobile nav */}
            {isAuthenticated ? (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-amber-300 hover:text-white py-1.5 flex items-center justify-between border-b border-white/10 pb-3"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-400" />
                  <span>My Account</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  VERIFIED
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1.5 flex items-center justify-between text-left w-full cursor-pointer border-b border-white/10 pb-3"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-300" />
                  <span>Customer Login</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  OTP
                </span>
              </button>
            )}

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1"
            >
              Products Catalog
            </Link>
            <Link
              to="/sinks"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans font-medium uppercase tracking-[0.14em] text-white hover:text-amber-300 py-1 flex items-center justify-between"
            >
              <span>Sinks &amp; Basins</span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                NEW
              </span>
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


            <div className="pt-4 border-t border-white/10 space-y-2.5">
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider text-amber-200 border border-amber-400/30 bg-amber-400/10"
                >
                  <User className="h-4 w-4 text-amber-400" />
                  <span>My Account ({user?.name || user?.mobile || "Profile"})</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider text-white border border-white/20 bg-white/10 active:scale-95 cursor-pointer"
                >
                  <User className="h-4 w-4 text-amber-300" />
                  <span>Login with Mobile</span>
                </button>
              )}

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
    {/* Unified Mobile Phone + OTP Modal */}
    <LoginSignupModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
    />
  </>
);
});

export default GlassNav;
