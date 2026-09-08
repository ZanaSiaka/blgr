import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Site, TransferNote } from "@/lib/types";
import ReceptionView from "@/components/views/reception-view";
import SitePicker from "@/components/site-picker";

export default async function ReceptionPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;

  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/reception" />;
  }

  const notes = await apiGet<TransferNote[]>("/transfer-notes");
  const filtered = notes.filter(
    (note) => note.to_site_id === siteId || session.user.role === "ADMIN",
  );

  return <ReceptionView notes={filtered} />;
}