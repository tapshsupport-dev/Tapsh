import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, 
  deleteDoc, onSnapshot, query, where 
} from "firebase/firestore";
import { db } from "./firebase";
import { Customer, Hub, AuditLog } from "./data";

const CUSTOMERS_COLLECTION = "customers";
const HUBS_COLLECTION = "hubs";
const AUDIT_LOGS_COLLECTION = "auditLogs";

const LS_CUSTOMERS_KEY = "tapsh_cached_customers";
const LS_HUBS_KEY = "tapsh_cached_hubs";
const LS_LOGS_KEY = "tapsh_cached_audit_logs";

// Status flag for Firestore permissions
let firestorePermissionDenied = false;
const permissionListeners: Array<(denied: boolean) => void> = [];

export function isFirestorePermissionDenied() {
  return firestorePermissionDenied;
}

export function onFirestorePermissionChange(callback: (denied: boolean) => void) {
  permissionListeners.push(callback);
  callback(firestorePermissionDenied);
  return () => {
    const idx = permissionListeners.indexOf(callback);
    if (idx !== -1) permissionListeners.splice(idx, 1);
  };
}

function notifyPermissionDenied(denied: boolean) {
  if (firestorePermissionDenied !== denied) {
    firestorePermissionDenied = denied;
    permissionListeners.forEach(fn => fn(denied));
  }
}

// ----------------------------------------------------
// LOCAL STORAGE HELPERS
// ----------------------------------------------------

function getLocalCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LS_CUSTOMERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomers(list: Customer[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_CUSTOMERS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("tapsh_customers_updated", { detail: list }));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function getLocalHubs(): Hub[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LS_HUBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalHubs(list: Hub[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_HUBS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("tapsh_hubs_updated", { detail: list }));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function getLocalLogs(): AuditLog[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LS_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(list: AuditLog[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_LOGS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("tapsh_logs_updated", { detail: list }));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// ----------------------------------------------------
// CUSTOMERS CRUD & REAL-TIME SUBSCRIPTIONS
// ----------------------------------------------------

export function subscribeCustomers(callback: (customers: Customer[]) => void) {
  // Immediately emit current local state for 0ms initial render
  const localList = getLocalCustomers();
  callback(localList);

  // Listen to local storage updates from other tabs / actions
  const handleLocalUpdate = (e: any) => {
    callback(e.detail || getLocalCustomers());
  };
  if (typeof window !== "undefined") {
    window.addEventListener("tapsh_customers_updated", handleLocalUpdate);
  }

  // Attempt real-time Firestore subscription
  let unsubFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    unsubFirestore = onSnapshot(colRef, (snapshot) => {
      notifyPermissionDenied(false);
      const list: Customer[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      // Update local storage cache
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_CUSTOMERS_KEY, JSON.stringify(list));
      }
      callback(list);
    }, (error) => {
      if (error?.code === "permission-denied") {
        notifyPermissionDenied(true);
      }
      // On Firestore error, retain and emit local customer list
      callback(getLocalCustomers());
    });
  } catch (err: any) {
    console.warn("Firestore snapshot error:", err);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("tapsh_customers_updated", handleLocalUpdate);
    }
    if (unsubFirestore) unsubFirestore();
  };
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    notifyPermissionDenied(false);
    const list: Customer[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Customer);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    saveLocalCustomers(list);
    return list;
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
    return getLocalCustomers();
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Customer;
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
  }
  // Fallback to local cache
  const local = getLocalCustomers();
  return local.find(c => c.id === id) || null;
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const id = data.id || `cus_${Date.now()}`;
  const now = new Date().toISOString();
  
  const customer: Customer = {
    id,
    businessName: data.businessName || "New Enterprise Client",
    contactPerson: data.contactPerson || "Primary Contact",
    phone: data.phone || "+91 99000 00000",
    email: data.email || `contact@${id}.com`,
    address: data.address || "Commercial Premises",
    city: data.city || "India",
    businessType: (data.businessType as any) || "Other",
    notes: data.notes || "Registered via TAPSH Admin.",
    status: data.status || "ACTIVE",
    createdAt: data.createdAt || now
  };

  // 1. Immediately persist locally
  const current = getLocalCustomers();
  const updated = [customer, ...current.filter(c => c.id !== id)];
  saveLocalCustomers(updated);

  // 2. Attempt Firestore sync
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await setDoc(docRef, customer);
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
      console.warn("Firestore permissions locked. Customer saved in local store.");
    }
  }

  await logAudit({
    entityType: "CUSTOMER",
    entityId: id,
    field: "creation",
    oldValue: "None",
    newValue: `Created ${customer.businessName}`,
    changedBy: "tapsh.support@gmail.com"
  });

  return customer;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  // 1. Immediately update locally
  const current = getLocalCustomers();
  const updated = current.map(c => c.id === id ? { ...c, ...data } : c);
  saveLocalCustomers(updated);

  // 2. Attempt Firestore sync
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(docRef, { ...data });
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
      console.warn("Firestore permissions locked. Customer update saved in local store.");
    }
  }

  await logAudit({
    entityType: "CUSTOMER",
    entityId: id,
    field: "profile",
    oldValue: "Updated record",
    newValue: JSON.stringify(data),
    changedBy: "tapsh.support@gmail.com"
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  // 1. Immediately delete locally
  const current = getLocalCustomers();
  const updated = current.filter(c => c.id !== id);
  saveLocalCustomers(updated);

  const currentHubs = getLocalHubs();
  const updatedHubs = currentHubs.filter(h => h.customerId !== id);
  saveLocalHubs(updatedHubs);

  // 2. Attempt Firestore sync
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await deleteDoc(docRef);

    const q = query(collection(db, HUBS_COLLECTION), where("customerId", "==", id));
    const snapshot = await getDocs(q);
    for (const hubDoc of snapshot.docs) {
      await deleteDoc(hubDoc.ref);
    }
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
      console.warn("Firestore permissions locked. Customer deletion applied in local store.");
    }
  }

  await logAudit({
    entityType: "CUSTOMER",
    entityId: id,
    field: "status",
    oldValue: "ACTIVE",
    newValue: "DELETED",
    changedBy: "tapsh.support@gmail.com"
  });
}

