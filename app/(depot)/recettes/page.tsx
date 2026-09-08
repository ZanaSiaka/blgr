import { apiGet } from "@/lib/api";
import type { Article, Recipe } from "@/lib/types";
import RecipesView from "@/components/views/recipes-view";

export default async function RecettesPage() {
  const [recipes, articles] = await Promise.all([
    apiGet<Recipe[]>("/recipes"),
    apiGet<Article[]>("/articles"),
  ]);
  return <RecipesView recipes={recipes} articles={articles} />;
}