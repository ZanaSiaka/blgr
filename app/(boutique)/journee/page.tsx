import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { DailySheetData, Site } from "@/lib/types";
import JourneeView from "@/components/views/journee-view";
import SitePicker from "@/components/site-picker";

export default async function JourneePage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; date?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/journee" />;
  }

  const sheetDate = params.date ?? new Date().toISOString().slice(0, 10);
  const sheet = await apiGet<DailySheetData>(`/reports/daily-sheet?site_id=${siteId}&sheet_date=${sheetDate}`);
  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";

  return <JourneeView sheet={sheet} siteId={siteId} siteName={siteName} />;
}