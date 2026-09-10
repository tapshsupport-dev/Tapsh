"use client";

import { useState } from "react";
import { 
  Check, ChevronRight, Upload, Plus, Trash2, 
  Building2, Coffee, Scissors, PlusCircle, ShoppingBag, Briefcase, 
  ChevronDown, ChevronUp, Copy, QrCode, Download, ExternalLink, User,
  Sparkles, ArrowLeft, ArrowRight, Loader2, Smartphone, Tablet
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import HubView from "@/components/HubView";
import { getTouchpointIcon } from "@/components/TouchpointIcons";
import Link from "next/link";
import { createCustomer, createHub } from "@/lib/firestoreService";

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

export default function HubSetupWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdHub, setCreatedHub] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("reviews");
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"iphone" | "tablet">("iphone");

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

  const getWhatsAppDisplayValue = () => {
    const currentUrl = data.links.find(l => l.category === "contact" && l.title === "WhatsApp Direct")?.url || "";
    if (!currentUrl) return data.whatsapp || "";
    return currentUrl.replace(/^https?:\/\/wa\.me\//, "");
  };

  const handleWhatsAppChange = (rawNumber: string) => {
    const formattedUrl = formatWhatsAppUrl(rawNumber);
    handleUpdateLink("contact", "WhatsApp Direct", formattedUrl, "whatsapp");
    setData(prev => ({ ...prev, whatsapp: rawNumber.replace(/\D/g, "") }));
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
  });

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
        links: data.links || []
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
    </div>
  );

  // STEP 3: LINKS
  const renderStep3 = () => {
    const AccordionItem = ({ id, title, children }: any) => {
      const isExpanded = expandedCategory === id;
      return (
        <div className="border border-tapsh-charcoal/15 rounded-2xl overflow-hidden bg-[#FAF8F5] mb-2.5 transition-all shadow-xs">
          <button 
            type="button"
            onClick={() => setExpandedCategory(isExpanded ? null : id)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm text-tapsh-black hover:bg-tapsh-pale-blue/30 transition-colors"
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
        <AccordionItem id="reviews" title="🌟 Customer Review Links">
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
        </AccordionItem>

        {/* 2. CONTACT & WHATSAPP (DIRECT NUMBER, NO GOOGLE MAPS) */}
        <AccordionItem id="contact" title="💬 Contact & WhatsApp">
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
              value={getWhatsAppDisplayValue()}
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
        </AccordionItem>

        {/* 3. SOCIAL CHANNELS (WITH TWITTER / X) */}
        <AccordionItem id="social" title="📸 Social Channels">
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
        </AccordionItem>

        {/* 4. WEBSITE & BOOKING */}
        <AccordionItem id="website" title="🌐 Website & Booking">
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
        </AccordionItem>
      </div>
    );
  };

  // STEP 4: PREVIEW (IPHONE 17 PRO PHONE MODEL & TABLET VIEWPORT)
  const renderStep4 = () => (
    <div className="space-y-4 max-w-2xl mx-auto text-center">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-1">
          Review Mobile Hub Appearance
        </h2>
        <p className="text-xs sm:text-sm text-tapsh-charcoal">
          This exact experience loads when guests tap the physical TAPSH NFC product.
        </p>
      </div>

      {/* Device Viewport Selector Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 bg-white border border-tapsh-charcoal/20 rounded-2xl shadow-xs gap-1">
          <button
            type="button"
            onClick={() => setPreviewDevice("iphone")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              previewDevice === "iphone"
                ? "bg-tapsh-black text-white shadow-xs"
                : "text-tapsh-charcoal hover:text-tapsh-black"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone 17 Pro (Mobile)</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("tablet")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              previewDevice === "tablet"
                ? "bg-tapsh-black text-white shadow-xs"
                : "text-tapsh-charcoal hover:text-tapsh-black"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet / iPad</span>
          </button>
        </div>
      </div>

      {/* Phone / Tablet Mockup Container */}
      <div className="flex justify-center bg-[#FAF8F5] rounded-3xl border border-tapsh-charcoal/15 p-2 sm:p-6 overflow-hidden">
        {previewDevice === "iphone" ? (
          /* IPHONE 17 PRO MODEL */
          <div className="relative w-full max-w-[360px] sm:max-w-[393px] h-[720px] sm:h-[820px] transition-all">
            
            {/* Realistic Physical Side Buttons on Titanium Chassis */}
            <div className="hidden sm:block absolute -left-[14px] top-24 w-[3px] h-7 bg-[#2E2E33] rounded-l-md shadow-xs"></div>
            <div className="hidden sm:block absolute -left-[14px] top-36 w-[3px] h-12 bg-[#2E2E33] rounded-l-md shadow-xs"></div>
            <div className="hidden sm:block absolute -left-[14px] top-52 w-[3px] h-12 bg-[#2E2E33] rounded-l-md shadow-xs"></div>
            <div className="hidden sm:block absolute -right-[14px] top-36 w-[3px] h-16 bg-[#2E2E33] rounded-r-md shadow-xs"></div>

            {/* Titanium Outer Rim */}
            <div className="w-full h-full p-2.5 sm:p-3 bg-[#1C1C1F] rounded-[3.6rem] border-[3px] border-[#2E2E35] shadow-2xl relative ring-1 ring-black/40 overflow-hidden">
              
              {/* Inner Screen Bezel */}
              <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden relative shadow-inner flex flex-col">
                
                {/* Dynamic Island (iPhone 17 Pro Signature) */}
                <div className="absolute top-2.5 inset-x-0 z-30 flex justify-center pointer-events-none">
                  <div className="w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-md">
                    {/* Front Camera Lens Reflection */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#181820] border border-[#2b2b36] flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-[#3e456b]/90"></div>
                    </div>
                    {/* FaceID Sensor Dot */}
                    <div className="w-2 h-2 rounded-full bg-[#0a0a0f]"></div>
                  </div>
                </div>

                {/* Hub View Content */}
                <div className="flex-1 w-full h-full overflow-hidden">
                  <HubView data={{
                    businessName: data.businessName || "Business Name",
                    description: data.description || "Welcome to our space. Select an option below.",
                    greetingMessage: data.greetingMessage,
                    links: data.links.length > 0 ? data.links : [
                      { id: 1, category: "reviews", title: "Rate Us on Google", url: "#", icon: "google" },
                      { id: 2, category: "contact", title: "WhatsApp Direct", url: "#", icon: "whatsapp" },
                      { id: 3, category: "website", title: "Official Website", url: "#", icon: "globe" }
                    ]
                  }} />
                </div>

                {/* Home Indicator Bar */}
                <div className="absolute bottom-1.5 inset-x-0 z-30 flex justify-center pointer-events-none">
                  <div className="w-32 h-1 bg-black/40 rounded-full"></div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* TABLET / IPAD MODEL */
          <div className="relative w-full max-w-[560px] sm:max-w-[620px] h-[700px] sm:h-[780px] transition-all">
            <div className="w-full h-full p-3 sm:p-4 bg-[#1C1C1F] rounded-[2.5rem] border-[3px] border-[#2E2E35] shadow-2xl relative ring-1 ring-black/40 overflow-hidden flex flex-col">
              
              {/* Tablet Top Camera Dot */}
              <div className="absolute top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-[#2b2b36] shadow-sm"></div>
              </div>

              {/* Tablet Inner Screen */}
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative shadow-inner flex-1">
                <HubView data={{
                  businessName: data.businessName || "Business Name",
                  description: data.description || "Welcome to our space. Select an option below.",
                  greetingMessage: data.greetingMessage,
                  links: data.links.length > 0 ? data.links : [
                    { id: 1, category: "reviews", title: "Rate Us on Google", url: "#", icon: "google" },
                    { id: 2, category: "contact", title: "WhatsApp Direct", url: "#", icon: "whatsapp" },
                    { id: 3, category: "website", title: "Official Website", url: "#", icon: "globe" }
                  ]
                }} />
                {/* Home Indicator Bar */}
                <div className="absolute bottom-1.5 inset-x-0 z-30 flex justify-center pointer-events-none">
                  <div className="w-36 h-1 bg-black/40 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // SUCCESS SCREEN
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
      <div className="max-w-lg mx-auto text-center py-4 space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-tapsh-soft-green/10 text-tapsh-soft-green rounded-full flex items-center justify-center mx-auto border-2 border-tapsh-soft-green shadow-xs">
          <Check className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-tapsh-black">Hub Successfully Deployed!</h2>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            Permanent digital routing is provisioned for <strong className="text-tapsh-black">{createdHub?.businessName}</strong>.
          </p>
        </div>

        {/* Custom QR Code Card & Download */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 text-center shadow-xs">
          <span className="inline-block px-3 py-1 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green text-[10px] font-bold tracking-wider uppercase mb-2">
            Custom Hardware QR Code
          </span>
          <p className="text-xs text-tapsh-charcoal mb-4">
            Scan with any phone camera or download high-resolution PNG for printing stands & tags.
          </p>

          <div className="bg-white p-4 rounded-2xl border-2 border-tapsh-charcoal/15 inline-block shadow-sm mb-4">
            <QRCodeCanvas
              id="hub-qr-canvas"
              value={liveUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-tapsh-soft-green" /> Download QR Code (PNG)
            </button>
          </div>
        </div>

        {/* Working Live Shortlink (Copy & Paste to open) */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-tapsh-charcoal tracking-wider">
              Live Hub Web Link (Copy & Paste in Browser)
            </span>
            {copiedLink && (
              <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in">
                ✓ Copied to clipboard!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={liveUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="text-xs font-mono font-bold text-tapsh-black flex-1 p-2.5 bg-white border border-tapsh-charcoal/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green select-all"
            />
            <button
              onClick={() => handleCopyUrl(liveUrl)}
              className="p-2.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-[11px] text-tapsh-charcoal">
            Paste this URL into any browser tab to open this customer's live mobile touchpoint Hub.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <a 
            href={`/h/${createdHub?.slug}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-tapsh-soft-green text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs hover:brightness-110"
          >
            <ExternalLink className="w-4 h-4" /> Open Live Hub Tab
          </a>
          <Link 
            href={`/admin/customers/${createdHub?.customerId}`}
            className="p-3 bg-white border border-tapsh-charcoal/20 text-tapsh-black rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-tapsh-pale-blue/30"
          >
            <User className="w-4 h-4" /> View Profile
          </Link>
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-tapsh-charcoal/15 shadow-xs">
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
