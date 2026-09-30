import { Star, CheckCircle2, Quote, Sparkles } from "lucide-react";

const REVIEWS = [
  {
    name: "Ar. Rajesh Varma",
    role: "Principal Architect, Studio Varma",
    location: "Indiranagar, Bengaluru",
    rating: 5,
    title: "Unmatched slab precision & zero curvature",
    comment:
      "We sourced over 8,000 sq.ft of 120x240 UniTerra slabs for a luxury villa in Sarjapur. Zero surface waviness, perfect rectified edges, and seamless bookmatching. Mubarak's team coordinated the crane unloading without a scratch.",
    project: "Project: Villa Nirvana (8,400 sq.ft)",
  },
  {
    name: "Pooja Hegde & Anand Rao",
    role: "Homeowners",
    location: "Sadashivanagar, Bengaluru",
    rating: 5,
    title: "Best tile selection experience in Karnataka",
    comment:
      "Visiting their Chikkaballapur showroom made all the difference. Walking across full-scale tile mockups under natural light helped us pick the perfect satin matte flooring. The whole-box area calculator was spot on with zero wastage.",
    project: "Project: 4BHK Penthouse",
  },
  {
    name: "Karan Singhal",
    role: "Managing Director, Apex Buildcon",
    location: "Hebbal, Bengaluru",
    rating: 5,
    title: "Flawless logistics & GST compliance",
    comment:
      "Ordering high-volume commercial vitrified tiles online with instant GST tax credit and separate Porter logistics was completely frictionless. Delivered directly to our site ahead of schedule.",
    project: "Project: Horizon Business Park (25,000 sq.ft)",
  },
];

export interface TestimonialsProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    rating?: string;
  };
}

export function TestimonialsSection({ content }: TestimonialsProps) {
  const title = content?.title || "Client & Architect Reviews";
  const badge = content?.badge || "Verified Social Proof";
  const subtitle =
    content?.subtitle ||
    "Read how leading architects, interior designers, and homeowners experience our architectural surfaces.";
  const rating = content?.rating || "4.9";

  return (
    <section className="py-5 sm:py-7 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-2">
              <Sparkles className="h-3 w-3 text-amber-800" />
              <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-amber-900 font-mono">
                {badge}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight">
              {title}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal mt-1.5 max-w-lg leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Rating Summary Badge */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3 shrink-0">
            <div className="text-2xl font-bold font-serif text-amber-900">{rating}</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[10.5px] text-stone-500 block font-medium">
                420+ Architectural Reviews
              </span>
            </div>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                {/* Stars & Quote */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-stone-300" />
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900 leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {rev.comment}
                </p>
              </div>

              {/* Author & Project info */}
              <div className="pt-4 border-t border-stone-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">{rev.role} · {rev.location}</p>
                <p className="text-[10.5px] font-mono text-amber-900/80 font-medium pt-0.5">{rev.project}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TestimonialsSection;
