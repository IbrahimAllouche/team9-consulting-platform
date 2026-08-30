import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PERSONA_FALLBACK_MESSAGE,
  requestPersonaReply,
} from '@/features/game/dialogue/personaDialogue'

describe('requestPersonaReply', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('returns a successful persona reply', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ reply: 'Hello, consultant.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result).toEqual({
      reply: 'Hello, consultant.',
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
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('server')
  })

  it('returns the fallback after a network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Network unavailable'))
    )

    const result = await requestPersonaReply({
      message: 'Hello',
      personaId: 'test-level-1',
    })

    expect(result.reply).toBe(PERSONA_FALLBACK_MESSAGE)
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('network')
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
    expect(result.usedFallback).toBe(true)
    expect(result.reason).toBe('timeout')
  })
})