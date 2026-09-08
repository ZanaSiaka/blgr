import { clsx, type ClassValue } from "clsx";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
        {subtitle ? <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const styles = {
    primary: "bg-slate-900 hover:bg-slate-800 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const styles = {
    slate: "bg-slate-200 text-slate-700",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium", styles)}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub ? <div className="text-[11px]">{sub}</div> : null}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-slate-200 animate-pulse rounded", className)} />;
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="p-8 text-center text-slate-400 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{title}</p>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-md text-xs font-medium">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md text-xs font-medium">
      {message}
    </div>
  );
}

export function FormFeedback({
  state,
}: {
  state: { ok: boolean; error?: { message: string }; successMessage?: string } | null;
}) {
  if (!state) return null;
  if (state.ok) {
    return <SuccessBanner message={state.successMessage ?? "Opération réussie"} />;
  }
  return <ErrorBanner message={state.error?.message ?? "Une erreur est survenue"} />;
}

export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {badge}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 bg-slate-50 min-h-[calc(100vh-57px)]">
      <div className="max-w-6xl mx-auto space-y-5">{children}</div>
    </div>
  );
}

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}