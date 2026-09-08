import { ApiError, errorToMessage } from "@/lib/api";
import type { Failure } from "@/lib/validators";

export function toActionResult(err: unknown): Failure {
  //console.error(err);
  if (err instanceof ApiError) {
    return {
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
  }
  return {
    ok: false,
    error: { code: "ERROR", message: errorToMessage(err) },
  };
}