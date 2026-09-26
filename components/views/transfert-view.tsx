"use client";

import { useState } from "react";
import { Plus, Send, Trash2, Truck } from "lucide-react";

import { cancelTransfer, createTransfer } from "@/app/actions/transfers";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Site, StockItem, TransferNote } from "@/lib/types";

interface TransferLine {
  article_id: number;
  qty_sent: number;
}

const STATUS_LABEL: Record<TransferNote["status"], { label: string; tone: "amber" | "green" | "red" | "slate" }> = {
  OPEN: { label: "En transit", tone: "amber" },
  RECEIVED: { label: "Conforme", tone: "green" },
  DISCREPANCY: { label: "Avec écart", tone: "red" },
  CANCELLED: { label: "Annulé", tone: "slate" },
};

export default function TransfertView({
  depotStock,
  sites,
  notes,
  fromSiteId,
}: {
  depotStock: StockItem[];
  sites: Site[];
  notes: TransferNote[];
  fromSiteId: number;
}) {
  const boutiques = sites.filter((site) => site.kind === "BOUTIQUE" && site.is_active);
  const [destination, setDestination] = useState<number>(boutiques[0]?.id ?? 0);
  const [lines, setLines] = useState<TransferLine[]>([{ article_id: depotStock[0]?.article_id ?? 0, qty_sent: 10 }]);
  const { run, pending, error, success } = useMutate();
  const { run: runCancel, pending: cancelPending } = useMutate();

  const cancel = (noteId: number) => {
    runCancel(() =>
      cancelTransfer(noteId).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })),
    );
  };

  const addLine = () => {
    setLines([...lines, { article_id: depotStock[0]?.article_id ?? 0, qty_sent: 10 }]);
  };

  const updateLine = (index: number, field: keyof TransferLine, value: number) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== index));
  };

  const availableOf = (articleId: number) =>
    depotStock.find((item) => item.article_id === articleId)?.qty ?? 0;

  const submit = () => {
    run(() =>
      createTransfer({ to_site_id: destination, lines }, fromSiteId).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Dispatching & Envoi de Transfert"
        subtitle="Expédiez matières premières et marchandises vers les boutiques"
        badge={
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Magasin Principal
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-8 p-5 space-y-5">
          <CardHeader title="Nouveau Bon de Transfert (BT)" />

          <div className="space-y-4">
            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-700 mb-1">Boutique destinataire</label>
              <select
                value={destination}
                onChange={(e) => setDestination(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              >
                {boutiques.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-700">Articles & quantités à expédier</p>
                <Button variant="ghost" onClick={addLine}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                </Button>
              </div>

              <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
                {lines.map((line, index) => {
                  const available = availableOf(line.article_id);
                  const overStock = line.qty_sent > available;
                  return (
                    <div key={index} className="p-3 bg-slate-50/50 flex items-center gap-3">
                      <select
                        value={line.article_id}
                        onChange={(e) => updateLine(index, "article_id", Number(e.target.value))}
                        className="flex-1 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none"
                      >
                        {depotStock.map((item) => (
                          <option key={item.article_id} value={item.article_id}>
                            [{item.category}] {item.article_name}
                          </option>
                        ))}
                      </select>
                      <div className="w-36 flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={line.qty_sent}
                          onChange={(e) => updateLine(index, "qty_sent", Number(e.target.value))}
                          className={`w-full text-xs bg-white border rounded px-2.5 py-1.5 font-semibold text-right focus:outline-none ${
                            overStock ? "border-red-500 text-red-600" : "border-slate-200 text-slate-900"
                          }`}
                        />
                        <span className="text-xs text-slate-500 w-12">{depotStock.find((s) => s.article_id === line.article_id)?.unit}</span>
                      </div>
                      <button onClick={() => removeLine(index)} disabled={lines.length === 1} className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {error ? <ErrorBanner message={error} /> : null}
            {success ? <SuccessBanner message={success} /> : null}

            <Button type="button" onClick={submit} disabled={pending || !destination} className="w-full">
              <Send className="w-3.5 h-3.5" /> {pending ? "Expédition..." : "Valider & Expédier le Transfert"}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock Dépôt Disponible</p>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {depotStock.map((item) => (
              <div key={item.article_id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800">{item.article_name}</p>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
                <span className="font-bold text-slate-900">{item.qty} {item.unit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bons de transfert</p>
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun bon de transfert.</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => {
              const status = STATUS_LABEL[note.status];
              return (
                <div key={note.id} className="flex items-center justify-between text-xs p-3 border border-slate-100 rounded-md bg-slate-50/50">
                  <div>
                    <p className="font-bold text-slate-800">{note.ref}</p>
                    <span className="text-[11px] text-slate-500">{note.lines.length} article(s) · {new Date(note.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    {note.status === "OPEN" ? (
                      <button
                        onClick={() => cancel(note.id)}
                        disabled={cancelPending}
                        className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                      >
                        Annuler
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageShell>
  );
}