"use client";

import { useState } from "react";

import { getClientContext } from "./clientContext";
import { evaluateProposal } from "./evaluateProposal";
import { initialProposal } from "./initialProposal";
import styles from "./ProposalBuilder.module.css";
import { saveProposal } from "./saveProposal";

import type {
  ClientId,
  ProposalEvaluation,
  ProposalFormData,
  ProposalValidationErrors,
} from "./types";

import {
  hasValidationErrors,
  validateProposal,
} from "./validation";

type ProposalBuilderProps = {
  clientId: ClientId;
};

export default function ProposalBuilder({
  clientId,
}: ProposalBuilderProps) {
  const client = getClientContext(clientId);

  const [proposal, setProposal] =
    useState<ProposalFormData>(initialProposal);

  const [errors, setErrors] =
    useState<ProposalValidationErrors>({});

  const [reviewMode, setReviewMode] = useState(false);

  const [evaluation, setEvaluation] =
    useState<ProposalEvaluation | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [savedSessionId, setSavedSessionId] =
    useState<string | null>(null);

  const proposalFields: Array<keyof ProposalFormData> = [
    "businessProblem",
    "proposedSolution",
    "objectives",
    "timeline",
    "investmentValue",
    "nextSteps",
  ];

  const completedSections = proposalFields.filter(
    (field) => proposal[field].trim().length > 0
  ).length;

  const energyPercentage = Math.round(
    (completedSections / proposalFields.length) * 100
  );

  function getEnergyStatus() {
    if (energyPercentage === 100) {
      return "CORE FULLY CHARGED";
    }

    if (energyPercentage >= 67) {
      return "HIGH ENERGY";
    }

    if (energyPercentage >= 34) {
      return "CORE CHARGING";
    }

    if (energyPercentage > 0) {
      return "ENERGY DETECTED";
    }

    return "CORE OFFLINE";
  }

  function getOutcomeLabel(
    outcome: ProposalEvaluation["outcome"]
  ) {
    if (outcome === "accepted") {
      return "ENGAGEMENT ACCEPTED";
    }

    if (outcome === "revision_required") {
      return "REVISION REQUIRED";
    }

    return "CLIENT OBJECTION RAISED";
  }

  function handleChange(
    field: keyof ProposalFormData,
    value: string
  ) {
    setProposal((currentProposal) => ({
      ...currentProposal,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setEvaluation(null);
    setSaveError(null);
    setSavedSessionId(null);
  }

  function handleReview() {
    const validationErrors = validateProposal(proposal);

    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setReviewMode(false);
      return;
    }

    setReviewMode(true);
    setEvaluation(null);
    setSaveError(null);
    setSavedSessionId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleEditProposal() {
    setReviewMode(false);
    setEvaluation(null);
    setSaveError(null);
    setSavedSessionId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleFinalSubmit() {
    const validationErrors = validateProposal(proposal);

    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setReviewMode(false);
      return;
    }

    const result = evaluateProposal(
      clientId,
      proposal
    );

    setEvaluation(result);
    setSaveError(null);
    setSavedSessionId(null);
    setIsSaving(true);

    try {
      const savedResult = await saveProposal({
        clientId,
        proposal,
        evaluation: result,
      });

      setSavedSessionId(savedResult.sessionId);
    } catch (error) {
      console.error(
        "Failed to save Level 5 proposal:",
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save the proposal."
      );
    } finally {
      setIsSaving(false);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function renderReviewSection(
    number: string,
    title: string,
    value: string
  ) {
    return (
      <div
        className={`${styles.fieldGroup} ${styles.completedModule}`}
      >
        <div className={styles.moduleHeader}>
          <span className={styles.label}>
            {number} // {title}
          </span>

          <span className={styles.moduleStatus}>
            SYNCHRONISED
          </span>
        </div>

        <p className={styles.clientText}>
          {value}
        </p>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.levelBadge}>
            LEVEL 5
          </div>

          <h1 className={styles.title}>
            Proposal Builder
          </h1>

          <p className={styles.subtitle}>
            Power the proposal core by completing each
            consulting module and prepare your engagement
            for client review.
          </p>
        </header>

        <section className={styles.energyPanel}>
          <div className={styles.energyPanelHeader}>
            <div>
              <p className={styles.energyLabel}>
                PROPOSAL CORE ENERGY
              </p>

              <h2 className={styles.energyStatus}>
                {getEnergyStatus()}
              </h2>
            </div>

            <div className={styles.energyPercentage}>
              {energyPercentage}%
            </div>
          </div>

          <div className={styles.energyTrack}>
            <div
              className={styles.energyFill}
              style={{
                width: `${energyPercentage}%`,
              }}
            />
          </div>

          <div className={styles.energyDetails}>
            <span>
              {completedSections} / 6 MODULES SYNCHRONISED
            </span>

            <span>
              {energyPercentage === 100
                ? "SYSTEM READY"
                : "CHARGE REQUIRED"}
            </span>
          </div>
        </section>

        <div className={styles.layout}>
          <aside className={styles.clientCard}>
            <div className={styles.core}>
              <div className={styles.coreInner}>
                <span>{energyPercentage}%</span>
              </div>
            </div>

            <h2 className={styles.clientName}>
              {client.name}
            </h2>

            <p className={styles.clientRole}>
              {client.role} — {client.company}
            </p>

            <h3 className={styles.sectionTitle}>
              Client Situation
            </h3>

            <p className={styles.clientText}>
              {client.businessProblem}
            </p>

            <h3 className={styles.sectionTitle}>
              Client Priorities
            </h3>

            <ul className={styles.priorityList}>
              {client.priorities.map((priority) => (
                <li key={priority}>{priority}</li>
              ))}
            </ul>

            <div className={styles.systemReadout}>
              <span>CLIENT LINK</span>
              <strong>ACTIVE</strong>
            </div>

            <div className={styles.systemReadout}>
              <span>CORE STATUS</span>

              <strong>
                {energyPercentage === 100
                  ? "READY"
                  : "CHARGING"}
              </strong>
            </div>
          </aside>

          {!reviewMode ? (
            <section className={styles.formCard}>
              <h2 className={styles.formTitle}>
                Construct Consulting Proposal
              </h2>

              <p className={styles.formDescription}>
                Complete all six modules to fully charge
                the proposal core.
              </p>

              <div className={styles.formGrid}>
                <div
                  className={`${styles.fieldGroup} ${
                    proposal.businessProblem.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="businessProblem"
                    >
                      01 // Business Problem
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.businessProblem.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <textarea
                    id="businessProblem"
                    className={styles.textarea}
                    placeholder="Define the client's core business challenge..."
                    value={proposal.businessProblem}
                    onChange={(event) =>
                      handleChange(
                        "businessProblem",
                        event.target.value
                      )
                    }
                  />

                  {errors.businessProblem && (
                    <p className={styles.error}>
                      {errors.businessProblem}
                    </p>
                  )}
                </div>

                <div
                  className={`${styles.fieldGroup} ${
                    proposal.proposedSolution.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="proposedSolution"
                    >
                      02 // Solution & Scope
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.proposedSolution.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <textarea
                    id="proposedSolution"
                    className={styles.textarea}
                    placeholder="Describe your proposed consulting solution and scope..."
                    value={proposal.proposedSolution}
                    onChange={(event) =>
                      handleChange(
                        "proposedSolution",
                        event.target.value
                      )
                    }
                  />

                  {errors.proposedSolution && (
                    <p className={styles.error}>
                      {errors.proposedSolution}
                    </p>
                  )}
                </div>

                <div
                  className={`${styles.fieldGroup} ${
                    proposal.objectives.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="objectives"
                    >
                      03 // Engagement Objectives
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.objectives.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <textarea
                    id="objectives"
                    className={styles.textarea}
                    placeholder="Define measurable engagement objectives..."
                    value={proposal.objectives}
                    onChange={(event) =>
                      handleChange(
                        "objectives",
                        event.target.value
                      )
                    }
                  />

                  {errors.objectives && (
                    <p className={styles.error}>
                      {errors.objectives}
                    </p>
                  )}
                </div>

                <div
                  className={`${styles.fieldGroup} ${
                    proposal.timeline.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="timeline"
                    >
                      04 // Timeline
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.timeline.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <input
                    id="timeline"
                    className={styles.input}
                    type="text"
                    placeholder="Example: 12-week phased engagement"
                    value={proposal.timeline}
                    onChange={(event) =>
                      handleChange(
                        "timeline",
                        event.target.value
                      )
                    }
                  />

                  {errors.timeline && (
                    <p className={styles.error}>
                      {errors.timeline}
                    </p>
                  )}
                </div>

                <div
                  className={`${styles.fieldGroup} ${
                    proposal.investmentValue.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="investmentValue"
                    >
                      05 // Investment & Value
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.investmentValue.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <textarea
                    id="investmentValue"
                    className={styles.textarea}
                    placeholder="Explain the investment and expected business value..."
                    value={proposal.investmentValue}
                    onChange={(event) =>
                      handleChange(
                        "investmentValue",
                        event.target.value
                      )
                    }
                  />

                  {errors.investmentValue && (
                    <p className={styles.error}>
                      {errors.investmentValue}
                    </p>
                  )}
                </div>

                <div
                  className={`${styles.fieldGroup} ${
                    proposal.nextSteps.trim()
                      ? styles.completedModule
                      : ""
                  }`}
                >
                  <div className={styles.moduleHeader}>
                    <label
                      className={styles.label}
                      htmlFor="nextSteps"
                    >
                      06 // Recommended Next Steps
                    </label>

                    <span className={styles.moduleStatus}>
                      {proposal.nextSteps.trim()
                        ? "SYNCED"
                        : "WAITING"}
                    </span>
                  </div>

                  <textarea
                    id="nextSteps"
                    className={styles.textarea}
                    placeholder="Define the next actions for the client and consulting team..."
                    value={proposal.nextSteps}
                    onChange={(event) =>
                      handleChange(
                        "nextSteps",
                        event.target.value
                      )
                    }
                  />

                  {errors.nextSteps && (
                    <p className={styles.error}>
                      {errors.nextSteps}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.reviewButton}
                  type="button"
                  onClick={handleReview}
                >
                  {energyPercentage === 100
                    ? "INITIALISE PROPOSAL REVIEW"
                    : `CORE ENERGY ${energyPercentage}%`}
                </button>
              </div>
            </section>
          ) : (
            <section className={styles.formCard}>
              <div className={styles.levelBadge}>
                {evaluation
                  ? "CLIENT RESPONSE"
                  : "REVIEW MODE"}
              </div>

              <h2 className={styles.formTitle}>
                {evaluation
                  ? "Proposal Evaluation"
                  : "Proposal Core Review"}
              </h2>

              {!evaluation ? (
                <>
                  <p className={styles.formDescription}>
                    Verify all synchronised proposal modules
                    before transmitting the engagement to{" "}
                    {client.name}.
                  </p>

                  <div className={styles.success}>
                    ✓ CORE ENERGY 100% — ALL SIX MODULES
                    SYNCHRONISED
                  </div>

                  <h3 className={styles.sectionTitle}>
                    Client Target
                  </h3>

                  <div
                    className={`${styles.fieldGroup} ${styles.completedModule}`}
                  >
                    <div className={styles.moduleHeader}>
                      <span className={styles.label}>
                        {client.name}
                      </span>

                      <span className={styles.moduleStatus}>
                        LINKED
                      </span>
                    </div>

                    <p className={styles.clientText}>
                      {client.role} — {client.company}
                    </p>
                  </div>

                  <div
                    className={styles.formGrid}
                    style={{ marginTop: "20px" }}
                  >
                    {renderReviewSection(
                      "01",
                      "Business Problem",
                      proposal.businessProblem
                    )}

                    {renderReviewSection(
                      "02",
                      "Solution & Scope",
                      proposal.proposedSolution
                    )}

                    {renderReviewSection(
                      "03",
                      "Engagement Objectives",
                      proposal.objectives
                    )}

                    {renderReviewSection(
                      "04",
                      "Timeline",
                      proposal.timeline
                    )}

                    {renderReviewSection(
                      "05",
                      "Investment & Value",
                      proposal.investmentValue
                    )}

                    {renderReviewSection(
                      "06",
                      "Recommended Next Steps",
                      proposal.nextSteps
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.reviewButton}
                      type="button"
                      onClick={handleEditProposal}
                      style={{ marginRight: "14px" }}
                    >
                      EDIT PROPOSAL
                    </button>

                    <button
                      className={styles.reviewButton}
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "TRANSMITTING..."
                        : "TRANSMIT TO CLIENT"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.success}>
                    {getOutcomeLabel(evaluation.outcome)}
                    {" — "}
                    PROPOSAL SCORE {evaluation.score}/100
                  </div>

                  {isSaving && (
                    <div className={styles.success}>
                      SAVING PROPOSAL DATA...
                    </div>
                  )}

                  {savedSessionId && (
                    <div className={styles.success}>
                      ✓ PROPOSAL SAVED TO FIRESTORE
                    </div>
                  )}

                  {saveError && (
                    <p className={styles.error}>
                      Save failed: {saveError}
                    </p>
                  )}

                  <h3 className={styles.sectionTitle}>
                    Evaluation Summary
                  </h3>

                  <div className={styles.fieldGroup}>
                    <p className={styles.clientText}>
                      {evaluation.summary}
                    </p>
                  </div>

                  <h3 className={styles.sectionTitle}>
                    Client Response
                  </h3>

                  <div
                    className={`${styles.fieldGroup} ${styles.completedModule}`}
                  >
                    <div className={styles.moduleHeader}>
                      <span className={styles.label}>
                        {client.name}
                      </span>

                      <span className={styles.moduleStatus}>
                        RESPONSE RECEIVED
                      </span>
                    </div>

                    <p className={styles.clientText}>
                      “{evaluation.clientResponse}”
                    </p>
                  </div>

                  <div
                    className={styles.formGrid}
                    style={{ marginTop: "20px" }}
                  >
                    <div className={styles.fieldGroup}>
                      <div className={styles.moduleHeader}>
                        <span className={styles.label}>
                          STRENGTHS
                        </span>

                        <span className={styles.moduleStatus}>
                          {evaluation.strengths.length}
                        </span>
                      </div>

                      {evaluation.strengths.length > 0 ? (
                        <ul className={styles.priorityList}>
                          {evaluation.strengths.map(
                            (strength) => (
                              <li key={strength}>
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className={styles.clientText}>
                          No major strengths detected.
                        </p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <div className={styles.moduleHeader}>
                        <span className={styles.label}>
                          CONCERNS
                        </span>

                        <span className={styles.moduleStatus}>
                          {evaluation.concerns.length}
                        </span>
                      </div>

                      {evaluation.concerns.length > 0 ? (
                        <ul className={styles.priorityList}>
                          {evaluation.concerns.map(
                            (concern) => (
                              <li key={concern}>
                                {concern}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className={styles.clientText}>
                          No major concerns detected.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.reviewButton}
                      type="button"
                      onClick={handleEditProposal}
                    >
                      REVISE PROPOSAL
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}