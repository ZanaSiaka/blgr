import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { DailySheetData, Site } from "@/lib/types";
import JourneeDatePicker from "@/components/journee-date-picker";
import JourneeView from "@/components/views/journee-view";
import SitePicker from "@/components/site-picker";

export default async function JourneeAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; date?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : undefined;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/rapports/journee" />;
  }

  const sheetDate = params.date ?? new Date().toISOString().slice(0, 10);
  const sheet = await apiGet<DailySheetData>(`/reports/daily-sheet?site_id=${siteId}&sheet_date=${sheetDate}`);
  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";

  return (
    <div className="pt-6">
      <div className="max-w-6xl mx-auto px-6">
        <JourneeDatePicker siteId={siteId} initialDate={sheetDate} />
      </div>
      <JourneeView sheet={sheet} siteId={siteId} siteName={siteName} readOnly />
    </div>
  );
}