import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Alert, Lot, Movement, StockItem } from "@/lib/types";
import StockCentralView from "@/components/views/stock-central-view";

export default async function StockCentralPage() {
  const session = await requireSession();
  const siteId = session.user.site_id ?? 1;

  const [stock, movements, lots, alerts] = await Promise.all([
    apiGet<StockItem[]>(`/stock?site_id=${siteId}`),
    apiGet<Movement[]>(`/stock/movements?site_id=${siteId}`),
    apiGet<Lot[]>(`/stock/lots?site_id=${siteId}`),
    apiGet<Alert[]>(`/reports/alerts?site_id=${siteId}`),
  ]);

  return (
    <StockCentralView
      items={stock}
      movements={movements}
      lots={lots}
      alerts={alerts}
      siteLabel="Dépôt Central"
    />
  );
}