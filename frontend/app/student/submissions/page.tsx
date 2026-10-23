"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import type { Submission, SubmissionStatus } from "@/types";
import { getMySubmissionAction } from "@/app/(auth)/_actions/submissionAction";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionTable } from "@/components/submission-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type StatusFilter = "ALL" | SubmissionStatus;

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

export default function MySubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubmissions() {
      try {
        const result: unknown = await getMySubmissionAction();

        if (cancelled) return;

        setItems(extractSubmissions(result));
        setError("");
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load submissions.";

        setError(message);
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
  }, [refreshKey]);

  const filteredItems =
    status === "ALL"
      ? items
      : items.filter((submission) => submission.status === status);

  const handleChanged = () => {
    setLoading(true);
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <AuthGuard roles={["STUDENT"]}>
      <AppShell>
        <PageHeader
          title="My submissions"
          description="View and track every project you've submitted."
          action={
            <Button asChild>
              <Link href="/student/submissions/new">
                <Plus size={16} />
                New project
              </Link>
            </Button>
          }
        />

        <div className="mb-4 flex justify-end">
          <Select
            aria-label="Filter submissions by status"
            value={status}
            onValueChange={(value: string) =>
              setStatus(value as StatusFilter)
            }
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
            <div className="size-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            Loading submissions...
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="mb-3 text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={handleChanged}>
              Try again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No submissions found.
          </p>
        ) : (
          <SubmissionTable
            submissions={filteredItems}
            onChanged={handleChanged}
          />
        )}
      </AppShell>
    </AuthGuard>
  );
}