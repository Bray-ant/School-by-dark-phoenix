"use client";

import { useEffect, useState, type ComponentType } from "react";

export function withClientOnly<T extends Record<string, unknown>>(
  Component: ComponentType<T>
): ComponentType<T> {
  return function ClientOnlyWrapper(props: T) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <Component {...props} />;
  };
}
