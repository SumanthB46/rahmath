import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LoginSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthStep = "phone" | "otp" | "name";

export function LoginSignupModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginSignupModalProps) {
  const { sendPhoneOtp, verifyPhoneOtp, updateProfile, loading } = useAuth();

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // OTP State (6 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Optional Name Prompt for new accounts
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Countdown timer for OTP
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
      setDevOtpHint(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const isPhoneValid = cleanPhone.length === 10;

  // STEP 1: Send OTP
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
      setDevOtpHint(res.devOtp || (cleanPhone === "9876543210" ? "123456" : null));
      toast.success(`OTP sent to +91 ${cleanPhone}`, {
        description: res.devOtp ? `(Dev OTP: ${res.devOtp})` : "Enter the 6-digit code to continue.",
      });
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP. Please try again.");
    }
  };

  // STEP 2: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste event of 6 digits
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

  // STEP 2: Verify OTP
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
      // If user has no name registered yet, ask friendly name prompt
      if (!res.user.name || res.user.name.startsWith("Customer ") || res.user.name.trim() === "") {
        setStep("name");
      } else {
        toast.success("Welcome back!", {
          description: `Signed in as ${res.user.name || "+91 " + cleanPhone}`,
        });
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid OTP entered. Please try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage("");
    try {
      const res = await sendPhoneOtp(cleanPhone);
      setTimer(30);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setDevOtpHint(res.devOtp || null);
      toast.success("New OTP sent successfully!");
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not resend OTP.");
    }
  };

  // STEP 3 (Optional): Save Customer Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      try {
        await updateProfile({ name: userName.trim() });
      } catch {
        // Non-blocking
      }
    }
    toast.success("Welcome to Mubarak Tiles & Ceramics!");
    onClose();
    if (onSuccess) onSuccess();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md my-auto overflow-hidden rounded-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl p-6 sm:p-8 text-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-200/70 hover:text-stone-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-amber-100 text-amber-900 mb-1 shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-amber-900 font-bold">
            Mubarak Ceramics Client Access
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            {step === "phone" && "Login with Mobile"}
            {step === "otp" && "Verify Mobile Number"}
            {step === "name" && "Welcome to the Studio"}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
            {step === "phone" &&
              "Enter your mobile number. We'll send an instant OTP to verify your account or sign you in."}
            {step === "otp" &&
              `Enter the 6-digit code sent to +91 ${cleanPhone}`}
            {step === "name" &&
              "Your account is verified! Tell us your name so we can personalize your studio orders."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 text-center font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Dev OTP Pill (if available) */}
        {devOtpHint && step === "otp" && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-2 text-center text-xs text-amber-900 font-mono">
            Demo Code: <span className="font-bold underline">{devOtpHint}</span>
          </div>
        )}

        {/* STEP 1: Phone Input */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-20 pr-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-xs"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 pl-1">
                New accounts are created automatically upon OTP verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={!isPhoneValid || loading}
              className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Input */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMessage("");
                  }}
                  className="text-xs text-amber-900 hover:underline font-medium"
                >
                  Change phone
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
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

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-amber-900 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span>Resend in {timer}s</span>
              )}
              <span className="text-stone-400">Dev code: 123456</span>
            </div>

            <button
              type="submit"
              disabled={otpDigits.join("").length !== 6 || loading}
              className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Optional Name Input for New Customers */}
        {step === "name" && (
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                Your Full Name (Optional)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Sumanth"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Complete Setup</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}

        {/* Trust Footer */}
        <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Secure authentication · No password needed</span>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

export default LoginSignupModal;
