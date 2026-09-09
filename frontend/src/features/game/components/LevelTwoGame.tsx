'use client'

import type Phaser from 'phaser'
import { useEffect, useRef } from 'react'

const GAME_WIDTH = 1440
const GAME_HEIGHT = 720

/**
 * Level 2 owns a separate Phaser instance so its scene lifecycle cannot affect Level 1.
 * Keeping this wrapper small also lets the route remain a normal Next.js server component.
 */
export function LevelTwoGame() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let game: Phaser.Game | undefined
    let cancelled = false

    const startGame = async () => {
      const PhaserRuntime = await import('phaser')
      const { LevelTwoScene } = await import('../scenes/LevelTwoScene')

      if (cancelled || !containerRef.current) return

      game = new PhaserRuntime.Game({
        type: PhaserRuntime.AUTO,
        parent: containerRef.current,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: '#efe1c7',
        autoFocus: true,
        dom: {
          // The consultant notebook uses a real textarea so normal editing,
          // spaces and keyboard shortcuts behave exactly as they do in Level 1.
          createContainer: true,
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scale: {
          mode: PhaserRuntime.Scale.FIT,
          autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        },
        scene: LevelTwoScene,
      })
    }

    void startGame()

    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [])

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#2c2c2a]">
      <div ref={containerRef} className="relative h-full w-full overflow-hidden" />
    </div>
  )
}
