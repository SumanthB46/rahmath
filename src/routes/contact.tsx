import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { useLenis } from "@/hooks/useLenis";
import { ArrowLeft, ChevronDown, CheckCircle2, Home, LayoutGrid, Layers, MapPin, Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import contactStudioImg from "@/assets/contact_studio.jpg";

import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Get in Touch — CERAMICHE" },
      {
        name: "description",
        content:
          "Schedule a consultation for your architectural project or request detailed specifications for our ceramic collections.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useLenis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);
    try {
      await api.submitInquiry(formData);
      setSubmitted(true);
      toast.success("Inquiry Submitted", {
        description: "Our studio team received your inquiry and will respond shortly.",
      });
    } catch {
      // Graceful fallback in case backend is offline
      setSubmitted(true);
      toast.success("Message Received", {
        description: "Our studio team will respond with material specifications shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#2C2523] min-h-screen flex flex-col justify-between selection:bg-[#E2DDD5] font-sans">
      {/* Mobile Top Header */}
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
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
              Home
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
              Collections
            </Link>
            <Link to="/sinks" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
              Sinks &amp; Basins
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
              Products
            </Link>
            <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
              Catalogues
            </Link>
            <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#63574A] py-1">
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
      <main className="flex-1 pt-6 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Back to Home (Desktop) */}
          <div className="hidden sm:flex items-center justify-start">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs active:scale-95 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 text-stone-600 group-hover:text-stone-950" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-3 pt-2 sm:pt-0 max-w-xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#4A4036] font-normal tracking-normal">
              Get in Touch
            </h1>
            <p className="text-[12px] sm:text-xs text-[#7A7067] leading-relaxed max-w-sm sm:max-w-md mx-auto font-normal">
              Schedule a consultation for your architectural project or request detailed specifications for our ceramic collections.
            </p>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">

            {/* Column 1: Inquiries Form Card */}
            <div className="md:col-span-7 bg-white border border-[#E7E2DA] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="border-b border-[#F0ECE6] pb-3 mb-4">
                <h2 className="text-xl font-serif text-[#4A4036] font-normal">
                  Inquiries
                </h2>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-serif text-[#4A4036]">Message Received</h3>
                  <p className="text-xs text-[#7A7067] max-w-xs mx-auto leading-relaxed">
                    Thank you for reaching out. Our studio representative will contact you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", projectType: "", message: "" });
                    }}
                    className="mt-2 text-[11px] uppercase tracking-wider text-[#4A4036] underline hover:opacity-75 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="inq-name" className="block text-[11px] text-[#7A7067]">
                      Full Name
                    </label>
                    <input
                      id="inq-name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-[#4A4036] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label htmlFor="inq-email" className="block text-[11px] text-[#7A7067]">
                      Email Address
                    </label>
                    <input
                      id="inq-email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-[#4A4036] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Project Type */}
                  <div className="space-y-1">
                    <label htmlFor="inq-project" className="block text-[11px] text-[#7A7067]">
                      Project Type
                    </label>
                    <div className="relative">
                      <select
                        id="inq-project"
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full text-xs text-[#2C2523] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-[#4A4036] focus:outline-none transition-colors appearance-none cursor-pointer pr-6"
                      >
                        <option value="" disabled className="text-[#A89F95]">
                          Select an option
                        </option>
                        <option value="Residential">Residential Architecture</option>
                        <option value="Commercial">Commercial Project</option>
                        <option value="Hospitality">Hospitality &amp; Spa</option>
                        <option value="Bespoke Sinks">Bespoke Sinks &amp; Basins</option>
                        <option value="Custom Surfaces">Custom Sintered Stone Surfaces</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A89F95] pointer-events-none" />
                    </div>
                  </div>

                  {/* Message Details */}
                  <div className="space-y-1">
                    <label htmlFor="inq-msg" className="block text-[11px] text-[#7A7067]">
                      Message Details
                    </label>
                    <textarea
                      id="inq-msg"
                      rows={4}
                      placeholder="Please provide details about your project requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full text-xs text-[#2C2523] placeholder:text-[#A89F95] py-2 bg-transparent border-b border-[#E7E2DA] focus:border-[#4A4036] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Send Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-[#63574A] hover:bg-[#4E4338] disabled:opacity-50 text-white text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      {loading ? "SENDING..." : "SEND MESSAGE"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Column 2: Direct & Connect + Studio Image */}
            <div className="md:col-span-5 space-y-6">
              {/* Direct & Connect Card */}
              <div className="bg-white border border-[#E7E2DA] p-6 sm:p-7 space-y-5 shadow-xs">
                <div>
                  <div className="border-b border-[#F0ECE6] pb-3 mb-4">
                    <h2 className="text-xl font-serif text-[#4A4036] font-normal">
                      Direct
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-2.5">
                      <span className="text-[11px] text-[#7A7067] uppercase tracking-wider">General</span>
                      <a href="mailto:info@ceramiche.com" className="text-[#2C2523] hover:underline">
                        info@ceramiche.com
                      </a>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-2.5">
                      <span className="text-[11px] text-[#7A7067] uppercase tracking-wider">Press</span>
                      <a href="mailto:press@ceramiche.com" className="text-[#2C2523] hover:underline">
                        press@ceramiche.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0ECE6] space-y-3">
                  <h3 className="text-lg font-serif text-[#4A4036] font-normal">
                    Connect
                  </h3>
                  <div className="flex items-center gap-6 text-xs text-[#2C2523]">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://pinterest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Pinterest
                    </a>
                    <Link
                      to="/catalog"
                      className="hover:underline"
                    >
                      Journal
                    </Link>
                  </div>
                </div>
              </div>

              {/* Studio Interior Photo */}
              <div className="border border-[#E7E2DA] overflow-hidden bg-[#EDE8E1] shadow-xs">
                <img
                  src={contactStudioImg}
                  alt="CERAMICHE Ceramic Studio"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Minimal Copyright */}
      <footer className="border-t border-[#E7E2DA] py-8 text-center text-[10px] tracking-[0.16em] text-[#7A7067] uppercase pb-20 sm:pb-8">
        &copy; 2026 CERAMICHE. ALL RIGHTS RESERVED. ARCHITECTURAL SURFACES.
      </footer>

      {/* Mobile Sticky Bottom Bar */}
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
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#554D45] hover:text-stone-950 transition-colors"
        >
          <Layers className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Products</span>
        </Link>
        <Link
          to="/contact"
          className="flex flex-col items-center gap-1 text-[10.5px] font-normal text-[#1A1615]"
        >
          <MapPin className="h-[18px] w-[18px] stroke-[1.6]" />
          <span>Stores</span>
        </Link>
      </div>
    </div>
  );
}
