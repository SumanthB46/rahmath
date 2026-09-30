import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useLenis } from "@/hooks/useLenis";
import { FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Specifier & Warranty — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "Terms of specifier, stone installation guidelines, and structural warranty terms for Mubarak Tiles & Ceramics.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  useLenis();

  return (
    <main className="bg-[color:var(--luxe-bone)] text-[color:var(--luxe-charcoal)] min-h-screen pt-20">
      <GlassNav />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-800">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-stone-900">
            Terms of Specifier &amp; Warranty
          </h1>
        </div>

        <p className="text-xs text-stone-500 mb-8">Last Updated: August 2026</p>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 font-normal leading-relaxed">
          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">1. Natural Stone Variations</h2>
            <p>
              Natural stone slabs (Marble, Granite, Quartzite) are unique products of nature. Veining, color shade variations, and natural fissures are inherent characteristics and not defects. Slabs should be inspected at our Chikkaballapur showroom prior to cutting.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">2. Estimates &amp; Quotation Validity</h2>
            <p>
              All itemized estimates provided via website consultations or site measurements remain valid for 30 calendar days. Slab availability is subject to physical inventory reserve at the time of deposit confirmation.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">3. Installation &amp; Subfloor Prep</h2>
            <p>
              Subfloors must be structurally sound, dry, and level within sub-millimeter tolerances before stone layment. Installations performed by certified Mubarak tilers include site alignment sign-off.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">4. 25-Year Structural Warranty</h2>
            <p>
              Our structural surface warranty covers slab adhesion, laser leveling integrity, and factory sealing when maintained according to Mubarak care instructions.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
