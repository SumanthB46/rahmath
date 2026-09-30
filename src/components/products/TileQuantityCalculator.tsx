import React, { useState, useEffect } from "react";
import { Plus, Minus, Calculator, AlertCircle, Info } from "lucide-react";

export interface TileCalculatorData {
  boxes: number;
  totalPieces: number;
  totalSqft: number;
  extraSqft: number;
  totalPrice: number;
  isValidStock: boolean;
}

export interface TileQuantityCalculatorProps {
  price: number;
  unit?: string; // 'box' | 'slab' | 'piece'
  stock_quantity?: number;
  pieces_per_box?: number;
  sqft_per_box?: number;
  initialQuantity?: number;
  onChange: (data: TileCalculatorData) => void;
}

export function TileQuantityCalculator({
  price,
  unit = "box",
  stock_quantity = 999,
  pieces_per_box = 1,
  sqft_per_box = 15.5,
  initialQuantity = 1,
  onChange,
}: TileQuantityCalculatorProps) {
  const isTile = (unit || "box").toLowerCase() === "box";
  const isSlab = (unit || "").toLowerCase() === "slab";
  const isPiece = (unit || "").toLowerCase() === "piece";

  const maxStock = Math.max(0, stock_quantity || 0);

  // Boxes or unit count
  const [boxes, setBoxes] = useState<number>(() => {
    return Math.min(Math.max(1, initialQuantity), maxStock > 0 ? maxStock : 1);
  });

  // Area input in sq.ft
  const [areaInput, setAreaInput] = useState<string>(() => {
    return String(Math.round(initialQuantity * sqftPerBoxSafe(sqft_per_box)));
  });

  function sqftPerBoxSafe(sqft?: number) {
    const val = Number(sqft);
    return !isNaN(val) && val > 0 ? val : 15.5;
  }

  function piecesPerBoxSafe(pcs?: number) {
    const val = Number(pcs);
    return !isNaN(val) && val > 0 ? Math.round(val) : 1;
  }

  const effectiveSqftPerBox = sqftPerBoxSafe(sqft_per_box);
  const effectivePiecesPerBox = piecesPerBoxSafe(pieces_per_box);

  // Calculations
  const totalPieces = isTile ? boxes * effectivePiecesPerBox : boxes;
  const totalSqft = isTile
    ? Number((boxes * effectiveSqftPerBox).toFixed(1))
    : Number((effectiveSqftPerBox * boxes).toFixed(1));

  // Compute extra coverage if area was entered
  const enteredAreaNum = parseFloat(areaInput);
  const extraSqft =
    isTile && !isNaN(enteredAreaNum) && enteredAreaNum > 0 && totalSqft > enteredAreaNum
      ? Number((totalSqft - enteredAreaNum).toFixed(1))
      : 0;

  const totalPrice = boxes * price;
  const isAtMaxStock = maxStock > 0 && boxes >= maxStock;
  const isValidStock = maxStock === 0 || boxes <= maxStock;

  // Emit changes to parent
  useEffect(() => {
    onChange({
      boxes,
      totalPieces,
      totalSqft,
      extraSqft,
      totalPrice,
      isValidStock,
    });
  }, [boxes, totalPieces, totalSqft, extraSqft, totalPrice, isValidStock, onChange]);

  // Handle Box Stepper Change
  const handleBoxesDelta = (delta: number) => {
    const next = Math.max(1, boxes + delta);
    const clamped = maxStock > 0 ? Math.min(next, maxStock) : next;
    setBoxes(clamped);

    if (isTile) {
      setAreaInput(String(Math.round(clamped * effectiveSqftPerBox)));
    }
  };

  // Handle Area Input Change (Option 1: Round UP to whole boxes)
  const handleAreaChange = (val: string) => {
    setAreaInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && effectiveSqftPerBox > 0) {
      const calculatedBoxes = Math.ceil(num / effectiveSqftPerBox);
      const clamped = maxStock > 0 ? Math.min(Math.max(1, calculatedBoxes), maxStock) : Math.max(1, calculatedBoxes);
      setBoxes(clamped);
    } else if (val === "") {
      setBoxes(1);
    }
  };

  if (!isTile) {
    // Non-tile simple unit stepper (Slab or Piece)
    return (
      <div className="space-y-2 pt-1 border-t border-stone-200/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600 font-medium">
            Quantity ({isSlab ? "Slabs" : "Pieces"}):
          </span>
          <div className="flex items-center border border-stone-300 rounded-full bg-white shadow-xs">
            <button
              type="button"
              onClick={() => handleBoxesDelta(-1)}
              disabled={boxes <= 1}
              className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-bold text-xs disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1 font-bold text-xs text-stone-900 min-w-[28px] text-center">
              {boxes}
            </span>
            <button
              type="button"
              onClick={() => handleBoxesDelta(1)}
              disabled={isAtMaxStock}
              className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-bold text-xs disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {isSlab && (
          <div className="text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/60 flex items-center justify-between">
            <span>Slab Area:</span>
            <span className="font-semibold text-stone-800">{totalSqft} Sq.ft</span>
          </div>
        )}

        {isAtMaxStock && (
          <p className="text-[10.5px] text-amber-800 font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" /> Only {maxStock} available in stock.
          </p>
        )}
      </div>
    );
  }

  // Compact Tile Calculator
  return (
    <div className="space-y-2.5 pt-2 border-t border-stone-200/60">
      <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-stone-500 font-mono">
        <span>How much do you need?</span>
        {maxStock > 0 && (
          <span className="text-[10px] text-stone-400 font-normal">
            {maxStock} boxes in stock
          </span>
        )}
      </div>

      {/* Row 1: Required Area Input */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
          <span className="font-medium">Required Area</span>
          <span className="text-[10px] text-stone-400 font-mono">({effectiveSqftPerBox} sqft/box)</span>
        </div>
        <div className="relative">
          <input
            type="number"
            min="1"
            placeholder="e.g. 100"
            value={areaInput}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full pl-3 pr-14 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50/60 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-700 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-bold text-stone-400 pointer-events-none">
            Sq.ft
          </span>
        </div>
      </div>

      {/* Row 2: Boxes Stepper */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-stone-600 font-medium">Boxes Required</span>
        <div className="flex items-center border border-stone-300 rounded-full bg-white shadow-xs">
          <button
            type="button"
            onClick={() => handleBoxesDelta(-1)}
            disabled={boxes <= 1}
            className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-bold text-xs disabled:opacity-40"
            aria-label="Decrease boxes"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="px-3 py-1 font-bold text-xs text-stone-900 min-w-[28px] text-center">
            {boxes}
          </span>
          <button
            type="button"
            onClick={() => handleBoxesDelta(1)}
            disabled={isAtMaxStock}
            className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-bold text-xs disabled:opacity-40"
            aria-label="Increase boxes"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Row 3: Compact Coverage Summary Badge */}
      <div className="p-2 rounded-xl bg-stone-100/90 border border-stone-200 text-stone-800 text-[11px] font-medium flex flex-wrap items-center justify-between gap-1">
        <span>
          <strong>{boxes} {boxes === 1 ? "Box" : "Boxes"}</strong> · {totalPieces} Pieces · <strong>{totalSqft} Sq.ft</strong>
        </span>
      </div>

      {/* Extra Coverage Helper (Shown only when extra exists) */}
      {extraSqft > 0 && (
        <p className="text-[10.5px] text-stone-500 flex items-center gap-1 leading-tight font-medium">
          <Info className="h-3 w-3 text-amber-700 shrink-0" />
          <span>You&apos;ll receive <strong>{extraSqft} Sq.ft</strong> extra coverage.</span>
        </p>
      )}

      {/* Max Stock Warning */}
      {isAtMaxStock && (
        <p className="text-[10.5px] text-amber-800 font-medium flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" /> Maximum available stock selected ({maxStock} boxes).
        </p>
      )}
    </div>
  );
}

export default TileQuantityCalculator;
