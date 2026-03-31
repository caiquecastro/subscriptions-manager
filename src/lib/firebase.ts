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
  try {
    const q = query(
      collection(db, "subscriptions"),
      orderBy("nextRenewal", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Subscription,
    );
  } catch {
    return getSampleSubscriptions();
  }
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
  try {
    const q = query(collection(db, "balances"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Balance);
  } catch {
    return getSampleBalances();
  }
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

// Sample data fallback
function getSampleSubscriptions(): Subscription[] {
  return [
    {
      id: "1",
      name: "Netflix",
      category: "Entertainment",
      cost: 15.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-15",
      status: "active",
      icon: "movie",
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      name: "Spotify",
      category: "Entertainment",
      cost: 10.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-08",
      status: "active",
      icon: "music_note",
      createdAt: "2025-01-01",
    },
    {
      id: "3",
      name: "iCloud+",
      category: "Cloud Storage",
      cost: 2.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-02",
      status: "active",
      icon: "cloud",
      createdAt: "2025-01-01",
    },
    {
      id: "4",
      name: "Adobe Creative Cloud",
      category: "Productivity",
      cost: 54.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-01",
      status: "active",
      icon: "palette",
      createdAt: "2025-01-01",
    },
    {
      id: "5",
      name: "Cloud Hosting Pro",
      category: "Infrastructure",
      cost: 142.0,
      billingCycle: "monthly",
      nextRenewal: "2026-04-20",
      status: "active",
      icon: "dns",
      createdAt: "2025-01-01",
    },
    {
      id: "6",
      name: "LinkedIn Premium",
      category: "Professional",
      cost: 29.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-12",
      status: "active",
      icon: "work",
      createdAt: "2025-01-01",
    },
    {
      id: "7",
      name: "Gym Membership",
      category: "Health",
      cost: 49.99,
      billingCycle: "monthly",
      nextRenewal: "2026-04-05",
      status: "active",
      icon: "fitness_center",
      createdAt: "2025-01-01",
    },
    {
      id: "8",
      name: "NextGrid Electric",
      category: "Utilities",
      cost: 89.0,
      billingCycle: "monthly",
      nextRenewal: "2026-04-18",
      status: "active",
      icon: "bolt",
      createdAt: "2025-01-01",
    },
    {
      id: "9",
      name: "GitHub Pro",
      category: "Development",
      cost: 4.0,
      billingCycle: "monthly",
      nextRenewal: "2026-04-10",
      status: "active",
      icon: "code",
      createdAt: "2025-01-01",
    },
    {
      id: "10",
      name: "Figma",
      category: "Design",
      cost: 12.0,
      billingCycle: "monthly",
      nextRenewal: "2026-04-22",
      status: "active",
      icon: "design_services",
      createdAt: "2025-01-01",
    },
    {
      id: "11",
      name: "AWS Services",
      category: "Infrastructure",
      cost: 67.5,
      billingCycle: "monthly",
      nextRenewal: "2026-04-25",
      status: "active",
      icon: "cloud_queue",
      createdAt: "2025-01-01",
    },
    {
      id: "12",
      name: "Notion",
      category: "Productivity",
      cost: 8.0,
      billingCycle: "monthly",
      nextRenewal: "2026-04-14",
      status: "active",
      icon: "edit_note",
      createdAt: "2025-01-01",
    },
  ];
}

function getSampleBalances(): Balance[] {
  return [
    {
      id: "1",
      name: "Apple ID",
      type: "Store Credit",
      amount: 247.5,
      icon: "phone_iphone",
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      name: "Google Play",
      type: "Store Credit",
      amount: 82.3,
      icon: "play_circle",
      createdAt: "2025-01-01",
    },
    {
      id: "3",
      name: "Amazon Gift Card",
      type: "Gift Card",
      amount: 500.0,
      expiresAt: "2027-06-15",
      icon: "shopping_cart",
      createdAt: "2025-01-01",
    },
    {
      id: "4",
      name: "Amex Rewards",
      type: "Reward Points",
      amount: 12450,
      icon: "credit_card",
      createdAt: "2025-01-01",
    },
    {
      id: "5",
      name: "Starbucks",
      type: "Store Credit",
      amount: 34.2,
      icon: "coffee",
      createdAt: "2025-01-01",
    },
    {
      id: "6",
      name: "Uber Credits",
      type: "Ride Credits",
      amount: 45.0,
      expiresAt: "2026-12-31",
      icon: "directions_car",
      createdAt: "2025-01-01",
    },
    {
      id: "7",
      name: "Steam Wallet",
      type: "Store Credit",
      amount: 127.8,
      icon: "sports_esports",
      createdAt: "2025-01-01",
    },
    {
      id: "8",
      name: "DoorDash Credits",
      type: "Food Credits",
      amount: 25.0,
      expiresAt: "2026-06-30",
      icon: "restaurant",
      createdAt: "2025-01-01",
    },
  ];
}
