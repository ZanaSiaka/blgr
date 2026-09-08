"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, CardHeader, formatFCFA, PageHeader, PageShell } from "@/components/ui";
import type { Alert, ExpenseReportRow, MarginRow, SalesReportRow, TopProductRow } from "@/lib/types";

export default function ReportsView({
  from,
  to,
  sales,
  top,
  margins,
  alerts,
  expenses,
}: {
  from: string;
  to: string;
  sales: SalesReportRow[];
  top: TopProductRow[];
  margins: MarginRow[];
  alerts: Alert[];
  expenses: ExpenseReportRow[];
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  const apply = () => {
    router.push(`/rapports?from=${fromDate}&to=${toDate}`);
  };

  const totalSales = sales.reduce((acc, row) => acc + row.total, 0);
  const totalMargin = margins.reduce((acc, row) => acc + row.margin, 0);
  const totalExpenses = expenses.reduce((acc, row) => acc + row.total, 0);
  const net = totalSales - totalExpenses;

  return (
    <PageShell>
      <PageHeader title="Rapports & Statistiques" subtitle="Ventes, meilleures ventes et marges par période" />

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Du</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Au</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <button onClick={apply} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-medium">
          Appliquer
        </button>
        <div className="ml-auto flex gap-4 text-xs">
          <span className="text-slate-500">Total ventes : <strong className="text-slate-900">{formatFCFA(totalSales)}</strong></span>
          <span className="text-slate-500">Marge : <strong className={totalMargin >= 0 ? "text-emerald-600" : "text-red-600"}>{formatFCFA(totalMargin)}</strong></span>
          <span className="text-slate-500">Dépenses : <strong className="text-red-600">{formatFCFA(totalExpenses)}</strong></span>
          <span className="text-slate-500">Net : <strong className={net >= 0 ? "text-emerald-600" : "text-red-600"}>{formatFCFA(net)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-4 space-y-2">
          <CardHeader title="Ventes par jour" />
          {sales.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune vente sur la période.</p>
          ) : (
            <div className="space-y-1.5">
              {sales.map((row, index) => (
                <div key={index} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="font-medium text-slate-800">{row.date}</span>
                  <span className="font-bold text-slate-900">{formatFCFA(row.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <CardHeader title="Meilleures ventes" />
          {top.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune donnée sur la période.</p>
          ) : (
            <div className="space-y-1.5">
              {top.map((row, index) => (
                <div key={index} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{row.name}</p>
                    <span className="text-[10px] text-slate-400">{row.qty} vendus</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatFCFA(row.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 space-y-2">
        <CardHeader title="Marges par produit" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-2">Produit</th>
                <th className="pb-2 text-center">Quantité</th>
                <th className="pb-2 text-right">Ventes</th>
                <th className="pb-2 text-right">Coût</th>
                <th className="pb-2 text-right">Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {margins.map((row) => (
                <tr key={row.article_id}>
                  <td className="py-2.5 font-medium text-slate-800">{row.name}</td>
                  <td className="py-2.5 text-center">{row.qty}</td>
                  <td className="py-2.5 text-right">{formatFCFA(row.revenue)}</td>
                  <td className="py-2.5 text-right">{formatFCFA(row.cost)}</td>
                  <td className={`py-2.5 text-right font-bold ${row.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <CardHeader title="Dépenses par jour" />
        {expenses.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune dépense sur la période.</p>
        ) : (
          <div className="space-y-1.5">
            {expenses.map((row, index) => (
              <div key={index} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-800">
                  {new Date(row.date).toLocaleDateString("fr-FR")} · {row.site_name}
                </span>
                <span className="font-bold text-red-600">{formatFCFA(row.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {alerts.length > 0 ? (
        <Card className="p-4 space-y-2">
          <CardHeader title="Alertes" />
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2.5 bg-amber-50 border border-amber-100 rounded-md">
              <span className="font-medium text-amber-900">{alert.article_name} ({alert.site_name})</span>
              <span className="text-amber-800 font-bold">{alert.message}</span>
            </div>
          ))}
        </Card>
      ) : null}
    </PageShell>
  );
}