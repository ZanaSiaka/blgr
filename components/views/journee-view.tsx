"use client";

import { useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";

import { saveDailySheet } from "@/app/actions/daily";
import { Badge, Button, Card, CardHeader, ErrorBanner, formatFCFA, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { DailyMaterialStock, DailyProductionLine, DailySheetData, DailySpecialClient, Shift } from "@/lib/types";

type ProdRow = DailyProductionLine;
type ClientRow = DailySpecialClient;
type MatRow = DailyMaterialStock;

const EMPTY_PROD = (shift: Shift): ProdRow => ({
  shift, position: 1, kg: 0, nbre_pate: 0, double: 0, baguette: 0, nd: 0, ficelle: 0,
  levure: 0, ameliorant: 0, sel: 0, baker_name: null,
});
const EMPTY_CLIENT = (): ClientRow => ({ client_name: "", quantity: 0, unit_price: 0, amount_due: 0, amount_paid: 0, amount_to_pay: 0 });
const EMPTY_MAT = (): MatRow => ({ article_id: null, designation: "", stock_initial: 0, arrivage: 0, sortie: 0, utilise: 0, stock_k: 0, stock_final_sac: 0 });

export default function JourneeView({
  sheet,
  siteId,
  siteName,
  readOnly,
}: {
  sheet: DailySheetData;
  siteId: number;
  siteName: string;
  readOnly?: boolean;
}) {
  const date = sheet.date;
  const [cashierName, setCashierName] = useState(sheet.cashier_name ?? "");
  const [managerName, setManagerName] = useState(sheet.manager_name ?? "");
  const [personnel, setPersonnel] = useState(sheet.personnel ?? "");
  const [montantVerse, setMontantVerse] = useState(sheet.montant_verse);
  const [bankName, setBankName] = useState(sheet.bank_name ?? "");
  const [bankRef, setBankRef] = useState(sheet.bank_ref ?? "");
  const [bombonne, setBombonne] = useState(sheet.gas_bottle_level ?? "");
  const [unsoldBroken, setUnsoldBroken] = useState(sheet.unsold_broken);
  const [unsoldStale, setUnsoldStale] = useState(sheet.unsold_stale);
  const [unsoldRation, setUnsoldRation] = useState(sheet.unsold_ration);
  const [unsoldOther, setUnsoldOther] = useState(sheet.unsold_other);
  const [notes, setNotes] = useState(sheet.notes ?? "");
  const [production, setProduction] = useState<ProdRow[]>(sheet.production.length ? sheet.production : [EMPTY_PROD("MATIN")]);
  const [clients, setClients] = useState<ClientRow[]>(sheet.special_clients);
  const [materials, setMaterials] = useState<MatRow[]>(sheet.materials);
  const [saved, setSaved] = useState<DailySheetData | null>(null);
  const { run, pending, error, success } = useMutate();

  const kgTotal = production.reduce((acc, p) => acc + (Number(p.kg) || 0), 0);
  const baguetteTotal = production.reduce((acc, p) => acc + (Number(p.baguette) || 0), 0);
  const recetteSpecial = clients.reduce((acc, c) => acc + (Number(c.amount_due) || 0), 0);

  const save = () => {
    run(() =>
      saveDailySheet(siteId, date, {
        cashier_name: cashierName || null,
        manager_name: managerName || null,
        personnel: personnel || null,
        montant_verse: Number(montantVerse) || 0,
        bank_name: bankName || null,
        bank_ref: bankRef || null,
        gas_bottle_level: bombonne || null,
        unsold_broken: Number(unsoldBroken) || 0,
        unsold_stale: Number(unsoldStale) || 0,
        unsold_ration: Number(unsoldRation) || 0,
        unsold_other: Number(unsoldOther) || 0,
        notes: notes || null,
        production,
        special_clients: clients,
        materials,
      }).then((result) => {
        if (result.ok) setSaved(result.data);
        return { ok: result.ok, error: result.ok ? undefined : result.error };
      }),
    );
  };

  const updateProd = (index: number, field: keyof ProdRow, value: string | number | null) => {
    setProduction(production.map((p, i) => (i === index ? { ...p, [field]: field === "baker_name" ? value : Number(value) || 0 } : p)));
  };
  const updateClient = (index: number, field: keyof ClientRow, value: string | number) => {
    setClients(clients.map((c, i) => (i === index ? { ...c, [field]: field === "client_name" ? value : Number(value) || 0 } : c)));
  };
  const updateMat = (index: number, field: keyof MatRow, value: string | number) => {
    setMaterials(materials.map((m, i) => (i === index ? { ...m, [field]: field === "designation" ? value : Number(value) || 0 } : m)));
  };

  const effective = saved ?? sheet;

  const exportUrl = (format: "xlsx" | "pdf") =>
    `/api/export/daily-sheet?site_id=${siteId}&date=${date}&format=${format}`;

  return (
    <PageShell>
      <PageHeader
        title="Fiche journalière"
        subtitle={`${siteName} · ${date}`}
        badge={
          <div className="flex gap-2">
            <a href={exportUrl("xlsx")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Excel
            </a>
            <a href={exportUrl("pdf")} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> PDF
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Caissier(ère) du jour</label>
          <input value={cashierName} onChange={(e) => setCashierName(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Gérante / Cachet</label>
          <input value={managerName} onChange={(e) => setManagerName(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Versement (Nom guichetier)</label>
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Réf. versement</label>
          <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Niveau bombonne</label>
          <input value={bombonne} onChange={(e) => setBombonne(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Personnel (noms)</label>
          <input value={personnel} onChange={(e) => setPersonnel(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <CardHeader
          title="Production (pétrins)"
          right={
            !readOnly ? (
              <Button variant="ghost" onClick={() => setProduction([...production, EMPTY_PROD("APRES_MIDI")])}>
                <Plus className="w-3.5 h-3.5" /> Pétrin
              </Button>
            ) : null
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-1">Shift</th>
                <th className="pb-1">#</th>
                <th className="pb-1">kg</th>
                <th className="pb-1">Pâte</th>
                <th className="pb-1">Double</th>
                <th className="pb-1">Baguette</th>
                <th className="pb-1">ND</th>
                <th className="pb-1">Ficelle</th>
                <th className="pb-1">Levure</th>
                <th className="pb-1">Amélio.</th>
                <th className="pb-1">Sel</th>
                <th className="pb-1">Boulanger</th>
                {!readOnly ? <th className="pb-1" /> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {production.map((p, index) => (
                <tr key={index}>
                  {(["shift", "position", "kg", "nbre_pate", "double", "baguette", "nd", "ficelle", "levure", "ameliorant", "sel"] as const).map((field) => (
                    <td key={field} className="py-1 pr-1">
                      <input
                        type={field === "shift" ? "text" : "number"}
                        step={["kg", "levure", "ameliorant", "sel"].includes(field) ? "0.01" : "1"}
                        value={String(p[field])}
                        onChange={(e) => updateProd(index, field, e.target.value)}
                        disabled={readOnly}
                        className="w-14 text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1"
                      />
                    </td>
                  ))}
                  <td className="py-1 pr-1">
                    <input
                      value={p.baker_name ?? ""}
                      onChange={(e) => updateProd(index, "baker_name", e.target.value)}
                      disabled={readOnly}
                      className="w-24 text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1"
                    />
                  </td>
                  {!readOnly ? (
                    <td className="py-1">
                      <button onClick={() => (production.length > 1 ? setProduction(production.filter((_, i) => i !== index)) : null)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-slate-500 flex gap-4">
          <span>Total kg : <strong>{kgTotal.toFixed(2)}</strong></span>
          <span>Baguettes : <strong>{baguetteTotal}</strong></span>
          <span>kg × 7.6 : <strong>{(kgTotal * 7.6).toFixed(2)}</strong></span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <CardHeader title="Invendus" right={
            !readOnly ? (
              <Button variant="ghost" onClick={() => { setUnsoldBroken(0); setUnsoldStale(0); setUnsoldRation(0); setUnsoldOther(0); }}>
                Réinitialiser
              </Button>
            ) : null
          } />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Pain cassés", value: unsoldBroken, set: setUnsoldBroken },
              { label: "Rassis", value: unsoldStale, set: setUnsoldStale },
              { label: "Ration", value: unsoldRation, set: setUnsoldRation },
              { label: "Autres", value: unsoldOther, set: setUnsoldOther },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-slate-700 mb-1">{field.label}</label>
                <input type="number" min={0} value={field.value} onChange={(e) => field.set(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <CardHeader
            title="Client spécial"
            right={!readOnly ? (
              <Button variant="ghost" onClick={() => setClients([...clients, EMPTY_CLIENT()])}>
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </Button>
            ) : null}
          />
          {clients.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun client spécial.</p>
          ) : (
            <div className="space-y-2">
              {clients.map((c, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <input value={c.client_name} onChange={(e) => updateClient(index, "client_name", e.target.value)} disabled={readOnly} placeholder="Client" className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" value={c.quantity} onChange={(e) => updateClient(index, "quantity", e.target.value)} disabled={readOnly} className="w-16 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" value={c.unit_price} onChange={(e) => updateClient(index, "unit_price", e.target.value)} disabled={readOnly} className="w-20 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" value={c.amount_due} onChange={(e) => updateClient(index, "amount_due", e.target.value)} disabled={readOnly} className="w-20 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" value={c.amount_paid} onChange={(e) => updateClient(index, "amount_paid", e.target.value)} disabled={readOnly} className="w-20 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  {!readOnly ? (
                    <button onClick={() => setClients(clients.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-500">Total dû client spécial : <strong>{formatFCFA(recetteSpecial)}</strong></p>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <CardHeader
          title="Stock matières du jour"
          right={!readOnly ? (
            <Button variant="ghost" onClick={() => setMaterials([...materials, EMPTY_MAT()])}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          ) : null}
        />
        {materials.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune matière saisie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-1">Désignation</th>
                  {["stock_initial", "arrivage", "sortie", "utilise", "stock_k", "stock_final_sac"].map((h) => (
                    <th key={h} className="pb-1">{h === "stock_initial" ? "Initial" : h === "stock_final_sac" ? "Final sac" : h === "stock_k" ? "Stock k" : h}</th>
                  ))}
                  {!readOnly ? <th className="pb-1" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m, index) => (
                  <tr key={index}>
                    <td className="py-1 pr-1">
                      <input value={m.designation} onChange={(e) => updateMat(index, "designation", e.target.value)} disabled={readOnly} className="w-28 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                    </td>
                    {(["stock_initial", "arrivage", "sortie", "utilise", "stock_k", "stock_final_sac"] as const).map((field) => (
                      <td key={field} className="py-1 pr-1">
                        <input type="number" value={m[field]} onChange={(e) => updateMat(index, field, e.target.value)} disabled={readOnly} className="w-16 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                      </td>
                    ))}
                    {!readOnly ? (
                      <td className="py-1">
                        <button onClick={() => setMaterials(materials.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-2">
        <CardHeader title="Récapitulatif & clôture" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-slate-50 rounded"><p className="text-slate-500">Ventes du jour</p><p className="font-bold text-slate-900">{formatFCFA(effective.sales_total)}</p></div>
          <div className="p-2 bg-slate-50 rounded"><p className="text-slate-500">Dépenses</p><p className="font-bold text-slate-900">{formatFCFA(effective.total_depenses)}</p></div>
          <div className="p-2 bg-slate-50 rounded"><p className="text-slate-500">TOTAL MONTANT</p><p className="font-bold text-slate-900">{formatFCFA(effective.total_montant)}</p></div>
          <div className="p-2 bg-slate-50 rounded"><p className="text-slate-500">Montant versé</p><p className="font-bold text-slate-900">{formatFCFA(effective.montant_verse)}</p></div>
          <div className="p-2 bg-slate-50 rounded col-span-2">
            <p className="text-slate-500">Manquant</p>
            <p className={`font-bold ${effective.manquant >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(effective.manquant)}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded col-span-2">
            <p className="text-slate-500 mb-1">Montant versé (saisie)</p>
            <input type="number" min={0} value={montantVerse} onChange={(e) => setMontantVerse(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1" />
          </div>
        </div>
        {effective.expenses.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            {effective.expenses.map((e) => (
              <span key={e.category} className="bg-slate-100 px-2 py-0.5 rounded">{e.category} : {formatFCFA(e.total)}</span>
            ))}
          </div>
        ) : null}
        {effective.closures.length > 0 ? (
          <div className="text-[11px] text-slate-600">
            {effective.closures.map((c) => (
              <p key={c.id}>Clôture : attendu {formatFCFA(c.expected_cash + c.expected_mobile + c.expected_card)} · compté {formatFCFA((c.counted_cash ?? 0) + (c.counted_mobile ?? 0) + (c.counted_card ?? 0))} · écart {formatFCFA(c.over_short)}</p>
            ))}
          </div>
        ) : null}
      </Card>

      {!readOnly ? (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          {error ? <ErrorBanner message={error} /> : null}
          {success ? <SuccessBanner message={success} /> : null}
          <Button onClick={save} disabled={pending} className="w-full">
            <Save className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer la fiche (déduit le stock)"}
          </Button>
          <p className="text-[11px] text-slate-400">
            {effective.sales_count > 0 ? <Badge tone="blue">{effective.sales_count} tickets</Badge> : null}{" "}
            Les matières consommées (farine, levure, améliorant, sel) sont déduites automatiquement du stock.
          </p>
        </div>
      ) : null}
    </PageShell>
  );
}