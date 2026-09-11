"use client";

import { useState } from "react";
import { 
  Check, ChevronRight, Upload, Plus, Trash2, 
  Building2, Coffee, Scissors, PlusCircle, ShoppingBag, Briefcase, 
  ChevronDown, ChevronUp, Copy, QrCode, Download, ExternalLink, User,
  Sparkles, ArrowLeft, ArrowRight, Loader2,
  Lock, Zap, Wifi, Image as ImageIcon
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import HubView from "@/components/HubView";
import { getTouchpointIcon, resolveTouchpointUrl } from "@/components/TouchpointIcons";
import Link from "next/link";
import { createCustomer, createHub } from "@/lib/firestoreService";
import { compressImage } from "@/lib/assetsService";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const BUSINESS_TYPES = [
  { id: "Resort / Hotel", icon: Building2 },
  { id: "Restaurant / Café", icon: Coffee },
  { id: "Salon / Spa", icon: Scissors },
  { id: "Clinic", icon: PlusCircle },
  { id: "Retail", icon: ShoppingBag },
  { id: "Office", icon: Briefcase },
  { id: "Homestay", icon: Building2 },
  { id: "Other", icon: ShoppingBag }
];

export const WIFI_AUTH_OPTIONS = [
  "Open",
  "WPA-Personal",
  "Shared",
  "WPA-Enterprise",
  "WPA2-Enterprise",
  "WPA2-Personal",
  "WPA/WPA2-Personal"
];

export const WIFI_ENCRYPTION_OPTIONS = [
  "None",
  "WEP",
  "TKIP",
  "AES",
  "AES/TKIP"
];

const LINK_TEMPLATES = {
  reviews: [
    { 
      title: "Google Reviews", 
      icon: "google", 
      placeholder: "https://g.page/r/.../review or Google Maps Review Link" 
    }
  ],
  contact: [
    { 
      title: "WhatsApp Direct", 
      icon: "whatsapp", 
      placeholder: "Enter WhatsApp phone number (e.g. 7977469926)" 
    },
    { 
      title: "Call Reception", 
      icon: "phone", 
      placeholder: "+91 82722 80000" 
    },
    { 
      title: "Official Email", 
      icon: "mail", 
      placeholder: "contact@business.com" 
    }
  ],
  social: [
    { 
      title: "Instagram Profile", 
      icon: "instagram", 
      placeholder: "https://instagram.com/yourhandle" 
    },
    { 
      title: "Facebook Page", 
      icon: "facebook", 
      placeholder: "https://facebook.com/yourpage" 
    },
    { 
      title: "YouTube Channel", 
      icon: "youtube", 
      placeholder: "https://youtube.com/@yourchannel" 
    },
    { 
      title: "X (Twitter) Profile", 
      icon: "twitter", 
      placeholder: "https://x.com/yourhandle" 
    }
  ],
  website: [
    { 
      title: "Official Website", 
      icon: "globe", 
      placeholder: "https://yourwebsite.com" 
    },
    { 
      title: "Online Booking / Menu", 
      icon: "calendar", 
      placeholder: "https://yourwebsite.com/menu" 
    }
  ]
};

interface SetupAccordionItemProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

function SetupAccordionItem({
  id,
  title,
  isExpanded,
  onToggle,
  children
}: SetupAccordionItemProps) {
  return (
    <div className="border border-tapsh-charcoal/15 rounded-2xl overflow-hidden bg-[#FAF8F5] mb-2.5 transition-all shadow-xs">
      <button 
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm text-tapsh-black hover:bg-tapsh-pale-blue/30 transition-colors cursor-pointer"
      >
        <span>{title}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-tapsh-charcoal" /> : <ChevronDown className="w-4 h-4 text-tapsh-charcoal" />}
      </button>
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-1 border-t border-tapsh-charcoal/10 space-y-3.5 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function HubSetupWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdHub, setCreatedHub] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("reviews");
  const [copiedLink, setCopiedLink] = useState(false);

  // Wi-Fi Configuration Screen State (Screenshots 2, 3, 4)
  const [editingWifiAuth, setEditingWifiAuth] = useState(false);
  const [editingWifiEncryption, setEditingWifiEncryption] = useState(false);

  // Shop Logo & Shop Backdrop Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleImageUpload = async (file: File, type: "logo" | "cover") => {
    if (type === "logo") setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      // 1. Instant client-side compression (<60ms) - eliminates UI delay
      const fastDataUrl = await compressImage(file, type === "logo" ? 500 : 1200, 0.82);
      if (type === "logo") {
        setData(prev => ({ ...prev, logo: fastDataUrl }));
        setUploadingLogo(false);
      } else {
        setData(prev => ({ ...prev, coverImage: fastDataUrl }));
        setUploadingCover(false);
      }

      // 2. Background attempt to upload to Firebase Storage with a strict 2.5s timeout
      try {
        const uploadTask = async () => {
          const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const storageRef = ref(storage, `hubs/${type}_${Date.now()}_${sanitized}`);
          const snap = await uploadBytes(storageRef, file);
          return await getDownloadURL(snap.ref);
        };

        const timeout = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Storage timeout")), 2500)
        );

        const cloudUrl = await Promise.race([uploadTask(), timeout]);
        if (cloudUrl) {
          if (type === "logo") setData(prev => ({ ...prev, logo: cloudUrl }));
          else setData(prev => ({ ...prev, coverImage: cloudUrl }));
        }
      } catch (storageErr) {
        console.warn("Storage upload timed out or failed; retaining compressed client image.", storageErr);
      }
    } catch (err) {
      console.error("Failed to process image:", err);
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  // WhatsApp phone number auto-formatting to https://wa.me/...
  const formatWhatsAppUrl = (input: string) => {
    if (!input || !input.trim()) return "";
    const trimmed = input.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return "";
    const full = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${full}`;
  };

  const handleWhatsAppChange = (rawNumber: string) => {
    const formattedUrl = formatWhatsAppUrl(rawNumber);
    setData(prev => {
      const existingLinkIndex = prev.links.findIndex(l => l.category === "contact" && l.title === "WhatsApp Direct");
      const newLinks = [...prev.links];
      if (!rawNumber.trim()) {
        if (existingLinkIndex >= 0) newLinks.splice(existingLinkIndex, 1);
      } else {
        if (existingLinkIndex >= 0) {
          newLinks[existingLinkIndex] = {
            ...newLinks[existingLinkIndex],
            url: formattedUrl,
            icon: "whatsapp"
          };
        } else {
          newLinks.push({
            id: `link_whatsapp_${Date.now()}`,
            category: "contact",
            title: "WhatsApp Direct",
            url: formattedUrl,
            icon: "whatsapp"
          });
        }
      }
      return {
        ...prev,
        whatsapp: rawNumber,
        links: newLinks
      };
    });
  };

  const [data, setData] = useState({
    businessType: "Resort / Hotel",
    businessName: "",
    description: "",
    phone: "",
    whatsapp: "",
    logo: "",
    coverImage: "",
    greetingMessage: "Thank you for visiting ♡",
    links: [] as any[],
    wifi: {
      ssid: "",
      password: "",
      authType: "WPA/WPA2-Personal",
      encryption: "AES"
    }
  });

  const handleWifiChange = (updates: Partial<{ ssid: string; password: string; authType: string; encryption: string }>) => {
    setData(prev => {
      const newWifi = {
        ...prev.wifi,
        ...updates
      };

      let wifiAuth = "WPA";
      if (newWifi.authType === "Open" || newWifi.encryption === "None") {
        wifiAuth = "nopass";
      } else if (newWifi.encryption === "WEP") {
        wifiAuth = "WEP";
      }

      const wifiUri = `WIFI:S:${newWifi.ssid};T:${wifiAuth};P:${newWifi.password};;`;
      const withoutWifi = prev.links.filter(l => l.category !== "wifi");

      const updatedLinks = newWifi.ssid.trim()
        ? [
            ...withoutWifi,
            {
              id: "link_wifi",
              category: "wifi",
              title: "Wi-Fi Network",
              url: wifiUri,
              icon: "wifi",
              ssid: newWifi.ssid,
              password: newWifi.password,
              authType: newWifi.authType,
              encryption: newWifi.encryption
            }
          ]
        : withoutWifi;

      return {
        ...prev,
        wifi: newWifi,
        links: updatedLinks
      };
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const [isDeploying, setIsDeploying] = useState(false);

  const handleSaveAndCreate = async () => {
    setIsDeploying(true);
    try {
      const customerId = `cus_${Date.now()}`;
      const hubId = `hub_${Date.now()}`;
      const slug = (data.businessName || "hub").toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const customer = await createCustomer({
        id: customerId,
        businessName: data.businessName,
        contactPerson: "Primary Business Contact",
        phone: data.phone || "+91 99000 00000",
        email: `contact@${slug}.com`,
        address: "Commercial Premises",
        city: "India",
        businessType: data.businessType as any || "Other",
        notes: data.description || "Created via TAPSH Admin Setup Wizard.",
        status: "ACTIVE"
      });

      const resolvedLinks = (data.links || []).map((l: any) => ({
        ...l,
        url: resolveTouchpointUrl(l)
      }));

      const hub = await createHub({
        id: hubId,
        customerId,
        slug,
        businessName: data.businessName,
        businessType: data.businessType || "Other",
        shortDescription: data.description || "Welcome to our space.",
        logoUrl: data.logo || "",
        coverUrl: data.coverImage || "",
        accentColor: "#554940",
        greetingMessage: data.greetingMessage || "Thank you ♡",
        phone: data.phone || "",
        whatsapp: (data.whatsapp || "").replace(/[^0-9]/g, ""),
        status: "ACTIVE",
        links: resolvedLinks
      });

      setCreatedHub(hub);
      setIsSuccess(true);
    } catch (err: any) {
      alert("Error deploying hub to Firestore: " + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleUpdateLink = (category: string, title: string, url: string, icon?: string) => {
    setData(prev => {
      const existingLinkIndex = prev.links.findIndex(l => l.category === category && l.title === title);
      const newLinks = [...prev.links];
      
      if (url.trim() === "") {
        if (existingLinkIndex >= 0) newLinks.splice(existingLinkIndex, 1);
      } else {
        if (existingLinkIndex >= 0) {
          newLinks[existingLinkIndex].url = url;
        } else {
          newLinks.push({ id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, category, title, url, icon });
        }
      }
      return { ...prev, links: newLinks };
    });
  };

  const getLinkValue = (category: string, title: string) => {
    return data.links.find(l => l.category === category && l.title === title)?.url || "";
  };

  const handleCopySlug = () => {
    if (createdHub?.slug) {
      navigator.clipboard.writeText(`https://tapsh.in/h/${createdHub.slug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // STEP 1: BUSINESS TYPE
  const renderStep1 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-1">
          Select Business Category
        </h2>
        <p className="text-xs sm:text-sm text-tapsh-charcoal">
          This tailors default Hub modules and suggested review destinations.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {BUSINESS_TYPES.map(type => (
          <button
            key={type.id}
            type="button"
            onClick={() => setData({ ...data, businessType: type.id })}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 active:scale-95 ${
              data.businessType === type.id 
                ? "border-tapsh-soft-green bg-tapsh-soft-green/10 text-tapsh-black shadow-xs font-bold" 
                : "border-tapsh-charcoal/20 bg-[#FAF8F5] text-tapsh-charcoal hover:border-tapsh-soft-green/50"
            }`}
          >
            <type.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${data.businessType === type.id ? "text-tapsh-soft-green" : "text-tapsh-charcoal"}`} />
            <span className="text-xs sm:text-sm">{type.id}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 2: DETAILS
  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto">
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-1">
          Business Details
        </h2>
        <p className="text-xs sm:text-sm text-tapsh-charcoal">
          Enter basic information shown on the mobile landing page.
        </p>
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
          Business Name *
        </label>
        <input 
          type="text" 
          required
          value={data.businessName}
          onChange={(e) => setData({...data, businessName: e.target.value})}
          className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
          placeholder="e.g. The Tamara Coorg"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
          Tagline / Short Description
        </label>
        <textarea 
          rows={2}
          value={data.description}
          onChange={(e) => setData({...data, description: e.target.value})}
          className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green resize-none"
          placeholder="e.g. Luxury nature retreat in the lush hills of Coorg."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
            Reception Phone
          </label>
          <input 
            type="tel"
            value={data.phone}
            onChange={(e) => setData({...data, phone: e.target.value})}
            placeholder="+91 82722 80000"
            className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
            WhatsApp Business No
          </label>
          <input 
            type="tel"
            value={data.whatsapp}
            onChange={(e) => setData({...data, whatsapp: e.target.value})}
            placeholder="918272280000"
            className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
          Guest Welcome Greeting
        </label>
        <input 
          type="text" 
          value={data.greetingMessage}
          onChange={(e) => setData({...data, greetingMessage: e.target.value})}
          className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
          placeholder="Thank you for visiting ♡"
        />
      </div>

      {/* Visual Branding Assets (Optional) */}
      <div className="pt-4 border-t border-tapsh-charcoal/15 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-tapsh-soft-green" />
              Branding & Visual Media
            </label>
            <span className="text-[11px] font-semibold text-tapsh-soft-green bg-tapsh-soft-green/10 px-2.5 py-0.5 rounded-full border border-tapsh-soft-green/20">
              Optional
            </span>
          </div>
          <p className="text-xs text-tapsh-charcoal/70 mt-1">
            Upload your shop logo and backdrop banner to personalize the digital tap experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Shop Logo (Optional) */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tapsh-black uppercase tracking-wider">
                Shop Logo
              </label>
              <span className="text-[10px] text-tapsh-charcoal/70 font-medium">Optional</span>
            </div>

            {data.logo ? (
              <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-tapsh-charcoal/10 shadow-xs">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-tapsh-soft-green/40 shadow-sm shrink-0 bg-neutral-100 flex items-center justify-center">
                  <img src={data.logo} alt="Shop Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs font-bold text-tapsh-black truncate">Logo Uploaded</p>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-tapsh-soft-green hover:underline cursor-pointer">
                      Change
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "logo");
                        }} 
                      />
                    </label>
                    <span className="text-tapsh-charcoal/30">•</span>
                    <button
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, logo: "" }))}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className={`w-full flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploadingLogo ? "border-tapsh-soft-green bg-tapsh-soft-green/5" : "border-tapsh-charcoal/20 hover:border-tapsh-soft-green/60 hover:bg-white bg-white/60"
                }`}>
                  {uploadingLogo ? (
                    <div className="flex flex-col items-center gap-2 text-tapsh-soft-green">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">Uploading logo...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green flex items-center justify-center mb-1.5">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-tapsh-black">Upload Shop Logo</span>
                      <span className="text-[10px] text-tapsh-charcoal text-center mt-0.5">Square / Circle (500×500 PNG / JPG)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "logo");
                    }} 
                  />
                </label>
                
                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={data.logo}
                  onChange={(e) => setData(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black placeholder-tapsh-charcoal/40 focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                />
              </div>
            )}
          </div>

          {/* 2. Shop Backdrop (Optional) */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tapsh-black uppercase tracking-wider">
                Shop Backdrop
              </label>
              <span className="text-[10px] text-tapsh-charcoal/70 font-medium">Optional</span>
            </div>

            {data.coverImage ? (
              <div className="space-y-2">
                <div className="w-full h-24 rounded-xl overflow-hidden border border-tapsh-charcoal/20 shadow-xs relative bg-neutral-900 group">
                  <img src={data.coverImage} alt="Shop Backdrop" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-2.5 py-1 bg-white/90 hover:bg-white text-tapsh-black rounded-lg text-xs font-bold cursor-pointer shadow-xs">
                      Change
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingCover}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "cover");
                        }} 
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, coverImage: "" }))}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-tapsh-charcoal">Backdrop Banner Attached</span>
                  <button
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, coverImage: "" }))}
                    className="font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className={`w-full flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploadingCover ? "border-tapsh-soft-green bg-tapsh-soft-green/5" : "border-tapsh-charcoal/20 hover:border-tapsh-soft-green/60 hover:bg-white bg-white/60"
                }`}>
                  {uploadingCover ? (
                    <div className="flex flex-col items-center gap-2 text-tapsh-soft-green">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">Uploading backdrop...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green flex items-center justify-center mb-1.5">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-tapsh-black">Upload Shop Backdrop</span>
                      <span className="text-[10px] text-tapsh-charcoal text-center mt-0.5">Panoramic banner (16:9 1200×675)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={uploadingCover}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "cover");
                    }} 
                  />
                </label>
                
                <input
                  type="url"
                  placeholder="Or paste backdrop image URL"
                  value={data.coverImage}
                  onChange={(e) => setData(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black placeholder-tapsh-charcoal/40 focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 3: LINKS
  const renderStep3 = () => {
    const toggleAccordion = (id: string) => {
      setExpandedCategory(prev => prev === id ? null : id);
    };

    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <div className="text-center mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-1">
            Configure Touchpoint Links
          </h2>
          <p className="text-xs sm:text-sm text-tapsh-charcoal">
            Add review URLs, social handles, and direct phone/WhatsApp shortcuts.
          </p>
        </div>

        {/* 1. CUSTOMER REVIEW LINKS (GOOGLE REVIEWS ONLY) */}
        <SetupAccordionItem 
          id="reviews" 
          title="🌟 Customer Review Links"
          isExpanded={expandedCategory === "reviews"}
          onToggle={toggleAccordion}
        >
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-tapsh-charcoal/15 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0">
                {getTouchpointIcon({ icon: "google" }, "sm")}
              </div>
              <label className="text-xs font-bold text-tapsh-black">
                Google Reviews Page URL
              </label>
            </div>
            <input 
              type="url" 
              placeholder="https://g.page/r/.../review or Google Maps Review Link" 
              value={getLinkValue("reviews", "Google Reviews")}
              onChange={(e) => handleUpdateLink("reviews", "Google Reviews", e.target.value, "google")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-white text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green font-mono"
            />
            <p className="text-[11px] text-tapsh-charcoal leading-relaxed">
              When guests tap the TAPSH NFC hardware stand or card, it directs straight to your Google Business review page so customers can leave 5-star feedback instantly.
            </p>
          </div>
        </SetupAccordionItem>

        {/* 2. CONTACT & WHATSAPP (DIRECT NUMBER, NO GOOGLE MAPS) */}
        <SetupAccordionItem 
          id="contact" 
          title="💬 Contact & WhatsApp"
          isExpanded={expandedCategory === "contact"}
          onToggle={toggleAccordion}
        >
          {/* Dedicated WhatsApp Section (Direct Phone Number) */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0">
                  {getTouchpointIcon({ icon: "whatsapp" }, "sm")}
                </div>
                <label className="text-xs font-bold text-tapsh-black">
                  WhatsApp Direct Number
                </label>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                Direct Chat
              </span>
            </div>
            <input 
              type="tel" 
              placeholder="Enter WhatsApp phone number (e.g. 7977469926 or +91 79774 69926)" 
              value={data.whatsapp}
              onChange={(e) => handleWhatsAppChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span>Just enter your business WhatsApp number — customers will be directed straight to chat.</span>
            </div>
            {getLinkValue("contact", "WhatsApp Direct") && (
              <div className="text-[10px] text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-mono truncate">
                Direct Link: {getLinkValue("contact", "WhatsApp Direct")}
              </div>
            )}
          </div>

          {/* Call Reception */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 flex items-center justify-center">
                {getTouchpointIcon({ icon: "phone" }, "sm")}
              </div>
              <label className="text-xs font-semibold text-tapsh-charcoal">Call Reception</label>
            </div>
            <input 
              type="text" 
              placeholder="+91 82722 80000" 
              value={getLinkValue("contact", "Call Reception")}
              onChange={(e) => handleUpdateLink("contact", "Call Reception", e.target.value, "phone")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
            />
          </div>

          {/* Official Email */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 flex items-center justify-center">
                {getTouchpointIcon({ icon: "mail" }, "sm")}
              </div>
              <label className="text-xs font-semibold text-tapsh-charcoal">Official Email</label>
            </div>
            <input 
              type="email" 
              placeholder="contact@business.com" 
              value={getLinkValue("contact", "Official Email")}
              onChange={(e) => handleUpdateLink("contact", "Official Email", e.target.value, "mail")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
            />
          </div>
        </SetupAccordionItem>

        {/* 3. SOCIAL CHANNELS (WITH TWITTER / X) */}
        <SetupAccordionItem 
          id="social" 
          title="📸 Social Channels"
          isExpanded={expandedCategory === "social"}
          onToggle={toggleAccordion}
        >
          {LINK_TEMPLATES.social.map(link => (
            <div key={link.title}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 flex items-center justify-center">
                  {getTouchpointIcon(link, "sm")}
                </div>
                <label className="text-xs font-semibold text-tapsh-charcoal">{link.title}</label>
              </div>
              <input 
                type="url" 
                placeholder={link.placeholder} 
                value={getLinkValue("social", link.title)}
                onChange={(e) => handleUpdateLink("social", link.title, e.target.value, link.icon)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>
          ))}
        </SetupAccordionItem>

        {/* 4. WEBSITE & BOOKING */}
        <SetupAccordionItem 
          id="website" 
          title="🌐 Website & Booking"
          isExpanded={expandedCategory === "website"}
          onToggle={toggleAccordion}
        >
          {LINK_TEMPLATES.website.map(link => (
            <div key={link.title}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 flex items-center justify-center">
                  {getTouchpointIcon(link, "sm")}
                </div>
                <label className="text-xs font-semibold text-tapsh-charcoal">{link.title}</label>
              </div>
              <input 
                type="url" 
                placeholder={link.placeholder} 
                value={getLinkValue("website", link.title)}
                onChange={(e) => handleUpdateLink("website", link.title, e.target.value, link.icon)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>
          ))}
        </SetupAccordionItem>

        {/* 5. WI-FI NETWORK (AS REQUESTED) */}
        <SetupAccordionItem 
          id="wifi" 
          title="📶 Wi-Fi Network"
          isExpanded={expandedCategory === "wifi"}
          onToggle={toggleAccordion}
        >
          {editingWifiAuth ? (
            /* AUTHENTICATION SELECTION SCREEN (Screenshot 4) */
            <div className="bg-[#121214] text-white rounded-2xl p-4 sm:p-5 border border-white/10 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingWifiAuth(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-tapsh-gray hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="text-sm sm:text-base font-bold text-white">Authentication</h4>
              </div>

              <div className="space-y-1 divide-y divide-white/5">
                {WIFI_AUTH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      handleWifiChange({ authType: opt });
                      setEditingWifiAuth(false);
                    }}
                    className={`w-full flex items-center gap-3 py-3 px-2 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      data.wifi.authType === opt
                        ? "bg-white/10 text-white font-bold"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 text-white">
                      <Zap className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="flex-1">{opt}</span>
                    {data.wifi.authType === opt && (
                      <Check className="w-4 h-4 text-[#FF9500]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : editingWifiEncryption ? (
            /* ENCRYPTION SELECTION SCREEN (Screenshot 3) */
            <div className="bg-[#121214] text-white rounded-2xl p-4 sm:p-5 border border-white/10 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingWifiEncryption(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-tapsh-gray hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="text-sm sm:text-base font-bold text-white">Encryption</h4>
              </div>

              <div className="space-y-1 divide-y divide-white/5">
                {WIFI_ENCRYPTION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      handleWifiChange({ encryption: opt });
                      setEditingWifiEncryption(false);
                    }}
                    className={`w-full flex items-center gap-3 py-3 px-2 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      data.wifi.encryption === opt
                        ? "bg-white/10 text-white font-bold"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 text-white">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1">{opt}</span>
                    {data.wifi.encryption === opt && (
                      <Check className="w-4 h-4 text-[#FF9500]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* MAIN WI-FI NETWORK CONFIG SCREEN (Screenshot 2) */
            <div className="bg-[#121214] text-white rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Wi-Fi network</h4>
                  <p className="text-[11px] text-tapsh-gray">Configure a Wi-Fi network</p>
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-tapsh-gray block">
                  Authentication :
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden bg-[#242428] border border-white/10">
                  <div className="flex-1 px-4 py-3 text-xs sm:text-sm font-medium text-white flex items-center">
                    {data.wifi.authType}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingWifiAuth(true)}
                    className="px-5 py-3 bg-[#FF9500] hover:bg-[#E08500] active:scale-95 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    EDIT
                  </button>
                </div>
              </div>

              {/* Encryption */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-tapsh-gray block">
                  Encryption :
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden bg-[#242428] border border-white/10">
                  <div className="flex-1 px-4 py-3 text-xs sm:text-sm font-medium text-white flex items-center">
                    {data.wifi.encryption}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingWifiEncryption(true)}
                    className="px-5 py-3 bg-[#FF9500] hover:bg-[#E08500] active:scale-95 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    EDIT
                  </button>
                </div>
              </div>

              {/* SSID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-tapsh-gray block">
                  SSID :
                </label>
                <input
                  type="text"
                  placeholder="Your SSID"
                  value={data.wifi.ssid}
                  onChange={(e) => handleWifiChange({ ssid: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#242428] border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF9500] font-medium"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-tapsh-gray block">
                  Password :
                </label>
                <input
                  type="text"
                  placeholder="Your password"
                  value={data.wifi.password}
                  onChange={(e) => handleWifiChange({ password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#242428] border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF9500] font-medium"
                />
              </div>

              {data.wifi.ssid && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-tapsh-gray flex items-center justify-between">
                  <span>Guest Wi-Fi network ready in Hub</span>
                  <span className="text-tapsh-soft-green font-bold">Active</span>
                </div>
              )}
            </div>
          )}
        </SetupAccordionItem>
      </div>
    );
  };

  // STEP 4: PREVIEW (PROPER CLEAN RESPONSIVE MOBILE VIEW)
  const renderStep4 = () => (
    <div className="space-y-4 max-w-xl mx-auto text-center">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-1">
          Review Mobile Hub Appearance
        </h2>
        <p className="text-xs sm:text-sm text-tapsh-charcoal">
          This exact experience loads when guests tap the physical TAPSH NFC product.
        </p>
      </div>

      {/* Clean Proper Mobile Screen Container */}
      <div className="flex justify-center p-0 sm:p-2">
        <div className="w-full max-w-[360px] sm:max-w-[390px] h-[640px] sm:h-[720px] bg-white rounded-[2.2rem] border-2 sm:border-4 border-tapsh-charcoal/20 shadow-2xl overflow-hidden relative flex flex-col hub-preview-isolated">
          
          {/* Subtle Mobile Top Speaker Bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0 border-b border-black/5">
            <div className="w-12 h-1 bg-black/20 rounded-full"></div>
          </div>

          {/* Hub View Content */}
          <div className="flex-1 w-full h-full overflow-hidden">
            <HubView data={{
              businessName: data.businessName || "Business Name",
              description: data.description || "Welcome to our space. Select an option below.",
              greetingMessage: data.greetingMessage,
              logoUrl: data.logo,
              coverUrl: data.coverImage,
              links: data.links.length > 0 ? data.links : [
                { id: 1, category: "reviews", title: "Rate Us on Google", url: "#", icon: "google" },
                { id: 2, category: "contact", title: "WhatsApp Direct", url: "#", icon: "whatsapp" },
                { id: 3, category: "website", title: "Official Website", url: "#", icon: "globe" }
              ]
            }} />
          </div>

          {/* Minimalist Home Indicator Pill */}
          <div className="h-4 bg-[#FAF8F5] flex items-center justify-center shrink-0 border-t border-black/5">
            <div className="w-24 h-1 bg-black/25 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );

  // SUCCESS SCREEN (RESPONSIVE TO ALL SCREEN SIZES)
  const renderSuccess = () => {
    const liveUrl = typeof window !== "undefined" && createdHub?.slug 
      ? `${window.location.origin}/h/${createdHub.slug}` 
      : `https://tapsh.in/h/${createdHub?.slug || ""}`;

    const handleCopyUrl = (urlToCopy: string) => {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleDownloadQR = () => {
      const canvas = document.getElementById("hub-qr-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${createdHub?.slug || "tapsh-hub"}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    return (
      <div className="max-w-lg mx-auto text-center py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-tapsh-soft-green/10 text-tapsh-soft-green rounded-full flex items-center justify-center mx-auto border-2 border-tapsh-soft-green shadow-xs">
          <Check className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black">Hub Successfully Deployed!</h2>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            Permanent digital routing is provisioned for <strong className="text-tapsh-black">{createdHub?.businessName}</strong>.
          </p>
        </div>

        {/* Visual Brand Confirmation Card */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-tapsh-charcoal/15 overflow-hidden shadow-xs text-left">
          <div className="w-full h-24 sm:h-28 bg-gradient-to-r from-slate-900 to-tapsh-black relative overflow-hidden">
            {createdHub?.coverUrl ? (
              <img 
                src={createdHub.coverUrl} 
                alt="Shop Backdrop" 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">
                <span>Default Brand Gradient Backdrop</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Deployed
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 pt-0 relative">
            <div className="flex items-end gap-3.5 -mt-8 mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                {createdHub?.logoUrl ? (
                  <img src={createdHub.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-tapsh-soft-green/15 text-tapsh-soft-green flex items-center justify-center font-bold text-lg">
                    {createdHub?.businessName?.charAt(0) || "T"}
                  </div>
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h3 className="text-base sm:text-lg font-bold text-tapsh-black truncate">
                  {createdHub?.businessName}
                </h3>
                <p className="text-xs text-tapsh-charcoal truncate">
                  {createdHub?.businessType} • {createdHub?.links?.length || 0} Connected Touchpoints
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-tapsh-charcoal bg-white p-2.5 rounded-xl border border-tapsh-charcoal/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-tapsh-charcoal/60 block">Shop Logo</span>
                <span className="font-semibold text-tapsh-black text-[11px] truncate block">
                  {createdHub?.logoUrl ? "✓ Custom Logo Attached" : "Default TAPSH Emblem"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-tapsh-charcoal/60 block">Shop Backdrop</span>
                <span className="font-semibold text-tapsh-black text-[11px] truncate block">
                  {createdHub?.coverUrl ? "✓ Custom Backdrop Active" : "Default Gradient Cover"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom QR Code Card & Download */}
        <div className="bg-[#FAF8F5] p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 text-center shadow-xs">
          <span className="inline-block px-3 py-1 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green text-[10px] font-bold tracking-wider uppercase mb-2">
            Custom Hardware QR Code
          </span>
          <p className="text-xs text-tapsh-charcoal mb-4">
            Scan with any phone camera or download high-resolution PNG for printing stands & tags.
          </p>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-tapsh-charcoal/15 inline-block shadow-sm mb-4 max-w-full overflow-hidden">
            <QRCodeCanvas
              id="hub-qr-canvas"
              value={liveUrl}
              size={180}
              level="H"
              includeMargin={true}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-tapsh-soft-green" /> Download QR Code (PNG)
            </button>
          </div>
        </div>

        {/* Working Live Shortlink (Responsive on all screen sizes) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-tapsh-charcoal tracking-wider">
              Live Hub Web Link
            </span>
            {copiedLink && (
              <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in">
                ✓ Copied to clipboard!
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                readOnly
                value={liveUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full text-xs font-mono font-bold text-tapsh-black p-2.5 sm:p-3 bg-white border border-tapsh-charcoal/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green select-all truncate"
              />
            </div>
            <button
              type="button"
              onClick={() => handleCopyUrl(liveUrl)}
              className="w-full sm:w-auto px-4 py-2.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-[11px] text-tapsh-charcoal">
            Paste this URL into any browser tab to open this customer's live mobile touchpoint Hub.
          </p>
        </div>

        {/* Quick Launch Buttons (Responsive grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a 
            href={`/h/${createdHub?.slug}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 bg-tapsh-soft-green text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs hover:brightness-110 text-center"
          >
            <ExternalLink className="w-4 h-4" /> Open Live Hub Tab
          </a>
          <Link 
            href={`/admin/customers/${createdHub?.customerId}`}
            className="w-full p-3 bg-white border border-tapsh-charcoal/20 text-tapsh-black rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-tapsh-pale-blue/30 text-center"
          >
            <User className="w-4 h-4" /> View Profile
          </Link>
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-tapsh-charcoal/15 shadow-xs">
        {renderSuccess()}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Hub Setup Wizard
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-0.5">
            Step {step} of 4: {["Category", "Details", "Links", "Preview"][step-1]}
          </p>
        </div>
        <Link href="/admin/customers" className="text-xs font-bold text-tapsh-charcoal hover:text-tapsh-black">
          Cancel
        </Link>
      </div>

      {/* Mobile Step Indicator Bar */}
      <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-tapsh-charcoal/10">
        <div 
          className="bg-tapsh-soft-green h-full transition-all duration-300 rounded-full"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content Form Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-tapsh-charcoal/15 shadow-xs min-h-[450px] flex flex-col justify-between">
        <div className="flex-1">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className="pt-6 mt-6 border-t border-tapsh-charcoal/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              step === 1 
                ? "opacity-30 cursor-not-allowed text-tapsh-charcoal" 
                : "bg-[#FAF8F5] text-tapsh-black border border-tapsh-charcoal/20 active:scale-95"
            }`}
          >
            &larr; Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 2 && !data.businessName.trim()}
              className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                step === 2 && !data.businessName.trim()
                  ? "bg-tapsh-charcoal/20 text-tapsh-charcoal cursor-not-allowed"
                  : "bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95"
              }`}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isDeploying}
              onClick={handleSaveAndCreate}
              className="py-2.5 px-6 bg-tapsh-black text-tapsh-beige rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isDeploying ? "Deploying to Firestore..." : "Deploy Hub"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
