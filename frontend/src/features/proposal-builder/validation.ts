import type {
  ProposalFormData,
  ProposalValidationErrors,
} from "./types";

export function validateProposal(
  proposal: ProposalFormData
): ProposalValidationErrors {
  const errors: ProposalValidationErrors = {};

  if (!proposal.businessProblem.trim()) {
    errors.businessProblem = "Business problem is required.";
  }

  if (!proposal.proposedSolution.trim()) {
    errors.proposedSolution = "Proposed solution is required.";
  }

  if (!proposal.objectives.trim()) {
    errors.objectives = "Objectives are required.";
  }

  if (!proposal.timeline.trim()) {
    errors.timeline = "Timeline is required.";
  }

  if (!proposal.investmentValue.trim()) {
    errors.investmentValue = "Investment or business value is required.";
  }

  if (!proposal.nextSteps.trim()) {
    errors.nextSteps = "Next steps are required.";
  }

  return errors;
}

export function hasValidationErrors(
  errors: ProposalValidationErrors
): boolean {
  return Object.keys(errors).length > 0;
}