import type { QueryClient } from "@tanstack/react-query";
import type { User } from "firebase/auth";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { app } from "./firebase-app";

type AuthStatus = "loading" | "authenticated" | "signed_out";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  isAllowed: boolean;
  allowedEmail: string | null;
  unauthorizedEmail: string | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getAllowedEmail() {
  const email = import.meta.env.VITE_ALLOWED_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

export function isAuthorizedEmail(email?: string | null) {
  const allowedEmail = getAllowedEmail();
  if (!allowedEmail) return true;
  return normalizeEmail(email) === allowedEmail;
}

function getClientAuth() {
  return getAuth(app);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  return getClientAuth().currentUser;
}

export function AuthProvider({
  children,
  queryClient,
}: PropsWithChildren<{ queryClient: QueryClient }>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const auth = getClientAuth();

    void setPersistence(auth, browserLocalPersistence).catch(() => {
      setError(
        "Could not persist your session. You may need to sign in again."
      );
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      queryClient.clear();
      setError(null);

      if (!nextUser) {
        setUser(null);
        setStatus("signed_out");
        return;
      }

      if (!isAuthorizedEmail(nextUser.email)) {
        setUnauthorizedEmail(nextUser.email ?? null);
        setUser(null);
        setStatus("signed_out");
        await signOut(auth);
        return;
      }

      setUnauthorizedEmail(null);
      setUser(nextUser);
      setStatus("authenticated");
    });

    return unsubscribe;
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAllowed: user ? isAuthorizedEmail(user.email) : false,
      allowedEmail: getAllowedEmail(),
      unauthorizedEmail,
      error,
      async signInWithGoogle() {
        setError(null);
        setUnauthorizedEmail(null);

        try {
          await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
        } catch (signInError) {
          setError(
            signInError instanceof Error
              ? signInError.message
              : "Google sign-in failed. Please try again."
          );
        }
      },
      async signOutUser() {
        setError(null);
        setUnauthorizedEmail(null);
        await signOut(getClientAuth());
      },
    }),
    [error, status, unauthorizedEmail, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
