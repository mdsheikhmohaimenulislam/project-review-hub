"use client";

import { useCallback, useEffect, useState } from "react";
import type { Submission, SubmissionStatus } from "@/types";
import { getAllSubmissionsAction } from "@/app/(auth)/_actions/submissionAction";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionTable } from "@/components/submission-table";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StatusFilter = "ALL" | SubmissionStatus;

type SubmissionResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

function extractSubmissions(result: unknown): Submission[] {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid API response.");
  }

  const response = result as SubmissionResponse;

  if (response.success === false) {
    throw new Error(
      response.message || "Failed to load submissions.",
    );
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
  }

  throw new Error("Unexpected submissions API response format.");
}

export default function MentorSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubmissions() {
      try {
        const result: unknown = await getAllSubmissionsAction(
          status === "ALL" ? {} : { status },
        );

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
  }, [status, refreshKey]);

  const handleStatusChange = (value: string) => {
    setLoading(true);
    setError("");
    setStatus(value as StatusFilter);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    refresh();
  };

  return (
    <AuthGuard roles={["MENTOR"]}>
      <AppShell>
        <PageHeader
          title="All submissions"
          description="Open a project to update its status or leave feedback."
        />

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <Select
            aria-label="Filter submissions by status"
            value={status}
            onValueChange={handleStatusChange}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>

          <Button
            variant="outline"
            onClick={handleRefresh}
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
            <p className="mb-3 text-sm text-destructive">
              {error}
            </p>

            <Button variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No submissions found.
          </p>
        ) : (
          <SubmissionTable
            submissions={items}
            mentor
            onChanged={handleRefresh}
          />
        )}
      </AppShell>
    </AuthGuard>
  );
}