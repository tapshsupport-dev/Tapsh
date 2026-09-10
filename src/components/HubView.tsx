"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useSiteAssets } from "@/context/SiteAssetsContext";
import { getTouchpointIcon } from "@/components/TouchpointIcons";

export default function HubView({ data }: { data: any }) {
  const { getAsset } = useSiteAssets();
  const logoIcon = getAsset("logo_icon", "/images/logo-icon.png");
  const logoDark = getAsset("logo_dark", "/images/logo-dark.png");

  // Extract specific link types
  const reviewLinks = data.links?.filter((l: any) => l.category === "reviews") || [];
  const actionLinks = data.links?.filter((l: any) => l.category !== "reviews") || [];


  return (
    <div className="w-full h-full bg-[#FAF8F5] overflow-y-auto scrollbar-hide text-tapsh-black relative">
      
      {/* Dynamic Cover Image or Warm Gradient */}
      <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-tapsh-taupe to-tapsh-black relative border-b border-tapsh-charcoal/20 overflow-hidden">
        {data.coverUrl ? (
          <img 
            src={data.coverUrl} 
            alt={data.businessName || "Cover"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tapsh-taupe via-[#3d332c] to-tapsh-black opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF8F5] z-10"></div>
      </div>

      <div className="relative z-20 px-6 pb-12 -mt-16">
        
        {/* Logo */}
        <div className="w-28 h-28 bg-white rounded-full border-[6px] border-[#FAF8F5] shadow-xl mx-auto flex items-center justify-center mb-6 overflow-hidden relative">
          <img src={logoIcon} alt="TAPSH Icon" className="w-full h-full object-cover" />
        </div>


        {/* Business Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-tapsh-black tracking-tight mb-2">
            {data.businessName || "Business Name"}
          </h1>
          <p className="text-sm text-tapsh-charcoal font-bold max-w-[280px] mx-auto leading-relaxed">
            {data.description || "Welcome to our space. Select an option below to connect with us."}
          </p>
        </div>

        {/* Action Modules */}
        <div className="space-y-4">
          
          {/* Reviews Section - Prominent */}
          {reviewLinks.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 shadow-md border border-tapsh-charcoal/20 text-center">
              <h3 className="font-bold text-tapsh-charcoal mb-4 text-xs uppercase tracking-widest">How was your experience?</h3>
              <div className="space-y-3">
                {reviewLinks.map((link: any, i: number) => (
                  <a 
                    key={i}
                    href={link.url}
                    target="_blank"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-tapsh-taupe text-tapsh-beige rounded-2xl font-bold text-base sm:text-lg hover:bg-tapsh-black transition-colors active:scale-95 shadow-lg group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getTouchpointIcon(link, "md")}
                    </div>
                    <span>{link.title || "Rate Us on Google"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Grid */}
          {actionLinks.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {actionLinks.map((link: any, i: number) => (
                <a 
                  key={i}
                  href={link.url}
                  target="_blank"
                  className="flex flex-col items-center justify-center p-5 sm:p-6 bg-white border border-tapsh-charcoal/20 rounded-[2rem] hover:border-tapsh-soft-green hover:shadow-md transition-all active:scale-95 text-tapsh-black shadow-sm group"
                >
                  <div className="w-14 h-14 rounded-[1.2rem] bg-tapsh-beige/25 flex items-center justify-center mb-3 sm:mb-4 border border-tapsh-charcoal/10 shadow-inner group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all">
                    {getTouchpointIcon(link, "md")}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-center line-clamp-2">
                    {link.title}
                  </span>
                </a>
              ))}
            </div>
          )}

        </div>

        {/* Footer Branding */}
        <div className="mt-16 text-center flex flex-col items-center justify-center">
          <p className="font-[signature] italic text-3xl text-tapsh-black mb-8">{data.greetingMessage || "Thank you ♡"}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-tapsh-charcoal mb-1">Powered By</p>
          <div className="flex flex-col items-center mt-2">
            <img src={logoDark} alt="TAPSH" className="w-auto h-5 object-contain opacity-80" />
          </div>

        </div>

      </div>
    </div>
  );
}
