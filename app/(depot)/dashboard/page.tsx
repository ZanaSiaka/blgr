import { apiGet } from "@/lib/api";
import type { Alert, DashboardData } from "@/lib/types";
import DashboardView from "@/components/views/dashboard-view";

export default async function DashboardPage() {
  const [dashboard, alerts] = await Promise.all([
    apiGet<DashboardData>("/reports/dashboard"),
    apiGet<Alert[]>("/reports/alerts"),
  ]);
  return <DashboardView dashboard={dashboard} alerts={alerts} />;
}