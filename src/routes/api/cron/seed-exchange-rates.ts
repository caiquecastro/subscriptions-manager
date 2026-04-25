import { createFileRoute } from "@tanstack/react-router";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const credential = serviceAccount
    ? cert(JSON.parse(serviceAccount))
    : applicationDefault();
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;
  return initializeApp({ credential, projectId });
}

async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=USD&to=BRL,EUR"
  );
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
  const data = (await res.json()) as { rates: Record<string, number> };
  return { USD: 1, ...data.rates };
}

export const Route = createFileRoute("/api/cron/seed-exchange-rates")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        try {
          const app = getAdminApp();
          const db = getFirestore(app);
          const rates = await fetchRates();
          await db.doc("exchangeRates/latest").set({
            base: "USD",
            rates,
            updatedAt: new Date().toISOString(),
          });
          return Response.json({ ok: true, rates });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
