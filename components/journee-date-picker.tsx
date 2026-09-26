"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JourneeDatePicker({
  siteId,
  initialDate,
}: {
  siteId: number;
  initialDate: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const apply = () => router.push(`/rapports/journee?site_id=${siteId}&date=${date}`);
  return (
    <div className="flex items-end gap-2">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Date de la fiche</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
      </div>
      <button onClick={apply} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-medium">
        Charger
      </button>
    </div>
  );
}