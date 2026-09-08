"use client";

import { useState } from "react";
import { Pencil, Plus, Tag, X } from "lucide-react";

import { createCategory, createUnit, updateCategory, updateUnit } from "@/app/actions/admin";
import { Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Category, Unit } from "@/lib/types";

export default function AdminParamsView({
  categories,
  units,
}: {
  categories: Category[];
  units: Unit[];
}) {
  const [catName, setCatName] = useState("");
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [editingUnitCode, setEditingUnitCode] = useState("");
  const [editingUnitName, setEditingUnitName] = useState("");

  const { run, pending, error, success } = useMutate();

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

  return (
    <PageShell>
      <PageHeader title="Paramètres" subtitle="Catégories et unités utilisées pour les articles" />

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