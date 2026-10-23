"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSubmission, CreateSubmissionInput } from "./submission-api";

export function SubmissionForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateSubmissionInput>({
    projectName: "",
    repoUrl: "",
    liveUrl: "",
    description: "",
  });

  function change(key: keyof CreateSubmissionInput, value: string) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const submission = await createSubmission({
        projectName: form.projectName.trim(),
        repoUrl: form.repoUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        description: form.description.trim(),
      });

      if (!submission?.id) {
        throw new Error("Submission was created, but no ID was returned.");
      }

      toast.success("Project submitted for review");
      router.push(`/student/submissions/${submission.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not submit project.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project information</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              required
              minLength={3}
              maxLength={100}
              value={form.projectName}
              onChange={(event) => change("projectName", event.target.value)}
              placeholder="e.g. Task Management App"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="repoUrl">GitHub repository URL</Label>
            <Input
              id="repoUrl"
              type="url"
              required
              value={form.repoUrl}
              onChange={(event) => change("repoUrl", event.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="liveUrl">Live demo URL</Label>
            <Input
              id="liveUrl"
              type="url"
              required
              value={form.liveUrl}
              onChange={(event) => change("liveUrl", event.target.value)}
              placeholder="https://your-project.vercel.app"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              minLength={20}
              maxLength={2000}
              value={form.description}
              onChange={(event) => change("description", event.target.value)}
              placeholder="Describe the project, key features, and technologies."
            />

            <p className="text-right text-xs text-muted-foreground">
              {form.description.length}/2000
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading && (
                <LoaderCircle className="animate-spin" size={16} />
              )}
              {loading ? "Submitting..." : "Submit project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}