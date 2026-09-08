"use client";

import { RefreshCw } from "lucide-react";

import { Button, Card, PageShell } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell>
      <Card className="p-10 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-800">Une erreur est survenue</p>
        <p className="text-xs text-slate-500">
          Le chargement de cette page a échoué. Veuillez réessayer ou contacter l&apos;administrateur.
        </p>
        {error.digest ? <p className="text-[10px] text-slate-400">Référence : {error.digest}</p> : null}
        <Button onClick={reset}>
          <RefreshCw className="w-3.5 h-3.5" /> Réessayer
        </Button>
      </Card>
    </PageShell>
  );
}