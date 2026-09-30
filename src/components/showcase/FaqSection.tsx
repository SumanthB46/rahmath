import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "How do I calculate how many boxes of tiles I need for my space?",
    a: "Tiles are sold strictly in whole, factory-sealed boxes to prevent batch shade variations. Enter your room area in square feet into our instant calculator. The system automatically divides by the sq.ft per box (e.g. 31 sq.ft/box) and rounds UP to the nearest complete box. We also recommend an extra 5–10% for cuts and wastage.",
  },
  {
    q: "How does delivery and transport work (Porter / VRL Cargo)?",
    a: "You pay only for the tile products (+GST) online during checkout. Transport charges depend on your location, order weight, and vehicle type (tempo, truck, or crane-assisted). Our logistics desk assigns the most cost-effective verified partner (Porter / VRL Cargo / Direct Vehicle) upon dispatch, and you pay the transport charge directly to the delivery partner.",
  },
  {
    q: "Can I inspect the slabs in person before ordering?",
    a: "Yes! Our Flagship Experience Center in Chikkaballapur, Bengaluru showcases full-scale living room and bathroom mockups under true architectural lighting. You can touch surface textures (satin matte, honed, high gloss) and inspect full raw slab lots in person.",
  },
  {
    q: "What if tiles get broken or damaged during transit?",
    a: "Every shipment is secured with factory corner protectors, shrink wrap, and reinforced timber crating. All consignments are covered under our transit damage protection. In the rare event of transit damage, notify us upon delivery for immediate replacement boxes.",
  },
  {
    q: "Do you provide GST tax invoices for B2B input tax credit?",
    a: "Yes. Every order is billed with an official GST invoice (GSTIN: 29AAACM1234F1Z5) with full 18% GST itemization. Corporate clients, architects, and builders can provide their company GSTIN during checkout for 100% input tax credit.",
  },
];

export interface FaqSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
  };
}

export function FaqSection({ content }: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const title = content?.title || "Tile Buying & Logistics Guide";
  const badge = content?.badge || "Frequently Asked Questions";
  const subtitle =
    content?.subtitle ||
    "Everything you need to know about whole-box tile calculations, logistics, showroom visits, and quality guarantees.";

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-8 bg-[#F6F3EE] text-stone-900 border-t border-stone-200/90 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/15 bg-amber-900/5 mb-1">
            <HelpCircle className="h-3 w-3 text-amber-800" />
            <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-amber-900 font-mono">
              {badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-stone-950 tracking-tight">
            {title}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
                  isOpen ? "border-amber-400/80 shadow-md" : "border-stone-200/90 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-serif font-bold text-stone-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-amber-800" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-[13px] text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FaqSection;
