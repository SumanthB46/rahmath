import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Percent,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/discounts")({
  head: () => ({
    meta: [{ title: "Discounts & Coupons — Mubarak Admin" }],
  }),
  component: AdminDiscountsPage,
});

function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "0",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getCoupons();
      if (res.data) {
        setCoupons(res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load coupons", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "10",
      minOrderValue: "5000",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || "",
      discountType: c.discount_type || "percentage",
      discountValue: String(c.discount_value || 0),
      minOrderValue: String(c.min_order_value || 0),
      startDate: c.start_date ? c.start_date.split("T")[0] : "",
      endDate: c.end_date ? c.end_date.split("T")[0] : "",
      isActive: Boolean(c.is_active),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue) || 0,
      };

      if (editingCoupon) {
        await api.admin.updateCoupon(editingCoupon.id, payload);
        toast.success("Coupon updated");
      } else {
        await api.admin.createCoupon(payload);
        toast.success("Coupon created");
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      toast.error("Failed to save coupon", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon code?")) return;
    try {
      await api.admin.deleteCoupon(id);
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (err: any) {
      toast.error("Failed to delete coupon", { description: err.message });
    }
  };

  return (
    <AdminLayout pageTitle="Discounts &amp; Coupons">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Promotional Coupons ({coupons.length})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Create and manage percentage and fixed discount codes applied at checkout.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>

        {/* Coupons List */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400">Loading Discounts...</span>
              </div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Tag className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No discount coupons</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Coupon Code</th>
                    <th className="py-3.5 px-4 font-semibold">Discount</th>
                    <th className="py-3.5 px-4 font-semibold">Min Order Value</th>
                    <th className="py-3.5 px-4 font-semibold">Validity</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-100 font-mono">
                        {c.discount_type === "percentage"
                          ? `${c.discount_value}% OFF`
                          : `₹${parseFloat(c.discount_value).toLocaleString("en-IN")} FLAT`}
                      </td>

                      <td className="py-3.5 px-4 text-stone-300 font-mono">
                        ₹{parseFloat(c.min_order_value || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-stone-400">
                        {c.start_date || c.end_date ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Calendar className="h-3.5 w-3.5 text-stone-500" />
                            <span>
                              {c.start_date ? new Date(c.start_date).toLocaleDateString() : "Any"} -{" "}
                              {c.end_date ? new Date(c.end_date).toLocaleDateString() : "Ongoing"}
                            </span>
                          </div>
                        ) : (
                          "Always Valid"
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            c.is_active
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : "bg-stone-800 text-stone-400"
                          }`}
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-red-600 hover:text-white transition-colors"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">
                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. FESTIVE10"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="10 or 500"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="5000"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-stone-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-900 text-amber-600"
                />
                <span>Active Coupon</span>
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
                  <span>{editingCoupon ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
