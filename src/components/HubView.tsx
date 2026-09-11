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
  Link2,
  Globe
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
import { useSiteAssets } from "@/context/SiteAssetsContext";

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

/**
 * Extracts the 1st two capital initials from the business name.
 * Example: "hill top" -> "HT", "The Tamara Coorg" -> "TT", "Subko" -> "SU"
 */
export function getBusinessInitials(name?: string): string {
  if (!name || !name.trim()) return "TP";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

/**
 * Returns a high-resolution, thematic default backdrop matching the selected business type / title.
 */
export function getDefaultBackdrop(businessType?: string, businessName?: string): string {
  const typeStr = (businessType || "").toLowerCase();
  const nameStr = (businessName || "").toLowerCase();
  const combined = `${typeStr} ${nameStr}`;

  // 1. Resort / Hotel / Homestay / Hospitality / Villa
  if (
    combined.includes("resort") ||
    combined.includes("hotel") ||
    combined.includes("homestay") ||
    combined.includes("stay") ||
    combined.includes("villa") ||
    combined.includes("lodge") ||
    combined.includes("retreat")
  ) {
    return "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200";
  }

  // 2. Salon / Spa / Barbershop / Wellness / Beauty
  if (
    combined.includes("salon") ||
    combined.includes("spa") ||
    combined.includes("barber") ||
    combined.includes("grooming") ||
    combined.includes("beauty") ||
    combined.includes("wellness") ||
    combined.includes("parlour")
  ) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200";
  }

  // 3. Clinic / Healthcare / Medical / Dental / Hospital
  if (
    combined.includes("clinic") ||
    combined.includes("dental") ||
    combined.includes("hospital") ||
    combined.includes("health") ||
    combined.includes("doctor") ||
    combined.includes("care")
  ) {
    return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200";
  }

  // 4. Retail / Store / Boutique / Fashion / Jewelry
  if (
    combined.includes("retail") ||
    combined.includes("shop") ||
    combined.includes("boutique") ||
    combined.includes("store") ||
    combined.includes("fashion") ||
    combined.includes("jewelry")
  ) {
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200";
  }

  // 5. Office / Corporate / Co-working / Studio / Agency
  if (
    combined.includes("office") ||
    combined.includes("co-working") ||
    combined.includes("coworking") ||
    combined.includes("corporate") ||
    combined.includes("agency") ||
    combined.includes("studio")
  ) {
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";
  }

  // 6. Restaurant / Café / Bar / Food / Bakery / Dining (Default hospitality)
  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200";
}

