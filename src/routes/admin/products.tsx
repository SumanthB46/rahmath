import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Layers,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import api, { uploadImage } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "Products Management — Mubarak Admin" }],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingExtraIndex, setUploadingExtraIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    sku: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    price: "",
    discountPrice: "",
    description: "",
    mainImage: "",
    extraImages: ["", "", "", ""],
    size: "",
    color: "",
    finish: "",
    material: "",
    thickness: "",
    piecesPerBox: "",
    sqftPerBox: "",
    stockQuantity: "0",
    unit: "box",
    lowStockThreshold: "10",
    isFeatured: false,
    isNewArrival: false,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes]: any = await Promise.all([
        api.admin.getProducts({
          search,
          categoryId: selectedCategory || undefined,
          stockStatus: stockStatus !== "all" ? stockStatus : undefined,
        }),
        api.admin.getCategories(),
      ]);

      if (prodsRes.products) {
        setProducts(prodsRes.products);
        setTotal(prodsRes.total || prodsRes.products.length);
      }
      const catList = catsRes.categories || catsRes.data;
      if (Array.isArray(catList)) {
        setCategories(catList);
      }
    } catch (err: any) {
      toast.error("Failed to load products", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `MTC-TL-${String(Math.floor(100 + Math.random() * 900))}`,
      categoryId: categories[0]?.id || "",
      subcategoryId: "",
      brand: "Mubarak Studio",
      price: "",
      discountPrice: "",
      description: "",
      mainImage: "/assets/stacked_grey_slabs.png",
      extraImages: ["", "", "", ""],
      size: "60x120 cm",
      color: "Grey",
      finish: "Matte",
      material: "Glazed Vitrified Porcelain",
      thickness: "9mm",
      piecesPerBox: "2",
      sqftPerBox: "15.5",
      stockQuantity: "100",
      unit: "box",
      lowStockThreshold: "10",
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    const rawImages = Array.isArray(prod.images) ? prod.images : [];
    const mainImg = prod.main_image || rawImages[0] || "";
    const remaining = rawImages.length > 0 && rawImages[0] === mainImg
      ? rawImages.slice(1)
      : rawImages.filter((img: string) => img !== mainImg);

    setFormData({
      name: prod.name || "",
      sku: prod.sku || "",
      categoryId: prod.category_id || "",
      subcategoryId: prod.subcategory_id || "",
      brand: prod.brand || "",
      price: prod.price || "",
      discountPrice: prod.discount_price || "",
      description: prod.description || "",
      mainImage: mainImg,
      extraImages: [
        remaining[0] || "",
        remaining[1] || "",
        remaining[2] || "",
        remaining[3] || "",
      ],
      size: prod.size || "",
      color: prod.color || "",
      finish: prod.finish || "",
      material: prod.material || "",
      thickness: prod.thickness || "",
      piecesPerBox: prod.pieces_per_box !== null ? String(prod.pieces_per_box) : "",
      sqftPerBox: prod.sqft_per_box !== null ? String(prod.sqft_per_box) : "",
      stockQuantity: String(prod.stock_quantity || 0),
      unit: prod.unit || "box",
      lowStockThreshold: String(prod.low_stock_threshold || 10),
      isFeatured: Boolean(prod.is_featured),
      isNewArrival: Boolean(prod.is_new_arrival),
      isActive: Boolean(prod.is_active),
    });
    setIsModalOpen(true);
  };

  const handleExtraFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format", { description: "Please select an image file (PNG, JPG, WEBP)" });
      return;
    }

    setUploadingExtraIndex(index);
    try {
      const res = await uploadImage(file);
      if (res?.url) {
        const nextExtras = [...(formData.extraImages || ["", "", "", ""])];
        nextExtras[index] = res.url;
        setFormData((prev: any) => ({ ...prev, extraImages: nextExtras }));
        toast.success(`Gallery photo ${index + 1} uploaded`);
      }
    } catch (err: any) {
      toast.error("Image upload failed", { description: err.message || "Could not upload image" });
    } finally {
      setUploadingExtraIndex(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveExtraImage = (index: number) => {
    const nextExtras = [...(formData.extraImages || ["", "", "", ""])];
    nextExtras[index] = "";
    setFormData((prev: any) => ({ ...prev, extraImages: nextExtras }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const combinedImages = [
        formData.mainImage,
        ...(formData.extraImages || []).filter(Boolean),
      ].filter(Boolean);

      const payload = {
        ...formData,
        images: combinedImages,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        piecesPerBox: formData.piecesPerBox ? parseInt(formData.piecesPerBox, 10) : null,
        sqftPerBox: formData.sqftPerBox ? parseFloat(formData.sqftPerBox) : null,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId, 10) : null,
      };

      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await api.admin.createProduct(payload);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save product", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (prod: any) => {
    try {
      const newStatus = !prod.is_active;
      await api.admin.toggleProductStatus(prod.id, newStatus);
      toast.success(`Product ${newStatus ? "Activated" : "Deactivated"}`);
      loadData();
    } catch (err: any) {
      toast.error("Status update failed", { description: err.message });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await api.admin.deleteProduct(id);
      toast.success("Product deleted successfully");
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      toast.error("Cannot delete product", { description: err.message });
      setDeleteConfirmId(null);
    }
  };

  return (
    <AdminLayout pageTitle="Products Management">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Product Catalog ({total})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Manage tile specs, porcelain surface slabs, sanitaryware basins, and box inventory.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#161513] border border-stone-800 p-4 rounded-2xl">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search by product name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </form>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="sm:col-span-3">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; Threshold)</option>
              <option value="low_stock">Low Stock (≤ Limit)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Loading Products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Package className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No products found</div>
              <p className="text-xs text-stone-500">
                Try adjusting your search criteria or add your first tile/ceramic product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-4 font-semibold">SKU &amp; Category</th>
                    <th className="py-3.5 px-4 font-semibold">Tile / Surface Specs</th>
                    <th className="py-3.5 px-4 font-semibold">Price</th>
                    <th className="py-3.5 px-4 font-semibold">Stock (Boxes)</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {products.map((prod) => (
                    <tr key={prod.id} className="group hover:bg-stone-900/40 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-stone-800 border border-stone-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.main_image ? (
                              <img
                                src={prod.main_image}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-stone-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-100">{prod.name}</div>
                            <div className="text-[10px] text-stone-400">{prod.brand || "Mubarak"}</div>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-stone-300 font-medium">{prod.sku}</div>
                        <div className="text-[10px] text-amber-500/90 font-medium">
                          {prod.category_name || "Uncategorized"}
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-stone-300">
                          {prod.size ? `${prod.size}` : "Standard"} · {prod.finish || "Matte"}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {prod.sqft_per_box ? `${prod.sqft_per_box} sq.ft/box` : ""}
                          {prod.pieces_per_box ? ` (${prod.pieces_per_box} pcs)` : ""}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-100 font-mono">
                          ₹{parseFloat(prod.price).toLocaleString("en-IN")}
                        </div>
                        {prod.discount_price && (
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Offer: ₹{parseFloat(prod.discount_price).toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold ${
                            prod.stock_quantity === 0
                              ? "text-red-400"
                              : prod.stock_quantity <= prod.low_stock_threshold
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {prod.stock_quantity} {prod.unit || "boxes"}
                        </span>
                        <div className="text-[9.5px] text-stone-500">
                          Limit: {prod.low_stock_threshold || 10}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                            prod.is_active
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60"
                              : "bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700"
                          }`}
                        >
                          {prod.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-red-600 hover:text-white transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-stone-800 bg-[#161513] p-4 sm:p-7 shadow-2xl my-auto max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-lg font-semibold text-stone-100">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 overflow-y-auto pr-1 flex-1 mt-4">
              {/* SECTION: BASIC INFO */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  01. Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. UniTerra Porcelain Slab"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="MTC-TL-001"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: "" })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Subcategory (Optional)
                    </label>
                    <select
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">None / General</option>
                      {categories
                        .find((c) => String(c.id) === String(formData.categoryId))
                        ?.subcategories?.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Eternity / Mubarak Studio"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="3500.00"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Discounted Offer Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      placeholder="3100.00"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <ImageUploadZone
                    value={formData.mainImage}
                    onChange={(url) => setFormData({ ...formData, mainImage: url })}
                    label="Main Product Image"
                    helperText="Drag & drop product picture or slab render here, or click to browse (PNG, JPG, WEBP)"
                  />
                </div>

                {/* ADDITIONAL GALLERY IMAGES (Up to 4 Extra Photos) */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium text-stone-400">
                      Additional Gallery Images (Optional 3–4 extra angles, close-ups, room scenes)
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {(formData.extraImages || []).filter(Boolean).length}/4 added
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((index) => {
                      const imgUrl = formData.extraImages?.[index] || "";
                      const isUploading = uploadingExtraIndex === index;

                      return (
                        <div
                          key={index}
                          className="relative aspect-square rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/60 overflow-hidden flex flex-col items-center justify-center group hover:border-amber-500 transition-colors"
                        >
                          {imgUrl ? (
                            <>
                              <img
                                src={imgUrl}
                                alt={`Gallery view ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraImage(index)}
                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-stone-950/80 hover:bg-red-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-stone-950/80 text-[9px] font-mono text-stone-300">
                                View {index + 1}
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-stone-400 hover:text-amber-400 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => handleExtraFileSelect(e, index)}
                              />
                              {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                              ) : (
                                <>
                                  <div className="h-8 w-8 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-amber-400 group-hover:bg-stone-800/80 transition-all">
                                    <Plus className="h-4 w-4" />
                                  </div>
                                  <span className="text-[10px] font-medium text-stone-400 group-hover:text-amber-300 text-center">
                                    + Extra Photo {index + 1}
                                  </span>
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe tile surface, finish, and architecture recommendations..."
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION: TILE & CERAMIC SPECIFICATIONS */}
              <div className="border-t border-stone-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  02. Tile &amp; Surface Specifications (Optional for sanitaryware)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="60x120 cm"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Graphite Grey"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Finish</label>
                    <input
                      type="text"
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      placeholder="Matte / Glossy"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Thickness</label>
                    <input
                      type="text"
                      value={formData.thickness}
                      onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                      placeholder="9mm / 12mm"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="Vitrified Porcelain"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Pieces / Box</label>
                    <input
                      type="number"
                      value={formData.piecesPerBox}
                      onChange={(e) => setFormData({ ...formData, piecesPerBox: e.target.value })}
                      placeholder="2"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Sq.ft / Box</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sqftPerBox}
                      onChange={(e) => setFormData({ ...formData, sqftPerBox: e.target.value })}
                      placeholder="15.5"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Unit Type</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="box">box</option>
                      <option value="piece">piece</option>
                      <option value="slab">slab</option>
                      <option value="sqft">sqft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: INVENTORY & FLAGS */}
              <div className="border-t border-stone-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  03. Inventory &amp; Visibility Flags
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Stock Quantity ({formData.unit}es) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="120"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">
                      Low Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      placeholder="10"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Featured in Showcase</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500"
                    />
                    <span>New Arrival Badge</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Active (Visible on website)</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="border-t border-stone-800 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-700 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-5 py-2 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-100">Delete Product Confirmation</h4>
                <p className="text-xs text-stone-400">
                  Are you sure you want to permanently delete this product? If historical orders contain this product, the system will prevent deletion to preserve order records.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-stone-700 px-3.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 text-xs shadow-md"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
