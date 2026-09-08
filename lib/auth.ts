import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session-constants";
import type { User } from "@/lib/types";

export { SESSION_COOKIE };

export interface Session {
  token: string;
  user: User;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.token || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Session requise");
  }
  return session;
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function canAccessSite(user: User, siteId: number | null): boolean {
  if (user.role === "ADMIN" || user.role === "RESP_DEPOT") return true;
  return user.site_id === siteId;
}