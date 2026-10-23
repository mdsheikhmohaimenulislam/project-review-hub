import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubmissionForm } from "@/components/submission-form";

export default function NewSubmissionPage() {
  return (
    <AuthGuard roles={["STUDENT"]}>
      <AppShell>
        <PageHeader
          title="Submit a project"
          description="Share your repository and live demo for mentor review."
        />

        <div className="mx-auto max-w-3xl">
          <SubmissionForm />
        </div>
      </AppShell>
    </AuthGuard>
  );
}