import { useState } from "react";
import { ArrowUp, Instagram, Facebook, Youtube, MessageSquare, Mail, Send, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Subscribed to Architectural Index", {
      description: "We have sent the 2026 Brand Lookbook & Catalog to your inbox.",
    });
  };

  return (
    <footer className="bg-[#EBE5DC] text-stone-700 py-6 sm:py-8 px-4 sm:px-8 border-t border-stone-300/80 relative z-10">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* Top Newsletter & Catalog Capture Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 border border-stone-300/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left max-w-lg">
            <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block">
              ARCHITECTURAL DIRECTORY &amp; DISPATCH
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Download the 2026 Architectural Catalog
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Get comprehensive technical specs, box coverage charts, and special wholesale slab pricing directly to your email.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Catalog sent to {email}!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center w-full sm:w-80 border border-stone-300 rounded-full bg-white p-1.5 focus-within:border-amber-800 transition-all shadow-xs">
                <input
                  type="email"
                  required
                  placeholder="Enter architect / client email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Get Catalog</span>
                  <Send className="h-3 w-3 text-amber-300" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-stone-300/80">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <BrandLogo size={28} />
              <span className="text-lg font-serif font-bold tracking-wider text-stone-900 uppercase">
                Mubarak Tiles &amp; Ceramics
              </span>
            </div>
            <p className="text-xs text-stone-600 font-normal leading-relaxed">
              Curating high-end porcelain slabs, bespoke tile basins, and imported natural marble for luxury residences and commercial developments across India.
            </p>
            <p className="text-xs text-stone-500 font-medium pt-1">
              📍 Showroom: Chikkaballapur, Bengaluru, Karnataka
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-5 flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-6 text-xs font-semibold uppercase tracking-wider text-stone-700 self-center">
            <Link to="/products" className="hover:text-amber-800 transition-colors">
              Products Catalog
            </Link>
            <Link to="/collections" className="hover:text-amber-800 transition-colors">
              Collections
            </Link>
            <Link to="/sinks" className="hover:text-amber-800 transition-colors">
              Sinks &amp; Basins
            </Link>
            <Link to="/catalog" className="hover:text-amber-800 transition-colors">
              PDF Brochures
            </Link>
            <Link to="/calculator" className="hover:text-amber-800 transition-colors">
              Tile Calculator
            </Link>
            <Link to="/faq" className="hover:text-amber-800 transition-colors">
              FAQ
            </Link>
            <Link to="/track" className="hover:text-amber-800 transition-colors">
              Track Order
            </Link>
            <Link to="/contact" className="hover:text-amber-800 transition-colors">
              Contact Studio
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500 font-mono">
              Connect With Us
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs hover:scale-110 active:scale-95 transition-all"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#1877F2] text-white shadow-xs hover:scale-110 active:scale-95 transition-all"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#FF0000] text-white shadow-xs hover:scale-110 active:scale-95 transition-all"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919845012345"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#25D366] text-white shadow-xs hover:scale-110 active:scale-95 transition-all"
                title="WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-stone-600 gap-4">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} Mubarak Tiles &amp; Ceramics. All rights reserved.</span>
            <span className="text-stone-400 font-mono text-[11px]">GSTIN: 29AAACM1234F1Z5</span>
          </div>

          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 hover:border-stone-400 bg-white/80 text-stone-700 hover:text-stone-950 transition-colors shadow-xs cursor-pointer text-xs font-semibold"
          >
            Back to Top <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
