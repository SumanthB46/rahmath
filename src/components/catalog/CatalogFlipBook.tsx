import { forwardRef, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, FileText, Sparkles } from "lucide-react";
import type { CatalogueItem } from "@/routes/catalog";

/* ── individual page (must be forwardRef for react-pageflip) ── */
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = "" }, ref) => (
    <div ref={ref} className={`flipbook-page ${className}`}>
      {children}
    </div>
  )
);
Page.displayName = "Page";

/* ── main component ── */
export function CatalogFlipBook({ item }: { item: CatalogueItem }) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // ponytail: total page count is static per item — no need to memoize
  const totalPages = 6;

  const onFlip = useCallback((e: any) => setCurrentPage(e.data), []);
  const prev = () => bookRef.current?.pageFlip()?.flipPrev();
  const next = () => bookRef.current?.pageFlip()?.flipNext();
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Book */}
      <div className="flipbook-container">
        <HTMLFlipBook
          ref={bookRef}
          width={320}
          height={440}
          minWidth={260}
          maxWidth={420}
          minHeight={360}
          maxHeight={560}
          size="stretch"
          showCover={true}
          usePortrait={true}
          drawShadow={true}
          maxShadowOpacity={0.4}
          flippingTime={600}
          mobileScrollSupport={true}
          showPageCorners={true}
          startPage={0}
          startZIndex={0}
          autoSize={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          disableFlipByClick={false}
          className="flipbook"
          style={{}}
          onFlip={onFlip}
        >
          {/* ── Page 1: Cover ── */}
          <Page className="page-cover">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-amber-700/30 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-amber-400 stroke-1" />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-amber-400/80 uppercase font-medium mb-2">
                  Mubarak Tiles &amp; Ceramics
                </span>
                <h2 className="text-xl font-serif font-bold text-white tracking-wide uppercase leading-tight">
                  {item.title}
                </h2>
                <p className="text-xs text-stone-400 mt-2">{item.subtitle}</p>
              </div>
            )}
            {/* overlay title on cover images */}
            {item.coverImage && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <span className="text-[9px] tracking-[0.3em] text-amber-400/90 uppercase font-medium block mb-1">
                  Mubarak Tiles
                </span>
                <h2 className="text-lg font-serif font-bold text-white uppercase">
                  {item.title}
                </h2>
                <p className="text-[11px] text-stone-300">{item.subtitle}</p>
              </div>
            )}
          </Page>

          {/* ── Page 2: Collection Overview ── */}
          <Page>
            <div className="absolute inset-0 bg-[#FAF9F5] flex flex-col p-7">
              <span className="text-[9px] tracking-[0.25em] text-amber-700 uppercase font-bold mb-4 border-b border-amber-200 pb-2">
                Collection Overview
              </span>
              <h3 className="text-base font-serif font-bold text-stone-900 uppercase tracking-wide mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-5">
                {item.subtitle}
              </p>

              <div className="space-y-3 text-xs text-stone-700 flex-1">
                {item.category && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                      Category
                    </span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                )}
                {item.format && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                      Format / Dimensions
                    </span>
                    <span className="font-medium">{item.format}</span>
                  </div>
                )}
                {item.finish && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                      Surface Finish
                    </span>
                    <span className="font-medium">{item.finish}</span>
                  </div>
                )}
              </div>

              <div className="text-[8px] text-stone-400 text-right mt-auto pt-3 border-t border-stone-200">
                2 / {totalPages}
              </div>
            </div>
          </Page>

          {/* ── Page 3: Applications ── */}
          <Page>
            <div className="absolute inset-0 bg-stone-900 flex flex-col p-7 text-white">
              <span className="text-[9px] tracking-[0.25em] text-amber-400 uppercase font-bold mb-5 border-b border-amber-800 pb-2">
                Recommended Spaces
              </span>

              {item.applications && item.applications.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 flex-1">
                  {item.applications.map((app) => (
                    <div
                      key={app}
                      className="bg-stone-800/80 rounded-xl p-3 flex items-center gap-2"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] font-medium text-stone-200">
                        {app}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  Suitable for all architectural environments.
                </p>
              )}

              <div className="text-[8px] text-stone-600 text-right mt-auto pt-3 border-t border-stone-800">
                3 / {totalPages}
              </div>
            </div>
          </Page>

          {/* ── Page 4: Technical Specs ── */}
          <Page>
            <div className="absolute inset-0 bg-[#FAF9F5] flex flex-col p-7">
              <span className="text-[9px] tracking-[0.25em] text-amber-700 uppercase font-bold mb-4 border-b border-amber-200 pb-2">
                Technical Specifications
              </span>

              <div className="space-y-4 text-xs flex-1">
                <div className="bg-white rounded-xl border border-stone-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                      Material
                    </span>
                    <span className="font-medium text-stone-800">
                      {item.category || "Premium Porcelain"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                      Dimensions
                    </span>
                    <span className="font-medium text-stone-800">
                      {item.format || "Standard"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                      Surface
                    </span>
                    <span className="font-medium text-stone-800">
                      {item.finish || "Architectural"}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50/80 rounded-xl border border-amber-200/60 p-3.5">
                  <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold block mb-1">
                    Quality Standards
                  </span>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Manufactured under ISO 13006 / EN 14411 standards.
                    Calibrated dimensions with ±0.3mm tolerance.
                  </p>
                </div>
              </div>

              <div className="text-[8px] text-stone-400 text-right mt-auto pt-3 border-t border-stone-200">
                4 / {totalPages}
              </div>
            </div>
          </Page>

          {/* ── Page 5: Contact / Studio ── */}
          <Page>
            <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-7 text-center text-white">
              <Sparkles className="h-6 w-6 text-amber-400 mb-3" />
              <span className="text-[9px] tracking-[0.25em] text-amber-400/80 uppercase font-bold mb-3">
                Architectural Inquiries
              </span>
              <h3 className="text-base font-serif font-bold text-white mb-2">
                Visit Our Studio
              </h3>
              <p className="text-[11px] text-stone-400 leading-relaxed max-w-[200px]">
                Physical samples, custom cuts, and project specifications
                available through our consultation team.
              </p>
              <div className="mt-5 text-[10px] text-amber-400/70 font-medium">
                www.mubarakslabs.com
              </div>
              <div className="text-[8px] text-stone-700 absolute bottom-5 right-5">
                5 / {totalPages}
              </div>
            </div>
          </Page>

          {/* ── Page 6: Back Cover ── */}
          <Page className="page-cover">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-stone-950 flex flex-col items-center justify-center p-8">
              <span className="text-[10px] tracking-[0.4em] text-amber-500/60 uppercase font-medium">
                Mubarak
              </span>
              <span className="text-[8px] tracking-[0.25em] text-stone-500 uppercase mt-1">
                Slabs &amp; Architectural Tiles
              </span>
            </div>
          </Page>
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer disabled:opacity-30"
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono text-stone-500 min-w-[60px] text-center">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={next}
          className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer disabled:opacity-30"
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
