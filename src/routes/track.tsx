import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [{ title: "Track Your Order — Mubarak Tiles & Ceramics" }],
  }),
  component: CustomerTrackOrderPage,
});

function CustomerTrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res: any = await api.orders.track(orderQuery.trim());
      if (res.data) {
        setOrderData(res.data);
      } else {
        setOrderData(null);
      }
    } catch (err: any) {
      setOrderData(null);
      toast.error("Order not found", {
        description: "Please check your order number (e.g. MTC-2026-00101)",
      });
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { key: "confirmed", label: "Order Confirmed" },
    { key: "processing", label: "Studio Packing & Quality Check" },
    { key: "in_transit", label: "Dispatched / In Transit" },
    { key: "delivered", label: "Delivered to Site" },
  ];

  const getStepStatus = (stepKey: string, ord: any) => {
    const delStatus = ord.delivery_status;
    const ordStatus = ord.order_status;

    if (delStatus === "delivered" || ordStatus === "completed") return "completed";

    if (stepKey === "confirmed") return "completed";
    if (stepKey === "processing") {
      return ordStatus === "processing" || delStatus === "dispatched" || delStatus === "in_transit"
        ? "completed"
        : "pending";
    }
    if (stepKey === "in_transit") {
      return delStatus === "in_transit" || delStatus === "dispatched" || delStatus === "out_for_delivery"
        ? "current"
        : "pending";
    }
    if (stepKey === "delivered") {
      return delStatus === "delivered" ? "completed" : "pending";
    }
    return "pending";
  };

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-stone-100 flex flex-col justify-between selection:bg-amber-500/30">
      <GlassNav />

      <main className="pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8 flex-1">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Live Dispatch Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100">
            Track Your Consignment
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Enter your order number from your confirmation message or receipt.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-stone-500" />
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. MTC-2026-00101"
              className="w-full rounded-2xl border border-stone-700/80 bg-stone-900/90 py-3.5 pl-11 pr-32 text-xs sm:text-sm font-mono text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none shadow-xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md active:scale-95"
            >
              {loading ? "Searching..." : "Track"}
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </form>

        {/* Order Details Display */}
        {orderData && (
          <div className="rounded-3xl border border-stone-800 bg-[#161513] p-6 sm:p-8 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Order Status
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  Order #{orderData.order_number}
                </h2>
                <p className="text-xs text-stone-400">
                  Placed on {new Date(orderData.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10.5px] uppercase tracking-wider text-stone-400 font-medium block">
                  Product Total (Online Paid)
                </span>
                <span className="text-xl font-bold text-amber-300 font-mono">
                  ₹{parseFloat(orderData.product_total).toLocaleString("en-IN")}
                </span>
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-emerald-400 font-medium mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>PAID ONLINE</span>
                </div>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Delivery Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {STEPS.map((step, idx) => {
                  const status = getStepStatus(step.key, orderData);
                  const isDone = status === "completed";
                  const isCurrent = status === "current";

                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                          : isCurrent
                          ? "bg-amber-950/40 border-amber-700/60 text-amber-300 shadow-md ring-1 ring-amber-500/20"
                          : "bg-stone-900/40 border-stone-800/80 text-stone-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? "bg-emerald-600 text-stone-950"
                              : isCurrent
                              ? "bg-amber-500 text-stone-950"
                              : "bg-stone-800 text-stone-400"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                          Step 0{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs font-semibold">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2 Cards: Delivery Terms & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Delivery Details */}
              <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-stone-300 font-semibold uppercase tracking-wider text-[11px]">
                  <Truck className="h-4 w-4 text-amber-400" />
                  <span>Delivery Logistics</span>
                </div>
                <div className="space-y-1.5 text-stone-300">
                  <div>
                    Partner Mode:{" "}
                    <span className="font-semibold text-stone-100 capitalize">
                      {orderData.delivery_partner}
                      {orderData.delivery_partner_name && ` (${orderData.delivery_partner_name})`}
                    </span>
                  </div>
                  <div>
                    Delivery Charge:{" "}
                    <span className="font-mono font-bold text-amber-300">
                      ₹{parseFloat(orderData.delivery_charge || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Payment:{" "}
                    <span className="text-stone-200">
                      {orderData.delivery_payment_method || "Customer Pays Delivery Partner"}
                    </span>
                  </div>
                  {orderData.tracking_number && (
                    <div className="font-mono text-[11px] text-amber-400">
                      Tracking / LR #: {orderData.tracking_number}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-stone-300 font-semibold uppercase tracking-wider text-[11px]">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <span>Destination Site</span>
                </div>
                <div className="space-y-1 text-stone-300">
                  <div className="font-semibold text-stone-100">{orderData.customer_name}</div>
                  <p className="text-stone-400 leading-relaxed">{orderData.shipping_address}</p>
                  <div className="text-stone-400">
                    {orderData.shipping_city}, {orderData.shipping_state} -{" "}
                    {orderData.shipping_pincode}
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Products Snapshot */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-400" />
                <span>Ordered Tiles &amp; Slabs ({orderData.items?.length || 0})</span>
              </h3>
              <div className="divide-y divide-stone-800/80 rounded-2xl border border-stone-800 overflow-hidden bg-stone-900/30">
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-stone-100">{item.product_name}</div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Qty: {item.quantity} {item.unit || "boxes"}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-stone-200">
                      ₹{parseFloat(item.total).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {searched && !orderData && !loading && (
          <div className="text-center py-12 rounded-3xl border border-stone-800 bg-[#161513] space-y-3">
            <Package className="mx-auto h-10 w-10 text-stone-600" />
            <h3 className="text-sm font-semibold text-stone-200">No consignment found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Please verify your order number or reach out to our studio concierge at +91 98450 12345.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
