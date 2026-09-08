export const PERSONA_FALLBACK_MESSAGE =
  "Sorry, I'm having trouble responding right now. Please try speaking with me again."

export const DEFAULT_PERSONA_TIMEOUT_MS = 10_000

export type PersonaConversationMessage = {
  role: 'player' | 'persona'
  content: string
}

export type PersonaReplyResult = {
  reply: string
  conversationComplete: boolean
  coveredInfoPoints: string[]
  usedFallback: boolean
  reason: 'success' | 'timeout' | 'network' | 'server' | 'invalid-response'
}

type RequestPersonaReplyOptions = {
  message: string
  personaId: string
  history?: PersonaConversationMessage[]
  timeoutMs?: number
}

type PersonaApiBody = {
  reply?: unknown
  conversation_complete?: unknown
  covered_info_points?: unknown
}

export async function requestPersonaReply({
  message,
  personaId,
  history = [],
  timeoutMs = DEFAULT_PERSONA_TIMEOUT_MS,
}: RequestPersonaReplyOptions): Promise<PersonaReplyResult> {
  const controller = new AbortController()

  const timeout = globalThis.setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch('/api/persona/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        persona_id: personaId,
        history,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return fallbackResult('server')
    }

    let body: PersonaApiBody

    try {
      body = (await response.json()) as PersonaApiBody
    } catch {
      return fallbackResult('invalid-response')
    }

    if (typeof body.reply !== 'string' || body.reply.trim().length === 0) {
      return fallbackResult('invalid-response')
    }

    const coveredInfoPoints = Array.isArray(body.covered_info_points)
      ? body.covered_info_points.filter(
          (item): item is string => typeof item === 'string'
        )
      : []

    return {
      reply: body.reply.trim(),
      conversationComplete: body.conversation_complete === true,
      coveredInfoPoints,
      usedFallback: false,
      reason: 'success',
    }
  } catch {
    return fallbackResult(
      controller.signal.aborted ? 'timeout' : 'network'
    )
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

function fallbackResult(
  reason: Exclude<PersonaReplyResult['reason'], 'success'>
): PersonaReplyResult {
  return {
    reply: PERSONA_FALLBACK_MESSAGE,
    conversationComplete: false,
    coveredInfoPoints: [],
    usedFallback: true,
    reason,
  }
}