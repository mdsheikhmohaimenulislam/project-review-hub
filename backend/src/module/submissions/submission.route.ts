import { Router } from "express";
import { auth } from "../../middlewares/checkAuth.ts";
import { UserRole } from "../../../generated/prisma/enums.ts";

import { validateRequest } from "../../middlewares/validateRequst.ts";
import { SubmissionController } from "./submission.controller.ts";
import allValidation from "./submission.validation.ts";

const router = Router();

// Submission routes
router.post(
  "/",
  auth(UserRole.STUDENT),
  validateRequest(allValidation.createSubmissionSchema),
  SubmissionController.createSubmission,
);

router.get(
  "/me",
  auth(UserRole.STUDENT),
  SubmissionController.getMySubmission,
);

router.get(
  "/statistics",
  auth(UserRole.MENTOR),
  SubmissionController.getSubmissionStatistics,
);

router.get("/", auth(UserRole.MENTOR), SubmissionController.getAllSubmissions);

router.patch(
  "/:id",
  auth(UserRole.MENTOR),
  validateRequest(allValidation.updateSubmissionStatusSchema),
  SubmissionController.updateSubmissionStatus,
);

// Review routes
router.post(
  "/reviews",
  auth(UserRole.MENTOR),
  validateRequest(allValidation.createReviewSchema),
  SubmissionController.createReview,
);

router.get(
  "/:submissionId",
  auth(UserRole.MENTOR, UserRole.STUDENT),
  SubmissionController.getReviewsBySubmission,
);

export const SubmissionRoutes = router;
