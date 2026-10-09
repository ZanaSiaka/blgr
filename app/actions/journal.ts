"use server";

import { revalidatePath } from "next/cache";

import { apiPut } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { dailyJournalSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { DailyJournalData } from "@/lib/types";

export async function saveJournal(
  siteId: number,
  date: string,
  input: unknown,
): Promise<ActionResult<DailyJournalData>> {
  const parsed = dailyJournalSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const data = await apiPut<DailyJournalData>(`/daily-journals/${siteId}/${date}`, parsed.data);
    revalidatePath("/journeau");
    revalidatePath("/rapports/journeau");
    return { ok: true, data };
  } catch (err) {
    return toActionResult(err);
  }
}