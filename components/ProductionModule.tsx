"use client";

import { useState } from "react";
import { Hammer, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

interface Ingredient {
    name: string;
    qtyNeeded: number;
    unit: string;
    stockAvailable: number;
}

interface Recipe {
    id: string;
    name: string;
    category: string;
    ingredients: Ingredient[];
}

const RECIPES: Recipe[] = [
    {
        id: "1",
        name: "Baguette Tradition",
        category: "Pain",
        ingredients: [
            { name: "Farine T55", qtyNeeded: 0.35, unit: "kg", stockAvailable: 150 },
            { name: "Eau", qtyNeeded: 0.2, unit: "L", stockAvailable: 500 },
            { name: "Levure fraîche", qtyNeeded: 0.01, unit: "kg", stockAvailable: 12 },
            { name: "Sel", qtyNeeded: 0.005, unit: "kg", stockAvailable: 25 },
        ],
    },
    {
        id: "2",
        name: "Croissant au beurre",
        category: "Viennoiserie",
        ingredients: [
            { name: "Farine T55", qtyNeeded: 0.08, unit: "kg", stockAvailable: 150 },
            { name: "Beurre de tourage", qtyNeeded: 0.04, unit: "kg", stockAvailable: 18 },
            { name: "Sucre", qtyNeeded: 0.01, unit: "kg", stockAvailable: 40 },
            { name: "Levure fraîche", qtyNeeded: 0.003, unit: "kg", stockAvailable: 12 },
        ],
    },
    {
        id: "3",
        name: "Éclair au chocolat",
        category: "Pâtisserie",
        ingredients: [
            { name: "Farine T55", qtyNeeded: 0.04, unit: "kg", stockAvailable: 150 },
            { name: "Chocolat Patissier", qtyNeeded: 0.03, unit: "kg", stockAvailable: 8 },
            { name: "Lait", qtyNeeded: 0.05, unit: "L", stockAvailable: 30 },
            { name: "Œufs", qtyNeeded: 0.5, unit: "unité", stockAvailable: 120 },
        ],
    },
];

export default function ProductionModule() {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(RECIPES[0]);
    const [quantity, setQuantity] = useState<number>(50);
    const [loss, setLoss] = useState<number>(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleProductionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
        }, 2000);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)]">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Déclaration de Production</h2>
                        <p className="text-xs text-slate-500">
                            Transformation des matières premières en produits finis selon la recette définie.
                        </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
                        Atelier Bakehouse
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Formulaire de saisie (5 Colonnes) */}
                    <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Ordre de fabrication
                        </h3>

                        <form onSubmit={handleProductionSubmit} className="space-y-4">
                            {/* Choix recette */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Produit à fabriquer
                                </label>
                                <select
                                    value={selectedRecipe.id}
                                    onChange={(e) => {
                                        const found = RECIPES.find((r) => r.id === e.target.value);
                                        if (found) setSelectedRecipe(found);
                                    }}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                                >
                                    {RECIPES.map((recipe) => (
                                        <option key={recipe.id} value={recipe.id}>
                                            [{recipe.category}] {recipe.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantité produite */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Quantité conforme
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Pertes / Ratés (unités)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={loss}
                                        onChange={(e) => setLoss(Number(e.target.value))}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Récapitulatif rapide */}
                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-xs space-y-1">
                                <div className="flex justify-between text-slate-600">
                                    <span>Total unités lancées :</span>
                                    <span className="font-medium text-slate-900">{quantity + loss}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Destination :</span>
                                    <span className="font-medium text-slate-900">Stock Produit Fini</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            {isSuccess ? (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                                    <CheckCircle2 className="w-4 h-4" /> Production enregistrée & Stock déduit !
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <Hammer className="w-3.5 h-3.5" /> Valider la Production
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Simulation déduction des MP (7 Colonnes) */}
                    <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Matières Premières requises (Nomenclature)
                                </h3>
                                <span className="text-[11px] text-slate-500">
                                    Calcul pour {quantity + loss} unités
                                </span>
                            </div>

                            {/* Table des ingrédients */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                            <th className="pb-2">Ingrédient</th>
                                            <th className="pb-2">Dose / Unité</th>
                                            <th className="pb-2">Consommation totale</th>
                                            <th className="pb-2 text-right">Stock dispo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedRecipe.ingredients.map((ing) => {
                                            const totalNeeded = (ing.qtyNeeded * (quantity + loss)).toFixed(2);
                                            const isShortage = Number(totalNeeded) > ing.stockAvailable;

                                            return (
                                                <tr key={ing.name} className="hover:bg-slate-50/50">
                                                    <td className="py-2.5 font-medium text-slate-800">{ing.name}</td>
                                                    <td className="py-2.5 text-slate-500">
                                                        {ing.qtyNeeded} {ing.unit}
                                                    </td>
                                                    <td className="py-2.5 font-semibold text-slate-900">
                                                        {totalNeeded} {ing.unit}
                                                    </td>
                                                    <td className="py-2.5 text-right">
                                                        {isShortage ? (
                                                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                                <AlertTriangle className="w-3 h-3" /> {ing.stockAvailable} {ing.unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-600">
                                                                {ing.stockAvailable} {ing.unit}
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

                        {/* Note informative bas de carte */}
                        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                Déduction automatique à la validation
                            </span>
                            <span>
                                Recette : <strong className="text-slate-700">{selectedRecipe.name}</strong>
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}