"use client";

import { useState } from "react";
import { Package, CheckCircle2, AlertTriangle, CreditCard, Wallet } from "lucide-react";

interface OrderItem {
    id: string;
    name: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
    unitPrice: number;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplier: string;
    date: string;
    amount: number;
    paymentMethod: "Virement Bancaire" | "Chèque" | "Espèces Dépôt";
    status: "EN_ATTENTE" | "LIVRE" | "ECART";
    items: OrderItem[];
}

const INITIAL_PURCHASES: PurchaseOrder[] = [
    {
        id: "po_1",
        poNumber: "BC-2026-0042",
        supplier: "Grands Moulins d'Abidjan (GMA)",
        date: "19/08/2026",
        amount: 1250000,
        paymentMethod: "Virement Bancaire",
        status: "LIVRE",
        items: [
            { id: "pi1", name: "Farine T55 (Sac 50kg)", orderedQty: 50, receivedQty: 50, unit: "sac", unitPrice: 21000 },
            { id: "pi2", name: "Farine T45 (Sac 50kg)", orderedQty: 10, receivedQty: 10, unit: "sac", unitPrice: 20000 },
        ],
    },
    {
        id: "po_2",
        poNumber: "BC-2026-0043",
        supplier: "Société Laitière de Côte d'Ivoire",
        date: "21/08/2026",
        amount: 480000,
        paymentMethod: "Chèque",
        status: "EN_ATTENTE",
        items: [
            { id: "pi3", name: "Beurre de tourage 82%", orderedQty: 100, receivedQty: 100, unit: "kg", unitPrice: 3800 },
            { id: "pi4", name: "Lait Entier Pasteurisé", orderedQty: 100, receivedQty: 100, unit: "L", unitPrice: 1000 },
        ],
    },
];

export default function AchatsModule() {
    const [purchases, setPurchases] = useState<PurchaseOrder[]>(INITIAL_PURCHASES);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrder>(INITIAL_PURCHASES[1]);
    const [isValidated, setIsValidated] = useState(false);
    const [depotTreasury, setDepotTreasury] = useState(15400000);

    // CALCUL DYNAMIQUE DU TOTAL REELLEMENT REÇU
    const realTotalAmount = selectedPo.items.reduce(
        (acc, item) => acc + item.receivedQty * item.unitPrice,
        0
    );

    const handleItemQtyChange = (itemId: string, qty: number) => {
        const updatedItems = selectedPo.items.map((item) =>
            item.id === itemId ? { ...item, receivedQty: qty } : item
        );
        setSelectedPo({ ...selectedPo, items: updatedItems });
    };

    const handleValidateDelivery = () => {
        const hasDiscrepancy = selectedPo.items.some(
            (item) => item.orderedQty !== item.receivedQty
        );

        const newStatus = hasDiscrepancy ? "ECART" : "LIVRE";

        const updatedPo: PurchaseOrder = {
            ...selectedPo,
            amount: realTotalAmount, // Mettre à jour le montant final
            status: newStatus,
        };

        // Déduire le montant RÉEL du solde de trésorerie
        setDepotTreasury((prev) => prev - realTotalAmount);

        setPurchases((prev) =>
            prev.map((p) => (p.id === selectedPo.id ? updatedPo : p))
        );
        setSelectedPo(updatedPo);

        setIsValidated(true);
        setTimeout(() => setIsValidated(false), 2200);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)] space-y-5">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Commandes & Décaissements Fournisseurs</h2>
                        <p className="text-xs text-slate-500">
                            Contrôlez les colis reçus au Dépôt Central et validez le règlement pour mise à jour du compte trésorerie.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <div>
                            <span className="text-[10px] text-slate-400 block leading-none">Trésorerie Dépôt Central</span>
                            <strong className="text-xs">{depotTreasury.toLocaleString("fr-FR")} FCFA</strong>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Liste des Bons de Commande */}
                    <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Bons de Commande (BC)
                        </h3>

                        <div className="space-y-2">
                            {purchases.map((po) => {
                                const isCurrent = selectedPo.id === po.id;
                                const displayAmount = isCurrent ? realTotalAmount : po.amount;

                                return (
                                    <button
                                        key={po.id}
                                        onClick={() => setSelectedPo(po)}
                                        className={`w-full text-left p-3 rounded-md border text-xs transition-all flex flex-col gap-1.5 ${isCurrent
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">{po.poNumber}</span>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${po.status === "EN_ATTENTE"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : po.status === "LIVRE"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {po.status === "EN_ATTENTE"
                                                    ? "A régler & Réceptionner"
                                                    : po.status === "LIVRE"
                                                        ? "Payé & Livré"
                                                        : "Écart de livraison"}
                                            </span>
                                        </div>
                                        <div className={`text-[11px] flex justify-between ${isCurrent ? "text-slate-300" : "text-slate-500"}`}>
                                            <span>{po.supplier}</span>
                                            <span className="font-bold">{displayAmount.toLocaleString("fr-FR")} FCFA</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pointage du Colis */}
                    <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
                        <div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Détail du Colis & Règlement
                                    </h3>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {selectedPo.poNumber} — <span className="text-xs font-normal text-slate-500">{selectedPo.date}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 block">Fournisseur : <strong className="text-slate-800">{selectedPo.supplier}</strong></span>
                                    <span className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                                        <CreditCard className="w-3 h-3" /> {selectedPo.paymentMethod}
                                    </span>
                                </div>
                            </div>

                            {/* Tableau */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                            <th className="pb-2">Article</th>
                                            <th className="pb-2 text-center">Commandé</th>
                                            <th className="pb-2 text-center">Reçu</th>
                                            <th className="pb-2 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedPo.items.map((item) => {
                                            const diff = item.receivedQty - item.orderedQty;
                                            const isPending = selectedPo.status === "EN_ATTENTE";

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 font-medium text-slate-800">
                                                        {item.name}
                                                    </td>
                                                    <td className="py-3 text-center font-semibold text-slate-700">
                                                        {item.orderedQty} {item.unit}
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
                                                                className="w-20 text-center text-xs bg-slate-50 border border-slate-200 rounded py-1 font-semibold text-slate-900 focus:outline-none"
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

                        {/* Validation & impact Trésorerie */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                            {selectedPo.status === "EN_ATTENTE" ? (
                                isValidated ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Colis réceptionné & Réglé ({realTotalAmount.toLocaleString("fr-FR")} FCFA déduits du compte Dépôt)
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleValidateDelivery}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <Package className="w-4 h-4" /> Réceptionner & Déduire {realTotalAmount.toLocaleString("fr-FR")} FCFA du Compte Dépôt
                                    </button>
                                )
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-slate-600 text-xs flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payé par {selectedPo.paymentMethod} & Entré au Stock Central
                                    </span>
                                    <span className="text-[11px] text-slate-400">Trésorerie à jour</span>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}