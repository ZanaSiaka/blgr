"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button, ErrorBanner } from "@/components/ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <label htmlFor="username" className="block text-xs font-medium text-slate-700 mb-1">
          Nom d&apos;utilisateur
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
        />
      </div>

      {state && !state.ok ? <ErrorBanner message={state.error.message} /> : null}

      <Button type="submit" disabled={pending} className="w-full">
        <LogIn className="w-3.5 h-3.5" /> {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}