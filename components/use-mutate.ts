"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export interface MutationResult {
  ok: boolean;
  error?: { message: string };
}

export function useMutate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const run = (action: () => Promise<MutationResult>) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setSuccess("Opération réussie");
        router.refresh();
      } else {
        setError(result.error?.message ?? "Une erreur est survenue");
      }
    });
  };

  return { run, pending, error, success };
}