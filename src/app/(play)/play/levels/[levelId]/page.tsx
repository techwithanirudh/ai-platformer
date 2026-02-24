import { redirect } from 'next/navigation'
import GameCanvas from '@/components/game-canvas'
import { getSession } from '@/server/auth'
import { getLevelWithSet } from '@/server/db/queries'

interface PlayLevelPageProps {
  params: Promise<{ levelId: string }>
}

export default async function PlayLevelPage({ params }: PlayLevelPageProps) {
  const { levelId } = await params
  const session = await getSession()
  const userId = session?.user?.id ?? ''

  const levelData = await getLevelWithSet(userId, levelId)
  if (!levelData) {
    redirect('/')
  }

  const level = levelData.level
  const orderedLevels = levelData.levels

  const levelList = orderedLevels.map((row) => ({
    levelMap: row.levelMap,
    tileset: row.tileset as 'jungle' | 'cave' | 'castle' | 'space' | 'lava',
    difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
    backgroundColor: row.backgroundColor,
    hudColor: row.hudColor,
    accentColor: row.accentColor,
    platformTint: row.platformTint ?? row.accentColor,
  }))

  const startIndex = Math.max(
    0,
    orderedLevels.findIndex((row) => row.id === levelId)
  )

  return (
    <div className='fixed inset-0 bg-black'>
      <GameCanvas
        levels={levelList}
        setId={level.setId}
        startIndex={startIndex}
      />
    </div>
  )
}
