import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Star,
  Check,
  X,
  Trash2,
  Package,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [{ title: "Reviews Moderation — Mubarak Admin" }],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getReviews();
      if (res.data) {
        setReviews(res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load reviews", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.admin.updateReviewStatus(id, status);
      toast.success(`Review ${status}`);
      loadReviews();
    } catch (err: any) {
      toast.error("Status update failed", { description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.admin.deleteReview(id);
      toast.success("Review deleted");
      loadReviews();
    } catch (err: any) {
      toast.error("Failed to delete review", { description: err.message });
    }
  };

  return (
    <AdminLayout pageTitle="Reviews Moderation">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Moderate product feedback, verify authentic purchases, and approve showcase ratings.
            </p>
          </div>
          <button
            onClick={loadReviews}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Reviews</span>
          </button>
        </div>

        {/* Reviews Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400">Loading Reviews...</span>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Star className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No reviews submitted yet</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-4 font-semibold">Customer</th>
                    <th className="py-3.5 px-4 font-semibold">Rating</th>
                    <th className="py-3.5 px-4 font-semibold">Comment</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-stone-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200">
                          {rev.product_name || `Product #${rev.product_id}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200">{rev.customer_name}</div>
                        <div className="text-[10px] text-stone-500">{rev.customer_email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-700"
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-300 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed">{rev.comment || "—"}</p>
                        <span className="text-[10px] text-stone-500">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            rev.status === "approved"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : rev.status === "rejected"
                              ? "bg-red-950/60 text-red-300 border border-red-800/50"
                              : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rev.status !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, "approved")}
                              className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 hover:bg-emerald-800 border border-emerald-800/60"
                              title="Approve Review"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {rev.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, "rejected")}
                              className="p-1.5 rounded-lg bg-amber-950/60 text-amber-300 hover:bg-amber-800 border border-amber-800/60"
                              title="Reject Review"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(rev.id)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-red-600 hover:text-white"
                            title="Delete Review"
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
    </AdminLayout>
  );
}
