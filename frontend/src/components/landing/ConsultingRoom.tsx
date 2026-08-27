'use client'

import type { CSSProperties } from 'react'
import { useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, LockKeyhole } from 'lucide-react'
import LevelCompletionCelebration from './LevelCompletionCelebration'
import type { ConsultingStage } from './landingData'

type ConsultingRoomProps = {
  stage: ConsultingStage
}

const subscribeToLocation = () => () => undefined

const readLevelOneCompletion = () =>
  new URLSearchParams(window.location.search).get('completed') === 'level-1'

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

export default function ConsultingRoom({ stage }: ConsultingRoomProps) {
  const levelOneJustCompleted = useSyncExternalStore(
    subscribeToLocation,
    readLevelOneCompletion,
    () => false
  )

  const effectiveStatus: ConsultingStage['status'] =
    levelOneJustCompleted && stage.id === 1
      ? 'completed'
      : levelOneJustCompleted && stage.id === 2
        ? 'active'
        : stage.status

  const isActive = effectiveStatus === 'active'
  const isCompleted = effectiveStatus === 'completed'
  const isLocked = effectiveStatus === 'locked'
  const isPlayable = isActive || isCompleted
  const isNewlyUnlocked = levelOneJustCompleted && stage.id === 2

  const imageSource = roomImageByType[stage.roomType]
  const imageDescription = roomImageDescriptionByType[stage.roomType]

  const roomAnimationStyle = {
    '--room-delay': `${(stage.id - 1) * 110}ms`,
  } as CSSProperties

  return (
    <>
      {stage.id === 2 && <LevelCompletionCelebration show={levelOneJustCompleted} />}

      <section
        id={`stage-${stage.id}`}
        style={roomAnimationStyle}
        className={`game-room border-charcoal relative min-h-80 overflow-hidden border-[4px] transition-all duration-500 ${
          isPlayable
            ? 'game-room-active cursor-pointer bg-[#ffdda3]'
            : 'game-room-locked bg-cloud-white cursor-not-allowed'
        } ${isCompleted ? 'ring-8 ring-[#5b8c4a]/55' : ''} ${
          isNewlyUnlocked
            ? 'z-10 animate-pulse shadow-[0_0_42px_rgba(201,138,62,0.9)] ring-8 ring-[#c98a3e]'
            : ''
        }`}
        aria-labelledby={`stage-${stage.id}-title`}
      >
        {isActive && <div className="room-light-sweep" aria-hidden="true" />}

        <div className="relative z-20 flex items-start gap-3 p-4">
          <div
            className={`border-charcoal flex h-14 w-12 shrink-0 items-center justify-center rounded-[35%] border-[3px] text-xl font-extrabold text-white shadow-[3px_3px_0_var(--charcoal)] ${
              isCompleted ? 'bg-plant-green' : 'bg-dark-blue'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-7 w-7" aria-label="Completed" /> : stage.id}
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

            {isPlayable ? (
              <Link
                href={stage.href}
                className={`start-room-button border-charcoal mt-3 inline-block rounded-lg border-[3px] px-5 py-2 text-sm font-extrabold text-white transition ${
                  isCompleted
                    ? 'bg-plant-green hover:bg-dark-blue'
                    : 'bg-dark-blue hover:bg-building-near'
                }`}
              >
                {isCompleted ? 'REPLAY' : isNewlyUnlocked ? 'ENTER LEVEL 2' : 'START HERE'}
              </Link>
            ) : (
              <p className="text-charcoal mt-2 max-w-56 text-sm leading-6">
                {stage.shortDescription}
              </p>
            )}
          </div>
        </div>

        <div
          className={`absolute inset-x-2 top-28 bottom-2 ${
            isLocked ? 'opacity-65' : 'opacity-100'
          }`}
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
    </>
  )
}
