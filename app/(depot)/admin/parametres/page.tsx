import { apiGet } from "@/lib/api";
import type { Category, Unit } from "@/lib/types";
import AdminParamsView from "@/components/views/admin-params-view";

export default async function AdminParamsPage() {
  const [categories, units] = await Promise.all([
    apiGet<Category[]>("/categories"),
    apiGet<Unit[]>("/units"),
  ]);

  return <AdminParamsView categories={categories} units={units} />;
}