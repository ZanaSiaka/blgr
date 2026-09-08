"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";

import { cn } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
}

export function NavLinks({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 min-w-max">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
              active
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-slate-900 text-white p-2 rounded-lg shrink-0">
        <Store className="w-5 h-5" />
      </div>
      <div>
        <a href="/dashboard" className="text-base font-semibold text-slate-900 leading-none">Boulangerie ERP</a>
      </div>
    </div>
  );
}