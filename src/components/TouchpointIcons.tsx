import React from "react";
import { Phone, Mail, Globe, Calendar, Star, Link as LinkIcon, Wifi } from "lucide-react";

export const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const XTwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function getTouchpointIcon(
  link: { title?: string; category?: string; icon?: string },
  size: "sm" | "md" | "lg" = "md"
) {
  const t = (link.title || "").toLowerCase();
  const iconKey = (link.icon || "").toLowerCase();
  const cat = (link.category || "").toLowerCase();

  const iconClass = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-4 h-4" : "w-5 h-5";

  // Google Reviews / Google Link
  if (iconKey.includes("google") || t.includes("google") || cat === "reviews") {
    return <GoogleIcon className={iconClass} />;
  }

  // WhatsApp
  if (iconKey.includes("whatsapp") || t.includes("whatsapp")) {
    return <WhatsAppIcon className={`${iconClass} text-[#25D366]`} />;
  }

  // Instagram
  if (iconKey.includes("instagram") || t.includes("instagram")) {
    return <InstagramIcon className={`${iconClass} text-[#E4405F]`} />;
  }

  // Facebook
  if (iconKey.includes("facebook") || t.includes("facebook")) {
    return <FacebookIcon className={`${iconClass} text-[#1877F2]`} />;
  }

  // YouTube
  if (iconKey.includes("youtube") || t.includes("youtube")) {
    return <YouTubeIcon className={`${iconClass} text-[#FF0000]`} />;
  }

  // Twitter / X
  if (
    iconKey.includes("twitter") || 
    iconKey.includes("x") || 
    t.includes("twitter") || 
    t.includes("x (") || 
    t === "x" ||
    t.includes("x profile")
  ) {
    return <XTwitterIcon className={`${iconClass} text-black`} />;
  }

  // Call Reception / Phone
  if (iconKey.includes("phone") || t.includes("call") || t.includes("phone") || t.includes("reception")) {
    return <Phone className={`${iconClass} text-tapsh-taupe`} />;
  }

  // Official Email
  if (iconKey.includes("mail") || t.includes("email") || t.includes("mail")) {
    return <Mail className={`${iconClass} text-tapsh-taupe`} />;
  }

  // Online Booking / Menu
  if (iconKey.includes("calendar") || t.includes("booking") || t.includes("menu")) {
    return <Calendar className={`${iconClass} text-tapsh-taupe`} />;
  }

  // Official Website / Globe
  if (cat === "website" || iconKey.includes("globe") || t.includes("website")) {
    return <Globe className={`${iconClass} text-tapsh-taupe`} />;
  }

  // WiFi
  if (cat === "wifi" || iconKey.includes("wifi")) {
    return <Wifi className={`${iconClass} text-tapsh-taupe`} />;
  }

  return <LinkIcon className={`${iconClass} text-tapsh-taupe`} />;
}

export function resolveTouchpointUrl(link: { url?: string; category?: string; icon?: string; title?: string }): string {
  if (!link || !link.url) return "#";
  const raw = link.url.trim();
  if (!raw || raw === "#") return "#";

  const cat = (link.category || "").toLowerCase();
  const iconKey = (link.icon || "").toLowerCase();
  const title = (link.title || "").toLowerCase();

  // WhatsApp
  if (cat === "contact" && (iconKey === "whatsapp" || title.includes("whatsapp"))) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "#";
    const full = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${full}`;
  }

  // Call / Phone
  if (cat === "contact" && (iconKey === "phone" || title.includes("call") || title.includes("phone") || title.includes("reception"))) {
    if (raw.startsWith("tel:")) return raw;
    const cleanNumber = raw.replace(/[^\d+]/g, "");
    return `tel:${cleanNumber}`;
  }

  // Email
  if (cat === "contact" && (iconKey === "mail" || title.includes("email") || title.includes("mail"))) {
    if (raw.startsWith("mailto:")) return raw;
    return `mailto:${raw}`;
  }

  // Instagram
  if (cat === "social" && (iconKey === "instagram" || title.includes("instagram"))) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const handle = raw.startsWith("@") ? raw.slice(1) : raw;
    if (handle.startsWith("instagram.com/")) return `https://${handle}`;
    if (!handle.includes("/")) return `https://instagram.com/${handle}`;
    return `https://${handle}`;
  }

  // Facebook
  if (cat === "social" && (iconKey === "facebook" || title.includes("facebook"))) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const handle = raw.startsWith("@") ? raw.slice(1) : raw;
    if (handle.startsWith("facebook.com/")) return `https://${handle}`;
    if (!handle.includes("/")) return `https://facebook.com/${handle}`;
    return `https://${handle}`;
  }

  // YouTube
  if (cat === "social" && (iconKey === "youtube" || title.includes("youtube"))) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("@")) return `https://youtube.com/${raw}`;
    if (raw.startsWith("youtube.com/")) return `https://${raw}`;
    if (!raw.includes("/")) return `https://youtube.com/@${raw}`;
    return `https://${raw}`;
  }

  // Twitter / X
  if (cat === "social" && (iconKey === "twitter" || iconKey === "x" || title.includes("twitter") || title.includes("x"))) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const handle = raw.startsWith("@") ? raw.slice(1) : raw;
    if (handle.startsWith("x.com/") || handle.startsWith("twitter.com/")) return `https://${handle}`;
    if (!handle.includes("/")) return `https://x.com/${handle}`;
    return `https://${handle}`;
  }

  // Wi-Fi
  if (cat === "wifi" || iconKey === "wifi") {
    return raw;
  }

  // Already has protocol
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("tel:") || raw.startsWith("mailto:")) {
    return raw;
  }

  return `https://${raw}`;
}
