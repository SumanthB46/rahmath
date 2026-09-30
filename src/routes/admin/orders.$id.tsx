import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  Save,
  DollarSign,
  Package,
  Layers,
  History,
  Check,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id")({
  head: () => ({
    meta: [{ title: "Order Details — Mubarak Admin" }],
  }),
  component: AdminOrderDetailsPage,
});

const DELIVERY_PARTNERS = [
  { id: "porter", name: "Porter" },
  { id: "vrl", name: "VRL Logistics" },
  { id: "dart", name: "DART Express" },
  { id: "bus", name: "Bus / Transport" },
  { id: "local", name: "Local Delivery" },
  { id: "pickup", name: "Customer Pickup" },
  { id: "other", name: "Other Cargo" },
];

const DELIVERY_STATUSES = [
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

const ORDER_STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"];

function AdminOrderDetailsPage() {
  const { id } = useParams({ from: "/admin/orders/$id" });
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State for Delivery Editing
  const [deliveryPartner, setDeliveryPartner] = useState("porter");
  const [deliveryPartnerName, setDeliveryPartnerName] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("0");
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState("Customer Pays Delivery Partner");
  const [deliveryStatus, setDeliveryStatus] = useState("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");

  // Delivery Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getOrder(id);
      if (res.data) {
        const ord = res.data;
        setOrder(ord);
        setOrderStatus(ord.order_status || "pending");
        setDeliveryPartner(ord.delivery_partner || "porter");
        setDeliveryPartnerName(ord.delivery_partner_name || "");
        setDeliveryCharge(String(ord.delivery_charge || 0));
        setDeliveryPaymentMethod(ord.delivery_payment_method || "Customer Pays Delivery Partner");
        setDeliveryStatus(ord.delivery_status || "pending");
        setTrackingNumber(ord.tracking_number || "");
        setExpectedDeliveryDate(
          ord.expected_delivery_date ? ord.expected_delivery_date.split("T")[0] : ""
        );
        setDeliveryNotes(ord.delivery_notes || "");
      }
    } catch (err: any) {
      toast.error("Failed to load order", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateOrderStatus = async (newStatus: string) => {
    setSavingStatus(true);
    try {
      await api.admin.updateOrderStatus(id, newStatus);
      setOrderStatus(newStatus);
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      loadOrder();
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveDeliveryDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDelivery(true);
    try {
      await api.admin.updateDeliveryDetails(id, {
        deliveryPartner,
        deliveryPartnerName:
          deliveryPartner === "other" || deliveryPartner === "bus" ? deliveryPartnerName : null,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        deliveryPaymentMethod,
        deliveryStatus,
        trackingNumber: trackingNumber || null,
        expectedDeliveryDate: expectedDeliveryDate || null,
        deliveryNotes: deliveryNotes || null,
      });
      toast.success("Delivery details saved successfully");
      loadOrder();
    } catch (err: any) {
      toast.error("Failed to update delivery", { description: err.message });
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleConfirmDeliveryPayment = async () => {
    try {
      await api.admin.markDeliveryPaymentPaid(id, paymentNotes);
      toast.success("Delivery charge marked as PAID");
      setIsPayModalOpen(false);
      loadOrder();
    } catch (err: any) {
      toast.error("Failed to mark delivery paid", { description: err.message });
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Loading Order...">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="text-xs text-stone-400 font-mono">Fetching Order Information...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout pageTitle="Order Not Found">
        <div className="py-16 text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="text-lg font-semibold text-stone-200">Order does not exist</h2>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold"
          >
            ← Return to Orders List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Order #${order.order_number}`}>
      <div className="space-y-8">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div className="space-y-1">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                Order #{order.order_number}
              </h2>
              <span className="text-xs text-stone-500">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Quick Order Status Selector */}
          <div className="flex items-center gap-3 bg-[#161513] border border-stone-800 p-2 rounded-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 pl-2">
              Order Status:
            </span>
            <select
              value={orderStatus}
              onChange={(e) => handleUpdateOrderStatus(e.target.value)}
              disabled={savingStatus}
              className="rounded-xl border border-stone-700 bg-stone-900 py-1.5 px-3 text-xs font-semibold text-stone-100 capitalize focus:border-amber-500 focus:outline-none"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-COLUMN MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 COLS): ITEMS, CUSTOMER & PRODUCT PAYMENT */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. ORDERED ITEMS TABLE */}
            <div className="rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span>Ordered Products ({order.items?.length || 0})</span>
                </h3>
              </div>

              <div className="divide-y divide-stone-800/60">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-stone-800 border border-stone-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-stone-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-stone-100 text-xs sm:text-sm truncate">
                          {item.product_name}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          SKU: {item.sku} · Qty: {item.quantity} {item.unit || "boxes"}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 font-mono pl-15 sm:pl-0">
                      <div className="text-xs font-bold text-stone-100">
                        ₹{parseFloat(item.total).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        ₹{parseFloat(item.price).toLocaleString("en-IN")} / {item.unit || "box"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PRODUCT PAYMENT CARD (STRICTLY SEPARATE CONCEPT) */}
            <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#191612] to-[#161513] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200">
                    Product Payment (Customer Online Checkout)
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{order.product_payment_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-stone-400 font-medium block">
                    Subtotal
                  </span>
                  <span className="font-mono text-stone-200 font-semibold">
                    ₹{parseFloat(order.product_subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-stone-400 font-medium block">
                    Discount
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    -₹{parseFloat(order.product_discount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-stone-400 font-medium block">
                    GST (18%)
                  </span>
                  <span className="font-mono text-stone-200 font-semibold">
                    ₹{parseFloat(order.product_gst || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-stone-900/90 border border-stone-800 p-2 rounded-xl">
                  <span className="text-[10.5px] uppercase tracking-wider text-amber-400 font-bold block">
                    Product Total
                  </span>
                  <span className="font-mono text-amber-300 font-bold text-sm">
                    ₹{parseFloat(order.product_total || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-800/80 pt-3 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
                <div>
                  Gateway:{" "}
                  <span className="text-stone-200 font-medium">
                    {order.payment_gateway || "Razorpay"}
                  </span>
                  {order.transaction_id && (
                    <span className="font-mono text-stone-500 ml-2">
                      ({order.transaction_id})
                    </span>
                  )}
                </div>
                {order.paid_at && (
                  <div className="text-stone-500">
                    Paid at: {new Date(order.paid_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* 3. CUSTOMER INFORMATION */}
            <div className="rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
                <User className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  Customer &amp; Shipping Destination
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10.5px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Customer Name
                  </span>
                  <div className="font-medium text-stone-100 text-sm">{order.customer_name}</div>
                  <div className="text-stone-400">{order.customer_phone}</div>
                  <div className="text-stone-400">{order.customer_email}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10.5px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Shipping Address
                  </span>
                  <p className="text-stone-300 leading-relaxed">{order.shipping_address}</p>
                  <div className="text-stone-400">
                    {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS): MANUAL DELIVERY MANAGEMENT & TIMELINE */}
          <div className="lg:col-span-5 space-y-6">
            {/* MANUAL DELIVERY CARD */}
            <div className="rounded-2xl border border-blue-900/40 bg-[#161513] p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                    Manual Delivery Desk
                  </h3>
                </div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize font-mono ${
                    order.delivery_payment_status === "paid"
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950/80 text-amber-400 border border-amber-800"
                  }`}
                >
                  Delivery {order.delivery_payment_status}
                </span>
              </div>

              {/* Delivery Form */}
              <form onSubmit={handleSaveDeliveryDetails} className="space-y-4 text-xs">
                {/* Partner Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Delivery Partner / Mode *
                  </label>
                  <select
                    value={deliveryPartner}
                    onChange={(e) => setDeliveryPartner(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
                  >
                    {DELIVERY_PARTNERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Partner Custom Name for Bus / Other */}
                {(deliveryPartner === "other" || deliveryPartner === "bus") && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Partner / Bus Transport Agency Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryPartnerName}
                      onChange={(e) => setDeliveryPartnerName(e.target.value)}
                      placeholder="e.g. KSRTC / VRL Cargo Hub / ABC Transport"
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Delivery Charge Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Delivery Charge (₹ entered manually) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="500.00"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Delivery Payment Method */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Delivery Payment Method
                  </label>
                  <select
                    value={deliveryPaymentMethod}
                    onChange={(e) => setDeliveryPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Customer Pays Delivery Partner">
                      Customer Pays Delivery Partner (Direct to Porter/VRL)
                    </option>
                    <option value="Paid by Customer">Paid by Customer to Mubarak Studio</option>
                    <option value="Other">Other Arrangement</option>
                  </select>
                </div>

                {/* Delivery Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none capitalize"
                  >
                    {DELIVERY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Tracking Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Tracking / LR / Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. PRT-88294 or LR-9921"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Delivery Notes
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Special transit instructions, vehicle type, handling notes..."
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingDelivery}
                    className="w-full sm:flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Delivery Info</span>
                  </button>

                  {order.delivery_payment_status !== "paid" && (
                    <button
                      type="button"
                      onClick={() => setIsPayModalOpen(true)}
                      className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ORDER TIMELINE AUDIT TRAIL */}
            <div className="rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
                <History className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  Order &amp; Delivery Audit Timeline
                </h3>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                {order.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((event: any) => (
                    <div key={event.id} className="relative group">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-amber-500 bg-stone-900 group-hover:scale-125 transition-transform" />
                      <div className="text-[10px] text-stone-500 font-mono">
                        {new Date(event.created_at).toLocaleString()} · By {event.created_by || "System"}
                      </div>
                      <div className="text-xs text-stone-200 font-medium mt-0.5">
                        {event.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-500 italic">No timeline events recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELIVERY PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-100">
                  Confirm Delivery Charge Payment
                </h4>
                <p className="text-xs text-stone-400">
                  Record that the delivery charge of{" "}
                  <strong className="text-emerald-400 font-mono">₹{deliveryCharge}</strong> has been
                  collected from the customer or reconciled with the delivery partner.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                Reconciliation / Receipt Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Paid cash to Porter driver / VRL receipt #892"
                className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="rounded-xl border border-stone-700 px-3.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeliveryPayment}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold px-4 py-1.5 text-xs shadow-md"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
