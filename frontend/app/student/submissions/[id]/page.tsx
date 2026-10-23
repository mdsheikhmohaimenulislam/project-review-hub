import { Suspense, use } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionDetails } from "@/components/submission-details";


type StudentSubmissionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function SubmissionParams({ params }: StudentSubmissionDetailsPageProps) {
  const { id } = use(params);


  return <SubmissionDetails id={id} />;
}

export default function StudentSubmissionDetailsPage({
  params,
}: StudentSubmissionDetailsPageProps) {
  return (
    <AuthGuard roles={["STUDENT"]}>
      <AppShell>
        <PageHeader
          title="Submission details"
          description="Project links, review status, and feedback."
        />

        <Suspense
          fallback={
            <p className="p-4 text-sm text-muted-foreground">
              Loading submission...
            </p>
          }
        >
          <SubmissionParams params={params} />
        </Suspense>
      </AppShell>
    </AuthGuard>
  );
}
