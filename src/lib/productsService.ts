import { db, storage } from "./firebase";
import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "./assetsService";

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  price?: number; // Price ₹ (Recommended)
  salePrice?: number; // Sale price ₹
  description?: string; // Description (optional)
  link?: string; // Link (optional, e.g. WhatsApp Catalog Link)
  itemCode?: string; // Item code (optional)
  images: string[]; // Multiple image URLs or compressed Data URLs
  // Optional / backwards-compatibility fields
  tagline?: string;
  benefit?: string;
  iconType?: "star" | "wifi" | "message" | "camera" | "globe" | "grid" | "sparkles";
  category?: string;
  badge?: string;
  features?: string[];
  status: "ACTIVE" | "DRAFT";
  createdAt: string;
  updatedAt: string;
}

/**
 * Generates direct WhatsApp quote link sending message to TAPSH Business WhatsApp with selected product details.
 */
export function getProductWhatsAppQuoteUrl(product: ProductItem): string {
  const businessNumber = "917977469926";
  const lines: string[] = [
    `Hello TAPSH, I would like to raise a quote for:`,
    `• *Product:* ${product.name}`,
  ];

  if (product.itemCode && product.itemCode.trim()) {
    lines.push(`• *Item Code:* ${product.itemCode.trim()}`);
  }

  if (product.salePrice && product.salePrice > 0) {
    if (product.price && product.price > product.salePrice) {
      lines.push(`• *Price:* ₹${product.salePrice.toLocaleString("en-IN")} (Regular: ₹${product.price.toLocaleString("en-IN")})`);
    } else {
      lines.push(`• *Price:* ₹${product.salePrice.toLocaleString("en-IN")}`);
    }
  } else if (product.price && product.price > 0) {
    lines.push(`• *Price:* ₹${product.price.toLocaleString("en-IN")}`);
  }

  if (product.link && product.link.trim()) {
    lines.push(`• *WhatsApp Catalog Link:* ${product.link.trim()}`);
  }

  lines.push(`\nPlease share commercial quotation, availability, and delivery options.`);
  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

const PRODUCTS_COLLECTION = "site_products";
const LOCAL_STORAGE_KEY = "tapsh_site_products";

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "prod-review",
    slug: "tapsh-review",
    name: "TAPSH Review",
    price: 1999,
    salePrice: 1499,
    description: "Capture 5-star Google and TripAdvisor reviews while your customers are on-premises and engaged.",
    link: "",
    itemCode: "TAP-REV-01",
    tagline: "Make it effortless for customers to leave 5-star reviews.",
    benefit: "Increase your Google & TripAdvisor ratings instantly.",
    images: [],
    iconType: "star",
    category: "Reputation",
    badge: "Most Popular",
    features: [
      "Instant 1-tap Google Review redirection",
      "Works with all modern NFC phones & universal QR",
      "No app download required for guests",
      "Managed by TAPSH team"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-wifi",
    slug: "tapsh-wifi",
    name: "TAPSH Wi-Fi",
    price: 1499,
    salePrice: 999,
    description: "No more printing complex passwords on paper menus or repeating Wi-Fi credentials all day.",
    link: "",
    itemCode: "TAP-WIFI-01",
    tagline: "Connect guests to your network with a single tap.",
    benefit: "No more printing complex passwords.",
    images: [],
    iconType: "wifi",
    category: "Connectivity",
    badge: "Essential",
    features: [
      "Instant Wi-Fi auto-join on supported devices",
      "Fallback QR code for all camera apps",
      "Eliminates staff password inquiries",
      "Durable water-resistant acrylic finish"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-whatsapp",
    slug: "tapsh-whatsapp",
    name: "TAPSH WhatsApp",
    price: 1499,
    salePrice: 999,
    description: "Connect customers straight into your WhatsApp channel for instant support, bookings, or inquiries.",
    link: "",
    itemCode: "TAP-WA-01",
    tagline: "Direct customers straight to your WhatsApp business chat.",
    benefit: "Capture leads and provide instant support.",
    images: [],
    iconType: "message",
    category: "Communication",
    badge: "High Conversion",
    features: [
      "Pre-filled inquiry templates for customers",
      "Direct connection to your business phone",
      "Zero friction lead capture",
      "Permanent customizable phone link"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-instagram",
    slug: "tapsh-instagram",
    name: "TAPSH Instagram",
    price: 1499,
    salePrice: 999,
    description: "Transform your foot traffic into loyal online followers and social engagement effortlessly.",
    link: "",
    itemCode: "TAP-IG-01",
    tagline: "Grow your social following directly from your physical space.",
    benefit: "Turn offline visitors into online followers.",
    images: [],
    iconType: "camera",
    category: "Social",
    badge: "Engagement",
    features: [
      "Opens directly in user's native Instagram app",
      "Instant profile follow and tagged stories",
      "Boosts organic local reach",
      "Ideal for checkout counters and tables"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-website",
    slug: "tapsh-website",
    name: "TAPSH Website",
    price: 1799,
    salePrice: 1299,
    description: "Seamlessly bridge your physical location to your online menu, booking engine, or website.",
    link: "",
    itemCode: "TAP-WEB-01",
    tagline: "Drive foot traffic to your online menus, booking pages, or store.",
    benefit: "Seamlessly bridge physical to digital.",
    images: [],
    iconType: "globe",
    category: "Web",
    badge: "Versatile",
    features: [
      "Direct link to digital PDF menu or web ordering",
      "Supports dynamic URL updates at any time",
      "Universal NFC + QR dual technology",
      "No replacement of physical card needed"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-all-in-one",
    slug: "tapsh-all-in-one",
    name: "TAPSH All-in-One",
    price: 2499,
    salePrice: 1999,
    description: "One single smart touchpoint that presents your custom micro-landing page with all your links.",
    link: "",
    itemCode: "TAP-AIO-01",
    tagline: "The ultimate solution powered by TAPSH Hub.",
    benefit: "One tap opens a custom menu of all your digital links.",
    images: [],
    iconType: "grid",
    category: "Hub Suite",
    badge: "Flagship",
    features: [
      "Combines Wi-Fi, Reviews, WhatsApp, Menu & Socials",
      "Live analytics and guest tap insights",
      "Branded specifically for your enterprise",
      "Complete managed setup by TAPSH team"
    ],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }
];

export function getLocalCachedProducts(): ProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw === null) {
      // First time visiting site: initialize with defaults
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: ProductItem) => {
      const def = DEFAULT_PRODUCTS.find((p) => p.id === item.id || p.slug === item.slug);
      return {
        ...def,
        ...item,
      };
    });
  } catch (err) {
    console.warn("Failed to read local products cache:", err);
    return [];
  }
}

