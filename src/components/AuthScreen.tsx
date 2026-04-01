import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function AuthScreen() {
  const [signingIn, setSigningIn] = useState(false);
  const {
    allowedEmail,
    error,
    unauthorizedEmail,
    signInWithGoogle,
  } = useAuth();

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="grid w-full gap-8 rounded-[32px] bg-surface-container-lowest p-8 ambient-shadow lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Private portfolio access
            </div>
            <div className="space-y-3">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface lg:text-5xl">
                Sign in to access your Vault dashboard.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
                Your subscriptions and balances are now stored in a private
                Firebase namespace tied to your Google account.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Access
                </p>
                <p className="mt-2 text-sm font-medium text-on-surface">
                  Google sign-in only
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Storage
                </p>
                <p className="mt-2 text-sm font-medium text-on-surface">
                  Firestore data scoped per user
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Allowlist
                </p>
                <p className="mt-2 text-sm font-medium text-on-surface">
                  {allowedEmail ?? "Any signed-in Google user"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[28px] bg-surface-container-low p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="signature-gradient flex h-11 w-11 items-center justify-center rounded-2xl">
                <span className="material-symbols-outlined text-[22px] text-on-primary">
                  shield
                </span>
              </div>
              <div>
                <p className="font-headline text-xl font-bold text-on-surface">
                  Vault
                </p>
                <p className="text-sm text-on-surface-variant">
                  Personal subscription control center
                </p>
              </div>
            </div>

            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="flex items-center justify-center gap-3 rounded-2xl bg-on-surface px-5 py-3 text-sm font-semibold text-surface transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined text-[20px]">
                login
              </span>
              {signingIn ? "Connecting to Google..." : "Continue with Google"}
            </button>

            {unauthorizedEmail && (
              <div className="mt-4 rounded-2xl bg-error-container/40 p-4 text-sm text-on-error-container">
                <p className="font-semibold">Unauthorized account</p>
                <p className="mt-1">
                  {unauthorizedEmail} is not allowed to access this Vault.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl bg-error-container/40 p-4 text-sm text-on-error-container">
                <p className="font-semibold">Sign-in failed</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            <p className="mt-6 text-xs leading-5 text-on-surface-variant">
              Set <code>VITE_ALLOWED_EMAIL</code> to restrict access to a single
              Google account. Leave it unset to allow any signed-in Google user.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
