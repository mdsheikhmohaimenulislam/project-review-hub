"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (!cancelled) router.replace("/login");
          return;
        }

        const result: unknown = await response.json();

        const userData =
          result !== null &&
          typeof result === "object" &&
          "data" in result
            ? result.data
            : result;

        if (
          userData === null ||
          typeof userData !== "object" ||
          !("role" in userData)
        ) {
          if (!cancelled) router.replace("/login");
          return;
        }

        if (cancelled) return;

        if (userData.role === "MENTOR") {
          router.replace("/mentor/dashboard");
        } else if (userData.role === "STUDENT") {
          router.replace("/student/dashboard");
        } else {
          router.replace("/login");
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>

        <h1 className="animate-pulse text-lg font-semibold">
          Project Review Hub
        </h1>

        <p className="text-sm text-muted-foreground">
          Opening your workspace...
        </p>
      </div>
    </main>
  );
}