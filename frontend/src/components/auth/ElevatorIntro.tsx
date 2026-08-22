'use client'
import { useEffect, useRef, useState } from 'react'
/*
 * Timer IDs are retained so Skip animation can cancel the complete sequence.
 * Without this, an already-scheduled timer can make the elevator reappear.
 */
import { motion, useReducedMotion } from 'motion/react'

/**
 * The intro has four explicit phases so the timing and visual presentation
 * remain separate:
 *
 * checking - the doors are closed while the component starts
 * opening  - the two doors slide apart
 * leaving  - the complete overlay fades away
 * hidden   - the overlay is removed from the page
 *
 * Keeping these phases means we can change the cartoon styling without
 * rewriting the already-working animation behaviour.
 */
type IntroPhase = 'checking' | 'opening' | 'leaving' | 'hidden'

export default function ElevatorIntro() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>('checking')
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    /**
     * Store each timer centrally so both component cleanup and the Skip button
     * can cancel every pending phase change.
     */
    const registerTimer = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      timersRef.current.push(timer)
    }

    if (reduceMotion) {
      registerTimer(() => {
        setPhase('hidden')
      }, 0)
    } else {
      registerTimer(() => {
        setPhase('opening')
      }, 850)

      registerTimer(() => {
        setPhase('leaving')
      }, 2000)

      registerTimer(() => {
        setPhase('hidden')
      }, 2350)
    }

    return () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer)
      })

      timersRef.current = []
    }
  }, [reduceMotion])

  /**
   * The skip control immediately removes the overlay.
   *
   * We keep this control even though it is not prominent in the wireframe
   * because users should never be forced to wait for a decorative animation.
   */
  const skipIntro = () => {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer)
    })

    timersRef.current = []
    setPhase('hidden')
  }

  if (phase === 'hidden') {
    return null
  }

  const doorsAreOpening = phase === 'opening' || phase === 'leaving'

  return (
    <motion.div
      /*
       * This layer temporarily covers the already-rendered sign-in page.
       * Only the visual treatment has changed—the underlying authentication
       * page and Firebase loading behaviour remain untouched.
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
        className="border-charcoal bg-dark-blue hover:bg-building-near absolute top-4 right-4 z-[80] rounded-lg border-[3px] px-4 py-2 text-sm font-semibold text-white shadow-[3px_3px_0_var(--charcoal)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--charcoal)]"
      >
        Skip animation
      </button>

      {/*
       * The lift frame keeps the same proportions as the existing component.
       * Flat fills, strong outlines and small offset shadows create the new
       * cartoon appearance without changing the structure.
       */}
      <div className="border-charcoal bg-lift-silver-trim absolute top-[8%] bottom-[8%] left-1/2 w-[min(76vw,920px)] -translate-x-1/2 border-[10px] shadow-[10px_10px_0_rgba(44,44,42,0.22)]">
        {/*
         * It displays floor 1 because this is the opening transition into the
         * first stage of the academy experience.
         */}
        <div className="border-charcoal bg-charcoal absolute top-[-10px] left-1/2 z-[75] flex h-11 w-28 -translate-x-1/2 items-center justify-center gap-2 rounded-sm border-[3px] font-semibold text-white">
          <motion.span
            className="text-cloud-white"
            aria-hidden="true"
            animate={{
              y: [2, -2, 2],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ▲
          </motion.span>

          <span>1</span>
        </div>

        {/*
         * A dark interior remains behind the doors. It is visible only while
         * they open and provides enough contrast to make the movement clear.
         */}
        <div className="bg-charcoal absolute inset-0 z-[50]">
          <div className="bg-lift-silver-dark border-charcoal absolute inset-x-0 bottom-0 h-5 border-t-[3px]" />
        </div>

        {/*
         * LEFT DOOR
         *
         * The door remains an independent Motion element so it can slide left.
         * The flat silver fill and black outlines follow the cartoon wireframe.
         */}
        <motion.div
          className="border-charcoal bg-lift-silver-light absolute inset-y-0 left-0 z-[55] w-1/2 overflow-hidden border-r-[3px]"
          initial={{ x: '0%' }}
          animate={{ x: doorsAreOpening ? '-102%' : '0%' }}
          transition={{
            duration: 1.05,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          {/*
           * This recessed rectangle matches the detailed panel already used by
           * the working elevator. Only the outline is made more cartoon-like.
           */}
          <div className="border-charcoal absolute inset-7 border-[6px] bg-[#d8dcdf]">
            <div className="border-lift-silver-dark absolute inset-3 border-[3px]" />
          </div>
        </motion.div>

        {/*
         * RIGHT DOOR
         *
         * This mirrors the left door and moves in the opposite direction.
         */}
        <motion.div
          className="border-charcoal bg-lift-silver-light absolute inset-y-0 right-0 z-[55] w-1/2 overflow-hidden border-l-[3px]"
          initial={{ x: '0%' }}
          animate={{ x: doorsAreOpening ? '102%' : '0%' }}
          transition={{
            duration: 1.05,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          <div className="border-charcoal absolute inset-7 border-[6px] bg-[#d8dcdf]">
            <div className="border-lift-silver-dark absolute inset-3 border-[3px]" />
          </div>
        </motion.div>

        {/*
         * The centre seam strengthens the appearance of two physical doors.
         * It disappears just before the doors separate.
         */}
        <motion.div
          className="bg-charcoal absolute inset-y-0 left-1/2 z-[58] w-[6px] -translate-x-1/2"
          initial={{ opacity: 1 }}
          animate={{ opacity: doorsAreOpening ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        />

        {/*
         * The academy sign is attached visually to both doors, so it fades
         * before the doors move apart.
         */}
        <motion.div
          className="border-charcoal absolute top-1/2 left-1/2 z-[65] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-xl border-[5px] bg-[#c49300] px-4 py-5 text-center text-[clamp(1rem,3.2vw,2.5rem)] font-semibold whitespace-nowrap text-black shadow-[5px_5px_0_rgba(44,44,42,0.24)]"
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
       * The existing two-button call panel is retained exactly in purpose and
       * location. Strong outlines and flat fills bring it into the same visual
       * system as the redesigned doors.
       */}
      <div
        className="border-charcoal bg-lift-silver-light absolute top-1/2 right-[3%] z-[70] flex -translate-y-1/2 flex-col gap-3 border-[4px] p-3 shadow-[4px_4px_0_rgba(44,44,42,0.22)] sm:right-[7%]"
        aria-hidden="true"
      >
        <span className="border-charcoal bg-cloud-white text-charcoal flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-sm">
          ▲
        </span>

        <span className="border-charcoal bg-cloud-white text-charcoal flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-sm">
          ▼
        </span>
      </div>
    </motion.div>
  )
}
