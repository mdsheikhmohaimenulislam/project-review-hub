import { z } from "zod";



const validWebsiteUrl = z
  .string()
  .trim()
  .url("Please provide a valid website URL.")
  .refine((value) => {
    try {
      const url = new URL(value);

      return (
        (url.protocol === "https:" || url.protocol === "http:") &&
        !!url.hostname &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Please provide a valid website URL.");

const githubRepoUrl = z
  .string()
  .trim()
  .url("Please provide a valid GitHub repository URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      const [owner, repo] = url.pathname.split("/").filter(Boolean);

      return (
        url.protocol === "https:" &&
        url.hostname === "github.com" &&
        !url.username &&
        !url.password &&
        !url.port &&
        !!owner &&
        !!repo &&
        /^[a-zA-Z0-9-]+$/.test(owner) &&
        /^[a-zA-Z0-9_.-]+$/.test(repo) &&
        !repo.endsWith(".git")
      );
    } catch {
      return false;
    }
  }, "Only valid GitHub repository URLs are allowed.");

export const createSubmissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters.")
    .max(100, "Project name cannot exceed 100 characters."),

  repoUrl: githubRepoUrl,

  liveUrl: validWebsiteUrl,

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
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
  message: z.string().trim().min(1).max(2000),
});

const allValidation = {
  createSubmissionSchema,
  submissionQuerySchema,
  updateSubmissionStatusSchema,
  createReviewSchema,
};

export default allValidation;
