"use server";

import { redirect } from "next/navigation";

import { clearSession, setSession } from "@/lib/auth";
import { API_BASE } from "@/lib/api";
import { loginSchema, validationError, type ActionResult } from "@/lib/validators";
import type { User } from "@/lib/types";

export type LoginState = ActionResult<User> | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: parsed.data.username,
        password: parsed.data.password,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      return { ok: false, error: { code: "UNAUTHORIZED", message: "Identifiants invalides" } };
    }
    const body = (await response.json()) as { access_token: string; user: User };
    await setSession({ token: body.access_token, user: body.user });
  } catch {
    return {
      ok: false,
      error: { code: "NETWORK", message: "Impossible de joindre le serveur. Vérifiez le backend." },
    };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}