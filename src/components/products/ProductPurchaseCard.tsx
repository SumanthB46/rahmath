import React, { useState } from "react";
import { TileQuantityCalculator, TileCalculatorData } from "./TileQuantityCalculator";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Building2,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProductPurchaseCardProps {
  name: string;
  sku: string;
  brand?: string;
  categoryName?: string;
  price: number;
  unit?: string;
  stockQuantity?: number;
  piecesPerBox?: number;
  sqftPerBox?: number;
  onConfirmPurchase: (calcData: TileCalculatorData) => void;
  onCalcChange?: (calcData: TileCalculatorData) => void;
}

export function ProductPurchaseCard({
  name,
  sku,
  brand = "Mubarak Luxury",
  categoryName = "Floor Tiles",
  price,
  unit = "box",
  stockQuantity = 999,
  piecesPerBox = 1,
  sqftPerBox = 15.5,
  onConfirmPurchase,
  onCalcChange,
}: ProductPurchaseCardProps) {
  const isTile = (unit || "box").toLowerCase() === "box";
  const isSlab = (unit || "").toLowerCase() === "slab";
  const unitLabel = isTile ? "box" : isSlab ? "slab" : "piece";
  const unitPlural = isTile ? "Boxes" : isSlab ? "Slabs" : "Pieces";

  // When false: card shows compact initial view with [ ADD TO CART ] button
  // When true: card expands the compact TileQuantityCalculator
  const [showCalculator, setShowCalculator] = useState(false);

  const [currentCalc, setCurrentCalc] = useState<TileCalculatorData>({
    boxes: 1,
    totalPieces: piecesPerBox,
    totalSqft: sqftPerBox,
    extraSqft: 0,
    totalPrice: price,
    isValidStock: true,
  });

  const handleCalculatorChange = (data: TileCalculatorData) => {
    setCurrentCalc(data);
    if (onCalcChange) onCalcChange(data);
  };

  const handleInitialAddToCartClick = () => {
    setShowCalculator(true);
  };

  const handleConfirmOrder = () => {
    if (!currentCalc.isValidStock) return;
    onConfirmPurchase(currentCalc);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-5 sticky top-24">
      {/* Header: Brand, SKU & Category */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px] font-mono uppercase text-stone-400">
          <span>SKU: {sku}</span>
          <span className="text-amber-800 font-bold">{categoryName}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
          {name}
        </h1>

        {brand && (
          <span className="text-xs text-stone-500 font-medium block">
            By <strong className="text-stone-800">{brand}</strong>
          </span>
        )}
      </div>

      {/* Pricing Header */}
      <div className="py-2.5 px-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
            Unit Price
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              ₹{Number(price).toLocaleString()}
            </span>
            <span className="text-xs text-stone-500 font-medium">/ {unitLabel}</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-stone-500 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
          + 18% GST
        </span>
      </div>

      {/* Compact Box Information Strip */}
      {isTile && (
        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200/60 space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-stone-400 font-mono block">
            BOX SPECIFICATION
          </span>
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>1 Box = {piecesPerBox} {piecesPerBox === 1 ? "Piece" : "Pieces"}</span>
            <span className="text-stone-300">·</span>
            <span>1 Box = {sqftPerBox} Sq.ft</span>
          </div>
        </div>
      )}

      {/* Initial Compact View vs Expanded Quantity Calculator */}
      {!showCalculator ? (
        <div className="space-y-4 pt-1">
          <button
            type="button"
            onClick={handleInitialAddToCartClick}
            className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="h-4 w-4 text-amber-300" />
            <span>Add to Cart</span>
          </button>

          <p className="text-[11px] text-center text-stone-400">
            Click to calculate required area, boxes and checkout.
          </p>
        </div>
      ) : (
        /* Expanded Quantity Calculator inside Card */
        <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <TileQuantityCalculator
            price={price}
            unit={unit}
            stock_quantity={stockQuantity}
            pieces_per_box={piecesPerBox}
            sqft_per_box={sqftPerBox}
            initialQuantity={currentCalc.boxes || 1}
            onChange={handleCalculatorChange}
          />

          {/* Subtotal & Confirmation CTA */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 font-mono uppercase text-[11px]">
                TOTAL · {currentCalc.boxes} {currentCalc.boxes === 1 ? unitLabel.toUpperCase() : unitPlural.toUpperCase()}
              </span>
              <div className="text-right">
                <span className="text-lg font-bold font-serif text-stone-900 block">
                  ₹{currentCalc.totalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400">+ 18% GST</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={!currentCalc.isValidStock}
              className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4 text-amber-300" />
              <span>Confirm &amp; Proceed to Checkout</span>
            </button>
          </div>
        </div>
      )}

      {/* Delivery & Services Info Footer */}
      <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Truck className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            <strong>Separate Delivery Coordination:</strong> Transport partner (Porter / VRL Cargo) and separate freight charge will be coordinated upon dispatch.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <Building2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            <strong>Showroom Inspection:</strong> Physical slabs &amp; samples available at our Chikkaballapur Studio.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductPurchaseCard;
