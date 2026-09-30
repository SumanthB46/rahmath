import { MapPin, Clock } from "lucide-react";
import showroomImg from "@/assets/showroom_experience.png";

export interface ShowroomSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    address?: string;
    hours?: string;
    phone?: string;
    image?: string;
    cta_text?: string;
    cta_link?: string;
  };
}

export function ShowroomSection({ content }: ShowroomSectionProps) {
  const title = content?.title || "Visit Our Flagship Showroom";
  const badge = content?.badge || "Immersive Experience";
  const subtitle =
    content?.subtitle ||
    "Step into full-scale living spaces, inspect raw natural stone slabs under true architectural lighting, and collaborate with our material specialists.";
  const address = content?.address || "Chikkaballapur, Bengaluru, Karnataka, India";
  const hours = content?.hours || "Mon – Sat: 09:00 – 20:00";
  const image = content?.image || showroomImg;
  const ctaText = content?.cta_text || "Get Directions";
  const ctaLink = content?.cta_link || "https://maps.google.com/?q=Chikkaballapur,Karnataka,India";

  return (
    <section id="showroom" className="py-5 sm:py-7 px-4 sm:px-6 bg-[color:var(--luxe-bone)] text-stone-900 relative z-10 overflow-hidden border-t border-stone-200">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-950/15 bg-amber-900/5 mb-4">
              <MapPin className="h-3.5 w-3.5 text-amber-800" />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-amber-900">
                {badge}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-stone-900">
              {title}
            </h2>
            <p className="mt-3 text-stone-600 text-xs sm:text-base font-normal leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-6 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-amber-500/50 transition-colors gsap-batch-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-stone-900">
                    Mubarak Tiles &amp; Ceramics
                  </h3>
                  <span className="text-[9.5px] uppercase font-semibold text-amber-800 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    Bookable
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" /> {address}
                </p>
                <p className="text-xs text-stone-600 mt-1 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" /> {hours}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Compact Flagship Showroom Card */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-300/80 shadow-xl group bg-stone-900 h-[240px] sm:h-[280px] gsap-batch-card">
              <img
                src={image}
                alt={title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = showroomImg;
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              />

              {/* Showroom Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-stone-950/80 px-3.5 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold tracking-widest text-amber-200 uppercase">
                  Flagship Experience Center
                </span>
              </div>
            </div>

            {/* Action Button Below the Card */}
            <div className="pt-1">
              <a
                href={ctaLink}
                target={ctaLink.startsWith("http") ? "_blank" : undefined}
                rel={ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--gradient-gold)] text-stone-950 font-bold text-xs tracking-wider uppercase hover:opacity-95 transition-opacity shadow-md w-full sm:w-auto cursor-pointer"
              >
                {ctaText} <MapPin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShowroomSection;
