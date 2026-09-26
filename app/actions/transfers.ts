"use server";

import { revalidatePath } from "next/cache";

import { apiPost } from "@/lib/api";
import { toActionResult } from "@/lib/action-utils";
import { receiveLinesSchema, returnSchema, transferCreateSchema, validationError } from "@/lib/validators";
import type { ActionResult } from "@/lib/validators";
import type { TransferNote } from "@/lib/types";

export async function createTransfer(
  input: unknown,
  fromSiteId: number,
): Promise<ActionResult<TransferNote>> {
  const parsed = transferCreateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const note = await apiPost<TransferNote>(
      `/transfer-notes?from_site_id=${fromSiteId}`,
      parsed.data,
    );
    revalidatePath("/transferts");
    revalidatePath("/stock-central");
    revalidatePath("/dashboard");
    return { ok: true, data: note };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function receiveTransfer(
  noteId: number,
  input: unknown,
): Promise<ActionResult<TransferNote>> {
  const parsed = receiveLinesSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const note = await apiPost<TransferNote>(`/transfer-notes/${noteId}/receive`, parsed.data);
    revalidatePath("/reception");
    revalidatePath("/stock-boutique");
    revalidatePath("/dashboard");
    return { ok: true, data: note };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function cancelTransfer(noteId: number): Promise<ActionResult<TransferNote>> {
  try {
    const note = await apiPost<TransferNote>(`/transfer-notes/${noteId}/cancel`, {});
    revalidatePath("/transferts");
    revalidatePath("/stock-central");
    revalidatePath("/dashboard");
    return { ok: true, data: note };
  } catch (err) {
    return toActionResult(err);
  }
}

export async function returnTransfer(
  noteId: number,
  input: unknown,
): Promise<ActionResult<TransferNote>> {
  const parsed = returnSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const note = await apiPost<TransferNote>(`/transfer-notes/${noteId}/return`, parsed.data);
    revalidatePath("/reception");
    revalidatePath("/stock-boutique");
    revalidatePath("/dashboard");
    return { ok: true, data: note };
  } catch (err) {
    return toActionResult(err);
  }
}