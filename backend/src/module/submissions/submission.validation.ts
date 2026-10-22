
import { z } from "zod";

const createSubmissionSchema = z.object({
  projectName: z.string().trim().min(3).max(100),
  repoUrl: z.url(),
  liveUrl: z.url(),
  description: z.string().trim().min(20).max(2000),
});

const submissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

const updateSubmissionStatusSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
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
