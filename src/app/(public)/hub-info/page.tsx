import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Smartphone, Link as LinkIcon, Edit, ShieldCheck } from "lucide-react";

export default function HubInfoPage() {
  return (
    <div className="pt-20 min-h-screen bg-tapsh-pale-blue text-tapsh-black">
      
      {/* Hero */}
      <section className="bg-tapsh-black py-24 text-center border-b border-tapsh-charcoal/30">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-tapsh-pale-blue mb-6 tracking-tight">
            One Tap. One Scan. One Hub.
          </h1>
          <p className="text-xl text-tapsh-pale-blue/80 max-w-2xl mx-auto leading-relaxed">
            TAPSH Hub brings the important links of a business into one simple, beautiful mobile experience.
          </p>
        </div>
      </section>

      {/* Feature Explanation */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-tapsh-black mb-6">Designed for Simplicity</h2>
            <p className="text-lg text-tapsh-charcoal mb-8 leading-relaxed">
              We built TAPSH Hub to be frictionless. Customers don't want to download an app or navigate a complex 10-page website just to find the Wi-Fi password or leave a review.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-tapsh-charcoal/30 flex items-center justify-center shrink-0 shadow-md">
                  <Smartphone className="w-6 h-6 text-tapsh-soft-green" />
                </div>
                <div>
                  <h4 className="font-bold text-tapsh-black text-lg">No App Required</h4>
                  <p className="text-tapsh-charcoal">Works instantly in the native browser of any modern smartphone.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-tapsh-charcoal/30 flex items-center justify-center shrink-0 shadow-md">
                  <LinkIcon className="w-6 h-6 text-tapsh-soft-green" />
                </div>
                <div>
                  <h4 className="font-bold text-tapsh-black text-lg">Dynamic Display</h4>
                  <p className="text-tapsh-charcoal">Only display modules that actually have data. If you don't use Instagram, it simply doesn't show up.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-tapsh-charcoal/30 flex items-center justify-center shrink-0 shadow-md">
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
               <Image 
                 src="/images/hub-preview.png" 
                 alt="TAPSH Hub Mobile Preview" 
                 width={800} 
                 height={1000} 
                 className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-700" 
               />
             </div>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-24 bg-white border-y border-tapsh-charcoal/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-tapsh-black mb-4">Tailored to Your Industry</h2>
            <p className="text-tapsh-charcoal max-w-2xl mx-auto">
              The business type determines the suggested structure and default modules, ensuring the Hub perfectly matches guest expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Resort / Hotel", image: "/images/resort_hub_ui.png", tags: ["Wi-Fi", "Room Service", "Reviews", "Maps"] },
              { title: "Restaurant / Café", image: "/images/restaurant_hub_ui.png", tags: ["Menu", "Reviews", "Instagram", "WhatsApp"] },
              { title: "Salon / Spa", image: "/images/salon_hub_ui.png", tags: ["Booking", "Services", "Reviews", "Call"] },
              { title: "Clinic / Healthcare", image: "/images/clinic_hub_ui.png", tags: ["Appointment", "Location", "Contact", "Reviews"] }
            ].map((industry, i) => (
              <div key={i} className="bg-tapsh-pale-blue rounded-3xl p-6 border border-tapsh-charcoal/20 text-center shadow-md hover:-translate-y-1 transition-transform duration-300">
                <div className="w-full aspect-[9/16] bg-white rounded-2xl mb-6 overflow-hidden border border-tapsh-charcoal/30 shadow-inner relative group">
                  <Image 
                    src={industry.image} 
                    alt={`${industry.title} Hub UI`} 
                    fill 
                    className="object-cover transform transition-transform duration-700 group-hover:scale-105" 
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
