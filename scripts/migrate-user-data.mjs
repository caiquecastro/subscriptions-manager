import { readFile } from "node:fs/promises";
import process from "node:process";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

async function getCredential() {
  const serviceAccountPath = getArg("service-account");

  if (serviceAccountPath) {
    const raw = await readFile(serviceAccountPath, "utf8");
    return cert(JSON.parse(raw));
  }

  return applicationDefault();
}

async function migrateCollection(db, uid, collectionName, overwrite) {
  const sourceSnapshot = await db.collection(collectionName).get();

  if (sourceSnapshot.empty) {
    console.log(`No documents found in top-level ${collectionName}.`);
    return { copied: 0, skipped: 0 };
  }

  let copied = 0;
  let skipped = 0;

  for (const sourceDoc of sourceSnapshot.docs) {
    const targetRef = db
      .collection("users")
      .doc(uid)
      .collection(collectionName)
      .doc(sourceDoc.id);

    const targetDoc = await targetRef.get();

    if (targetDoc.exists && !overwrite) {
      skipped += 1;
      console.log(
        `Skipped ${collectionName}/${sourceDoc.id} (already exists).`,
      );
      continue;
    }

    await targetRef.set(sourceDoc.data());
    copied += 1;
    console.log(`Copied ${collectionName}/${sourceDoc.id}`);
  }

  return { copied, skipped };
}

async function main() {
  const uid = getArg("uid");
  const overwrite = hasFlag("overwrite");

  if (!uid) {
    console.error("Missing required --uid argument.");
    console.error(
      "Usage: node scripts/migrate-user-data.mjs --uid=<firebase-auth-uid> [--service-account=/abs/path/service-account.json] [--overwrite]",
    );
    process.exit(1);
  }

  initializeApp({
    credential: await getCredential(),
  });

  const db = getFirestore();

  console.log(`Migrating top-level data into users/${uid}/...`);
  const subscriptions = await migrateCollection(
    db,
    uid,
    "subscriptions",
    overwrite,
  );
  const balances = await migrateCollection(db, uid, "balances", overwrite);

  console.log("");
  console.log("Migration summary");
  console.log(
    `subscriptions: copied=${subscriptions.copied}, skipped=${subscriptions.skipped}`,
  );
  console.log(
    `balances: copied=${balances.copied}, skipped=${balances.skipped}`,
  );
}

main().catch((error) => {
  console.error("Migration failed.");
  console.error(error);
  process.exit(1);
});
