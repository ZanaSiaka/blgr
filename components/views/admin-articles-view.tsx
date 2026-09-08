"use client";

import { useMemo, useState } from "react";
import { Package, Pencil, Search, X } from "lucide-react";

import { createArticle, updateArticle } from "@/app/actions/admin";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import { TYPE_LABEL } from "@/components/views/labels";
import type { Article, ArticleType, Category, Unit } from "@/lib/types";

export default function AdminArticlesView({
  articles,
  categories,
  units,
}: {
  articles: Article[];
  categories: Category[];
  units: Unit[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const [unitId, setUnitId] = useState<number>(units[0]?.id ?? 0);
  const [type, setType] = useState<ArticleType>("RAW_MATERIAL");
  const [forSale, setForSale] = useState(false);
  const [costPrice, setCostPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [minStock, setMinStock] = useState("0");
  const [perishable, setPerishable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const { run, pending, error, success } = useMutate();

  const filtered = useMemo(
    () =>
      articles.filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "TOUS" || a.type === typeFilter;
        return matchSearch && matchType;
      }),
    [articles, search, typeFilter],
  );

  const editing = articles.find((a) => a.id === editingId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setCategoryId(categories[0]?.id ?? 0);
    setUnitId(units[0]?.id ?? 0);
    setType("RAW_MATERIAL");
    setForSale(false);
    setCostPrice("");
    setSalePrice("");
    setMinStock("0");
    setPerishable(false);
    setIsActive(true);
  };

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setName(article.name);
    setCategoryId(article.category.id);
    setUnitId(article.unit.id);
    setType(article.type);
    setForSale(article.for_sale);
    setCostPrice(article.cost_price == null ? "" : String(article.cost_price));
    setSalePrice(article.sale_price == null ? "" : String(article.sale_price));
    setMinStock(String(article.min_stock));
    setPerishable(article.perishable);
    setIsActive(article.is_active);
  };

  const submit = () => {
    const payload = {
      name,
      category_id: categoryId,
      unit_id: unitId,
      type,
      for_sale: forSale,
      cost_price: costPrice === "" ? null : Number(costPrice),
      sale_price: salePrice === "" ? null : Number(salePrice),
      min_stock: Number(minStock),
      perishable,
      ...(editingId !== null ? { is_active: isActive } : {}),
    };
    if (editingId === null) {
      run(() => createArticle(payload).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
    } else {
      run(() => updateArticle(editingId, payload).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
    }
  };

  const toggleActive = (article: Article) => {
    run(() =>
      updateArticle(article.id, { is_active: !article.is_active }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
    );
  };

  return (
    <PageShell>
      <PageHeader title="Matières & Produits" subtitle="Créer et modifier les matières premières, consommables et produits" />

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input type="text" placeholder="Rechercher par nom ou code..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["TOUS", "RAW_MATERIAL", "CONSUMABLE", "FINISHED_GOOD", "RESALE_GOOD"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${typeFilter === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {t === "TOUS" ? "Tous" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <CardHeader
          title={editingId === null ? "Nouvel article" : `Modifier ${editing?.name ?? ""}`}
          right={
            editingId !== null ? (
              <Button variant="ghost" onClick={openCreate}>
                <X className="w-3.5 h-3.5" /> Annuler
              </Button>
            ) : null
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as ArticleType)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {(Object.keys(TYPE_LABEL) as ArticleType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Catégorie</label>
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Unité</label>
            <select value={unitId} onChange={(e) => setUnitId(Number(e.target.value))} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prix achat (FCFA)</label>
            <input type="number" min={0} value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prix vente (FCFA)</label>
            <input type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Seuil min</label>
            <input type="number" min={0} value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right" />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} className="accent-slate-900" /> Vendable
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={perishable} onChange={(e) => setPerishable(e.target.checked)} className="accent-slate-900" /> Périssable
            </label>
            {editingId !== null ? (
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-slate-900" /> Actif
              </label>
            ) : null}
            <Button onClick={submit} disabled={pending || !name}>
              <Package className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
        {error ? <ErrorBanner message={error} /> : null}
        {success ? <SuccessBanner message={success} /> : null}
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Type</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3 text-right">Prix achat</th>
              <th className="p-3 text-right">Prix vente</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((article) => (
              <tr key={article.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-mono text-slate-500">{article.code}</td>
                <td className="p-3 font-semibold text-slate-900">{article.name}</td>
                <td className="p-3 text-slate-600">{TYPE_LABEL[article.type]}</td>
                <td className="p-3 text-slate-600">{article.category.name}</td>
                <td className="p-3 text-right text-slate-700">{article.cost_price ?? "—"}</td>
                <td className="p-3 text-right text-slate-700">{article.sale_price ?? "—"}</td>
                <td className="p-3 text-center">
                  <Badge tone={article.is_active ? "green" : "red"}>{article.is_active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button variant="ghost" onClick={() => openEdit(article)}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </Button>
                  <Button variant="ghost" onClick={() => toggleActive(article)}>
                    {article.is_active ? "Désactiver" : "Activer"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}