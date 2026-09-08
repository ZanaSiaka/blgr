"use client";

import { useState } from "react";
import { BookOpen, Plus, Save, Trash2 } from "lucide-react";

import { createRecipe, updateRecipe } from "@/app/actions/recipes";
import { Badge, Button, Card, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Article, Recipe } from "@/lib/types";

interface EditorLine {
  material_article_id: number;
  qty_per_unit: number;
}

export default function RecipesView({ recipes, articles }: { recipes: Recipe[]; articles: Article[] }) {
  const producedArticles = articles.filter((a) => a.type === "FINISHED_GOOD");
  const materials = articles.filter((a) => a.type === "RAW_MATERIAL");

  const [selectedId, setSelectedId] = useState<number | null>(recipes[0]?.id ?? null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState(recipes[0]?.name ?? "");
  const [articleId, setArticleId] = useState<number>(recipes[0]?.article_id ?? producedArticles[0]?.id ?? 0);
  const [lines, setLines] = useState<EditorLine[]>(
    recipes[0]?.lines.map((line) => ({ material_article_id: line.material_article_id, qty_per_unit: line.qty_per_unit })) ?? [],
  );
  const { run, pending, error, success } = useMutate();

  const loadRecipe = (recipe: Recipe) => {
    setSelectedId(recipe.id);
    setIsNew(false);
    setName(recipe.name);
    setArticleId(recipe.article_id);
    setLines(recipe.lines.map((line) => ({ material_article_id: line.material_article_id, qty_per_unit: line.qty_per_unit })));
  };

  const newRecipe = () => {
    setSelectedId(null);
    setIsNew(true);
    setName("Nouvelle recette");
    setArticleId(producedArticles[0]?.id ?? 0);
    setLines([{ material_article_id: materials[0]?.id ?? 0, qty_per_unit: 0.1 }]);
  };

  const addLine = () => setLines([...lines, { material_article_id: materials[0]?.id ?? 0, qty_per_unit: 0.1 }]);
  const updateLine = (index: number, field: keyof EditorLine, value: number) =>
    setLines(lines.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  const removeLine = (index: number) => {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== index));
  };

  const save = () => {
    const payload = { name, article_id: articleId, lines };
    if (isNew || selectedId === null) {
      run(() => createRecipe(payload).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })));
    } else {
      run(() => updateRecipe(selectedId, payload).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })));
    }
  };

  const materialName = (id: number) => materials.find((m) => m.id === id)?.name ?? "—";
  const materialCost = (id: number) => materials.find((m) => m.id === id)?.cost_price ?? 0;
  const totalCost = lines.reduce((acc, line) => acc + line.qty_per_unit * materialCost(line.material_article_id), 0);
  const salePrice = producedArticles.find((a) => a.id === articleId)?.sale_price ?? null;

  return (
    <PageShell>
      <PageHeader
        title="Gestion des Nomenclatures (BOM / Recettes)"
        subtitle="Définissez la composition unitaire de chaque produit fini"
        badge={<Button onClick={newRecipe}><Plus className="w-3.5 h-3.5" /> Nouvelle recette</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-4 p-4 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Catalogue des recettes</p>
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => loadRecipe(recipe)}
              className={`w-full text-left p-3 rounded-md border text-xs transition-all flex items-center justify-between ${
                selectedId === recipe.id && !isNew
                  ? "border-slate-900 bg-slate-900 text-white font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />{recipe.name}</span>
              <Badge tone={selectedId === recipe.id && !isNew ? "slate" : "blue"}>{recipe.article_name}</Badge>
            </button>
          ))}
        </Card>

        <Card className="lg:col-span-8 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fiche technique : <span className="text-slate-900 font-bold">{name}</span>
            </p>
            <span className="text-[11px] text-slate-500">Base : 1 unité produite</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom du produit fini</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Produit fini</label>
              <select
                value={articleId}
                onChange={(e) => setArticleId(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              >
                {producedArticles.map((article) => (
                  <option key={article.id} value={article.id}>{article.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-700">Composants & dosage (par unité)</p>
              <Button variant="ghost" onClick={addLine}><Plus className="w-3.5 h-3.5" /> Ajouter un composant</Button>
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
              {lines.map((line, index) => (
                <div key={index} className="p-3 bg-slate-50/50 flex items-center gap-3">
                  <select
                    value={line.material_article_id}
                    onChange={(e) => updateLine(index, "material_article_id", Number(e.target.value))}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>{material.name} ({material.unit.code})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.001"
                    min={0.001}
                    value={line.qty_per_unit}
                    onChange={(e) => updateLine(index, "qty_per_unit", Number(e.target.value))}
                    className="w-24 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-right font-semibold"
                  />
                  <span className="text-xs text-slate-500 w-20 text-right">
                    {materialCost(line.material_article_id) ? `${materialCost(line.material_article_id)} FCFA` : "—"}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 w-20 text-right">
                    {(line.qty_per_unit * materialCost(line.material_article_id)).toFixed(2)} FCFA
                  </span>
                  <span className="text-xs text-slate-500 w-36 truncate">{materialName(line.material_article_id)}</span>
                  <button onClick={() => removeLine(index)} disabled={lines.length === 1} className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <ErrorBanner message={error} /> : null}
          {success ? <SuccessBanner message={success} /> : null}

          <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Coût de revient / unité :</span>
              <span className="font-medium text-slate-900">{totalCost.toFixed(2)} FCFA</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Prix de vente :</span>
              <span className="font-medium text-slate-900">{salePrice ?? "—"} FCFA</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Marge prévue :</span>
              <span className={`font-bold ${salePrice != null ? (salePrice - totalCost >= 0 ? "text-emerald-600" : "text-red-600") : "text-slate-900"}`}>
                {salePrice != null ? `${(salePrice - totalCost).toFixed(2)} FCFA` : "—"}
              </span>
            </div>
          </div>

          <Button onClick={save} disabled={pending}>
            <Save className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer la recette"}
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}