"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Link as LinkIcon, Edit, ShieldCheck } from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";

export default function HubInfoPage() {
  const { getAsset } = useSiteAssets();

  const hubPreview = getAsset("hub_preview", "/images/hub-preview.png");
  const resortHubUi = getAsset("resort_hub_ui", "/images/resort_hub_ui.png");
  const restaurantHubUi = getAsset("restaurant_hub_ui", "/images/restaurant_hub_ui.png");
  const salonHubUi = getAsset("salon_hub_ui", "/images/salon_hub_ui.png");
  const clinicHubUi = getAsset("clinic_hub_ui", "/images/clinic_hub_ui.png");

  return (
    <div className="pt-20 min-h-screen bg-tapsh-pale-blue text-tapsh-black">
      
      {/* Hero */}
      <section className="bg-tapsh-black py-14 sm:py-20 md:py-24 text-center border-b border-tapsh-charcoal/30">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-tapsh-pale-blue mb-4 sm:mb-6 tracking-tight">
            One Tap. One Scan. One Hub.
          </h1>
          <p className="text-lg sm:text-xl text-tapsh-pale-blue/80 max-w-2xl mx-auto leading-relaxed">
            TAPSH Hub brings the important links of a business into one simple, beautiful mobile experience.
          </p>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-tapsh-black mb-6">
              A Micro-Landing Page Built for Quick Guest Action
            </h2>
            <p className="text-tapsh-charcoal text-base sm:text-lg mb-8 leading-relaxed">
              When a guest taps or scans a TAPSH product, they don't get lost on a heavy website. Instead, they open a streamlined digital hub with exactly what they need at that moment.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tapsh-soft-green/10 flex items-center justify-center shrink-0 border border-tapsh-soft-green/30">
                  <Smartphone className="w-6 h-6 text-tapsh-soft-green" />
                </div>
                <div>
                  <h4 className="font-bold text-tapsh-black text-lg">Instant Mobile Access</h4>
                  <p className="text-tapsh-charcoal">Loads fast in any smartphone browser. No app install required.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tapsh-soft-green/10 flex items-center justify-center shrink-0 border border-tapsh-soft-green/30">
                  <LinkIcon className="w-6 h-6 text-tapsh-soft-green" />
                </div>
                <div>
                  <h4 className="font-bold text-tapsh-black text-lg">Direct Action Modules</h4>
                  <p className="text-tapsh-charcoal">Direct buttons for Google Reviews, Instagram, Wi-Fi, WhatsApp, Menu & Booking.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tapsh-soft-green/10 flex items-center justify-center shrink-0 border border-tapsh-soft-green/30">
                  <Edit className="w-6 h-6 text-tapsh-soft-green" />
                </div>
                <div>
                  <h4 className="font-bold text-tapsh-black text-lg">Managed by TAPSH</h4>
                  <p className="text-tapsh-charcoal">Need to update your menu link? Just message us. We handle the technical details.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="rounded-3xl overflow-hidden shadow-2xl relative">
               <img 
                 src={hubPreview} 
                 alt="TAPSH Hub Mobile Preview" 
                 className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-700" 
               />
             </div>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-12 sm:py-20 md:py-24 bg-white border-y border-tapsh-charcoal/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-tapsh-black mb-4">Tailored to Your Industry</h2>
            <p className="text-tapsh-charcoal max-w-2xl mx-auto">
              The business type determines the suggested structure and default modules, ensuring the Hub perfectly matches guest expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Resort / Hotel", image: resortHubUi, tags: ["Wi-Fi", "Room Service", "Reviews", "Maps"] },
              { title: "Restaurant / Café", image: restaurantHubUi, tags: ["Menu", "Reviews", "Instagram", "WhatsApp"] },
              { title: "Salon / Spa", image: salonHubUi, tags: ["Booking", "Services", "Reviews", "Call"] },
              { title: "Clinic / Healthcare", image: clinicHubUi, tags: ["Appointment", "Location", "Contact", "Reviews"] }
            ].map((industry, i) => (
              <div key={i} className="bg-tapsh-pale-blue rounded-3xl p-6 border border-tapsh-charcoal/20 text-center shadow-md hover:-translate-y-1 transition-transform duration-300">
                <div className="w-full aspect-[9/16] bg-white rounded-2xl mb-6 overflow-hidden border border-tapsh-charcoal/30 shadow-inner relative group">
                  <img 
                    src={industry.image} 
                    alt={`${industry.title} Hub UI`} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <h3 className="font-bold text-lg text-tapsh-black mb-4">{industry.title}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {industry.tags.map((tag, j) => (
                    <span key={j} className="text-[10px] uppercase tracking-wider font-bold bg-tapsh-black text-tapsh-pale-blue px-3 py-1 rounded-full shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-tapsh-pale-blue">
        <h2 className="text-3xl font-bold text-tapsh-black mb-6">Ready to set up your Hub?</h2>
        <Link 
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-tapsh-soft-green text-tapsh-pale-blue rounded-full font-bold hover:brightness-110 transition-all shadow-lg hover:-translate-y-0.5"
        >
          Contact TAPSH
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

    </div>
  );
}
