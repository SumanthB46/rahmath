import { Compass, Ruler, Wrench, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import showroomImg from "@/assets/showroom_experience.png";
import measurementImg from "@/assets/solutions/flooring.png";
import installationImg from "@/assets/stacked_grey_slabs.png";
import handoverImg from "@/assets/contact_studio.jpg";

const PROCESS_STEPS = [
  {
    step: "01",
    tag: "CURATED SELECTION",
    title: "Showroom Visit & Tile Pick",
    desc: "Walk across full-scale slab mockups under true daylight. Our material specialists explain which finish (satin matte, honed, high gloss) fits each space and why.",
    icon: Compass,
    image: showroomImg,
    imageAlt: "Showroom Tile Selection",
    highlights: ["Tactile texture feeling", "Natural lighting preview", "Zero-wastage calculator"],
  },
  {
    step: "02",
    tag: "TECHNICAL AUDIT",
    title: "On-Site Laser Measurement",
    desc: "Our technical team visits your site to laser-measure room dimensions, inspect subfloor leveling, assess moisture, and calculate exact whole-box requirements.",
    icon: Ruler,
    image: measurementImg,
    imageAlt: "Laser Site Measurement",
    highlights: ["Subfloor level inspection", "Joint line layout plan", "Exact whole-box estimate"],
  },
  {
    step: "03",
    tag: "EXPERT SUPERVISION",
    title: "Installation Guidance",
    desc: "Grand format slabs require specialized suction tools and polymer adhesives. We provide precise laying protocols and supervise contractors during slab laying.",
    icon: Wrench,
    image: installationImg,
    imageAlt: "Tile Slab Installation",
    highlights: ["Polymer adhesive specs", "2mm leveling spacers", "On-site laying supervision"],
  },
  {
    step: "04",
    tag: "QUALITY SIGN-OFF",
    title: "Final Inspection & Handover",
    desc: "We perform a thorough hollow-sound test, verify epoxy grouting lines, clean the completed surfaces, and issue official manufacturer warranty documentation.",
    icon: CheckCircle2,
    image: handoverImg,
    imageAlt: "Quality Handover & Inspection",
    highlights: ["Hollow-sound acoustic test", "Epoxy grouting check", "Manufacturer warranty issue"],
  },
];

export interface ProcessSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    cta_text?: string;
    cta_link?: string;
  };
}

export function ProcessSection({ content }: ProcessSectionProps) {
  const title = content?.title || "From Selection to Handover";
  const badge = content?.badge || "ARCHITECTURAL ADVISORY & INSTALLATION";
  const subtitle =
    content?.subtitle ||
    "Our full-cycle architectural guidance ensures perfect tile selection, flawless transit, and master-grade installation.";
  const ctaText = content?.cta_text || "Book Free Consultation & Site Visit";
  const ctaLink = content?.cta_link || "#contact";

  return (
    <section id="process" className="py-8 sm:py-12 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-b border-stone-200/90 relative z-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5">
              <Sparkles className="h-3 w-3 text-amber-800" />
              <span className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-amber-900 font-mono">
                {badge}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight leading-tight">
              Our 4-Step Process: <span className="italic font-light text-amber-900">{title}</span>
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 4-Step Visual Timeline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((item, idx) => {
            const IconC = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Image Thumbnail Header */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Step Badge Over Image */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-xl bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/20 font-mono font-bold text-xs flex items-center justify-center shadow-md">
                      {item.step}
                    </span>
                    <span className="text-[9.5px] font-mono font-bold tracking-wider uppercase text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {item.tag}
                    </span>
                  </div>

                  {/* Icon floating badge */}
                  <div className="absolute bottom-3 right-3 h-8 w-8 rounded-xl bg-white/90 backdrop-blur-md text-amber-900 flex items-center justify-center shadow-md">
                    <IconC className="h-4 w-4" />
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Highlights Bullet Tags */}
                  <div className="pt-3 border-t border-stone-100 space-y-1.5">
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-[11px] text-stone-700 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ProcessSection;
