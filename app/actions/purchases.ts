"use server";

import { revalidatePath } from "next/cache";

import { apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { purchaseOrderSchema, receiveLinesSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { PurchaseOrder } from "@/lib/types";

export async function createPurchaseOrder(
  input: unknown,
  siteId: number,
): Promise<ActionResult<PurchaseOrder>> {
  const parsed = purchaseOrderSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const po = await apiPost<PurchaseOrder>(`/purchase-orders?site_id=${siteId}`, parsed.data);
    revalidatePath("/achats");
    return { ok: true, data: po };
  } catch (err) {
    return toActionResult(err);
  }

}

export async function receivePurchaseOrder(
  poId: number,
  input: unknown,
): Promise<ActionResult<PurchaseOrder>> {
  const parsed = receiveLinesSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const po = await apiPost<PurchaseOrder>(`/purchase-orders/${poId}/receive`, parsed.data);
    revalidatePath("/achats");
    revalidatePath("/stock-central");
    revalidatePath("/dashboard");
    return { ok: true, data: po };
  } catch (err) {
    return toActionResult(err);
  }
}