export function setLocalCachedProducts(products: ProductItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn("Failed to write local products cache:", err);
  }
}

/**
 * Subscribes to real-time products in Firestore with localStorage fallback.
 */
export function subscribeToProducts(
  callback: (products: ProductItem[]) => void
): () => void {
  // 1. Immediately emit local cache
  const local = getLocalCachedProducts();
  callback(local);

  try {
    const collRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(collRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Map actual documents live in Firestore
        // If products are deleted by the admin, snapshot immediately reflects that deletion across the web
        const items = snapshot.docs.map((d) => {
          const data = d.data() as ProductItem;
          const def = DEFAULT_PRODUCTS.find((p) => p.id === d.id || p.slug === data.slug);
          return {
            ...def,
            ...data,
            id: d.id,
          };
        }) as ProductItem[];
        setLocalCachedProducts(items);
        callback(items);
      },
      (err) => {
        console.warn("Real-time products snapshot failed, using local cache:", err);
        callback(getLocalCachedProducts());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed to setup Firestore products subscription:", err);
    return () => {};
  }
}

/**
 * Seed default products to Firestore if collection is empty.
 */
export async function seedDefaultProductsToFirestore() {
  try {
    for (const prod of DEFAULT_PRODUCTS) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, prod, { merge: true });
    }
  } catch (err) {
    console.warn("Could not seed default products to Firestore (permissions or offline):", err);
  }
}

/**
 * Upload an image file for a product (Firebase Storage with canvas compression Data URL fallback).
 */
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  try {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageRef = ref(storage, `products/${productId}/${Date.now()}_${sanitizedName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (storageErr) {
    console.warn("Firebase storage upload unavailable, compressing to Data URL:", storageErr);
    return await compressImage(file, 1200, 0.85);
  }
}

/**
 * Save or update a product in Firestore and local storage.
 */
export async function saveProduct(product: Partial<ProductItem>): Promise<ProductItem> {
  const local = getLocalCachedProducts();
  const id = product.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  // Create clean slug
  const baseSlug = product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "tapsh-product";
  const slug = product.slug || baseSlug;

  const updatedProduct: ProductItem = {
    id,
    slug,
    name: product.name || "Untitled TAPSH Product",
    price: product.price !== undefined && product.price !== null && !isNaN(Number(product.price)) ? Number(product.price) : undefined,
    salePrice: product.salePrice !== undefined && product.salePrice !== null && !isNaN(Number(product.salePrice)) ? Number(product.salePrice) : undefined,
    description: product.description || "",
    link: product.link || "",
    itemCode: product.itemCode || "",
    images: Array.isArray(product.images) ? product.images : [],
    tagline: product.tagline || "",
    benefit: product.benefit || "",
    iconType: product.iconType || "sparkles",
    category: product.category || "General",
    badge: product.badge || "",
    features: product.features || [],
    status: product.status || "ACTIVE",
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  // Update local cache
  const idx = local.findIndex((p) => p.id === id);
  let newLocal: ProductItem[];
  if (idx >= 0) {
    newLocal = [...local];
    newLocal[idx] = updatedProduct;
  } else {
    newLocal = [...local, updatedProduct];
  }
  setLocalCachedProducts(newLocal);

  // Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, updatedProduct, { merge: true });
  } catch (err) {
    console.warn("Failed to persist product to Firestore, persisted locally:", err);
  }

  return updatedProduct;
}

/**
 * Delete a product from Firestore and local storage.
 */
export async function deleteProduct(id: string): Promise<void> {
  const local = getLocalCachedProducts().filter((p) => p.id !== id);
  setLocalCachedProducts(local);

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Failed to delete product from Firestore, removed locally:", err);
  }
}

/**
 * Resets products to factory defaults.
 */
export async function resetToDefaultProducts(): Promise<void> {
  setLocalCachedProducts(DEFAULT_PRODUCTS);
  await seedDefaultProductsToFirestore();
}
