export type ProposalFormData = {
  businessProblem: string;
  proposedSolution: string;
  objectives: string;
  timeline: string;
  investmentValue: string;
  nextSteps: string;
};

export type ProposalValidationErrors = {
  businessProblem?: string;
  proposedSolution?: string;
  objectives?: string;
  timeline?: string;
  investmentValue?: string;
  nextSteps?: string;
};

export type ClientId = "sarah" | "david";

export type ProposalSubmission = {
  clientId: ClientId;
  proposal: ProposalFormData;
  submittedAt: string;
};

export type ProposalOutcome =
  | "accepted"
  | "revision_required"
  | "objection_raised";

export type ProposalEvaluation = {
  outcome: ProposalOutcome;
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  clientResponse: string;
};