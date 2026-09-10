import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, 
  deleteDoc, onSnapshot, query, where, orderBy 
} from "firebase/firestore";
import { db } from "./firebase";
import { Customer, Hub, AuditLog } from "./data";

const CUSTOMERS_COLLECTION = "customers";
const HUBS_COLLECTION = "hubs";
const AUDIT_LOGS_COLLECTION = "auditLogs";

// ----------------------------------------------------
// CUSTOMERS CRUD & REAL-TIME SUBSCRIPTIONS
// ----------------------------------------------------

export function subscribeCustomers(callback: (customers: Customer[]) => void) {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: Customer[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Customer);
    });
    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(list);
  }, (error) => {
    console.warn("Firestore customers subscription notice:", error);
    callback([]);
  });
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: Customer[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Customer);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch (error) {
    console.error("Error fetching customers from Firestore:", error);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    return null;
  }
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

  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await setDoc(docRef, customer);

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
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await updateDoc(docRef, { ...data });

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
  // Delete customer doc
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await deleteDoc(docRef);

  // Delete associated hubs if any
  try {
    const q = query(collection(db, HUBS_COLLECTION), where("customerId", "==", id));
    const snapshot = await getDocs(q);
    for (const hubDoc of snapshot.docs) {
      await deleteDoc(hubDoc.ref);
    }
  } catch (err) {
    console.warn("Could not delete associated hubs:", err);
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
  const colRef = collection(db, HUBS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: Hub[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Hub);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(list);
  }, (error) => {
    console.warn("Firestore hubs subscription notice:", error);
    callback([]);
  });
}

export async function getHubs(): Promise<Hub[]> {
  try {
    const colRef = collection(db, HUBS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: Hub[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Hub);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch (error) {
    console.error("Error fetching hubs from Firestore:", error);
    return [];
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
    return null;
  } catch (error) {
    console.error(`Error querying hub for slug ${slug}:`, error);
    return null;
  }
}

export async function getHubByCustomerId(customerId: string): Promise<Hub | null> {
  try {
    const q = query(collection(db, HUBS_COLLECTION), where("customerId", "==", customerId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Hub;
    }
    return null;
  } catch (error) {
    console.error(`Error querying hub for customerId ${customerId}:`, error);
    return null;
  }
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

  const docRef = doc(db, HUBS_COLLECTION, id);
  await setDoc(docRef, hub);

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
  const docRef = doc(db, HUBS_COLLECTION, id);
  await updateDoc(docRef, { ...data });

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
  const docRef = doc(db, HUBS_COLLECTION, id);
  await deleteDoc(docRef);

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
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: AuditLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
    });
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    callback(list);
  }, (error) => {
    console.warn("Firestore audit logs subscription notice:", error);
    callback([]);
  });
}

export async function logAudit(data: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  try {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const log: AuditLog = {
      id,
      ...data,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, AUDIT_LOGS_COLLECTION, id), log);
  } catch (err) {
    console.warn("Could not write audit log to Firestore:", err);
  }
}
