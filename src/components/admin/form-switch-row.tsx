"use client";
import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";

/** Hàng switch trong form (dùng bên trong FormField render). */
export function FormSwitchRow({ label, description, checked, onCheckedChange, disabled }: { label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
      <div className="space-y-0.5">
        <FormLabel>{label}</FormLabel>
        {description ? <FormDescription>{description}</FormDescription> : null}
      </div>
      <FormControl>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </FormControl>
    </FormItem>
  );
}
