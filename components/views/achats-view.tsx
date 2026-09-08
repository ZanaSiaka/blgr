"use client";

import { useState } from "react";
import { Package, Plus, Trash2, Wallet } from "lucide-react";

import { createPurchaseOrder, receivePurchaseOrder } from "@/app/actions/purchases";
import { Badge, Button, Card, CardHeader, ErrorBanner, formatFCFA, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Article, PurchaseOrder, Supplier, Treasury } from "@/lib/types";

interface CreateLine {
  article_id: number;
  ordered_qty: number;
  unit_price: number;
}

const STATUS_LABEL: Record<PurchaseOrder["status"], { label: string; tone: "amber" | "green" | "red" }> = {
  EN_ATTENTE: { label: "À régler & réceptionner", tone: "amber" },
  LIVRE: { label: "Payé & livré", tone: "green" },
  ECART: { label: "Écart de livraison", tone: "red" },
};

export default function AchatsView({
  suppliers,
  articles,
  orders,
  treasury,
  siteId,
}: {
  suppliers: Supplier[];
  articles: Article[];
  orders: PurchaseOrder[];
  treasury: Treasury;
  siteId: number;
}) {
  const [supplierId, setSupplierId] = useState<number>(suppliers[0]?.id ?? 0);
  const [lines, setLines] = useState<CreateLine[]>([
    { article_id: articles[0]?.id ?? 0, ordered_qty: 10, unit_price: articles[0]?.cost_price ?? 0 },
  ]);
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const { run: runCreate, pending: createPending, error: createError, success: createSuccess } = useMutate();
  const { run: runReceive, pending: receivePending } = useMutate();

  const selectedOrder = orders.find((po) => po.id === selectedPoId) ?? null;

  const addLine = () => {
    const first = articles[0];
    setLines([...lines, { article_id: first?.id ?? 0, ordered_qty: 10, unit_price: first?.cost_price ?? 0 }]);
  };

  const updateLine = (index: number, field: keyof CreateLine, value: number) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  const selectArticle = (index: number, articleId: number) => {
    const article = articles.find((a) => a.id === articleId);
    setLines(
      lines.map((line, i) =>
        i === index ? { ...line, article_id: articleId, unit_price: article?.cost_price ?? 0 } : line,
      ),
    );
  };

  const createPo = () => {
    runCreate(() =>
      createPurchaseOrder({ supplier_id: supplierId, lines }, siteId).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  const receivePo = (poId: number, receiveLines: { article_id: number; received_qty: number; expiry_date?: string; lot_number?: string }[]) => {
    runReceive(() =>
      receivePurchaseOrder(poId, { lines: receiveLines }).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  const totalOrdered = lines.reduce((acc, line) => acc + line.ordered_qty * line.unit_price, 0);

  return (
    <PageShell>
      <PageHeader
        title="Commandes & Décaissements Fournisseurs"
        subtitle="Contrôlez les colis reçus au Dépôt Central et validez le règlement"
        badge={
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">Trésorerie Dépôt</span>
              <strong>{formatFCFA(treasury.balance)}</strong>
            </div>
          </div>
        }
      />

      <Card className="p-5 space-y-4">
        <CardHeader title="Nouveau Bon de Commande (BC)" />
        <div className="space-y-4">
          <div className="max-w-md">
            <label className="block text-xs font-medium text-slate-700 mb-1">Fournisseur</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-700">Articles commandés</p>
              <Button variant="ghost" onClick={addLine}>
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </Button>
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
              {lines.map((line, index) => (
                <div key={index} className="p-3 bg-slate-50/50 flex items-center gap-3">
                  <select
                    value={line.article_id}
                    onChange={(e) => selectArticle(index, Number(e.target.value))}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    {articles.map((article) => (
                      <option key={article.id} value={article.id}>{article.name} ({article.unit.code})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={line.ordered_qty}
                    onChange={(e) => updateLine(index, "ordered_qty", Number(e.target.value))}
                    className="w-20 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-right font-semibold"
                  />
                  <input
                    type="number"
                    min={0}
                    value={line.unit_price}
                    onChange={(e) => updateLine(index, "unit_price", Number(e.target.value))}
                    className="w-28 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-right font-semibold"
                  />
                  <span className="text-xs text-slate-500 w-14 text-right">{formatFCFA(line.ordered_qty * line.unit_price)}</span>
                  <button
                    onClick={() => (lines.length > 1 ? setLines(lines.filter((_, i) => i !== index)) : null)}
                    disabled={lines.length === 1}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-right text-xs text-slate-600">Total : <strong className="text-slate-900">{formatFCFA(totalOrdered)}</strong></p>
          </div>

          {createError ? <ErrorBanner message={createError} /> : null}
          {createSuccess ? <SuccessBanner message={createSuccess} /> : null}
          <Button onClick={createPo} disabled={createPending || !supplierId}>
            <Package className="w-3.5 h-3.5" /> {createPending ? "Création..." : "Créer le Bon de Commande"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bons de commande</p>
          <div className="space-y-2">
            {orders.map((po) => {
              const status = STATUS_LABEL[po.status];
              const active = selectedPoId === po.id;
              return (
                <button
                  key={po.id}
                  onClick={() => setSelectedPoId(po.id)}
                  className={`w-full text-left p-3 rounded-md border text-xs transition-all space-y-1.5 ${
                    active ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{po.ref}</span>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <div className={`text-[11px] flex justify-between ${active ? "text-slate-300" : "text-slate-500"}`}>
                    <span>{po.supplier}</span>
                    <span className="font-bold">{formatFCFA(po.status === "EN_ATTENTE" ? po.amount_ordered : po.amount_received)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-7 p-5 space-y-4">
          {selectedOrder === null ? (
            <p className="text-xs text-slate-400 text-center py-10">Sélectionnez un bon de commande pour réceptionner.</p>
          ) : (
            <>
              <CardHeader
                title="Détail du colis & règlement"
                subtitle={`${selectedOrder.ref} — ${selectedOrder.order_date} · ${selectedOrder.supplier}`}
              />

              {selectedOrder.status === "EN_ATTENTE" ? (
                <ReceiveForm
                  order={selectedOrder}
                  articles={articles}
                  onSubmit={receivePo}
                  pending={receivePending}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <span className="font-medium text-emerald-700">Payé & entré au stock central</span>
                    <span className="font-bold text-emerald-700">{formatFCFA(selectedOrder.amount_received)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-2">Article</th>
                          <th className="pb-2 text-center">Commandé</th>
                          <th className="pb-2 text-center">Reçu</th>
                          <th className="pb-2 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="py-2.5 font-medium text-slate-800">{line.article_name}</td>
                            <td className="py-2.5 text-center">{line.ordered_qty}</td>
                            <td className="py-2.5 text-center font-bold">{line.received_qty}</td>
                            <td className="py-2.5 text-right">
                              {line.received_qty === line.ordered_qty ? (
                                <Badge tone="green">Conforme</Badge>
                              ) : (
                                <Badge tone="red">Écart</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function ReceiveForm({
  order,
  articles,
  onSubmit,
  pending,
}: {
  order: PurchaseOrder;
  articles: Article[];
  onSubmit: (poId: number, lines: { article_id: number; received_qty: number; expiry_date?: string }[]) => void;
  pending: boolean;
}) {
  const [received, setReceived] = useState<Record<number, number>>(
    Object.fromEntries(order.lines.map((line) => [line.article_id, line.ordered_qty])),
  );
  const [expiry, setExpiry] = useState<Record<number, string>>({});

  const totalReceived = order.lines.reduce((acc, line) => acc + (received[line.article_id] ?? 0) * line.unit_price, 0);
  const isPerishable = (articleId: number) => articles.find((a) => a.id === articleId)?.perishable ?? false;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="pb-2">Article</th>
              <th className="pb-2 text-center">Commandé</th>
              <th className="pb-2 text-center">Reçu</th>
              <th className="pb-2">DLC (si périssable)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="py-2.5 font-medium text-slate-800">{line.article_name}</td>
                <td className="py-2.5 text-center font-semibold">{line.ordered_qty}</td>
                <td className="py-2.5 text-center">
                  <input
                    type="number"
                    min={0}
                    value={received[line.article_id] ?? 0}
                    onChange={(e) => setReceived({ ...received, [line.article_id]: Number(e.target.value) })}
                    className="w-20 text-center text-xs bg-slate-50 border border-slate-200 rounded py-1 font-semibold"
                  />
                </td>
                <td className="py-2.5">
                  {isPerishable(line.article_id) ? (
                    <input
                      type="date"
                      value={expiry[line.article_id] ?? ""}
                      onChange={(e) => setExpiry({ ...expiry, [line.article_id]: e.target.value })}
                      className="text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2"
                    />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-600">Montant réellement réçu : <strong className="text-slate-900">{formatFCFA(totalReceived)}</strong></span>
        <Button
          onClick={() =>
            onSubmit(
              order.id,
              order.lines.map((line) => ({
                article_id: line.article_id,
                received_qty: received[line.article_id] ?? 0,
                ...(isPerishable(line.article_id) && expiry[line.article_id] ? { expiry_date: expiry[line.article_id] } : {}),
              })),
            )
          }
          disabled={pending}
        >
          <Package className="w-3.5 h-3.5" /> {pending ? "Réception..." : `Réceptionner & Déduire ${formatFCFA(totalReceived)}`}
        </Button>
      </div>
    </div>
  );
}