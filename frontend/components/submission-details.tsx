"use client";

import { useEffect, useState, type FormEvent } from "react";
import {  useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, Trash2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

import type { Feedback, Submission, SubmissionStatus } from "@/types";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

import {
  createReviewAction,
  deleteSubmissionAction,
  getMySingleSubmissionAction,
  updateSubmissionStatusAction,
} from "@/app/(auth)/_actions/submissionAction";

type SubmissionDetailsProps = {
  id: string;
  mentor?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractSubmission(result: unknown, id: string): Submission {
  let payload: unknown = result;

  for (let i = 0; i < 5; i++) {
    if (!isRecord(payload)) {
      throw new Error("Submission data was not found.");
    }

    if (payload.success === false) {
      throw new Error(
        typeof payload.message === "string"
          ? payload.message
          : "Could not load submission.",
      );
    }

    if (typeof payload.id === "string") {
      if (payload.id !== id) {
        throw new Error(
          "Submission not found or not available to this account.",
        );
      }

      return payload as unknown as Submission;
    }

    if ("submission" in payload) {
      payload = payload.submission;
      continue;
    }

    if ("data" in payload) {
      payload = payload.data;
      continue;
    }

    throw new Error("Submission data was not found.");
  }

  throw new Error("Invalid submission response structure.");
}

export function SubmissionDetails({
  id,
  mentor = false,
}: SubmissionDetailsProps) {
  const router = useRouter();

  const [item, setItem] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSubmission() {
      setLoading(true);
      setError("");

      try {
        const result = await getMySingleSubmissionAction(id);

        if (cancelled) return;

        setItem(extractSubmission(result, id));
      } catch (err: unknown) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Could not load submission.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSubmission();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!item || !trimmedMessage || saving) return;

    setSaving(true);

    try {
      const result = await createReviewAction(id, {
        message: trimmedMessage,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      setMessage("");
      toast.success("Feedback added");

      const refreshed = await getMySingleSubmissionAction(id);
      setItem(extractSubmission(refreshed, id));
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not add feedback.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(value: string) {
    if (!item || saving || value === "PENDING") return;

    if (value !== "APPROVED" && value !== "REJECTED") return;

    const status: Exclude<SubmissionStatus, "PENDING"> = value;

    setSaving(true);

    try {
      const result = await updateSubmissionStatusAction(id, { status });

      if (!result.success) {
        throw new Error(result.message);
      }

      setItem((current) => (current ? { ...current, status } : current));

      toast.success("Submission status updated");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update submission status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (deleting) return;

    const confirmed = window.confirm("Delete this submission permanently?");

    if (!confirmed) return;

    setDeleting(true);

    try {
      const result = await deleteSubmissionAction(id);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Submission deleted");

      router.replace(mentor ? "/mentor/submissions" : "/student/submissions");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete submission.",
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        <LoaderCircle className="mx-auto mb-2 animate-spin" />
        Loading submission...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center">
        <p className="text-destructive">{error || "Submission not found."}</p>

        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const feedbackList: Feedback[] = item.feedback ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl">{item.projectName}</CardTitle>

              <StatusBadge status={item.status} />
            </div>

            <p className="text-sm text-muted-foreground">
              Submitted {new Date(item.createdAt).toLocaleString()}
            </p>
          </CardHeader>

          <CardContent className="grid gap-5">
            <p className="whitespace-pre-wrap text-sm leading-7">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="h-4 w-4" />
                  Repository
                  <ExternalLink size={14} />
                </a>
              </Button>

              {item.liveUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live demo
                    <ExternalLink size={14} />
                  </a>
                </Button>
              )}
            </div>

            {item.student && (
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm font-medium">{item.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.student.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentor feedback</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4">
            {feedbackList.length > 0 ? (
              feedbackList.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {entry.message}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No feedback has been added yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="grid content-start gap-4">
        {mentor && (
          <Card>
            <CardHeader>
              <CardTitle>Review actions</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="submission-status"
                  className="text-sm font-medium"
                >
                  Submission status
                </label>

                <Select
                  value={item.status}
                  disabled={saving}
                  onValueChange={(value: string) => {
                    void updateStatus(value);
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </div>

              <form className="grid gap-3" onSubmit={review}>
                <label htmlFor="feedback" className="text-sm font-medium">
                  Write feedback
                </label>

                <Textarea
                  id="feedback"
                  required
                  maxLength={2000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share clear, helpful feedback..."
                />

                <Button disabled={saving || !message.trim()}>
                  {saving && (
                    <LoaderCircle className="animate-spin" size={15} />
                  )}
                  Add feedback
                </Button>
              </form>

              <Button
                variant="destructive"
                disabled={deleting}
                onClick={() => void remove()}
              >
                {deleting ? (
                  <LoaderCircle className="animate-spin" size={15} />
                ) : (
                  <Trash2 size={15} />
                )}

                {deleting ? "Deleting..." : "Delete submission"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Submission ID</p>
              <p className="break-all font-mono text-xs">{item.id}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Last updated</p>
              <p>
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
