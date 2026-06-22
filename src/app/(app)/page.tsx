"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/page-components/Home"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-muted-foreground">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin mb-3" />
        <div>Loading Project school...</div>
      </div>
    );
  }
  return <Home />;
}
