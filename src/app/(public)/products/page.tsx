import Link from "next/link";
import { ArrowRight, Star, Wifi, MessageCircle, Camera, Globe, LayoutGrid } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const PRODUCTS = [
  {
    slug: "tapsh-review",
    name: "TAPSH Review",
    description: "Make it effortless for customers to leave 5-star reviews.",
    benefit: "Increase your Google & TripAdvisor ratings instantly.",
    icon: Star
  },
  {
    slug: "tapsh-wifi",
    name: "TAPSH Wi-Fi",
    description: "Connect guests to your network with a single tap.",
    benefit: "No more printing complex passwords.",
    icon: Wifi
  },
  {
    slug: "tapsh-whatsapp",
    name: "TAPSH WhatsApp",
    description: "Direct customers straight to your WhatsApp business chat.",
    benefit: "Capture leads and provide instant support.",
    icon: MessageCircle
  },
  {
    slug: "tapsh-instagram",
    name: "TAPSH Instagram",
    description: "Grow your social following directly from your physical space.",
    benefit: "Turn offline visitors into online followers.",
    icon: Camera
  },
  {
    slug: "tapsh-website",
    name: "TAPSH Website",
    description: "Drive foot traffic to your online menus, booking pages, or store.",
    benefit: "Seamlessly bridge physical to digital.",
    icon: Globe
  },
  {
    slug: "tapsh-all-in-one",
    name: "TAPSH All-in-One",
    description: "The ultimate solution powered by TAPSH Hub.",
    benefit: "One tap opens a custom menu of all your digital links.",
    icon: LayoutGrid
  }
];

export default function ProductsPage() {
  return (
    <div className="pt-20 min-h-screen bg-tapsh-pale-blue">
      
      {/* Header */}
      <div className="bg-tapsh-black py-20 text-center">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-tapsh-pale-blue mb-6">Our Products</h1>
          <p className="text-xl text-tapsh-pale-blue/70 max-w-2xl mx-auto">
            Premium NFC & QR solutions designed to connect your physical space to the digital world.
          </p>
        </FadeIn>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <StaggerItem key={product.slug} id={product.slug} className="scroll-mt-32 bg-white rounded-3xl border border-tapsh-charcoal/20 overflow-hidden hover:shadow-2xl hover:border-tapsh-charcoal/50 hover:-translate-y-1 transition-all group flex flex-col shadow-sm">
              
              {/* Image Placeholder */}
              <div className="h-64 bg-tapsh-pale-blue flex items-center justify-center relative overflow-hidden transition-colors border-b border-tapsh-charcoal/20 group-hover:bg-[#E9E4D3]">
                <product.icon className="w-20 h-20 text-tapsh-charcoal/50 absolute group-hover:scale-110 transition-transform duration-500" />
                <span className="relative z-10 font-bold tracking-widest text-tapsh-black text-sm">
                  [ PRODUCT IMAGE ]
                </span>
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                <h2 className="text-2xl font-bold text-tapsh-black mb-2">{product.name}</h2>
                <p className="text-tapsh-charcoal mb-6 h-12">{product.description}</p>
                
                <div className="bg-tapsh-pale-blue/50 rounded-xl p-4 mb-8 border border-tapsh-charcoal/20">
                  <p className="text-sm font-medium text-tapsh-black">
                    <span className="block text-xs text-tapsh-soft-green font-bold uppercase tracking-wider mb-1">Key Benefit</span>
                    {product.benefit}
                  </p>
                </div>
                
                <div className="mt-auto flex flex-col sm:flex-row items-center gap-4">
                  <Link 
                    href="/contact"
                    className="w-full py-3 text-center bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 transition-colors"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

    </div>
  );
}
