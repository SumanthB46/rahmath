import { ShieldCheck, Award, Truck, Building2 } from "lucide-react";

export interface TrustBadgesSectionProps {
  content?: {
    badge?: string;
    pillars?: Array<{
      title: string;
      subtitle: string;
      description?: string;
      desc?: string;
    }>;
  };
}

const DEFAULT_METRICS = [
  {
    icon: Award,
    title: "25+ Years Legacy",
    subtitle: "Established in 2001",
    desc: "Supplying luxury residences, villas & commercial landmarks.",
  },
  {
    icon: ShieldCheck,
    title: "100% Certified Grade",
    subtitle: "Zero Warp & Imperfection",
    desc: "Strict quality-tested European & Indian porcelain slabs.",
  },
  {
    icon: Building2,
    title: "10M+ Sq.Ft Delivered",
    subtitle: "All India Network",
    desc: "Trusted by top architects & luxury interior designers.",
  },
  {
    icon: Truck,
    title: "Insured Consignments",
    subtitle: "Porter & VRL Cargo",
    desc: "Zero-breakage transit guarantee with separate logistics.",
  },
];

const ICON_MAP = [Award, ShieldCheck, Building2, Truck];

export function TrustBadgesSection({ content }: TrustBadgesSectionProps) {
  const pillars = content?.pillars && Array.isArray(content.pillars) && content.pillars.length > 0
    ? content.pillars.map((p, idx) => ({
        icon: ICON_MAP[idx % ICON_MAP.length] || Award,
        title: p.title,
        subtitle: p.subtitle,
        desc: p.description || p.desc || "",
      }))
    : DEFAULT_METRICS;

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* 4-Column Fast-Scan Trust Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-400/60 transition-all duration-300 space-y-2.5"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center">
                  <IconComp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-mono font-semibold text-amber-800 tracking-wide mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustBadgesSection;
