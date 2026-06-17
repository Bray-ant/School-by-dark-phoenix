"use client";

import { Providers } from "../providers";
import AppLayoutContent from "./AppLayoutContent";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Providers>
  );
}
