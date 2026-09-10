"use client";

import { useState } from "react";
import { 
  Check, ChevronRight, Upload, Plus, Trash2, 
  Building2, Coffee, Scissors, PlusCircle, ShoppingBag, Briefcase, 
  ChevronDown, ChevronUp, Copy, QrCode, Download, ExternalLink, User,
  Sparkles, ArrowLeft, ArrowRight, Loader2
} from "lucide-react";
import HubView from "@/components/HubView";
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
    { title: "Google Reviews", icon: "google" },
    { title: "TripAdvisor", icon: "tripadvisor" },
    { title: "MakeMyTrip", icon: "mmt" },
    { title: "Booking.com", icon: "booking" }
  ],
  social: [
    { title: "Instagram Profile", icon: "instagram" },
    { title: "Facebook Page", icon: "facebook" },
    { title: "YouTube Channel", icon: "youtube" }
  ],
  contact: [
    { title: "WhatsApp Direct", icon: "whatsapp" },
    { title: "Call Reception", icon: "phone" },
    { title: "Google Maps Location", icon: "map" },
    { title: "Official Email", icon: "mail" }
  ],
  website: [
    { title: "Official Website", icon: "globe" },
    { title: "Online Booking / Menu", icon: "calendar" }
  ]
};

export default function HubSetupWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdHub, setCreatedHub] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("reviews");
  const [copiedLink, setCopiedLink] = useState(false);

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
        <div className="border border-tapsh-charcoal/15 rounded-2xl overflow-hidden bg-[#FAF8F5] mb-2.5 transition-all">
          <button 
            type="button"
            onClick={() => setExpandedCategory(isExpanded ? null : id)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm text-tapsh-black"
          >
            <span>{title}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-tapsh-charcoal" /> : <ChevronDown className="w-4 h-4 text-tapsh-charcoal" />}
          </button>
          {isExpanded && (
            <div className="p-3.5 sm:p-4 pt-0 border-t border-tapsh-charcoal/10 space-y-3 bg-white">
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

        <AccordionItem id="reviews" title="🌟 Customer Review Links">
          {LINK_TEMPLATES.reviews.map(link => (
            <div key={link.title}>
              <label className="text-xs font-semibold text-tapsh-charcoal block mb-1">{link.title}</label>
              <input 
                type="url" 
                placeholder={`https://...`} 
                value={getLinkValue("reviews", link.title)}
                onChange={(e) => handleUpdateLink("reviews", link.title, e.target.value, link.icon)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>
          ))}
        </AccordionItem>

        <AccordionItem id="contact" title="💬 Contact & WhatsApp">
          {LINK_TEMPLATES.contact.map(link => (
            <div key={link.title}>
              <label className="text-xs font-semibold text-tapsh-charcoal block mb-1">{link.title}</label>
              <input 
                type="text" 
                placeholder={link.title.includes("WhatsApp") ? "https://wa.me/91..." : "URL or phone number"} 
                value={getLinkValue("contact", link.title)}
                onChange={(e) => handleUpdateLink("contact", link.title, e.target.value, link.icon)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>
          ))}
        </AccordionItem>

        <AccordionItem id="social" title="📸 Social Channels">
          {LINK_TEMPLATES.social.map(link => (
            <div key={link.title}>
              <label className="text-xs font-semibold text-tapsh-charcoal block mb-1">{link.title}</label>
              <input 
                type="url" 
                placeholder={`https://instagram.com/...`} 
                value={getLinkValue("social", link.title)}
                onChange={(e) => handleUpdateLink("social", link.title, e.target.value, link.icon)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>
          ))}
        </AccordionItem>

        <AccordionItem id="website" title="🌐 Website & Booking">
          {LINK_TEMPLATES.website.map(link => (
            <div key={link.title}>
              <label className="text-xs font-semibold text-tapsh-charcoal block mb-1">{link.title}</label>
              <input 
                type="url" 
                placeholder="https://..." 
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

  // STEP 4: PREVIEW
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

      <div className="flex justify-center bg-[#FAF8F5] rounded-3xl border border-tapsh-charcoal/15 p-2 sm:p-6 overflow-hidden">
        <div className="w-full max-w-[320px] sm:max-w-[350px] h-[640px] sm:h-[720px] bg-white rounded-[2.5rem] border-6 sm:border-8 border-tapsh-black shadow-xl overflow-hidden relative">
          <HubView data={{
            businessName: data.businessName || "Business Name",
            description: data.description || "Welcome to our space. Select an option below.",
            greetingMessage: data.greetingMessage,
            links: data.links.length > 0 ? data.links : [
              { id: 1, category: "reviews", title: "Rate Us on Google", url: "#" },
              { id: 2, category: "contact", title: "WhatsApp Front Desk", url: "#" },
              { id: 3, category: "website", title: "Explore Services", url: "#" }
            ]
          }} />
        </div>
      </div>
    </div>
  );

  // SUCCESS SCREEN
  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center py-6 space-y-5 animate-in fade-in zoom-in-95">
      <div className="w-16 h-16 bg-tapsh-soft-green/10 text-tapsh-soft-green rounded-full flex items-center justify-center mx-auto border-2 border-tapsh-soft-green shadow-xs">
        <Check className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-tapsh-black">Hub Successfully Deployed!</h2>
        <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
          Permanent digital routing has been provisioned.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 text-left">
        <span className="text-[10px] uppercase font-bold text-tapsh-charcoal block mb-1">
          Deployed Permanent Address
        </span>
        <div className="flex items-center gap-2">
          <code className="text-xs font-bold text-tapsh-black flex-1 truncate">
            tapsh.in/h/{createdHub?.slug}
          </code>
          <button
            onClick={handleCopySlug}
            className="p-2 bg-tapsh-soft-green text-white rounded-xl text-xs active:scale-95 transition-all"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <a 
          href={`/h/${createdHub?.slug}`} 
          target="_blank"
          className="p-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open Live Hub
        </a>
        <Link 
          href={`/admin/customers/${createdHub?.customerId}`}
          className="p-3 bg-white border border-tapsh-charcoal/20 text-tapsh-black rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <User className="w-3.5 h-3.5" /> View Profile
        </Link>
      </div>
    </div>
  );

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
