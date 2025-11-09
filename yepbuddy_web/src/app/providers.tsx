"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/lib/react-query";
import { TempoProvider } from "@/hooks/useTempo";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TempoProvider>{children}</TempoProvider>
    </QueryClientProvider>
  );
}
