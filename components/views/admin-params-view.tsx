"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Save, Tag, X } from "lucide-react";

import { createCategory, createUnit, updateCategory, updateUnit } from "@/app/actions/admin";
import { saveIngredientMap } from "@/app/actions/daily";
import { Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Article, Category, IngredientMapEntry, Site, Unit } from "@/lib/types";

const ROLES = ["FARINE", "LEVURE", "AMELIORANT", "SEL"] as const;

export default function AdminParamsView({
  categories,
  units,
  articles,
  sites,
  ingredientMap,
  siteId,
}: {
  categories: Category[];
  units: Unit[];
  articles: Article[];
  sites: Site[];
  ingredientMap: IngredientMapEntry[];
  siteId: number;
}) {
  const router = useRouter();
  const [catName, setCatName] = useState("");
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [editingUnitCode, setEditingUnitCode] = useState("");
  const [editingUnitName, setEditingUnitName] = useState("");

  const [map, setMap] = useState<Record<string, number>>(
    Object.fromEntries(ingredientMap.map((m) => [m.role, m.article_id])),
  );

  const { run, pending, error, success } = useMutate();
  const { run: runIng, pending: ingPending, error: ingError, success: ingSuccess } = useMutate();

  const materials = articles.filter((a) => a.type === "RAW_MATERIAL");

  const addCategory = () => {
    run(() => createCategory({ name: catName }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
  };
  const saveCategory = (id: number) => {
    run(() => updateCategory(id, { name: editingCatName }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
  };
  const addUnit = () => {
    run(() => createUnit({ code: unitCode, name: unitName }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
  };
  const saveUnit = (id: number) => {
    run(() => updateUnit(id, { code: editingUnitCode, name: editingUnitName }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
  };

  const saveMap = () => {
    const items = ROLES.map((role) => ({ role, article_id: map[role] })).filter((item) => item.article_id);
    runIng(() => saveIngredientMap(siteId, items).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
  };

  return (
    <PageShell>
      <PageHeader title="Paramètres" subtitle="Catégories, unités et mapping des ingrédients de la fiche journalière" />

      <Card className="p-5 space-y-4">
        <CardHeader
          title="Ingrédients de la fiche journalière"
          subtitle="Associez chaque ingrédient (farine, levure, améliorant, sel) à un article pour la déduction automatique du stock"
          right={
            <select
              value={siteId}
              onChange={(e) => router.push(`/admin/parametres?site_id=${e.target.value}`)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map((role) => (
            <div key={role}>
              <label className="block text-xs font-medium text-slate-700 mb-1">{role}</label>
              <select
                value={map[role] ?? ""}
                onChange={(e) => setMap({ ...map, [role]: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
              >
                <option value="">— Aucun —</option>
                {materials.map((article) => (
                  <option key={article.id} value={article.id}>{article.name} ({article.unit.code})</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {ingError ? <ErrorBanner message={ingError} /> : null}
        {ingSuccess ? <SuccessBanner message={ingSuccess} /> : null}
        <Button onClick={saveMap} disabled={ingPending}>
          <Save className="w-3.5 h-3.5" /> {ingPending ? "Enregistrement..." : "Enregistrer le mapping"}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 space-y-4">
          <CardHeader title="Catégories" />
          <div className="flex gap-2">
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nouvelle catégorie..." className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
            <Button onClick={addCategory} disabled={pending || !catName}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
          <div className="space-y-1.5">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-2 p-2.5 border border-slate-100 rounded-md bg-slate-50/50">
                {editingCat === category.id ? (
                  <>
                    <input value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1" />
                    <div className="flex gap-1">
                      <Button onClick={() => saveCategory(category.id)} disabled={pending}>OK</Button>
                      <Button variant="ghost" onClick={() => setEditingCat(null)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-800 flex items-center gap-1.5"><Tag className="w-3 h-3 text-slate-400" />{category.name}</span>
                    <Button variant="ghost" onClick={() => { setEditingCat(category.id); setEditingCatName(category.name); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <CardHeader title="Unités" />
          <div className="flex gap-2">
            <input value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="Code (kg, L, unité...)" className="w-32 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
            <input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="Nom..." className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
            <Button onClick={addUnit} disabled={pending || !unitCode || !unitName}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
          <div className="space-y-1.5">
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between gap-2 p-2.5 border border-slate-100 rounded-md bg-slate-50/50">
                {editingUnit === unit.id ? (
                  <>
                    <input value={editingUnitCode} onChange={(e) => setEditingUnitCode(e.target.value)} className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-1" />
                    <input value={editingUnitName} onChange={(e) => setEditingUnitName(e.target.value)} className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1" />
                    <div className="flex gap-1">
                      <Button onClick={() => saveUnit(unit.id)} disabled={pending}>OK</Button>
                      <Button variant="ghost" onClick={() => setEditingUnit(null)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-800"><strong>{unit.code}</strong> — {unit.name}</span>
                    <Button variant="ghost" onClick={() => { setEditingUnit(unit.id); setEditingUnitCode(unit.code); setEditingUnitName(unit.name); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}
    </PageShell>
  );
}