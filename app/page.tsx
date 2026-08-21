"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PosModule from "@/components/PosModule";
import ProductionModule from "@/components/ProductionModule";
import RecipesModule from "@/components/RecipeModule";
import ReceptionModule from "@/components/ReceptionModule";
import DashboardModule from "@/components/DashboardModule";
import TransferModule from "@/components/TransfertModule";
import StockCentralModule from "@/components/StockCentralModule";
import AchatsModule from "@/components/AchatModule";

export default function Home() {
  const [currentSite, setCurrentSite] = useState("depot_central");
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Header
        currentSite={currentSite}
        setCurrentSite={setCurrentSite}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1">
        {/* Vues Dépôt Central / Admin / Direction */}
        {activeTab === "dashboard" && <DashboardModule />}
        {/* {activeTab === "achats" && <AchatsModule />} */}
        {activeTab === "transferts" && <TransferModule />}
        {activeTab === "recettes" && <RecipesModule />}
        {activeTab === "stock_central" && <StockCentralModule />}

        {/* Vues Boutique Fille (Riviera / Marcory) */}
        {activeTab === "pos" && <PosModule />}
        {activeTab === "reception" && <ReceptionModule />}
        {activeTab === "production" && <ProductionModule />}

        {/* Fallback */}
        {!["dashboard", "achats", "transferts", "recettes", "stock_central", "pos", "reception", "production"].includes(activeTab) && (
          <div className="p-8 text-center text-slate-500 font-medium text-xs">
            Le module <span className="font-bold uppercase text-slate-800">{activeTab}</span> est prêt à être chargé.
          </div>
        )}
      </main>
    </div>
  );
}