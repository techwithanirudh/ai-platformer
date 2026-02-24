'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { EventBus } from '@/game/EventBus'
import { StartGame } from '@/game/game'
import type { Level } from '@/lib/level-schema'

export interface GameCanvasProps {
  level?: Level | null
  levels?: Level[]
  setId?: string
  startIndex?: number
}

export default function GameCanvas({
  level,
  levels,
  startIndex = 0,
  setId,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const k = StartGame(canvasRef.current)
    return () => k.quit()
  }, [])

  useEffect(() => {
    const handleNavigate = (url: string) => {
      router.push(url)
    }
    EventBus.on('navigate', handleNavigate)
    return () => {
      EventBus.off('navigate', handleNavigate)
    }
  }, [router])

  useEffect(() => {
    if (!levels || levels.length === 0) {
      return
    }
    EventBus.emit('set-levels', {
      levels,
      startIndex,
      setId,
    })
  }, [levels, setId, startIndex])

  useEffect(() => {
    if (!level) {
      return
    }
    EventBus.emit('load-level', level)
  }, [level])

  return <canvas className='block h-full w-full' ref={canvasRef} />
}
