
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLink,
  Eye,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

import type { Submission } from "@/types";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  deleteSubmissionAction,
  updateSubmissionStatusAction,
} from "@/app/(auth)/_actions/submissionAction";

type SubmissionTableProps = {
  submissions: Submission[];
  mentor?: boolean;
  onChanged?: () => void;
};

export function SubmissionTable({
  submissions,
  mentor = false,
  onChanged,
}: SubmissionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (deletingId !== null || updatingId !== null || !mentor) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this submission? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const result = await deleteSubmissionAction(id);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Submission deleted");
      onChanged?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete submission.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function changeStatus(
    id: string,
    status: "APPROVED" | "REJECTED",
  ) {
    if (updatingId !== null || deletingId !== null || !mentor) {
      return;
    }

    setUpdatingId(id);

    try {
      const result = await updateSubmissionStatusAction(id, {
        status,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(
        status === "APPROVED"
          ? "Submission approved"
          : "Submission rejected",
      );

      onChanged?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update submission status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background px-6 py-14 text-center">
        <p className="font-medium">No submissions found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>

            {mentor && <TableHead>Student</TableHead>}

            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {submissions.map((submission) => {
            const detailsUrl = `${
              mentor ? "/mentor" : "/student"
            }/submissions/${submission.id}`;

            const isDeleting = deletingId === submission.id;
            const isUpdating = updatingId === submission.id;
            const isBusy = isDeleting || isUpdating;

            return (
              <TableRow key={submission.id}>
                {/* Project */}
                <TableCell>
                  <Link
                    className="font-medium hover:text-primary hover:underline"
                    href={detailsUrl}
                  >
                    {submission.projectName}
                  </Link>

                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <FaGithub size={12} />
                      Repository
                    </a>

                    {submission.liveUrl && (
                      <a
                        href={submission.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <ExternalLink size={12} />
                        Live demo
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Student information: Mentor only */}
                {mentor && (
                  <TableCell>
                    <p>{submission.student?.name || "Student"}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.student?.email || ""}
                    </p>
                  </TableCell>
                )}

                {/* Status and Mentor actions */}
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={submission.status} />

                    {mentor && submission.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            void changeStatus(
                              submission.id,
                              "APPROVED",
                            )
                          }
                        >
                          {isUpdating && (
                            <LoaderCircle
                              className="mr-1 animate-spin"
                              size={14}
                            />
                          )}
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            void changeStatus(
                              submission.id,
                              "REJECTED",
                            )
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>

                {/* Submission date */}
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(
                    submission.createdAt,
                  ).toLocaleDateString()}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View submission"
                      asChild
                    >
                      <Link href={detailsUrl}>
                        <Eye size={16} />
                      </Link>
                    </Button>

                    {/* Delete: Mentor only */}
                    {mentor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete submission"
                        disabled={isBusy}
                        onClick={() =>
                          void remove(submission.id)
                        }
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            className="animate-spin"
                            size={16}
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
