import { use } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionDetails } from "@/components/submission-details";

export default function MentorSubmissionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard roles={["MENTOR"]}>
      <AppShell>
        <PageHeader
          title="Review submission"
          description="Inspect the project, change its status, and provide feedback."
        />
        <SubmissionDetails id={id} mentor />
      </AppShell>
    </AuthGuard>
  );
}