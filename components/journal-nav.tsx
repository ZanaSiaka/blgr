"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const JOURNAL_SECTIONS = [
  { id: "production", label: "Production" },
  { id: "rafraichissement", label: "Rafraîchissement" },
  { id: "patisserie", label: "Pâtisserie" },
  { id: "glacier", label: "Glacier" },
  { id: "recap", label: "Récapitulatif" },
] as const;

export default function JournalNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
      <Link
        href={basePath}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          pathname === basePath ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Accueil
      </Link>
      {JOURNAL_SECTIONS.map((s) => {
        const href = `${basePath}/${s.id}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={s.id}
            href={href}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
