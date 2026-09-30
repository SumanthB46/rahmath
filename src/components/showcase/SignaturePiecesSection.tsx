import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import sinkImg from "@/assets/exclusive_sinks.png";
import sinkDrainImg from "@/assets/Remove_taps_and_sink_drain_202607261544.jpeg";
import countertopsImg from "@/assets/solutions/countertops.png";
import showroomImg from "@/assets/showroom_experience.png";

interface SignaturePiece {
  id: string;
  name: string;
  material: string;
  tagline: string;
  image: string;
}

const SIGNATURE_PIECES: SignaturePiece[] = [
  {
    id: "monolith-basin",
    name: "Monolith Basin",
    material: "PORCELAIN",
    tagline: "Seamless large-format construction.",
    image: sinkDrainImg,
  },
  {
    id: "linear-trough-basin",
    name: "Linear Trough Basin",
    material: "MATTE CERAMIC",
    tagline: "Architectural precision with minimalist grout lines.",
    image: sinkImg,
  },
  {
    id: "artisan-vessel-bowl",
    name: "Artisan Vessel Bowl",
    material: "GLAZED CERAMIC",
    tagline: "High-fired clay with a tactile, earth-toned glaze.",
    image: countertopsImg,
  },
  {
    id: "statuario-sculpted-basin",
    name: "Statuario Carved Basin",
    material: "SOLID MARBLE",
    tagline: "Single-block Italian marble with nano-sealed polish.",
    image: showroomImg,
  },
];

export interface SignaturePiecesProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    cta_text?: string;
    cta_link?: string;
  };
}

export function SignaturePiecesSection({ content }: SignaturePiecesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const title = content?.title || "Curated Masterpieces";
  const badge = content?.badge || "FLAGSHIP CREATIONS";
  const subtitle =
    content?.subtitle ||
    "Handcrafted monolithic basins, carved single-block marble, and precision-engineered ceramic troughs.";
  const ctaText = content?.cta_text || "Explore Sinks & Basins";
  const ctaLink = content?.cta_link || "/sinks";

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="signature" className="py-8 sm:py-12 px-4 sm:px-8 bg-[#FAF7F2] text-stone-900 relative z-10 border-t border-stone-200/90 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-2.5">
              <Sparkles className="h-3 w-3 text-amber-800" />
              <span className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-amber-900 font-mono">
                {badge}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight leading-tight">
              Signature Pieces: <span className="italic font-light text-amber-900">{title}</span>
            </h2>
            <p className="mt-2 text-stone-600 text-xs sm:text-sm font-normal max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={ctaLink as any}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Slider Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous Signature Piece"
                className="h-8 w-8 rounded-full border border-stone-300 bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next Signature Piece"
                className="h-8 w-8 rounded-full border border-stone-300 bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Slider of Cards matching the user's reference */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {SIGNATURE_PIECES.map((piece) => (
            <Link
              key={piece.id}
              to="/sinks"
              className="group shrink-0 w-[260px] sm:w-[300px] snap-start bg-white border border-stone-200/90 hover:border-amber-400/80 rounded-none sm:rounded-sm overflow-hidden p-3.5 sm:p-4 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 mb-3 border border-stone-200/70">
                  <img
                    src={piece.image}
                    alt={piece.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Typography & Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-serif text-stone-950 font-normal tracking-tight group-hover:text-amber-800 transition-colors">
                      {piece.name}
                    </h3>
                    <span className="text-[9.5px] font-bold tracking-[0.14em] uppercase text-stone-500 font-mono">
                      {piece.material}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-normal leading-relaxed line-clamp-2">
                    {piece.tagline}
                  </p>
                </div>
              </div>

              {/* View Link */}
              <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-stone-700 group-hover:text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
