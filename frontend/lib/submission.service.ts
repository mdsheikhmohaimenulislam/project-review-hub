
import { cookies } from "next/headers";
import { serverUrl } from "./serverUrl";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CreateSubmissionPayload = {
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export type UpdateSubmissionStatusPayload = {
  status: Exclude<SubmissionStatus, "PENDING">;
};

export type SubmissionQuery = {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  search?: string;
};

export type CreateReviewPayload = {
  message: string;
};

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Cookie", `accessToken=${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${serverUrl}/submissions${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Something went wrong";

    throw new Error(message);
  }

  return data as T;
}

// Student: Create a submission
export async function createSubmission(
  values: CreateSubmissionPayload,
) {
  console.log("Submission payload:", values);

  return request("", {
    method: "POST",
    body: JSON.stringify(values),
  });
}


// Student: Get own submissions
export async function getMySubmission() {
  return request("/me");
}

// Student/Mentor: Get one submission by ID
export async function getMySingleSubmission(id: string) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

// Mentor: Get all submissions with pagination and filters
export async function getAllSubmissions(
  query: SubmissionQuery = {},
) {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.search) {
    params.set("search", query.search);
  }

  const queryString = params.toString();

  return request(queryString ? `/?${queryString}` : "/");
}

// Mentor: Get statistics
export async function getSubmissionStatistics() {
  return request("/statistics");
}

// Mentor: Approve or reject a submission
export async function updateSubmissionStatus(
  id: string,
  values: UpdateSubmissionStatusPayload,
) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

// Mentor: Delete a submission
export async function deleteSubmission(id: string) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// Mentor: Create a review
export async function createReview(
  submissionId: string,
  values: CreateReviewPayload,
) {
  return request(`/${encodeURIComponent(submissionId)}`, {
    method: "POST",
    body: JSON.stringify({
      message: values.message,
    }),
  });
}

export async function createReviewAction(
  submissionId: string,
  values: CreateReviewPayload,
) {
  try {
    const data = await createReview(submissionId, values);

    return {
      success: true as const,
      data,
    };
  } catch (error: unknown) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create review",
    };
  }
}

// Student/Mentor: Get reviews for a submission
export async function getReviewsBySubmission(
  submissionId: string,
) {
  return request(`/${encodeURIComponent(submissionId)}`, {
    method: "GET",
  });
}
