import type { CSSProperties } from 'react'
import Image from 'next/image'
import { LockKeyhole } from 'lucide-react'
import type { ConsultingStage } from './landingData'

type ConsultingRoomProps = {
  stage: ConsultingStage
}

const roomImageByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': '/assets/landing/rooms/findALead.png',
  'outreach-office': '/assets/landing/rooms/outreach.png',
  'preparation-room': '/assets/landing/rooms/meetingPrep.png',
  'client-meeting': '/assets/landing/rooms/clientMeeting.png',
  'proposal-room': '/assets/landing/rooms/proposalAndNegotiation.png',
  'closing-room': '/assets/landing/rooms/closeDeal.png',
}

const roomImageDescriptionByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': 'Networking tables and chairs inside the lead-finding lobby',
  'outreach-office': 'Office desk prepared for client outreach',
  'preparation-room': 'Meeting preparation desk and presentation screen',
  'client-meeting': 'Client meeting table and presentation screen',
  'proposal-room': 'Proposal and negotiation conference table',
  'closing-room': 'Executive seating area for closing the deal',
}

/**
 * Displays one consulting stage inside the connected dollhouse.
 *
 * Each room receives an animation delay based on its stage number, producing a
 * deliberate one-by-one reveal instead of every room appearing simultaneously.
 */
export default function ConsultingRoom({ stage }: ConsultingRoomProps) {
  const isActive = stage.status === 'active'
  const isLocked = stage.status === 'locked'

  const imageSource = roomImageByType[stage.roomType]
  const imageDescription = roomImageDescriptionByType[stage.roomType]

  const roomAnimationStyle = {
    '--room-delay': `${(stage.id - 1) * 110}ms`,
  } as CSSProperties

  return (
    <section
      id={`stage-${stage.id}`}
      style={roomAnimationStyle}
      className={`game-room border-charcoal relative min-h-80 overflow-hidden border-[4px] ${
        isActive
          ? 'game-room-active cursor-pointer bg-[#ffdda3]'
          : 'game-room-locked bg-cloud-white cursor-not-allowed'
      }`}
      aria-labelledby={`stage-${stage.id}-title`}
    >
      {/* Animated light appears only over the currently playable room. */}
      {isActive && <div className="room-light-sweep" aria-hidden="true" />}

      <div className="relative z-20 flex items-start gap-3 p-4">
        <div className="border-charcoal bg-dark-blue flex h-14 w-12 shrink-0 items-center justify-center rounded-[35%] border-[3px] text-xl font-extrabold text-white shadow-[3px_3px_0_var(--charcoal)]">
          {stage.id}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2
              id={`stage-${stage.id}-title`}
              className="text-charcoal text-lg leading-tight font-extrabold"
            >
              {stage.name}
            </h2>

            {isLocked && (
              <LockKeyhole
                className="room-lock text-charcoal mt-0.5 h-5 w-5 shrink-0"
                aria-label="Locked"
              />
            )}
          </div>

          {isActive ? (
            <button
              type="button"
              className="start-room-button border-charcoal bg-dark-blue hover:bg-building-near mt-3 rounded-lg border-[3px] px-5 py-2 text-sm font-extrabold text-white transition"
            >
              START HERE
            </button>
          ) : (
            <p className="text-charcoal mt-2 max-w-56 text-sm leading-6">
              {stage.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/*
       * The entire image scales and moves as one layer. This guarantees that
       * furniture never changes position independently.
       */}
      <div
        className={`absolute inset-x-2 top-28 bottom-2 ${isLocked ? 'opacity-65' : 'opacity-100'}`}
      >
        <Image
          src={imageSource}
          alt={imageDescription}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 90vw"
          className="room-furniture object-contain object-bottom"
          priority={stage.id === 1}
        />
      </div>

      {isLocked && (
        <div
          className="bg-warm-grey/10 pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        />
      )}
    </section>
  )
}
