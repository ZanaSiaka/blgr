import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Closure, SaleTicket, Site } from "@/lib/types";
import ClosuresView from "@/components/views/closures-view";
import SitePicker from "@/components/site-picker";

export default async function CloturesPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/clotures" />;
  }

  const [closures, sales] = await Promise.all([
    apiGet<Closure[]>(`/pos/closures?site_id=${siteId}`),
    apiGet<SaleTicket[]>(`/pos/sales?site_id=${siteId}`),
  ]);

  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";
  return <ClosuresView closures={closures} sales={sales} siteId={siteId} siteName={siteName} />;
}