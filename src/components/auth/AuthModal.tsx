import { useState, useEffect } from "react";
import { X, Mail, Lock, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "register";
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode = "signin", onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login, register, loading } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg("");
  }, [initialMode, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (mode === "signin") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-[#2C2523] selection:bg-[#E2DDD5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-full p-1.5 text-stone-500 hover:bg-stone-200/60 hover:text-stone-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-100/80 text-amber-900 mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-serif text-[#4A4036] font-normal">
            {mode === "signin" ? "Client Portal" : "Join Mubarak Studio"}
          </h2>
          <p className="text-xs text-[#7A7067]">
            {mode === "signin"
              ? "Sign in to access your curated collections and architectural orders."
              : "Create an account to save custom surface specs and projects."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-stone-200/60 p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === "signin"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === "register"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#7A7067]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumanth"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-[#E7E2DA] bg-white py-2 pl-9 pr-3 text-xs text-[#2C2523] placeholder:text-stone-400 focus:border-[#4A4036] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#7A7067]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="architect@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#E7E2DA] bg-white py-2 pl-9 pr-3 text-xs text-[#2C2523] placeholder:text-stone-400 focus:border-[#4A4036] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#7A7067]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[#E7E2DA] bg-white py-2 pl-9 pr-3 text-xs text-[#2C2523] placeholder:text-stone-400 focus:border-[#4A4036] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-md bg-[#63574A] hover:bg-[#4E4338] disabled:opacity-50 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{mode === "signin" ? "Sign In" : "Register"}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#FAF7F2] px-2 text-stone-400 tracking-widest">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <a
          href={api.getGoogleAuthUrl()}
          className="flex w-full items-center justify-center gap-2.5 rounded-md border border-[#E7E2DA] bg-white py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Google</span>
        </a>
      </div>
    </div>
  );
}
