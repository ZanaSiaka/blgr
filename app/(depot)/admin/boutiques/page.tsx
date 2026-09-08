import { redirect } from "next/navigation";

import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Site } from "@/lib/types";
import AdminSitesView from "@/components/views/admin-sites-view";

export default async function AdminBoutiquesPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/admin/fournisseurs");

  const sites = await apiGet<Site[]>("/sites");
  return <AdminSitesView sites={sites} />;
}