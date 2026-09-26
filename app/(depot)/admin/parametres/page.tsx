import { apiGet } from "@/lib/api";
import type { Article, Category, IngredientMapEntry, Site, Unit } from "@/lib/types";
import AdminParamsView from "@/components/views/admin-params-view";

export default async function AdminParamsPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string }>;
}) {
  const params = await searchParams;
  const sites = await apiGet<Site[]>("/sites");
  const boutiques = sites.filter((site) => site.kind === "BOUTIQUE" && site.is_active);
  const siteId = params.site_id ? Number(params.site_id) : (boutiques[0]?.id ?? 0);

  const [categories, units, articles, ingredientMap] = await Promise.all([
    apiGet<Category[]>("/categories"),
    apiGet<Unit[]>("/units"),
    apiGet<Article[]>("/articles"),
    siteId ? apiGet<IngredientMapEntry[]>(`/daily-ingredients?site_id=${siteId}`) : Promise.resolve<IngredientMapEntry[]>([]),
  ]);

  return (
    <AdminParamsView
      categories={categories}
      units={units}
      articles={articles}
      sites={boutiques}
      ingredientMap={ingredientMap}
      siteId={siteId}
    />
  );
}