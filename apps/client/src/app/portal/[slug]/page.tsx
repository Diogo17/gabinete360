import { getPublicPortalData } from "@/lib/portal/public-portal";
import { PublicPortalView } from "@/components/public-portal-view";

export const dynamic = "force-dynamic";

export default async function PortalPublicoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await getPublicPortalData({
    slug,
    legislativeLimit: 6,
    agendaLimit: 6,
  });

  return <PublicPortalView initialData={data} />;
}
