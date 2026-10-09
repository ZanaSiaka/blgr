import Link from "next/link";

import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { DailyJournalData, Site } from "@/lib/types";
import { formatFCFA } from "@/components/ui";
import SitePicker from "@/components/site-picker";
import JournalNav from "@/components/journal-nav";

const SECTIONS = [
  { id: "production", label: "Production" },
  { id: "rafraichissement", label: "Rafraîchissement" },
  { id: "patisserie", label: "Pâtisserie" },
  { id: "glacier", label: "Glacier" },
  { id: "recap", label: "Récapitulatif" },
];

export default async function JourneauHomePage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; date?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const sites = await apiGet<Site[]>("/sites");
  const siteId = sp.site_id ? Number(sp.site_id) : session.user.site_id;
  if (!siteId) {
    return <SitePicker sites={sites} path="/journeau" />;
  }
  const date = sp.date ?? new Date().toISOString().slice(0, 10);
  const journal = await apiGet<DailyJournalData>(`/daily-journals/${siteId}/${date}`).catch(() => null);
  const siteName = sites.find((s) => s.id === siteId)?.name ?? "Boutique";

  if (!journal) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">Journal Quotidien — {siteName} · {date}</h1>
        <JournalNav basePath="/journeau" />
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border">
          Aucune donnée pour cette date. Commencez par saisir une section.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTIONS.map((s) => (
            <Link key={s.id} href={`/journeau/${s.id}?site_id=${siteId}&date=${date}`} className="p-4 bg-white rounded-lg border hover:border-slate-400 text-sm font-medium text-center">
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-lg font-semibold">Journal Quotidien — {siteName} · {date}</h1>
      <JournalNav basePath="/journeau" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">Résumé rapide</h2>
          <div className="text-xs space-y-1">
            <div className="flex justify-between"><span>Production</span><strong>{journal.baguette_total} baguettes</strong></div>
            <div className="flex justify-between"><span>Client spécial</span><strong>{formatFCFA(journal.recette_client_special)}</strong></div>
            <div className="flex justify-between"><span>Pâtisseries</span><strong>{formatFCFA(journal.recette_patisseries)}</strong></div>
            <div className="flex justify-between"><span>Rafraîchissement</span><strong>{formatFCFA(journal.recette_frigo + journal.glace_vendus * journal.glace_pu)}</strong></div>
            <div className="flex justify-between"><span>Glaces</span><strong>{formatFCFA(journal.total_glaces)}</strong></div>
            <div className="flex justify-between border-t pt-1"><span className="font-semibold">Total recette</span><strong>{formatFCFA(journal.total_recette)}</strong></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">Accès aux sections</h2>
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map((s) => (
              <Link key={s.id} href={`/journeau/${s.id}?site_id=${siteId}&date=${date}`} className="p-3 bg-slate-50 rounded border hover:border-slate-400 text-xs font-medium text-center">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
