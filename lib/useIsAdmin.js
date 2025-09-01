"use client";
import { useUser } from "@clerk/nextjs";

export function useIsAdmin() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const role = user?.publicMetadata?.role;
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return role === "admin" || allowed.includes(email);
}
