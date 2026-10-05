"use client";
import * as React from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPrefsAction } from "@/lib/actions/settings";
import { NOTIFICATION_PREF_KEYS, NOTIFICATION_PREF_META, type NotificationPrefKey, type NotificationPrefs } from "./schemas";

export function NotificationPrefsForm({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = React.useState<NotificationPrefs>(initial);
  const [pending, setPending] = React.useState<NotificationPrefKey | null>(null);

  async function toggle(key: NotificationPrefKey, value: boolean) {
    const previous = prefs;
    setPrefs({ ...prefs, [key]: value });
    setPending(key);
    try {
      const res = await updateNotificationPrefsAction({ [key]: value });
      if (!res.ok) {
        setPrefs(previous);
        toast.error(res.error);
        return;
      }
      setPrefs(res.data);
      toast.success(`${value ? "Đã bật" : "Đã tắt"}: ${NOTIFICATION_PREF_META[key].label}`);
    } finally {
      setPending(null);
    }
  }

  return (
    <ul className="divide-y">
      {NOTIFICATION_PREF_KEYS.map((key) => {
        const meta = NOTIFICATION_PREF_META[key];
        const id = `pref-${key}`;
        return (
          <li key={key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 space-y-1">
              <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
                {meta.label}
              </Label>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
            </div>
            <Switch id={id} data-pref={key} checked={prefs[key]} disabled={pending === key} onCheckedChange={(v) => toggle(key, v)} aria-label={meta.label} />
          </li>
        );
      })}
    </ul>
  );
}
