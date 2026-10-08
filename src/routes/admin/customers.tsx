import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Eye,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  X,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [{ title: "Customers — Mubarak Admin" }],
  }),
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getCustomers({ search });
      if (res.customers) {
        setCustomers(res.customers);
        setTotal(res.total || res.customers.length);
      }
    } catch (err: any) {
      toast.error("Failed to load customers", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenCustomer = async (cust: any) => {
    setLoadingDetail(true);
    setSelectedCustomer(cust);
    try {
      const res: any = await api.admin.getCustomer(cust.id);
      const detail = res.customer || res.data;
      if (detail) {
        setSelectedCustomer(detail);
      }
    } catch (err: any) {
      toast.error("Failed to fetch customer profile", { description: err.message });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <AdminLayout pageTitle="Customers Directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Customers Directory ({total})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Client profiles, purchase volumes, and past delivery destinations.
            </p>
          </div>
          <button
            onClick={loadCustomers}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-[#161513] border border-stone-800 p-3 rounded-2xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCustomers()}
              className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Loading Customers...</span>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No customers found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Customer</th>
                    <th className="py-3.5 px-4 font-semibold">Phone &amp; Location</th>
                    <th className="py-3.5 px-4 font-semibold">Total Orders</th>
                    <th className="py-3.5 px-4 font-semibold">Product Spending (Paid)</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="group hover:bg-stone-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-100">{cust.name}</div>
                        <div className="text-[10.5px] text-stone-500">{cust.email}</div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-300">
                        <div>{cust.mobile || "—"}</div>
                        <div className="text-[10px] text-stone-500">
                          {cust.city ? `${cust.city}, ${cust.state || "KA"}` : "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-stone-200">
                        {cust.total_orders || 0} order(s)
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        ₹{parseFloat(cust.total_product_spending || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            cust.status === "active"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : "bg-stone-800 text-stone-400"
                          }`}
                        >
                          {cust.status || "active"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenCustomer(cust)}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-semibold px-2.5 py-1 text-[11px] transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-800 bg-[#161513] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">
                  Customer Profile
                </span>
                <h3 className="text-lg font-semibold text-stone-100">{selectedCustomer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-400 hover:text-stone-100 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Contact
                  </span>
                  <div className="text-stone-200">{selectedCustomer.email}</div>
                  <div className="text-stone-300">{selectedCustomer.mobile || "No phone recorded"}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Default Shipping Address
                  </span>
                  <div className="text-stone-300 leading-relaxed">
                    {selectedCustomer.address || "No address saved"}
                  </div>
                  {selectedCustomer.city && (
                    <div className="text-stone-400">
                      {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                    Lifetime Orders
                  </span>
                  <span className="text-xl font-bold text-stone-100 font-mono">
                    {selectedCustomer.totalOrders || selectedCustomer.orders?.length || 0}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                    Total Product Spend (Paid)
                  </span>
                  <span className="text-xl font-bold text-amber-300 font-mono">
                    ₹{parseFloat(selectedCustomer.totalSpent || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Order History
                </h4>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="divide-y divide-stone-800/80 rounded-xl border border-stone-800 overflow-hidden">
                    {selectedCustomer.orders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-stone-900/40 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-mono font-semibold text-stone-200">
                            #{ord.order_number}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {new Date(ord.created_at).toLocaleDateString()} · {ord.delivery_partner}{" "}
                            ({ord.delivery_status})
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-300">
                            ₹{parseFloat(ord.product_total).toLocaleString("en-IN")}
                          </span>
                          <Link
                            to="/admin/orders/$id"
                            params={{ id: String(ord.id) }}
                            onClick={() => setSelectedCustomer(null)}
                            className="rounded-lg bg-stone-800 px-2.5 py-1 text-[10.5px] font-semibold text-stone-200 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-stone-500 text-xs italic">No orders found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
