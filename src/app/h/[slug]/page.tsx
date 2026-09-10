import { mockHubs } from "@/lib/data";
import { notFound } from "next/navigation";
import HubView from "@/components/HubView";

export default async function PublicHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Find the hub data based on slug
  const hubData = mockHubs.find(h => h.slug === slug);

  if (!hubData) {
    notFound();
  }

  if (hubData.status === "SUSPENDED") {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-tapsh-pale-blue flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-tapsh-black mb-2">Service Suspended</h2>
          <p className="text-tapsh-charcoal font-medium text-sm leading-relaxed">
            This TAPSH Hub is currently unavailable. Please contact the business administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-tapsh-taupe flex justify-center">
      {/* We constrain the max-width to simulate the mobile phone experience even on desktop */}
      <div className="w-full max-w-md bg-tapsh-pale-blue min-h-screen min-h-[100dvh] md:h-screen md:max-h-[920px] overflow-hidden shadow-2xl relative border-x border-tapsh-black">
        <HubView data={{
          businessName: hubData.slug.replace("-", " ").toUpperCase(),
          description: "Welcome to our digital hub.",
          links: hubData.links
        }} />
      </div>
    </div>
  );
}
