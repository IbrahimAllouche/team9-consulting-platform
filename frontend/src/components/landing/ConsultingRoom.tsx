'use client'

import type { CSSProperties } from 'react'
import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react'
import LevelCompletionCelebration from './LevelCompletionCelebration'
import type { ConsultingStage } from './landingData'

type ConsultingRoomProps = {
  stage: ConsultingStage
}

const LEVEL_ONE_UNLOCK_KEY = 'ibm-level-one-unlocked'
const LEVEL_ONE_UNLOCK_EVENT = 'ibm-level-one-unlocked'

const subscribeToLocation = () => () => undefined

const readLevelOneCompletion = () =>
  new URLSearchParams(window.location.search).get('completed') === 'level-1'

const subscribeToLevelOneUnlock = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(LEVEL_ONE_UNLOCK_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(LEVEL_ONE_UNLOCK_EVENT, onStoreChange)
  }
}

const readLevelOneUnlock = () => window.localStorage.getItem(LEVEL_ONE_UNLOCK_KEY) === 'true'

const roomImageByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': '/assets/landing/rooms/findALead2.png',
  'outreach-office': '/assets/landing/rooms/outreach.png',
  'preparation-room': '/assets/landing/rooms/meetingPrep.png',
  'client-meeting': '/assets/landing/rooms/clientMeeting.png',
  'proposal-room': '/assets/landing/rooms/proposalAndNegotiation.png',
  'closing-room': '/assets/landing/rooms/closeDeal.png',
}

const roomImageDescriptionByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': 'Top-down networking lounge with an elevator entrance',
  'outreach-office': 'Office desk prepared for client outreach',
  'preparation-room': 'Meeting preparation desk and presentation screen',
  'client-meeting': 'Client meeting table and presentation screen',
  'proposal-room': 'Proposal and negotiation conference table',
  'closing-room': 'Executive seating area for closing the deal',
}

export default function ConsultingRoom({ stage }: ConsultingRoomProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)

  const levelOneJustCompleted = useSyncExternalStore(
    subscribeToLocation,
    readLevelOneCompletion,
    () => false
  )

  const levelOneUnlocked = useSyncExternalStore(
    subscribeToLevelOneUnlock,
    readLevelOneUnlock,
    () => false
  )

  const isInitialLevelOneLock = stage.id === 1 && !levelOneUnlocked && !levelOneJustCompleted

  const effectiveStatus: ConsultingStage['status'] =
    levelOneJustCompleted && stage.id === 1
      ? 'completed'
      : levelOneJustCompleted && stage.id === 2
        ? 'active'
        : isInitialLevelOneLock
          ? 'locked'
          : stage.status

  const isActive = effectiveStatus === 'active'
  const isCompleted = effectiveStatus === 'completed'
  const isLocked = effectiveStatus === 'locked'
  const isPlayable = isActive || isCompleted

  const isLevelTwoNewlyUnlocked = levelOneJustCompleted && stage.id === 2

  const isShowingUnlockAnimation = isUnlocking && stage.id === 1

  const imageSource = roomImageByType[stage.roomType]
  const imageDescription = roomImageDescriptionByType[stage.roomType]

  const roomAnimationStyle = {
    '--room-delay': `${(stage.id - 1) * 110}ms`,
  } as CSSProperties

  const unlockLevelOne = () => {
    setIsUnlocking(true)

    window.localStorage.setItem(LEVEL_ONE_UNLOCK_KEY, 'true')
    window.dispatchEvent(new Event(LEVEL_ONE_UNLOCK_EVENT))

    window.setTimeout(() => {
      setIsUnlocking(false)
    }, 1400)
  }

  return (
    <>
      {stage.id === 2 && <LevelCompletionCelebration show={levelOneJustCompleted} />}

      <section
        id={`stage-${stage.id}`}
        style={roomAnimationStyle}
        className={`game-room border-charcoal relative min-h-80 overflow-hidden border-[4px] transition-all duration-500 ${
          isPlayable
            ? 'game-room-active cursor-pointer bg-[#ffdda3]'
            : 'game-room-locked cursor-not-allowed bg-white'
        } ${isCompleted ? 'ring-8 ring-[#5b8c4a]/55' : ''} ${
          isLevelTwoNewlyUnlocked || isShowingUnlockAnimation
            ? 'z-10 shadow-[0_0_38px_rgba(201,138,62,0.85)] ring-8 ring-[#c98a3e]'
            : ''
        }`}
        aria-labelledby={`stage-${stage.id}-title`}
      >
        {isActive && <div className="room-light-sweep" aria-hidden="true" />}

        {isShowingUnlockAnimation && (
          <div
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
            aria-hidden="true"
          >
            <Sparkles className="absolute top-[20%] left-[18%] h-8 w-8 animate-ping text-[#c98a3e]" />
            <Sparkles className="absolute top-[42%] right-[14%] h-6 w-6 animate-pulse text-[#5b8c4a]" />
            <Sparkles className="absolute bottom-[18%] left-[44%] h-7 w-7 animate-ping text-[#c98a3e]" />
          </div>
        )}

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

            {isInitialLevelOneLock ? (
              <button
                type="button"
                onClick={unlockLevelOne}
                className="start-room-button border-charcoal bg-dark-blue hover:bg-building-near mt-3 inline-flex items-center gap-2 rounded-lg border-[3px] px-5 py-2 text-sm font-extrabold text-white transition"
              >
                <Sparkles className="h-4 w-4" />
                UNLOCK LEVEL 1
              </button>
            ) : isPlayable ? (
              <Link
                href={stage.href}
                className={`start-room-button border-charcoal mt-3 inline-block rounded-lg border-[3px] px-5 py-2 text-sm font-extrabold text-white transition ${
                  isCompleted
                    ? 'bg-plant-green hover:bg-dark-blue'
                    : 'bg-dark-blue hover:bg-building-near'
                }`}
              >
                {isCompleted ? 'REPLAY' : isLevelTwoNewlyUnlocked ? 'ENTER LEVEL 2' : 'START HERE'}
              </Link>
            ) : (
              <p className="text-charcoal mt-2 max-w-56 text-sm leading-6">
                {stage.shortDescription}
              </p>
            )}
          </div>
        </div>

        <div
          className={`absolute z-0 overflow-hidden ${
            stage.id === 1 ? 'inset-x-0 top-35 bottom-0' : 'inset-x-2 top-28 bottom-2'
          } ${isLocked ? 'opacity-55' : 'opacity-100'}`}
        >
          <div
            className={`relative h-full w-full ${stage.id === 1 ? 'origin-top scale-[1.12]' : ''}`}
          >
            <Image
              src={imageSource}
              alt={imageDescription}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 90vw"
              className="room-furniture object-contain object-top"
              priority={stage.id === 1}
            />
          </div>
        </div>
      </section>
    </>
  )
}
