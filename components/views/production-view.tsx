"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Hammer } from "lucide-react";

import { declareProduction } from "@/app/actions/production";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Recipe, StockItem } from "@/lib/types";

export default function ProductionView({
  recipes,
  stock,
  siteName,
  siteId,
}: {
  recipes: Recipe[];
  stock: StockItem[];
  siteName: string;
  siteId: number;
}) {
  const [recipeId, setRecipeId] = useState<number>(recipes[0]?.id ?? 0);
  const [conforming, setConforming] = useState(50);
  const [loss, setLoss] = useState(0);
  const { run, pending, error, success } = useMutate();

  const recipe = recipes.find((r) => r.id === recipeId) ?? null;
  const launched = conforming + loss;
  const stockOf = (articleId: number) => stock.find((s) => s.article_id === articleId)?.qty ?? 0;
  const totalCost = recipe
    ? recipe.lines.reduce((acc, line) => acc + (line.cost_price ?? 0) * line.qty_per_unit * launched, 0)
    : 0;
  const forecastMargin = recipe ? (recipe.article_sale_price ?? 0) * conforming - totalCost : 0;

  const submit = () => {
    run(() =>
      declareProduction({ recipe_id: recipeId, conforming_qty: conforming, loss_qty: loss }, siteId).then(
        (result) => ({ ok: result.ok, error: result.ok ? undefined : result.error }),
      ),
    );
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Déclaration de Production</h2>
          <p className="text-xs text-slate-500">Transformation des matières premières en produits finis selon la recette</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">{siteName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5 p-5 space-y-4">
          <CardHeader title="Ordre de fabrication" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Produit à fabriquer</label>
              <select
                value={recipeId}
                onChange={(e) => setRecipeId(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>[{r.article_name}] {r.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quantité conforme</label>
                <input
                  type="number"
                  min={1}
                  value={conforming}
                  onChange={(e) => setConforming(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pertes / ratés</label>
                <input
                  type="number"
                  min={0}
                  value={loss}
                  onChange={(e) => setLoss(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Unités lancées :</span>
                <span className="font-medium text-slate-900">{launched}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Destination :</span>
                <span className="font-medium text-slate-900">Stock produit fini</span>
              </div>
            </div>

            {error ? <ErrorBanner message={error} /> : null}
            {success ? <SuccessBanner message={success} /> : null}
            <Button onClick={submit} disabled={pending || !recipe}>
              <Hammer className="w-3.5 h-3.5" /> {pending ? "Validation..." : "Valider la production"}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-7 p-5 space-y-4">
          <CardHeader
            title="Matières premières requises (nomenclature)"
            subtitle={`Calcul pour ${launched} unités`}
          />
          {recipe === null ? (
            <p className="text-xs text-slate-400">Aucune recette disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2">Ingrédient</th>
                    <th className="pb-2">Dose / unité</th>
                    <th className="pb-2">Consommation</th>
                    <th className="pb-2 text-right">Coût</th>
                    <th className="pb-2 text-right">Stock dispo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipe.lines.map((line) => {
                    const needed = line.qty_per_unit * launched;
                    const available = stockOf(line.material_article_id);
                    const shortage = needed > available;
                    const lineCost = (line.cost_price ?? 0) * needed;
                    return (
                      <tr key={line.material_article_id}>
                        <td className="py-2.5 font-medium text-slate-800">{line.material_name}</td>
                        <td className="py-2.5 text-slate-500">{line.qty_per_unit}</td>
                        <td className="py-2.5 font-semibold text-slate-900">{needed.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-700">{lineCost.toFixed(0)} FCFA</td>
                        <td className="py-2.5 text-right">
                          {shortage ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              <AlertTriangle className="w-3 h-3" /> {available}
                            </span>
                          ) : (
                            <span className="text-slate-600">{available}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="space-y-1">
              <p>Coût total de l&apos;ordre : <strong className="text-slate-800">{totalCost.toFixed(0)} FCFA</strong></p>
              <p>
                Marge prévue :{" "}
                <strong className={forecastMargin >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {forecastMargin.toFixed(0)} FCFA
                </strong>
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="flex items-center justify-end gap-1">
                <ArrowRight className="w-3 h-3" /> Déduction automatique à la validation
              </span>
              {recipe ? <Badge tone="blue">{recipe.name}</Badge> : null}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}