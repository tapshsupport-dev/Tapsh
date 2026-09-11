"use client";

import { useState } from "react";
import { 
  Wifi, 
  Phone, 
  Mail, 
  ChevronRight, 
  X, 
  Check, 
  Copy, 
  Utensils, 
  Calendar, 
  MapPin, 
  Link2 
} from "lucide-react";
import { 
  GoogleIcon, 
  WhatsAppIcon, 
  InstagramIcon, 
  FacebookIcon, 
  YouTubeIcon, 
  XTwitterIcon, 
  resolveTouchpointUrl 
} from "@/components/TouchpointIcons";

export interface HubViewProps {
  data: {
    businessName?: string;
    businessType?: string;
    description?: string;
    shortDescription?: string;
    greetingMessage?: string;
    coverUrl?: string;
    logoUrl?: string;
    links?: Array<{
      id?: string | number;
      category?: string;
      title?: string;
      subtitle?: string;
      url?: string;
      icon?: string;
      ssid?: string;
      password?: string;
      authType?: string;
      encryption?: string;
    }>;
  };
}

export default function HubView({ data }: HubViewProps) {
  const [activeWifiModal, setActiveWifiModal] = useState<any | null>(null);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);

  // Fallback Cover Image matching the warm, ambient hospitality reference photo
  const backdropPhoto = data.coverUrl && data.coverUrl.trim() !== ""
    ? data.coverUrl
    : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200";

  // Shop Name, Category Subtitle, and Description
  const businessName = data.businessName?.trim() || "The Haven";
  const businessType = data.businessType?.trim() || "RESTAURANT • CAFÉ • BAR";
  const miniDescription = 
    data.description?.trim() || 
    data.shortDescription?.trim() || 
    data.greetingMessage?.trim() || 
    "Good Food Brings People Together";

  // 1. FILTER LINKS: Only showcase touchpoints that are actually selected / filled with a valid URL or Wi-Fi info
  const rawLinks = data.links || [];
  const validLinks = rawLinks.filter((l) => {
    if (!l) return false;
    const isWifi = l.category === "wifi" || l.icon === "wifi" || l.title?.toLowerCase().includes("wi-fi") || l.title?.toLowerCase().includes("wifi");
    if (isWifi) {
      return Boolean(l.ssid?.trim() || l.password?.trim() || (l.url && l.url.trim() !== "#" && l.url.trim() !== ""));
    }
    const url = (l.url || "").trim();
    return Boolean(url && url !== "#" && url !== "https://" && url !== "http://" && url !== "");
  });

  // If no links configured yet (e.g. preview mode or fresh hub), provide fallback demo links matching reference image
  const displayLinks = validLinks.length > 0 ? validLinks : [
    { id: "demo-rev", category: "reviews", title: "Leave a Review", subtitle: "Share your experience", url: "https://google.com", icon: "google" },
    { id: "demo-wa", category: "contact", title: "Chat on WhatsApp", subtitle: "Get in touch with us", url: "https://wa.me/917977469926", icon: "whatsapp" },
    { id: "demo-ig", category: "social", title: "Follow on Instagram", subtitle: "See what's happening", url: "https://instagram.com", icon: "instagram" },
    { id: "demo-wifi", category: "wifi", title: "Connect to Wi-Fi", subtitle: "Stay connected", url: "wifi:Guest_Wi-Fi", icon: "wifi", ssid: "Guest_Wi-Fi", password: "welcomeguest" },
    { id: "demo-menu", category: "website", title: "View Menu", subtitle: "Explore our offerings", url: "https://example.com/menu", icon: "menu" },
    { id: "demo-book", category: "website", title: "Book a Table", subtitle: "Reserve your spot", url: "https://example.com/book", icon: "calendar" },
    { id: "demo-map", category: "maps", title: "Get Directions", subtitle: "Find us easily", url: "https://maps.google.com", icon: "map" },
    { id: "demo-web", category: "website", title: "Visit Our Website", subtitle: "Learn more about us", url: "https://example.com", icon: "globe" }
  ];

  // Helper for touchpoint styling matching the soft pastel palette in the reference image
  const getTouchpointConfig = (link: any) => {
    const icon = (link.icon || "").toLowerCase();
    const cat = (link.category || "").toLowerCase();
    const title = (link.title || "").toLowerCase();

    // 1. Google Review / Reviews
    if (icon.includes("google") || title.includes("review") || title.includes("google") || cat === "reviews") {
      return {
        title: link.title || "Leave a Review",
        subtitle: link.subtitle || "Share your experience",
        cardBg: "bg-[#FBF8F3] hover:bg-[#F5F0E8] border-[#ECE3D6] text-[#22201D]",
        chevronColor: "text-[#A89F91]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-neutral-100 flex items-center justify-center shrink-0">
            <GoogleIcon className="w-5 h-5" />
          </div>
        )
      };
    }

    // 2. WhatsApp
    if (icon.includes("whatsapp") || title.includes("whatsapp") || title.includes("chat")) {
      return {
        title: link.title || "Chat on WhatsApp",
        subtitle: link.subtitle || "Get in touch with us",
        cardBg: "bg-[#EBF7EE] hover:bg-[#DFEFDE] border-[#D0EBD7] text-[#16331C]",
        chevronColor: "text-[#7EA786]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
            <WhatsAppIcon className="w-5 h-5 fill-white" />
          </div>
        )
      };
    }

    // 3. Instagram
    if (icon.includes("instagram") || title.includes("instagram") || title.includes("insta") || cat === "social") {
      return {
        title: link.title || "Follow on Instagram",
        subtitle: link.subtitle || "See what's happening",
        cardBg: "bg-[#FAF0F4] hover:bg-[#F5E5EC] border-[#F4D7E2] text-[#361B29]",
        chevronColor: "text-[#B0899C]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-xs shrink-0">
            <InstagramIcon className="w-5 h-5 text-white" />
          </div>
        )
      };
    }

    // 4. Wi-Fi
    if (cat === "wifi" || icon.includes("wifi") || title.includes("wi-fi") || title.includes("wifi")) {
      return {
        title: link.title || "Connect to Wi-Fi",
        subtitle: link.subtitle || "Stay connected",
        cardBg: "bg-[#EBF2F8] hover:bg-[#DEE9F3] border-[#D1E0EE] text-[#1B2936]",
        chevronColor: "text-[#7F9EB8]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#283747] text-white flex items-center justify-center shadow-xs shrink-0">
            <Wifi className="w-5 h-5 text-white stroke-[2.4]" />
          </div>
        )
      };
    }

    // 5. Menu / Food / Dining
    if (icon.includes("menu") || icon.includes("food") || title.includes("menu") || title.includes("order") || title.includes("food") || title.includes("dining")) {
      return {
        title: link.title || "View Menu",
        subtitle: link.subtitle || "Explore our offerings",
        cardBg: "bg-[#F7EFE8] hover:bg-[#EEE2D7] border-[#E8D9CB] text-[#362719]",
        chevronColor: "text-[#A9937E]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D4BA9F] text-[#362719] flex items-center justify-center shadow-xs shrink-0">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
          </div>
        )
      };
    }

    // 6. Book Table / Appointment / Calendar
    if (icon.includes("calendar") || icon.includes("book") || title.includes("book") || title.includes("reserve") || title.includes("table") || title.includes("appointment")) {
      return {
        title: link.title || "Book a Table",
        subtitle: link.subtitle || "Reserve your spot",
        cardBg: "bg-[#FAF0EA] hover:bg-[#F3E3DB] border-[#ECD7CD] text-[#382218]",
        chevronColor: "text-[#AD8D7F]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E8C5B5] text-[#382218] flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
        )
      };
    }

    // 7. Maps / Location / Directions
    if (cat === "maps" || icon.includes("map") || icon.includes("pin") || title.includes("direction") || title.includes("location") || title.includes("route") || title.includes("find us")) {
      return {
        title: link.title || "Get Directions",
        subtitle: link.subtitle || "Find us easily",
        cardBg: "bg-[#F2EFEA] hover:bg-[#E8E3DB] border-[#DFD8CD] text-[#2D2A26]",
        chevronColor: "text-[#9A9387]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D1C9BE] text-[#2D2A26] flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
        )
      };
    }

    // 8. Phone / Call
    if (icon.includes("phone") || title.includes("call") || title.includes("phone") || title.includes("reception")) {
      return {
        title: link.title || "Call Us",
        subtitle: link.subtitle || "Speak with our team",
        cardBg: "bg-[#EEF4FA] hover:bg-[#DFEAF5] border-[#D3E2F0] text-[#16273A]",
        chevronColor: "text-[#7B9BBF]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0">
            <Phone className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    // 9. Email
    if (icon.includes("mail") || title.includes("email") || title.includes("mail")) {
      return {
        title: link.title || "Email Us",
        subtitle: link.subtitle || "Send a message",
        cardBg: "bg-[#FFF8EE] hover:bg-[#FDEED7] border-[#FCE2BE] text-[#38260F]",
        chevronColor: "text-[#BFA175]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs shrink-0">
            <Mail className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    // 10. Default Website / Custom link
    return {
      title: link.title || "Visit Our Website",
      subtitle: link.subtitle || "Learn more about us",
      cardBg: "bg-[#EEF5EC] hover:bg-[#DFEDE0] border-[#D6E6D3] text-[#1B3019]",
      chevronColor: "text-[#7E9F7C]",
      iconBadge: (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#648F60] text-white flex items-center justify-center shadow-xs shrink-0">
          <Link2 className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
      )
    };
  };

  return (
    <div className="w-full h-full max-h-[100dvh] bg-[#F4EFEA] text-[#1F221B] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      
      {/* Subtle botanical leaves watermark in bottom left corner matching reference image */}
      <svg 
        className="absolute -bottom-2 -left-2 w-28 h-28 text-[#8C765C] opacity-25 pointer-events-none z-0" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.6"
      >
        <path d="M15,95 Q40,65 60,40 Q80,20 95,10" />
        <path d="M35,68 Q22,58 28,45 Q40,52 38,62 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M52,50 Q65,45 60,32 Q48,38 50,48 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M70,35 Q83,32 80,20 Q68,22 68,32 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M86,22 Q98,18 94,8 Q84,10 85,20 Z" fill="currentColor" fillOpacity="0.15" />
      </svg>

      {/* TOP SECTION: BACKDROP PHOTO + ARCH + LOGO + SHOP TITLE */}
      <div className="shrink-0 flex flex-col">
        
        {/* 1. BACKDROP PHOTO WITH CURVED ARCH BOTTOM */}
        <div className="w-full relative h-36 sm:h-40 overflow-hidden shrink-0">
          <img 
            src={backdropPhoto} 
            alt={businessName} 
            className="w-full h-full object-cover" 
          />
          {/* Ambient overlay for rich lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />

          {/* Smooth Convex Architectural Arch SVG (Cream arches upward in the center) */}
          <svg 
            viewBox="0 0 400 48" 
            preserveAspectRatio="none" 
            className="w-full h-10 sm:h-12 absolute -bottom-px left-0 text-[#F4EFEA] fill-current z-10 pointer-events-none"
          >
            <path d="M 0,48 L 0,36 Q 200,0 400,36 L 400,48 Z" />
          </svg>
        </div>

        {/* 2. CIRCULAR LOGO BADGE (Centered on the arch transition apex) */}
        <div className="relative -mt-9 sm:-mt-10 z-20 flex justify-center shrink-0">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-[#F4EFEA] shadow-lg ring-1 ring-[#D8CEBF] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1D2F24] flex items-center justify-center border border-[#A48F6C]/40">
              {data.logoUrl && data.logoUrl.trim() !== "" ? (
                <img 
                  src={data.logoUrl} 
                  alt={businessName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                /* Elegant botanical emblem matching reference image */
                <svg viewBox="0 0 64 64" fill="none" stroke="#D1BA8E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 sm:w-10 sm:h-10">
                  <path d="M18 48 C24 38, 34 26, 46 16" />
                  <path d="M23 41 C21 34, 27 30, 31 34 C32 38, 28 41, 23 41 Z" fill="#D1BA8E" fillOpacity="0.2" />
                  <path d="M29 34 C34 30, 38 34, 35 38 C31 40, 28 37, 29 34 Z" fill="#D1BA8E" fillOpacity="0.2" />
                  <path d="M33 27 C31 20, 38 18, 41 22 C42 26, 38 28, 33 27 Z" fill="#D1BA8E" fillOpacity="0.2" />
                  <path d="M39 21 C44 17, 48 21, 45 25 C41 27, 38 24, 39 21 Z" fill="#D1BA8E" fillOpacity="0.2" />
                  <path d="M43 15 C44 9, 50 11, 49 16 C47 18, 44 18, 43 15 Z" fill="#D1BA8E" fillOpacity="0.2" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* 3. SHOP NAME, CATEGORY SUBTITLE & MINI DESCRIPTION */}
        <div className="text-center px-4 pt-1 pb-1 shrink-0">
          <h1 className="font-[family-name:var(--font-playfair)] font-serif text-2xl sm:text-[26px] font-semibold tracking-tight text-[#1F221B] leading-tight">
            {businessName}
          </h1>

          {businessType && (
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#8C8070] mt-0.5">
              {businessType}
            </p>
          )}

          {miniDescription && (
            <p className="text-xs sm:text-[13px] font-medium text-[#7D7060] mt-1 leading-snug px-3 line-clamp-2 max-w-[320px] mx-auto">
              {miniDescription}
            </p>
          )}

          {/* Centered subtle accent line */}
          <div className="w-8 h-px bg-[#D6CBBF] mx-auto mt-1.5 mb-0.5" />
        </div>

      </div>

      {/* 5. TOUCHPOINT ACTION CARDS (REVIEW.. INSTA.. WA.. ETC.) */}
      {/* Scroll-safe container: Starts from top if many items, centers gracefully if few */}
      <div className="flex-1 min-h-0 px-4 sm:px-5 py-1 overflow-y-auto scrollbar-none flex flex-col justify-start z-10">
        <div className="my-auto flex flex-col gap-1.5 sm:gap-2 w-full py-0.5">
          {displayLinks.map((link: any, idx: number) => {
            const config = getTouchpointConfig(link);
            const isWifi = link.category === "wifi" || link.icon === "wifi" || link.title?.toLowerCase().includes("wi-fi") || link.title?.toLowerCase().includes("wifi");
            const resolvedUrl = resolveTouchpointUrl(link);
            const isPhone = link.category === "contact" && (link.icon === "phone" || link.title?.toLowerCase().includes("call"));

            return isWifi ? (
              <button
                key={link.id || idx}
                type="button"
                onClick={() => setActiveWifiModal(link)}
                className={`w-full rounded-2xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-150 active:scale-[0.985] shadow-[0_1px_4px_rgba(0,0,0,0.02)] border cursor-pointer ${config.cardBg}`}
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  {config.iconBadge}
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-xs sm:text-[13px] leading-tight truncate text-[#1F221B]">
                      {config.title}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-[#786E61] leading-tight mt-0.5 truncate">
                      {config.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 stroke-[2] ${config.chevronColor}`} />
              </button>
            ) : (
              <a
                key={link.id || idx}
                href={resolvedUrl}
                target={isPhone ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className={`w-full rounded-2xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-150 active:scale-[0.985] shadow-[0_1px_4px_rgba(0,0,0,0.02)] border cursor-pointer ${config.cardBg}`}
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  {config.iconBadge}
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-xs sm:text-[13px] leading-tight truncate text-[#1F221B]">
                      {config.title}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-[#786E61] leading-tight mt-0.5 truncate">
                      {config.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 stroke-[2] ${config.chevronColor}`} />
              </a>
            );
          })}
        </div>
      </div>

      {/* 6. FOOTER BRANDING (Handwritten cursive "Tap. Connect. Grow." + "Powered by TAPSH") */}
      <div className="relative z-10 text-center pt-1 pb-3 sm:pb-3.5 shrink-0 select-none">
        <p className="font-[family-name:var(--font-caveat)] text-2xl sm:text-[25px] text-[#846E56] font-normal leading-none">
          Tap. Connect. Grow.
        </p>
        <p className="text-[10px] text-[#918575] tracking-[0.18em] uppercase mt-0.5 font-medium leading-none">
          Powered by <span className="font-bold text-[#23201C] tracking-[0.22em]">TAPSH</span>
        </p>
      </div>

      {/* INTERACTIVE WI-FI CONNECTION MODAL */}
      {activeWifiModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveWifiModal(null)}
        >
          <div 
            className="bg-[#FBF9F5] rounded-3xl p-6 max-w-xs w-full shadow-2xl relative animate-in zoom-in-95 duration-150 text-center border border-[#E8DFC9]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveWifiModal(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#EBF2F8] text-[#283747] mx-auto mb-3 flex items-center justify-center border border-[#D1E0EE] shadow-xs">
              <Wifi className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="font-serif text-lg font-semibold text-[#1F221B]">
              Connect to Wi-Fi
            </h3>
            <p className="text-xs text-[#786E61] mt-1 mb-4">
              Join the guest network while visiting {businessName}
            </p>

            <div className="bg-white rounded-2xl p-3 border border-[#E8DFC9] space-y-2 mb-4 text-left shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8070] tracking-wider block">Network (SSID)</span>
                <span className="text-xs font-semibold text-[#1F221B] break-all">
                  {activeWifiModal.ssid || "Guest_Wi-Fi"}
                </span>
              </div>
              
              {activeWifiModal.password && (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C8070] tracking-wider block">Password</span>
                    <span className="text-xs font-mono font-bold text-[#1F221B]">
                      {activeWifiModal.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeWifiModal.password);
                      setCopiedWifiPass(true);
                      setTimeout(() => setCopiedWifiPass(false), 2000);
                    }}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#8C8070] hover:text-[#1F221B] transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedWifiPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <a
              href={`WIFI:S:${activeWifiModal.ssid || "Guest_Wi-Fi"};T:${activeWifiModal.authType || "WPA"};P:${activeWifiModal.password || ""};;`}
              className="w-full py-2.5 rounded-xl bg-[#283747] hover:bg-[#1C2833] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Connect Automatically</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
