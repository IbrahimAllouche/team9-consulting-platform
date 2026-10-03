import type {
  ClientId,
  ProposalEvaluation,
  ProposalFormData,
} from "./types";

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();

  return terms.some((term) =>
    normalized.includes(term.toLowerCase())
  );
}

function evaluateSarah(
  proposal: ProposalFormData
): ProposalEvaluation {
  let score = 0;

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (
    includesAny(proposal.businessProblem, [
      "visibility",
      "delay",
      "supply",
      "operational",
      "data",
    ])
  ) {
    score += 20;
    strengths.push(
      "The proposal identifies Sarah's operational visibility and supply-chain challenges."
    );
  } else {
    concerns.push(
      "The business problem does not clearly connect to Sarah's operational challenges."
    );
  }

  if (
    includesAny(proposal.proposedSolution, [
      "visibility",
      "integration",
      "dashboard",
      "data",
      "process",
      "phased",
    ])
  ) {
    score += 20;
    strengths.push(
      "The proposed solution addresses operational visibility and process improvement."
    );
  } else {
    concerns.push(
      "The solution needs a clearer link to operational visibility and connected data."
    );
  }

  if (
    includesAny(proposal.objectives, [
      "reduce",
      "improve",
      "visibility",
      "delay",
      "efficiency",
      "measurable",
    ])
  ) {
    score += 15;
    strengths.push(
      "The engagement objectives are aligned with measurable operational improvement."
    );
  } else {
    concerns.push(
      "The objectives should be more measurable and operationally focused."
    );
  }

  if (
    includesAny(proposal.timeline, [
      "week",
      "month",
      "phase",
      "phased",
    ])
  ) {
    score += 15;
    strengths.push(
      "The timeline gives the client a clear implementation structure."
    );
  } else {
    concerns.push(
      "The timeline should provide a clearer implementation period or phased approach."
    );
  }

  if (
    includesAny(proposal.investmentValue, [
      "value",
      "cost",
      "saving",
      "efficiency",
      "return",
      "benefit",
      "roi",
    ])
  ) {
    score += 15;
    strengths.push(
      "The proposal explains business value rather than only describing activities."
    );
  } else {
    concerns.push(
      "The investment section should explain expected business value or measurable benefit."
    );
  }

  if (
    includesAny(proposal.nextSteps, [
      "pilot",
      "workshop",
      "review",
      "approve",
      "kickoff",
      "next",
    ])
  ) {
    score += 15;
    strengths.push(
      "The proposal provides clear next actions for moving the engagement forward."
    );
  } else {
    concerns.push(
      "The proposal needs clearer next steps for the client."
    );
  }

  if (score >= 80) {
    return {
      outcome: "accepted",
      score,
      summary:
        "The proposal strongly aligns with Sarah Chen's operational priorities.",
      strengths,
      concerns,
      clientResponse:
        "This feels practical and focused on the operational issues we need to solve. I am comfortable moving this forward.",
    };
  }

  if (score >= 55) {
    return {
      outcome: "revision_required",
      score,
      summary:
        "Sarah sees potential in the proposal, but several areas need stronger operational detail.",
      strengths,
      concerns,
      clientResponse:
        "The direction makes sense, but I need more confidence around implementation, measurable value, and how disruption will be controlled.",
    };
  }

  return {
    outcome: "objection_raised",
    score,
    summary:
      "The proposal does not yet provide enough evidence that it will solve Sarah's operational priorities.",
    strengths,
    concerns,
    clientResponse:
      "I am not ready to move forward yet. The proposal needs to connect much more clearly to our operational challenges and expected outcomes.",
  };
}

function evaluateDavid(
  proposal: ProposalFormData
): ProposalEvaluation {
  let score = 0;

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (
    includesAny(proposal.businessProblem, [
      "customer",
      "fragmented",
      "data",
      "system",
      "integration",
    ])
  ) {
    score += 20;
    strengths.push(
      "The proposal identifies David's fragmented customer-data challenge."
    );
  } else {
    concerns.push(
      "The business problem does not clearly address fragmented customer data."
    );
  }

  if (
    includesAny(proposal.proposedSolution, [
      "integration",
      "customer",
      "data",
      "platform",
      "focused",
      "targeted",
      "pilot",
    ])
  ) {
    score += 20;
    strengths.push(
      "The solution is connected to customer-data integration and a focused engagement."
    );
  } else {
    concerns.push(
      "The solution needs a stronger technical and customer-data integration focus."
    );
  }

  if (
    includesAny(proposal.objectives, [
      "integrate",
      "customer",
      "data",
      "reduce",
      "improve",
      "measurable",
    ])
  ) {
    score += 15;
    strengths.push(
      "The objectives provide measurable direction for improving customer-data use."
    );
  } else {
    concerns.push(
      "The objectives should be more measurable and technically specific."
    );
  }

  if (
    includesAny(proposal.timeline, [
      "week",
      "month",
      "phase",
      "pilot",
    ])
  ) {
    score += 15;
    strengths.push(
      "The timeline suggests a controlled and structured engagement."
    );
  } else {
    concerns.push(
      "The timeline should show a controlled delivery approach."
    );
  }

  if (
    includesAny(proposal.investmentValue, [
      "value",
      "cost",
      "roi",
      "return",
      "efficiency",
      "revenue",
      "benefit",
    ])
  ) {
    score += 15;
    strengths.push(
      "The proposal explains the commercial value of the engagement."
    );
  } else {
    concerns.push(
      "The proposal should better justify the investment and expected commercial value."
    );
  }

  if (
    includesAny(proposal.nextSteps, [
      "pilot",
      "technical",
      "workshop",
      "review",
      "approve",
      "kickoff",
    ])
  ) {
    score += 15;
    strengths.push(
      "The next steps keep the engagement controlled and actionable."
    );
  } else {
    concerns.push(
      "David needs clearer and more focused next steps before committing."
    );
  }

  if (score >= 80) {
    return {
      outcome: "accepted",
      score,
      summary:
        "The proposal is focused, technically relevant, and avoids unnecessary consulting scope.",
      strengths,
      concerns,
      clientResponse:
        "This is focused enough for me. The scope is clear, the technical problem is understood, and the next steps are controlled. We can move ahead.",
    };
  }

  if (score >= 55) {
    return {
      outcome: "revision_required",
      score,
      summary:
        "David sees value in the proposal but wants a tighter technical scope and stronger justification.",
      strengths,
      concerns,
      clientResponse:
        "There is something useful here, but I want a tighter scope. Show me exactly what we are solving, what the technical outcome is, and why we need this level of engagement.",
    };
  }

  return {
    outcome: "objection_raised",
    score,
    summary:
      "The proposal feels too broad or insufficiently connected to David's customer-data priorities.",
    strengths,
    concerns,
    clientResponse:
      "I am not convinced yet. This feels too broad and I do not want a large consulting engagement without a very specific technical outcome.",
  };
}

export function evaluateProposal(
  clientId: ClientId,
  proposal: ProposalFormData
): ProposalEvaluation {
  if (clientId === "david") {
    return evaluateDavid(proposal);
  }

  return evaluateSarah(proposal);
}