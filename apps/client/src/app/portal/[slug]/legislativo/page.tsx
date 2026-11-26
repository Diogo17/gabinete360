import { getPublicPortalData } from "@/lib/portal/public-portal";
import { PublicLegislativeCatalog } from "@/components/public-legislative-catalog";

export const dynamic = "force-dynamic";

export default async function PortalSlugLegislativoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await getPublicPortalData({
    slug,
    legislativeLimit: 100,
    agendaLimit: 0,
  });

  return <PublicLegislativeCatalog initialData={data} />;
}
