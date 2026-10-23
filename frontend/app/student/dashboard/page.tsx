"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
} from "lucide-react";

import type { Submission } from "@/types";
import { getMySubmissionAction } from "@/app/(auth)/_actions/submissionAction";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SubmissionTable } from "@/components/submission-table";
import { Button } from "@/components/ui/button";

type SubmissionResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

function extractSubmissions(result: unknown): Submission[] {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid submissions response.");
  }

  const response = result as SubmissionResponse;

  if (response.success === false) {
    throw new Error(response.message || "Failed to load submissions.");
  }

  const data = response.data;

  if (Array.isArray(data)) {
    return data as Submission[];
  }

  if (data && typeof data === "object") {
    const nestedData = data as {
      submissions?: unknown;
      data?: unknown;
    };

    if (Array.isArray(nestedData.submissions)) {
      return nestedData.submissions as Submission[];
    }

    if (Array.isArray(nestedData.data)) {
      return nestedData.data as Submission[];
    }

    if (
      nestedData.data &&
      typeof nestedData.data === "object" &&
      "submissions" in nestedData.data &&
      Array.isArray(nestedData.data.submissions)
    ) {
      return nestedData.data.submissions as Submission[];
    }
  }

  throw new Error("Unexpected submissions response format.");
}

export default function StudentDashboard() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      async function fetchSubmissions() {
        try {
          const result: unknown = await getMySubmissionAction();

          if (cancelled) return;

          setItems(extractSubmissions(result));
          setError("");
        } catch (err: unknown) {
          if (cancelled) return;

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load submissions.",
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void fetchSubmissions();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <AuthGuard roles={["STUDENT"]}>
      <AppShell>
        <PageHeader
          title="Student dashboard"
          description="Track your project submissions and mentor feedback."
          action={
            <Button asChild>
              <Link href="/student/submissions/new">
                <Plus size={16} />
                Submit project
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total projects"
            value={items.length}
            hint="All your submissions"
            icon={FileText}
          />

          <StatCard
            label="Pending review"
            value={items.filter((item) => item.status === "PENDING").length}
            hint="Waiting for mentor"
            icon={Clock3}
          />

          <StatCard
            label="Approved"
            value={items.filter((item) => item.status === "APPROVED").length}
            hint="Accepted projects"
            icon={CheckCircle2}
          />

          <StatCard
            label="Needs attention"
            value={items.filter((item) => item.status === "REJECTED").length}
            hint="Rejected submissions"
            icon={XCircle}
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent submissions</h2>
              <p className="text-sm text-muted-foreground">
                Your latest project activity.
              </p>
            </div>

            <Link
              href="/student/submissions"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
              <div className="size-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              Loading submissions...
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="mb-3 text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={handleRetry}>
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              You have not submitted any projects yet.
            </p>
          ) : (
            <SubmissionTable
              submissions={items.slice(0, 5)}
              mentor={false}
              onChanged={handleRetry}
            />
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}