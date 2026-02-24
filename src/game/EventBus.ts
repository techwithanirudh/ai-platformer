import EventEmitter from 'eventemitter3'
import type { Level } from '@/lib/level-schema'

interface Events {
  'hide-ai-prompt': []
  'level-ready': []
  'load-level': [level: Level]
  navigate: [url: string]
  'player-died': []
  'set-levels': [
    payload: { levels: Level[]; startIndex: number; setId?: string },
  ]
  'show-ai-prompt': []
}

export const EventBus = new EventEmitter<Events>()
