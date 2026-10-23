import type { Submission } from "@/types";
import { createSubmissionAction } from "@/app/(auth)/_actions/submissionAction";

export interface CreateSubmissionInput {
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<Submission> {
  const result = await createSubmissionAction(input);

  if (!result.success) {
    throw new Error(result.message || "Failed to create submission.");
  }

  console.log("Create submission response:", result.data);

  const response: unknown = result.data;

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    const nested = response.data;

    if (
      typeof nested === "object" &&
      nested !== null &&
      "id" in nested &&
      typeof nested.id === "string"
    ) {
      return nested as Submission;
    }
  }

  if (
    typeof response === "object" &&
    response !== null &&
    "id" in response &&
    typeof response.id === "string"
  ) {
    return response as Submission;
  }

  throw new Error("Submission was created, but no ID was returned.");
}