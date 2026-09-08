import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Site, StockItem, TransferNote } from "@/lib/types";
import TransfertView from "@/components/views/transfert-view";

export default async function TransfertsPage() {
  const session = await requireSession();
  const siteId = session.user.site_id ?? 1;

  const [stock, sites, notes] = await Promise.all([
    apiGet<StockItem[]>(`/stock?site_id=${siteId}`),
    apiGet<Site[]>("/sites"),
    apiGet<TransferNote[]>("/transfer-notes"),
  ]);

  return <TransfertView depotStock={stock} sites={sites} notes={notes} fromSiteId={siteId} />;
}