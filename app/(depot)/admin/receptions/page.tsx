import { apiGet } from "@/lib/api";
import type { ReceptionRow } from "@/lib/types";
import AdminReceptionsView from "@/components/views/admin-receptions-view";

export default async function AdminReceptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const kind = params.kind && params.kind !== "TOUS" ? params.kind : undefined;
  const rows = await apiGet<ReceptionRow[]>(`/receptions${kind ? `?kind=${kind}` : ""}`);
  return <AdminReceptionsView rows={rows} />;
}