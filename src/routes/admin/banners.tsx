import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [{ title: "Banners & Promotions — Mubarak Admin" }],
  }),
  component: AdminBannersPage,
});

function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    bannerType: "hero",
    sortOrder: "1",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getBanners();
      if (res.data) {
        setBanners(res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load banners", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "/assets/stacked_grey_slabs.png",
      linkUrl: "/products",
      bannerType: "hero",
      sortOrder: "1",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || "",
      subtitle: b.subtitle || "",
      imageUrl: b.image_url || "",
      linkUrl: b.link_url || "",
      bannerType: b.banner_type || "hero",
      sortOrder: String(b.sort_order || 1),
      isActive: Boolean(b.is_active),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder, 10) || 0,
      };

      if (editingBanner) {
        await api.admin.updateBanner(editingBanner.id, payload);
        toast.success("Banner updated");
      } else {
        await api.admin.createBanner(payload);
        toast.success("Banner created");
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      toast.error("Failed to save banner", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await api.admin.deleteBanner(id);
      toast.success("Banner removed");
      loadBanners();
    } catch (err: any) {
      toast.error("Failed to delete banner", { description: err.message });
    }
  };

  return (
    <AdminLayout pageTitle="Banners &amp; Marketing">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Hero &amp; Promotional Banners ({banners.length})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Control showcase photography, campaign headlines, and collection callouts.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>

        {/* Banners Grid */}
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span className="text-xs text-stone-400">Loading Banners...</span>
            </div>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-stone-800 bg-[#161513]">
            <ImageIcon className="mx-auto h-10 w-10 text-stone-600" />
            <div className="text-sm font-semibold text-stone-300">No banners configured</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                {/* Image View */}
                <div className="relative aspect-[16/8] bg-stone-900 overflow-hidden">
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 border border-amber-500/30">
                      {b.banner_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        b.is_active ? "bg-emerald-950/80 text-emerald-400" : "bg-stone-900 text-stone-400"
                      }`}
                    >
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-100 text-sm">{b.title}</h3>
                      {b.subtitle && <p className="text-xs text-stone-400">{b.subtitle}</p>}
                    </div>
                    <span className="text-[10.5px] font-mono text-stone-500 shrink-0">
                      Order #{b.sort_order}
                    </span>
                  </div>

                  {b.link_url && (
                    <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                      <span>{b.link_url}</span>
                    </div>
                  )}

                  <div className="border-t border-stone-800/80 pt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">
                {editingBanner ? "Edit Banner" : "Create Banner"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Timeless Architectural Surfaces"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Ultra-large porcelain slabs for luxury spaces"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/assets/stacked_grey_slabs.png"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Banner Type</label>
                  <select
                    value={formData.bannerType}
                    onChange={(e) => setFormData({ ...formData, bannerType: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="hero">Hero Showcase</option>
                    <option value="promotional">Promotional</option>
                    <option value="featured_banner">Featured</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Call to Action Link</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/products or /catalog"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-stone-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-900 text-amber-600"
                />
                <span>Active on Homepage</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{editingBanner ? "Update" : "Save Banner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
