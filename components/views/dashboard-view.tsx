"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  PackageCheck,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";

import { Badge, Card, CardHeader, formatFCFA, PageHeader, PageShell, StatCard } from "@/components/ui";
import type { Alert, DashboardData } from "@/lib/types";

export default function DashboardView({
  dashboard,
  alerts,
}: {
  dashboard: DashboardData;
  alerts: Alert[];
}) {
  const boutiqueEntries = Object.entries(dashboard.ventes_par_boutique).sort(
    (a, b) => b[1] - a[1],
  );
  const max = Math.max(1, ...boutiqueEntries.map(([, value]) => value));

  return (
    <PageShell>
      <PageHeader title="Tableau de Bord Général" subtitle="Supervision en temps réel des ventes, transferts et stocks multi-sites" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Chiffre d'Affaires du Jour"
          value={formatFCFA(dashboard.ca_today)}
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
          sub={
            <div className="space-y-0.5">
              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> ventes du jour
              </span>
              <span className="text-slate-500 block">
                Dépenses : {formatFCFA(dashboard.depenses_jour)} · Net :{" "}
                <strong className={dashboard.net_jour >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {formatFCFA(dashboard.net_jour)}
                </strong>
              </span>
            </div>
          }
        />
        <StatCard
          label="Boutiques"
          value={`${dashboard.nb_boutiques} Boutiques`}
          icon={<Store className="w-4 h-4 text-slate-700" />}
          sub={<span className="text-slate-500">{dashboard.nb_sites} sites actifs</span>}
        />
        <StatCard
          label="Transferts en Transit"
          value={`${dashboard.transferts_en_transit} Bons (BT)`}
          icon={<Truck className="w-4 h-4 text-amber-600" />}
          sub={<span className="text-amber-700 font-medium">En attente de réception</span>}
        />
        <StatCard
          label="Alertes Stock / DLC"
          value={`${alerts.length} Articles`}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          sub={<span className="text-red-600 font-medium">Seuils critiques & péremptions</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7 p-5 space-y-4">
          <CardHeader title="Performance Réseau (Aujourd&apos;hui)" right={<span className="text-[11px] text-slate-500">{dashboard.nb_sites} sites actifs</span>} />
          <div className="space-y-3">
            {boutiqueEntries.map(([name, value]) => (
              <div key={name}>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{name}</span>
                  <span className="font-bold">{formatFCFA(value)} ({Math.round((value / max) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            ))}
            {boutiqueEntries.length === 0 ? <p className="text-xs text-slate-400">Aucune vente aujourd&apos;hui</p> : null}
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4">
          <CardHeader title="Activités Récentes" />
          <div className="space-y-3 text-xs">
            {dashboard.activites_recentes.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded h-fit">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{activity.article} ({activity.delta > 0 ? "+" : ""}{activity.delta})</p>
                  <span className="text-[11px] text-slate-400">{activity.reason} · {activity.ref ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-3">
        <CardHeader title="Alertes Stock & Péremption" />
        {alerts.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune alerte active.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="p-2.5 bg-amber-50 border border-amber-100 rounded-md flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium text-amber-900">{alert.article_name}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">({alert.site_name})</span>
                </span>
                <span className="text-amber-800 font-bold text-[11px]">{alert.message}</span>
                <Badge tone={alert.kind === "DLC" ? "amber" : "red"}>{alert.kind}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}