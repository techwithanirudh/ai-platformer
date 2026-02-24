import Link from 'next/link'
import { redirect } from 'next/navigation'
import GameCanvas from '@/components/game-canvas'
import { Button } from '@/components/ui/button'
import { getSession } from '@/server/auth'
import { getSetWithLevels } from '@/server/db/queries'

interface PlaySetPageProps {
  params: Promise<{ setId: string }>
}

export default async function PlaySetPage({ params }: PlaySetPageProps) {
  const { setId } = await params
  const session = await getSession()
  const userId = session?.user?.id ?? ''

  const setData = await getSetWithLevels(userId, setId)
  if (!setData) {
    redirect('/')
  }

  const levelRows = setData.levels

  if (levelRows.length === 0) {
    return (
      <div className='fixed inset-0 grid place-items-center bg-black p-6'>
        <div className='grid max-w-xl gap-4 border-2 border-border bg-secondary-background p-8 text-center shadow-shadow'>
          <h1 className='font-heading text-3xl'>This set has no levels yet</h1>
          <p className='text-foreground/70 text-sm'>
            Create a level from Home, then play this set.
          </p>
          <div className='flex justify-center'>
            <Link href='/'>
              <Button>Back Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const levelList = levelRows.map((level) => ({
    levelMap: level.levelMap,
    tileset: level.tileset as 'jungle' | 'cave' | 'castle' | 'space' | 'lava',
    difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
    backgroundColor: level.backgroundColor,
    hudColor: level.hudColor,
    accentColor: level.accentColor,
    platformTint: level.platformTint ?? level.accentColor,
  }))

  return (
    <div className='fixed inset-0 bg-black'>
      <GameCanvas levels={levelList} setId={setId} />
    </div>
  )
}
