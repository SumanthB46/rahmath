import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Mubarak Tiles & Ceramics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoot,
});

function AdminRoot() {
  const navigate = useNavigate();
  const router = useRouterState();
  const { isAuthenticated, initialized } = useAdminAuth();
  const isLoginPage = router.location.pathname === "/admin/login";

  useEffect(() => {
    if (initialized && !isAuthenticated && !isLoginPage) {
      navigate({ to: "/admin/login" });
    }
  }, [initialized, isAuthenticated, isLoginPage, navigate]);

  if (!initialized && !isLoginPage) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (initialized && !isAuthenticated && !isLoginPage) {
    return null;
  }

  return <Outlet />;
}
