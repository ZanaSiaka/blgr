"use server";

import { revalidatePath } from "next/cache";

import { apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { closureCloseSchema, saleSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { Closure, SaleTicket } from "@/lib/types";

export async function createSale(
  input: unknown,
  idempotencyKey: string,
): Promise<ActionResult<SaleTicket>> {
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const ticket = await apiPost<SaleTicket>("/pos/sales", parsed.data, {
      "Idempotency-Key": idempotencyKey,
    });
    revalidatePath("/caisse");
    revalidatePath("/dashboard");
    return { ok: true, data: ticket };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function openClosure(input: unknown): Promise<ActionResult<Closure>> {
  const siteId = Number((input as { site_id?: number })?.site_id ?? 0);
  try {
    const closure = await apiPost<Closure>(
      `/pos/closures${siteId ? `?site_id=${siteId}` : ""}`,
      {},
    );
    revalidatePath("/clotures");
    return { ok: true, data: closure };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function closeClosure(
  closureId: number,
  input: unknown,
): Promise<ActionResult<Closure>> {
  const parsed = closureCloseSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const closure = await apiPost<Closure>(`/pos/closures/${closureId}/close`, parsed.data);
    revalidatePath("/clotures");
    revalidatePath("/caisse");
    return { ok: true, data: closure };
  } catch (err) {
    return toActionResult(err);
  }
}