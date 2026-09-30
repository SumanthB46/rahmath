import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, Sparkles, Droplets, Hammer } from "lucide-react";
import { CoverageInformation } from "./CoverageInformation";
import { ProductSpecifications } from "./ProductSpecifications";

interface ProductDetailsProps {
  sku: string;
  name: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  finish?: string;
  thickness?: string;
  color?: string;
  unit?: string;
  description?: string;
  piecesPerBox?: number;
  sqftPerBox?: number;
  selectedBoxes?: number;
  totalCoverage?: number;
}

export function ProductDetails({
  sku,
  name,
  brand,
  material,
  dimensions,
  finish,
  thickness,
  color,
  unit = "box",
  description,
  piecesPerBox = 1,
  sqftPerBox = 15.5,
  selectedBoxes = 1,
  totalCoverage = 15.5,
}: ProductDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 pt-6 border-t border-stone-200/80">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 px-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-700/40 text-stone-900 font-semibold text-xs uppercase tracking-wider flex items-center justify-between transition-all shadow-xs cursor-pointer"
      >
        <span className="font-serif text-sm normal-case font-bold">
          {isOpen ? "Hide Full Product Details" : "View More Details & Technical Specifications"}
        </span>
        {isOpen ? (
          <span className="inline-flex items-center gap-1 text-amber-800 text-xs font-semibold">
            Hide Details <ChevronUp className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-800 text-xs font-semibold">
            View More Details <ChevronDown className="h-4 w-4" />
          </span>
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Description Card */}
          {description && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                Product Description
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {description}
              </p>
            </div>
          )}

          {/* Coverage Information Card */}
          <CoverageInformation
            piecesPerBox={piecesPerBox}
            sqftPerBox={sqftPerBox}
            selectedBoxes={selectedBoxes}
            totalCoverage={totalCoverage}
            unit={unit}
          />

          {/* Specifications Card */}
          <ProductSpecifications
            sku={sku}
            brand={brand}
            material={material}
            dimensions={dimensions}
            finish={finish}
            thickness={thickness}
            color={color}
            unit={unit}
          />

          {/* Care & Installation Guidelines */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5 text-xs">
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-stone-900 font-mono">
              Care &amp; Installation Instructions
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-600 text-[11px]">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200/60">
                <Hammer className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Use specialized polymer-modified tile adhesive (Grèsbond C2TE recommended).</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200/60">
                <Droplets className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Zero stain retention. Clean with neutral pH cleaning solution and water.</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200/60">
                <ShieldCheck className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Scratch and thermal shock resistant for residential and high-traffic commercial spaces.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
