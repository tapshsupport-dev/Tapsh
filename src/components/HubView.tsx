"use client";

import { useState } from "react";
import { Star, X, Check, Copy, Wifi, Phone, Mail, Globe, ArrowUpRight, ChevronRight } from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";
import { 
  GoogleIcon, 
  WhatsAppIcon, 
  InstagramIcon, 
  FacebookIcon, 
  YouTubeIcon, 
  XTwitterIcon, 
  resolveTouchpointUrl 
} from "@/components/TouchpointIcons";

export default function HubView({ data }: { data: any }) {
  const { getAsset } = useSiteAssets();
  const logoIcon = getAsset("logo_icon", "/images/logo-icon.png");
  const logoDark = getAsset("logo_dark", "/images/logo-dark.png");

  const [activeWifiModal, setActiveWifiModal] = useState<any | null>(null);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);

  // Logo fallback
  const displayLogo = data.logoUrl || logoIcon;

  // Extract link types
  const reviewLinks = data.links?.filter((l: any) => l.category === "reviews") || [];
  const actionLinks = data.links?.filter((l: any) => l.category !== "reviews") || [];

  // Helper for branded touchpoint styling
  const getTouchpointConfig = (link: any) => {
    const icon = (link.icon || "").toLowerCase();
    const cat = (link.category || "").toLowerCase();
    const title = (link.title || "").toLowerCase();

    if (icon.includes("whatsapp") || title.includes("whatsapp")) {
      return {
        actionText: "Tap to Chat",
        pillBg: "bg-emerald-50 text-emerald-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:shadow-emerald-500/35 transition-all duration-300">
            <WhatsAppIcon className="w-7 h-7 fill-white" />
          </div>
        )
      };
    }

    if (icon.includes("instagram") || title.includes("instagram")) {
      return {
        actionText: "Follow Us",
        pillBg: "bg-pink-50 text-pink-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-110 group-hover:shadow-pink-500/35 transition-all duration-300">
            <InstagramIcon className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    if (icon.includes("google") || title.includes("google") || cat === "reviews") {
      return {
        actionText: "Leave a Review",
        pillBg: "bg-amber-50 text-amber-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-white flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-all duration-300">
            <GoogleIcon className="w-7 h-7" />
          </div>
        )
      };
    }

    if (icon.includes("wifi") || cat === "wifi") {
      return {
        actionText: "Connect Now",
        pillBg: "bg-cyan-50 text-cyan-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-all duration-300">
            <Wifi className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    if (icon.includes("phone") || title.includes("call") || title.includes("phone")) {
      return {
        actionText: "Direct Call",
        pillBg: "bg-blue-50 text-blue-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
            <Phone className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    if (icon.includes("mail") || title.includes("email") || title.includes("mail")) {
      return {
        actionText: "Send Email",
        pillBg: "bg-amber-50 text-amber-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-all duration-300">
            <Mail className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
        )
      };
    }

    if (icon.includes("twitter") || icon.includes("x") || title.includes("x") || title.includes("twitter")) {
      return {
        actionText: "View Profile",
        pillBg: "bg-neutral-100 text-neutral-800",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/25 group-hover:scale-110 transition-all duration-300">
            <XTwitterIcon className="w-6 h-6 fill-white" />
          </div>
        )
      };
    }

    if (icon.includes("facebook") || title.includes("facebook")) {
      return {
        actionText: "Visit Page",
        pillBg: "bg-blue-50 text-blue-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
            <FacebookIcon className="w-7 h-7 fill-white" />
          </div>
        )
      };
    }

    if (icon.includes("youtube") || title.includes("youtube")) {
      return {
        actionText: "Watch Channel",
        pillBg: "bg-red-50 text-red-700",
        iconElement: (
          <div className="w-14 h-14 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-all duration-300">
            <YouTubeIcon className="w-7 h-7 fill-white" />
          </div>
        )
      };
    }

    return {
      actionText: "Open Link",
      pillBg: "bg-slate-100 text-slate-700",
      iconElement: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-500/25 group-hover:scale-110 transition-all duration-300">
          <Globe className="w-7 h-7 text-white stroke-[2.2]" />
        </div>
      )
    };
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] overflow-y-auto scrollbar-hide text-slate-900 relative">
      
      {/* 1. Sleek Hero Header */}
      <div className="w-full h-52 sm:h-60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
        {data.coverUrl ? (
          <img 
            src={data.coverUrl} 
            alt={data.businessName || "Cover"} 
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/40 via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#F8F9FA] z-10" />
      </div>

      <div className="relative z-20 px-5 sm:px-6 pb-14">
        
        {/* 2. Avatar Profile & Verified Badge */}
        <div className="relative -mt-16 mb-5 flex flex-col items-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full p-1.5 shadow-2xl shadow-black/20 ring-4 ring-white/95 relative z-20 flex items-center justify-center overflow-hidden">
            <img 
              src={displayLogo} 
              alt={data.businessName || "Business Logo"} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 shadow-xs mt-3.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Verified TAPSH Hub</span>
          </div>
        </div>

        {/* 3. Business Title & Headline */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {data.businessName || "Business Name"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-[320px] mx-auto leading-relaxed">
            {data.description || "Welcome to our space. Select an option below to connect with us."}
          </p>
        </div>

        {/* 4. Action Modules */}
        <div className="space-y-4">
          
          {/* Prominent Reviews Section (if active) */}
          {reviewLinks.length > 0 && (
            <div className="bg-gradient-to-b from-white to-amber-50/30 rounded-3xl p-6 border border-amber-200/80 shadow-[0_6px_24px_rgba(245,158,11,0.08)] text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">How was your visit?</h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">Your review on Google helps us grow.</p>
              
              <div className="space-y-2.5">
                {reviewLinks.map((link: any, i: number) => {
                  const resolvedUrl = resolveTouchpointUrl(link);
                  return (
                    <a 
                      key={i}
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-950 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md shadow-slate-900/20 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                        <GoogleIcon className="w-4 h-4" />
                      </div>
                      <span>{link.title || "Rate Us on Google"}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Grid */}
          {actionLinks.length > 0 && (
            <div className={actionLinks.length === 1 ? "flex justify-center" : "grid grid-cols-2 gap-3.5 sm:gap-4"}>
              {actionLinks.map((link: any, i: number) => {
                const config = getTouchpointConfig(link);
                const isWifi = link.category === "wifi" || link.icon === "wifi";
                const displayTitle = isWifi 
                  ? (link.title?.startsWith("Connect to Wi-Fi (") ? "Wi-Fi Network" : (link.title || "Wi-Fi Network"))
                  : link.title;

                const singleCardClass = actionLinks.length === 1 ? "w-full max-w-[220px]" : "";
                const resolvedUrl = resolveTouchpointUrl(link);
                const isPhone = link.category === "contact" && (link.icon === "phone" || link.title?.toLowerCase().includes("call"));

                return isWifi ? (
                  <button 
                    key={i}
                    type="button"
                    onClick={() => setActiveWifiModal(link)}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] hover:border-slate-300 transition-all duration-200 active:scale-[0.98] text-slate-900 group flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden ${singleCardClass}`}
                  >
                    {config.iconElement}
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-tapsh-soft-green transition-colors mt-3.5 tracking-tight line-clamp-1">
                      {displayTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors mt-0.5">
                      {config.actionText}
                    </span>
                    {link.ssid && (
                      <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full mt-2 truncate max-w-full font-bold border border-cyan-100">
                        {link.ssid}
                      </span>
                    )}
                  </button>
                ) : (
                  <a 
                    key={i}
                    href={resolvedUrl}
                    target={isPhone ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] hover:border-slate-300 transition-all duration-200 active:scale-[0.98] text-slate-900 group flex flex-col items-center justify-center text-center relative overflow-hidden ${singleCardClass}`}
                  >
                    {config.iconElement}
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-tapsh-soft-green transition-colors mt-3.5 tracking-tight line-clamp-1">
                      {link.title}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors mt-0.5">
                      {config.actionText}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

        </div>

        {/* 5. Refined Closing Sign-off & Official Branding */}
        <div className="mt-14 mb-6 text-center flex flex-col items-center justify-center">
          <p className="font-serif italic text-xl sm:text-2xl text-slate-800 tracking-wide mb-1">
            {data.greetingMessage || "Thank you for visiting"}
          </p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mt-1 mb-8" />

          {/* Subtle Powered by TAPSH Attribution & Discovery Area */}
          <footer className="flex flex-col items-center pt-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
              POWERED BY
            </span>
            
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80 active:scale-98"
              title="TAPSH - Tap. Connect. Grow."
            >
              <img src={logoDark} alt="TAPSH" className="h-5 sm:h-5.5 w-auto object-contain opacity-90" />
            </a>

            <p className="text-[11px] italic font-medium text-slate-500 tracking-wide mt-1.5">
              Tap. Connect. Grow.
            </p>

            <p className="text-[11px] font-medium text-slate-500/90 mt-0.5">
              Smart NFC &amp; QR Solutions for Businesses
            </p>

            {/* Small Premium Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3.5">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-95 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Explore TAPSH</span>
              </a>

              <a
                href="https://wa.me/917977469926?text=Hi%20TAPSH%20%F0%9F%91%8B%20I'm%20interested%20in%20TAPSH%20solutions%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#25D366]/10 border border-[#25D366]/25 text-emerald-800 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 shadow-xs active:scale-95 transition-all"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </footer>
        </div>

      </div>

      {/* Interactive Wi-Fi Connection Modal */}
      {activeWifiModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveWifiModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl relative animate-in zoom-in-95 duration-150 text-center border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveWifiModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto mb-3 flex items-center justify-center border border-cyan-100 shadow-sm">
              <Wifi className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Guest Wi-Fi Network
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Tap below to connect or copy the password.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left mb-4 space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Network Name (SSID)</span>
                <span className="text-sm font-bold text-slate-900">{activeWifiModal.ssid || "Guest Wi-Fi"}</span>
              </div>
              {activeWifiModal.password && (
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 select-all flex-1 truncate shadow-xs">
                      {activeWifiModal.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeWifiModal.password) {
                          navigator.clipboard.writeText(activeWifiModal.password);
                          setCopiedWifiPass(true);
                          setTimeout(() => setCopiedWifiPass(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-tapsh-soft-green transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      {copiedWifiPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                      <span>{copiedWifiPass ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}

              {(activeWifiModal.authType || activeWifiModal.encryption) && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  {activeWifiModal.authType && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Security</span>
                      <span className="font-semibold text-slate-800">{activeWifiModal.authType}</span>
                    </div>
                  )}
                  {activeWifiModal.encryption && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Encryption</span>
                      <span className="font-semibold text-slate-800">{activeWifiModal.encryption}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href={activeWifiModal.url || "#"}
              className="block w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 text-center cursor-pointer"
            >
              Connect to Wi-Fi
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
