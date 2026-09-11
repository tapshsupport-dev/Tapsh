"use client";

import { useEffect, useState } from "react";
import HubView from "@/components/HubView";
import { getHubBySlug } from "@/lib/firestoreService";

interface PublicHubClientProps {
  slug: string;
  initialHub: any;
}

export default function PublicHubClient({ slug, initialHub }: PublicHubClientProps) {
  const [hubData, setHubData] = useState<any>(initialHub);

  useEffect(() => {
    // 1. Immediately check local storage & Firestore on client for any fresh edits
    const syncFreshData = async () => {
      try {
        const fresh = await getHubBySlug(slug);
        if (fresh) {
          setHubData(fresh);
        }
      } catch (err) {
        console.warn("Client hub sync warning:", err);
      }
    };

    syncFreshData();

    // 2. Listen for custom real-time events dispatched within the same tab
    const handleHubsUpdated = (e: any) => {
      const list = e.detail || [];
      const updated = list.find((h: any) => h.slug === slug || (hubData?.id && h.id === hubData.id));
      if (updated) {
        setHubData(updated);
      }
    };

    // 3. Listen for cross-tab storage updates when admin saves from another browser tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tapsh_hubs" && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          const updated = list.find((h: any) => h.slug === slug || (hubData?.id && h.id === hubData.id));
          if (updated) {
            setHubData(updated);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("tapsh_hubs_updated", handleHubsUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("tapsh_hubs_updated", handleHubsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [slug, hubData?.id]);

  if (!hubData) return null;

  if (hubData.status === "SUSPENDED") {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-tapsh-pale-blue flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-tapsh-black mb-2">Service Suspended</h2>
          <p className="text-tapsh-charcoal font-medium text-sm leading-relaxed">
            This TAPSH Hub is currently unavailable. Please contact the business administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#221F1C] md:py-6 flex items-center justify-center">
      {/* Mobile container: Edge-to-edge on real phones, elegant device frame on desktop */}
      <div className="w-full max-w-[420px] h-screen h-[100dvh] md:h-[860px] md:max-h-[94vh] bg-[#F4EFEA] md:rounded-[2.85rem] md:shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden relative md:border-[7px] md:border-[#332F2A] flex flex-col">
        <HubView data={{
          businessName: hubData.businessName,
          businessType: hubData.businessType,
          description: hubData.shortDescription || (hubData as any).description,
          greetingMessage: hubData.greetingMessage,
          coverUrl: hubData.coverUrl,
          logoUrl: hubData.logoUrl || (hubData as any).logo || "",
          links: hubData.links
        }} />
      </div>
    </div>
  );
}
