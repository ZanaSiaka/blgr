"use client";

import { useState } from "react";
import { Truck, CheckCircle2, AlertTriangle, ArrowDownRight, PackageCheck } from "lucide-react";

interface TransferItem {
    id: string;
    name: string;
    unit: string;
    sentQty: number;
    receivedQty: number;
}

interface TransferNote {
    id: string;
    reference: string;
    date: string;
    sender: string;
    status: "EN_TRANSIT" | "VALIDE" | "ECART";
    items: TransferItem[];
}

const INITIAL_TRANSFERS: TransferNote[] = [
    {
        id: "bt_1",
        reference: "BT-2026-0801",
        date: "21/08/2026 - 08:30",
        sender: "Magasin Principal (Dépôt)",
        status: "EN_TRANSIT",
        items: [
            { id: "i1", name: "Farine T55", unit: "kg", sentQty: 200, receivedQty: 200 },
            { id: "i2", name: "Beurre de tourage", unit: "kg", sentQty: 25, receivedQty: 25 },
            { id: "i3", name: "Jus de Fruit 33cl", unit: "bouteille", sentQty: 48, receivedQty: 48 },
        ],
    },
    {
        id: "bt_2",
        reference: "BT-2026-0798",
        date: "20/08/2026 - 15:10",
        sender: "Magasin Principal (Dépôt)",
        status: "VALIDE",
        items: [
            { id: "i4", name: "Sucre Raffiné", unit: "kg", sentQty: 50, receivedQty: 50 },
            { id: "i5", name: "Levure fraîche", unit: "kg", sentQty: 10, receivedQty: 10 },
        ],
    },
];

export default function ReceptionModule() {
    const [transfers, setTransfers] = useState<TransferNote[]>(INITIAL_TRANSFERS);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferNote>(INITIAL_TRANSFERS[0]);
    const [isValidated, setIsValidated] = useState(false);

    // Mettre à jour la quantité reçue d'un article
    const handleItemQtyChange = (itemId: string, qty: number) => {
        const updatedItems = selectedTransfer.items.map((item) =>
            item.id === itemId ? { ...item, receivedQty: qty } : item
        );
        setSelectedTransfer({ ...selectedTransfer, items: updatedItems });
    };

    // Valider la réception du bon de transfert
    const handleValidateReception = () => {
        const hasDiscrepancy = selectedTransfer.items.some(
            (item) => item.sentQty !== item.receivedQty
        );

        const newStatus = hasDiscrepancy ? "ECART" : "VALIDE";

        const updatedTransfer: TransferNote = {
            ...selectedTransfer,
            status: newStatus,
        };

        setTransfers((prev) =>
            prev.map((t) => (t.id === selectedTransfer.id ? updatedTransfer : t))
        );
        setSelectedTransfer(updatedTransfer);

        setIsValidated(true);
        setTimeout(() => setIsValidated(false), 2200);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)]">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Réception des Transferts (Boutique)</h2>
                        <p className="text-xs text-slate-500">
                            Contrôlez les marchandises expédiées par le Dépôt Central, déclarez les manquants et validez l'entrée en stock local.
                        </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Envois en cours
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Liste des Bons de Transfert reçus (4 Colonnes) */}
                    <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Bons de Transfert (BT)
                        </h3>
                        <div className="space-y-2">
                            {transfers.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTransfer(t)}
                                    className={`w-full text-left p-3 rounded-md border text-xs transition-all flex flex-col gap-1.5 ${selectedTransfer.id === t.id
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">{t.reference}</span>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${t.status === "EN_TRANSIT"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : t.status === "VALIDE"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {t.status === "EN_TRANSIT"
                                                ? "En transit"
                                                : t.status === "VALIDE"
                                                    ? "Conforme"
                                                    : "Avec Écart"}
                                        </span>
                                    </div>
                                    <div className={`text-[11px] flex justify-between ${selectedTransfer.id === t.id ? "text-slate-300" : "text-slate-500"}`}>
                                        <span>{t.sender}</span>
                                        <span>{t.date}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Détail du bon et vérification des réceptions (8 Colonnes) */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
                        <div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Contrôle de Réception
                                    </h3>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {selectedTransfer.reference} — <span className="text-xs font-normal text-slate-500">{selectedTransfer.date}</span>
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500">
                                    Origine : <strong className="text-slate-800">{selectedTransfer.sender}</strong>
                                </span>
                            </div>

                            {/* Tableau de pointage des quantités */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                            <th className="pb-2">Article / Matière</th>
                                            <th className="pb-2 text-center">Quantité envoyée</th>
                                            <th className="pb-2 text-center">Quantité réellement reçue</th>
                                            <th className="pb-2 text-right">Écart / Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedTransfer.items.map((item) => {
                                            const diff = item.receivedQty - item.sentQty;
                                            const isPending = selectedTransfer.status === "EN_TRANSIT";

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 font-medium text-slate-800">
                                                        {item.name}
                                                    </td>
                                                    <td className="py-3 text-center font-semibold text-slate-700">
                                                        {item.sentQty} {item.unit}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        {isPending ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.receivedQty}
                                                                onChange={(e) =>
                                                                    handleItemQtyChange(item.id, Number(e.target.value))
                                                                }
                                                                className="w-20 text-center text-xs bg-slate-50 border border-slate-200 rounded py-1 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-slate-900">
                                                                {item.receivedQty} {item.unit}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        {diff === 0 ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> {diff > 0 ? `+${diff}` : diff} {item.unit}
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

                        {/* Zone d'action / Validation */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                            {selectedTransfer.status === "EN_TRANSIT" ? (
                                isValidated ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Réception enregistrée & Stock local mis à jour !
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleValidateReception}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <PackageCheck className="w-4 h-4" /> Valider la Réception & Intégrer au Stock
                                    </button>
                                )
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-slate-600 text-xs flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transfert clôturé et validé
                                    </span>
                                    <span className="text-[11px] text-slate-400">Stock mis à jour</span>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}