export const PERSONA_FALLBACK_MESSAGE =
  "Sorry, I'm having trouble responding right now. Please try speaking with me again."

export const DEFAULT_PERSONA_TIMEOUT_MS = 10_000

export type PersonaReplyResult = {
  reply: string
  usedFallback: boolean
  reason: 'success' | 'timeout' | 'network' | 'server' | 'invalid-response'
}

type RequestPersonaReplyOptions = {
  message: string
  timeoutMs?: number
}

type PersonaApiBody = {
  reply?: unknown
}

export async function requestPersonaReply({
  message,
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
      body: JSON.stringify({ message }),
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

    return {
      reply: body.reply.trim(),
      usedFallback: false,
      reason: 'success',
    }
  } catch {
    return fallbackResult(controller.signal.aborted ? 'timeout' : 'network')
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

function fallbackResult(
  reason: Exclude<PersonaReplyResult['reason'], 'success'>
): PersonaReplyResult {
  return {
    reply: PERSONA_FALLBACK_MESSAGE,
    usedFallback: true,
    reason,
  }
}
