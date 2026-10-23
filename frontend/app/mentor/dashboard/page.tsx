"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { Submission } from "@/types";
import { getAllSubmissionsAction } from "@/app/(auth)/_actions/submissionAction";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SubmissionTable } from "@/components/submission-table";
import { Button } from "@/components/ui/button";

type SubmissionCollection = {
  submissions?: Submission[];
  data?: Submission[] | SubmissionCollection;
};

type SubmissionResponse = {
  success?: boolean;
  message?: string;
  data?: Submission[] | SubmissionCollection;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractSubmissions(result: unknown): Submission[] {
  if (!isRecord(result)) {
    throw new Error("Invalid API response.");
  }

  const data = result.data;

  if (Array.isArray(data)) {
    return data as Submission[];
  }

  if (isRecord(data)) {
    if (Array.isArray(data.submissions)) {
      return data.submissions as Submission[];
    }

    if (Array.isArray(data.data)) {
      return data.data as Submission[];
    }
  }

  if (Array.isArray(result.submissions)) {
    return result.submissions as Submission[];
  }

  throw new Error("Invalid submissions response.");
}

export default function MentorDashboard() {
  const router = useRouter();

  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result: unknown = await getAllSubmissionsAction();
      const submissions = extractSubmissions(result);

      setItems(submissions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load submissions.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubmissions() {
      try {
        const result: unknown = await getAllSubmissionsAction();

        if (cancelled) return;

        setItems(extractSubmissions(result));
        setError("");
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to load submissions.";

        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = items.filter(
    (submission) => submission.status === "PENDING",
  ).length;

  const approvedCount = items.filter(
    (submission) => submission.status === "APPROVED",
  ).length;

  const rejectedCount = items.filter(
    (submission) => submission.status === "REJECTED",
  ).length;

  return (
    <AuthGuard roles={["MENTOR"]}>
      <AppShell>
        <PageHeader
          title="Mentor dashboard"
          description="Review student projects and help developers improve."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/mentor/submissions">Review submissions</Link>
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total submissions"
            value={loading ? "..." : items.length}
            hint="All submissions"
            icon={ClipboardList}
          />

          <StatCard
            label="Pending"
            value={loading ? "..." : pendingCount}
            hint="Need your review"
            icon={Clock3}
          />

          <StatCard
            label="Approved"
            value={loading ? "..." : approvedCount}
            hint="Accepted projects"
            icon={CheckCircle2}
          />

          <StatCard
            label="Rejected"
            value={loading ? "..." : rejectedCount}
            hint="Rejected projects"
            icon={XCircle}
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
          
            <div>
              <h2 className="text-lg font-semibold">Latest submissions</h2>

              <p className="text-sm text-muted-foreground">
                Review recent work from students.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading submissions...
            </p>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="mb-3 text-sm text-destructive">{error}</p>

              <Button
                variant="outline"
                onClick={() => void load()}
                disabled={loading}
              >
                Try again
              </Button>
            </div>
          ) : (
            <SubmissionTable
              submissions={items}
              mentor
              onChanged={() => void load()}
            />
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
