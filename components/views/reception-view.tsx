"use client";

import { useState } from "react";
import { CheckCircle2, PackageCheck, RotateCcw, Truck } from "lucide-react";

import { receiveTransfer, returnTransfer } from "@/app/actions/transfers";
import { Badge, Button, Card, ErrorBanner, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { EcartReason, TransferNote } from "@/lib/types";

const STATUS_LABEL: Record<TransferNote["status"], { label: string; tone: "amber" | "green" | "red" | "slate" }> = {
  OPEN: { label: "En transit", tone: "amber" },
  RECEIVED: { label: "Conforme", tone: "green" },
  DISCREPANCY: { label: "Avec écart", tone: "red" },
  CANCELLED: { label: "Annulé", tone: "slate" },
};

const REASONS: EcartReason[] = ["CASSE", "MANQUANT", "ERREUR_SAISIE", "AUTRE"];

export default function ReceptionView({ notes }: { notes: TransferNote[] }) {
  const [selectedId, setSelectedId] = useState<number>(notes[0]?.id ?? 0);
  const [received, setReceived] = useState<Record<number, number>>(() =>
    Object.fromEntries((notes[0]?.lines ?? []).map((line) => [line.id, line.qty_sent])),
  );
  const [reasons, setReasons] = useState<Record<number, EcartReason>>({});
  const [notesText, setNotesText] = useState<Record<number, string>>({});
  const [returning, setReturning] = useState(false);
  const [returnQtys, setReturnQtys] = useState<Record<number, number>>({});
  const [returnReason, setReturnReason] = useState<EcartReason>("AUTRE");
  const { run, pending, error, success } = useMutate();
  const { run: runReturn, pending: returnPending, error: returnError } = useMutate();

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const selectNote = (note: TransferNote) => {
    setSelectedId(note.id);
    setReceived(Object.fromEntries(note.lines.map((line) => [line.id, line.qty_sent])));
    setReasons({});
    setNotesText({});
    setReturning(false);
    setReturnQtys(Object.fromEntries(note.lines.map((line) => [line.id, line.qty_received ?? 0])));
  };

  const submit = () => {
    if (!selected) return;
    const lines = selected.lines.map((line) => {
      const diff = (received[line.id] ?? 0) - line.qty_sent;
      return {
        article_id: line.article_id,
        received_qty: received[line.id] ?? 0,
        ...(diff !== 0
          ? { ecart_reason: reasons[line.id], ecart_note: notesText[line.id] || undefined }
          : {}),
      };
    });
    if (lines.some((l) => "ecart_reason" in l && !l.ecart_reason)) {
      return;
    }
    run(() =>
      receiveTransfer(selected.id, { lines }).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  const doReturn = () => {
    if (!selected) return;
    const lines = selected.lines
      .filter((line) => (returnQtys[line.id] ?? 0) > 0)
      .map((line) => ({ article_id: line.article_id, qty_to_return: returnQtys[line.id] ?? 0 }));
    if (lines.length === 0) return;
    runReturn(() =>
      returnTransfer(selected.id, { lines, reason: returnReason }).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Réception des Transferts</h2>
          <p className="text-xs text-slate-500">
            Contrôlez les marchandises reçues, déclarez les écarts (avec motif) et renvoyez au dépôt si besoin
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Envois en cours
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-4 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bons de transfert (BT)</p>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun bon de transfert.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => {
                const status = STATUS_LABEL[note.status];
                const active = selectedId === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`w-full text-left p-3 rounded-md border text-xs transition-all space-y-1.5 ${
                      active ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{note.ref}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div className={`text-[11px] flex justify-between ${active ? "text-slate-300" : "text-slate-500"}`}>
                      <span>{new Date(note.created_at).toLocaleString("fr-FR")}</span>
                      <span>{note.lines.length} article(s)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-8 p-5 space-y-5">
          {selected === null ? (
            <p className="text-xs text-slate-400 text-center py-10">Aucun bon sélectionné.</p>
          ) : (
            <>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contrôle de réception</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selected.ref}</p>
                </div>
                <Badge tone={STATUS_LABEL[selected.status].tone}>{STATUS_LABEL[selected.status].label}</Badge>
              </div>

              {(selected.status === "OPEN") ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-2">Article</th>
                          <th className="pb-2 text-center">Envoyé</th>
                          <th className="pb-2 text-center">Reçu</th>
                          <th className="pb-2">Écart (motif)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selected.lines.map((line) => {
                          const qty = received[line.id] ?? 0;
                          const diff = qty - line.qty_sent;
                          const isEcart = diff !== 0;
                          return (
                            <tr key={line.id}>
                              <td className="py-2.5 font-medium text-slate-800">{line.article_name}</td>
                              <td className="py-2.5 text-center font-semibold text-slate-700">{line.qty_sent}</td>
                              <td className="py-2.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => setReceived({ ...received, [line.id]: Number(e.target.value) })}
                                  className="w-20 text-center text-xs bg-slate-50 border border-slate-200 rounded py-1 font-semibold"
                                />
                              </td>
                              <td className="py-2.5">
                                {isEcart ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={reasons[line.id] ?? ""}
                                      onChange={(e) => setReasons({ ...reasons, [line.id]: e.target.value as EcartReason })}
                                      className="text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2"
                                    >
                                      <option value="">Motif...</option>
                                      {REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Note (optionnel)"
                                      value={notesText[line.id] ?? ""}
                                      onChange={(e) => setNotesText({ ...notesText, [line.id]: e.target.value })}
                                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2"
                                    />
                                    {!reasons[line.id] ? (
                                      <span className="text-[10px] text-red-600">obligatoire</span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {error ? <ErrorBanner message={error} /> : null}
                  {success ? <SuccessBanner message={success} /> : null}
                  <Button onClick={submit} disabled={pending} className="w-full">
                    <PackageCheck className="w-4 h-4" /> {pending ? "Validation..." : "Valider la réception & intégrer au stock"}
                  </Button>
                </>
              ) : selected.status === "CANCELLED" ? (
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-slate-600 text-xs">
                  Bon de transfert annulé.
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-slate-600 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transfert clôturé
                    </span>
                    <span className="text-[11px] text-slate-400">Stock mis à jour</span>
                  </div>

                  {!returning ? (
                    <Button variant="secondary" onClick={() => setReturning(true)}>
                      <RotateCcw className="w-3.5 h-3.5" /> Retour au dépôt
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-700">Quantités à retourner au dépôt</p>
                      {selected.lines.map((line) => {
                        const maxQty = line.qty_received ?? 0;
                        return (
                          <div key={line.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-slate-800 flex-1">{line.article_name} (reçu {maxQty})</span>
                            <input
                              type="number"
                              min={0}
                              max={maxQty}
                              value={returnQtys[line.id] ?? 0}
                              onChange={(e) => setReturnQtys({ ...returnQtys, [line.id]: Number(e.target.value) })}
                              className="w-20 text-xs bg-slate-50 border border-slate-200 rounded py-1 text-right font-semibold"
                            />
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-2">
                        <select
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value as EcartReason)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2"
                        >
                          {REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button onClick={doReturn} disabled={returnPending}>
                          <RotateCcw className="w-3.5 h-3.5" /> {returnPending ? "Retour..." : "Créer le retour"}
                        </Button>
                        <Button variant="ghost" onClick={() => setReturning(false)}>Annuler</Button>
                      </div>
                      {returnError ? <ErrorBanner message={returnError} /> : null}
                      {selected.lines.every((l) => (returnQtys[l.id] ?? 0) === 0) ? (
                        <p className="text-[11px] text-slate-400">Saisissez une quantité &gt; 0 pour au moins une ligne.</p>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </PageShell>
  );
}