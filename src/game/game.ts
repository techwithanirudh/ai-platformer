import kaplay from 'kaplay'
import type { Level } from '@/lib/level-schema'
import { EventBus } from './EventBus'

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_BACKGROUND = [141, 183, 255] as const
const DEFAULT_HUD_COLOR = { r: 255, g: 255, b: 255 }
const DEFAULT_ACCENT_COLOR = { r: 255, g: 220, b: 50 }
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

function hexToRgb(value: string) {
  const trimmed = value.trim()
  const match = HEX_COLOR.exec(trimmed)
  if (!match) {
    return null
  }
  const hex = match[1]
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
    ? null
    : { r, g, b }
}

function resolveTheme(level?: Level) {
  if (!level) {
    return {
      background: DEFAULT_BACKGROUND,
      hudColor: DEFAULT_HUD_COLOR,
      accentColor: DEFAULT_ACCENT_COLOR,
      platformTint: null as { r: number; g: number; b: number } | null,
    }
  }

  const background = hexToRgb(level.backgroundColor)
  const hudColor = hexToRgb(level.hudColor)
  const accentColor = hexToRgb(level.accentColor)

  const tilesetTint = {
    jungle: '#6cc04a',
    cave: '#5c5f66',
    castle: '#c9c9c9',
    space: '#6aa3ff',
    lava: '#ff5a3d',
  }[level.tileset]

  const platformTint = hexToRgb(level.platformTint ?? tilesetTint)

  return {
    background: background
      ? ([background.r, background.g, background.b] as const)
      : DEFAULT_BACKGROUND,
    hudColor: hudColor ?? DEFAULT_HUD_COLOR,
    accentColor: accentColor ?? DEFAULT_ACCENT_COLOR,
    platformTint,
  }
}

// ── Entry point ────────────────────────────────────────────────────────────────

