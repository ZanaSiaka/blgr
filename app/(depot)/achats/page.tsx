import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Article, PurchaseOrder, Supplier, Treasury } from "@/lib/types";
import AchatsView from "@/components/views/achats-view";

export default async function AchatsPage() {
  const session = await requireSession();
  const siteId = session.user.site_id ?? 1;

  const [suppliers, articles, orders, treasury] = await Promise.all([
    apiGet<Supplier[]>("/suppliers"),
    apiGet<Article[]>("/articles"),
    apiGet<PurchaseOrder[]>("/purchase-orders"),
    apiGet<Treasury>(`/treasury?site_id=${siteId}`),
  ]);

  return <AchatsView suppliers={suppliers} articles={articles} orders={orders} treasury={treasury} siteId={siteId} />;
}