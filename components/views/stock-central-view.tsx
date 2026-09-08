"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";

import { Badge, Card, formatFCFA, PageHeader, PageShell, StatCard } from "@/components/ui";
import type { Alert, Lot, Movement, StockItem } from "@/lib/types";

export default function StockCentralView({
  items,
  movements,
  lots,
  alerts,
  siteLabel,
}: {
  items: StockItem[];
  movements: Movement[];
  lots: Lot[];
  alerts: Alert[];
  siteLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TOUS");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matches =
        item.article_name.toLowerCase().includes(search.toLowerCase()) ||
        item.article_code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "TOUS" || item.category === category;
      return matches && matchesCategory;
    });
  }, [items, search, category]);

  const totalValue = items.reduce((acc, item) => acc + item.cost_value, 0);
  const critical = items.filter((item) => item.qty <= item.min_stock).length;
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <PageShell>
      <PageHeader
        title="Gestion du Stock Central"
        subtitle="Inventaire du magasin principal, valorisation et suivi des seuils"
        badge={<Badge tone="slate">{siteLabel}</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Valeur du Stock" value={formatFCFA(totalValue)} />
        <StatCard label="Références" value={`${items.length} Articles`} />
        <StatCard
          label="Alertes Réapprovisionnement"
          value={`${critical} Critique(s)`}
          sub={critical > 0 ? <span className="text-red-600 font-bold">Seuils atteints</span> : <span className="text-emerald-600 font-bold">Optimal</span>}
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["TOUS", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${
                category === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Article</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3 text-right">Valeur Stock</th>
              <th className="p-3 text-center">Quantité</th>
              <th className="p-3 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const isCritical = item.qty <= item.min_stock;
              return (
                <tr key={item.article_id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-500">{item.article_code}</td>
                  <td className="p-3 font-semibold text-slate-900">{item.article_name}</td>
                  <td className="p-3 text-slate-600">{item.category}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatFCFA(item.cost_value)}</td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {item.qty} {item.unit}
                  </td>
                  <td className="p-3 text-center">
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> Seuil atteint ({item.min_stock})
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800">Optimal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lots & DLC</p>
          {lots.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun lot enregistré.</p>
          ) : (
            <div className="space-y-1.5">
              {lots.map((lot) => (
                <div key={lot.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{lot.article_name}</p>
                    <span className="text-[10px] text-slate-400">Lot {lot.lot_number ?? "—"} · Reçu {lot.initial_qty}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{lot.remaining_qty} restant(s)</p>
                    {lot.expiry_date ? <p className="text-[10px] text-amber-600">Expire le {lot.expiry_date}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mouvements récents</p>
          {movements.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun mouvement.</p>
          ) : (
            <div className="space-y-1.5">
              {movements.slice(0, 12).map((m) => (
                <div key={m.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{m.article_name}</p>
                    <span className="text-[10px] text-slate-400">{m.reason} · {m.ref_doc ?? "—"}</span>
                  </div>
                  <span className={`font-bold ${m.qty_delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.qty_delta > 0 ? "+" : ""}{m.qty_delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {alerts.length > 0 ? (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alertes</p>
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