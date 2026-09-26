import "server-only";
import { getSession } from "@/lib/auth";
import type { ApiErrorShape } from "@/lib/types";

const API_BASE_URL = process.env.API_BASE_URL ?? "https://backend-boulangerie.vercel.app";

export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown[];

  constructor(status: number, error: ApiErrorShape) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.status = status;
    this.details = error.details ?? [];
  }
}

export function errorToMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Une erreur inattendue est survenue";
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let body: { error?: ApiErrorShape } = {};
    try {
      body = (await response.json()) as { error?: ApiErrorShape };
    } catch {
      body = {};
    }
    throw new ApiError(
      response.status,
      body.error ?? { code: "HTTP_ERROR", message: `Erreur HTTP ${response.status}` },
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}

export const API_BASE = API_BASE_URL;