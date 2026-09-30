import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/delivery")({
  head: () => ({
    meta: [{ title: "Delivery Desk — Mubarak Admin" }],
  }),
  component: AdminDeliveryPage,
});

const PARTNERS = [
  { id: "all", name: "All Partners" },
  { id: "porter", name: "Porter" },
  { id: "vrl", name: "VRL Logistics" },
  { id: "dart", name: "DART Express" },
  { id: "bus", name: "Bus / Transport" },
  { id: "local", name: "Local Delivery" },
  { id: "pickup", name: "Customer Pickup" },
  { id: "other", name: "Other Cargo" },
];

const DELIVERY_STATUSES = [
  "all",
  "pending",
  "assigned",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
  "cancelled",
];

function AdminDeliveryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Quick edit delivery modal
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [editCharge, setEditCharge] = useState("");
  const [editPartner, setEditPartner] = useState("porter");
  const [editStatus, setEditStatus] = useState("pending");
  const [editTracking, setEditTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getOrders({
        search,
        deliveryPartner: partnerFilter !== "all" ? partnerFilter : undefined,
        deliveryStatus: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (res.orders) {
        let filtered = res.orders;
        if (paymentStatusFilter !== "all") {
          filtered = filtered.filter((o: any) => o.delivery_payment_status === paymentStatusFilter);
        }
        setDeliveries(filtered);
        setTotal(filtered.length);
      }
    } catch (err: any) {
      toast.error("Failed to load delivery list", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [partnerFilter, statusFilter, paymentStatusFilter]);

  const handleOpenEdit = (del: any) => {
    setSelectedDelivery(del);
    setEditPartner(del.delivery_partner || "porter");
    setEditCharge(String(del.delivery_charge || 0));
    setEditStatus(del.delivery_status || "pending");
    setEditTracking(del.tracking_number || "");
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    setSaving(true);
    try {
      await api.admin.updateDeliveryDetails(selectedDelivery.id, {
        deliveryPartner: editPartner,
        deliveryCharge: parseFloat(editCharge) || 0,
        deliveryStatus: editStatus,
        trackingNumber: editTracking || null,
      });
      toast.success("Delivery details updated");
      setSelectedDelivery(null);
      loadDeliveries();
    } catch (err: any) {
      toast.error("Update failed", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (delId: number) => {
    try {
      await api.admin.markDeliveryPaymentPaid(delId, "Quick marked as paid via Delivery Desk");
      toast.success("Delivery payment marked as PAID");
      loadDeliveries();
    } catch (err: any) {
      toast.error("Failed to mark paid", { description: err.message });
    }
  };

  return (
    <AdminLayout pageTitle="Delivery Coordination Desk">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Manual Delivery Desk ({total})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Coordinate Porter, VRL, DART, and local bus logistics. Set charges and track reconciliation.
            </p>
          </div>
          <button
            onClick={loadDeliveries}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Deliveries</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#161513] border border-stone-800 p-4 rounded-2xl text-xs">
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search by order #, customer, tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadDeliveries()}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
            >
              {PARTNERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
            >
              {DELIVERY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Charges</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Loading Deliveries...</span>
              </div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Truck className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No deliveries found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Order</th>
                    <th className="py-3.5 px-4 font-semibold">Customer &amp; City</th>
                    <th className="py-3.5 px-4 font-semibold">Partner Mode</th>
                    <th className="py-3.5 px-4 font-semibold">Delivery Charge</th>
                    <th className="py-3.5 px-4 font-semibold">Charge Payment</th>
                    <th className="py-3.5 px-4 font-semibold">Transit Status</th>
                    <th className="py-3.5 px-4 font-semibold">Tracking / LR</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {deliveries.map((del) => (
                    <tr key={del.id} className="group hover:bg-stone-900/40 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4">
                        <Link
                          to="/admin/orders/$id"
                          params={{ id: String(del.id) }}
                          className="font-mono font-bold text-amber-400 hover:underline"
                        >
                          #{del.order_number}
                        </Link>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Product: ₹{parseFloat(del.product_total).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200">{del.customer_name}</div>
                        <div className="text-[10.5px] text-stone-400">
                          {del.shipping_city || "Bengaluru"}, {del.shipping_state || "KA"}
                        </div>
                      </td>

                      {/* Partner Mode */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-100 capitalize">
                          {del.delivery_partner}
                          {del.delivery_partner_name && (
                            <span className="text-stone-400 text-[10px] block">
                              ({del.delivery_partner_name})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delivery Charge */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-100">
                        ₹{parseFloat(del.delivery_charge || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Delivery Payment Status */}
                      <td className="py-3.5 px-4">
                        {del.delivery_payment_status === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PAID</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(del.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/60 hover:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-800/50 transition-colors"
                            title="Click to mark delivery charge as paid"
                          >
                            <Clock className="h-3 w-3" />
                            <span>PENDING (Mark Paid)</span>
                          </button>
                        )}
                      </td>

                      {/* Transit Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            del.delivery_status === "delivered"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : del.delivery_status === "in_transit" || del.delivery_status === "dispatched"
                              ? "bg-blue-950/60 text-blue-300 border border-blue-800/50"
                              : "bg-stone-800 text-stone-400 border border-stone-700"
                          }`}
                        >
                          {del.delivery_status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Tracking / LR */}
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {del.tracking_number || "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(del)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-blue-600 hover:text-white transition-colors"
                            title="Edit Delivery"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            to="/admin/orders/$id"
                            params={{ id: String(del.id) }}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                            title="Open Full Order"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
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

      {/* QUICK EDIT MODAL */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-stone-100">
                Edit Delivery #{selectedDelivery.order_number}
              </h3>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Delivery Partner *
                </label>
                <select
                  value={editPartner}
                  onChange={(e) => setEditPartner(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
                >
                  {PARTNERS.filter((p) => p.id !== "all").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Delivery Charge (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editCharge}
                  onChange={(e) => setEditCharge(e.target.value)}
                  placeholder="500.00"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Transit Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
                >
                  {DELIVERY_STATUSES.filter((st) => st !== "all").map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Tracking / Reference # (Optional)
                </label>
                <input
                  type="text"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="PRT-8821"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDelivery(null)}
                  className="rounded-xl border border-stone-700 px-3.5 py-1.5 font-semibold text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
