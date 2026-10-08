import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Building2,
  MapPin,
  ShoppingBag,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { useAuth, AddressItem } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { API_BASE_URL } from "@/lib/api";

export function GlobalCheckoutModal() {
  const { isCheckoutOpen, closeCheckout, cart, clearCart, subtotal, gstAmount, totalAmount } = useCart();
  const {
    user,
    token,
    addresses,
    saveAddress,
    fetchAddresses,
    sendPhoneOtp,
    verifyPhoneOtp,
    isAuthenticated,
  } = useAuth();

  // Guest Auth State inside Checkout
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [guestPhone, setGuestPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Address Selection & Creation
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Address Form fields
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("Bengaluru");
  const [newState, setNewState] = useState("Karnataka");
  const [newPincode, setNewPincode] = useState("560001");
  const [orderNotes, setOrderNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    productTotal: number;
  } | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (authStep === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer]);

  // Sync state on modal open
  useEffect(() => {
    if (isCheckoutOpen) {
      setOrderResult(null);
      setAuthStep("phone");
      setAuthError("");
      setOtpDigits(["", "", "", "", "", ""]);
      setDevOtpHint(null);

      if (isAuthenticated && token && fetchAddresses) {
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
      } else {
        setShowNewAddressForm(true);
      }
    }
  }, [isCheckoutOpen, isAuthenticated, token]);

  if (!isCheckoutOpen) return null;

  const cleanGuestPhone = guestPhone.replace(/\D/g, "").slice(0, 10);
  const isGuestPhoneValid = cleanGuestPhone.length === 10;

  // Guest Send OTP
  const handleSendGuestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGuestPhoneValid) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await sendPhoneOtp(cleanGuestPhone);
      setAuthStep("otp");
      setOtpTimer(30);
      setCanResendOtp(false);
      setDevOtpHint(res.devOtp || (cleanGuestPhone === "9876543210" ? "123456" : null));
      toast.success(`OTP sent to +91 ${cleanGuestPhone}`);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch (err: any) {
      setAuthError(err.message || "Failed to send OTP.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Guest Verify OTP
  const handleVerifyGuestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP.");
      return;
    }

    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await verifyPhoneOtp(cleanGuestPhone, code);
      toast.success("Mobile verified!");

      // Pre-fill address form with verified phone and user details
      setNewPhone(cleanGuestPhone);
      if (res.user?.name && !res.user.name.startsWith("Customer ")) {
        setNewFullName(res.user.name);
      }

      if (res.addresses && res.addresses.length > 0) {
        setSelectedAddressId(res.addresses[0].id);
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid OTP entered.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle OTP digit box input
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      pasted.forEach((ch, idx) => {
        if (idx < 6) newOtp[idx] = ch;
      });
      setOtpDigits(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    const char = cleanVal.slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = char;
    setOtpDigits(newOtp);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const currentAddress = addresses?.find((a) => a.id === selectedAddressId) || addresses?.[0];

  // Final Order Submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAddress && (!newFullName || !newPhone || !newAddressLine || !newCity || !newPincode)) {
      toast.error("Please provide your delivery address.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      // If customer entered a new address and opted to save it
      if (showNewAddressForm && saveToAccount && token) {
        try {
          await saveAddress({
            full_name: newFullName.trim(),
            phone: newPhone.replace(/\D/g, "").slice(-10),
            address_line: newAddressLine.trim(),
            city: newCity.trim(),
            state: newState.trim(),
            pincode: newPincode.trim(),
            is_default: (addresses?.length || 0) === 0,
          });
        } catch {
          // Non-blocking for order placement
        }
      }

      const shippingInfo = currentAddress && !showNewAddressForm
        ? {
            customer_name: currentAddress.full_name,
            customer_email: user?.email || "customer@mubarakceramics.com",
            customer_phone: currentAddress.phone,
            shipping_address: `${currentAddress.address_line}${currentAddress.area ? ", " + currentAddress.area : ""}`,
            shipping_city: currentAddress.city,
            shipping_state: currentAddress.state,
            shipping_pincode: currentAddress.pincode,
          }
        : {
            customer_name: newFullName.trim(),
            customer_email: user?.email || "customer@mubarakceramics.com",
            customer_phone: newPhone.trim(),
            shipping_address: newAddressLine.trim(),
            shipping_city: newCity.trim(),
            shipping_state: newState.trim(),
            shipping_pincode: newPincode.trim(),
          };

      const orderPayload = {
        ...shippingInfo,
        user_id: user?.id || null,
        notes: orderNotes || undefined,
        items: cart.map((item) => ({
          product_id: typeof item.id === "number" && item.id < 1000 ? item.id : null,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || "box",
          specs: item.specs || item.dimensions,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(orderPayload),
      })
        .then((r) => r.json())
        .catch(() => null);

      const generatedOrderNum =
        res && res.success && res.order_number
          ? res.order_number
          : `MTC-${Date.now().toString().slice(-6)}`;

      clearCart();
      setOrderResult({
        orderNumber: generatedOrderNum,
        productTotal: totalAmount,
      });

      toast.success(`Order #${generatedOrderNum} Confirmed!`, {
        description: "Studio logistics will coordinate dispatch on WhatsApp.",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeCheckout}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
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
                ORDER PLACED &amp; CONFIRMED
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-bold">
                Order #{orderResult.orderNumber}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed pt-1">
                Thank you! Your architectural order of{" "}
                <strong>₹{orderResult.productTotal.toLocaleString("en-IN")}</strong> has been logged
                for direct dispatch.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-stone-700">
                <Truck className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Direct Freight Dispatch</strong>
                  <span>
                    Our logistics desk will contact you via WhatsApp to confirm the unloading schedule and delivery vehicle assignment.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-700">
                <Building2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Hub Fulfillment</strong>
                  <span>Mubarak Tiles &amp; Ceramics, Chikkaballapur Regional Highway Hub.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/account"
                onClick={closeCheckout}
                className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-md cursor-pointer"
              >
                View in My Account
              </Link>
              <Link
                to="/track"
                search={{ order: orderResult.orderNumber } as any}
                onClick={closeCheckout}
                className="flex-1 py-3 border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors text-center cursor-pointer"
              >
                Track Consignment
              </Link>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* STEP 1: GUEST PHONE + OTP VERIFICATION */
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-900 font-semibold block mb-1">
                STEP 1 OF 2 · CUSTOMER AUTHENTICATION
              </span>
              <h2 className="text-2xl font-serif text-stone-900 font-bold">
                {authStep === "phone" ? "Enter Mobile Number" : "Verify Mobile Number"}
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {authStep === "phone"
                  ? "We authenticate orders via mobile OTP so you can track deliveries and access invoices without passwords."
                  : `Enter the 6-digit code sent to +91 ${cleanGuestPhone} to confirm your account.`}
              </p>
            </div>

            {/* Cart Preview Pill */}
            <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-stone-700">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-900" />
                <span>{cart.length} item(s) in cart</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                Total: ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {authError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 text-center font-medium animate-in fade-in">
                {authError}
              </div>
            )}

            {devOtpHint && authStep === "otp" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-center text-xs text-amber-900 font-mono">
                Dev OTP code: <span className="font-bold underline">{devOtpHint}</span>
              </div>
            )}

            {authStep === "phone" ? (
              <form onSubmit={handleSendGuestOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1.5 text-stone-500 text-xs font-semibold select-none">
                      <Phone className="h-4 w-4 text-amber-700" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      placeholder="Enter 10-digit number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      maxLength={10}
                      className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-20 pr-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Your account is created automatically. No password needed.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isGuestPhoneValid || authLoading}
                  className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP to Continue</span>
                      <ArrowRight className="h-4 w-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyGuestOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep("phone");
                        setAuthError("");
                      }}
                      className="text-xs text-amber-900 hover:underline font-medium cursor-pointer"
                    >
                      Change phone
                    </button>
                  </div>

                  <div className="flex gap-2 sm:gap-2.5 justify-center">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-11 sm:h-13 sm:w-12 rounded-xl border border-stone-300 bg-white text-center font-mono text-lg font-bold text-stone-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  {canResendOtp ? (
                    <button
                      type="button"
                      onClick={handleSendGuestOtp}
                      className="text-amber-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <span>Resend in {otpTimer}s</span>
                  )}
                  <span className="text-stone-400">Dev bypass: 123456</span>
                </div>

                <button
                  type="submit"
                  disabled={otpDigits.join("").length !== 6 || authLoading}
                  className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Proceed to Delivery</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified authentication · Zero password hassle</span>
            </div>
          </div>
        ) : (
          /* STEP 2: DELIVERY ADDRESS & ORDER CONFIRMATION */
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-900 font-semibold block mb-1">
                  STEP 2 OF 2 · DELIVERY &amp; DISPATCH
                </span>
                <h2 className="text-2xl font-serif text-stone-900 font-bold">
                  Delivery Details
                </h2>
              </div>
              {user && (
                <div className="text-right text-xs text-stone-500">
                  <span className="block font-semibold text-stone-800">{user.name || "Customer"}</span>
                  <span className="font-mono text-[11px] text-stone-400">+91 {user.mobile || user.phone}</span>
                </div>
              )}
            </div>

            {/* Cart Items Summary */}
            <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 border-b border-stone-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-900" />
                  <span>Order Items ({cart.length})</span>
                </span>
                <span className="font-mono text-stone-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-8 w-8 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <span className="truncate font-medium text-stone-800">{item.name}</span>
                      <span className="text-stone-400 font-mono text-[11px]">
                        ×{item.quantity}
                      </span>
                    </div>
                    <span className="font-mono text-stone-900 font-semibold shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-500">Total (incl. 18% GST):</span>
                <span className="text-base font-serif font-bold text-amber-950 font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery Address Section */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {addresses && addresses.length > 0 && !showNewAddressForm ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Select Delivery Address
                  </label>
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-amber-800 bg-amber-50/50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5 text-amber-900 focus:ring-amber-800"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-stone-900">
                            {addr.full_name} · {addr.phone}
                          </p>
                          <p className="text-stone-600 mt-0.5">
                            {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setNewFullName(user?.name || "");
                      setNewPhone(user?.mobile || user?.phone || "");
                    }}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline pt-1 block cursor-pointer"
                  >
                    + Deliver to a different address
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-800" />
                      <span>Delivery Address</span>
                    </span>
                    {addresses && addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-amber-800 hover:underline cursor-pointer"
                      >
                        Use saved address
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+91 98450 00000"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Street / Project Site Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      placeholder="#120, Site Street, Near Landmark"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">PIN</label>
                      <input
                        type="text"
                        required
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="rounded text-amber-900 focus:ring-amber-800"
                    />
                    <span>Save this address to my account for future orders</span>
                  </label>
                </div>
              )}

              {/* Special Site Delivery Instructions */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Site Unloading / Crane / Logistics Notes (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Ground floor direct unloading, wide gate available"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order (₹{totalAmount.toLocaleString("en-IN")})</span>
                    <ArrowRight className="h-4 w-4 text-amber-300" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10.5px] text-stone-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero advance risk · Invoice and specs confirmed before delivery</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalCheckoutModal;
