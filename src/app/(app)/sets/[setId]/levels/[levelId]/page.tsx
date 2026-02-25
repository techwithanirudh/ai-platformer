import { notFound } from 'next/navigation'
import { getSession } from '@/server/auth'
import {
  getChatMessages,
  getLevelWithSet,
  getOrCreateChatForSet,
} from '@/server/db/queries'
import { LevelBuilder } from './_components/level-builder'

interface LevelBuilderPageProps {
  params: Promise<{ setId: string; levelId: string }>
}

export default async function LevelBuilderPage({
  params,
}: LevelBuilderPageProps) {
  const { setId, levelId } = await params
  const session = await getSession()
  const userId = session?.user?.id ?? ''

  const levelData = await getLevelWithSet(userId, levelId)
  if (!levelData || levelData.set.id !== setId) {
    notFound()
  }

  const set = levelData.set
  const level = levelData.level
  const chat = await getOrCreateChatForSet({ setId, userId })
  const chatMessages = chat ? await getChatMessages(chat.id) : []

  return (
    <div className='flex h-full min-h-0 flex-col gap-4'>
      <div>
        <div className='text-foreground/60 text-xs uppercase tracking-[0.3em]'>
          level builder
        </div>
        <h1 className='font-heading text-3xl'>{level.title}</h1>
      </div>

      <div className='min-h-0 flex-1'>
        <LevelBuilder
          chatId={chat?.id ?? setId}
          initialLevel={{
            levelMap: level.levelMap,
            tileset: level.tileset as
              | 'jungle'
              | 'cave'
              | 'castle'
              | 'space'
              | 'lava',
            difficulty: level.difficulty as 'easy' | 'medium' | 'hard',
            backgroundColor: level.backgroundColor,
            hudColor: level.hudColor,
            accentColor: level.accentColor,
            platformTint: level.platformTint ?? level.accentColor,
          }}
          initialMessages={chatMessages.map((message) => ({
            id: message.id,
            role: message.role as 'user' | 'assistant',
            parts: [{ type: 'text', text: message.content }],
          }))}
          initialTitle={level.title}
          levelId={level.id}
          setId={setId}
          setTheme={set.theme}
        />
      </div>
    </div>
  )
}
