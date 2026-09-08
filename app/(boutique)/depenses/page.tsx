import { apiGet } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import type { Expense, ExpenseCategory, ExpenseReportRow, Site } from "@/lib/types";
import AdminExpensesView from "@/components/views/admin-expenses-view";
import DepensesView from "@/components/views/depenses-view";
import SitePicker from "@/components/site-picker";

export default async function DepensesPage({
  searchParams,
}: {
  searchParams: Promise<{ site_id?: string; from?: string; to?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;

  const isGlobal = session.user.role === "ADMIN" || session.user.role === "RESP_DEPOT";

  if (isGlobal) {
    const from = params.from ?? new Date().toISOString().slice(0, 10);
    const to = params.to ?? new Date().toISOString().slice(0, 10);
    const [rows, expenses] = await Promise.all([
      apiGet<ExpenseReportRow[]>(`/reports/expenses?from_date=${from}&to_date=${to}`),
      apiGet<Expense[]>(`/expenses?from_date=${from}&to_date=${to}`),
    ]);
    return <AdminExpensesView from={from} to={to} rows={rows} expenses={expenses} />;
  }

  const siteId = params.site_id ? Number(params.site_id) : session.user.site_id;
  const sites = await apiGet<Site[]>("/sites");
  if (!siteId) {
    return <SitePicker sites={sites} path="/depenses" />;
  }

  const [categories, expenses] = await Promise.all([
    apiGet<ExpenseCategory[]>("/expense-categories"),
    apiGet<Expense[]>(`/expenses?site_id=${siteId}`),
  ]);

  const siteName = sites.find((site) => site.id === siteId)?.name ?? "Boutique";
  return <DepensesView categories={categories} expenses={expenses} siteName={siteName} />;
}