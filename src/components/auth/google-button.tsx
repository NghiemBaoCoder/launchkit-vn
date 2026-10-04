"use client";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { googleSignInAction } from "@/lib/actions/auth";
import { env } from "@/lib/env";

export function GoogleButton({ next }: { next?: string }) {
  const [loading, setLoading] = React.useState(false);
  if (!env.googleOAuthEnabled) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled title="Cần cấu hình Google OAuth trong Supabase">
        <GoogleIcon /> Google (chưa kích hoạt)
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        const res = await googleSignInAction(next);
        if (res.ok) window.location.assign(res.data.url);
        else {
          toast.error(res.error);
          setLoading(false);
        }
      }}
    >
      <GoogleIcon /> Tiếp tục với Google
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
