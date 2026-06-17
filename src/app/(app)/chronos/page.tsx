"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chronos = dynamic(() => import("@/page-components/Chronos"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Chronos />;
}
