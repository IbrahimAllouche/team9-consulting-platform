import type { initialConsultantProgress } from './landingData'

type ConsultantProgress = typeof initialConsultantProgress

type ProgressPanelProps = {
  progress: ConsultantProgress
}

/**
 * Compact consultant progress sidebar.
 *
 * Laptop screens use smaller cards so the dollhouse receives most of the
 * available width. The cards expand again on extra-wide desktop screens.
 */
export default function ProgressPanel({ progress }: ProgressPanelProps) {
  const xpPercentage =
    progress.requiredXp > 0
      ? Math.min(100, Math.round((progress.currentXp / progress.requiredXp) * 100))
      : 0

  const stagePercentage =
    progress.totalStages > 0
      ? Math.min(100, Math.round((progress.completedStages / progress.totalStages) * 100))
      : 0

  return (
    <aside className="grid content-start gap-4 2xl:gap-6" aria-label="Consultant progress">
      {/* Compact level and XP card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-2xl border-[4px] p-4 shadow-[5px_6px_0_var(--charcoal)] 2xl:rounded-3xl 2xl:border-[5px] 2xl:p-6 2xl:shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-xl font-extrabold 2xl:text-2xl">
          Level {progress.level}
        </h2>

        <div
          className="bg-warm-grey border-charcoal mt-4 h-4 overflow-hidden rounded-full border-[2px] 2xl:mt-6 2xl:h-5 2xl:border-[3px]"
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

        <p className="text-charcoal mt-3 text-sm font-semibold 2xl:mt-4 2xl:text-base">
          {progress.currentXp} / {progress.requiredXp} XP
        </p>
      </section>

      {/* Compact consulting-loop progress card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-2xl border-[4px] p-4 text-center shadow-[5px_6px_0_var(--charcoal)] 2xl:rounded-3xl 2xl:border-[5px] 2xl:p-6 2xl:shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-xl font-extrabold 2xl:text-2xl">Your progress</h2>

        <div
          className="progress-donut border-charcoal relative mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-full border-[3px] 2xl:mt-7 2xl:h-44 2xl:w-44"
          style={{
            background: `conic-gradient(
              var(--plant-green) 0% ${stagePercentage}%,
              var(--warm-grey) ${stagePercentage}% 100%
            )`,
          }}
          role="img"
          aria-label={`${stagePercentage}% of consulting stages complete`}
        >
          <div className="border-charcoal bg-cloud-white absolute inset-4 flex items-center justify-center rounded-full border-[3px] 2xl:inset-6">
            <span className="text-dark-blue text-3xl font-extrabold 2xl:text-4xl">
              {stagePercentage}%
            </span>
          </div>
        </div>

        <p className="text-charcoal mt-4 text-sm 2xl:mt-6 2xl:text-lg">
          {progress.completedStages} / {progress.totalStages} stages complete
        </p>
      </section>

      {/* Compact statistics card */}
      <section className="game-progress-panel border-charcoal bg-cloud-white rounded-2xl border-[4px] p-4 shadow-[5px_6px_0_var(--charcoal)] 2xl:rounded-3xl 2xl:border-[5px] 2xl:p-6 2xl:shadow-[7px_8px_0_var(--charcoal)]">
        <h2 className="text-dark-blue text-xl font-extrabold 2xl:text-2xl">Your stats</h2>

        <dl className="mt-4 space-y-3 text-sm 2xl:mt-6 2xl:space-y-4 2xl:text-base">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-charcoal flex items-center gap-2 2xl:gap-3">
              <span
                className="border-charcoal bg-honey-wood h-3.5 w-3.5 shrink-0 rounded-full border-2 2xl:h-4 2xl:w-4"
                aria-hidden="true"
              />
              XP earned
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.currentXp}</dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-charcoal flex items-center gap-2 2xl:gap-3">
              <span
                className="border-charcoal bg-plant-green h-3.5 w-3.5 shrink-0 rounded-full border-2 2xl:h-4 2xl:w-4"
                aria-hidden="true"
              />
              Badges
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.badgesCollected}</dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-charcoal flex items-center gap-2 2xl:gap-3">
              <span
                className="border-charcoal bg-light-blue h-3.5 w-3.5 shrink-0 rounded-full border-2 2xl:h-4 2xl:w-4"
                aria-hidden="true"
              />
              Duration
            </dt>

            <dd className="text-dark-blue font-extrabold">{progress.durationHours} Hrs</dd>
          </div>
        </dl>
      </section>
    </aside>
  )
}
