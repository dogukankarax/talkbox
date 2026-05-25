import { getToken } from "@/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const token = getToken();
    throw redirect({ to: token ? "/channels" : "/login" });
  },
  component: () => null,
});
