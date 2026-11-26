import { headers } from "next/headers";
import { getPublicPortalData } from "@/lib/portal/public-portal";
import { PublicLegislativeCatalog } from "@/components/public-legislative-catalog";

export const dynamic = "force-dynamic";

export default async function PortalLegislativoPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; org?: string; organizationId?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const tenantSlugHeader = headerList.get("x-tenant-slug");

  const data = await getPublicPortalData({
    slug: params.slug || tenantSlugHeader,
    organizationId: params.org || params.organizationId,
    legislativeLimit: 100,
    agendaLimit: 0,
  });

  return <PublicLegislativeCatalog initialData={data} />;
}
