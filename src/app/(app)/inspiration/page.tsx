"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const InspirationArchive = dynamic(() => import("@/page-components/InspirationArchive"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <InspirationArchive />;
}
