import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PERSONA_FALLBACK_MESSAGE,
  requestPersonaReply,
} from '@/features/game/dialogue/personaDialogue'

// Mock the fetch boundary so every transport fallback remains deterministic and
// CI never needs a Groq key or a deployed environment to verify client behaviour.
describe('requestPersonaReply', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('returns a successful persona reply', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: 'Hello, consultant.',
          conversation_complete: false,
          covered_info_points: ['business_problem'],
          missing_info_points: ['urgency'],
          coverage_ready: true,
          ready_to_close: true,
          conversation_hint: 'Wrap up the conversation.',
          suggested_closing_reply: 'Thanks for your time.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result).toEqual({
      reply: 'Hello, consultant.',
      conversationComplete: false,
      coveredInfoPoints: ['business_problem'],
      missingInfoPoints: ['urgency'],
      coverageReady: true,
      readyToClose: true,
      hint: 'Wrap up the conversation.',
      suggestedClosingReply: 'Thanks for your time.',
      completionReason: undefined,
      usedFallback: false,
      reason: 'success',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/persona/respond',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          persona_id: 'test-level-1',
          history: [],
          covered_info_points: [],
        }),
      })
    )
  })

  it('returns the fallback after a server error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Failed' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.conversationComplete).toBe(false)
    expect(result.coveredInfoPoints).toEqual([])
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('server')
  })

  it('returns the fallback after a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')))

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.conversationComplete).toBe(false)
    expect(result.coveredInfoPoints).toEqual([])
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('network')
  })

  it('returns the fallback when the server response is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('not-json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.reason).toBe('invalid-response')
  })

  it('returns the fallback when the server omits a usable reply', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ reply: '   ' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.reason).toBe('invalid-response')
  })

  it('aborts a slow request and returns the timeout fallback', async () => {
    vi.useFakeTimers()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            options.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'))
            })
          })
      )
    )

    const pendingResult = requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
      timeoutMs: 100,
    })

    await vi.advanceTimersByTimeAsync(100)

    const result = await pendingResult

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.conversationComplete).toBe(false)
    expect(result.coveredInfoPoints).toEqual([])
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('timeout')
  })
})
