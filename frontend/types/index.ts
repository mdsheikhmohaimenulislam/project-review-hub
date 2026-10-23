export type UserRole = "STUDENT" | "MENTOR";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface Feedback {
  id: string;
  message: string;
  submissionId: string;
  createdAt: string;
  author?: Pick<User, "id" | "name" | "email" | "role">;
  authorId?: string;
}
export interface Submission {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  status: SubmissionStatus;
  studentId: string;
  createdAt: string;
  updatedAt?: string;
  student?: Pick<User, "id" | "name" | "email">;
  feedback?: Feedback[];
}
export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}
