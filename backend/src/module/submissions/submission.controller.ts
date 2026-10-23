import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { SubmissionServices } from "./submission.service.ts";

const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user!;

  const result = await SubmissionServices.createSubmission(
    user.userId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project Submitted Successfully",
    data: result,
  });
});

const getMySubmission = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const result = await SubmissionServices.getMySubmission(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your Submission Retrieved Successfully",
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const status = req.query.status;

  const result = await SubmissionServices.getAllSubmissions({
    page,
    limit,
    ...(status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? { status }
      : {}),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSubmissionStatistics = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await SubmissionServices.getSubmissionStatistics();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission Statistics Retrieved Successfully",
      data: result,
    });
  },
);

const updateSubmissionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const submissionId = req.params.id as string;
    const { status } = req.body;

    const result = await SubmissionServices.updateSubmissionStatus(
      submissionId,
      status,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission Status Updated Successfully",
      data: result,
    });
  },
);

const deleteSubmission = catchAsync(async (req: Request, res: Response) => {
  const submissionId = req.params.id as string;

  const result = await SubmissionServices.deleteSubmission(submissionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission Deleted Successfully",
    data: result,
  });
});

// createReview section

const createReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user!;

  const result = await SubmissionServices.createReview(user.userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review Created Successfully",
    data: result,
  });
});

const getReviewsBySubmission = catchAsync(
  async (req: Request, res: Response) => {
    const submissionId = req.params.submissionId as string;

    await SubmissionServices.getReviewsBySubmission(submissionId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews Retrieved Successfully",
      data: null,
    });
  },
);

export const SubmissionController = {
  createSubmission,
  getMySubmission,
  getAllSubmissions,
  getSubmissionStatistics,
  updateSubmissionStatus,
  createReview,
  getReviewsBySubmission,
  deleteSubmission,
};
