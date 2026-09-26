"use server";

import { revalidatePath } from "next/cache";

import { apiPut } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { dailySheetSchema, ingredientMapSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { DailySheetData, IngredientMapEntry } from "@/lib/types";

export async function saveDailySheet(
  siteId: number,
  sheetDate: string,
  input: unknown,
): Promise<ActionResult<DailySheetData>> {
  const parsed = dailySheetSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const data = await apiPut<DailySheetData>(
      `/daily-sheets/${siteId}/${sheetDate}`,
      parsed.data,
    );
    revalidatePath("/journee");
    revalidatePath("/rapports/journee");
    return { ok: true, data };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function saveIngredientMap(
  siteId: number,
  input: unknown,
): Promise<ActionResult<IngredientMapEntry[]>> {
  const parsed = ingredientMapSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const data = await apiPut<IngredientMapEntry[]>(`/daily-ingredients/${siteId}`, parsed.data);
    revalidatePath("/admin/parametres");
    return { ok: true, data };
  } catch (err) {
    return toActionResult(err);
  }
}