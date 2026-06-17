"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EMChapterPage = dynamic(() => import("@/page-components/EMChapterPage"), { ssr: false });

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <EMChapterPage />;
}
