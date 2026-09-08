"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Package, Search, Wrench } from "lucide-react";

import { adjustStock } from "@/app/actions/stock";
import { Badge, Button, Card, ErrorBanner, formatFCFA, PageHeader, PageShell, StatCard, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { AdjustmentReason, Alert, Movement, StockItem } from "@/lib/types";

const REASONS: { value: AdjustmentReason; label: string; sign: 1 | -1 }[] = [
  { value: "INVENTORY", label: "Inventaire (+)", sign: 1 },
  { value: "LOSS", label: "Perte (−)", sign: -1 },
  { value: "DAMAGE", label: "Casse (−)", sign: -1 },
  { value: "EXPIRED", label: "Périmé (−)", sign: -1 },
  { value: "PROMOTION", label: "Promotion (−)", sign: -1 },
];

export default function StockBoutiqueView({
  items,
  movements,
  alerts,
  siteName,
  siteId,
}: {
  items: StockItem[];
  movements: Movement[];
  alerts: Alert[];
  siteName: string;
  siteId: number;
}) {
  const [search, setSearch] = useState("");
  const [articleId, setArticleId] = useState<number>(items[0]?.article_id ?? 0);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<AdjustmentReason>("LOSS");
  const { run, pending, error, success } = useMutate();

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.article_name.toLowerCase().includes(search.toLowerCase()) ||
          item.article_code.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  const totalValue = items.reduce((acc, item) => acc + item.cost_value, 0);
  const critical = items.filter((item) => item.qty <= item.min_stock).length;

  const reasonMeta = REASONS.find((r) => r.value === reason) ?? REASONS[0];

  const submitAdjustment = () => {
    run(() =>
      adjustStock({ article_id: articleId, qty: qty * reasonMeta.sign, reason }, siteId).then(
        (result) => ({ ok: result.ok, error: result.ok ? undefined : result.error }),
      ),
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Stock Boutique"
        subtitle="Suivi des matières premières et produits finis du site"
        badge={<Badge tone="slate">{siteName}</Badge>}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-4 p-4 space-y-3 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Ajustement / Invendus / Pertes
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Article</label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            >
              {items.map((item) => (
                <option key={item.article_id} value={item.article_id}>{item.article_name} ({item.qty} {item.unit})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Quantité</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-semibold text-right"
              />
            </div>
          </div>
          {error ? <ErrorBanner message={error} /> : null}
          {success ? <SuccessBanner message={success} /> : null}
          <Button onClick={submitAdjustment} disabled={pending || !articleId} className="w-full">
            <Package className="w-3.5 h-3.5" /> {pending ? "Application..." : "Appliquer l'ajustement"}
          </Button>
        </Card>

        <div className="lg:col-span-8 space-y-5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
            />
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Article</th>
                  <th className="p-3">Catégorie</th>
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
                      <td className="p-3 text-center font-bold text-slate-900">{item.qty} {item.unit}</td>
                      <td className="p-3 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" /> Seuil atteint
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

          <Card className="p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mouvements récents</p>
            {movements.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun mouvement.</p>
            ) : (
              <div className="space-y-1.5">
                {movements.slice(0, 8).map((m) => (
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

          {alerts.length > 0 ? (
            <Card className="p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alertes</p>
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2.5 bg-amber-50 border border-amber-100 rounded-md">
                  <span className="font-medium text-amber-900">{alert.article_name}</span>
                  <span className="text-amber-800 font-bold">{alert.message}</span>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}