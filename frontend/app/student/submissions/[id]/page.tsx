import { Suspense, use } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionDetails } from "@/components/submission-details";
import { notFound } from "next/navigation";



type StudentSubmissionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function SubmissionParams({ params }: StudentSubmissionDetailsPageProps) {
  const { id } = use(params);


  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    notFound();
  }

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
