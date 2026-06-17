"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/page-components/Home"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Home />;
}
