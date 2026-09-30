import { useState } from "react";
import { Calculator, ArrowRight, Info, RefreshCw, Plus, Trash2 } from "lucide-react";
import { scrollToSection } from "@/hooks/useLenis";

export interface TileSizeOption {
  id: string;
  name: string;
  lengthIn: number;
  widthIn: number;
  tilesPerBox: number;
}

export const TILE_SIZE_OPTIONS: TileSizeOption[] = [
  { id: "12x12", name: '12" × 12" (1.0 sq.ft)', lengthIn: 12, widthIn: 12, tilesPerBox: 10 },
  { id: "16x16", name: '16" × 16" (1.78 sq.ft)', lengthIn: 16, widthIn: 16, tilesPerBox: 6 },
  { id: "24x24", name: '24" × 24" / 2\' × 2\' (4.0 sq.ft)', lengthIn: 24, widthIn: 24, tilesPerBox: 4 },
  { id: "24x48", name: '24" × 48" / 2\' × 4\' (8.0 sq.ft)', lengthIn: 24, widthIn: 48, tilesPerBox: 2 },
  { id: "32x32", name: '32" × 32" (7.11 sq.ft)', lengthIn: 32, widthIn: 32, tilesPerBox: 3 },
  { id: "32x64", name: '32" × 64" (14.22 sq.ft)', lengthIn: 32, widthIn: 64, tilesPerBox: 2 },
  { id: "48x96", name: '48" × 96" / 4\' × 8\' (32.0 sq.ft)', lengthIn: 48, widthIn: 96, tilesPerBox: 1 },
  { id: "custom", name: "Custom Tile Size", lengthIn: 0, widthIn: 0, tilesPerBox: 1 },
];

export interface WallDimension {
  id: string;
  lengthFt: string;
  lengthIn: string;
  widthFt: string;
  widthIn: string;
}

const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Master Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Balcony / Terrace",
  "Commercial / Office",
  "Exterior / Facade",
  "Staircase",
  "Pooja Room",
  "Other",
];

const SPACE_TYPES = [
  "Flooring",
  "Wall Cladding",
  "Main Wall",
  "Bathroom Wall",
  "Kitchen Countertop",
  "Kitchen Backsplash",
  "Elevation",
  "Accent Wall",
  "Staircase Steps",
  "Patio / Outdoor",
  "Other",
];

