import React, { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  Search,
  Check,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { updateSection } from "@/lib/api";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface ProductCatalogItem {
  id: number | string;
  name: string;
  sku?: string;
  price?: number;
  size?: string;
  finish?: string;
  thickness?: string;
  material?: string;
  unit?: string;
  main_image?: string;
  images?: string[];
  slug?: string;
}

interface FeaturedTilesEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function FeaturedTilesEditor({ section, onSaveSuccess, onClose }: FeaturedTilesEditorProps) {
  const initial = section.draft_content || section.content || {};

  // Form State
  const [isEnabled, setIsEnabled] = useState<boolean>(
    section.is_visible !== undefined ? section.is_visible : true
  );
  const [heading, setHeading] = useState<string>(
    initial.heading || initial.title || "Featured Tiles & Slabs"
  );
  const [badge, setBadge] = useState<string>(initial.badge || "FEATURED TILES & SLABS");
  const [description, setDescription] = useState<string>(
    initial.description ||
      initial.subtitle ||
      "Explore our curated selection of premium tiles, porcelain surfaces and large-format slabs for contemporary residential and commercial spaces."
  );
  const [ctaText, setCtaText] = useState<string>(initial.cta_text || "View All Products");
  const [maxDisplay, setMaxDisplay] = useState<number>(Number(initial.max_display) || 4);

  // Selected Products State (exact drag & drop order)
  const [selectedProducts, setSelectedProducts] = useState<ProductCatalogItem[]>(
    initial.selected_products || []
  );

  // Available Catalogue Products from DB
  const [allProducts, setAllProducts] = useState<ProductCatalogItem[]>([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState<boolean>(false);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Saving / Preview State
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load product catalogue from backend on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingCatalogue(true);

    fetch("http://localhost:5000/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.products)) {
          setAllProducts(data.products);

          // If initial selected_products was empty but product_ids exists, reconstruct it
          if (
            (!initial.selected_products || initial.selected_products.length === 0) &&
            Array.isArray(initial.product_ids) &&
            initial.product_ids.length > 0
          ) {
            const idMap = new Map<string, ProductCatalogItem>(
              data.products.map((p: ProductCatalogItem) => [String(p.id), p])
            );
            const resolved: ProductCatalogItem[] = [];
            for (const id of initial.product_ids) {
              const item = idMap.get(String(id));
              if (item) resolved.push(item);
            }
            setSelectedProducts(resolved);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingCatalogue(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveImage = (prod: ProductCatalogItem) => {
    const raw = prod.main_image || prod.images?.[0];
    if (!raw) return "/assets/marble-slabs-corner-v2.png";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/assets/")) {
      return raw;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  // Reordering helpers
  const moveProduct = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedProducts.length) return;
    const updated = [...selectedProducts];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setSelectedProducts(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveProduct(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveProduct = (id: number | string) => {
    setSelectedProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  const handleAddProduct = (prod: ProductCatalogItem) => {
    if (selectedProducts.some((p) => String(p.id) === String(prod.id))) {
      toast.info("This product is already in the featured list.");
      return;
    }
    setSelectedProducts((prev) => [...prev, prod]);
    toast.success(`Added "${prod.name}" to Featured Tiles & Slabs`);
  };

  const handleSave = async (publishNow = true) => {
    setSaving(true);
    try {
      const payloadContent = {
        badge,
        heading,
        title: heading,
        description,
        subtitle: description,
        cta_text: ctaText,
        cta_link: "/products",
        max_display: maxDisplay,
        product_ids: selectedProducts.map((p) => p.id),
        selected_products: selectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: Number(p.price || 0),
          size: p.size,
          finish: p.finish,
          thickness: p.thickness,
          material: p.material,
          unit: p.unit || "box",
          main_image: p.main_image,
          slug: p.slug,
        })),
      };

      await updateSection(section.id, {
        is_visible: isEnabled,
        name: "Featured Tiles & Slabs",
        content: payloadContent,
        publishNow,
      });

      toast.success(
        publishNow
          ? "Featured Tiles & Slabs published live to homepage!"
          : "Featured Tiles & Slabs draft saved successfully."
      );
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save changes", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Filtered catalogue for picker
  const filteredCatalogue = allProducts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.finish?.toLowerCase().includes(q) ||
      p.size?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-stone-200">
      {/* Top Banner & Section Toggle */}
      <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              Section Control
            </span>
            <span className="text-[10px] text-stone-500 font-mono">ID: {section.id}</span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage heading, curated slabs, and real-time drag-and-drop homepage display order.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-stone-200">Section Enabled</span>
        </label>
      </div>

      {/* Heading & Eyebrow Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
            Section Heading *
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Featured Tiles & Slabs"
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2.5 px-3.5 text-stone-100 font-serif text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
            Eyebrow Badge
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="FEATURED TILES & SLABS"
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2.5 px-3.5 text-stone-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
          Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explore our curated selection of premium tiles, porcelain surfaces..."
          className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2 px-3 text-stone-200 text-xs leading-relaxed focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* Display Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
            CTA Button Text
          </label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2 px-3 text-stone-200 text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
            Number of Products to Display
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxDisplay}
            onChange={(e) => setMaxDisplay(Number(e.target.value))}
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2 px-3 text-stone-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Selected Products List with Drag-and-Drop Reorder */}
      <div className="space-y-3 pt-2 border-t border-stone-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              Selected Products ({selectedProducts.length})
            </h4>
            <p className="text-[11px] text-stone-400">
              Drag and drop items or use the up/down arrows. Exact order below reflects on the homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </button>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-stone-800 bg-stone-950/40 p-6 space-y-2">
            <p className="text-xs text-stone-400">No products selected yet.</p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs text-amber-400 hover:underline font-mono"
            >
              + Select products from catalogue
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {selectedProducts.map((prod, index) => (
              <div
                key={prod.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-2.5 rounded-xl border bg-stone-900/90 flex items-center justify-between gap-3 transition-all ${
                  draggedIndex === index
                    ? "border-amber-500 bg-amber-950/30 opacity-70"
                    : "border-stone-800 hover:border-stone-700"
                }`}
              >
                {/* Drag Handle & Order Number */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="cursor-grab active:cursor-grabbing text-stone-500 hover:text-stone-300 p-0.5"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <span className="h-6 w-6 rounded-lg bg-stone-800 border border-stone-700 font-mono text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={resolveImage(prod)}
                    alt={prod.name}
                    className="h-10 w-10 rounded-lg object-cover bg-stone-950 border border-stone-800 shrink-0"
                  />

                  {/* Info */}
                  <div className="min-w-0">
                    <h5 className="text-xs font-serif font-bold text-stone-100 truncate">
                      {prod.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>{prod.size || "120 × 240 cm"}</span>
                      {prod.finish && <span>• {prod.finish}</span>}
                      {prod.price && (
                        <span className="text-amber-300 font-semibold">
                          ₹{Number(prod.price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Move Up / Down & Remove */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveProduct(index, index - 1)}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === selectedProducts.length - 1}
                    onClick={() => moveProduct(index, index + 1)}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(prod.id)}
                    className="p-1 rounded-lg hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors cursor-pointer ml-1"
                    title="Remove from Featured"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview Toggle & Buttons */}
      <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(previewMode === "desktop" ? null : "desktop")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              previewMode === "desktop"
                ? "bg-amber-400 text-stone-950 border-amber-400"
                : "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Desktop Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(previewMode === "mobile" ? null : "mobile")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              previewMode === "mobile"
                ? "bg-amber-400 text-stone-950 border-amber-400"
                : "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Mobile Swipe Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Interactive In-Modal Preview Modal */}
      {previewMode && (
        <div className="p-4 sm:p-6 rounded-2xl border border-amber-900/40 bg-[#FAF8F5] text-stone-900 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-300 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 font-bold">
              Live Preview: {previewMode === "desktop" ? "Desktop 4-Column Grid" : "Mobile Swipe Carousel"}
            </span>
            <button
              type="button"
              onClick={() => setPreviewMode(null)}
              className="text-stone-500 hover:text-stone-900 text-xs font-mono"
            >
              [Close Preview]
            </button>
          </div>

          <div className="text-center max-w-lg mx-auto">
            <span className="text-[9px] font-mono tracking-widest uppercase text-amber-900 font-bold block mb-1">
              {badge}
            </span>
            <h3 className="text-xl font-serif text-stone-950">{heading}</h3>
            <p className="text-[11px] text-stone-600 mt-1">{description}</p>
          </div>

          {previewMode === "desktop" ? (
            <div className="grid grid-cols-4 gap-4 pt-2">
              {selectedProducts.slice(0, maxDisplay).map((prod) => (
                <div key={prod.id} className="flex flex-col text-left">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-stone-200 border border-stone-300 mb-2">
                    <img
                      src={resolveImage(prod)}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h5 className="text-xs font-serif font-bold text-stone-900 uppercase truncate">
                    {prod.name}
                  </h5>
                  <p className="text-[10px] text-stone-500 font-sans">
                    {prod.size || "120 × 240 cm"} {prod.thickness ? `· ${prod.thickness}` : ""}
                  </p>
                  <p className="text-[10px] text-stone-600 font-sans font-medium">
                    {prod.finish || "Polished"}
                  </p>
                  {prod.price && (
                    <p className="text-[11px] font-serif font-semibold text-stone-900 mt-0.5">
                      ₹{Number(prod.price).toLocaleString("en-IN")} / Box
                    </p>
                  )}
                  <span className="text-[10px] font-sans font-semibold uppercase text-amber-900 mt-1">
                    View Product →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory">
                {selectedProducts.slice(0, maxDisplay).map((prod) => (
                  <div key={prod.id} className="w-[180px] shrink-0 snap-center flex flex-col text-left">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-stone-200 border border-stone-300 mb-1.5">
                      <img
                        src={resolveImage(prod)}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h5 className="text-[11px] font-serif font-bold text-stone-900 uppercase truncate">
                      {prod.name}
                    </h5>
                    <p className="text-[9.5px] text-stone-500 font-sans">
                      {prod.size || "120 × 240 cm"}
                    </p>
                    <p className="text-[9.5px] text-stone-600 font-sans">
                      {prod.finish || "Polished"}
                    </p>
                    <span className="text-[9.5px] font-sans font-semibold uppercase text-amber-900 mt-1">
                      View Product →
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] font-mono uppercase tracking-widest text-stone-400 mt-2">
                ← Swipe →
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Catalogue Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-stone-800 bg-[#161513] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-stone-100">Add from Product Catalogue</h4>
                <p className="text-[11px] text-stone-400">
                  Select tiles or slabs to feature on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-stone-400 hover:text-stone-100 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, finish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-800 bg-stone-950 pl-9 pr-3.5 py-2 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {loadingCatalogue ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-500 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  <span className="text-xs font-mono">Loading catalogue...</span>
                </div>
              ) : filteredCatalogue.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  No products matched your search.
                </div>
              ) : (
                filteredCatalogue.map((prod) => {
                  const alreadyAdded = selectedProducts.some(
                    (p) => String(p.id) === String(prod.id)
                  );
                  return (
                    <div
                      key={prod.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        alreadyAdded
                          ? "border-amber-900/40 bg-amber-950/20"
                          : "border-stone-800 bg-stone-950 hover:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={resolveImage(prod)}
                          alt={prod.name}
                          className="h-11 w-11 rounded-lg object-cover bg-stone-900 border border-stone-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-serif font-bold text-stone-100 truncate">
                            {prod.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                            <span>{prod.sku}</span>
                            <span>• {prod.size || "120 × 240 cm"}</span>
                            {prod.finish && <span>• {prod.finish}</span>}
                          </div>
                          {prod.price && (
                            <span className="text-[11px] text-amber-400 font-semibold">
                              ₹{Number(prod.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {alreadyAdded ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10.5px] font-mono font-semibold flex items-center gap-1 shrink-0">
                          <Check className="h-3 w-3" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddProduct(prod)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                        >
                          + Select
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturedTilesEditor;
