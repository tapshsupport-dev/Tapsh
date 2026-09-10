import Link from "next/link";

export default function HubPage() {
  const examples = [
    "Resort / Hotel",
    "Restaurant / Café",
    "Salon / Spa",
    "Clinic",
    "Shop / Retail",
    "Homestay",
    "Office"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-6xl font-bold text-tapsh-black mb-6">
          One Tap. One Scan. One Hub.
        </h1>
        <p className="text-xl md:text-2xl text-tapsh-black/70 mb-8">
          TAPSH Hub brings your important business links into one simple, branded mobile experience.
        </p>
        <p className="text-lg text-tapsh-coffee">
          Your physical TAPSH products point to one permanent Hub URL. When your business information changes, TAPSH updates the Hub instantly without replacing the physical NFC or QR products.
        </p>
      </div>

      {/* Examples Grid */}
      <div className="bg-tapsh-pale-blue/10 rounded-3xl p-8 md:p-16 mb-20">
        <h2 className="text-2xl font-bold text-center mb-12">Perfect for any business</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {examples.map((example, idx) => (
            <div key={idx} className="bg-white px-6 py-3 rounded-full shadow-sm border border-tapsh-pale-blue/30 font-medium text-tapsh-black">
              {example}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/contact" 
          className="inline-block px-8 py-4 bg-tapsh-deep text-white rounded-lg font-medium hover:bg-tapsh-black transition-colors"
        >
          Contact us to get started
        </Link>
      </div>
    </div>
  );
}
