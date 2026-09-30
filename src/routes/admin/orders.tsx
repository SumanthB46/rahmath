import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  Truck,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders Management — Mubarak Admin" }],
  }),
  component: AdminOrdersPage,
});

const ORDER_STATUS_TABS = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getOrders({
        search,
        orderStatus: statusTab !== "all" ? statusTab : undefined,
      });
      if (res.orders) {
        setOrders(res.orders);
        setTotal(res.total || res.orders.length);
      }
    } catch (err: any) {
      toast.error("Failed to load orders", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  return (
    <AdminLayout pageTitle="Orders Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Orders ({total})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Review customer product transactions and assign delivery partners.
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Status Tabs & Search */}
        <div className="space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ORDER_STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  statusTab === tab.id
                    ? "bg-amber-600 text-stone-950 shadow-sm"
                    : "bg-[#161513] text-stone-400 border border-stone-800 hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-[#161513] border border-stone-800 p-2 rounded-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search by Order ID (#MTC-...), customer name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Loading Orders...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No orders found</div>
              <p className="text-xs text-stone-500">
                There are no orders matching the selected status or query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Order ID</th>
                    <th className="py-3.5 px-4 font-semibold">Customer</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Product Amount (Online)</th>
                    <th className="py-3.5 px-4 font-semibold">Order Status</th>
                    <th className="py-3.5 px-4 font-semibold">Delivery Coordination</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="group hover:bg-stone-900/40 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-200">
                          #{ord.order_number}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {ord.item_count || 1} item(s)
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200">{ord.customer_name}</div>
                        <div className="text-[10.5px] text-stone-400">{ord.customer_phone}</div>
                        <div className="text-[10px] text-stone-500 truncate max-w-[180px]">
                          {ord.customer_email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-stone-400">
                        <div>{new Date(ord.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {new Date(ord.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Product Amount & Payment */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-100 text-sm">
                          ₹{parseFloat(ord.product_total).toLocaleString("en-IN")}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Product {ord.product_payment_status.toUpperCase()}</span>
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-semibold capitalize ${
                            ord.order_status === "completed"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : ord.order_status === "processing"
                              ? "bg-blue-950/60 text-blue-300 border border-blue-800/50"
                              : ord.order_status === "cancelled"
                              ? "bg-red-950/60 text-red-300 border border-red-800/50"
                              : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>

                      {/* Delivery Status & Partner */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200 capitalize">
                          {ord.delivery_partner} (₹{parseFloat(ord.delivery_charge || 0).toLocaleString("en-IN")})
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-stone-400 capitalize">
                            Status: {ord.delivery_status}
                          </span>
                          <span className="text-stone-600">·</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              ord.delivery_payment_status === "paid"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            Charge {ord.delivery_payment_status}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/admin/orders/$id"
                          params={{ id: String(ord.id) }}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-3 py-1.5 text-xs transition-colors shadow-xs"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
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
