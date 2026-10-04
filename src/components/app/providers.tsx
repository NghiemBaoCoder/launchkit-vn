"use client";
import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "@/components/app/offline-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider>
        {children}
        <OfflineBanner />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
