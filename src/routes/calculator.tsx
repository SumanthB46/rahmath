import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { TileGraniteCalculator } from "@/components/calculator/TileGraniteCalculator";
import { useLenis } from "@/hooks/useLenis";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Tile & Granite Calculator — Mubarak Tiles & Ceramics" },
      {
        name: "description",
        content:
          "Calculate square footage, box/slab quantities, and budget estimates for luxury tiles, marble, granite, quartz and sintered stone.",
      },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  useLenis();

  return (
    <main className="bg-[color:var(--luxe-bone)] text-[color:var(--luxe-charcoal)] min-h-screen pt-20">
      <GlassNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Showcase
        </Link>

        <TileGraniteCalculator />
      </div>
      <Footer />
    </main>
  );
}
