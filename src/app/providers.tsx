"use client";

import { useEffect } from "react";
import { TRPCProvider } from "@/providers/trpc";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration failed — app still works without it
        });
      });
    }
  }, []);

  return (
    <TRPCProvider>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </TRPCProvider>
  );
}