// ----------------------------------------------------
// HUBS CRUD & REAL-TIME SUBSCRIPTIONS
// ----------------------------------------------------

export function subscribeHubs(callback: (hubs: Hub[]) => void) {
  const localList = getLocalHubs();
  callback(localList);

  const handleLocalUpdate = (e: any) => {
    callback(e.detail || getLocalHubs());
  };
  if (typeof window !== "undefined") {
    window.addEventListener("tapsh_hubs_updated", handleLocalUpdate);
  }

  let unsubFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, HUBS_COLLECTION);
    unsubFirestore = onSnapshot(colRef, (snapshot) => {
      notifyPermissionDenied(false);
      const list: Hub[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Hub);
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_HUBS_KEY, JSON.stringify(list));
      }
      callback(list);
    }, (error) => {
      if (error?.code === "permission-denied") {
        notifyPermissionDenied(true);
      }
      callback(getLocalHubs());
    });
  } catch (err: any) {
    console.warn("Firestore hubs snapshot error:", err);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("tapsh_hubs_updated", handleLocalUpdate);
    }
    if (unsubFirestore) unsubFirestore();
  };
}

export async function getHubs(): Promise<Hub[]> {
  try {
    const colRef = collection(db, HUBS_COLLECTION);
    const snapshot = await getDocs(colRef);
    notifyPermissionDenied(false);
    const list: Hub[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Hub);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    saveLocalHubs(list);
    return list;
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
    return getLocalHubs();
  }
}

