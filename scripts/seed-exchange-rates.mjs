import { readFile } from "node:fs/promises";
import process from "node:process";
import { cert, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function getCredential() {
  const serviceAccountPath = getArg("service-account");
  if (serviceAccountPath) {
    const raw = await readFile(serviceAccountPath, "utf8");
    return cert(JSON.parse(raw));
  }
  return applicationDefault();
}

async function fetchRates() {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=BRL,EUR");
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
  const data = await res.json();
  return { USD: 1, ...data.rates };
}

async function main() {
  const projectId = getArg("project") ?? "subscriptions-manager-f9cdb";

  initializeApp({ credential: await getCredential(), projectId });

  const db = getFirestore();

  console.log("Fetching rates from Frankfurter API...");
  const rates = await fetchRates();

  const doc = {
    base: "USD",
    rates,
    updatedAt: new Date().toISOString(),
  };

  await db.doc("exchangeRates/latest").set(doc);

  console.log("Exchange rates saved to Firestore:");
  for (const [currency, rate] of Object.entries(rates)) {
    console.log(`  1 USD = ${rate} ${currency}`);
  }
  console.log(`  updatedAt: ${doc.updatedAt}`);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  console.error(
    "\nUsage: node scripts/seed-exchange-rates.mjs [--service-account=/path/to/key.json] [--project=<project-id>]"
  );
  process.exit(1);
});
