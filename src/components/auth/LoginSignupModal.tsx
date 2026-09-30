import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  User as UserIcon,
  Mail,
  Building2,
} from "lucide-react";
import { useAuth, AddressItem } from "@/hooks/useAuth";
import { toast } from "sonner";
import stoneSlabsImg from "@/assets/stacked_grey_slabs.png";

interface LoginSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthStep = "phone" | "otp" | "details" | "address";

export function LoginSignupModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginSignupModalProps) {
  const {
    sendPhoneOtp,
    verifyPhoneOtp,
    updateProfile,
    saveAddress,
    loading,
    user,
    addresses,
  } = useAuth();

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  // OTP State (6 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Customer Basic Details State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Address State
  const [fullName, setFullName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("560001");
  const [landmark, setLandmark] = useState("");

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setErrorMessage("");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimer(30);
      setCanResend(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const isPhoneValid = cleanPhone.length === 10;

  // STEP 1: Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setErrorMessage("");
    try {
      const res = await sendPhoneOtp(cleanPhone);
      setStep("otp");
      setTimer(30);
      setCanResend(false);
      toast.success(`OTP sent to +91 ${cleanPhone}`, {
        description: res.devOtp ? `(Dev OTP: ${res.devOtp})` : "Enter the 6-digit code to verify.",
      });
      // Focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP. Please try again.");
    }
  };

  // STEP 2: Handle OTP Input & Verification
  const handleOtpChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
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

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP.");
      return;
    }

    setErrorMessage("");
    try {
      const res = await verifyPhoneOtp(cleanPhone, otpCode);
      toast.success("Phone verified successfully!");

      // Check if existing customer with complete profile & addresses
      if (!res.isNew && res.hasProfile && res.addresses && res.addresses.length > 0) {
        onClose();
        if (onSuccess) onSuccess();
      } else if (!res.hasProfile && (!res.user.name || res.user.name.startsWith("Customer "))) {
        // Show Customer Details Step
        setCustomerName(res.user.name?.startsWith("Customer ") ? "" : res.user.name || "");
        setCustomerEmail(res.user.email || "");
        setStep("details");
      } else if (!res.addresses || res.addresses.length === 0) {
        // Show Address Step
        setFullName(res.user.name || "");
        setAddressPhone(cleanPhone);
        setStep("address");
      } else {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid OTP entered. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage("");
    try {
      const res = await sendPhoneOtp(cleanPhone);
      setTimer(30);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success("New OTP sent successfully!", {
        description: res.devOtp ? `(Dev OTP: ${res.devOtp})` : undefined,
      });
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not resend OTP.");
    }
  };

  // STEP 3: Handle Customer Details Save
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setErrorMessage("");
    try {
      await updateProfile({
        name: customerName.trim(),
        email: customerEmail.trim() || undefined,
      });

      // Proceed to Address Step
      setFullName(customerName.trim());
      setAddressPhone(cleanPhone);
      setStep("address");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    }
  };

  // STEP 4: Handle Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressPhone || !addressLine || !city || !state || !pincode) {
      setErrorMessage("Please fill in all required delivery address fields.");
      return;
    }

    if (pincode.replace(/\D/g, "").length !== 6) {
      setErrorMessage("Please enter a valid 6-digit postal pincode.");
      return;
    }

    setErrorMessage("");
    try {
      await saveAddress({
        full_name: fullName.trim(),
        phone: addressPhone.replace(/\D/g, "").slice(-10),
        address_line: addressLine.trim(),
        area: area.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim() || undefined,
        is_default: true,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save delivery address.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors shadow-xs"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* LEFT COLUMN: BRAND IMAGE BANNER (Desktop Only) */}
        <div className="hidden md:flex md:col-span-5 relative bg-stone-900 text-white flex-col justify-between p-8 overflow-hidden">
          <img
            src={stoneSlabsImg}
            alt="Mubarak Studio Slabs"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

          {/* Top Logo / Brand */}
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase font-mono block">
              MUBARAK CERAMIC STUDIO
            </span>
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              Architectural Surfaces &amp; Tiles
            </h3>
          </div>

          {/* Bottom Highlights */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Instant whole-box coverage &amp; inventory reserve</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct consignments &amp; insured partner delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Separate transport charge with Porter &amp; VRL</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MULTI-STEP AUTH FLOW */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-9 overflow-y-auto max-h-[85vh] flex flex-col justify-center">
          {/* STEP 1: PHONE NUMBER INPUT */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block">
                  CLIENT SIGN IN / SIGN UP
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Enter your mobile number
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We will send a 6-digit verification code to access your cart and place your order.
                </p>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-700 uppercase block">
                  Mobile Number
                </label>
                <div className="flex items-center border border-stone-300 rounded-2xl bg-stone-50/60 focus-within:border-amber-800 focus-within:bg-white transition-all overflow-hidden p-1.5">
                  <span className="px-3 text-xs font-bold text-stone-700 font-mono border-r border-stone-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    autoFocus
                    placeholder="Enter 10 digit number"
                    value={cleanPhone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold tracking-wider text-stone-900 bg-transparent focus:outline-none"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* WhatsApp Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-amber-800 focus:ring-amber-700"
                />
                <span className="text-[11.5px] leading-snug">
                  Get order confirmation &amp; dispatch tracking updates on WhatsApp.
                </span>
              </label>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={!isPhoneValid || loading}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4 text-amber-300" />
                  </>
                )}
              </button>

              <p className="text-[10.5px] text-center text-stone-400 leading-normal">
                By continuing, you agree to Mubarak Tiles &amp; Ceramics Terms of Service &amp; Privacy Policy.
              </p>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block">
                  SECURITY VERIFICATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Enter OTP
                </h2>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span>OTP sent to <strong>+91 {cleanPhone}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setErrorMessage("");
                    }}
                    className="text-amber-800 font-bold underline hover:text-amber-950 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* 6 OTP Input Boxes */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 sm:w-12 h-13 text-center text-lg font-bold rounded-2xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none transition-all shadow-xs text-stone-900"
                  />
                ))}
              </div>

              {/* Resend Timer / Action */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Didn&apos;t receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-stone-400 font-medium">
                    Resend OTP in <strong>{timer}s</strong>
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={otpDigits.join("").length !== 6 || loading}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    <span>Verify OTP &amp; Proceed</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: BASIC CUSTOMER DETAILS (For New Users) */}
          {step === "details" && (
            <form onSubmit={handleSaveDetails} className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block">
                  CUSTOMER PROFILE
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Your Details
                </h2>
                <p className="text-xs text-stone-600">
                  Please provide your name for invoice and shipment documentation.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 uppercase block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Rajesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 uppercase block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="rajesh@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <span>Phone: +91 {cleanPhone}</span>
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={!customerName.trim() || loading}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Continue to Address</span>
                <ArrowRight className="h-4 w-4 text-amber-300" />
              </button>
            </form>
          )}

          {/* STEP 4: DELIVERY ADDRESS FORM */}
          {step === "address" && (
            <form onSubmit={handleSaveAddress} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold tracking-widest text-amber-800 uppercase font-mono block">
                  DELIVERY DESTINATION
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-stone-700 uppercase block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-stone-700 uppercase block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressPhone}
                      onChange={(e) => setAddressPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-stone-700 uppercase block mb-1">
                    House / Building / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Plot #42, Green Glen Layout, 1st Cross"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-stone-700 uppercase block mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bellandur"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-stone-700 uppercase block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Near Central Mall"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                      Pincode * (6-digits)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Address...</span>
                  </>
                ) : (
                  <>
                    <span>Save Address &amp; Continue to Checkout</span>
                    <ArrowRight className="h-4 w-4 text-amber-300" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginSignupModal;
