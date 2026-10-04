"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Supabase client cho trình duyệt (singleton). */
export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}
