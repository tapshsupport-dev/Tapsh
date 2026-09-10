import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Smartphone, Building2, Coffee, Scissors, Briefcase, ShoppingBag, PlusCircle, CheckCircle2 } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import HowItWorksAnimation from "@/components/HowItWorksAnimation";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pt-20 bg-tapsh-bg-warm text-tapsh-black">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Premium Product Backdrop Layer */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero_backdrop.png" 
            alt="TAPSH Premium NFC Products" 
            fill 
            priority
            className="object-cover object-[70%_center] lg:object-right opacity-30 md:opacity-60 lg:opacity-100 pointer-events-none mix-blend-multiply" 
          />
          {/* Gradient Overlays to guarantee text readability */}
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-tapsh-bg-warm via-tapsh-bg-warm/90 to-transparent lg:w-3/4 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-tapsh-bg-warm via-transparent to-transparent z-10 h-full"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="text-center lg:text-left max-w-3xl lg:mr-auto">
            <FadeIn>
              <h2 className="text-tapsh-taupe font-bold tracking-widest uppercase text-sm mb-4">Tap. Connect. Grow.</h2>
            </FadeIn>
            <SlideUp delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-tapsh-black">
                Smart NFC, QR & Digital Solutions for Businesses.
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-xl md:text-2xl text-tapsh-charcoal font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                Turn physical customer touchpoints into simple digital experiences.
              </p>
            </SlideUp>
            
            <FadeIn delay={0.4} className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
              <Link 
                href="/products"  
                className="w-full sm:w-auto px-8 py-4 bg-tapsh-black text-tapsh-beige rounded-full font-bold hover:bg-tapsh-taupe transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/hub-info" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent text-tapsh-taupe border-2 border-tapsh-taupe/40 rounded-full font-bold hover:border-tapsh-taupe hover:bg-tapsh-taupe/5 transition-all flex items-center justify-center"
              >
                Discover TAPSH Hub
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <HowItWorksAnimation />

      {/* WHY TAPSH SECTION */}
      <section className="py-24 bg-tapsh-black text-tapsh-pale-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SlideUp>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why TAPSH?</h2>
              <p className="text-lg text-tapsh-pale-blue/80 mb-10 leading-relaxed max-w-xl">
                Connecting your physical space to digital actions should be simple — for you and effortless for your customers.
              </p>
              
              <div className="space-y-8 mb-10">
                {[
                  { title: "One tap. Multiple possibilities.", desc: "Connect customers to reviews, WhatsApp, Wi-Fi, Instagram, websites, bookings and more." },
                  { title: "NFC + QR in one touchpoint.", desc: "Easy tap for modern phones, with QR as the universal fallback." },
                  { title: "No app required.", desc: "Customers can access the experience directly from their phone browser." },
                  { title: "One permanent digital destination.", desc: "Update links and information without replacing the physical TAPSH product." },
                  { title: "Built for real businesses.", desc: "Designed for hospitality, restaurants, retail, salons, clinics and professional spaces." }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-tapsh-soft-green/10 flex items-center justify-center shrink-0 mt-1 border border-tapsh-soft-green/30 group-hover:bg-tapsh-soft-green/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-tapsh-soft-green" />
                    </div>
                    <div>
                      <h4 className="font-bold text-tapsh-pale-blue text-lg mb-1">{benefit.title}</h4>
                      <p className="text-sm text-tapsh-pale-blue/60 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-bold text-tapsh-beige tracking-wide uppercase text-sm border-t border-tapsh-charcoal/30 pt-8 inline-block">
                Simple for customers. Powerful for businesses.
              </p>
            </SlideUp>
            
            <FadeIn delay={0.2} className="relative h-full flex items-center justify-center">
              <div className="aspect-square w-full max-w-xl mx-auto bg-tapsh-black rounded-[3rem] border-8 border-tapsh-beige/30 shadow-2xl overflow-hidden relative group">
                <img 
                  src="/images/tapsh_lifestyle.png" 
                  alt="TAPSH Lifestyle NFC Card" 
                  className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* BUSINESS TYPES SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <FadeIn className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-tapsh-black">Industries We Serve</h2>
            <p className="text-tapsh-charcoal font-medium">Tailored solutions for every type of physical business.</p>
          </FadeIn>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Gradient Edges for fade effect */}
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          {/* Moving Container */}
          <div className="flex w-max animate-marquee-lr pause-on-hover">
            {[
              ...[
                { name: "Resorts / Hotels", icon: Building2 },
                { name: "Restaurants / Cafés", icon: Coffee },
                { name: "Salons / Spas", icon: Scissors },
                { name: "Clinics", icon: PlusCircle },
                { name: "Retail", icon: ShoppingBag },
                { name: "Offices", icon: Briefcase },
                { name: "Homestays", icon: Building2 },
                { name: "Other Businesses", icon: ShoppingBag },
              ],
              ...[
                { name: "Resorts / Hotels", icon: Building2 },
                { name: "Restaurants / Cafés", icon: Coffee },
                { name: "Salons / Spas", icon: Scissors },
                { name: "Clinics", icon: PlusCircle },
                { name: "Retail", icon: ShoppingBag },
                { name: "Offices", icon: Briefcase },
                { name: "Homestays", icon: Building2 },
                { name: "Other Businesses", icon: ShoppingBag },
              ]
            ].map((type, i) => (
              <div key={i} className="w-[280px] md:w-[320px] px-3 md:px-4 shrink-0">
                <div className="bg-tapsh-pale-blue p-8 rounded-3xl border border-tapsh-charcoal/20 text-center hover:border-tapsh-black transition-colors shadow-sm hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-center">
                  <type.icon className="w-10 h-10 mx-auto text-tapsh-soft-green mb-4" />
                  <h3 className="font-bold text-tapsh-black">{type.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-tapsh-black text-center">
        <SlideUp className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6 text-tapsh-pale-blue">Ready to upgrade your customer experience?</h2>
          <p className="text-tapsh-pale-blue/70 mb-10 text-lg">Join the businesses using TAPSH to bridge the physical and digital divide.</p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-tapsh-pale-blue text-tapsh-black rounded-full font-bold hover:bg-white transition-colors shadow-xl"
          >
            Get TAPSH for Your Business
            <ArrowRight className="w-5 h-5" />
          </Link>
        </SlideUp>
      </section>

    </div>
  );
}
