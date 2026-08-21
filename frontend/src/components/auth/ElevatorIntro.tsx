'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type IntroPhase = 'checking' | 'opening' | 'leaving' | 'hidden'

export default function ElevatorIntro() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>('checking')

  useEffect(() => {
    /*
     * Users who request reduced motion should reach the form immediately.
     * The asynchronous update also satisfies React's effect linting rules.
     */
    if (reduceMotion) {
      const hideTimer = window.setTimeout(() => {
        setPhase('hidden')
      }, 0)

      return () => {
        window.clearTimeout(hideTimer)
      }
    }

    /*
     * The closed doors remain visible briefly before opening. The animation
     * runs on each fresh visit or refresh of the sign-in page.
     */
    const openTimer = window.setTimeout(() => {
      setPhase('opening')
    }, 850)

    const leaveTimer = window.setTimeout(() => {
      setPhase('leaving')
    }, 2000)

    const hideTimer = window.setTimeout(() => {
      setPhase('hidden')
    }, 2350)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
    }
  }, [reduceMotion])

  const skipIntro = () => {
    setPhase('hidden')
  }

  if (phase === 'hidden') {
    return null
  }

  const doorsAreOpening = phase === 'opening' || phase === 'leaving'

  return (
    <motion.div
      /*
       * The lift is a temporary full-screen layer above the already-rendered
       * sign-in page. When this layer fades, the academy screen is revealed.
       */
      className="bg-warm-cream fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'leaving' ? 0 : 1 }}
      transition={{ duration: 0.35 }}
      aria-label="IBM Consultancy 101 lift opening"
    >
      <button
        type="button"
        onClick={skipIntro}
        className="bg-charcoal/85 hover:bg-charcoal absolute top-4 right-4 z-[80] rounded-full px-4 py-2 text-sm font-medium text-white transition"
      >
        Skip animation
      </button>

      {/*
       * The outer trim acts as the architectural lift frame. Its heavy border
       * distinguishes the lift from an ordinary pair of sliding panels.
       */}
      <div className="border-lift-silver-trim absolute top-[8%] bottom-[8%] left-1/2 w-[min(76vw,920px)] -translate-x-1/2 border-[18px] bg-[#15191c] shadow-[0_28px_60px_rgba(44,44,42,0.30)] sm:border-[24px]">
        {/*
         * The illuminated floor indicator gives the lift a destination and
         * reinforces the "Going up?" theme of the following page.
         */}
        <div className="bg-charcoal border-lift-silver-dark absolute top-[-18px] left-1/2 z-[75] flex h-10 w-28 -translate-x-1/2 items-center justify-center gap-2 border-2 font-medium text-white shadow-lg sm:top-[-24px]">
          <motion.span
            className="text-light-blue"
            aria-hidden="true"
            animate={{
              y: [2, -2, 2],
              opacity: [0.65, 1, 0.65],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ▲
          </motion.span>

          <span>12</span>
        </div>

        {/*
         * A dark lift interior becomes visible between the doors as they open.
         * This creates more depth than exposing a flat wall immediately.
         */}
        <div className="absolute inset-0 z-[50] bg-[linear-gradient(90deg,#111518_0%,#2c3236_50%,#111518_100%)]">
          <div className="absolute inset-x-0 bottom-0 h-5 bg-[linear-gradient(180deg,#8b9196_0%,#3f4549_100%)] shadow-[0_-4px_10px_rgba(0,0,0,0.45)]" />
        </div>

        {/*
         * The subtle metallic gradients and inside-edge shadows give each door
         * the appearance of brushed metal rather than a flat grey rectangle.
         */}
        <motion.div
          className="border-lift-silver-trim absolute inset-y-0 left-0 z-[55] w-1/2 overflow-hidden border-r-2 shadow-[inset_-12px_0_18px_rgba(44,44,42,0.24)]"
          style={{
            background: 'linear-gradient(90deg, #b7bdc2 0%, #d5d9dc 48%, #b6bcc1 100%)',
          }}
          initial={{ x: '0%' }}
          animate={{ x: doorsAreOpening ? '-102%' : '0%' }}
          transition={{
            duration: 1.05,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          {/* Recessed decorative panel matching the approved wireframe. */}
          <div className="border-lift-silver-trim absolute inset-8 border-8 shadow-[inset_0_0_18px_rgba(90,97,102,0.20)]" />

          {/* Fine highlight along the outside edge suggests reflected light. */}
          <div className="absolute inset-y-0 left-0 w-2 bg-white/20" />
        </motion.div>

        <motion.div
          className="border-lift-silver-trim absolute inset-y-0 right-0 z-[55] w-1/2 overflow-hidden border-l-2 shadow-[inset_12px_0_18px_rgba(44,44,42,0.24)]"
          style={{
            background: 'linear-gradient(90deg, #b6bcc1 0%, #d5d9dc 52%, #b7bdc2 100%)',
          }}
          initial={{ x: '0%' }}
          animate={{ x: doorsAreOpening ? '102%' : '0%' }}
          transition={{
            duration: 1.05,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          <div className="border-lift-silver-trim absolute inset-8 border-8 shadow-[inset_0_0_18px_rgba(90,97,102,0.20)]" />

          <div className="absolute inset-y-0 right-0 w-2 bg-white/20" />
        </motion.div>

        {/*
         * A narrow centre seam remains visible while the doors are closed. It
         * disappears naturally once the doors slide away.
         */}
        <motion.div
          className="absolute inset-y-0 left-1/2 z-[58] w-2 -translate-x-1/2 bg-[#454b50] shadow-[0_0_12px_rgba(0,0,0,0.50)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: doorsAreOpening ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        />

        {/*
         * The sign is slightly narrower than before so the recessed door
         * details remain visible. It fades as the physical doors separate.
         */}
        <motion.div
          className="border-honey-wood bg-warm-cream absolute top-1/2 left-1/2 z-[65] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-4 py-4 text-center text-[clamp(1.1rem,3.4vw,2.6rem)] font-medium whitespace-nowrap text-black shadow-[0_8px_18px_rgba(44,44,42,0.25)]"
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: doorsAreOpening ? 0 : 1,
            scale: doorsAreOpening ? 0.96 : 1,
          }}
          transition={{ duration: 0.25 }}
        >
          IBM CONSULTANCY 101
        </motion.div>
      </div>

      {/*
       * The call panel uses the same metallic language as the doors. The up
       * control is illuminated because the journey is heading to floor 12.
       */}
      <div
        className="border-lift-silver-trim absolute top-1/2 right-[3%] z-[70] flex -translate-y-1/2 flex-col gap-3 rounded-md border-2 bg-[linear-gradient(145deg,#c8cdd1,#8b9196)] p-3 shadow-lg sm:right-[7%]"
        aria-hidden="true"
      >
        <span className="bg-light-blue text-dark-blue flex h-8 w-8 items-center justify-center rounded-full border border-white/70 text-sm shadow-[0_0_12px_rgba(126,182,224,0.85)]">
          ▲
        </span>

        <span className="bg-charcoal/80 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-sm text-white/70">
          ▼
        </span>
      </div>
    </motion.div>
  )
}
