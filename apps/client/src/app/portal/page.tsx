import { headers } from "next/headers";
import { getPublicPortalData } from "@/lib/portal/public-portal";
import { PublicPortalView } from "@/components/public-portal-view";

export const dynamic = "force-dynamic";

export default async function PortalPublicoPage({
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
    legislativeLimit: 6,
    agendaLimit: 6,
  });

  return <PublicPortalView initialData={data} />;
}
