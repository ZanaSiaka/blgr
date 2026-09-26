"use server";

import { revalidatePath } from "next/cache";

import { apiPatch, apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import {
  articleCreateSchema,
  articleUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  siteCreateSchema,
  siteUpdateSchema,
  supplierCreateSchema,
  supplierUpdateSchema,
  unitCreateSchema,
  unitUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
  validationError,
} from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { Article, Category, Site, Supplier, Unit, User } from "@/lib/types";

const ADMIN_PATHS = [
  "/admin/users",
  "/admin/boutiques",
  "/admin/fournisseurs",
  "/admin/articles",
  "/admin/receptions",
  "/admin/parametres",
];

function refreshAdmin() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
}

// Users -------------------------------------------------------------
export async function createUser(input: unknown): Promise<ActionResult<User>> {
  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const user = await apiPost<User>("/users", parsed.data);
    refreshAdmin();
    return { ok: true, data: user };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateUser(userId: number, input: unknown): Promise<ActionResult<User>> {
  const parsed = userUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const user = await apiPatch<User>(`/users/${userId}`, parsed.data);
    refreshAdmin();
    return { ok: true, data: user };
  } catch (err) {
    return toActionResult(err);
  }
}

// Sites -------------------------------------------------------------
export async function createSite(input: unknown): Promise<ActionResult<Site>> {
  const parsed = siteCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const site = await apiPost<Site>("/sites", parsed.data);
    refreshAdmin();
    return { ok: true, data: site };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateSite(siteId: number, input: unknown): Promise<ActionResult<Site>> {
  const parsed = siteUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const site = await apiPatch<Site>(`/sites/${siteId}`, parsed.data);
    refreshAdmin();
    return { ok: true, data: site };
  } catch (err) {
    return toActionResult(err);
  }
}

// Suppliers ---------------------------------------------------------
export async function createSupplier(input: unknown): Promise<ActionResult<Supplier>> {
  const parsed = supplierCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const supplier = await apiPost<Supplier>("/suppliers", parsed.data);
    refreshAdmin();
    revalidatePath("/achats");
    return { ok: true, data: supplier };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateSupplier(
  supplierId: number,
  input: unknown,
): Promise<ActionResult<Supplier>> {
  const parsed = supplierUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const supplier = await apiPatch<Supplier>(`/suppliers/${supplierId}`, parsed.data);
    refreshAdmin();
    revalidatePath("/achats");
    return { ok: true, data: supplier };
  } catch (err) {
    return toActionResult(err);
  }
}

// Articles ----------------------------------------------------------
export async function createArticle(input: unknown): Promise<ActionResult<Article>> {
  const parsed = articleCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const article = await apiPost<Article>("/articles", parsed.data);
    refreshAdmin();
    revalidatePath("/achats");
    revalidatePath("/recettes");
    return { ok: true, data: article };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateArticle(
  articleId: number,
  input: unknown,
): Promise<ActionResult<Article>> {
  const parsed = articleUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const article = await apiPatch<Article>(`/articles/${articleId}`, parsed.data);
    refreshAdmin();
    revalidatePath("/achats");
    revalidatePath("/recettes");
    return { ok: true, data: article };
  } catch (err) {
    return toActionResult(err);
  }
}

// Categories & Units -------------------------------------------------
export async function createCategory(input: unknown): Promise<ActionResult<Category>> {
  const parsed = categoryCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const category = await apiPost<Category>("/categories", parsed.data);
    refreshAdmin();
    return { ok: true, data: category };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateCategory(
  categoryId: number,
  input: unknown,
): Promise<ActionResult<Category>> {
  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const category = await apiPatch<Category>(`/categories/${categoryId}`, parsed.data);
    refreshAdmin();
    return { ok: true, data: category };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function createUnit(input: unknown): Promise<ActionResult<Unit>> {
  const parsed = unitCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const unit = await apiPost<Unit>("/units", parsed.data);
    refreshAdmin();
    return { ok: true, data: unit };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateUnit(unitId: number, input: unknown): Promise<ActionResult<Unit>> {
  const parsed = unitUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const unit = await apiPatch<Unit>(`/units/${unitId}`, parsed.data);
    refreshAdmin();
    return { ok: true, data: unit };
  } catch (err) {
    return toActionResult(err);
  }
}