"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleBusinessTypeActiveAction, toggleIndustryActiveAction, toggleTemplateActiveAction } from "@/lib/actions/admin-catalog";
import { toggleProductActiveAction } from "@/lib/actions/admin-products";
import { toggleCouponActiveAction } from "@/lib/actions/admin-coupons";
import type { ActionResult } from "@/types";

export type ToggleKind = "industry" | "business_type" | "template" | "product" | "coupon";

const ACTIONS: Record<ToggleKind, (id: string, active: boolean) => Promise<ActionResult<undefined>>> = {
  industry: toggleIndustryActiveAction,
  business_type: toggleBusinessTypeActiveAction,
  template: toggleTemplateActiveAction,
  product: toggleProductActiveAction,
  coupon: toggleCouponActiveAction,
};

/** Switch bật/tắt inline trong bảng, gọi server action tương ứng. */
export function ToggleActiveSwitch({ kind, id, active, label }: { kind: ToggleKind; id: string; active: boolean; label?: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(active);
  const [prevActive, setPrevActive] = React.useState(active);
  const [pending, setPending] = React.useState(false);
  if (active !== prevActive) {
    // Đồng bộ khi server trả giá trị mới sau refresh
    setPrevActive(active);
    setValue(active);
  }

  async function onChange(next: boolean) {
    setValue(next);
    setPending(true);
    const res = await ACTIONS[kind](id, next);
    setPending(false);
    if (!res.ok) {
      setValue(!next);
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã cập nhật");
    router.refresh();
  }

  return <Switch checked={value} onCheckedChange={onChange} disabled={pending} aria-label={label ?? (value ? "Đang bật" : "Đã tắt")} />;
}
