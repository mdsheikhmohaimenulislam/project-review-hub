
"use server";

import {
  createSubmission,
  getMySubmission,
  getMySingleSubmission,
  getAllSubmissions,
  getSubmissionStatistics,
  updateSubmissionStatus,
  deleteSubmission,
  createReview,
  getReviewsBySubmission,
} from "@/lib/submission.service";

import type {
  CreateSubmissionPayload,
  SubmissionQuery,
  UpdateSubmissionStatusPayload,
  CreateReviewPayload,
} from "@/lib/submission.service";

// Create submission
export async function createSubmissionAction(
  values: CreateSubmissionPayload,
) {
  try {
    const data = await createSubmission(values);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit project",
    };
  }
}

// Get own submissions
export async function getMySubmissionAction() {
  try {
    const data = await getMySubmission();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load submissions",
    };
  }
}

// Get one submission by ID
export async function getMySingleSubmissionAction(id: string) {
  try {
    const data = await getMySingleSubmission(id);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load submission",
    };
  }
}

// Get all submissions
export async function getAllSubmissionsAction(
  query: SubmissionQuery = {},
) {
  try {
    const data = await getAllSubmissions(query);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load submissions",
    };
  }
}

// Get submission statistics
export async function getSubmissionStatisticsAction() {
  try {
    const data = await getSubmissionStatistics();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load statistics",
    };
  }
}

// Update submission status
export async function updateSubmissionStatusAction(
  id: string,
  values: UpdateSubmissionStatusPayload,
) {
  try {
    const data = await updateSubmissionStatus(id, values);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update submission status",
    };
  }
}

// Delete submission
export async function deleteSubmissionAction(id: string) {
  try {
    const data = await deleteSubmission(id);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete submission",
    };
  }
}

// Create review
export async function createReviewAction(
  submissionId: string,
  values: CreateReviewPayload,
) {
  try {
    const data = await createReview(submissionId, values);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create review",
    };
  }
}

// Get reviews for a submission
export async function getReviewsBySubmissionAction(
  submissionId: string,
) {
  try {
    const data = await getReviewsBySubmission(submissionId);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load reviews",
    };
  }
}
