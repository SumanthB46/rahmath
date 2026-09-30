import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { FaqSection } from "@/components/showcase/FaqSection";
import { useLenis } from "@/hooks/useLenis";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "Everything you need to know about whole-box tile calculations, logistics, showroom visits, and quality guarantees.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  useLenis();

  return (
    <main className="bg-[#FAF8F5] text-stone-900 min-h-screen pt-24 sm:pt-28">
      <GlassNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <FaqSection />

      <Footer />
    </main>
  );
}

export default FaqPage;
