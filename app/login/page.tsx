import { Store } from "lucide-react";

import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-slate-900 text-white p-3 rounded-xl">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Boulangerie ERP</h1>
          <p className="text-xs text-slate-500">Connectez-vous pour accéder à la gestion</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}