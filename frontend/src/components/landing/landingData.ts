/**
 * The six stages come directly from the approved consulting-loop document.
 *
 * Keeping this information outside the visual components means the labels,
 * unlock rules and routes can later be replaced with Firebase progress data
 * without redesigning the landing page.
 */
export type ConsultingStage = {
  id: number
  name: string
  shortDescription: string
  href: string
  status: 'active' | 'locked' | 'completed'
  roomType:
    | 'lead-room'
    | 'outreach-office'
    | 'preparation-room'
    | 'client-meeting'
    | 'proposal-room'
    | 'closing-room'
}

export const consultingStages: ConsultingStage[] = [
  {
    id: 1,
    name: 'Find a Lead',
    shortDescription: 'Begin your consulting journey.',
    href: '/levels/find-a-lead',
    status: 'active',
    roomType: 'lead-room',
  },
  {
    id: 2,
    name: 'Outreach',
    shortDescription: 'Complete the previous stage to unlock.',
    href: '/levels/outreach',
    status: 'locked',
    roomType: 'outreach-office',
  },
  {
    id: 3,
    name: 'Preparing for a Meeting',
    shortDescription: 'Complete the previous stage to unlock.',
    href: '/levels/preparing-for-a-meeting',
    status: 'locked',
    roomType: 'preparation-room',
  },
  {
    id: 4,
    name: 'Client Meeting',
    shortDescription: 'Complete the previous stage to unlock.',
    href: '/levels/client-meeting',
    status: 'locked',
    roomType: 'client-meeting',
  },
  {
    id: 5,
    name: 'Proposal and Negotiation',
    shortDescription: 'Complete the previous stage to unlock.',
    href: '/levels/proposal-and-negotiation',
    status: 'locked',
    roomType: 'proposal-room',
  },
  {
    id: 6,
    name: 'Close Deal',
    shortDescription: 'Complete the previous stage to unlock.',
    href: '/levels/close-deal',
    status: 'locked',
    roomType: 'closing-room',
  },
]

/**
 * Placeholder progress for Sprint 1.
 *
 * Later, these values can come from the authenticated user's Firebase profile.
 */
export const initialConsultantProgress = {
  level: 1,
  currentXp: 0,
  requiredXp: 5000,
  completedStages: 0,
  totalStages: consultingStages.length,
  badgesCollected: 0,
  durationHours: 0,
}
