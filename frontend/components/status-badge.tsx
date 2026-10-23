"use client";

import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/types";

type StatusBadgeProps = {
  status: SubmissionStatus;
};

const styles: Record<SubmissionStatus, string> = {
  PENDING: "border-amber-300 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-300 bg-rose-50 text-rose-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={styles[status]}>
      {status.toLowerCase()}
    </Badge>
  );
}