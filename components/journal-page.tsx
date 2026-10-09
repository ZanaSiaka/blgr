import JournalView from "@/components/views/journal-view";
import JournalNav from "@/components/journal-nav";
import SitePicker from "@/components/site-picker";
import type { Article, DailyJournalData, Recipe, Site, StockItem } from "@/lib/types";
import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";

type JournalSectionId = "production" | "rafraichissement" | "patisserie" | "glacier" | "recap";

const JOURNAL_SECTIONS: { id: JournalSectionId; label: string }[] = [
  { id: "production", label: "Production" },
  { id: "rafraichissement", label: "Rafraîchissement" },
  { id: "patisserie", label: "Pâtisserie" },
  { id: "glacier", label: "Glacier" },
  { id: "recap", label: "Récapitulatif" },
];

const EMPTY_JOURNAL = (siteId: number, date: string): DailyJournalData => ({
  id: null,
  site_id: siteId,
  journal_date: date,
  boulanger_names: null,
  cashier_name: null,
  cashier_phone: null,
  personnel: null,
  observations: null,
  montant_verse: 0,
  bank_name: null,
  bank_ref: null,
  wave_amount: 0,
  orange_amount: 0,
  invendus_casse: 0,
  invendus_brule: 0,
  invendus_rasse: 0,
  invendus_ration: 0,
  glace_arrivage_pack: 0,
  glace_arrivage_cornet: 0,
  glace_vendus: 0,
  glace_pu: 500,
  glace_prix_vente: 0,
  productions: [],
  rafraichissements: [],
  patisseries: [],
  stock_matieres: [],
  clients_speciaux: [],
  depenses: [],
  glacier_lines: [],
  recette_glacier: 0,
  recette_client_special: 0,
  recette_pain: 0,
  recette_patisseries: 0,
  recette_frigo: 0,
  total_recette: 0,
  total_depenses: 0,
  solde: 0,
  manquant: 0,
  total_production: 0,
  baguette_total: 0,
  vendues: 0,
  total_patisserie: 0,
  total_glaces: 0,
  montant_restant_glace: 0,
});

export interface CarryoverData {
  rafraichissements: { article_id: number; stock_initial: number }[];
  patisseries: { article_id: number; report: number }[];
  dispatch: { article_id: number; qty_received: number }[];
}

async function fetchCarryover(siteId: number, date: string): Promise<CarryoverData> {
  try {
    const data = await apiGet<CarryoverData>(`/daily-journals/${siteId}/${date}/carryover`);
    return data;
  } catch {
    return { rafraichissements: [], patisseries: [], dispatch: [] };
  }
}

export default async function JournalPage({
  section,
  searchParams,
  basePath,
  siteLabel,
  readOnly,
}: {
  section: string;
  searchParams: Promise<{ site_id?: string; date?: string }>;
  basePath: string;
  siteLabel: string;
  readOnly?: boolean;
}) {
  const valid = JOURNAL_SECTIONS.map((s) => s.id);
  if (!valid.includes(section as JournalSectionId)) {
    return <div className="p-8 text-center text-red-500">Section invalide: {section}</div>;
  }
  const session = await requireSession();
  const sp = await searchParams;
  const sites = await apiGet<Site[]>("/sites");
  const siteId = sp.site_id ? Number(sp.site_id) : session.user.site_id;
  if (!siteId) return <SitePicker sites={sites} path={basePath} />;
  const date = sp.date ?? new Date().toISOString().slice(0, 10);

  const [journal, carryover, resaleArticles, finishedArticles, recipeList, stockItems] = await Promise.all([
    apiGet<DailyJournalData>(`/daily-journals/${siteId}/${date}`).catch(() => EMPTY_JOURNAL(siteId, date)),
    fetchCarryover(siteId, date),
    apiGet<Article[]>("/articles?type=RESALE_GOOD").catch(() => []),
    apiGet<Article[]>("/articles?type=FINISHED_GOOD").catch(() => []),
    apiGet<Recipe[]>("/recipes").catch(() => []),
    apiGet<StockItem[]>(`/stock?site_id=${siteId}`).catch(() => []),
  ]);

  const stockedArticleIds = new Set(stockItems.filter((s) => s.qty > 0).map((s) => s.article_id));
  const filteredResale = resaleArticles.filter((a) => stockedArticleIds.has(a.id));
  const filteredFinished = finishedArticles.filter((a) => stockedArticleIds.has(a.id));

  const siteName = sites.find((s) => s.id === siteId)?.name ?? siteLabel;
  return (
    <div className="space-y-4">
      <JournalNav basePath={basePath} />
      <JournalView
        journal={journal}
        siteId={siteId}
        siteName={siteName}
        readOnly={readOnly}
        initialTab={section as JournalSectionId}
        section={section as JournalSectionId}
        carryover={carryover}
        resaleArticles={filteredResale}
        finishedArticles={filteredFinished}
        recipes={recipeList}
        stockItems={stockItems}
      />
    </div>
  );
}
