"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import type { Site } from "@/lib/types";

export default function SitePicker({ sites, path }: { sites: Site[]; path: string }) {
  const router = useRouter();
  return (
    <div className="p-6 bg-slate-50 min-h-[calc(100vh-57px)]">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3 mt-16">
        <div className="flex items-center gap-2 text-slate-700">
          <Building2 className="w-5 h-5 text-slate-500" />
          <h2 className="text-sm font-semibold">Sélectionnez un site</h2>
        </div>
        <p className="text-xs text-slate-500">Votre profil n&apos;est pas rattaché à une boutique.</p>
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) router.push(`${path}?site_id=${e.target.value}`);
          }}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900"
        >
          <option value="">Choisir une boutique...</option>
          {sites.filter((site) => site.kind === "BOUTIQUE" && site.is_active).map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}