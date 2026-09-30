import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [{ title: "Categories & Subcategories — Mubarak Admin" }],
  }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  // Subcategory Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedParentCatId, setSelectedParentCatId] = useState<number | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    slug: "",
    isActive: true,
  });

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "subcategory"; id: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCategories();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      toast.error("Failed to load categories", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      image: "/assets/stacked_grey_slabs.png",
      isActive: true,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      isActive: Boolean(cat.is_active),
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory.id, categoryForm);
        toast.success("Category updated");
      } else {
        await api.admin.createCategory(categoryForm);
        toast.success("Category created");
      }
      setIsCategoryModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error("Failed to save category", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddSubcategory = (catId: number) => {
    setSelectedParentCatId(catId);
    setEditingSubcategory(null);
    setSubcategoryForm({ name: "", slug: "", isActive: true });
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentCatId) return;
    setSaving(true);
    try {
      if (editingSubcategory) {
        await api.admin.updateSubcategory(editingSubcategory.id, subcategoryForm);
        toast.success("Subcategory updated");
      } else {
        await api.admin.createSubcategory({
          ...subcategoryForm,
          categoryId: selectedParentCatId,
        });
        toast.success("Subcategory created");
      }
      setIsSubModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error("Failed to save subcategory", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "category") {
        await api.admin.deleteCategory(deleteConfirm.id);
        toast.success("Category deleted");
      } else {
        await api.admin.deleteSubcategory(deleteConfirm.id);
        toast.success("Subcategory deleted");
      }
      setDeleteConfirm(null);
      loadCategories();
    } catch (err: any) {
      toast.error("Deletion failed", { description: err.message });
      setDeleteConfirm(null);
    }
  };

  return (
    <AdminLayout pageTitle="Categories &amp; Subcategories">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Classification Hierarchy ({categories.length})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Organize tiles, natural marble, sintered stone, and sanitaryware sub-classifications.
            </p>
          </div>
          <button
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        {/* Categories Grid / Cards */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-stone-800 bg-[#161513]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span className="text-xs text-stone-400 font-mono">Loading Categories...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-stone-800 bg-[#161513]">
            <FolderTree className="mx-auto h-10 w-10 text-stone-600" />
            <div className="text-sm font-semibold text-stone-300">No categories found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-[#E2DBD0] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-600/30 transition-colors"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-stone-100 border border-[#E2DBD0] overflow-hidden flex items-center justify-center shrink-0">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                      ) : (
                        <FolderTree className="h-6 w-6 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{cat.name}</h3>
                      <div className="text-[11px] font-mono text-stone-500">/{cat.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-1.5 rounded-lg border border-[#E2DBD0] bg-[#FAF8F5] text-stone-600 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: "category", id: cat.id })}
                      className="p-1.5 rounded-lg border border-[#E2DBD0] bg-[#FAF8F5] text-stone-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-stone-600 leading-relaxed">{cat.description}</p>
                )}

                {/* Subcategories Container */}
                <div className="rounded-xl border border-[#E2DBD0] bg-[#FAF8F5] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-700" />
                      <span>Subcategories ({cat.subcategories?.length || 0})</span>
                    </span>
                    <button
                      onClick={() => handleOpenAddSubcategory(cat.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-bold uppercase tracking-wide bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300/70 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Sub
                    </button>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DBD0] bg-white px-2.5 py-1 text-xs font-medium text-stone-800 shadow-2xs hover:border-amber-400/80 transition-colors"
                        >
                          <span>{sub.name}</span>
                          <button
                            onClick={() => setDeleteConfirm({ type: "subcategory", id: sub.id })}
                            className="text-stone-400 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-red-50 cursor-pointer"
                            title="Remove subcategory"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-500 italic">No subcategories created.</div>
                  )}
                </div>

                {/* Footer Count */}
                <div className="border-t border-[#E2DBD0] pt-3 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-stone-500" />
                    <span>{cat.product_count || 0} product(s) linked</span>
                  </span>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      cat.is_active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    }`}
                  >
                    {cat.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Floor Tiles"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="floor-tiles"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <ImageUploadZone
                  value={categoryForm.image}
                  onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
                  label="Category Cover Image"
                  helperText="Drag & drop category visual, or choose from presets below"
                />

                {/* Quick Image Preset Selector */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">
                    Or select a luxury surface preset:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Living / Floor", src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
                      { label: "Bathroom", src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
                      { label: "Kitchen", src: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
                      { label: "Outdoor", src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
                      { label: "Slabs / Stone", src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" },
                      { label: "Wall & Elevation", src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
                      { label: "Sanitaryware", src: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80" },
                      { label: "Marble", src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, image: preset.src })}
                        className={`text-[10px] p-1.5 rounded-lg border text-left transition-all truncate ${
                          categoryForm.image === preset.src
                            ? "border-amber-500 bg-amber-500/10 text-amber-800 font-semibold"
                            : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400 hover:text-stone-900"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  placeholder="Category purpose and applications..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
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
                  <span>{editingCategory ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">Add Subcategory</h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="e.g. Bathroom Wall Tiles"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
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
                  <span>Save Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-100">Delete Confirmation</h4>
                <p className="text-xs text-stone-400">
                  Are you sure you want to delete this {deleteConfirm.type}? Categories with assigned products cannot be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-stone-700 px-3.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 text-xs shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
