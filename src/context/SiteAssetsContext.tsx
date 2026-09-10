"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getLocalCachedAssets, 
  subscribeToSiteAssets, 
  saveSiteAsset, 
  resetSiteAsset,
  resetAllSiteAssets
} from "@/lib/assetsService";
import { MEDIA_ASSET_REGISTRY } from "@/lib/mediaAssetsRegistry";

interface SiteAssetsContextType {
  assets: Record<string, string>;
  isLoaded: boolean;
  getAsset: (key: string, fallback?: string) => string;
  isCustom: (key: string) => boolean;
  updateAsset: (key: string, fileOrUrl: File | string) => Promise<string>;
  resetAsset: (key: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

const SiteAssetsContext = createContext<SiteAssetsContextType | undefined>(undefined);

// Quick lookup map for default asset paths
const DEFAULT_ASSET_MAP = new Map<string, string>(
  MEDIA_ASSET_REGISTRY.map((item) => [item.key, item.defaultPath])
);

export function SiteAssetsProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Instantly populate from local storage to prevent flash of content
    const cached = getLocalCachedAssets();
    if (Object.keys(cached).length > 0) {
      setAssets(cached);
      setIsLoaded(true);
    }

    // 2. Subscribe to Firestore real-time updates across the app & other clients
    const unsubscribe = subscribeToSiteAssets((cloudAssets) => {
      setAssets(cloudAssets);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const getAsset = (key: string, fallback?: string): string => {
    const customValue = assets[key];
    if (customValue && customValue.trim() !== "") {
      return customValue;
    }
    const defaultRegistered = DEFAULT_ASSET_MAP.get(key);
    if (defaultRegistered && defaultRegistered.trim() !== "") {
      return defaultRegistered;
    }
    return fallback || "";
  };

  const isCustom = (key: string): boolean => {
    return Boolean(assets[key] && assets[key].trim() !== "");
  };

  const handleUpdateAsset = async (key: string, fileOrUrl: File | string): Promise<string> => {
    const savedUrl = await saveSiteAsset(key, fileOrUrl);
    setAssets((prev) => ({ ...prev, [key]: savedUrl }));
    return savedUrl;
  };

  const handleResetAsset = async (key: string): Promise<void> => {
    await resetSiteAsset(key);
    setAssets((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleResetAll = async (): Promise<void> => {
    await resetAllSiteAssets();
    setAssets({});
  };

  return (
    <SiteAssetsContext.Provider
      value={{
        assets,
        isLoaded,
        getAsset,
        isCustom,
        updateAsset: handleUpdateAsset,
        resetAsset: handleResetAsset,
        resetAll: handleResetAll,
      }}
    >
      {children}
    </SiteAssetsContext.Provider>
  );
}

export function useSiteAssets() {
  const context = useContext(SiteAssetsContext);
  if (!context) {
    // Graceful fallback for components that might render outside provider
    return {
      assets: {},
      isLoaded: true,
      getAsset: (key: string, fallback?: string) => DEFAULT_ASSET_MAP.get(key) || fallback || "",
      isCustom: () => false,
      updateAsset: async () => "",
      resetAsset: async () => {},
      resetAll: async () => {},
    };
  }
  return context;
}