export function TileGraniteCalculator({ onInquire }: { onInquire?: (estimateText: string) => void }) {
  // Room / Space Type
  const [roomType, setRoomType] = useState<string>("");
  const [spaceType, setSpaceType] = useState<string>("");

  // Area Mode & Dimensions
  const [areaMode, setAreaMode] = useState<"dimensions" | "total_area">("dimensions");
  const [walls, setWalls] = useState<WallDimension[]>([
    { id: "wall-1", lengthFt: "10", lengthIn: "0", widthFt: "12", widthIn: "0" },
  ]);
  const [totalAreaDirect, setTotalAreaDirect] = useState<string>("120");

  // Tile Size Selection
  const [selectedTileSizeId, setSelectedTileSizeId] = useState<string>("24x24");
  const [customTileLengthIn, setCustomTileLengthIn] = useState<string>("24");
  const [customTileWidthIn, setCustomTileWidthIn] = useState<string>("24");

  // Waste & Reserve Material Selection
  const [includeWaste, setIncludeWaste] = useState<boolean>(true);
  const [wastagePct, setWastagePct] = useState<number>(10);
  const [showWasteWhy, setShowWasteWhy] = useState<boolean>(false);

  // Grout Width Selection
  const [includeGrout, setIncludeGrout] = useState<boolean>(true);
  const [groutWidthIn, setGroutWidthIn] = useState<number>(0.125); // 1/8 inch (approx 3mm)
  const [showGroutWhy, setShowGroutWhy] = useState<boolean>(false);

  // Handle Wall Operations
  const handleAddWall = () => {
    setWalls((prev) => [
      ...prev,
      {
        id: `wall-${Date.now()}`,
        lengthFt: "",
        lengthIn: "0",
        widthFt: "",
        widthIn: "0",
      },
    ]);
  };

  const handleRemoveWall = (id: string) => {
    if (walls.length <= 1) return;
    setWalls((prev) => prev.filter((w) => w.id !== id));
  };

  const handleWallChange = (id: string, field: keyof WallDimension, value: string) => {
    setWalls((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  // Calculations
  // ponytail: calculate area in sq ft safely from feet and inches
  const calcWallSqFt = (w: WallDimension) => {
    const lFt = parseFloat(w.lengthFt) || 0;
    const lIn = (parseFloat(w.lengthIn) || 0) / 12;
    const wFt = parseFloat(w.widthFt) || 0;
    const wIn = (parseFloat(w.widthIn) || 0) / 12;
    return (lFt + lIn) * (wFt + wIn);
  };

  const rawAreaSqFt =
    areaMode === "dimensions"
      ? walls.reduce((sum, w) => sum + calcWallSqFt(w), 0)
      : parseFloat(totalAreaDirect) || 0;

  const activeWastagePct = includeWaste ? wastagePct : 0;
  const totalAreaWithWastage = rawAreaSqFt * (1 + activeWastagePct / 100);

  // Selected Tile Area calculation with optional Grout Width
  const selectedTilePreset = TILE_SIZE_OPTIONS.find((t) => t.id === selectedTileSizeId);
  const rawTileLengthIn =
    selectedTileSizeId === "custom"
      ? parseFloat(customTileLengthIn) || 12
      : selectedTilePreset?.lengthIn || 24;
  const rawTileWidthIn =
    selectedTileSizeId === "custom"
      ? parseFloat(customTileWidthIn) || 12
      : selectedTilePreset?.widthIn || 24;

  const activeGroutIn = includeGrout ? groutWidthIn : 0;
  const effectiveTileLengthIn = rawTileLengthIn + activeGroutIn;
  const effectiveTileWidthIn = rawTileWidthIn + activeGroutIn;

  const singleTileSqFt = (effectiveTileLengthIn * effectiveTileWidthIn) / 144; // 1 sq ft = 144 sq in
  const totalTilesNeeded = singleTileSqFt > 0 ? Math.ceil(totalAreaWithWastage / singleTileSqFt) : 0;
  
  const tilesPerBox = selectedTilePreset?.tilesPerBox || 1;
  const totalBoxesNeeded = Math.ceil(totalTilesNeeded / tilesPerBox);

  const handleInquiryClick = () => {
    const roomInfo = roomType || spaceType ? ` for ${roomType || "Room"} (${spaceType || "Space"})` : "";
    const tileLabel = selectedTileSizeId === "custom" ? `${rawTileLengthIn}"x${rawTileWidthIn}"` : selectedTilePreset?.name;
    const summary = `Estimated ${Math.round(totalAreaWithWastage)} sq.ft${roomInfo} - ${totalTilesNeeded} tiles (${tileLabel}), ~${totalBoxesNeeded} boxes needed`;
    if (onInquire) {
      onInquire(summary);
    } else {
      scrollToSection("#contact");
    }
  };

  const handleReset = () => {
    setRoomType("");
    setSpaceType("");
    setAreaMode("dimensions");
    setWalls([{ id: "wall-1", lengthFt: "10", lengthIn: "0", widthFt: "12", widthIn: "0" }]);
    setTotalAreaDirect("120");
    setSelectedTileSizeId("24x24");
    setCustomTileLengthIn("24");
    setCustomTileWidthIn("24");
    setIncludeWaste(true);
    setWastagePct(10);
    setIncludeGrout(true);
    setGroutWidthIn(0.125);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white text-stone-900 rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-300 bg-amber-100/80 mb-2 shadow-xs">
            <Calculator className="h-3.5 w-3.5 text-amber-800" />
            <span className="text-[10.5px] font-bold tracking-widest uppercase text-amber-900">
              Tile &amp; Granite Quantity Calculator
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            Tile &amp; Granite Quantity Calculator
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-light">
            Calculate exact room area, tile piece counts, grout lines, and wastage allowances.
          </p>
        </div>

        <button
          onClick={handleReset}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-950 hover:border-stone-400 text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Left) */}
        <div className="lg:col-span-7 space-y-7">
          {/* Section 1: Room / Space Type */}
          <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 space-y-4">
            <h4 className="text-xs font-bold uppercase text-amber-800 tracking-wider">
              Room / Space Type
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="calc-room-type" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Room Type <span className="text-amber-700">*</span>
                </label>
                <select
                  id="calc-room-type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Select Room</option>
                  {ROOM_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="calc-space-type" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Space Type <span className="text-amber-700">*</span>
                </label>
                <select
                  id="calc-space-type"
                  value={spaceType}
                  onChange={(e) => setSpaceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Select Space</option>
                  {SPACE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Area To Be Covered */}
          <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <h4 className="text-xs font-bold uppercase text-amber-800 tracking-wider">
                Area To Be Covered <span className="text-amber-700">*</span>
              </h4>
              <div className="flex items-center rounded-xl bg-stone-200/70 p-1 border border-stone-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAreaMode("dimensions")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    areaMode === "dimensions"
                      ? "bg-white text-stone-950 shadow-xs"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  Use Dimensions
                </button>
                <button
                  type="button"
                  onClick={() => setAreaMode("total_area")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    areaMode === "total_area"
                      ? "bg-white text-stone-950 shadow-xs"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  Use Total Area
                </button>
              </div>
            </div>

            {areaMode === "dimensions" ? (
              <div className="space-y-4">
                {walls.map((w, index) => {
                  const wallSqFt = calcWallSqFt(w);
                  return (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl bg-white border border-stone-200 relative space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-800">
                          Wall {index + 1} <span className="text-amber-700">*</span>
                        </span>
                        {walls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWall(w.id)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                            title="Remove Wall"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-end">
                        {/* Length */}
                        <div className="sm:col-span-5 space-y-1">
                          <span className="block text-[11px] font-medium text-stone-600">Length</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={w.lengthFt}
                                onChange={(e) => handleWallChange(w.id, "lengthFt", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                              />
                              <span className="text-[10px] text-stone-500 mt-1 block">Enter In Feet.</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="11"
                                placeholder="0"
                                value={w.lengthIn}
                                onChange={(e) => handleWallChange(w.id, "lengthIn", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                              />
                              <span className="text-[10px] text-stone-500 mt-1 block">Enter In Inch.</span>
                            </div>
                          </div>
                        </div>

                        {/* x separator */}
                        <div className="sm:col-span-1 text-center py-2 sm:pb-5">
                          <span className="text-amber-700 font-bold text-lg">x</span>
                        </div>

                        {/* Width */}
                        <div className="sm:col-span-5 space-y-1">
                          <span className="block text-[11px] font-medium text-stone-600">Width</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={w.widthFt}
                                onChange={(e) => handleWallChange(w.id, "widthFt", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                              />
                              <span className="text-[10px] text-stone-500 mt-1 block">Enter In Feet.</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="0"
                                max="11"
                                placeholder="0"
                                value={w.widthIn}
                                onChange={(e) => handleWallChange(w.id, "widthIn", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                              />
                              <span className="text-[10px] text-stone-500 mt-1 block">Enter In Inch.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {wallSqFt > 0 && (
                        <div className="text-[11px] text-stone-600 text-right font-mono">
                          Subtotal: <span className="text-amber-800 font-bold">{wallSqFt.toFixed(2)} sq.ft</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddWall}
                  className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-700 hover:text-amber-800 hover:border-amber-400 bg-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-amber-700" /> Add More
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <label htmlFor="calc-total-area" className="block text-xs font-medium text-stone-700">
                  Total Area (Square Feet) <span className="text-amber-700">*</span>
                </label>
                <input
                  id="calc-total-area"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  value={totalAreaDirect}
                  onChange={(e) => setTotalAreaDirect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-base focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                />
                <span className="text-[10px] text-stone-500 block">
                  Enter the total surface area directly in sq. ft.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Tile Size */}
          <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 space-y-4">
            <h4 className="text-xs font-bold uppercase text-amber-800 tracking-wider">
              Tile Size <span className="text-amber-700">*</span>
            </h4>
            <div>
              <label htmlFor="calc-tile-size" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Select Tile Size
              </label>
              <select
                id="calc-tile-size"
                value={selectedTileSizeId}
                onChange={(e) => setSelectedTileSizeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {TILE_SIZE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTileSizeId === "custom" && (
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-white border border-stone-200">
                <div>
                  <label htmlFor="calc-custom-length" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Tile Length (Inches)
                  </label>
                  <input
                    id="calc-custom-length"
                    type="number"
                    min="1"
                    value={customTileLengthIn}
                    onChange={(e) => setCustomTileLengthIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="calc-custom-width" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Tile Width (Inches)
                  </label>
                  <input
                    id="calc-custom-width"
                    type="number"
                    min="1"
                    value={customTileWidthIn}
                    onChange={(e) => setCustomTileWidthIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Wastage & Grout Options */}
          <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 space-y-5">
            {/* Waste and Reserve Material */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-stone-900">
                  <input
                    type="checkbox"
                    checked={includeWaste}
                    onChange={(e) => setIncludeWaste(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 bg-white text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                  />
                  <span>Add waste and reserve material</span>
                </label>

                {/* Why? Tooltip */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onMouseEnter={() => setShowWasteWhy(true)}
                    onMouseLeave={() => setShowWasteWhy(false)}
                    onClick={() => setShowWasteWhy((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold hover:text-amber-950 transition-colors cursor-pointer"
                  >
                    <span>Why?</span>
                    <Info className="h-3.5 w-3.5" />
                  </button>

                  {showWasteWhy && (
                    <div className="absolute right-0 bottom-full mb-2 w-72 sm:w-80 p-3.5 rounded-xl bg-stone-900 text-white text-xs shadow-2xl border border-stone-700 z-50 leading-relaxed font-normal">
                      Calculating wastage includes extra tiles needed for cuts, breakages, or probable future repairs and using 5-10% additional allowance to avoid shortages.
                    </div>
                  )}
                </div>
              </div>

              {includeWaste && (
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {[
                    { pct: 5, label: "5% (Straight Laying)" },
                    { pct: 10, label: "10% (Diagonal / Herringbone)" },
                    { pct: 15, label: "15% (Complex Cuts)" },
                  ].map((w) => (
                    <button
                      key={w.pct}
                      type="button"
                      onClick={() => setWastagePct(w.pct)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        wastagePct === w.pct
                          ? "bg-amber-100 border-amber-400 text-amber-950 font-semibold shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{w.pct}%</div>
                      <div className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5 truncate">
                        {w.label.split("(")[1]?.replace(")", "") || "Allowance"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-stone-200" />

            {/* Grout Width Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-stone-900">
                  <input
                    type="checkbox"
                    checked={includeGrout}
                    onChange={(e) => setIncludeGrout(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 bg-white text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                  />
                  <span>Add Grout Width</span>
                </label>

                {/* Why? Tooltip */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onMouseEnter={() => setShowGroutWhy(true)}
                    onMouseLeave={() => setShowGroutWhy(false)}
                    onClick={() => setShowGroutWhy((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold hover:text-amber-950 transition-colors cursor-pointer"
                  >
                    <span>Why?</span>
                    <Info className="h-3.5 w-3.5" />
                  </button>

                  {showGroutWhy && (
                    <div className="absolute right-0 bottom-full mb-2 w-64 sm:w-72 p-3.5 rounded-xl bg-stone-900 text-white text-xs shadow-2xl border border-stone-700 z-50 leading-relaxed font-normal">
                      The space between tiles that affects the total tile coverage needed.
                    </div>
                  )}
                </div>
              </div>

              {includeGrout && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { val: 0.0625, label: '1/16" (1.5mm)' },
                    { val: 0.125, label: '1/8" (3mm)' },
                    { val: 0.1875, label: '3/16" (4.5mm)' },
                    { val: 0.25, label: '1/4" (6mm)' },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGroutWidthIn(g.val)}
                      className={`p-2 rounded-xl text-center border transition-all text-xs font-medium cursor-pointer ${
                        groutWidthIn === g.val
                          ? "bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output Summary Card */}
        <div className="lg:col-span-5 bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200/90 flex flex-col justify-between h-full space-y-6 lg:sticky lg:top-24 shadow-sm">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
              Calculation Breakdown
            </span>
            <h4 className="text-xl font-light text-stone-900 mt-1">Estimate Summary</h4>

            <div className="mt-5 space-y-3.5 divide-y divide-stone-200 text-xs">
              {(roomType || spaceType) && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-600">Selected Space</span>
                  <span className="font-semibold text-amber-900">
                    {[roomType, spaceType].filter(Boolean).join(" • ")}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <span className="text-stone-600">Net Coverage Area</span>
                <span className="font-semibold text-stone-900">
                  {rawAreaSqFt.toFixed(1)} sq. ft.
                </span>
              </div>

              {includeWaste && (
                <div className="flex justify-between items-center pt-3">
                  <span className="text-stone-600">Area with {wastagePct}% Wastage</span>
                  <span className="font-semibold text-amber-800">
                    {totalAreaWithWastage.toFixed(1)} sq. ft.
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <span className="text-stone-600">Selected Tile Size</span>
                <span className="font-semibold text-stone-900">
                  {selectedTileSizeId === "custom"
                    ? `${rawTileLengthIn}" × ${rawTileWidthIn}"`
                    : selectedTilePreset?.name.split("(")[0]}
                </span>
              </div>

              {includeGrout && (
                <div className="flex justify-between items-center pt-3">
                  <span className="text-stone-600">Grout Joint Width</span>
                  <span className="font-semibold text-stone-900">
                    {groutWidthIn === 0.0625 && '1/16" (1.5mm)'}
                    {groutWidthIn === 0.125 && '1/8" (3mm)'}
                    {groutWidthIn === 0.1875 && '3/16" (4.5mm)'}
                    {groutWidthIn === 0.25 && '1/4" (6mm)'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <span className="text-stone-600">Total Tiles Needed</span>
                <span className="text-base font-bold text-amber-800">
                  {totalTilesNeeded} pcs
                </span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-stone-600">Estimated Boxes</span>
                <span className="font-semibold text-stone-900">
                  ~{totalBoxesNeeded} boxes ({tilesPerBox} pcs/box)
                </span>
              </div>
            </div>
          </div>

          {/* Action & Disclaimer */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-start gap-2 text-[10px] text-stone-600 leading-relaxed bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Final tile box count may vary depending on supplier packaging and pattern layouts.
              </span>
            </div>

            <button
              onClick={handleInquiryClick}
              type="button"
              className="w-full py-3.5 rounded-xl bg-[var(--gradient-gold)] text-stone-950 font-bold text-xs tracking-wider uppercase transition-transform active:scale-[0.99] shadow-md flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
            >
              Inquire For This Estimate <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
