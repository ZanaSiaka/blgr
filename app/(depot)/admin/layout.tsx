import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { NavLinks, type NavItem } from "@/components/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const isAllowed = session.user.role === "ADMIN" || session.user.role === "RESP_DEPOT";
  if (!isAllowed) redirect("/dashboard");

  const links: NavItem[] = [];
  if (session.user.role === "ADMIN") {
    links.push({ href: "/admin/users", label: "Utilisateurs" });
    links.push({ href: "/admin/boutiques", label: "Boutiques" });
  }
  links.push(
    { href: "/admin/fournisseurs", label: "Fournisseurs" },
    { href: "/admin/articles", label: "Matières & Produits" },
    { href: "/admin/receptions", label: "Réceptions" },
    { href: "/admin/parametres", label: "Paramètres" },
  );

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 pt-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Administration</h2>
            <p className="text-xs text-slate-500">
              Gestion des utilisateurs, boutiques, fournisseurs, matières et produits
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <NavLinks links={links} />
        </div>
      </div>
      {children}
    </div>
  );
}