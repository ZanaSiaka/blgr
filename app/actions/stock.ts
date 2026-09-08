"use server";

import { revalidatePath } from "next/cache";

import { apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { adjustmentSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { Movement } from "@/lib/types";

export async function adjustStock(input: unknown, siteId: number): Promise<ActionResult<Movement>> {
  const parsed = adjustmentSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const movement = await apiPost<Movement>(`/stock/adjustments?site_id=${siteId}`, parsed.data);
    revalidatePath("/stock-boutique");
    revalidatePath("/stock-central");
    revalidatePath("/dashboard");
    return { ok: true, data: movement };
  } catch (err) {
    return toActionResult(err);
  }
}