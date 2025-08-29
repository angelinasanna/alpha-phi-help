// app/layout.js
import {
  ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-gradient-to-b from-rose-50 to-pink-100 min-h-screen">
          {/* Global header */}
          <header className="sticky top-0 z-50 bg-white border-b">
            <div className="mx-auto max-w-5xl flex items-center gap-3 p-3">
              {/* LEFT: logo + title */}
              <div className="flex items-center gap-3">
                <Image
                  src="/alphaphi.png"     // or /aphi.svg
                  alt="Alpha Phi"
                  width={100}               // <-- bigger logo
                  height={100}
                  priority
                  unoptimized   // avoids the optimizer decoding step
                />
              </div>

              {/* RIGHT: auth */}
              <div className="ml-auto flex items-center gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-2 rounded bg-black text-white">Sign In</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="mx-auto max-w-5xl p-6">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
