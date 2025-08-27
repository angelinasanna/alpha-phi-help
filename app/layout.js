// app/layout.js
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} 

from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alpha Phi Help",
  description: "Sorority Q&A bot",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Header with auth */}
          <header className="flex justify-end items-center gap-3 p-4 border-b">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-purple-600 text-white rounded px-3 py-2">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-600 text-white rounded px-3 py-2">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
