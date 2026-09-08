"use client";

import { useState } from "react";
import { Banknote, Lock, Unlock } from "lucide-react";

import { closeClosure, openClosure } from "@/app/actions/pos";
import { Badge, Button, Card, CardHeader, ErrorBanner, formatFCFA, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Closure, SaleTicket } from "@/lib/types";

export default function ClosuresView({
  closures,
  sales,
  siteId,
  siteName,
}: {
  closures: Closure[];
  sales: SaleTicket[];
  siteId: number;
  siteName: string;
}) {
  const [countedCash, setCountedCash] = useState(0);
  const [countedMobile, setCountedMobile] = useState(0);
  const [countedCard, setCountedCard] = useState(0);
  const { run: runOpen, pending: openPending, error: openError, success: openSuccess } = useMutate();
  const { run: runClose, pending: closePending, error: closeError, success: closeSuccess } = useMutate();

  const activeClosure = closures.find((closure) => closure.status === "OPEN") ?? null;

  const open = () => {
    runOpen(() => openClosure({ site_id: siteId }).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })));
  };

  const close = () => {
    if (!activeClosure) return;
    runClose(() =>
      closeClosure(activeClosure.id, {
        counted_cash: countedCash,
        counted_mobile: countedMobile,
        counted_card: countedCard,
      }).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })),
    );
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Clôture de Caisse</h2>
          <p className="text-xs text-slate-500">{siteName} · rapprochement des encaissements par moyen de paiement</p>
        </div>
        <Badge tone={activeClosure ? "amber" : "slate"}>{activeClosure ? "Caisse ouverte" : "Caisse fermée"}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5 p-5 space-y-4 h-fit">
          <CardHeader title={activeClosure ? "Clôturer la session" : "Ouvrir la caisse"} />

          {activeClosure ? (
            <>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Ouverture : <strong className="text-slate-900">{new Date(activeClosure.opened_at).toLocaleString("fr-FR")}</strong></p>
                <p>Attendu espèces : <strong className="text-slate-900">{formatFCFA(activeClosure.expected_cash)}</strong></p>
                <p>Attendu mobile money : <strong className="text-slate-900">{formatFCFA(activeClosure.expected_mobile)}</strong></p>
                <p>Attendu carte : <strong className="text-slate-900">{formatFCFA(activeClosure.expected_card)}</strong></p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Compté espèces", value: countedCash, setter: setCountedCash },
                  { label: "Compté mobile money", value: countedMobile, setter: setCountedMobile },
                  { label: "Compté carte", value: countedCard, setter: setCountedCard },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{field.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.setter(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-semibold text-right"
                    />
                  </div>
                ))}
              </div>
              {closeError ? <ErrorBanner message={closeError} /> : null}
              {closeSuccess ? <SuccessBanner message={closeSuccess} /> : null}
              <Button onClick={close} disabled={closePending} className="w-full">
                <Lock className="w-3.5 h-3.5" /> {closePending ? "Clôture..." : "Clôturer la caisse"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">Ouvrez la caisse pour enregistrer les ventes et calculer le rapprochement.</p>
              {openError ? <ErrorBanner message={openError} /> : null}
              {openSuccess ? <SuccessBanner message={openSuccess} /> : null}
              <Button onClick={open} disabled={openPending} className="w-full">
                <Unlock className="w-3.5 h-3.5" /> {openPending ? "Ouverture..." : "Ouvrir la caisse"}
              </Button>
            </>
          )}
        </Card>

        <div className="lg:col-span-7 space-y-5">
          <Card className="p-4 space-y-2">
            <CardHeader title="Historique des clôtures" />
            {closures.length === 0 ? (
              <p className="text-xs text-slate-400">Aucune clôture.</p>
            ) : (
              <div className="space-y-2">
                {closures.map((closure) => (
                  <div key={closure.id} className="flex items-center justify-between text-xs p-3 border border-slate-100 rounded-md bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-800">
                        {closure.status === "OPEN" ? "Session en cours" : new Date(closure.closed_at ?? closure.opened_at).toLocaleString("fr-FR")}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Attendu : {formatFCFA(closure.expected_cash + closure.expected_mobile + closure.expected_card)}
                      </span>
                    </div>
                    <div className="text-right">
                      {closure.status === "OPEN" ? (
                        <Badge tone="amber">Ouverte</Badge>
                      ) : (
                        <>
                          <p className={`font-bold ${closure.over_short >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            Écart : {closure.over_short >= 0 ? "+" : ""}{formatFCFA(closure.over_short)}
                          </p>
                          <Badge tone="green">Clôturée</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-2">
            <CardHeader title="Ventes récentes" />
            {sales.length === 0 ? (
              <p className="text-xs text-slate-400">Aucune vente.</p>
            ) : (
              <div className="space-y-1.5">
                {sales.slice(0, 15).map((ticket) => (
                  <div key={ticket.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                    <div>
                      <p className="font-medium text-slate-800">{ticket.ref}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> {ticket.payments.map((p) => p.method).join(", ")} · {ticket.lines.reduce((acc, l) => acc + l.qty, 0)} articles
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatFCFA(ticket.total_amount)}</p>
                      <Badge tone={ticket.status === "PAID" ? "green" : "red"}>{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}