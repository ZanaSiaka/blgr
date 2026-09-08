import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";

export default async function AdminIndex() {
  const session = await requireSession();
  redirect(session.user.role === "ADMIN" ? "/admin/users" : "/admin/fournisseurs");
}