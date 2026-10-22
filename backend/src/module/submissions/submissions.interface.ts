
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
