import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBeiNr2YIaLPZVB2ZYGPwxv3Cr_3B0eQ0Y",
  authDomain: "tapsh-ddea2.firebaseapp.com",
  projectId: "tapsh-ddea2",
  storageBucket: "tapsh-ddea2.firebasestorage.app",
  messagingSenderId: "633466426198",
  appId: "1:633466426198:web:ae3cb555f222bac6c5fcf7",
  measurementId: "G-YKCHGW76RF"
};

// Initialize Firebase (singleton pattern for Next.js SSR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
