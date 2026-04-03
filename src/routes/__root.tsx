import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { useState } from "react";
import AuthScreen from "../components/AuthScreen";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { AuthProvider, useAuth } from "../lib/auth";
import { createQueryClient } from "../lib/query";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vault — Subscription & Balance Manager" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-body antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider queryClient={queryClient}>{children}</AuthProvider>
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}

function RootLayout() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-5 py-3 text-sm font-medium text-on-surface">
          <span className="material-symbols-outlined animate-spin text-[18px]">
            progress_activity
          </span>
          Checking session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-60">
        <TopBar />
        <main className="px-4 pb-24 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
