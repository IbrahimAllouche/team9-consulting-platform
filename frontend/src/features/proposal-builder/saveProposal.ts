import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  getClientAuth,
  getClientDb,
} from "@/lib/firebase/client";

import type {
  ClientId,
  ProposalEvaluation,
  ProposalFormData,
} from "./types";

type SaveProposalInput = {
  clientId: ClientId;
  proposal: ProposalFormData;
  evaluation: ProposalEvaluation;
};

export async function saveProposal({
  clientId,
  proposal,
  evaluation,
}: SaveProposalInput) {
  const auth = getClientAuth();
  const db = getClientDb();

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in before saving a proposal."
    );
  }

  const sessionId = `${user.uid}-level5-${clientId}`;

  const sessionRef = doc(
    db,
    "sessions",
    sessionId
  );

  await setDoc(
    sessionRef,
    {
      id: sessionId,
      uid: user.uid,
      personaId: clientId,
      level: 5,

      status: evaluation.outcome,

      messages: [],

      proposal: {
        businessProblem: proposal.businessProblem,
        proposedSolution: proposal.proposedSolution,
        objectives: proposal.objectives,
        timeline: proposal.timeline,
        investmentValue: proposal.investmentValue,
        nextSteps: proposal.nextSteps,
      },

      evaluation: {
        outcome: evaluation.outcome,
        score: evaluation.score,
        summary: evaluation.summary,
        strengths: evaluation.strengths,
        concerns: evaluation.concerns,
        clientResponse: evaluation.clientResponse,
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      _schemaVersion: 1,
    },
    {
      merge: true,
    }
  );

  return {
    sessionId,
    outcome: evaluation.outcome,
    score: evaluation.score,
  };
}