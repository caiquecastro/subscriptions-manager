import { readFile } from "node:fs/promises";
import process from "node:process";
import { parseArgs } from "node:util";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { values: args } = parseArgs({
  options: {
    "service-account": { type: "string" },
    project: { type: "string" },
  },
});

async function getCredential() {
  if (args["service-account"]) {
    const raw = await readFile(args["service-account"], "utf8");
    return cert(JSON.parse(raw));
  }
  return applicationDefault();
}

async function fetchRates() {
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=USD&to=BRL,EUR"
  );
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
  const data = await res.json();
  return { USD: 1, ...data.rates };
}

async function main() {
  const projectId = args.project ?? "subscriptions-manager-f9cdb";

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
