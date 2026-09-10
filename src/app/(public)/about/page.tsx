export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-tapsh-black mb-6">About TAPSH</h1>
      </div>

      <div className="prose prose-lg mx-auto text-tapsh-black/80">
        <p className="text-2xl font-medium text-tapsh-deep text-center mb-12">
          TAPSH helps businesses connect physical customer touchpoints with useful digital experiences through NFC, QR and TAPSH Hub.
        </p>
        
        <div className="space-y-8">
          <p>
            In today's fast-paced world, businesses need simple, reliable ways to connect with their customers. We build tools that bridge the physical and digital divide effortlessly.
          </p>
          <p>
            Our core philosophy is simple: technology should get out of the way. When a customer taps or scans a TAPSH product, they should be immediately directed to what matters most—whether that's leaving a review, connecting to Wi-Fi, or viewing a menu.
          </p>
          <p>
            With the <strong>TAPSH Hub</strong>, we provide a unified, mobile-first experience that businesses can update instantly without reprinting QR codes or reprogramming NFC cards. 
          </p>
        </div>
      </div>
    </div>
  );
}
