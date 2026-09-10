import { Star, Wifi, Phone, MapPin, Globe, Camera, MessageCircle, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

// Helper to map category to correct icon
const getIconForCategory = (category: string) => {
  switch (category) {
    case "reviews": return <Star className="w-5 h-5" />;
    case "wifi": return <Wifi className="w-5 h-5" />;
    case "contact": return <Phone className="w-5 h-5" />;
    case "website": return <Globe className="w-5 h-5" />;
    case "social": return <Camera className="w-5 h-5" />;
    case "whatsapp": return <MessageCircle className="w-5 h-5" />;
    default: return <LinkIcon className="w-5 h-5" />;
  }
};

export default function HubView({ data }: { data: any }) {
  // Extract specific link types
  const reviewLinks = data.links?.filter((l: any) => l.category === "reviews") || [];
  const actionLinks = data.links?.filter((l: any) => l.category !== "reviews") || [];

  return (
    <div className="w-full h-full bg-[#FAF8F5] overflow-y-auto scrollbar-hide text-tapsh-black relative">
      
      {/* Dynamic Cover Image or Beige Gradient */}
      <div className="w-full h-64 bg-white relative border-b border-tapsh-charcoal/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAF8F5] z-10"></div>
        {/* Placeholder for actual cover image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
           <span className="font-bold tracking-widest text-tapsh-charcoal">[ COVER ]</span>
        </div>
      </div>

      <div className="relative z-20 px-6 pb-12 -mt-16">
        
        {/* Logo */}
        <div className="w-28 h-28 bg-white rounded-full border-[6px] border-[#FAF8F5] shadow-xl mx-auto flex items-center justify-center mb-6 overflow-hidden relative">
          <Image src="/images/logo-icon.png" alt="TAPSH Icon" fill className="object-cover" />
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
                    className="flex items-center justify-center gap-3 w-full py-4 bg-tapsh-taupe text-tapsh-beige rounded-2xl font-bold text-lg hover:bg-tapsh-black transition-colors active:scale-95 shadow-lg"
                  >
                    <Star className="w-6 h-6 fill-tapsh-beige" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Grid */}
          {actionLinks.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {actionLinks.map((link: any, i: number) => (
                <a 
                  key={i}
                  href={link.url}
                  target="_blank"
                  className="flex flex-col items-center justify-center p-6 bg-white border border-tapsh-charcoal/20 rounded-[2rem] hover:border-tapsh-soft-green hover:shadow-md transition-all active:scale-95 text-tapsh-black shadow-sm group"
                >
                  <div className="w-14 h-14 rounded-[1.2rem] bg-tapsh-beige/30 flex items-center justify-center mb-4 text-tapsh-taupe border border-tapsh-charcoal/10 shadow-inner group-hover:bg-tapsh-taupe group-hover:text-tapsh-beige transition-colors">
                    {getIconForCategory(link.category)}
                  </div>
                  <span className="font-bold text-sm text-center line-clamp-2">
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
            <Image src="/images/logo-dark.png" alt="TAPSH" width={80} height={24} className="w-auto h-5 object-contain opacity-80" />
          </div>
        </div>

      </div>
    </div>
  );
}
