import { db, storage } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, deleteField, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SETTINGS_COLLECTION = "site_settings";
const ASSETS_DOC_ID = "site_assets";
const LOCAL_STORAGE_KEY = "tapsh_site_assets";

/**
 * Reads local cached assets synchronously to prevent page flicker.
 */
export function getLocalCachedAssets(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Failed reading local cached assets", err);
    return {};
  }
}

/**
 * Saves assets dictionary to local cache.
 */
export function setLocalCachedAssets(assets: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.warn("Failed writing local cached assets", err);
  }
}

/**
 * Fetches assets from Firestore, falling back to localStorage.
 */
export async function fetchSiteAssets(): Promise<Record<string, string>> {
  const local = getLocalCachedAssets();
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ASSETS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Record<string, string>;
      const merged = { ...local, ...data };
      setLocalCachedAssets(merged);
      return merged;
    }
    return local;
  } catch (err) {
    console.warn("Firestore fetch site_assets failed, using local cache:", err);
    return local;
  }
}

/**
 * Real-time listener for site assets.
 */
export function subscribeToSiteAssets(
  callback: (assets: Record<string, string>) => void
): () => void {
  const local = getLocalCachedAssets();
  if (Object.keys(local).length > 0) {
    callback(local);
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ASSETS_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Record<string, string>;
          setLocalCachedAssets(cloudData);
          callback(cloudData);
        } else {
          // Doc doesn't exist yet, pass local cache or empty
          callback(getLocalCachedAssets());
        }
      },
      (error) => {
        console.warn("Real-time listener on site_assets encountered error:", error);
        callback(getLocalCachedAssets());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to attach Firestore snapshot listener:", err);
    return () => {};
  }
}

/**
 * Compresses an image file client-side to ensure fast loading and fit within Firestore limits if fallback is used.
 */
export async function compressImage(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Retain PNG transparency ONLY for small images (like logos under 400px), otherwise output JPEG for massive size savings
        const isSmallPng = file.type === "image/png" && maxDimension <= 400;
        const outputType = isSmallPng ? "image/png" : "image/jpeg";
        const targetQuality = isSmallPng ? quality : Math.min(quality, 0.78);
        const dataUrl = canvas.toDataURL(outputType, targetQuality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Saves or updates a specific asset in Firebase Storage / Firestore and local cache.
 */
export async function saveSiteAsset(key: string, fileOrUrl: File | string): Promise<string> {
  let assetUrl = "";

  if (typeof fileOrUrl === "string") {
    assetUrl = fileOrUrl.trim();
  } else {
    // It is a File. Try Firebase Storage first.
    try {
      const sanitizedName = fileOrUrl.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageRef = ref(storage, `site_assets/${key}_${Date.now()}_${sanitizedName}`);
      const snapshot = await uploadBytes(storageRef, fileOrUrl);
      assetUrl = await getDownloadURL(snapshot.ref);
    } catch (storageErr) {
      console.warn("Firebase Storage upload not available or restricted, falling back to optimized Data URL:", storageErr);
      // Fallback: Compress client-side to Data URL
      assetUrl = await compressImage(fileOrUrl);
    }
  }

  // Update local cache immediately
  const local = getLocalCachedAssets();
  local[key] = assetUrl;
  setLocalCachedAssets(local);

  // Sync to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ASSETS_DOC_ID);
    await setDoc(docRef, { [key]: assetUrl, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (firestoreErr) {
    console.warn("Could not sync asset to Firestore cloud (permissions or offline), persisted locally:", firestoreErr);
  }

  return assetUrl;
}

/**
 * Resets an asset key back to default.
 */
export async function resetSiteAsset(key: string): Promise<void> {
  // Update local cache
  const local = getLocalCachedAssets();
  delete local[key];
  setLocalCachedAssets(local);

  // Delete from Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ASSETS_DOC_ID);
    await updateDoc(docRef, {
      [key]: deleteField(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Could not delete asset from Firestore (permissions or offline), reset locally:", err);
  }
}

/**
 * Resets all custom assets back to system defaults.
 */
export async function resetAllSiteAssets(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ASSETS_DOC_ID);
    await setDoc(docRef, { updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Could not clear Firestore assets document:", err);
  }
}
