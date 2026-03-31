import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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

// Subscriptions
export async function getSubscriptions(): Promise<Subscription[]> {
  const q = query(
    collection(db, "subscriptions"),
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
  return withTimeout(
    addDoc(
      collection(db, "subscriptions"),
      stripUndefined({ ...sub, createdAt: new Date().toISOString() }),
    ),
  );
}

export async function updateSubscription(
  id: string,
  data: Partial<Subscription>,
) {
  return withTimeout(updateDoc(doc(db, "subscriptions", id), data));
}

export async function deleteSubscription(id: string) {
  return withTimeout(deleteDoc(doc(db, "subscriptions", id)));
}

// Balances
export async function getBalances(): Promise<Balance[]> {
  const q = query(collection(db, "balances"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Balance);
}

export async function addBalance(bal: Omit<Balance, "id" | "createdAt">) {
  return withTimeout(
    addDoc(
      collection(db, "balances"),
      stripUndefined({ ...bal, createdAt: new Date().toISOString() }),
    ),
  );
}

export async function updateBalance(id: string, data: Partial<Balance>) {
  return withTimeout(updateDoc(doc(db, "balances", id), data));
}

export async function deleteBalance(id: string) {
  return withTimeout(deleteDoc(doc(db, "balances", id)));
}
