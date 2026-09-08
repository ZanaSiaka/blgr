import { apiGet } from "@/lib/api";
import type { Alert, ExpenseReportRow, MarginRow, SalesReportRow, TopProductRow } from "@/lib/types";
import ReportsView from "@/components/views/reports-view";

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? new Date().toISOString().slice(0, 10);
  const to = params.to ?? new Date().toISOString().slice(0, 10);

  const [sales, top, margins, alerts, expenses] = await Promise.all([
    apiGet<SalesReportRow[]>(`/reports/sales?from_date=${from}&to_date=${to}`),
    apiGet<TopProductRow[]>(`/reports/top-products?from_date=${from}&to_date=${to}`),
    apiGet<MarginRow[]>(`/reports/margins?from_date=${from}&to_date=${to}`),
    apiGet<Alert[]>("/reports/alerts"),
    apiGet<ExpenseReportRow[]>(`/reports/expenses?from_date=${from}&to_date=${to}`),
  ]);

  return <ReportsView from={from} to={to} sales={sales} top={top} margins={margins} alerts={alerts} expenses={expenses} />;
}