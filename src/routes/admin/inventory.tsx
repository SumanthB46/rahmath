import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Package,
  Edit2,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [{ title: "Inventory & Stock Control — Mubarak Admin" }],
  }),
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  // Stock edit modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newStock, setNewStock] = useState("0");
  const [newThreshold, setNewThreshold] = useState("10");
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getProducts({
        search,
        stockStatus: stockFilter !== "all" ? stockFilter : undefined,
      });
      if (res.products) {
        setProducts(res.products);
        setTotal(res.total || res.products.length);
      }
    } catch (err: any) {
      toast.error("Failed to load inventory", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [stockFilter]);

  const handleQuickAdjust = async (prod: any, delta: number) => {
    const updated = Math.max(0, prod.stock_quantity + delta);
    try {
      await api.admin.updateStock(prod.id, updated);
      toast.success(`Updated ${prod.name} to ${updated} ${prod.unit || "boxes"}`);
      loadInventory();
    } catch (err: any) {
      toast.error("Stock adjustment failed", { description: err.message });
    }
  };

  const handleOpenEditStock = (prod: any) => {
    setSelectedProduct(prod);
    setNewStock(String(prod.stock_quantity || 0));
    setNewThreshold(String(prod.low_stock_threshold || 10));
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await api.admin.updateProduct(selectedProduct.id, {
        stockQuantity: parseInt(newStock, 10) || 0,
        lowStockThreshold: parseInt(newThreshold, 10) || 10,
      });
      toast.success("Stock levels updated");
      setSelectedProduct(null);
      loadInventory();
    } catch (err: any) {
      toast.error("Failed to update stock", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout pageTitle="Inventory &amp; Box Control">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Inventory &amp; Box Balances ({total})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Monitor tile box stock levels, coverage ratios, and configure automatic low-stock alerts.
            </p>
          </div>
          <button
            onClick={loadInventory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Inventory</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#161513] border border-stone-800 p-4 rounded-2xl text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search tiles by name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadInventory()}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Inventory Items</option>
              <option value="low_stock">⚠️ Low Stock Only (≤ Threshold)</option>
              <option value="out_of_stock">🚫 Out of Stock Only (0)</option>
              <option value="in_stock">✅ Adequately Stocked</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Calculating Stock Levels...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Boxes className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No inventory matches found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-4 font-semibold">SKU &amp; Category</th>
                    <th className="py-3.5 px-4 font-semibold">Unit &amp; Coverage</th>
                    <th className="py-3.5 px-4 font-semibold">Current Stock</th>
                    <th className="py-3.5 px-4 font-semibold">Alert Threshold</th>
                    <th className="py-3.5 px-4 font-semibold">Stock Health</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Quick ± Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {products.map((prod) => {
                    const isOut = prod.stock_quantity === 0;
                    const isLow = !isOut && prod.stock_quantity <= prod.low_stock_threshold;

                    return (
                      <tr key={prod.id} className="group hover:bg-stone-900/40 transition-colors">
                        {/* Product Thumbnail & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-stone-800 border border-stone-700 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.main_image ? (
                                <img
                                  src={prod.main_image}
                                  alt={prod.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-stone-600" />
                              )}
                            </div>
                            <div className="font-semibold text-stone-100">{prod.name}</div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-stone-300 font-medium">{prod.sku}</div>
                          <div className="text-[10px] text-stone-500">{prod.category_name}</div>
                        </td>

                        {/* Unit / Coverage */}
                        <td className="py-3.5 px-4 text-stone-300">
                          <div>
                            {prod.sqft_per_box ? `${prod.sqft_per_box} sq.ft / ${prod.unit}` : "—"}
                          </div>
                          {prod.pieces_per_box && (
                            <div className="text-[10px] text-stone-500">
                              {prod.pieces_per_box} pcs per {prod.unit}
                            </div>
                          )}
                        </td>

                        {/* Stock Balance */}
                        <td className="py-3.5 px-4 font-mono font-bold text-sm">
                          <span
                            className={
                              isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"
                            }
                          >
                            {prod.stock_quantity} {prod.unit || "boxes"}
                          </span>
                        </td>

                        {/* Threshold */}
                        <td className="py-3.5 px-4 font-mono text-stone-400">
                          {prod.low_stock_threshold} {prod.unit || "boxes"}
                        </td>

                        {/* Stock Status Badge */}
                        <td className="py-3.5 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/50">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50">
                              <AlertTriangle className="h-3 w-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                              <CheckCircle2 className="h-3 w-3" /> In Stock
                            </span>
                          )}
                        </td>

                        {/* Quick ± Adjustments */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickAdjust(prod, -1)}
                              disabled={prod.stock_quantity <= 0}
                              className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:bg-red-900/60 hover:text-red-300 disabled:opacity-30 transition-colors"
                              title="Reduce 1 box"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(prod, 1)}
                              className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:bg-emerald-900/60 hover:text-emerald-300 transition-colors"
                              title="Add 1 box"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditStock(prod)}
                              className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors ml-1"
                              title="Set Stock / Alert Limit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT STOCK MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">
                Adjust {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Stock Balance ({selectedProduct.unit || "boxes"}) *
                </label>
                <input
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Low Stock Threshold *
                </label>
                <input
                  type="number"
                  required
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-xl border border-stone-700 px-3.5 py-1.5 font-semibold text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-1.5 uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Balances</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
