import { apiGet } from "@/lib/api";
import type { Article, Category, Unit } from "@/lib/types";
import AdminArticlesView from "@/components/views/admin-articles-view";

export default async function AdminArticlesPage() {
  const [articles, categories, units] = await Promise.all([
    apiGet<Article[]>("/articles"),
    apiGet<Category[]>("/categories"),
    apiGet<Unit[]>("/units"),
  ]);

  return <AdminArticlesView articles={articles} categories={categories} units={units} />;
}