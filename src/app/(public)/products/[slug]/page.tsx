import Link from "next/link";
import { ArrowRight, Smartphone, Zap, Settings, CheckCircle2, Building2 } from "lucide-react";

const PRODUCT_DATA: Record<string, any> = {
  "tapsh-review": {
    name: "TAPSH Review",
    tagline: "Make it easier for customers to share their experience.",
    description: "Capture 5-star Google and TripAdvisor reviews effortlessly while your customers are still on-premises and highly engaged.",
    howItWorks: [
      "Customer taps the TAPSH Review card or scans the QR code.",
      "They are instantly directed to your TAPSH Hub or directly to your Google Review page.",
      "Customer leaves a rating in seconds without searching for your business."
    ],
    included: [
      "Premium NFC-enabled smart card / stand",
      "Custom laser-engraved QR code",
      "Dynamic URL routing via TAPSH Hub",
      "Free replacement guarantee (1 Year)"
    ],
    whoIsItFor: ["Restaurants & Cafés", "Hotels & Resorts", "Salons & Spas", "Clinics"],
  },
  "tapsh-all-in-one": {
    name: "TAPSH All-in-One",
    tagline: "The ultimate digital concierge for your physical space.",
    description: "Give your guests instant access to your menu, Wi-Fi, reviews, social media, and WhatsApp through a single, beautifully branded TAPSH Hub.",
    howItWorks: [
      "Guest taps their phone against the TAPSH display in their room or table.",
      "The custom TAPSH Hub opens instantly—no app download required.",
      "Guest chooses their desired action: order food, connect to Wi-Fi, or message reception."
    ],
    included: [
      "Premium NFC-enabled smart displays",
      "Custom business branding",
      "Full TAPSH Hub setup and management",
      "Analytics and tap tracking"
    ],
    whoIsItFor: ["Luxury Resorts", "Boutique Hotels", "Large Restaurants", "Co-working Spaces"],
  }
};

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = PRODUCT_DATA[resolvedParams.slug] || {
    name: resolvedParams.slug.replace("-", " ").toUpperCase(),
    tagline: "Bridge the gap between your physical space and digital presence.",
    description: "A premium NFC and QR solution tailored for your business needs.",
    howItWorks: [
      "Customer taps or scans the TAPSH product.",
      "The relevant digital experience opens instantly.",
      "Customer completes the action seamlessly."
    ],
    included: ["Premium NFC product", "Custom QR Code", "TAPSH Hub Integration"],
    whoIsItFor: ["Any business with a physical location"],
  };

  return (
    <div className="pt-20 min-h-screen bg-white text-tapsh-black">
      
      {/* Product Hero */}
      <section className="bg-tapsh-pale-blue border-b border-tapsh-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Product Visual Showcase */}
            <div className="aspect-[4/3] bg-gradient-to-br from-tapsh-pale-blue via-white to-tapsh-pale-blue/50 rounded-[2.5rem] border border-tapsh-charcoal/20 shadow-xl flex flex-col items-center justify-center p-8 relative overflow-hidden group">
              <div className="w-32 h-48 bg-tapsh-black rounded-2xl shadow-2xl border border-tapsh-charcoal flex flex-col items-center justify-between p-4 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 relative z-10">
                <div className="w-full flex justify-between items-center text-tapsh-beige">
                  <span className="text-[10px] font-bold tracking-widest">TAPSH</span>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-tapsh-taupe/40 border border-tapsh-charcoal/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-tapsh-beige" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-tapsh-beige font-semibold">NFC + QR Active</span>
              </div>
              <div className="absolute inset-0 bg-tapsh-soft-green/10 rounded-full blur-3xl pointer-events-none scale-125"></div>
            </div>

            {/* Content Side */}
            <div>
              <Link href="/products" className="text-sm font-bold text-tapsh-soft-green hover:text-tapsh-black mb-6 inline-block transition-colors">
                &larr; Back to Products
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-tapsh-black mb-4">{product.name}</h1>
              <p className="text-2xl text-tapsh-charcoal font-medium mb-6">{product.tagline}</p>
              <p className="text-lg text-tapsh-black/70 mb-10 leading-relaxed">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact"
                  className="px-8 py-4 bg-tapsh-black text-tapsh-pale-blue rounded-xl font-bold hover:bg-tapsh-black transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                >
                  Get This for My Business
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/contact"
                  className="px-8 py-4 bg-transparent text-tapsh-black border-2 border-tapsh-black rounded-xl font-bold hover:bg-tapsh-pale-blue transition-all text-center"
                >
                  Contact TAPSH
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NFC + QR & Hub Connection */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-tapsh-black mb-6">Powered by NFC, QR & TAPSH Hub</h2>
            <p className="text-lg text-tapsh-charcoal">
              Every TAPSH product uses dual-technology (NFC chip + QR Code) to ensure 100% smartphone compatibility. 
              Behind the physical product is the TAPSH Hub—a dynamic, permanent URL that you can update anytime without replacing the physical item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-tapsh-pale-blue p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md text-center">
              <Zap className="w-10 h-10 text-tapsh-soft-green mx-auto mb-4" />
              <h3 className="text-xl font-bold text-tapsh-black mb-3">Instant Tap (NFC)</h3>
              <p className="text-tapsh-charcoal">Modern smartphones simply tap the product to instantly trigger the action.</p>
            </div>
            <div className="bg-tapsh-pale-blue p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md text-center">
              <div className="w-10 h-10 border-2 border-tapsh-soft-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-4 bg-tapsh-soft-green"></div>
              </div>
              <h3 className="text-xl font-bold text-tapsh-black mb-3">Scan Backup (QR)</h3>
              <p className="text-tapsh-charcoal">A beautiful, laser-engraved QR code ensures older devices can still connect.</p>
            </div>
            <div className="bg-tapsh-pale-blue p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md text-center">
              <Settings className="w-10 h-10 text-tapsh-soft-green mx-auto mb-4" />
              <h3 className="text-xl font-bold text-tapsh-black mb-3">Dynamic Hub Link</h3>
              <p className="text-tapsh-charcoal">The destination URL is managed remotely. Change your links anytime via TAPSH Admin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Specs */}
      <section className="py-20 bg-tapsh-black text-tapsh-pale-blue border-t border-tapsh-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* How it Works */}
            <div>
              <h3 className="text-2xl font-bold text-tapsh-pale-blue mb-8 flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-tapsh-charcoal" /> How it Works
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-tapsh-charcoal/30">
                {product.howItWorks.map((step: string, index: number) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-tapsh-charcoal bg-tapsh-black text-tapsh-pale-blue shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                      {index + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-tapsh-taupe p-4 rounded-2xl border border-tapsh-charcoal/30 shadow-lg">
                      <p className="text-tapsh-pale-blue/80 font-medium">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Included */}
            <div>
              <h3 className="text-2xl font-bold text-tapsh-pale-blue mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-tapsh-charcoal" /> What is Included
              </h3>
              <ul className="space-y-4">
                {product.included.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 bg-tapsh-taupe p-4 rounded-2xl border border-tapsh-charcoal/30 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-tapsh-charcoal shrink-0 mt-0.5" />
                    <span className="font-medium text-tapsh-pale-blue/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who is it For */}
            <div>
              <h3 className="text-2xl font-bold text-tapsh-pale-blue mb-8 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-tapsh-charcoal" /> Who is it For
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.whoIsItFor.map((audience: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-tapsh-taupe border border-tapsh-charcoal/50 text-tapsh-pale-blue font-medium rounded-full shadow-md">
                    {audience}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
