"use client";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

function useIsAdmin() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const role = user?.publicMetadata?.role;
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return role === "admin" || allowed.includes(email);
}

export default function AdminPage() {
  const isAdmin = useIsAdmin();

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-3">
      <SignedOut>
        <div className="p-4 border rounded bg-white/70">
          Members only—please <SignInButton>sign in</SignInButton>.
        </div>
      </SignedOut>

      <SignedIn>
        {!isAdmin ? (
          <div className="p-4 border rounded bg-white/70">Admins only.</div>
        ) : (
          <>
            {/* your existing admin UI goes here (inputs, Save button, etc.) */}
          </>
        )}
      </SignedIn>
    </main>
  );
}
