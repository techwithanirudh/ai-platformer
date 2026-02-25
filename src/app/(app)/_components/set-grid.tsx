'use client'

import { Play, Plus, SquarePen, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useOptimisticAction } from 'next-safe-action/hooks'
import { useMemo, useState } from 'react'
import { CreateLevelDialog } from '@/app/(app)/_components/create-level-dialog'
import { deleteLevelAction } from '@/app/(app)/actions/levels'
import { deleteSetAction } from '@/app/(app)/actions/sets'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SetRow {
  id: string
  name: string
  theme: string
}

interface LevelRow {
  id: string
  order: number
  setId: string
  title: string
}

interface SetGridProps {
  levels: LevelRow[]
  sets: SetRow[]
}

const GRID_LIMIT = 16

export function SetGrid({ sets, levels }: SetGridProps) {
  const deleteLevel = useOptimisticAction(deleteLevelAction, {
    currentState: { levels },
    updateFn: (state, input) => ({
      levels: state.levels.filter((level) => level.id !== input.levelId),
    }),
  })

  const deleteSet = useOptimisticAction(deleteSetAction, {
    currentState: { sets },
    updateFn: (state, input) => ({
      sets: state.sets.filter((set) => set.id !== input.setId),
    }),
  })

  const effectiveSets = deleteSet.optimisticState.sets
  const setIds = new Set(effectiveSets.map((set) => set.id))
  const effectiveLevels = deleteLevel.optimisticState.levels.filter((level) =>
    setIds.has(level.setId)
  )

  const grouped = useMemo(() => {
    return effectiveLevels.reduce<Record<string, LevelRow[]>>((acc, level) => {
      acc[level.setId] ??= []
      acc[level.setId]?.push(level)
      return acc
    }, {})
  }, [effectiveLevels])

  return (
    <TooltipProvider>
      <div className='grid gap-6'>
        {effectiveSets.map((set) => (
          <SetSection
            key={set.id}
            levels={grouped[set.id] ?? []}
            onDeleteLevel={deleteLevel.execute}
            onDeleteSet={deleteSet.execute}
            set={set}
            setDeleteStatus={deleteSet.status}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}

function SetSection({
  set,
  levels,
  onDeleteLevel,
  onDeleteSet,
  setDeleteStatus,
}: {
  set: SetRow
  levels: LevelRow[]
  onDeleteLevel: (input: { levelId: string; setId: string }) => void
  onDeleteSet: (input: { setId: string }) => void
  setDeleteStatus: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isDeletingSet = setDeleteStatus === 'executing'
  const visibleLevels = expanded ? levels : levels.slice(0, GRID_LIMIT)
  const hasMore = levels.length > GRID_LIMIT

  return (
    <section className='grid gap-4 border-2 border-border bg-secondary-background p-6 shadow-shadow'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='text-foreground/60 text-xs uppercase tracking-[0.25em]'>
            {set.theme}
          </div>
          <div className='mt-1 font-heading text-2xl'>{set.name}</div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/play/sets/${set.id}`}>
                <Button
                  aria-label='Play set'
                  className='h-10 w-10 p-0'
                  type='button'
                >
                  <Play className='size-4' />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Play set</TooltipContent>
          </Tooltip>
          <CreateLevelDialog
            setId={set.id}
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label='Make level'
                    className='h-10 w-10 p-0'
                    type='button'
                    variant='neutral'
                  >
                    <Plus className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Make level</TooltipContent>
              </Tooltip>
            }
          />
          {hasMore && (
            <Button
              onClick={() => setExpanded((prev) => !prev)}
              type='button'
              variant='neutral'
            >
              {expanded ? 'Collapse' : 'View more'}
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label='Delete set'
                className='h-10 w-10 border-2 border-red-700 bg-red-500 p-0 text-white shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none'
                disabled={isDeletingSet}
                onClick={() => onDeleteSet({ setId: set.id })}
                type='button'
              >
                <Trash2 className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDeletingSet ? 'Deleting...' : 'Delete set'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {levels.length === 0 ? (
        <div className='border-2 border-border bg-background p-6 text-foreground/70 text-sm shadow-shadow'>
          No levels yet. Create your first level to start building this set.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {visibleLevels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              onDeleteLevel={onDeleteLevel}
              setId={set.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function LevelCard({
  level,
  setId,
  onDeleteLevel,
}: {
  level: LevelRow
  setId: string
  onDeleteLevel: (input: { levelId: string; setId: string }) => void
}) {
  return (
    <div className='grid min-h-[220px] gap-6 border-2 border-border bg-background p-6 shadow-shadow'>
      <div>
        <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
          level {level.order}
        </div>
        <div className='mt-2 font-heading text-lg'>{level.title}</div>
      </div>

      <div className='flex items-center gap-2 pt-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/play/levels/${level.id}`}>
              <Button className='h-10 w-10 p-0' type='button'>
                <Play className='size-4' />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Play level</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/sets/${setId}/levels/${level.id}`}>
              <Button className='h-10 w-10 p-0' type='button' variant='neutral'>
                <SquarePen className='size-4' />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Open editor</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className='h-10 w-10 border-2 border-red-700 bg-red-500 p-0 text-white shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none'
              onClick={() => onDeleteLevel({ levelId: level.id, setId })}
              type='button'
            >
              <Trash2 className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete level</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
