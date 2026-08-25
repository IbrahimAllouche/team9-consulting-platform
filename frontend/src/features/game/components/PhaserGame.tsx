'use client'

import type Phaser from 'phaser'
import { useEffect, useRef } from 'react'

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let game: Phaser.Game | undefined
    let cancelled = false

    async function startGame() {
      const PhaserRuntime = await import('phaser')
      const { LevelOneScene } = await import('../scenes/LevelOneScene')

      if (cancelled || !containerRef.current) {
        return
      }

      game = new PhaserRuntime.Game({
        type: PhaserRuntime.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: '#f4ede1',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: {
              x: 0,
              y: 0,
            },
            debug: false,
          },
        },
        scale: {
          mode: PhaserRuntime.Scale.RESIZE,
          width: '100%',
          height: '100%',
        },
        scene: LevelOneScene,
      })
    }

    void startGame()

    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [])

  return <div ref={containerRef} className="h-full w-full overflow-hidden bg-[#f4ede1]" />
}
