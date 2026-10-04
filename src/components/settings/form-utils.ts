import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/** Gắn lỗi theo field từ `ActionResult.fieldErrors` vào react-hook-form. */
export function applyFieldErrors<T extends FieldValues>(form: UseFormReturn<T>, fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return;
  for (const [name, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (message) form.setError(name as Path<T>, { type: "server", message });
  }
}
