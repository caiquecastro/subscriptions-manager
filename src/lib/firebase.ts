import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
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
              "Request timed out. Check your Firebase config and Firestore security rules."
            )
          ),
        ms
      )
    ),
  ]);
}

// Types
export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  currency?: "BRL" | "USD" | "EUR";
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

export interface Invoice {
  id: string;
  subscriptionId: string;
  date: string;
  amountBRL: number;
  status: "paid" | "pending";
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  createdAt: string;
}

export function getUserCollectionPath(
  uid: string,
  collectionName: "subscriptions" | "balances" | "invoices"
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
    orderBy("nextRenewal", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Subscription);
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

export async function addSubscription(
  sub: Omit<Subscription, "id" | "createdAt">
) {
  const user = requireCurrentUser();
  return withTimeout(
    addDoc(
      collection(db, getUserCollectionPath(user.uid, "subscriptions")),
      stripUndefined({ ...sub, createdAt: new Date().toISOString() })
    )
  );
}

export async function updateSubscription(
  id: string,
  data: Partial<Subscription>
) {
  const user = requireCurrentUser();
  return withTimeout(
    updateDoc(
      doc(db, getUserCollectionPath(user.uid, "subscriptions"), id),
      stripUndefined(data)
    )
  );
}

export async function deleteSubscription(id: string) {
  const user = requireCurrentUser();
  return withTimeout(
    deleteDoc(doc(db, getUserCollectionPath(user.uid, "subscriptions"), id))
  );
}

// Balances
export async function getBalances(): Promise<Balance[]> {
  const user = requireCurrentUser();
  const q = query(
    collection(db, getUserCollectionPath(user.uid, "balances")),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Balance);
}

export async function addBalance(bal: Omit<Balance, "id" | "createdAt">) {
  const user = requireCurrentUser();
  return withTimeout(
    addDoc(
      collection(db, getUserCollectionPath(user.uid, "balances")),
      stripUndefined({ ...bal, createdAt: new Date().toISOString() })
    )
  );
}

export async function updateBalance(id: string, data: Partial<Balance>) {
  const user = requireCurrentUser();
  return withTimeout(
    updateDoc(
      doc(db, getUserCollectionPath(user.uid, "balances"), id),
      stripUndefined(data as Record<string, unknown>)
    )
  );
}

export async function deleteBalance(id: string) {
  const user = requireCurrentUser();
  return withTimeout(
    deleteDoc(doc(db, getUserCollectionPath(user.uid, "balances"), id))
  );
}

// Invoices
export async function getInvoices(subscriptionId?: string): Promise<Invoice[]> {
  const user = requireCurrentUser();
  const colRef = collection(db, getUserCollectionPath(user.uid, "invoices"));
  const q = subscriptionId
    ? query(
        colRef,
        where("subscriptionId", "==", subscriptionId),
        orderBy("date", "desc")
      )
    : query(colRef, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice);
}

export async function addInvoice(invoice: Omit<Invoice, "id" | "createdAt">) {
  const user = requireCurrentUser();
  return withTimeout(
    addDoc(
      collection(db, getUserCollectionPath(user.uid, "invoices")),
      stripUndefined({
        ...invoice,
        createdAt: new Date().toISOString(),
      })
    )
  );
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  const user = requireCurrentUser();
  return withTimeout(
    updateDoc(doc(db, getUserCollectionPath(user.uid, "invoices"), id), data)
  );
}

export async function deleteInvoice(id: string) {
  const user = requireCurrentUser();
  return withTimeout(
    deleteDoc(doc(db, getUserCollectionPath(user.uid, "invoices"), id))
  );
}

export async function getSubscription(
  id: string
): Promise<Subscription | null> {
  const user = requireCurrentUser();
  const q = query(
    collection(db, getUserCollectionPath(user.uid, "subscriptions"))
  );
  const snapshot = await getDocs(q);
  const d = snapshot.docs.find((d) => d.id === id);
  return d ? ({ id: d.id, ...d.data() } as Subscription) : null;
}
