import { redirect } from "next/navigation";

import AppHeader from "@/components/app-header";
import { requireSession } from "@/lib/auth";
import type { NavItem } from "@/components/nav";

const DEPOT_LINKS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/achats", label: "Achats" },
  { href: "/transferts", label: "Dispatching" },
  { href: "/recettes", label: "Recettes" },
  { href: "/stock-central", label: "Stock Central" },
  { href: "/rapports", label: "Rapports" },
  { href: "/rapports/journeau", label: "Journal" },
  { href: "/admin", label: "Administration" },
];

export default async function DepotLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const isDepot = session.user.role === "ADMIN" || session.user.role === "RESP_DEPOT";
  if (!isDepot) redirect("/reception");

  const links = DEPOT_LINKS;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <AppHeader user={session.user} links={links} siteLabel="Magasin Principal / Direction" />
      <main className="flex-1">{children}</main>
    </div>
  );
}