import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export interface CustomCmsSectionProps {
  id?: string | number;
  sectionKey?: string;
  name?: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  image?: string | null;
  videoUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaLink?: string | null;
}

export function CustomCmsSection({
  title,
  subtitle,
  badge,
  image,
  videoUrl,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}: CustomCmsSectionProps) {
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-8 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Column */}
          <div className="lg:col-span-6 space-y-4">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5">
                <Sparkles className="h-3 w-3 text-amber-800" />
                <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-amber-900 font-mono">
                  {badge}
                </span>
              </div>
            )}

            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight leading-tight">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-stone-600 text-xs sm:text-base font-normal leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}

            {/* CTAs */}
            {(ctaText || secondaryCtaText) && (
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {ctaText && ctaLink && (
                  <Link
                    to={ctaLink as any}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}

                {secondaryCtaText && secondaryCtaLink && (
                  <Link
                    to={secondaryCtaLink as any}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 bg-white/80 hover:bg-white text-stone-800 text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>{secondaryCtaText}</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Media Column */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-stone-300/80 bg-stone-200 shadow-xl aspect-4/3 sm:aspect-16/10">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : image ? (
                <img
                  src={image}
                  alt={title || "Surface"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center p-8 text-center text-stone-500 font-serif">
                  Mubarak Architectural Studio
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomCmsSection;
