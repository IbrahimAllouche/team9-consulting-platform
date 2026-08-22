import Image from 'next/image'
import { LockKeyhole } from 'lucide-react'
import type { ConsultingStage } from './landingData'

type ConsultingRoomProps = {
  stage: ConsultingStage
}

/**
 * Maps each consulting stage to the exact PNG filename stored inside:
 *
 * public/assets/landing/rooms
 *
 * Public assets begin at "/", so "public" is deliberately omitted from these
 * browser URLs.
 */
const roomImageByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': '/assets/landing/rooms/findALead.png',
  'outreach-office': '/assets/landing/rooms/outreach.png',
  'preparation-room': '/assets/landing/rooms/meetingPrep.png',
  'client-meeting': '/assets/landing/rooms/clientMeeting.png',
  'proposal-room': '/assets/landing/rooms/proposalAndNegotiation.png',
  'closing-room': '/assets/landing/rooms/closeDeal.png',
}

/**
 * Supplies useful alternative text for the furniture illustration.
 *
 * Room names and lock states remain real HTML rather than being baked into the
 * images, keeping the page accessible and easier to update later.
 */
const roomImageDescriptionByType: Record<ConsultingStage['roomType'], string> = {
  'lead-room': 'Networking tables and chairs inside the lead-finding lobby',
  'outreach-office': 'Office desk prepared for client outreach',
  'preparation-room': 'Meeting preparation desk and presentation screen',
  'client-meeting': 'Client meeting table and presentation screen',
  'proposal-room': 'Proposal and negotiation conference table',
  'closing-room': 'Executive seating area for closing the deal',
}

/**
 * Displays one stage of the connected consulting dollhouse.
 *
 * Furniture is now rendered from a fixed PNG rather than CSS shapes. Because
 * the whole image scales together, every desk, chair and plant keeps exactly
 * the same relative position at every screen size.
 */
export default function ConsultingRoom({ stage }: ConsultingRoomProps) {
  const isActive = stage.status === 'active'
  const isLocked = stage.status === 'locked'

  const imageSource = roomImageByType[stage.roomType]
  const imageDescription = roomImageDescriptionByType[stage.roomType]

  return (
    <section
      id={`stage-${stage.id}`}
      className={`border-charcoal relative min-h-80 overflow-hidden border-[4px] ${
        isActive ? 'bg-[#ffdda3]' : 'bg-cloud-white'
      }`}
      aria-labelledby={`stage-${stage.id}-title`}
    >
      {/*
       * The room heading sits above the image so generated artwork can never
       * cover the stage number, name, lock or action button.
       */}
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
              <LockKeyhole className="text-charcoal mt-0.5 h-5 w-5 shrink-0" aria-label="Locked" />
            )}
          </div>

          {isActive ? (
            <button
              type="button"
              className="border-charcoal bg-dark-blue hover:bg-building-near mt-3 rounded-lg border-[3px] px-5 py-2 text-sm font-extrabold text-white shadow-[3px_3px_0_var(--charcoal)] transition"
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
       * The transparent image is fitted inside the available room area.
       *
       * object-contain prevents cropping, while object-bottom keeps furniture
       * visually grounded on the room floor.
       */}
      <div
        className={`absolute inset-x-2 top-28 bottom-2 ${isLocked ? 'opacity-65' : 'opacity-100'}`}
      >
        <Image
          src={imageSource}
          alt={imageDescription}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 90vw"
          className="object-contain object-bottom"
          priority={stage.id === 1}
        />
      </div>

      {/*
       * Locked rooms remain visible, but this light overlay makes their
       * unavailable state clear without obscuring the artwork.
       */}
      {isLocked && (
        <div
          className="bg-warm-grey/10 pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        />
      )}
    </section>
  )
}
