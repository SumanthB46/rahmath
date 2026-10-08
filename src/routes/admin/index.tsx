import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  Users,
  Truck,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — Mubarak Admin" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res: any = await api.admin.getDashboardStats();
      if (res.data) {
        setData(res.data);
      } else if (res.stats) {
        setData({
          stats: res.stats,
          recentOrders: res.stats.recent_orders || [],
          lowStockList: res.stats.low_stock_products || [],
        });
      }
      if (isManual) toast.success("Dashboard refreshed");
    } catch (err: any) {
      toast.error("Failed to load dashboard metrics", { description: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockList = data?.lowStockList || [];

  return (
    <AdminLayout pageTitle="Dashboard Overview">
      <div className="space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Operations &amp; Sales Overview
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Live metrics across product revenue, order processing, and manual delivery coordination.
            </p>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-stone-800 bg-[#161513]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span className="text-xs text-stone-400 font-mono">Loading Dashboard Metrics...</span>
            </div>
          </div>
        ) : (
          <>
            {/* PRIMARY KPI METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Product Sales Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#161513] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Product Sales (Paid)
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                    ₹{(stats.totalProductSales || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>₹{(stats.todayProductSales || 0).toLocaleString("en-IN")} today</span>
                  </div>
                </div>
                <div className="text-[10px] text-stone-500 border-t border-stone-800/80 pt-2">
                  * Excludes delivery charges (reconciled separately)
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#161513] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Total Orders
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                    {stats.totalOrders || 0}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-400">
                    {stats.todayOrders || 0} placed today
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-800/80 pt-2">
                  <span>Processing: {stats.processingOrders || 0}</span>
                  <span>Delivered: {stats.deliveredOrders || 0}</span>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#161513] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Pending Orders
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                    {stats.pendingOrders || 0}
                  </div>
                  <div className="mt-1 text-[11px] text-amber-400/80">
                    Requires admin confirmation
                  </div>
                </div>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 border-t border-stone-800/80 pt-2"
                >
                  Manage orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Low Stock Alert Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#161513] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Low Stock Products
                  </span>
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-red-300">
                    {stats.lowStockProducts || 0}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-400">
                    Out of {stats.totalProducts || 0} active catalog items
                  </div>
                </div>
                <Link
                  to="/admin/inventory"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 border-t border-stone-800/80 pt-2"
                >
                  Adjust inventory <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* SEPARATE DELIVERY LOGISTICS BANNER */}
            <div className="rounded-2xl border border-stone-800 bg-gradient-to-r from-[#181614] to-[#1F1C18] p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-stone-100">
                        Manual Delivery Logistics &amp; Reconciliation
                      </h3>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                        Porter · VRL · DART · Bus · Local
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 max-w-2xl">
                      Delivery charges are determined post-order by the admin and paid separately by the customer to the delivery partner or store.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8 bg-stone-900/90 border border-stone-800 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Pending Collection
                    </span>
                    <span className="text-lg font-bold text-amber-300 font-mono">
                      ₹{(stats.deliveryChargesPending || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-stone-800" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">
                      Collected &amp; Verified
                    </span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      ₹{(stats.deliveryChargesCollected || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Link
                    to="/admin/delivery"
                    className="w-full sm:w-auto text-center rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-3.5 py-1.5 text-xs transition-colors shadow-xs ml-auto"
                  >
                    Open Delivery Desk
                  </Link>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN LOWER SECTION: RECENT ORDERS & LOW STOCK LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Recent Orders (8 Cols) */}
              <div className="lg:col-span-8 rounded-2xl border border-stone-800 bg-[#161513] p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Recent Orders</h3>
                    <p className="text-xs text-stone-500">Latest customer transactions</p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    View all orders <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-500">
                    No orders recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[620px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-800 text-[10.5px] uppercase tracking-wider text-stone-500">
                          <th className="pb-3 font-semibold">Order</th>
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Product Amount</th>
                          <th className="pb-3 font-semibold">Order Status</th>
                          <th className="pb-3 font-semibold">Delivery</th>
                          <th className="pb-3 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {recentOrders.map((ord: any) => (
                          <tr key={ord.id} className="group hover:bg-stone-900/40 transition-colors">
                            <td className="py-3 font-mono font-medium text-stone-200">
                              #{ord.order_number}
                            </td>
                            <td className="py-3">
                              <div className="font-medium text-stone-200">{ord.customer_name}</div>
                              <div className="text-[10px] text-stone-500">{ord.customer_email}</div>
                            </td>
                            <td className="py-3">
                              <div className="font-bold text-stone-100 font-mono">
                                ₹{parseFloat(ord.product_total).toLocaleString("en-IN")}
                              </div>
                              <span className="inline-block text-[9.5px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                Product Paid
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                  ord.order_status === "completed"
                                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                                    : ord.order_status === "processing"
                                    ? "bg-blue-950/60 text-blue-300 border border-blue-800/50"
                                    : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                                }`}
                              >
                                {ord.order_status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="capitalize text-stone-300 font-medium">
                                {ord.delivery_partner} (₹{ord.delivery_charge || 0})
                              </div>
                              <span
                                className={`inline-block text-[9.5px] font-semibold ${
                                  ord.delivery_payment_status === "paid"
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}
                              >
                                Delivery {ord.delivery_payment_status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                to="/admin/orders/$id"
                                params={{ id: String(ord.id) }}
                                className="rounded-lg bg-stone-800 px-2.5 py-1 text-[11px] font-semibold text-stone-300 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right: Low Stock Alert Items (4 Cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Stock Alerts</h3>
                    <p className="text-xs text-stone-500">Products near or below threshold</p>
                  </div>
                  <Link
                    to="/admin/inventory"
                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    Inventory →
                  </Link>
                </div>

                {lowStockList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    All products are adequately stocked.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {lowStockList.map((item: any) => (
                      <li
                        key={item.id}
                        className="p-3 rounded-xl border border-stone-800/80 bg-stone-900/60 flex items-center justify-between gap-3"
                      >
                        <div className="overflow-hidden">
                          <div className="font-semibold text-stone-200 text-xs truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">{item.sku}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block font-mono font-bold text-xs ${
                              item.stock_quantity === 0 ? "text-red-400" : "text-amber-400"
                            }`}
                          >
                            {item.stock_quantity} {item.unit || "boxes"}
                          </span>
                          <div className="text-[9.5px] text-stone-500">
                            Limit: {item.low_stock_threshold}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
