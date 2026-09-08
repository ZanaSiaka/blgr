import { LogOut, User as UserIcon } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Brand, NavLinks, type NavItem } from "@/components/nav";
import { cn } from "@/components/ui";
import type { User } from "@/lib/types";

export default function AppHeader({
  user,
  links,
  siteLabel,
}: {
  user: User;
  links: NavItem[];
  siteLabel: string;
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sticky top-0 z-10">
      <Brand />
      <div className="w-full xl:w-auto overflow-x-auto no-scrollbar py-0.5">
        <NavLinks links={links} />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
          <div className="leading-tight">
            <p className="font-semibold text-slate-900 text-[11px]">{user.full_name}</p>
            <p className="text-[10px] text-slate-500">{siteLabel}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Déconnexion"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
              "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all",
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </header>
  );
}