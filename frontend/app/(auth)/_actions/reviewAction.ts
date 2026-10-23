
// "use server";

// import {
//   createReview,
//   getReviewsBySubmission,
// } from "@/lib/submission.service";

// import type { CreateReviewPayload } from "@/lib/submission.service";

// export async function createReviewAction(
//   submissionId: string,
//   values: CreateReviewPayload,
// ) {
//   try {
//     const data = await createReview(submissionId, values);
//     return { success: true, data };
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to create review",
//     };
//   }
// }

// export async function getReviewsBySubmissionAction(submissionId: string) {
//   try {
//     const data = await getReviewsBySubmission(submissionId);
//     return { success: true, data };
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to load reviews",
//     };
//   }
// }