export function StartGame(canvas: HTMLCanvasElement) {
  const k = kaplay({
    canvas,
    width: 960,
    height: 540,
    stretch: true,
    letterbox: true,
    background: [141, 183, 255],
    narrowPhaseCollisionAlgorithm: 'sat',
    broadPhaseCollisionAlgorithm: 'grid',
    global: false,
    debug: process.env.NODE_ENV === 'development',
  } as any)

  // Assets
  k.loadSprite('bean', '/sprites/bean.png')
  k.loadSprite('bag', '/sprites/bag.png')
  k.loadSprite('ghosty', '/sprites/ghosty.png')
  k.loadSprite('spike', '/sprites/spike.png')
  k.loadSprite('grass', '/sprites/grass.png')
  k.loadSprite('steel', '/sprites/steel.png')
  k.loadSprite('prize', '/sprites/jumpy.png')
  k.loadSprite('apple', '/sprites/apple.png')
  k.loadSprite('portal', '/sprites/portal.png')
  k.loadSprite('coin', '/sprites/coin.png')
  k.loadSound('coin', '/sounds/score.mp3')
  k.loadSound('powerup', '/sounds/powerup.mp3')
  k.loadSound('blip', '/sounds/blip.mp3')
  k.loadSound('hit', '/sounds/hit.mp3')
  k.loadSound('portal', '/sounds/portal.mp3')

  k.setGravity(3200)

  // ── Scenes ─────────────────────────────────────────────────────────────────

  k.scene(
    'game',
    (
      data: {
        levelId?: number
        coins?: number
        aiLevel?: Level
        levels?: Level[]
        levelIndex?: number
        setId?: string
      } = {}
    ) => game(data)
  )

  k.scene(
    'lose',
    (
      data: {
        levelId?: number
        coins?: number
        levels?: Level[]
        levelIndex?: number
        setId?: string
      } = {}
    ) => lose(data)
  )

  k.scene('lastLevel', (data: { setId?: string; coins?: number } = {}) =>
    lastLevel(data)
  )

  // React → Kaplay bridge
  EventBus.on('load-level', (level: Level) => {
    k.go('game', { aiLevel: level, coins: 0 })
  })

  EventBus.on('set-levels', ({ levels, startIndex, setId }) => {
    k.go('game', { levels, levelIndex: startIndex, coins: 0, setId })
  })

  k.onLoad(() => {
    // Scene is set by app events.
  })

  return k

  // ── Game ────────────────────────────────────────────────────────────────────

  function game({
    levelId = 0,
    coins: startCoins = 0,
    aiLevel,
    levels,
    levelIndex = 0,
    setId,
  }: {
    levelId?: number
    coins?: number
    aiLevel?: Level
    levels?: Level[]
    levelIndex?: number
    setId?: string
  }) {
    const activeLevel =
      levels && levels.length > 0 ? levels[levelIndex] : aiLevel
    const isAiLevel = !!activeLevel
    const theme = resolveTheme(activeLevel)

    // Custom components
    function customPatrol(speed = 60) {
      let dir = 1
      return {
        id: 'patrol',
        require: ['pos', 'area'],
        add(this: any) {
          this.on('collide', (_obj: any, col: any) => {
            if (col.isLeft()) {
              dir = 1
            } else if (col.isRight()) {
              dir = -1
            }
          })
        },
        update(this: any) {
          this.move(speed * dir, 0)
        },
      }
    }

    function big() {
      let timer = 0
      let isBig = false
      let destScale = 1
      return {
        id: 'big',
        require: ['scale'],
        update(this: any) {
          if (isBig) {
            timer -= k.dt()
            if (timer <= 0) {
              destScale = 1
              timer = 0
              isBig = false
            }
          }
          this.scale = this.scale.lerp(k.vec2(destScale), k.dt() * 6)
        },
        isBig() {
          return isBig
        },
        smallify() {
          destScale = 1
          timer = 0
          isBig = false
        },
        biggify(time: number) {
          destScale = 2
          timer = time
          isBig = true
        },
      }
    }

    // Shared tile definitions
    const tiles = {
      '-': () => [
        k.sprite('steel'),
        k.area(),
        k.body({ isStatic: true }),
        k.offscreen({ hide: true }),
        k.anchor('bot'),
      ],
      '0': () => [
        k.sprite('bag'),
        k.area(),
        k.body({ isStatic: true }),
        k.offscreen({ hide: true }),
        k.anchor('bot'),
      ],
      $: () => [
        k.sprite('coin'),
        k.area(),
        k.pos(0, -9),
        k.anchor('bot'),
        k.offscreen({ hide: true }),
        'coin',
      ],
      '%': () => [
        k.sprite('prize'),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor('bot'),
        k.offscreen({ hide: true }),
        'prize',
      ],
      '^': () => [
        k.sprite('spike'),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor('bot'),
        k.offscreen({ hide: true }),
        'danger',
      ],
      '#': () => [
        k.sprite('apple'),
        k.area(),
        k.anchor('bot'),
        k.body(),
        k.offscreen({ hide: true }),
        'apple',
      ],
      '>': () => [
        k.sprite('ghosty'),
        k.area(),
        k.anchor('bot'),
        k.body(),
        customPatrol(),
        k.offscreen({ hide: true }),
        'enemy',
      ],
      '@': () => [k.rect(2, 2), k.opacity(0), k.anchor('bot'), 'playerSpawn'],
      '!': () => [
        k.sprite('portal'),
        k.area({ scale: 0.5 }),
        k.anchor('bot'),
        k.pos(0, -12),
        k.offscreen({ hide: true }),
        'portal',
      ],
      '=': () => [
        k.sprite('grass'),
        ...(theme.platformTint
          ? [
              k.color(
                theme.platformTint.r,
                theme.platformTint.g,
                theme.platformTint.b
              ),
            ]
          : []),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor('bot'),
        k.offscreen({ hide: true }),
        'platform',
      ],
    }

    if (!activeLevel) {
      return
    }

    const levelMap = activeLevel.levelMap
    const level = k.addLevel(levelMap, {
      tileWidth: 64,
      tileHeight: 64,
      tiles,
    })

    k.setBackground(
      k.rgb(theme.background[0], theme.background[1], theme.background[2])
    )

    // Player spawn
    const spawnMarkers = level.get('playerSpawn')
    const spawnPos =
      spawnMarkers.length > 0 ? spawnMarkers[0].pos : k.vec2(64, 0)

    const player = k.add([
      k.sprite('bean'),
      k.pos(spawnPos),
      k.area(),
      k.scale(1),
      k.body(),
      big(),
      k.anchor('bot'),
    ])

    for (const m of spawnMarkers) {
      k.destroy(m)
    }

    // HUD
    let coins = startCoins

    k.add([
      k.rect(170, 34),
      k.pos(14, 10),
      k.fixed(),
      k.color(0, 0, 0),
      k.opacity(0.45),
    ])
    const coinsLabel = k.add([
      k.text(`COINS: ${coins}`, { size: 24 }),
      k.pos(24, 16),
      k.fixed(),
      k.color(theme.hudColor.r, theme.hudColor.g, theme.hudColor.b),
    ])

    k.add([
      k.rect(190, 28),
      k.pos(k.width() - 206, 10),
      k.fixed(),
      k.color(0, 0, 0),
      k.opacity(0.45),
    ])
    k.add([
      k.text(isAiLevel ? 'AI LEVEL' : `LEVEL ${levelId + 1}`, { size: 16 }),
      k.pos(k.width() - 16, 16),
      k.anchor('topright'),
      k.fixed(),
      k.color(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    ])

    // Physics / death
    player.onUpdate(() => {
      k.setCamPos(player.pos)
      if (player.pos.y >= FALL_DEATH) {
        if (levels && levels.length > 0) {
          k.go('lose', { levels, levelIndex, setId, coins })
        } else {
          k.go('lose', { levelId, coins })
        }
      }
    })

    player.onBeforePhysicsResolve((col: any) => {
      if (col.target.is(['platform', 'soft']) && player.isJumping()) {
        col.preventResolution()
      }
    })

    player.onCollide('danger', () => {
      if (levels && levels.length > 0) {
        k.go('lose', { levels, levelIndex, setId, coins })
      } else {
        k.go('lose', { levelId, coins })
      }
      k.play('hit')
    })

    player.onCollide('portal', () => {
      k.play('portal')
      if (!levels || levels.length === 0) {
        return
      }

      const nextIndex = levelIndex + 1
      if (nextIndex < levels.length) {
        k.go('game', { levels, levelIndex: nextIndex, coins, setId })
        return
      }
      k.go('lastLevel', { setId, coins })
    })

    // Enemy stomp vs side-hit
    player.onCollide('enemy', (enemy, col) => {
      if (col?.isBottom()) {
        player.jump(JUMP_FORCE * 1.5)
        k.destroy(enemy)
        k.addKaboom(player.pos)
        k.play('powerup')
      } else {
        if (levels && levels.length > 0) {
          k.go('lose', { levels, levelIndex, setId, coins })
        } else {
          k.go('lose', { levelId, coins })
        }
        k.play('hit')
      }
    })

    // Prize box → apple
    let hasApple = false
    for (const prize of level.get('prize')) {
      prize.onHeadbutted(() => {
        if (hasApple) {
          return
        }
        const apple = level.spawn('#', prize.tilePos.add(0, -1))
        if (apple) {
          apple.jump()
          hasApple = true
          k.play('blip')
        }
      })
    }

    player.onCollide('apple', (apple) => {
      k.destroy(apple)
      player.biggify(3)
      hasApple = false
      k.play('powerup')
    })

    // Coins with pitch ramp
    let coinPitch = 0
    k.onUpdate(() => {
      if (coinPitch > 0) {
        coinPitch = Math.max(0, coinPitch - k.dt() * 100)
      }
    })

    player.onCollide('coin', (coin) => {
      k.destroy(coin)
      k.play('coin', { detune: coinPitch })
      coinPitch += 100
      coins += 1
      coinsLabel.text = `COINS: ${coins}`
    })

    // Input
    function jump() {
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE)
      }
    }

    k.onKeyPress('space', jump)
    k.onKeyPress('up', jump)
    k.onKeyPress('w', jump)
    k.onKeyDown('left', () => player.move(-MOVE_SPEED, 0))
    k.onKeyDown('right', () => player.move(MOVE_SPEED, 0))
    k.onKeyDown('a', () => player.move(-MOVE_SPEED, 0))
    k.onKeyDown('d', () => player.move(MOVE_SPEED, 0))
    k.onKeyPress('down', () => {
      player.gravityScale = 3
    })
    k.onKeyRelease('down', () => {
      player.gravityScale = 1
    })
    k.onGamepadButtonPress('south', jump)
    k.onGamepadStick('left', (v: any) => player.move(v.x * MOVE_SPEED, 0))
    k.onKeyPress('f', () => k.setFullscreen(!k.isFullscreen()))
    k.onKeyPress('escape', () => {
      if (setId) {
        EventBus.emit('navigate', '/')
      }
    })
  }

  // ── Lose ────────────────────────────────────────────────────────────────────

  function lose({
    levelId = 0,
    levels,
    levelIndex = 0,
    setId,
    coins = 0,
  }: {
    levelId?: number
    levels?: Level[]
    levelIndex?: number
    setId?: string
    coins?: number
  }) {
    k.add([k.rect(k.width(), k.height()), k.color(20, 10, 10), k.pos(0, 0)])

    k.add([
      k.text('YOU DIED', { size: 64 }),
      k.pos(k.width() / 2, k.height() / 2 - 80),
      k.anchor('center'),
      k.color(220, 50, 50),
    ])

    k.add([
      k.text(`coins: ${coins}`, { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor('center'),
      k.color(180, 180, 180),
    ])

    const loseCtaText = setId ? 'SPACE  retry      ESC  home' : 'SPACE  retry'
    k.add([
      k.text(loseCtaText, { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.anchor('center'),
      k.color(255, 255, 255),
    ])

    k.onKeyPress('space', () => {
      if (levels && levels.length > 0) {
        k.go('game', { levels, levelIndex, coins: 0, setId })
      } else {
        k.go('game', { levelId, coins: 0 })
      }
    })
    k.onKeyPress('enter', () => {
      if (levels && levels.length > 0) {
        k.go('game', { levels, levelIndex, coins: 0, setId })
      } else {
        k.go('game', { levelId, coins: 0 })
      }
    })
    k.onKeyPress('escape', () => {
      if (setId) {
        EventBus.emit('navigate', '/')
      }
    })
  }

  function lastLevel({ setId, coins = 0 }: { setId?: string; coins?: number }) {
    k.add([k.rect(k.width(), k.height()), k.color(15, 10, 25), k.pos(0, 0)])

    k.add([
      k.text('LAST LEVEL!', { size: 56 }),
      k.pos(k.width() / 2, k.height() / 2 - 90),
      k.anchor('center'),
      k.color(255, 220, 80),
    ])

    k.add([
      k.text(`coins collected: ${coins}`, { size: 22 }),
      k.pos(k.width() / 2, k.height() / 2 - 20),
      k.anchor('center'),
      k.color(220, 220, 220),
    ])

    k.add([
      k.text('SPACE  build a new level', { size: 20 }),
      k.pos(k.width() / 2, k.height() / 2 + 40),
      k.anchor('center'),
      k.color(255, 255, 255),
    ])

    k.add([
      k.text('ESC  back home', { size: 16 }),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.anchor('center'),
      k.color(180, 180, 180),
    ])

    k.onKeyPress('space', () => {
      if (setId) {
        EventBus.emit('navigate', '/')
      }
    })
    k.onKeyPress('escape', () => {
      if (setId) {
        EventBus.emit('navigate', '/')
      }
    })
  }
}
