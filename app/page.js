// app/page.js
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <SignedOut>
        <p>You’re signed out.</p>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <h1>🎉 Signed in — welcome!</h1>
        <UserButton />
      </SignedIn>
    </main>
  );
}
