import type { Metadata } from 'next'
import { getServerSession } from '@/actions/auth.actions'
import { adminDb } from '@/lib/firebase/admin'
import ConsultingRoom from '@/components/landing/ConsultingRoom'
import ProgressPanel from '@/components/landing/ProgressPanel'
import { consultingStages, initialConsultantProgress } from '@/components/landing/landingData'

export const metadata: Metadata = {
  title: 'Consulting Lobby',
}

/**
 * Main landing page and game lobby.
 *
 * This remains a server component so the user's Firebase profile can be read
 * securely without exposing Firebase Admin credentials to the browser.
 */
export default async function DashboardPage() {
  const session = await getServerSession()

  const profileSnapshot = session ? await adminDb.collection('users').doc(session.uid).get() : null

  const displayName = profileSnapshot?.exists
    ? (profileSnapshot.data()?.displayName as string | null)
    : null

  const consultantName = displayName ?? session?.email ?? 'Consultant'

  const findLeadStage = consultingStages.find((stage) => stage.id === 1)
  const outreachStage = consultingStages.find((stage) => stage.id === 2)
  const preparationStage = consultingStages.find((stage) => stage.id === 3)
  const clientMeetingStage = consultingStages.find((stage) => stage.id === 4)
  const proposalStage = consultingStages.find((stage) => stage.id === 5)
  const closeDealStage = consultingStages.find((stage) => stage.id === 6)

  /*
   * All six stages are required for the consulting loop. Failing immediately
   * gives developers a clear error if one is accidentally removed later.
   */
  if (
    !findLeadStage ||
    !outreachStage ||
    !preparationStage ||
    !clientMeetingStage ||
    !proposalStage ||
    !closeDealStage
  ) {
    throw new Error('The consulting-loop stage configuration is incomplete.')
  }

  return (
    <div className="bg-warm-cream min-h-[calc(100vh-6rem)]">
      <div className="mx-auto max-w-[1800px] px-4 py-10 sm:px-7 lg:px-10">
        {/* Landing-page introduction */}
        <section aria-labelledby="lobby-heading">
          <p className="text-dark-blue text-sm font-extrabold tracking-[0.16em] uppercase">
            Welcome, {consultantName}
          </p>

          <h1
            id="lobby-heading"
            className="text-charcoal mt-2 text-[clamp(2rem,4vw,3.4rem)] leading-tight font-extrabold"
          >
            Your consultancy journey starts here
          </h1>

          <p className="text-charcoal mt-3 text-lg font-semibold sm:text-xl">
            Complete each stage of the consulting loop.
          </p>
        </section>

        {/*
         * The connected dollhouse occupies the main area. Progress information
         * sits to its right on wide screens and moves underneath on tablets
         * and phones.
         */}
        <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section
            className="border-charcoal bg-honey-wood overflow-hidden rounded-3xl border-[6px] p-3 shadow-[8px_9px_0_var(--wood-shadow)]"
            aria-label="Consulting stages"
          >
            <div className="grid gap-1 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,2fr)]">
              {/*
               * Find a Lead is taller than the other rooms because it acts as
               * the lobby and entrance into the consulting journey.
               *
               * Its PNG already includes the entrance doors, so no separate
               * CSS door is added here.
               */}
              <div className="min-h-[650px] [&>section]:h-full">
                <ConsultingRoom stage={findLeadStage} />
              </div>

              {/* Remaining five connected consulting rooms */}
              <div className="grid gap-1 sm:grid-cols-2">
                <ConsultingRoom stage={outreachStage} />
                <ConsultingRoom stage={preparationStage} />

                {/*
                 * The lower floor follows the approved order:
                 * Close Deal, Proposal and Negotiation, then Client Meeting.
                 */}
                <div className="sm:col-span-2">
                  <div className="grid gap-1 md:grid-cols-3">
                    <ConsultingRoom stage={closeDealStage} />
                    <ConsultingRoom stage={proposalStage} />
                    <ConsultingRoom stage={clientMeetingStage} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ProgressPanel progress={initialConsultantProgress} />
        </div>
      </div>
    </div>
  )
}
