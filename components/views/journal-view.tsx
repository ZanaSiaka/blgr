"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";

import { saveJournal } from "@/app/actions/journal";
import { Button, Card, CardHeader, ErrorBanner, formatFCFA, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type {
  Article,
  DailyJournalData,
  DailyProductionLine,
  GlacierCategory,
  GlacierLine,
  Recipe,
  Shift,
  StockItem,
} from "@/lib/types";
import type { CarryoverData } from "@/components/journal-page";

type Tab = "production" | "rafraichissement" | "patisserie" | "glacier" | "recap";

const TABS: { id: Tab; label: string }[] = [
  { id: "production", label: "Production" },
  { id: "rafraichissement", label: "Rafraichissement" },
  { id: "patisserie", label: "Patisserie" },
  { id: "glacier", label: "Glacier" },
  { id: "recap", label: "Récapitulatif" },
];

const SHIFTS: Shift[] = ["MATIN", "APRES_MIDI"];
const GLACIER_CATEGORIES: GlacierCategory[] = ["RAFRAICHISSEMENT", "RESTAURANT"];

async function refreshRecipeIngredients(recipeId: number, multiplier: number): Promise<{ name: string; qty_per_unit: number; total_qty: number }[]> {
  const res = await fetch(`/api/recipes/${recipeId}/quantities?multiplier=${multiplier}`);
  return res.json();
}

const EMPTY_GLACIER_LINE = (category: GlacierCategory): GlacierLine => ({
  id: 0,
  category,
  designation: "",
  stock_initial: 0,
  arrivage: 0,
  vendus: 0,
  pu: 0,
});

export default function JournalView({
  journal,
  siteId,
  siteName,
  readOnly,
  hideTabs,
  initialTab,
  section,
  carryover,
  resaleArticles,
  finishedArticles,
  recipes,
  stockItems,
}: {
  journal: DailyJournalData;
  siteId: number;
  siteName: string;
  readOnly?: boolean;
  hideTabs?: boolean;
  initialTab?: Tab;
  section?: Tab;
  carryover?: CarryoverData;
  resaleArticles?: Article[];
  finishedArticles?: Article[];
  recipes?: Recipe[];
  stockItems?: StockItem[];
}) {
  const date = journal.journal_date;
  const [tab, setTab] = useState<Tab>(initialTab ?? "production");
  const [boulangerNames, setBoulangerNames] = useState(journal.boulanger_names ?? "");
  const [cashierName, setCashierName] = useState(journal.cashier_name ?? "");
  const [cashierPhone, setCashierPhone] = useState(journal.cashier_phone ?? "");
  const [personnel, setPersonnel] = useState(journal.personnel ?? "");
  const [observations, setObservations] = useState(journal.observations ?? "");
  const [montantVerse, setMontantVerse] = useState(journal.montant_verse);
  const [bankName, setBankName] = useState(journal.bank_name ?? "");
  const [bankRef, setBankRef] = useState(journal.bank_ref ?? "");
  const [waveAmount, setWaveAmount] = useState(journal.wave_amount);
  const [orangeAmount, setOrangeAmount] = useState(journal.orange_amount);
  const [invendusCasse, setInvendusCasse] = useState(journal.invendus_casse);
  const [invendusBrule, setInvendusBrule] = useState(journal.invendus_brule);
  const [invendusRasse, setInvendusRasse] = useState(journal.invendus_rasse);
  const [invendusRation, setInvendusRation] = useState(journal.invendus_ration);

  const [glaceArrivagePack, setGlaceArrivagePack] = useState(journal.glace_arrivage_pack);
  const [glaceArrivageCornet, setGlaceArrivageCornet] = useState(journal.glace_arrivage_cornet);
  const [glaceVendus, setGlaceVendus] = useState(journal.glace_vendus);
  const [glacePu, setGlacePu] = useState(journal.glace_pu || 500);
  const [glacePrixVente, setGlacePrixVente] = useState(journal.glace_prix_vente);

  const [productions, setProductions] = useState<DailyProductionLine[]>(() =>
    journal.productions.length
      ? journal.productions
      : SHIFTS.flatMap((shift) =>
          Array.from({ length: 5 }, (_, i) => ({
            id: 0,
            recipe_id: null,
            shift,
            position: i + 1,
            quantity: 0,
            pu: journal.productions[0]?.pu ?? 150,
            kg: 0,
          })),
        ),
  );
  const [rafraichissements, setRafraichissements] = useState(journal.rafraichissements);
  const [patisseries, setPatisseries] = useState(journal.patisseries);
  const [stockMatieres, setStockMatieres] = useState(journal.stock_matieres);
  const [clients, setClients] = useState(journal.clients_speciaux);
  const [depenses, setDepenses] = useState(journal.depenses);
  const [glacierLines, setGlacierLines] = useState<GlacierLine[]>(
    journal.glacier_lines.length ? journal.glacier_lines : [EMPTY_GLACIER_LINE("RAFRAICHISSEMENT")],
  );
  const { run, pending, error, success } = useMutate();

  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<{ name: string; qty_per_unit: number; total_qty: number }[]>([]);
  type RecipeOpt = { id: number; name?: string; article_name?: string };

  const pu = productions[0]?.pu ?? 150;
  const totalPetris = useMemo(
    () => productions.reduce((acc, p) => acc + p.quantity, 0),
    [productions],
  );
  const totalDepenses = useMemo(() => depenses.reduce((acc, d) => acc + d.montant, 0), [depenses]);

  const totalBaguettes = Math.round(totalPetris * 7.6);
  const totalInvendus = invendusCasse + invendusBrule + invendusRasse + invendusRation;
  const vendues = Math.max(0, totalBaguettes - totalInvendus);
  const recettePain = vendues * pu - totalDepenses;

  const totalRafraichissement = useMemo(
    () => rafraichissements.reduce((acc, r) => acc + r.vendus * r.pu, 0),
    [rafraichissements],
  );
  const totalPatisserie = useMemo(
    () => patisseries.reduce((acc, p) => acc + p.vendus * p.pu, 0),
    [patisseries],
  );
  const recetteClientSpecial = useMemo(
    () => clients.reduce((acc, c) => acc + c.total, 0),
    [clients],
  );

  const totalGlacier = useMemo(
    () => glacierLines.reduce((acc, g) => acc + g.vendus * g.pu, 0),
    [glacierLines],
  );
  const totalRecette = recetteClientSpecial + recettePain + totalPatisserie + (totalRafraichissement + glaceVendus * glacePu) + totalGlacier ;
  const solde = totalRecette;
  const manquant = solde - montantVerse;

  const updateProduction = (index: number, field: "quantity" | "pu", value: number) => {
    setProductions(productions.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const exportUrl = (format: "xlsx" | "pdf") =>
    `/api/export/daily-journal?site_id=${siteId}&date=${date}&format=${format}`;

  const recipeMultiplier = useMemo(() => {
    const totalPetris = productions.reduce((acc, p) => acc + p.quantity, 0);
    return Math.round(totalPetris * 7.6);
  }, [productions]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!selectedRecipeId) { setRecipeIngredients([]); return; }
    const ctrl = new AbortController();
    refreshRecipeIngredients(selectedRecipeId, recipeMultiplier).then((data) => {
      setRecipeIngredients(data);
    }).catch(() => { setRecipeIngredients([]); });
    return () => ctrl.abort();
  }, [selectedRecipeId, recipeMultiplier]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = () => {
    run(() =>
      saveJournal(siteId, date, {
        boulanger_names: boulangerNames || null,
        cashier_name: cashierName || null,
        cashier_phone: cashierPhone || null,
        personnel: personnel || null,
        observations: observations || null,
        montant_verse: Number(montantVerse) || 0,
        bank_name: bankName || null,
        bank_ref: bankRef || null,
        wave_amount: Number(waveAmount) || 0,
        orange_amount: Number(orangeAmount) || 0,
        invendus_casse: Number(invendusCasse) || 0,
        invendus_brule: Number(invendusBrule) || 0,
        invendus_rasse: Number(invendusRasse) || 0,
        invendus_ration: Number(invendusRation) || 0,
        glace_arrivage_pack: Number(glaceArrivagePack) || 0,
        glace_arrivage_cornet: Number(glaceArrivageCornet) || 0,
        glace_vendus: Number(glaceVendus) || 0,
        glace_pu: Number(glacePu) || 500,
        glace_prix_vente: Number(glacePrixVente) || 0,
        productions: productions.map((p) => ({ recipe_id: p.recipe_id, shift: p.shift, position: p.position, quantity: p.quantity, pu: p.pu, kg: p.kg })),
        rafraichissements: rafraichissements.map((r) => ({ ...r })),
        patisseries: patisseries.map((p) => ({ ...p })),
        stock_matieres: stockMatieres.map((s) => ({ ...s })),
        clients_speciaux: clients.map((c) => ({ ...c })),
        depenses: depenses.map((d) => ({ ...d })),
        glacier_lines: glacierLines.filter((g) => g.designation).map((g) => ({ ...g })),
      }).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })),
    );
  };

  const updateRafraichissement = (index: number, field: string, value: number | string | null) => {
    setRafraichissements(rafraichissements.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };
  const addRafraichissement = () =>
    setRafraichissements([...rafraichissements, { id: 0, article_id: null, designation: "", stock_initial: 0, arrivage: 0, vendus: 0, pu: 0 }]);
  const removeRafraichissement = (index: number) =>
    setRafraichissements(rafraichissements.filter((_, i) => i !== index));

  const updatePatisserie = (index: number, field: string, value: number | string | null) => {
    setPatisseries(patisseries.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };
  const addPatisserie = () =>
    setPatisseries([...patisseries, { id: 0, article_id: null, designation: "", report: 0, produit: 0, vendus: 0, pu: 0, reste: 0, racis: 0 }]);
  const removePatisserie = (index: number) => setPatisseries(patisseries.filter((_, i) => i !== index));

  const updateStockMatiere = (index: number, field: string, value: number | string) => {
    setStockMatieres(stockMatieres.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };
  const addStockMatiere = () =>
    setStockMatieres([...stockMatieres, { id: 0, designation: "", stock_initial: 0, arrivage: 0, sortie: 0, utilise: 0 }]);
  const removeStockMatiere = (index: number) => setStockMatieres(stockMatieres.filter((_, i) => i !== index));

  const updateClient = (index: number, field: string, value: number | string) => {
    setClients(clients.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };
  const addClient = () =>
    setClients([...clients, { id: 0, designation: "", quantity: 0, unit_price: 0, total: 0, amount_due: 0, amount_paid: 0, amount_to_pay: 0 }]);
  const removeClient = (index: number) => setClients(clients.filter((_, i) => i !== index));

  const updateDepense = (index: number, field: string, value: number | string) => {
    setDepenses(depenses.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };
  const addDepense = () => setDepenses([...depenses, { id: 0, designation: "", montant: 0 }]);
  const removeDepense = (index: number) => setDepenses(depenses.filter((_, i) => i !== index));

  const updateGlacier = (index: number, field: keyof GlacierLine, value: string | number) => {
    setGlacierLines(glacierLines.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };
  const addGlacier = (category: GlacierCategory) =>
    setGlacierLines([...glacierLines, EMPTY_GLACIER_LINE(category)]);
  const removeGlacier = (index: number) => setGlacierLines(glacierLines.filter((_, i) => i !== index));



  return (
    <PageShell>
      <PageHeader
        title="Journal Quotidien"
        subtitle={`${siteName} A· ${date}`}
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
          <label className="block text-xs font-medium text-slate-700 mb-1">Boulangers</label>
          <input value={boulangerNames} onChange={(e) => setBoulangerNames(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Caissière</label>
          <input value={cashierName} onChange={(e) => setCashierName(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone caissière</label>
          <input value={cashierPhone} onChange={(e) => setCashierPhone(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
        </div>
      </div>

      {!hideTabs && !section ? (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      {(section ? section === "production" : (hideTabs || tab === "production")) && (
        <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-7 p-4 space-y-3">
            <CardHeader title="Production (pétrins)" />
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Recette</label>
                <select value={selectedRecipeId ?? ""} onChange={(e) => { const rid = e.target.value ? Number(e.target.value) : null; setSelectedRecipeId(rid); setProductions(productions.map((p) => ({ ...p, recipe_id: rid }))); }} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1">
                  <option value="">-- Aucune --</option>
                  {(recipes ?? []).map((r: RecipeOpt) => (
                    <option key={r.id} value={r.id}>{r.name ?? r.article_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Total baguettes ({recipeMultiplier})</label>
                <span className="text-xs font-medium">{recipeMultiplier} baguettes ({Math.round(recipeMultiplier * 7.6 / 7.6 * 40 / 10) / 10} kg)</span>
              </div>
            </div>
            {recipeIngredients.length > 0 ? (
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-[10px] font-semibold text-blue-700 mb-1">Ingrédients pour {recipeMultiplier} baguettes :</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                  {recipeIngredients.map((ing, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-600">{ing.name}</span>
                      <span className="font-medium text-blue-700">{ing.total_qty} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {SHIFTS.map((shift) => (
              <div key={shift}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{shift === "MATIN" ? "MATIN" : "APRES-MIDI"}</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {productions
                    .filter((p) => p.shift === shift)
                    .map((p) => (
                      <div key={p.position} className="space-y-1">
                        <label className="block text-[10px] text-slate-500">Pétrin {p.position}</label>
                        <input
                          type="number"
                          min={0}
                          value={p.quantity}
                          onChange={(e) => updateProduction(productions.findIndex((x) => x === p), "quantity", Number(e.target.value))}
                          disabled={readOnly}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right"
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Cassés", value: invendusCasse, set: setInvendusCasse },
                { label: "Brulés", value: invendusBrule, set: setInvendusBrule },
                { label: "Rassis", value: invendusRasse, set: setInvendusRasse },
                { label: "Ration", value: invendusRation, set: setInvendusRation },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-[10px] text-slate-500 mb-0.5">{field.label}</label>
                  <input type="number" min={0} value={field.value} onChange={(e) => field.set(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-5 p-4 space-y-2">
            <CardHeader title="Stock Matières" />
            <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold text-slate-400">
              <span className="col-span-2">Désignation</span><span>Stock I</span><span>Arrivage</span><span>Total</span><span>Sortie</span><span>Utilisé</span><span>StockF</span>
            </div>
            {stockMatieres.map((mat, index) => {
              const total = mat.stock_initial + mat.arrivage;
              const stockF = total - mat.sortie - mat.utilise;
              return (
                <div key={mat.id || index} className="grid grid-cols-7 gap-1 items-center">
                  <input value={mat.designation} onChange={(e) => updateStockMatiere(index, "designation", e.target.value)} disabled={readOnly} placeholder="Désignation" className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" min={0} value={mat.stock_initial} onChange={(e) => updateStockMatiere(index, "stock_initial", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1 text-right" />
                  <input type="number" min={0} value={mat.arrivage} onChange={(e) => updateStockMatiere(index, "arrivage", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1 text-right" />
                  <span className="text-xs text-slate-700 text-right bg-slate-100 rounded px-1 py-1">{total}</span>
                  <input type="number" min={0} value={mat.sortie} onChange={(e) => updateStockMatiere(index, "sortie", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1 text-right" />
                  <input type="number" min={0} value={mat.utilise} onChange={(e) => updateStockMatiere(index, "utilise", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1 text-right" />
                  <span className="text-xs text-slate-700 text-right bg-slate-100 rounded px-1 py-1">{stockF}</span>
                </div>
              );
            })}
            {!readOnly ? (
              <div className="flex gap-1">
                <Button variant="ghost" onClick={addStockMatiere}><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
                {stockMatieres.length > 0 ? <Button variant="ghost" onClick={() => removeStockMatiere(stockMatieres.length - 1)}><Trash2 className="w-3.5 h-3.5" /></Button> : null}
              </div>
            ) : null}
          </Card>
        </div>

          <Card className="p-4 space-y-3">
            <CardHeader title="Client Spécial" right={!readOnly ? <Button variant="ghost" onClick={addClient}><Plus className="w-3.5 h-3.5" /> Ajouter</Button> : null} />
            <div className="grid grid-cols-6 gap-1 text-[10px] font-semibold text-slate-400">
              <span className="col-span-2">Désignation</span><span>Nb</span><span>PU</span><span>Total</span><span>M.versé</span><span>A.verser</span>
            </div>
            {clients.map((client, index) => (
              <div key={client.id || index} className="grid grid-cols-6 gap-1 items-center">
                <input value={client.designation} onChange={(e) => updateClient(index, "designation", e.target.value)} disabled={readOnly} className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                <input type="number" min={0} value={client.quantity} onChange={(e) => updateClient(index, "quantity", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={client.unit_price} onChange={(e) => updateClient(index, "unit_price", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={client.total} onChange={(e) => updateClient(index, "total", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={client.amount_paid} onChange={(e) => updateClient(index, "amount_paid", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <span className="text-xs text-slate-700 text-right">{client.amount_due - client.amount_paid}</span>
                {!readOnly ? <button onClick={() => removeClient(index)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button> : null}
              </div>
            ))}
            <p className="text-xs text-slate-500">Total Client Spécial : <strong>{formatFCFA(recetteClientSpecial)}</strong></p>
          </Card>

          <Card className="p-4 space-y-3">
            <CardHeader title="Dépenses" right={!readOnly ? <Button variant="ghost" onClick={addDepense}><Plus className="w-3.5 h-3.5" /> Ajouter</Button> : null} />
            <div className="grid grid-cols-1 gap-1">
              {depenses.map((d, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_30px] gap-1 items-center">
                  <input value={d.designation} onChange={(e) => updateDepense(i, "designation", e.target.value)} disabled={readOnly} placeholder="Désignation" className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                  <input type="number" min={0} value={d.montant} onChange={(e) => updateDepense(i, "montant", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                  {!readOnly ? <button onClick={() => removeDepense(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button> : null}
                </div>
              ))}
              {depenses.length === 0 ? <p className="text-xs text-slate-400">Aucune dépense.</p> : null}
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 text-xs"><span className="font-semibold">TOTAL DÉPENSES</span><strong>{formatFCFA(totalDepenses)}</strong></div>
          </Card>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">PU baguette (FCFA)</label>
                    <input type="number" min={0} value={pu} onChange={(e) => setProductions(productions.map((p) => ({ ...p, pu: Number(e.target.value) })))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
                </div>
                <div className="text-xs space-y-1 p-2 bg-slate-50 rounded border border-slate-200">
                    <p>Pétrins : <strong>{totalPetris}</strong></p>
                    <p>Total : <strong>{totalBaguettes}</strong> baguettes</p>
                    <p>Invendus : <strong>{totalInvendus}</strong></p>
                    <p>Vendues : <strong>{vendues}</strong></p>
                    <p>Montant : <strong>{formatFCFA(recettePain)}</strong></p>
                </div>
            </div>
        </div>
      )}

      {(section ? section === "rafraichissement" : (hideTabs || tab === "rafraichissement")) && (
        <Card className="p-4 space-y-3">
          <CardHeader title="Rafraichissement" right={!readOnly ? <Button variant="ghost" onClick={addRafraichissement}><Plus className="w-3.5 h-3.5" /> Ajouter</Button> : null} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-50 rounded border border-slate-200">
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Arrivage pack glaces</label>
              <input type="number" min={0} value={glaceArrivagePack} onChange={(e) => setGlaceArrivagePack(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Arrivage cornet</label>
              <input type="number" min={0} value={glaceArrivageCornet} onChange={(e) => setGlaceArrivageCornet(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">PU glace</label>
              <input type="number" min={0} value={glacePu} onChange={(e) => setGlacePu(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Prix de vente</label>
              <input type="number" min={0} value={glacePrixVente} onChange={(e) => setGlacePrixVente(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Vendus glace</label>
              <input type="number" min={0} value={glaceVendus} onChange={(e) => setGlaceVendus(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-right" />
            </div>
            <div className="flex flex-col justify-end">
              <span className="text-[10px] text-slate-500">Montant Restant</span>
              <strong className={`text-xs text-right ${glacePrixVente - glaceVendus * glacePu < 0 ? "text-violet-600" : "text-slate-700"}`}>{formatFCFA(glacePrixVente - glaceVendus * glacePu)}</strong>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1 text-[10px] font-semibold text-slate-400">
            <span className="col-span-2">Désignation</span><span>Stock I</span><span>Arrivage</span><span>Vendus</span><span>PU</span>
          </div>
          {rafraichissements.map((line, index) => {
            const total = line.stock_initial + line.arrivage;
            const carryQty = carryover?.rafraichissements?.find((c) => c.article_id === line.article_id)?.stock_initial ?? 0;
            return (
              <div key={line.id || index} className="grid grid-cols-6 gap-1 items-center">
                <select value={line.article_id ?? ""} onChange={(e) => { const aid = e.target.value ? Number(e.target.value) : null; const art = resaleArticles?.find((a) => a.id === aid); const stockQty = stockItems?.find((s) => s.article_id === aid)?.qty ?? 0; setRafraichissements(rafraichissements.map((r, i) => i === index ? { ...r, article_id: aid, designation: art ? art.name : r.designation, pu: r.pu || (art?.sale_price ?? 0), stock_initial: r.stock_initial || stockQty } : r)); }} disabled={readOnly} className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1">
                  <option value="">-- Sélectionner --</option>
                  {(resaleArticles ?? []).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {carryQty > 0 ? <span className="text-[10px] text-violet-600 col-span-6">+{carryQty} report</span> : null}
                <input type="number" min={0} value={line.stock_initial} onChange={(e) => updateRafraichissement(index, "stock_initial", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.arrivage} onChange={(e) => updateRafraichissement(index, "arrivage", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.vendus} onChange={(e) => updateRafraichissement(index, "vendus", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.pu} onChange={(e) => updateRafraichissement(index, "pu", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-slate-400">PT:{line.vendus * line.pu}</span>
                  {!readOnly ? <button onClick={() => removeRafraichissement(index)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button> : null}
                </div>
                <span className="col-span-6 text-slate-400 text-sm">Total: {total} </span>
                  <span className="col-span-6 text-slate-400 text-sm">Reste: {total - line.vendus}</span>
              </div>
            );
          })}
          <div className="text-xs space-y-1 pt-2 border-t border-slate-200">
            <div className="flex justify-between"><span>Total Glaces</span><strong>{formatFCFA(glaceVendus * glacePu)}</strong></div>
            <div className="flex justify-between"><span>Total Frigo</span><strong>{formatFCFA(totalRafraichissement)}</strong></div>
            <div className="flex justify-between border-t border-slate-300 pt-1"><span className="font-semibold">TOTAL GÉNÉRAL RAFRAÎCHISSEMENT</span><strong>{formatFCFA(totalRafraichissement + glaceVendus * glacePu)}</strong></div>
          </div>
        </Card>
      )}

      {(section ? section === "patisserie" : (hideTabs || tab === "patisserie")) && (
        <Card className="p-4 space-y-3">
          <CardHeader title="Patisserie" right={!readOnly ? <Button variant="ghost" onClick={addPatisserie}><Plus className="w-3.5 h-3.5" /> Ajouter</Button> : null} />
          <div className="grid grid-cols-6 gap-1 text-[10px] font-semibold text-slate-400">
            <span className="col-span-2">Désignation</span><span>Report</span><span>Produit</span><span>Vendus</span><span>PU</span><span>Reste</span><span>Racis</span>
          </div>
          {patisseries.map((line, index) => {
            const total = line.report + line.produit;
            const carryQty = carryover?.patisseries?.find((c) => c.article_id === line.article_id)?.report ?? 0;
            return (
              <div key={line.id || index} className="grid grid-cols-8 gap-1 items-center">
                <select value={line.article_id ?? ""} onChange={(e) => { const aid = e.target.value ? Number(e.target.value) : null; const art = finishedArticles?.find((a) => a.id === aid); const stockQty = stockItems?.find((s) => s.article_id === aid)?.qty ?? 0; setPatisseries(patisseries.map((p, i) => i === index ? { ...p, article_id: aid, designation: art ? art.name : p.designation, pu: p.pu || (art?.sale_price ?? 0), report: p.report || stockQty } : p)); }} disabled={readOnly} className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1">
                  <option value="">-- Sélectionner --</option>
                  {(finishedArticles ?? []).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {carryQty > 0 ? <span className="text-[10px] text-violet-600 col-span-8">+{carryQty} report (J-1)</span> : null}
                <input type="number" min={0} value={line.report} onChange={(e) => updatePatisserie(index, "report", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.produit} onChange={(e) => updatePatisserie(index, "produit", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.vendus} onChange={(e) => updatePatisserie(index, "vendus", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.pu} onChange={(e) => updatePatisserie(index, "pu", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.reste} onChange={(e) => updatePatisserie(index, "reste", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <input type="number" min={0} value={line.racis} onChange={(e) => updatePatisserie(index, "racis", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400">M:{line.vendus * line.pu}</span>
                  {!readOnly ? <button onClick={() => removePatisserie(index)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button> : null}
                </div>
                <span className="col-span-8 text-[10px] text-slate-400">Total: {total}</span>
              </div>
            );
          })}
          <p className="text-xs text-slate-500">Total Patisserie : <strong>{formatFCFA(totalPatisserie)}</strong></p>
        </Card>
      )}

      {(section ? section === "glacier" : (hideTabs || tab === "glacier")) && (
        <Card className="p-4 space-y-3">
          <CardHeader title="Glacier" />
          {GLACIER_CATEGORIES.map((category) => {
            const lines = glacierLines.filter((g) => g.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-600">{category === "RAFRAICHISSEMENT" ? "Rafraichissement" : "Restaurant"}</h4>
                  {!readOnly ? (
                    <Button variant="ghost" onClick={() => addGlacier(category)}>
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                  ) : null}
                </div>
                <div className="grid grid-cols-6 gap-1 text-[10px] font-semibold text-slate-400">
                  <span className="col-span-2">Désignation</span><span>Stock I</span><span>Arrivage</span><span>Vendus</span><span>PU</span>
                </div>
                {lines.map((line, mapIdx) => {
                  const idx = glacierLines.findIndex((g) => g === line);
                  const total = line.stock_initial + line.arrivage;
                  return (
                    <div key={`glacier-${category}-${mapIdx}`} className="grid grid-cols-6 gap-1 items-center">
                      <input value={line.designation} onChange={(e) => updateGlacier(idx, "designation", e.target.value)} disabled={readOnly} className="col-span-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                      <input type="number" min={0} value={line.stock_initial} onChange={(e) => updateGlacier(idx, "stock_initial", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                      <input type="number" min={0} value={line.arrivage} onChange={(e) => updateGlacier(idx, "arrivage", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                      <input type="number" min={0} value={line.vendus} onChange={(e) => updateGlacier(idx, "vendus", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                      <input type="number" min={0} value={line.pu} onChange={(e) => updateGlacier(idx, "pu", Number(e.target.value))} disabled={readOnly} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right" />
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-400">M:{line.vendus * line.pu}</span>
                        {!readOnly ? <button onClick={() => removeGlacier(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button> : null}
                      </div>
                      <span className="col-span-6 text-[10px] text-slate-400">Total: {total} A· Reste: {total - line.vendus}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <p className="text-xs text-slate-500">Total Glacier : <strong>{formatFCFA(totalGlacier)}</strong></p>
        </Card>
      )}

      {(section ? section === "recap" : (hideTabs || tab === "recap")) && (
        <Card className="p-4 space-y-4">
          <CardHeader title="Récapitulatif" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500">Recettes</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Client spécial</span><strong>{formatFCFA(recetteClientSpecial)}</strong></div>
                <div className="flex justify-between"><span>Pain</span><strong>{formatFCFA(recettePain)}</strong></div>
                <div className="flex justify-between"><span>Patisseries</span><strong>{formatFCFA(totalPatisserie)}</strong></div>
                <div className="flex justify-between"><span>Rafraîchissement</span><strong>{formatFCFA(totalRafraichissement + glaceVendus * glacePu)}</strong></div>
                <div className="flex justify-between"><span>Glacier</span><strong>{formatFCFA(totalGlacier)}</strong></div>
                <div className="flex justify-between border-t border-slate-200 pt-1"><span className="font-semibold">TOTAL RECETTE</span><strong>{formatFCFA(totalRecette)}</strong></div>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                <span>SOLDE DU JOUR</span><span className={solde >= 0 ? "text-emerald-600" : "text-red-600"}>{formatFCFA(solde)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Montant versé</label>
                  <input type="number" min={0} value={montantVerse} onChange={(e) => setMontantVerse(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
                </div>
                <div className="text-xs flex items-end pb-2">
                  <span className="text-slate-500">Manquant : </span>
                  <strong className={`ml-1 ${manquant >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(manquant)}</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Wave / Orange</label>
                  <input type="number" min={0} value={waveAmount} onChange={(e) => setWaveAmount(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Paiement orange</label>
                  <input type="number" min={0} value={orangeAmount} onChange={(e) => setOrangeAmount(Number(e.target.value))} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Banque</label>
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={readOnly} placeholder="Nom banque" className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Réf. versement</label>
                <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} disabled={readOnly} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Personnel</label>
                <textarea value={personnel} onChange={(e) => setPersonnel(e.target.value)} disabled={readOnly} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Observations</label>
                <textarea value={observations} onChange={(e) => setObservations(e.target.value)} disabled={readOnly} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
              </div>
              {!readOnly ? (
                <div className="space-y-2">
                  {error ? <ErrorBanner message={error} /> : null}
                  {success ? <SuccessBanner message={success} /> : null}
                  <Button onClick={submit} disabled={pending} className="w-full">
                    <Save className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer le journal"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      )}
      {section && !readOnly ? (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 rounded-lg shadow-sm flex items-center gap-3">
          {error ? <ErrorBanner message={error} /> : null}
          {success ? <SuccessBanner message={success} /> : null}
          <Button onClick={submit} disabled={pending} className="w-full sm:w-auto">
            <Save className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer le journal"}
          </Button>
        </div>
      ) : null}
    </PageShell>
  );
}