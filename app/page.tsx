import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isDepot = session.user.role === "ADMIN" || session.user.role === "RESP_DEPOT";
  redirect(isDepot ? "/dashboard" : "/reception");
}