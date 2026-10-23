"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { User, UserRole } from "@/types";
import { getMeAction } from "@/app/(auth)/_actions/authAction";


type AuthGuardProps = {
  children: ReactNode;
  roles?: UserRole[];
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  user?: unknown;
};

function extractUser(result: unknown): User {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid authentication response.");
  }

  const response = result as ApiResponse;

  if (response.success === false) {
    throw new Error(response.message || "Authentication failed.");
  }

  let candidate: unknown = response.data ?? response.user ?? result;

  if (candidate && typeof candidate === "object" && "user" in candidate) {
    candidate = candidate.user;
  }

  if (candidate && typeof candidate === "object" && "data" in candidate) {
    const nested = candidate.data;

    if (nested && typeof nested === "object" && "user" in nested) {
      candidate = nested.user;
    } else {
      candidate = nested;
    }
  }

  if (!candidate || typeof candidate !== "object") {
    throw new Error("User information not found.");
  }

  const value = candidate as Record<string, unknown>;

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    (value.role !== "STUDENT" && value.role !== "MENTOR")
  ) {
    throw new Error("Invalid user information.");
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    role: value.role,
    ...(typeof value.userId === "string" ? { userId: value.userId } : {}),
  };
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const roleKey = roles?.join(",") ?? "";

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const result: unknown = await getMeAction();
        const currentUser = extractUser(result);

        if (cancelled) return;

        const allowedRoles = roleKey
          ? (roleKey.split(",") as UserRole[])
          : null;

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          router.replace(
            currentUser.role === "MENTOR"
              ? "/mentor/dashboard"
              : "/student/dashboard",
          );
          return;
        }

        setUser(currentUser);
        setReady(true);
      } catch {
        if (cancelled) return;

        router.replace("/login");
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, roleKey]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
}