"use server";

import { revalidatePath } from "next/cache";

import { apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { productionSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { ProductionOrder } from "@/lib/types";

export async function declareProduction(
  input: unknown,
  siteId: number,
): Promise<ActionResult<ProductionOrder>> {
  const parsed = productionSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const order = await apiPost<ProductionOrder>(`/production/orders?site_id=${siteId}`, parsed.data);
    revalidatePath("/production");
    revalidatePath("/stock-boutique");
    revalidatePath("/dashboard");
    return { ok: true, data: order };
  } catch (err) {
    return toActionResult(err);
  }
}