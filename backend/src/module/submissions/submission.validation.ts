import { z } from "zod";

const validWebsiteUrl = z.url().refine((value) => {
  const url = new URL(value);

  return (
    url.protocol === "https:" &&
    url.hostname.includes(".") &&
    !url.hostname.endsWith(".")
  );
}, "Please provide a valid website URL");

export const createSubmissionSchema = z.object({
  projectName: z.string().trim().min(3).max(100),
  repoUrl: validWebsiteUrl,
  liveUrl: validWebsiteUrl,
  description: z.string().trim().min(20).max(2000),
});

const submissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

const updateSubmissionStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

const createReviewSchema = z.object({
  body: z.object({
    submissionId: z.string().min(1, "Submission ID is required"),
    message: z.string().trim().min(1, "Review message is required"),
  }),
});

const allValidation = {
  createSubmissionSchema,
  submissionQuerySchema,
  updateSubmissionStatusSchema,
  createReviewSchema,
};

export default allValidation;
