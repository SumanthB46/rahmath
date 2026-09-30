import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Settings,
  Store,
  Globe,
  Lock,
  User,
  Save,
  LogOut,
  Loader2,
  CheckCircle2,
  Smartphone,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — Mubarak Admin" }],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  // 2FA Handover Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetting, setResetting] = useState(false);

  // Store & Website Settings Form
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    logoUrl: "",
    faviconUrl: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      whatsapp: "",
    },
  });

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getSettings();
      if (res.data) {
        setStoreForm({
          storeName: res.data.store_name || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          address: res.data.address || "",
          whatsapp: res.data.whatsapp || "",
          logoUrl: res.data.logo_url || "",
          faviconUrl: res.data.favicon_url || "",
          socialLinks: res.data.social_links || {
            facebook: "",
            instagram: "",
            twitter: "",
            whatsapp: "",
          },
        });
      }
    } catch (err: any) {
      toast.error("Failed to load settings", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.admin.updateSettings(storeForm);
      toast.success("Store configuration updated");
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.admin.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Password update failed", { description: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReset2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      const res: any = await api.admin.reset2FA({
        password: resetPassword,
        code: resetOtp,
      });
      toast.success(res.message || "2FA successfully reset. Logging out for client handover...");
      setIsResetModalOpen(false);
      setResetPassword("");
      setResetOtp("");
      // Automatically log out so next login prompts the new QR code setup
      setTimeout(() => {
        logout();
        navigate({ to: "/admin/login" });
      }, 1000);
    } catch (err: any) {
      toast.error("2FA Reset Failed", { description: err.message || "Invalid password or OTP code" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Settings &amp; Store Configuration">
      <div className="space-y-8 max-w-5xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
            System &amp; Store Settings
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure contact details, showroom location, brand assets, and administrator credentials.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-stone-800 bg-[#161513]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span className="text-xs text-stone-400">Loading Configuration...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: STORE & WEBSITE CONFIGURATION (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveStore} className="rounded-2xl border border-stone-800 bg-[#161513] p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                  <Store className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
                    Store &amp; Showroom Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={storeForm.whatsapp}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Showroom Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Brand Assets */}
                <div className="border-t border-stone-800 pt-4 space-y-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                      Brand &amp; Social Links
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        Logo Image Path / URL
                      </label>
                      <input
                        type="text"
                        value={storeForm.logoUrl}
                        onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                        placeholder="/assets/mubarak_logo.png"
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        Instagram Link
                      </label>
                      <input
                        type="text"
                        value={storeForm.socialLinks.instagram}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            socialLinks: { ...storeForm.socialLinks, instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-800 pt-3 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-5 py-2 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {savingSettings && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Store Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT: ADMIN PROFILE & SECURITY (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-stone-800 bg-[#161513] p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                  <User className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
                    Administrator Profile
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800 text-xs">
                  <div className="h-10 w-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-amber-400">
                    {admin?.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-100">{admin?.name || "Administrator"}</div>
                    <div className="text-[11px] text-stone-400">{admin?.email}</div>
                    <div className="text-[10px] text-amber-400 font-mono">Role: {admin?.role}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full rounded-xl border border-red-900/60 bg-red-950/20 text-red-300 hover:bg-red-950/60 font-semibold py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out of Admin</span>
                </button>
              </div>

              {/* Change Password */}
              <form
                onSubmit={handleChangePassword}
                className="rounded-2xl border border-stone-800 bg-[#161513] p-6 space-y-4 text-xs"
              >
                <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
                    Change Password
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-semibold py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                  >
                    {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>

              {/* TWO-FACTOR AUTHENTICATION & HANDOVER CARD */}
              <div className="rounded-2xl border border-amber-600/30 bg-[#191815] p-6 space-y-4 text-xs shadow-lg">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
                      Two-Factor Authentication
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    2FA Protected
                  </span>
                </div>

                <p className="text-stone-400 text-xs leading-relaxed">
                  Transferring this portal to your client? Resetting 2FA clears the existing authenticator binding so the client can scan a brand-new QR code on their own device.
                </p>

                <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-3 text-[11px] text-amber-300/90 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Handover Procedure:</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-normal">
                    Requires your current password + active phone OTP. Once confirmed, you will be logged out and the client will be prompted to scan a new QR code upon their first login.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full rounded-xl border border-amber-600/50 bg-amber-600/15 hover:bg-amber-600 hover:text-stone-950 text-amber-300 font-semibold py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Reset 2FA (Handover to Client)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA RESET HANDOVER CONFIRMATION MODAL */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#161513] p-6 sm:p-7 shadow-2xl space-y-5 text-stone-100 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 border border-amber-600/30 text-amber-500">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-stone-100">
                      Reset 2FA for Handover
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Authorize client handover and reset authenticator key
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={resetting}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-[11px] text-red-200/90 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Important Security Warning</span>
                </div>
                <p className="leading-relaxed text-stone-300">
                  This action will invalidate the current Google Authenticator key and log you out immediately. On the next login, the system will show a new QR code for the new administrator.
                </p>
              </div>

              <form onSubmit={handleReset2FA} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Current Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none placeholder:text-stone-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Current 6-Digit Authenticator Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2.5 px-3 text-center text-lg font-mono tracking-widest text-amber-400 focus:border-amber-500 focus:outline-none placeholder:text-stone-600"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">
                    Enter the current 6-digit code shown on your phone's Google Authenticator app.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    disabled={resetting}
                    className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting || !resetPassword || resetOtp.length !== 6}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying &amp; Resetting...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Confirm &amp; Reset 2FA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
