import { UserRole } from "../../../generated/prisma/enums.ts";

export interface CreateSubmissionInput {
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export interface ICreateReviewPayload {
  submissionId: string;
  message: string;
}
export interface IRequestUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}