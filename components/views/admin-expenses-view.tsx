"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, CardHeader, formatFCFA, PageHeader, PageShell, StatCard } from "@/components/ui";
import type { Expense, ExpenseReportRow } from "@/lib/types";

export default function AdminExpensesView({
  from,
  to,
  rows,
  expenses,
}: {
  from: string;
  to: string;
  rows: ExpenseReportRow[];
  expenses: Expense[];
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  const bySite = useMemo(() => {
    const map = new Map<string, { siteId: number; siteName: string; rows: ExpenseReportRow[] }>();
    for (const row of rows) {
      const key = row.site_name;
      const entry = map.get(key) ?? { siteId: row.site_id, siteName: row.site_name, rows: [] };
      entry.rows.push(row);
      map.set(key, entry);
    }
    return Array.from(map.values());
  }, [rows]);

  const apply = () => router.push(`/depenses?from=${fromDate}&to=${toDate}`);

  return (
    <PageShell>
      <PageHeader title="Dépenses — Toutes boutiques" subtitle="Suivi des dépenses par magasin et par jour" />

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total des dépenses" value={formatFCFA(total)} />
        <StatCard label="Enregistrements" value={`${expenses.length} dépenses`} />
        <StatCard label="Boutiques concernées" value={`${bySite.length} magasins`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {bySite.map((site) => {
          const siteTotal = site.rows.reduce((acc, row) => acc + row.total, 0);
          return (
            <Card key={site.siteId} className="p-4 space-y-2">
              <CardHeader title={site.siteName} right={<span className="text-xs font-bold text-slate-900">{formatFCFA(siteTotal)}</span>} />
              <div className="space-y-1.5">
                {site.rows.map((row, index) => (
                  <div key={index} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="font-medium text-slate-800">{new Date(row.date).toLocaleDateString("fr-FR")}</span>
                    <span className="font-bold text-slate-900">{formatFCFA(row.total)} <span className="text-[10px] text-slate-400 font-normal">({row.count})</span></span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 space-y-2">
        <CardHeader title="Détail des dépenses" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-2">Date</th>
                <th className="pb-2">Boutique</th>
                <th className="pb-2">Catégorie</th>
                <th className="pb-2">Libellé</th>
                <th className="pb-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="py-2.5">{expense.expense_date}</td>
                  <td className="py-2.5 font-medium text-slate-800">{expense.site_name}</td>
                  <td className="py-2.5">{expense.category_name}</td>
                  <td className="py-2.5 text-slate-600">{expense.label}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">{formatFCFA(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}