import React, { useState } from "react";
import { Layers, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images?: string[];
  productName: string;
  brand?: string;
  size?: string;
  hasStock?: boolean;
}

export function ProductGallery({
  images = [],
  productName,
  brand = "Mubarak Luxury",
  size = "Standard Slab",
  hasStock = true,
}: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // If no images provided, render architectural slab placeholder
  const displayImages = images && images.length > 0 ? images : [];

  return (
    <div className="space-y-4">
      {/* Main Feature Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-3xl bg-stone-100 border border-stone-200/90 overflow-hidden shadow-xs group">
        {displayImages.length > 0 ? (
          <img
            src={displayImages[selectedIdx]}
            alt={`${productName} view ${selectedIdx + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-stone-400 space-y-3 bg-gradient-to-br from-stone-100 to-stone-200/80 w-full h-full">
            <Layers className="h-16 w-16 text-amber-800/80 stroke-1" />
            <span className="text-sm font-bold uppercase tracking-widest text-stone-700 font-serif">
              {brand}
            </span>
            <span className="text-xs text-stone-500 font-mono">{size}</span>
          </div>
        )}

        {/* Top Stock Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs ${
              hasStock
                ? "bg-emerald-100/95 text-emerald-800 border border-emerald-300 backdrop-blur-xs"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {hasStock ? "In Stock" : "On Request"}
          </span>
        </div>

        {/* Brand Tag Top Right */}
        {brand && (
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-900/85 backdrop-blur-xs text-white px-3 py-1 rounded-full">
              {brand}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails row if multiple images exist */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedIdx === idx
                  ? "border-stone-900 shadow-xs scale-102"
                  : "border-stone-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
