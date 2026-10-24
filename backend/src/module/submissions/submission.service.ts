import httpStatus from "http-status";
import type { SubmissionStatus } from "../../../generated/prisma/enums.ts";
import { prisma } from "../../libs/prisma.ts";
import { AppError } from "../../utils/AppError.ts";
import { CreateSubmissionInput, ICreateReviewPayload, IRequestUser } from "./submissions.interface.ts";
import { isValidGitHubRepo } from "../../utils/validate-project-url.ts";

interface SubmissionQuery {
  page: number;
  limit: number;
  status?: SubmissionStatus;
}


const createSubmission = async (
  studentId: string,
  payload: CreateSubmissionInput,
) => {
  let isValidRepo: boolean;

  try {
    isValidRepo = await isValidGitHubRepo(payload.repoUrl);
  } catch {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "GitHub repository validation is temporarily unavailable. Please try again.",
    );
  }

  if (!isValidRepo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide a valid public GitHub repository URL.",
    );
  }

  const existingSubmission = await prisma.submission.findFirst({
    where: {
      studentId,
      projectName: {
        equals: payload.projectName.trim(),
        mode: "insensitive",
      },
    },
  });

  if (existingSubmission) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already submitted a project with this name.",
    );
  }

  const submission = await prisma.submission.create({
    data: {
      ...payload,
      projectName: payload.projectName.trim(),
      studentId,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return submission;
};

const getSubmissionById = async (
  id: string,
  user: IRequestUser,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      feedback: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Submission not found",
    );
  }

  if (
    user.role === "STUDENT" &&
    submission.studentId !== user.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this submission",
    );
  }

  return submission;
};

const getMySubmission = async (studentId: string) => {
  return prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      feedback: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
};

const getAllSubmissions = async (query: SubmissionQuery) => {
  const { page, limit, status } = query;
  const where = status ? { status } : {};

  const [submissions, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        feedback: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    data: submissions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSubmissionStatistics = async () => {
  const [total, pending, approved, rejected] = await prisma.$transaction([
    prisma.submission.count(),
    prisma.submission.count({
      where: { status: "PENDING" },
    }),
    prisma.submission.count({
      where: { status: "APPROVED" },
    }),
    prisma.submission.count({
      where: { status: "REJECTED" },
    }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
  };
};

const updateSubmissionStatus = async (
  submissionId: string,
  status: SubmissionStatus,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  });

  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, "Submission Not Found");
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: { status },
  });
};


const deleteSubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  });

  if (!submission) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Submission Not Found",
    );
  }

  return prisma.submission.delete({
    where: { id: submissionId },
  });
};

// review.service.ts section

const createReview = async (
  authorId: string,
  payload: ICreateReviewPayload,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: payload.submissionId },
    select: { id: true },
  });

  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, "Submission Not Found");
  }

  return prisma.feedback.create({
    data: {
      submissionId: payload.submissionId,
      authorId,
      message: payload.message,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

const getReviewsBySubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  });

  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, "Submission Not Found");
  }

  return prisma.feedback.findMany({
    where: { submissionId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
};

export const SubmissionServices = {
  createSubmission,
  getMySubmission,
  getAllSubmissions,
  getSubmissionStatistics,
  updateSubmissionStatus,
  createReview,
  getReviewsBySubmission,
  deleteSubmission,
  getSubmissionById
};
