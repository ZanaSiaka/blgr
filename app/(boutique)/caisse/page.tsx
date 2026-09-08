import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { PosProduct, Site } from "@/lib/types";
import PosView from "@/components/views/pos-view";
import SitePicker from "@/components/site-picker";

export default async function CaissePage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");

  if (!siteId) {
    return <SitePicker sites={sites} path="/caisse" />;
  }

  const products = await apiGet<PosProduct[]>(`/pos/products?site_id=${siteId}`);
  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";

  return <PosView products={products} siteId={siteId} siteName={siteName} />;
}