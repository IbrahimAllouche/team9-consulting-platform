import type { initialConsultantProgress } from './landingData'

type ConsultantProgress = typeof initialConsultantProgress

type ProgressPanelProps = {
  progress: ConsultantProgress
}

/**
 * Displays the consultant's current level, stage completion and statistics.
 *
 * The values are currently passed from the landing-page placeholder data.
 * Later, the same component can receive real Firebase progress without needing
 * any visual redesign.
 */
export default function ProgressPanel({ progress }: ProgressPanelProps) {
  /*
   * Guarding against division by zero prevents an invalid percentage if the
   * required XP or stage count has not yet been configured.
   */
  const xpPercentage =
    progress.requiredXp > 0
      ? Math.min(100, Math.round((progress.currentXp / progress.requiredXp) * 100))
      : 0

  const stagePercentage =
    progress.totalStages > 0
      ? Math.min(100, Math.round((progress.completedStages / progress.totalStages) * 100))
      : 0

  return (
    <aside className="grid content-start gap-6" aria-label="Consultant progress">
      {/* Level and XP card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-3xl border-[5px] p-6 shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-2xl font-extrabold">Level {progress.level}</h2>

        <div
          className="bg-warm-grey border-charcoal mt-6 h-5 overflow-hidden rounded-full border-[3px]"
          role="progressbar"
          aria-label="Experience points"
          aria-valuemin={0}
          aria-valuemax={progress.requiredXp}
          aria-valuenow={progress.currentXp}
        >
          <div
            className="xp-progress-fill bg-dark-blue h-full rounded-full transition-[width] duration-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>

        <p className="text-charcoal mt-4 text-base font-semibold">
          {progress.currentXp} / {progress.requiredXp} XP
        </p>
      </section>

      {/* Overall consulting-loop progress card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-3xl border-[5px] p-6 text-center shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-2xl font-extrabold">Your progress</h2>

        {/*
         * The donut chart is created with a conic gradient. This avoids adding
         * a chart library for a single small progress indicator.
         */}
        <div
          className="progress-donut border-charcoal relative mx-auto mt-7 flex h-44 w-44 items-center justify-center rounded-full border-[3px]"
          style={{
            background: `conic-gradient(
              var(--plant-green) 0% ${stagePercentage}%,
              var(--warm-grey) ${stagePercentage}% 100%
            )`,
          }}
          role="img"
          aria-label={`${stagePercentage}% of consulting stages complete`}
        >
          {/* Inner circle cuts out the middle of the conic gradient. */}
          <div className="border-charcoal bg-cloud-white absolute inset-6 flex items-center justify-center rounded-full border-[3px]">
            <span className="text-dark-blue text-4xl font-extrabold">{stagePercentage}%</span>
          </div>
        </div>

        <p className="text-charcoal mt-6 text-lg">
          {progress.completedStages} / {progress.totalStages} stages complete
        </p>
      </section>

      {/* Consultant statistics card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-3xl border-[5px] p-6 shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-2xl font-extrabold">Your stats</h2>

        <dl className="mt-6 space-y-4 text-base">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal flex items-center gap-3">
              <span
                className="border-charcoal bg-honey-wood h-4 w-4 rounded-full border-2"
                aria-hidden="true"
              />
              XP earned
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.currentXp}</dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal flex items-center gap-3">
              <span
                className="border-charcoal bg-plant-green h-4 w-4 rounded-full border-2"
                aria-hidden="true"
              />
              Badges collected
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.badgesCollected}</dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal flex items-center gap-3">
              <span
                className="border-charcoal bg-light-blue h-4 w-4 rounded-full border-2"
                aria-hidden="true"
              />
              Duration spent
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.durationHours} Hrs</dd>
          </div>
        </dl>
      </section>
    </aside>
  )
}
