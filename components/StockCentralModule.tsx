"use client";

import { useState } from "react";
import { Package, AlertTriangle, ArrowUpDown, Search, Layers, RefreshCw } from "lucide-react";

interface StockItem {
    id: string;
    code: string;
    name: string;
    category: "Matière Première" | "Produit Fini" | "Consommable";
    quantity: number;
    minThreshold: number;
    unit: string;
    unitPrice: number;
    lastRestock: string;
}

const INITIAL_STOCK: StockItem[] = [
    { id: "st1", code: "MAT-001", name: "Farine T55", category: "Matière Première", quantity: 1200, minThreshold: 500, unit: "kg", unitPrice: 420, lastRestock: "18/08/2026" },
    { id: "st2", code: "MAT-002", name: "Sucre Raffiné", category: "Matière Première", quantity: 450, minThreshold: 200, unit: "kg", unitPrice: 650, lastRestock: "15/08/2026" },
    { id: "st3", code: "MAT-003", name: "Beurre de tourage 82%", category: "Matière Première", quantity: 180, minThreshold: 100, unit: "kg", unitPrice: 3800, lastRestock: "19/08/2026" },
    { id: "st4", code: "MAT-004", name: "Levure fraîche", category: "Matière Première", quantity: 35, minThreshold: 50, unit: "kg", unitPrice: 1200, lastRestock: "12/08/2026" },
    { id: "st5", code: "PRD-001", name: "Jus de Fruit Pasteurisé 33cl", category: "Produit Fini", quantity: 320, minThreshold: 100, unit: "bouteille", unitPrice: 500, lastRestock: "20/08/2026" },
    { id: "st6", code: "CNS-001", name: "Sac Baguette Kraft", category: "Consommable", quantity: 1500, minThreshold: 1000, unit: "unité", unitPrice: 15, lastRestock: "10/08/2026" },
];

export default function StockCentralModule() {
    const [items, setItems] = useState<StockItem[]>(INITIAL_STOCK);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("TOUS");

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "TOUS" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalValue = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const lowStockCount = items.filter((item) => item.quantity <= item.minThreshold).length;

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)] space-y-5">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Gestion du Stock Central</h2>
                        <p className="text-xs text-slate-500">
                            Inventaire global au Magasin Principal, valorisation et suivi des seuils de réapprovisionnement.
                        </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Dépôt Central
                    </span>
                </div>

                {/* Resumé Métriques Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Valeur Total du Stock</span>
                        <p className="text-xl font-bold text-slate-900">{totalValue.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Nombre de Références</span>
                        <p className="text-xl font-bold text-slate-900">{items.length} Articles</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Alertes Réapprovisionnement</span>
                        <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                            {lowStockCount} Référence(s) critique(s)
                        </p>
                    </div>
                </div>

                {/* Filtres & Recherche */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {["TOUS", "Matière Première", "Produit Fini", "Consommable"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${selectedCategory === cat
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tableau d'Inventaire */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Article</th>
                                <th className="p-3">Catégorie</th>
                                <th className="p-3 text-right">Prix Unitaire HT</th>
                                <th className="p-3 text-center">Quantité en Stock</th>
                                <th className="p-3 text-right">Valeur Stock</th>
                                <th className="p-3 text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item) => {
                                const isCritical = item.quantity <= item.minThreshold;
                                const stockVal = item.quantity * item.unitPrice;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-all">
                                        <td className="p-3 font-mono font-medium text-slate-500">{item.code}</td>
                                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                                        <td className="p-3 text-slate-600">{item.category}</td>
                                        <td className="p-3 text-right font-medium text-slate-700">{item.unitPrice.toLocaleString("fr-FR")} FCFA</td>
                                        <td className="p-3 text-center font-bold text-slate-900">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-900">{stockVal.toLocaleString("fr-FR")} FCFA</td>
                                        <td className="p-3 text-center">
                                            {isCritical ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                                                    <AlertTriangle className="w-3 h-3" /> Seuil atteint ({item.minThreshold} {item.unit})
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800">
                                                    Optimal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}