export default function HubView({ data }: HubViewProps) {
  const [activeWifiModal, setActiveWifiModal] = useState<any | null>(null);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);

  // Retrieve TAPSH black main logo from site assets context (or fallback)
  let tapshLogoDark = "/images/logo-dark.png";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { getAsset } = useSiteAssets();
    tapshLogoDark = getAsset("logo_dark", "/images/logo-dark.png");
  } catch {
    // Context fallback
  }

  // Shop Name, Category Subtitle, and Description
  const businessName = data.businessName?.trim() || "The Haven";
  const businessType = data.businessType?.trim() || "RESTAURANT • CAFÉ • BAR";
  const miniDescription = 
    data.description?.trim() || 
    data.shortDescription?.trim() || 
    data.greetingMessage?.trim() || 
    "Good Food Brings People Together";

  // Context-aware Backdrop Photo: uses uploaded cover if provided, otherwise matches the selected category
  const backdropPhoto = data.coverUrl && data.coverUrl.trim() !== ""
    ? data.coverUrl
    : getDefaultBackdrop(businessType, businessName);

  // Helper to identify if a link is a Google Review touchpoint
  const isGoogleReviewLink = (l: any) => {
    if (!l) return false;
    const icon = (l.icon || "").toLowerCase();
    const cat = (l.category || "").toLowerCase();
    const title = (l.title || "").toLowerCase();
    const url = (l.url || "").toLowerCase();
    return (
      icon.includes("google") ||
      title.includes("google") ||
      (cat === "reviews" && !title.includes("tripadvisor") && !title.includes("makemytrip") && !title.includes("trustpilot")) ||
      url.includes("g.page") ||
      url.includes("google.com") ||
      url.includes("goo.gl")
    );
  };

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

  // 2. SORT LINKS: Google Review MUST always be #1 priority and list first
  const sortedValidLinks = [...validLinks].sort((a, b) => {
    const aIsGoogle = isGoogleReviewLink(a);
    const bIsGoogle = isGoogleReviewLink(b);
    if (aIsGoogle && !bIsGoogle) return -1;
    if (!aIsGoogle && bIsGoogle) return 1;
    return 0;
  });

  // Fallback demo links only if zero links exist (e.g. initial setup preview before inputs)
  const displayLinks = sortedValidLinks.length > 0 ? sortedValidLinks : [
    { id: "demo-rev", category: "reviews", title: "Leave a Review", subtitle: "Share your experience", url: "https://google.com", icon: "google" },
    { id: "demo-wa", category: "contact", title: "Chat on WhatsApp", subtitle: "Get in touch with us", url: "https://wa.me/917977469926", icon: "whatsapp" },
    { id: "demo-ig", category: "social", title: "Follow on Instagram", subtitle: "See what's happening", url: "https://instagram.com", icon: "instagram" },
    { id: "demo-fb", category: "social", title: "Facebook Page", subtitle: "Connect on Facebook", url: "https://facebook.com", icon: "facebook" },
    { id: "demo-yt", category: "social", title: "YouTube Channel", subtitle: "Watch our videos", url: "https://youtube.com", icon: "youtube" },
    { id: "demo-wifi", category: "wifi", title: "Connect to Wi-Fi", subtitle: "Stay connected", url: "wifi:Guest_Wi-Fi", icon: "wifi", ssid: "Guest_Wi-Fi", password: "welcomeguest" },
    { id: "demo-menu", category: "website", title: "View Menu", subtitle: "Explore our offerings", url: "https://example.com/menu", icon: "menu" },
    { id: "demo-web", category: "website", title: "Visit Our Website", subtitle: "Learn more about us", url: "https://example.com", icon: "globe" }
  ];

  // Helper for touchpoint styling with dedicated, accurate platform icons
  const getTouchpointConfig = (link: any) => {
    const icon = (link.icon || "").toLowerCase();
    const cat = (link.category || "").toLowerCase();
    const title = (link.title || "").toLowerCase();

    // 1. Google Review / Reviews (Always #1 priority)
    if (isGoogleReviewLink(link)) {
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

    // 3. Facebook (Distinct Facebook blue badge & icon)
    if (icon.includes("facebook") || title.includes("facebook") || cat === "facebook") {
      return {
        title: link.title || "Facebook Page",
        subtitle: link.subtitle || "Connect on Facebook",
        cardBg: "bg-[#EEF4FC] hover:bg-[#E2ECFA] border-[#D3E2F4] text-[#132A4A]",
        chevronColor: "text-[#7999C2]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs shrink-0">
            <FacebookIcon className="w-5 h-5 fill-white" />
          </div>
        )
      };
    }

    // 4. YouTube (Distinct YouTube red badge & icon)
    if (icon.includes("youtube") || title.includes("youtube") || cat === "youtube") {
      return {
        title: link.title || "YouTube Channel",
        subtitle: link.subtitle || "Watch our videos",
        cardBg: "bg-[#FDF0F0] hover:bg-[#FAE3E3] border-[#F8D5D5] text-[#4A1515]",
        chevronColor: "text-[#C27979]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shadow-xs shrink-0">
            <YouTubeIcon className="w-5 h-5 fill-white" />
          </div>
        )
      };
    }

    // 5. X / Twitter (Distinct Black badge & white X logo)
    if (
      icon.includes("twitter") || 
      icon.includes("x") || 
      title.includes("twitter") || 
      title.includes("x (") || 
      title === "x" || 
      title.includes("x profile")
    ) {
      return {
        title: link.title || "Follow on X",
        subtitle: link.subtitle || "Stay updated",
        cardBg: "bg-[#F3F3F4] hover:bg-[#E8E8EA] border-[#E0E0E3] text-[#222225]",
        chevronColor: "text-[#888890]",
        iconBadge: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center shadow-xs shrink-0">
            <XTwitterIcon className="w-4 h-4 fill-white" />
          </div>
        )
      };
    }

    // 6. Instagram (Strictly only Instagram!)
    if (icon.includes("instagram") || title.includes("instagram") || title.includes("insta")) {
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

    // 7. Wi-Fi
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

    // 8. Menu / Food / Dining
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

    // 9. Book Table / Appointment / Calendar
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

    // 10. Maps / Location / Directions
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

    // 11. Phone / Call
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

    // 12. Email
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

    // 13. Default Website / Custom link
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
      
      {/* Subtle botanical leaves watermark in bottom left corner */}
      <svg 
        className="absolute -bottom-2 -left-2 w-28 h-28 text-[#8C765C] opacity-20 pointer-events-none z-0" 
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

      {/* TOP SECTION: BACKDROP PHOTO + CONVEX ARCH + LOGO + SHOP TITLE */}
      <div className="shrink-0 flex flex-col">
        
        {/* 1. BACKDROP PHOTO WITH CURVED ARCH BOTTOM */}
        <div className="w-full relative h-36 sm:h-40 overflow-hidden shrink-0">
          <img 
            src={backdropPhoto} 
            alt={businessName} 
            className="w-full h-full object-cover" 
          />
          {/* Ambient overlay for rich contrast */}
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
                /* Fallback initials: 1st two initials in capital letters (e.g. "hill top" -> "HT") */
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#EAD8B7] tracking-wider uppercase select-none">
                  {getBusinessInitials(businessName)}
                </span>
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

      {/* 5. TOUCHPOINT ACTION CARDS (REVIEW #1 PRIORITY, INSTA, WA, FB, YT, ETC.) */}
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

      {/* 6. FOOTER BRANDING (POWERED BY + TAPSH BLACK MAIN LOGO + TAGLINE + 2 BUTTONS) */}
      <div className="relative z-10 text-center pt-2 pb-3.5 sm:pb-4 shrink-0 select-none flex flex-col items-center">
        <span className="text-[9px] uppercase font-bold tracking-[0.24em] text-[#8C8070] block">
          POWERED BY
        </span>

        {/* TAPSH Main Black Logo */}
        <div className="mt-1 mb-0.5 flex items-center justify-center">
          <img 
            src={tapshLogoDark} 
            alt="TAPSH" 
            className="h-5 sm:h-6 w-auto object-contain"
          />
        </div>

        {/* Tagline */}
        <p className="text-[10.5px] sm:text-[11px] text-[#786E61] font-medium tracking-tight">
          Smart NFC & QR Solutions for Businesses
        </p>

        {/* Two Small Buttons: [ Explore TAPSH ]   [ WhatsApp Us ] */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold bg-white hover:bg-[#FAF8F5] text-[#2C2723] border border-[#DDD5CA] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Globe className="w-3 h-3 text-[#786E61]" />
            <span>Explore TAPSH</span>
          </a>
          <a
            href="https://wa.me/917977469926?text=Hi%20TAPSH%20%F0%9F%91%8B%20I'm%20interested%20in%20TAPSH%20solutions%20for%20my%20business."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#16381C] border border-[#25D366]/30 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <WhatsAppIcon className="w-3 h-3 fill-[#25D366]" />
            <span>WhatsApp Us</span>
          </a>
        </div>
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
