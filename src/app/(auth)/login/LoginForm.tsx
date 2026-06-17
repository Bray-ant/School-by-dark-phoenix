"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPage from "@/page-components/AuthPage";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isLoading, isAuthenticated, router, returnUrl]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <AuthPage />;
}
