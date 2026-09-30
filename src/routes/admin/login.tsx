import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  QrCode,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Mubarak Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, verify2FA, isAuthenticated, loading } = useAdminAuth();

  // Step state: "credentials" -> "2fa"
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");

  // Step 1: Username & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 2: Google Authenticator (TOTP)
  const [tempToken, setTempToken] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (step === "2fa") {
      setTimeout(() => codeInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Submit Credentials (Username/Email + Password)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res: any = await login({ email, password });
      if (res && res.requires2FA) {
        // Password OK -> Move to Google Authenticator step
        setTempToken(res.tempToken);
        setIsSetup(Boolean(res.isSetup));
        setTotpSecret(res.secret || "");
        setOtpauthUrl(res.otpauthUrl || "");
        setStep("2fa");
      } else {
        // Already authenticated
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      // Password NOT OK -> STOP
      setErrorMsg(err.message || "Invalid administrator credentials.");
    }
  };

  // Step 2: Submit 6-digit Google Authenticator Code
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = code.trim().replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      await verify2FA(tempToken, cleanCode);
      // Code Correct -> Admin Dashboard
      navigate({ to: "/admin" });
    } catch (err: any) {
      // Code Wrong -> STOP
      setErrorMsg(err.message || "Invalid Google Authenticator code. Please try again.");
    }
  };

  const handleCopySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="admin-theme-cream flex min-h-screen items-center justify-center bg-[#F7F5F0] px-4 py-12 text-stone-900 selection:bg-amber-200 selection:text-amber-950">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-[#DFD8CC] bg-white p-7 sm:p-9 shadow-xl animate-in fade-in duration-200">
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600/10 border border-amber-600/30 text-amber-800">
            {step === "credentials" ? (
              <ShieldCheck className="h-7 w-7" />
            ) : (
              <Smartphone className="h-7 w-7 text-amber-700" />
            )}
          </div>
          <h2 className="text-2xl font-serif font-semibold tracking-tight text-stone-900">
            {step === "credentials" ? "Admin Portal" : "Google Authenticator"}
          </h2>
          <p className="text-xs text-stone-600">
            {step === "credentials"
              ? "Sign in with administrator credentials to manage the studio."
              : isSetup
              ? "Scan the QR code or enter the key into your Google Authenticator app."
              : "Enter the current 6-digit code from your Google Authenticator app."}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: USERNAME + PASSWORD ================= */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="admin@mubarak.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white py-2.5 pl-10 pr-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white py-2.5 pl-10 pr-3.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 text-xs uppercase tracking-[0.16em] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Password & Continue →"}
            </button>
          </form>
        )}

        {/* ================= STEP 2: GOOGLE AUTHENTICATOR (TOTP) ================= */}
        {step === "2fa" && (
          <form onSubmit={handle2FASubmit} className="space-y-5">
            {/* First-time setup banner with QR code & secret */}
            {isSetup && totpSecret && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <QrCode className="h-4 w-4 text-amber-700" />
                  <span>Setup Step: Scan in Authenticator</span>
                </div>

                {/* QR Code preview */}
                {otpauthUrl && (
                  <div className="flex justify-center p-2 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        otpauthUrl
                      )}`}
                      alt="Google Authenticator QR Code"
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                )}

                {/* Manual Secret Key */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800/80 block">
                    Or enter manual secret key:
                  </span>
                  <div className="flex items-center justify-between rounded-xl bg-white border border-amber-200 px-3 py-1.5 text-stone-800">
                    <code className="text-xs font-mono font-bold tracking-widest select-all">
                      {totpSecret.match(/.{1,4}/g)?.join(" ") || totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-stone-500 hover:text-stone-900 p-1 rounded transition-colors cursor-pointer"
                      title="Copy Key"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="space-y-2">
              <label className="block text-center text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white py-3 pl-10 pr-3.5 text-center font-mono text-xl font-bold tracking-[0.4em] text-stone-900 placeholder:text-stone-300 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="w-full rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 text-xs uppercase tracking-[0.16em] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code & Enter Studio"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setCode("");
                setErrorMsg("");
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to password</span>
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-[#E2DBD0] text-center">
          <a
            href="/"
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors inline-block font-medium"
          >
            ← Back to Customer Website
          </a>
        </div>
      </div>
    </div>
  );
}
