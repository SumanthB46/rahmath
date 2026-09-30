import React from "react";

interface CoverageInformationProps {
  piecesPerBox?: number;
  sqftPerBox?: number;
  selectedBoxes: number;
  totalCoverage: number;
  unit?: string;
}

export function CoverageInformation({
  piecesPerBox = 1,
  sqftPerBox = 15.5,
  selectedBoxes = 1,
  totalCoverage = 15.5,
  unit = "box",
}: CoverageInformationProps) {
  const isTile = (unit || "box").toLowerCase() === "box";

  if (!isTile) {
    return (
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
        <h5 className="font-bold text-[11px] uppercase tracking-wider text-stone-900 font-mono">
          Coverage Information
        </h5>
        <div className="grid grid-cols-2 gap-y-1 text-stone-600">
          <div><span className="text-stone-400 font-medium">Selected Quantity:</span> {selectedBoxes} {unit}s</div>
          <div><span className="text-stone-400 font-medium">Total Area:</span> {totalCoverage} Sq.ft</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5 text-xs">
      <h5 className="font-bold text-[11px] uppercase tracking-wider text-stone-900 font-mono">
        Coverage Information
      </h5>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-700">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
          <span className="text-[10px] text-stone-400 block uppercase font-medium">Pieces / Box</span>
          <span className="font-bold text-stone-900 text-xs">{piecesPerBox} pcs</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
          <span className="text-[10px] text-stone-400 block uppercase font-medium">Sq.ft / Box</span>
          <span className="font-bold text-stone-900 text-xs">{sqftPerBox} sq.ft</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
          <span className="text-[10px] text-stone-400 block uppercase font-medium">Selected Boxes</span>
          <span className="font-bold text-amber-900 text-xs">{selectedBoxes} boxes</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/60">
          <span className="text-[10px] text-stone-400 block uppercase font-medium">Total Coverage</span>
          <span className="font-bold text-amber-900 text-xs">{totalCoverage} sq.ft</span>
        </div>
      </div>
    </div>
  );
}

export default CoverageInformation;
