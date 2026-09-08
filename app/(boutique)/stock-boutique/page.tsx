import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Alert, Movement, Site, StockItem } from "@/lib/types";
import StockBoutiqueView from "@/components/views/stock-boutique-view";
import SitePicker from "@/components/site-picker";

export default async function StockBoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/stock-boutique" />;
  }

  const [stock, movements, alerts] = await Promise.all([
    apiGet<StockItem[]>(`/stock?site_id=${siteId}`),
    apiGet<Movement[]>(`/stock/movements?site_id=${siteId}`),
    apiGet<Alert[]>(`/reports/alerts?site_id=${siteId}`),
  ]);

  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";
  return (
    <StockBoutiqueView
      items={stock}
      movements={movements}
      alerts={alerts}
      siteName={siteName}
      siteId={siteId}
    />
  );
}