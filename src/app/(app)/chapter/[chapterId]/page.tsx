"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChapterPage = dynamic(() => import("@/page-components/ChapterPage"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ChapterPage />;
}
