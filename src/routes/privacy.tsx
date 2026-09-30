import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useLenis } from "@/hooks/useLenis";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "Privacy Policy and data protection guidelines for Mubarak Tiles & Ceramics showcase and material consultation services.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-stone-900">
            Privacy Policy
          </h1>
        </div>

        <p className="text-xs text-stone-500 mb-8">Last Updated: August 2026</p>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 font-normal leading-relaxed">
          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">1. Information We Collect</h2>
            <p>
              When you submit an estimate or consultation request on Mubarak Tiles & Ceramics, we collect your name, phone number, email address, project category, and estimated coverage area to provide tailored material quotes and site visits.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">2. How We Use Your Information</h2>
            <p>
              Your contact details are strictly used to respond to your project inquiries, deliver itemized price estimates, coordinate showroom appointments in Chikkaballapur/Bengaluru, and provide site measurement services. We do not sell or rent your personal data to third parties.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">3. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption and security protocols to safeguard your inquiries and blueprints. Access is limited strictly to authorized Mubarak material specialists.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900">4. Contact Us</h2>
            <p>
              If you have questions regarding this Privacy Policy, contact us directly at <span className="font-semibold text-stone-900">projects@mubaraktiles.com</span> or call <span className="font-semibold text-stone-900">+91 98450 12345</span>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
