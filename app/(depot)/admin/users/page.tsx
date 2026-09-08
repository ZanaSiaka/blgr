import { redirect } from "next/navigation";

import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Site, User } from "@/lib/types";
import AdminUsersView from "@/components/views/admin-users-view";

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/admin/fournisseurs");

  const [users, sites] = await Promise.all([
    apiGet<User[]>("/users"),
    apiGet<Site[]>("/sites"),
  ]);

  return <AdminUsersView users={users} sites={sites} />;
}