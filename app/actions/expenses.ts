"use server";

import { revalidatePath } from "next/cache";

import { apiDelete, apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { expenseCreateSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { Expense } from "@/lib/types";

export async function createExpense(input: unknown): Promise<ActionResult<Expense>> {
  const parsed = expenseCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const expense = await apiPost<Expense>("/expenses", parsed.data);
    revalidatePath("/depenses");
    revalidatePath("/rapports");
    revalidatePath("/dashboard");
    return { ok: true, data: expense };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function deleteExpense(expenseId: number): Promise<ActionResult<null>> {
  try {
    await apiDelete(`/expenses/${expenseId}`);
    revalidatePath("/depenses");
    revalidatePath("/rapports");
    revalidatePath("/dashboard");
    return { ok: true, data: null };
  } catch (err) {
    return toActionResult(err);
  }
}