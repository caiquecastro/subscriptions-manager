import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getCurrentUser } from "./auth";
import { db } from "./firebase-app";

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Request timed out. Check your Firebase config and Firestore security rules.",
            ),
          ),
        ms,
      ),
    ),
  ]);
}

// Types
export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: "monthly" | "yearly" | "quarterly";
  nextRenewal: string;
  status: "active" | "paused" | "cancelled";
  icon: string;
  notes?: string;
  createdAt: string;
}

export interface Balance {
  id: string;
  name: string;
  type: string;
  amount: number;
  expiresAt?: string;
  icon: string;
  notes?: string;
  createdAt: string;
}

export function getUserCollectionPath(
  uid: string,
  collectionName: "subscriptions" | "balances",
) {
  return `users/${uid}/${collectionName}`;
}

function requireCurrentUser() {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to access Vault data.");
  }

  return user;
}

// Subscriptions
export async function getSubscriptions(): Promise<Subscription[]> {
  const user = requireCurrentUser();
  const q = query(
    collection(db, getUserCollectionPath(user.uid, "subscriptions")),
    orderBy("nextRenewal", "asc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Subscription);
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}

export async function addSubscription(
  sub: Omit<Subscription, "id" | "createdAt">,
) {
  const user = requireCurrentUser();
  return withTimeout(
    addDoc(
      collection(db, getUserCollectionPath(user.uid, "subscriptions")),
      stripUndefined({ ...sub, createdAt: new Date().toISOString() }),
    ),
  );
}

export async function updateSubscription(
  id: string,
  data: Partial<Subscription>,
) {
  const user = requireCurrentUser();
  return withTimeout(
    updateDoc(
      doc(db, getUserCollectionPath(user.uid, "subscriptions"), id),
      data,
    ),
  );
}

export async function deleteSubscription(id: string) {
  const user = requireCurrentUser();
  return withTimeout(
    deleteDoc(doc(db, getUserCollectionPath(user.uid, "subscriptions"), id)),
  );
}

// Balances
export async function getBalances(): Promise<Balance[]> {
  const user = requireCurrentUser();
  const q = query(
    collection(db, getUserCollectionPath(user.uid, "balances")),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Balance);
}

export async function addBalance(bal: Omit<Balance, "id" | "createdAt">) {
  const user = requireCurrentUser();
  return withTimeout(
    addDoc(
      collection(db, getUserCollectionPath(user.uid, "balances")),
      stripUndefined({ ...bal, createdAt: new Date().toISOString() }),
    ),
  );
}

export async function updateBalance(id: string, data: Partial<Balance>) {
  const user = requireCurrentUser();
  return withTimeout(
    updateDoc(doc(db, getUserCollectionPath(user.uid, "balances"), id), data),
  );
}

export async function deleteBalance(id: string) {
  const user = requireCurrentUser();
  return withTimeout(
    deleteDoc(doc(db, getUserCollectionPath(user.uid, "balances"), id)),
  );
}
