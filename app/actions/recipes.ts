"use server";

import { revalidatePath } from "next/cache";

import { apiPatch, apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { recipeCreateSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { Recipe } from "@/lib/types";

export async function createRecipe(input: unknown): Promise<ActionResult<Recipe>> {
  const parsed = recipeCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const recipe = await apiPost<Recipe>("/recipes", parsed.data);
    revalidatePath("/recettes");
    return { ok: true, data: recipe };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateRecipe(recipeId: number, input: unknown): Promise<ActionResult<Recipe>> {
  const parsed = recipeCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const recipe = await apiPatch<Recipe>(`/recipes/${recipeId}`, parsed.data);
    revalidatePath("/recettes");
    return { ok: true, data: recipe };
  } catch (err) {
    return toActionResult(err);
  }
}