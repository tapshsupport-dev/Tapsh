import Link from "next/link";
import { ArrowRight, Smartphone, Zap, Settings, CheckCircle2, Building2, MessageCircle, ExternalLink } from "lucide-react";
import ProductSlideshow from "@/components/products/ProductSlideshow";
import { 
  DEFAULT_PRODUCTS, 
  getLocalCachedProducts, 
  ProductItem,
  getProductWhatsAppQuoteUrl 
} from "@/lib/productsService";

const FALLBACK_SPECS: Record<string, any> = {
  "tapsh-review": {
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
  const slug = resolvedParams.slug;

  // Look up product from cached products or defaults
  const allProducts: ProductItem[] = getLocalCachedProducts();
  const matched = allProducts.find((p) => p.slug === slug || p.id === slug) ||
    DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  const product = matched || {
    id: slug,
    slug: slug,
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    price: undefined,
    salePrice: undefined,
    description: "A premium NFC and QR smart touchpoint tailored for modern businesses.",
    link: "",
    itemCode: "",
    tagline: "Bridge the gap between your physical space and digital presence.",
    benefit: "Connect customers instantly with a single tap.",
    images: [],
    iconType: "sparkles" as const,
    category: "Smart Solutions",
    badge: "",
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const specs = FALLBACK_SPECS[product.slug] || {
    howItWorks: [
      "Customer taps or scans the physical TAPSH product.",
      "The designated digital experience or Hub opens instantly on their phone browser.",
      "Customer completes the action effortlessly without any app install."
    ],
    included: [
      "Custom programmed NFC smart touchpoint",
      "High-durability acrylic / metal finish with laser QR",
      "Dynamic cloud-managed TAPSH Hub integration",
      "100% device compatibility guarantee"
    ],
    whoIsItFor: ["Hospitality & Resorts", "Restaurants & Cafés", "Retail & Salons", "Professional Offices"],
  };

  const waQuoteUrl = getProductWhatsAppQuoteUrl(product);
  const hasDiscount = Boolean(product.price && product.salePrice && product.price > product.salePrice);
  const discountPercent = hasDiscount 
    ? Math.round(((product.price! - product.salePrice!) / product.price!) * 100) 
    : 0;

  return (
    <div className="pt-20 min-h-screen bg-white text-tapsh-black">
      
      {/* Product Hero */}
      <section className="bg-tapsh-pale-blue border-b border-tapsh-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Product Visual Showcase (Slideshow if multiple images, single image, or fallback emblem) */}
            <div className="rounded-[2.5rem] border border-tapsh-charcoal/20 shadow-xl overflow-hidden bg-white">
              <ProductSlideshow
                images={product.images}
                name={product.name}
                iconType={product.iconType}
                className="h-80 sm:h-96"
              />
            </div>

            {/* Content Side */}
            <div>
              <Link href="/products" className="text-sm font-bold text-tapsh-soft-green hover:text-tapsh-black mb-6 inline-block transition-colors">
                &larr; Back to All Products
              </Link>
              
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {product.itemCode && (
                  <span className="px-3 py-1 rounded-full bg-tapsh-black text-tapsh-pale-blue text-xs font-mono font-bold tracking-wider shadow-sm">
                    {product.itemCode}
                  </span>
                )}
                {product.badge && (
                  <span className="px-3 py-1 rounded-full bg-tapsh-soft-green text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-tapsh-black mb-4">
                {product.name}
              </h1>

              {/* Price Row */}
              {(product.salePrice || product.price) && (
                <div className="flex items-baseline gap-3 mb-5">
                  {product.salePrice && product.salePrice > 0 ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold text-tapsh-soft-green">
                        ₹{product.salePrice.toLocaleString("en-IN")}
                      </span>
                      {product.price && product.price > product.salePrice && (
                        <span className="text-lg text-tapsh-charcoal line-through font-medium">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </>
                  ) : product.price && product.price > 0 ? (
                    <span className="text-3xl sm:text-4xl font-bold text-tapsh-black">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  ) : null}
                </div>
              )}
              
              {product.description && (
                <p className="text-base sm:text-lg text-tapsh-black/80 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* WhatsApp Catalog Link Pill if configured */}
              {product.link && (
                <div className="mb-6">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-semibold border border-emerald-200 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>View in WhatsApp Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </a>
                </div>
              )}

              {product.benefit && (
                <div className="bg-white p-4 rounded-2xl border border-tapsh-charcoal/20 mb-8 shadow-xs">
                  <span className="block text-xs font-bold text-tapsh-soft-green uppercase tracking-wider mb-1">
                    Primary Advantage
                  </span>
                  <p className="font-semibold text-tapsh-black text-sm sm:text-base">
                    {product.benefit}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={waQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-tapsh-soft-green text-white rounded-xl font-bold hover:brightness-105 transition-all text-center flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Raise a Quote on WhatsApp
                </a>
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
                {specs.howItWorks.map((step: string, index: number) => (
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
                {specs.included.map((item: string, i: number) => (
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
                {specs.whoIsItFor.map((audience: string, i: number) => (
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
