"use client";

import { useState } from "react";
import { Send, Plus, Trash2, Truck, CheckCircle2 } from "lucide-react";

// Stock disponible au Dépôt Central
const DEPOT_STOCK = [
    { id: "ds1", name: "Farine T55", category: "Matière Première", unit: "kg", available: 1200 },
    { id: "ds2", name: "Sucre Raffiné", category: "Matière Première", unit: "kg", available: 450 },
    { id: "ds3", name: "Beurre de tourage", category: "Matière Première", unit: "kg", available: 180 },
    { id: "ds4", name: "Levure fraîche", category: "Matière Première", unit: "kg", available: 60 },
    { id: "ds5", name: "Jus de Fruit 33cl", category: "Produit en l'état", unit: "bouteille", available: 320 },
    { id: "ds6", name: "Emballage Sac Baguette", category: "Consommable", unit: "paquet", available: 500 },
];

interface TransferLine {
    articleId: string;
    qtyToSend: number;
}

export default function TransferModule() {
    const [destination, setDestination] = useState("boutique_1");
    const [lines, setLines] = useState<TransferLine[]>([
        { articleId: DEPOT_STOCK[0].id, qtyToSend: 100 },
    ]);
    const [isSent, setIsSent] = useState(false);

    const handleAddLine = () => {
        setLines([...lines, { articleId: DEPOT_STOCK[0].id, qtyToSend: 10 }]);
    };

    const handleRemoveLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const handleLineChange = (index: number, field: keyof TransferLine, value: string | number) => {
        const updated = [...lines];
        updated[index] = { ...updated[index], [field]: value };
        setLines(updated);
    };

    const handleSubmitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSent(true);
        setTimeout(() => {
            setIsSent(false);
            // Réinitialiser le formulaire
            setLines([{ articleId: DEPOT_STOCK[0].id, qtyToSend: 10 }]);
        }, 2200);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)]">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Dispatching & Envoi de Transfert</h2>
                        <p className="text-xs text-slate-500">
                            Préparez et expédiez les matières premières et marchandises depuis le Magasin Principal vers les boutiques de vente.
                        </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Magasin Principal (Dépôt)
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Formulaire de création de BT (8 Colonnes) */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Nouveau Bon de Transfert (BT)
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">Ref : BT-2026-0802</span>
                        </div>

                        <form onSubmit={handleSubmitTransfer} className="space-y-5">
                            {/* Destination */}
                            <div className="max-w-md">
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Boutique Destinataire
                                </label>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                                >
                                    <option value="boutique_1">Boutique Riviera</option>
                                    <option value="boutique_2">Boutique Marcory</option>
                                </select>
                            </div>

                            {/* Lignes d'articles à envoyer */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-semibold text-slate-700">Articles & Quantités à expédier</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                                    </button>
                                </div>

                                <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
                                    {lines.map((line, index) => {
                                        const article = DEPOT_STOCK.find((a) => a.id === line.articleId);
                                        const isOverStock = article ? line.qtyToSend > article.available : false;

                                        return (
                                            <div key={index} className="p-3 bg-slate-50/50 flex items-center gap-3">
                                                {/* Sélecteur Article */}
                                                <div className="flex-1">
                                                    <select
                                                        value={line.articleId}
                                                        onChange={(e) => handleLineChange(index, "articleId", e.target.value)}
                                                        className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none"
                                                    >
                                                        {DEPOT_STOCK.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                [{item.category}] {item.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Quantité d'envoi */}
                                                <div className="w-36 flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={article?.available}
                                                        value={line.qtyToSend}
                                                        onChange={(e) => handleLineChange(index, "qtyToSend", Number(e.target.value))}
                                                        className={`w-full text-xs bg-white border rounded px-2.5 py-1.5 font-semibold text-right focus:outline-none ${isOverStock ? "border-red-500 text-red-600" : "border-slate-200 text-slate-900"
                                                            }`}
                                                    />
                                                    <span className="text-xs text-slate-500 w-12">{article?.unit}</span>
                                                </div>

                                                {/* Bouton Supprimer */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLine(index)}
                                                    disabled={lines.length === 1}
                                                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Submit */}
                            <div className="pt-2">
                                {isSent ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Bon de transfert expédié ! En attente de réception en boutique.
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Valider & Expédier le Transfert
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Consultation du Stock Central Disponible (4 Colonnes) */}
                    <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Stock Dépôt Disponible
                        </h3>
                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
                            {DEPOT_STOCK.map((item) => (
                                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <span className="text-[10px] text-slate-400">{item.category}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                        {item.available} {item.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}