"use client";

import {
    TrendingUp,
    Store,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    PackageCheck,
    CheckCircle2
} from "lucide-react";

export default function DashboardModule() {
    return (
        <div className="p-6 bg-slate-50 min-h-[calc(100vh-75px)] space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Tableau de Bord Général</h2>
                        <p className="text-xs text-slate-500">
                            Supervision en temps réel des ventes, des transferts et des niveaux de stock multi-sites.
                        </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">
                        Mise à jour à l'instant
                    </span>
                </div>

                {/* 4 KPIs Clés */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-medium">Chiffre d'Affaires du Jour</span>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">1 485 000 FCFA</p>
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> +12.5% vs hier
                        </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-medium">Ventes en Boutiques</span>
                            <Store className="w-4 h-4 text-slate-700" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">3 Boutiques</p>
                        <span className="text-[11px] text-slate-500">
                            Riviera: 820k | Marcory: 665k
                        </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-medium">Transferts en Transit</span>
                            <Truck className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">2 Bons (BT)</p>
                        <span className="text-[11px] text-amber-700 font-medium">
                            En attente de réception
                        </span>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-medium">Alertes Stock / DLC</span>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">3 Articles</p>
                        <span className="text-[11px] text-red-600 font-medium">
                            Seuil critique au Dépôt
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Suivi des Ventes par Boutique (7 Colonnes) */}
                    <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Performance Réseau (Aujourd'hui)
                            </h3>
                            <span className="text-[11px] text-slate-500">3 sites actifs</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                                    <span>Boutique Riviera</span>
                                    <span className="font-bold">820 000 FCFA (55%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-slate-900 h-full w-[55%]"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                                    <span>Boutique Marcory</span>
                                    <span className="font-bold">665 000 FCFA (45%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-slate-700 h-full w-[45%]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Alertes Réapprovisionnement */}
                        <div className="pt-3 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-800 mb-2.5">Alertes Stock Critique</h4>
                            <div className="space-y-2">
                                <div className="p-2.5 bg-red-50 border border-red-100 rounded-md flex items-center justify-between text-xs">
                                    <span className="font-medium text-red-900">Farine T55 (Dépôt Central)</span>
                                    <span className="text-red-700 font-bold">Reste 150 kg (Seuil: 500 kg)</span>
                                </div>
                                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-md flex items-center justify-between text-xs">
                                    <span className="font-medium text-amber-900">Beurre de tourage (Boutique Riviera)</span>
                                    <span className="text-amber-800 font-bold">Reste 12 kg (Seuil: 20 kg)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flux d'Activités & Audit (5 Colonnes) */}
                    <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Activités Récentes
                            </h3>
                            <span className="text-[11px] text-slate-500">Flux réseau</span>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="flex gap-3">
                                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded h-fit">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Production de 120 Baguettes</p>
                                    <span className="text-[11px] text-slate-400">Boutique Marcory • Il y a 15 min</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="p-1.5 bg-blue-50 text-blue-700 rounded h-fit">
                                    <PackageCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Réception BT-2026-0798 validée</p>
                                    <span className="text-[11px] text-slate-400">Boutique Riviera • Il y a 42 min</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="p-1.5 bg-amber-50 text-amber-700 rounded h-fit">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Expédition BT-2026-0801 créée</p>
                                    <span className="text-[11px] text-slate-400">Dépôt Central vers Riviera • Il y a 1h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}