export async function getHubBySlug(slug: string): Promise<Hub | null> {
  try {
    const q = query(collection(db, HUBS_COLLECTION), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Hub;
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
  }
  const local = getLocalHubs();
  return local.find(h => h.slug === slug) || null;
}

export async function getHubByCustomerId(customerId: string): Promise<Hub | null> {
  try {
    const q = query(collection(db, HUBS_COLLECTION), where("customerId", "==", customerId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Hub;
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
  }
  const local = getLocalHubs();
  return local.find(h => h.customerId === customerId) || null;
}

export async function createHub(data: Partial<Hub>): Promise<Hub> {
  const id = data.id || `hub_${Date.now()}`;
  const now = new Date().toISOString();
  const slug = data.slug || (data.businessName || "hub").toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const hub: Hub = {
    id,
    customerId: data.customerId || `cus_${Date.now()}`,
    slug,
    businessName: data.businessName || "TAPSH Hub",
    businessType: data.businessType || "Other",
    shortDescription: data.shortDescription || "Welcome to our space.",
    logoUrl: data.logoUrl || "",
    coverUrl: data.coverUrl || "",
    accentColor: data.accentColor || "#554940",
    greetingMessage: data.greetingMessage || "Thank you ♡",
    phone: data.phone || "",
    whatsapp: data.whatsapp || "",
    status: data.status || "ACTIVE",
    links: data.links || [],
    createdAt: data.createdAt || now
  };

  // 1. Immediately persist locally
  const current = getLocalHubs();
  const updated = [hub, ...current.filter(h => h.id !== id)];
  saveLocalHubs(updated);

  // 2. Attempt Firestore sync
  try {
    const docRef = doc(db, HUBS_COLLECTION, id);
    await setDoc(docRef, hub);
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
      console.warn("Firestore permissions locked. Hub saved in local store.");
    }
  }

  await logAudit({
    entityType: "HUB",
    entityId: id,
    field: "creation",
    oldValue: "None",
    newValue: `Created Hub tapsh.in/h/${slug}`,
    changedBy: "tapsh.support@gmail.com"
  });

  return hub;
}

export async function updateHub(id: string, data: Partial<Hub>): Promise<void> {
  const current = getLocalHubs();
  const updated = current.map(h => h.id === id ? { ...h, ...data } : h);
  saveLocalHubs(updated);

  try {
    const docRef = doc(db, HUBS_COLLECTION, id);
    await updateDoc(docRef, { ...data });
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
  }

  await logAudit({
    entityType: "HUB",
    entityId: id,
    field: "configuration",
    oldValue: "Updated hub",
    newValue: JSON.stringify(data),
    changedBy: "tapsh.support@gmail.com"
  });
}

export async function deleteHub(id: string): Promise<void> {
  const current = getLocalHubs();
  const updated = current.filter(h => h.id !== id);
  saveLocalHubs(updated);

  try {
    const docRef = doc(db, HUBS_COLLECTION, id);
    await deleteDoc(docRef);
    notifyPermissionDenied(false);
  } catch (err: any) {
    if (err?.code === "permission-denied") {
      notifyPermissionDenied(true);
    }
  }

  await logAudit({
    entityType: "HUB",
    entityId: id,
    field: "status",
    oldValue: "ACTIVE",
    newValue: "DELETED",
    changedBy: "tapsh.support@gmail.com"
  });
}

// ----------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------

export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const localList = getLocalLogs();
  callback(localList);

  const handleLocalUpdate = (e: any) => {
    callback(e.detail || getLocalLogs());
  };
  if (typeof window !== "undefined") {
    window.addEventListener("tapsh_logs_updated", handleLocalUpdate);
  }

  let unsubFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, AUDIT_LOGS_COLLECTION);
    unsubFirestore = onSnapshot(colRef, (snapshot) => {
      notifyPermissionDenied(false);
      const list: AuditLog[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
      });
      list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_LOGS_KEY, JSON.stringify(list));
      }
      callback(list);
    }, (error) => {
      if (error?.code === "permission-denied") {
        notifyPermissionDenied(true);
      }
      callback(getLocalLogs());
    });
  } catch (err: any) {
    console.warn("Firestore audit logs snapshot error:", err);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("tapsh_logs_updated", handleLocalUpdate);
    }
    if (unsubFirestore) unsubFirestore();
  };
}

export async function logAudit(data: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const log: AuditLog = {
    id,
    ...data,
    timestamp: new Date().toISOString()
  };

  const current = getLocalLogs();
  saveLocalLogs([log, ...current]);

  try {
    await setDoc(doc(db, AUDIT_LOGS_COLLECTION, id), log);
  } catch (err: any) {
    // Silently fall back to local log
  }
}
