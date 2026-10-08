import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Edit2,
  X,
  Phone,
  Mail,
  Building2,
  ChevronRight,
} from "lucide-react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { useAuth, AddressItem, CustomerOrder } from "@/hooks/useAuth";
import { LoginSignupModal } from "@/components/auth/LoginSignupModal";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Client Account & Orders — Mubarak Tiles & Ceramics" }],
  }),
  component: CustomerAccountPage,
});

type ActiveTab = "orders" | "addresses" | "profile";

export function CustomerAccountPage() {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    addresses,
    saveAddress,
    updateAddress,
    deleteAddress,
    fetchOrders,
    fetchAddresses,
  } = useAuth();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [addrCity, setAddrCity] = useState("Bengaluru");
  const [addrState, setAddrState] = useState("Karnataka");
  const [addrPincode, setAddrPincode] = useState("560001");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingOrders(true);
      fetchOrders()
        .then((res) => setOrders(res || []))
        .finally(() => setLoadingOrders(false));
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Sync profile values
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  // Open Add Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFullName(user?.name || "");
    setAddrPhone(user?.mobile || user?.phone || "");
    setAddrLine("");
    setAddrArea("");
    setAddrCity("Bengaluru");
    setAddrState("Karnataka");
    setAddrPincode("560001");
    setAddrLandmark("");
    setAddrIsDefault((addresses?.length || 0) === 0);
    setAddressModalOpen(true);
  };

  // Open Edit Address Modal
  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddrFullName(addr.full_name);
    setAddrPhone(addr.phone);
    setAddrLine(addr.address_line);
    setAddrArea(addr.area || "");
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrLandmark(addr.landmark || "");
    setAddrIsDefault(Boolean(addr.is_default));
    setAddressModalOpen(true);
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrLine || !addrCity || !addrState || !addrPincode) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    setAddrSaving(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, {
          full_name: addrFullName.trim(),
          phone: addrPhone.trim(),
          address_line: addrLine.trim(),
          area: addrArea.trim() || undefined,
          city: addrCity.trim(),
          state: addrState.trim(),
          pincode: addrPincode.trim(),
          landmark: addrLandmark.trim() || undefined,
          is_default: addrIsDefault,
        });
      } else {
        await saveAddress({
          full_name: addrFullName.trim(),
          phone: addrPhone.trim(),
          address_line: addrLine.trim(),
          area: addrArea.trim() || undefined,
          city: addrCity.trim(),
          state: addrState.trim(),
          pincode: addrPincode.trim(),
          landmark: addrLandmark.trim() || undefined,
          is_default: addrIsDefault,
        });
      }
      setAddressModalOpen(false);
      fetchAddresses();
    } catch {
      // Error handled by hook
    } finally {
      setAddrSaving(false);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (id: number) => {
    try {
      await updateAddress(id, { is_default: true });
      fetchAddresses();
    } catch {
      // Handled
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
      } catch {
        // Handled
      }
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({
        name: profileName.trim() || undefined,
        email: profileEmail.trim() || undefined,
      });
      toast.success("Profile updated successfully");
    } catch {
      // Handled
    } finally {
      setProfileSaving(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#111111] text-stone-100 flex flex-col font-sans">
      <GlassNav />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {!isAuthenticated ? (
          /* UNAUTHENTICATED STATE */
          <div className="max-w-md mx-auto my-12 text-center bg-[#181818] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-inner">
              <User className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-[0.24em] text-amber-400 uppercase font-semibold">
                Client Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-white font-bold">
                Mubarak Client Account
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
                Sign in with your mobile number to view past orders, track dispatch status, and manage project delivery addresses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login with Mobile</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Instant OTP authentication · No password required</span>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ACCOUNT PORTAL */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-[#181818] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center text-xl sm:text-2xl font-serif font-bold shrink-0 shadow-inner">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-8 w-8" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      {user?.name || "Client Portal"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono">
                    <span className="flex items-center gap-1 text-stone-300">
                      <Phone className="h-3 w-3 text-amber-400" />
                      +91 {user?.mobile || user?.phone}
                    </span>
                    {user?.email && (
                      <span className="flex items-center gap-1 text-stone-400">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-px">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "orders"
                    ? "border-amber-400 text-amber-300 bg-white/5 rounded-t-xl"
                    : "border-transparent text-stone-400 hover:text-white"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "addresses"
                    ? "border-amber-400 text-amber-300 bg-white/5 rounded-t-xl"
                    : "border-transparent text-stone-400 hover:text-white"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Saved Addresses</span>
                {addresses.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300">
                    {addresses.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "profile"
                    ? "border-amber-400 text-amber-300 bg-white/5 rounded-t-xl"
                    : "border-transparent text-stone-400 hover:text-white"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" />
                    <p className="text-xs font-mono uppercase tracking-wider">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center bg-[#181818] border border-white/10 rounded-3xl p-8 space-y-4">
                    <Package className="h-12 w-12 mx-auto text-stone-600" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-bold text-white">No Orders Placed Yet</h3>
                      <p className="text-xs text-stone-400 max-w-sm mx-auto">
                        Explore our export-grade vitrified slabs, porcelain surfaces, and quartz sinks.
                      </p>
                    </div>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-[#181818] border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 transition-all space-y-4 shadow-xl"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                                #{ord.order_number}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                                  ord.order_status === "delivered"
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                    : ord.order_status === "dispatched"
                                    ? "bg-blue-950 text-blue-400 border border-blue-500/30"
                                    : "bg-amber-950 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {ord.order_status}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-stone-800 text-stone-300">
                                {ord.product_payment_status || "paid"}
                              </span>
                            </div>

                            <p className="text-xs text-stone-400 font-mono">
                              Placed on {new Date(ord.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-base sm:text-lg font-serif font-bold text-amber-300 font-mono">
                              ₹{Number(ord.product_total).toLocaleString("en-IN")}
                            </span>

                            <Link
                              to="/track"
                              search={{ order: ord.order_number } as any}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-400 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                            >
                              <Truck className="h-3.5 w-3.5 text-amber-400" />
                              <span>Track</span>
                            </Link>
                          </div>
                        </div>

                        {/* Order Items */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                              Order Items ({ord.items.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {ord.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 bg-[#111111] p-2.5 rounded-xl border border-white/5"
                                >
                                  {it.product_image ? (
                                    <img
                                      src={it.product_image}
                                      alt={it.product_name}
                                      className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                                      <Package className="h-5 w-5 text-stone-500" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-white truncate">
                                      {it.product_name}
                                    </p>
                                    <p className="text-[11px] text-stone-400 font-mono">
                                      Qty: {it.quantity} {it.unit || "unit"} · ₹
                                      {Number(it.price).toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shipping Destination Snapshot */}
                        <div className="text-xs text-stone-400 pt-1 flex items-center gap-1.5 border-t border-white/5">
                          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">
                            Shipping: {ord.shipping_address}, {ord.shipping_city}, {ord.shipping_state} - {ord.shipping_pincode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400">
                    Manage project sites and billing addresses for fast checkout.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-14 text-center bg-[#181818] border border-white/10 rounded-3xl p-8 space-y-3">
                    <MapPin className="h-10 w-10 mx-auto text-stone-600" />
                    <h3 className="text-base font-serif font-bold text-white">No Saved Addresses</h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Add a delivery address to speed up architectural inquiries and online dispatches.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-amber-400 text-amber-300 hover:bg-amber-400/10 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                          addr.is_default
                            ? "bg-[#181818] border-amber-400/50 shadow-lg shadow-amber-500/5"
                            : "bg-[#181818] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">
                              {addr.full_name}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-amber-300 font-mono">
                            +91 {addr.phone}
                          </p>

                          <p className="text-xs text-stone-300 leading-relaxed">
                            {addr.address_line}
                            {addr.area && `, ${addr.area}`}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                            {addr.landmark && (
                              <span className="block text-stone-400 text-[11px] mt-0.5">
                                Landmark: {addr.landmark}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <span className="text-stone-600">·</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>

                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-amber-400 hover:underline cursor-pointer font-medium text-[11px]"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <div className="max-w-xl bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white">Client Profile</h3>
                  <p className="text-xs text-stone-400">
                    Update your client credentials and contact details.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className="w-full rounded-xl border border-white/10 bg-[#111111] py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="rajesh@archstudio.in"
                        className="w-full rounded-xl border border-white/10 bg-[#111111] py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Mobile Number (Verified)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="text"
                        disabled
                        value={`+91 ${user?.mobile || user?.phone || ""}`}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-mono font-medium text-stone-300 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Mobile number is verified via OTP. Log out and log in with another phone to change.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADDRESS MODAL (ADD / EDIT) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl bg-[#181818] border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAddressModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-400 font-bold block">
                DELIVERY ADDRESS
              </span>
              <h3 className="text-xl font-serif font-bold text-white">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    placeholder="e.g. Sumanth"
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="98450 00000"
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                  Site / Flat / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  placeholder="Plot 42, Prestige Green Valley Road"
                  className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={addrArea}
                    onChange={(e) => setAddrArea(e.target.value)}
                    placeholder="Whitefield / Indiranagar"
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    placeholder="Near Metro Station"
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded text-amber-400 focus:ring-amber-400"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="flex-1 py-3 border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider text-stone-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addrSaving}
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {addrSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger */}
      <LoginSignupModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default CustomerAccountPage;
