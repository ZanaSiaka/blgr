"use client";

import { Store, Building2 } from "lucide-react";

interface HeaderProps {
    currentSite: string;
    setCurrentSite: (site: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Header({ currentSite, setCurrentSite, activeTab, setActiveTab }: HeaderProps) {
    const isDepot = currentSite === "depot_central";

    // Retrait définitif de l'onglet Achats / Fournisseurs
    const tabs = isDepot
        ? [
            { id: "dashboard", label: "Dashboard Global" },
            { id: "transferts", label: "Dispatching (Envois)" },
            { id: "recettes", label: "Nomenclatures (BOM)" },
            { id: "stock_central", label: "Stock Central" },
        ]
        : [
            { id: "pos", label: "Caisse (POS)" },
            { id: "reception", label: "Réception Transferts" },
            { id: "production", label: "Production Boutique" },
            { id: "stock_local", label: "Stock Boutique" },
        ];

    const handleSiteChange = (site: string) => {
        setCurrentSite(site);
        setActiveTab(site === "depot_central" ? "dashboard" : "pos");
    };

    return (
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Brand & Infos */}
            <div className="flex items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white p-2 rounded-lg shrink-0">
                        <Store className="w-5 h-5" />
                    </div>
                    
                    <div>
                        <h1 className="text-base font-semibold text-slate-900 leading-none">Boulangerie ERP</h1>
                        <span className="text-xs text-slate-500">
                            {isDepot ? "Magasin Principal / Direction" : "Boutique de Vente & Production"}
                        </span>
                    </div>
                </div>

                {/* Sélecteur sur petit écran */}
                <div className="flex xl:hidden items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <select
                        value={currentSite}
                        onChange={(e) => handleSiteChange(e.target.value)}
                        className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer max-w-32.5 truncate"
                    >
                        <option value="depot_central">Dépôt Central</option>
                        <option value="boutique_1"> Riviera</option>
                        <option value="boutique_2"> Marcory</option>
                    </select>
                </div>
            </div>

            {/* Navigation responsive avec scroll horizontal propre */}
            <div className="w-full xl:w-auto overflow-x-auto no-scrollbar py-0.5">
                <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Sélecteur de site pour desktop */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs shrink-0">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-medium">Site actif :</span>
                <select
                    value={currentSite}
                    onChange={(e) => handleSiteChange(e.target.value)}
                    className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="depot_central">Dépôt Central (Mère)</option>
                    <option value="boutique_1">Boutique Riviera (Fille)</option>
                    <option value="boutique_2">Boutique Marcory (Fille)</option>
                </select>
            </div>
        </header>
    );
}