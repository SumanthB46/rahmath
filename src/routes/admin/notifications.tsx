import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  Star,
  Info,
  Check,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — Mubarak Admin" }],
  }),
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err: any) {
      toast.error("Failed to load notifications", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.admin.markNotificationRead(id);
      loadNotifications();
    } catch (err: any) {
      toast.error("Failed to update notification", { description: err.message });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.admin.markAllNotificationsRead();
      toast.success("All notifications marked as read");
      loadNotifications();
    } catch (err: any) {
      toast.error("Failed to mark all read", { description: err.message });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case "stock":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "review":
        return <Star className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-stone-400" />;
    }
  };

  return (
    <AdminLayout pageTitle="Notifications Center">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Admin Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Live operational alerts for incoming customer orders, stock thresholds, and delivery status updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 transition-colors shadow-xs"
              >
                <CheckCheck className="h-4 w-4 text-amber-400" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={loadNotifications}
              className="p-2 rounded-xl border border-stone-700/80 bg-stone-900 text-stone-400 hover:text-stone-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400">Loading Notifications...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Bell className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">All caught up!</div>
              <p className="text-xs text-stone-500">No new alerts at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800/80">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !notif.is_read ? "bg-stone-900/50" : "hover:bg-stone-900/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-stone-800 border border-stone-700/80 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-100">
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">{notif.message}</p>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.link && (
                      <Link
                        to={notif.link}
                        className="rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
