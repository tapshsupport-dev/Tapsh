import { mockHubs } from "@/lib/data";
import { getHubBySlug } from "@/lib/firestoreService";
import PublicHubClient from "@/components/PublicHubClient";

export const dynamic = "force-dynamic";

export default async function PublicHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Look up hub in Firestore first, fall back to mockHubs
  let hubData = await getHubBySlug(slug);
  if (!hubData) {
    hubData = mockHubs.find(h => h.slug === slug) || null;
  }

  // If not found yet on server (e.g. freshly created in browser local storage),
  // pass a stub with the slug so the client-side component immediately resolves it from local storage
  const initial = hubData || { 
    slug, 
    businessName: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') 
  };

  return <PublicHubClient slug={slug} initialHub={initial} />;
}
