"use client";
import Link from "next/link";
import { useIsAdmin } from "@/lib/useIsAdmin";

export default function AdminNavLink() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="inline-block px-4 py-2 rounded bg-[#7a1f3d] text-white hover:opacity-90"
    >
      Manage Info
    </Link>
  );
}
