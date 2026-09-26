"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, Card, CardHeader, PageHeader, PageShell, StatCard } from "@/components/ui";
import type { ReceptionRow } from "@/lib/types";

export default function AdminReceptionsView({ rows }: { rows: ReceptionRow[] }) {
  const router = useRouter();
  const [kind, setKind] = useState("TOUS");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = kind === "TOUS" ? rows : rows.filter((row) => row.kind === kind);
  const totalEcarts = filtered.reduce((acc, row) => acc + row.total_ecarts, 0);
  const achats = filtered.filter((r) => r.kind === "ACHAT").length;
  const transferts = filtered.filter((r) => r.kind === "TRANSFERT").length;

  const applyKind = (value: string) => {
    setKind(value);
    setOpenId(null);
    router.push(`/admin/receptions?kind=${value}`);
  };

  return (
    <PageShell>
      <PageHeader title="Réceptions & Achats" subtitle="Détail des réceptions d'achat et de transfert (écarts et motifs)" />

      <div className="flex gap-2 flex-wrap">
        {["TOUS", "ACHAT", "TRANSFERT"].map((k) => (
          <button
            key={k}
            onClick={() => applyKind(k)}
            className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${
              kind === k ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {k === "TOUS" ? "Tous" : k === "ACHAT" ? "Achats (BC)" : "Transferts (BT)"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Réceptions" value={`${filtered.length}`} />
        <StatCard label="Achats / Transferts" value={`${achats} / ${transferts}`} />
        <StatCard label="Lignes en écart" value={`${totalEcarts}`} sub={<span className="text-red-600 font-bold">à justifier</span>} />
      </div>

      <Card className="p-4 space-y-2">
        <CardHeader title="Liste des réceptions" />
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune réception.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((row) => (
              <div key={`${row.kind}-${row.ref}`} className="border border-slate-100 rounded-md overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === `${row.kind}-${row.ref}` ? null : `${row.kind}-${row.ref}`)}
                  className="w-full flex items-center justify-between p-3 text-xs bg-slate-50/50 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Badge tone={row.kind === "ACHAT" ? "blue" : "amber"}>{row.kind === "ACHAT" ? "Achat" : "Transfert"}</Badge>
                    <span className="font-bold text-slate-800">{row.ref}</span>
                    <span className="text-slate-500">{row.counterpart}</span>
                    <span className="text-slate-400">{row.date ? new Date(row.date).toLocaleString("fr-FR") : "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.total_ecarts > 0 ? <Badge tone="red">{row.total_ecarts} écart(s)</Badge> : <Badge tone="green">Conforme</Badge>}
                    <span className="text-slate-400">{row.site_name}</span>
                  </div>
                </button>
                {openId === `${row.kind}-${row.ref}` ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-y border-slate-100 bg-white text-slate-400">
                          <th className="py-2 px-3">Article</th>
                          <th className="py-2 px-3 text-center">Attendu</th>
                          <th className="py-2 px-3 text-center">Reçu</th>
                          <th className="py-2 px-3 text-center">Écart</th>
                          <th className="py-2 px-3">Motif</th>
                          <th className="py-2 px-3">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {row.lines.map((line, index) => (
                          <tr key={index}>
                            <td className="py-2 px-3 font-medium text-slate-800">{line.article_name}</td>
                            <td className="py-2 px-3 text-center text-slate-600">{line.expected_qty}</td>
                            <td className="py-2 px-3 text-center font-semibold text-slate-900">{line.received_qty}</td>
                            <td className="py-2 px-3 text-center">
                              {line.diff === 0 ? (
                                <Badge tone="green">OK</Badge>
                              ) : (
                                <span className={`font-bold ${line.diff > 0 ? "text-amber-600" : "text-red-600"}`}>{line.diff > 0 ? `+${line.diff}` : line.diff}</span>
                              )}
                            </td>
                            <td className="py-2 px-3">{line.reason ?? "—"}</td>
                            <td className="py-2 px-3 text-slate-500">{line.note ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}