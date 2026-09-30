import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/catalogs")({
  beforeLoad: () => {
    throw redirect({ to: "/catalog" });
  },
});
