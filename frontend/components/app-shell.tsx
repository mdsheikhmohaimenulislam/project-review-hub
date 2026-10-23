"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserRound,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { User } from "@/types";

import { logoutAction } from "@/app/(auth)/_actions/logoutAction";
import { getMeAction } from "@/app/(auth)/_actions/authAction";

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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const result: unknown = await getMeAction();
        const currentUser = extractUser(result);

        if (cancelled) return;

        setUser(currentUser);
      } catch {
        if (cancelled) return;

        router.replace("/login");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const mentor = user?.role === "MENTOR";

  const nav = mentor
    ? [
        {
          href: "/mentor/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/mentor/submissions",
          label: "Submissions",
          icon: ClipboardList,
        },
      ]
    : [
        {
          href: "/student/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/student/submissions",
          label: "My submissions",
          icon: ClipboardList,
        },
        {
          href: "/student/submissions/new",
          label: "New project",
          icon: PlusCircle,
        },
      ];

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const result: unknown = await logoutAction();

      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        result.success === false
      ) {
        const message =
          "message" in result && typeof result.message === "string"
            ? result.message
            : "Could not log out.";

        throw new Error(message);
      }

      setUser(null);
      toast.success("Logged out successfully");
      router.replace("/login");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not log out.",
      );
      setLoggingOut(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading your workspace..." : "Redirecting to login..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href={mentor ? "/mentor/dashboard" : "/student/dashboard"}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BookOpenCheck size={19} />
            </span>
            Project Review Hub
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={loggingOut}
            >
              <LogOut size={15} />
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border bg-background p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>

          <nav className="grid gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 border-t pt-3">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <UserRound size={15} />
              Signed in as {mentor ? "Mentor" : "Student"}
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}