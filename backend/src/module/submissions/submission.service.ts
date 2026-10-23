import httpStatus from "http-status";
import type { SubmissionStatus } from "../../../generated/prisma/enums.ts";
import { prisma } from "../../libs/prisma.ts";
import { AppError } from "../../utils/AppError.ts";
import { CreateSubmissionInput, ICreateReviewPayload } from "./submissions.interface.ts";

interface SubmissionQuery {
  page: number;
  limit: number;
  status?: SubmissionStatus;
}


const createSubmission = async (
  studentId: string,
  payload: CreateSubmissionInput,
) => {
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      studentId,
      projectName: payload.projectName,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingSubmission) {
    if (existingSubmission.status === "PENDING") {
      return prisma.submission.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          ...payload,
          status: "PENDING",
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
    }

    const statusMessages = {
      PENDING: "Your Project Is Waiting for Review",
      APPROVED: "Your Project Has Been Approved",
      REJECTED: "Your Project Has Been Rejected",
    };

    throw new AppError(
      httpStatus.CONFLICT,
      statusMessages[existingSubmission.status] ??
        "You Have Already Submitted This Project",
    );
  }

  return prisma.submission.create({
    data: {
      ...payload,
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
  deleteSubmission
};
