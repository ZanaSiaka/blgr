"use client";

import { useState } from "react";
import { Plus, Trash2, Save, BookOpen, CheckCircle2 } from "lucide-react";

// Ingrédients du catalogue Dépôt Central
const RAW_MATERIALS = [
    { id: "rm1", name: "Farine T55", unit: "kg" },
    { id: "rm2", name: "Eau", unit: "L" },
    { id: "rm3", name: "Levure fraîche", unit: "kg" },
    { id: "rm4", name: "Sel", unit: "kg" },
    { id: "rm5", name: "Beurre de tourage", unit: "kg" },
    { id: "rm6", name: "Sucre", unit: "kg" },
    { id: "rm7", name: "Chocolat Pâtissier", unit: "kg" },
    { id: "rm8", name: "Lait", unit: "L" },
    { id: "rm9", name: "Œufs", unit: "unité" },
];

interface RecipeIngredient {
    materialId: string;
    qtyNeeded: number;
}

interface Recipe {
    id: string;
    name: string;
    category: string;
    yieldUnit: string;
    ingredients: RecipeIngredient[];
}

const INITIAL_RECIPES: Recipe[] = [
    {
        id: "rec_1",
        name: "Baguette Tradition",
        category: "Pain",
        yieldUnit: "1 pièce",
        ingredients: [
            { materialId: "rm1", qtyNeeded: 0.35 },
            { materialId: "rm2", qtyNeeded: 0.2 },
            { materialId: "rm3", qtyNeeded: 0.01 },
            { materialId: "rm4", qtyNeeded: 0.005 },
        ],
    },
    {
        id: "rec_2",
        name: "Croissant au beurre",
        category: "Viennoiserie",
        yieldUnit: "1 pièce",
        ingredients: [
            { materialId: "rm1", qtyNeeded: 0.08 },
            { materialId: "rm5", qtyNeeded: 0.04 },
            { materialId: "rm6", qtyNeeded: 0.01 },
            { materialId: "rm3", qtyNeeded: 0.003 },
        ],
    },
];

export default function RecipesModule() {
    const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(INITIAL_RECIPES[0]);
    const [isSuccess, setIsSuccess] = useState(false);

    // Formulaire de création / édition
    const [name, setName] = useState(selectedRecipe.name);
    const [category, setCategory] = useState(selectedRecipe.category);
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>(selectedRecipe.ingredients);

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setName(recipe.name);
        setCategory(recipe.category);
        setIngredients(recipe.ingredients);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { materialId: RAW_MATERIALS[0].id, qtyNeeded: 0.1 }]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const handleSaveRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedRecipe: Recipe = {
            ...selectedRecipe,
            name,
            category,
            ingredients,
        };

        setRecipes((prev) =>
            prev.map((r) => (r.id === selectedRecipe.id ? updatedRecipe : r))
        );
        setSelectedRecipe(updatedRecipe);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
    };

    const handleCreateNewRecipe = () => {
        const newRec: Recipe = {
            id: `rec_${Date.now()}`,
            name: "Nouvelle Recette",
            category: "Pain",
            yieldUnit: "1 pièce",
            ingredients: [{ materialId: RAW_MATERIALS[0].id, qtyNeeded: 0.1 }],
        };
        setRecipes([...recipes, newRec]);
        handleSelectRecipe(newRec);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)]">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Gestion des Nomenclatures (BOM / Recettes)</h2>
                        <p className="text-xs text-slate-500">
                            Définissez la composition unitaire exacte de chaque produit fini pour déduire automatiquement les stocks lors des sessions de production.
                        </p>
                    </div>
                    <button
                        onClick={handleCreateNewRecipe}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" /> Nouvelle Recette
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Liste des recettes existantes (4 Colonnes) */}
                    <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Catalogue des Recettes
                        </h3>
                        <div className="space-y-1.5">
                            {recipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleSelectRecipe(recipe)}
                                    className={`w-full text-left p-3 rounded-md border text-xs transition-all flex items-center justify-between ${selectedRecipe.id === recipe.id
                                            ? "border-slate-900 bg-slate-900 text-white font-medium"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{recipe.name}</span>
                                    </div>
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded ${selectedRecipe.id === recipe.id
                                                ? "bg-slate-800 text-slate-300"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {recipe.category}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editeur de nomenclature (8 Colonnes) */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Fiche Technique : <span className="text-slate-900 font-bold">{selectedRecipe.name}</span>
                            </h3>
                            <span className="text-[11px] text-slate-500">Base : 1 unité produite</span>
                        </div>

                        <form onSubmit={handleSaveRecipe} className="space-y-4">
                            {/* Info Produit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Nom du Produit Fini
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                                    >
                                        <option value="Pain">Pain</option>
                                        <option value="Viennoiserie">Viennoiserie</option>
                                        <option value="Pâtisserie">Pâtisserie</option>
                                        <option value="Sucrerie">Sucrerie / Confiserie</option>
                                    </select>
                                </div>
                            </div>

                            {/* Composition des ingrédients */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-semibold text-slate-700">Composants & Dosage (par unité)</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddIngredient}
                                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Ajouter un composant
                                    </button>
                                </div>

                                <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
                                    {ingredients.map((ing, index) => {
                                        const material = RAW_MATERIALS.find((m) => m.id === ing.materialId);
                                        return (
                                            <div key={index} className="p-3 bg-slate-50/50 flex items-center gap-3">
                                                {/* Sélecteur Matière Première */}
                                                <div className="flex-1">
                                                    <select
                                                        value={ing.materialId}
                                                        onChange={(e) => handleIngredientChange(index, "materialId", e.target.value)}
                                                        className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none"
                                                    >
                                                        {RAW_MATERIALS.map((mat) => (
                                                            <option key={mat.id} value={mat.id}>
                                                                {mat.name} ({mat.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Dosage */}
                                                <div className="w-32 flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        min="0.001"
                                                        value={ing.qtyNeeded}
                                                        onChange={(e) => handleIngredientChange(index, "qtyNeeded", Number(e.target.value))}
                                                        className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 font-semibold text-slate-900 text-right focus:outline-none"
                                                    />
                                                    <span className="text-xs text-slate-500 w-8">{material?.unit}</span>
                                                </div>

                                                {/* Bouton Supprimer */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredient(index)}
                                                    className="text-slate-400 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bouton de sauvegarde */}
                            <div className="pt-2">
                                {isSuccess ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Nomenclature sauvegardée avec succès !
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Save className="w-3.5 h-3.5" /> Enregistrer la Recette
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}