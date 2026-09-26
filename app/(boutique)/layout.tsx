import { redirect } from "next/navigation";

import AppHeader from "@/components/app-header";
import { requireSession } from "@/lib/auth";
import type { NavItem } from "@/components/nav";

const BOUTIQUE_LINKS: NavItem[] = [
  { href: "/caisse", label: "Caisse (POS)" },
  { href: "/reception", label: "Réception" },
  { href: "/production", label: "Production" },
  { href: "/depenses", label: "Dépenses" },
  { href: "/journee", label: "Fiche Journée" },
  { href: "/stock-boutique", label: "Stock Boutique" },
  { href: "/clotures", label: "Clôtures" },
];

export default async function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const isBoutique =
    session.user.role === "ADMIN" ||
    session.user.role === "RESP_BOUTIQUE" ||
    session.user.role === "BOULANGER" ||
    session.user.role === "VENDEUR";
  if (!isBoutique) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <AppHeader user={session.user} links={BOUTIQUE_LINKS} siteLabel="Boutique de Vente & Production" />
      <main className="flex-1">{children}</main>
    </div>
  );
}