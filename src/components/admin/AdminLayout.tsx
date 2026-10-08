import React, { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Truck,
  Boxes,
  Users,
  Percent,
  Star,
  Image as ImageIcon,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  LayoutGrid,
  BookOpen,
  Film,
  MessageSquare,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import api from "@/lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Homepage CMS", href: "/admin/homepage", icon: LayoutGrid },
  { name: "Video Blog / Reels", href: "/admin/reels", icon: Film },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Catalogue Library", href: "/admin/catalogs", icon: BookOpen },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Delivery", href: "/admin/delivery", icon: Truck },
  { name: "Inventory", href: "/admin/inventory", icon: Boxes },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Discounts", href: "/admin/discounts", icon: Percent },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Banners", href: "/admin/banners", icon: ImageIcon },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { admin, isAuthenticated, initialized, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentPath = router.location.pathname;

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [initialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      api.admin
        .getNotifications()
        .then((res: any) => {
          if (res.unreadCount !== undefined) {
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentPath]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F5F0] text-stone-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest text-stone-600 font-mono">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-theme-cream flex h-screen h-[100dvh] bg-[#F7F5F0] text-stone-900 font-sans overflow-hidden selection:bg-amber-200 selection:text-amber-950">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-[#EFEBE3] border-r border-[#E2DBD0] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#E2DBD0] bg-[#E6E0D4]">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-800 font-serif font-bold text-sm tracking-wider group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif">
                Mubarak Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-800 font-semibold">
                Admin Control
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-stone-500 hover:text-stone-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-stone-300">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? currentPath === "/admin" || currentPath === "/admin/"
                : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-amber-600/15 text-amber-950 font-semibold border border-amber-600/30 shadow-xs"
                    : "text-stone-700 hover:bg-stone-200/70 hover:text-stone-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-amber-800" : "text-stone-500 group-hover:text-stone-800"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                {item.name === "Delivery" && (
                  <span className="text-[9px] font-mono uppercase text-amber-800 bg-amber-600/15 px-1.5 py-0.5 rounded border border-amber-600/25">
                    Manual
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User & Logout */}
        <div className="border-t border-[#E2DBD0] p-3.5 bg-[#E6E0D4]">
          <div className="flex items-center justify-between rounded-xl bg-white/90 p-2.5 border border-[#E2DBD0] shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-stone-900">
                  {admin?.name || "Administrator"}
                </span>
                <span className="truncate text-[10px] text-stone-600">{admin?.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="flex h-16 items-center justify-between border-b border-[#E2DBD0] bg-[#FAF7F2] px-3 sm:px-6 lg:px-8 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/60 hover:text-stone-950 lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest hidden md:inline shrink-0">
                Admin
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400 hidden md:inline shrink-0" />
              <h1 className="text-xs sm:text-sm md:text-base font-semibold text-stone-900 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-none">
                {pageTitle || "Mubarak Tiles & Ceramics"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Storefront Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="View live website"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DBD0] bg-white px-2.5 sm:px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-amber-500/50 hover:text-amber-900 hover:bg-amber-50/50 transition-colors shadow-2xs"
            >
              <span className="hidden sm:inline">Live Website</span>
              <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
            </a>

            {/* Notification Bell */}
            <Link
              to="/admin/notifications"
              className="relative rounded-lg border border-[#E2DBD0] bg-white p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-colors shadow-2xs"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Admin Badge */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-100/90 px-2.5 py-1 border border-amber-300/80 text-[11px] text-amber-900 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              <span>Admin Mode</span>
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 overflow-y-auto bg-[#F7F5F0] p-3 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-stone-300">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
