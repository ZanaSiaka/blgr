import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Recipe, Site, StockItem } from "@/lib/types";
import ProductionView from "@/components/views/production-view";
import SitePicker from "@/components/site-picker";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/production" />;
  }

  const [recipes, stock] = await Promise.all([
    apiGet<Recipe[]>("/recipes"),
    apiGet<StockItem[]>(`/stock?site_id=${siteId}`),
  ]);

  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";
  return <ProductionView recipes={recipes} stock={stock} siteName={siteName} siteId={siteId} />;
}