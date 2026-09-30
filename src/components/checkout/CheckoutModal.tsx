import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth, AddressItem } from "@/hooks/useAuth";
import { ProductItem } from "@/routes/products";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem;
  boxes: number;
  totalPieces: number;
  totalSqft: number;
  totalPrice: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  boxes,
  totalPieces,
  totalSqft,
  totalPrice,
}: CheckoutModalProps) {
  const { user, token, addresses, saveAddress, fetchAddresses } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form fields
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newCity, setNewCity] = useState("Bengaluru");
  const [newState, setNewState] = useState("Karnataka");
  const [newPincode, setNewPincode] = useState("560001");
  const [newLandmark, setNewLandmark] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    productTotal: number;
  } | null>(null);

  // Fetch addresses and pick default
  useEffect(() => {
    if (isOpen) {
      fetchAddresses().then((addrs) => {
        if (addrs && addrs.length > 0) {
          const defaultAddr = addrs.find((a: AddressItem) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
          if (user) {
            setNewFullName(user.name || "");
            setNewPhone(user.mobile || user.phone || "");
          }
        }
      });
      setOrderResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // GST Calculation (18%)
  const subtotal = boxes * Number(product.price);
  const gstAmount = Math.round(subtotal * 0.18);
  const finalProductTotal = subtotal + gstAmount;

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newAddressLine || !newCity || !newState || !newPincode) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    try {
      const saved = await saveAddress({
        full_name: newFullName.trim(),
        phone: newPhone.replace(/\D/g, "").slice(-10),
        address_line: newAddressLine.trim(),
        area: newArea.trim() || undefined,
        city: newCity.trim(),
        state: newState.trim(),
        pincode: newPincode.trim(),
        landmark: newLandmark.trim() || undefined,
        is_default: true,
      });

      if (saved) {
        setSelectedAddressId(saved.id);
        setShowNewAddressForm(false);
      }
    } catch {
      // Toast handled in useAuth
    }
  };

  const handlePayAndPlaceOrder = async () => {
    if (!currentAddress && !showNewAddressForm) {
      toast.error("Please provide or select a delivery address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingInfo = currentAddress
        ? {
            customer_name: currentAddress.full_name,
            customer_email: user?.email || "customer@mubarakceramics.com",
            customer_phone: currentAddress.phone,
            shipping_address: `${currentAddress.address_line}${currentAddress.area ? ", " + currentAddress.area : ""}${currentAddress.landmark ? " (Near " + currentAddress.landmark + ")" : ""}`,
            shipping_city: currentAddress.city,
            shipping_state: currentAddress.state,
            shipping_pincode: currentAddress.pincode,
          }
        : {
            customer_name: newFullName,
            customer_email: user?.email || "customer@mubarakceramics.com",
            customer_phone: newPhone,
            shipping_address: newAddressLine,
            shipping_city: newCity,
            shipping_state: newState,
            shipping_pincode: newPincode,
          };

      const orderPayload = {
        ...shippingInfo,
        notes: orderNotes || undefined,
        items: [
          {
            product_id: product.id > 1000 ? null : product.id,
            product_name: product.name,
            product_image: product.images?.[0] || null,
            sku: product.sku,
            price: Number(product.price),
            quantity: boxes,
            unit: product.unit || "box",
          },
        ],
      };

      const res = await fetch("http://localhost:5000/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(orderPayload),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Order ${res.order_number} confirmed!`, {
          description: "Product payment confirmed. Logistics will coordinate delivery partner dispatch.",
        });
        setOrderResult({
          orderNumber: res.order_number,
          productTotal: res.product_total || finalProductTotal,
        });
      } else {
        throw new Error(res.message || "Failed to complete checkout.");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not complete order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {orderResult ? (
          /* SUCCESS ORDER CONFIRMATION SCREEN */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 font-mono">
                PRODUCT PAYMENT CONFIRMED
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-bold">
                Order #{orderResult.orderNumber}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed pt-1">
                Thank you! Your product payment of <strong>₹{orderResult.productTotal.toLocaleString()}</strong> has been received.
              </p>
            </div>

            {/* Logistics Disclaimer Notice */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <Truck className="h-4 w-4 text-amber-700" />
                <span>Next: Separate Delivery Coordination</span>
              </div>
              <p className="text-stone-600 text-[11.5px] leading-relaxed">
                Our logistics desk will assign the best carrier (Porter / VRL Cargo / Direct Vehicle) and communicate dispatch timing. The separate transport charge will be payable directly to the delivery partner upon delivery.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/track"
                search={{ orderNumber: orderResult.orderNumber } as any}
                className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Track Order Consignment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="space-y-5">
            <div>
              <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block mb-1">
                MUBARAK TILES &amp; CERAMICS
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Product Checkout
              </h2>
            </div>

            {/* 1. DELIVERY ADDRESS SECTION */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
                  <MapPin className="h-3.5 w-3.5 text-amber-800" />
                  <span>Delivery Address</span>
                </div>

                {addresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Change / Add New
                  </button>
                )}
              </div>

              {/* Existing Address Display */}
              {!showNewAddressForm && currentAddress ? (
                <div className="text-xs text-stone-700 space-y-1 bg-white p-3 rounded-xl border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{currentAddress.full_name}</span>
                    <span className="text-stone-500 font-mono">{currentAddress.phone}</span>
                  </div>
                  <p className="text-stone-600 leading-snug">
                    {currentAddress.address_line}
                    {currentAddress.area ? `, ${currentAddress.area}` : ""}
                    {currentAddress.landmark ? ` (Near ${currentAddress.landmark})` : ""}
                  </p>
                  <p className="text-stone-500 font-medium">
                    {currentAddress.city}, {currentAddress.state} - {currentAddress.pincode}
                  </p>
                </div>
              ) : (
                /* Inline Add Address Form */
                <form onSubmit={handleSaveNewAddress} className="space-y-2.5 pt-1 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Phone *"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="House/Plot number, building, street *"
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City *"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State *"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                    />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Pincode *"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800"
                    >
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* 2. ORDER SUMMARY */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">
                    SKU: {product.sku}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">
                    {product.name}
                  </h4>
                  <span className="text-xs text-stone-500">
                    {product.size || "120x240 cm"} · {product.finish || "Satin Matte"}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-stone-900">
                    {boxes} {product.unit || "Boxes"}
                  </span>
                  <span className="text-[10.5px] text-stone-500 block">
                    ({totalPieces} pieces · {totalSqft} sqft)
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-stone-200 text-xs space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Product Subtotal ({boxes} {product.unit || "boxes"}):</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Product Total (Payable Online):</span>
                  <span className="text-amber-900 font-serif text-base">
                    ₹{finalProductTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. SEPARATE DELIVERY PAYMENT NOTICE */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950">
              <Truck className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-900 font-mono">
                  Separate Transport Notice
                </span>
                <p className="text-[11.5px] leading-snug text-stone-700">
                  You are paying only for the tile products online now. The delivery charge will be calculated separately after order confirmation and paid separately to the delivery partner (Porter / VRL Cargo).
                </p>
              </div>
            </div>

            {/* 4. PAY & CONFIRM ORDER BUTTON */}
            <button
              type="button"
              onClick={handlePayAndPlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Confirming Product Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-amber-300" />
                  <span>
                    Pay Product Total &amp; Confirm Order (₹{finalProductTotal.toLocaleString()})
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
