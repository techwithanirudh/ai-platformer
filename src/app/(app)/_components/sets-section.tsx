import { CreateSetDialog } from '@/app/(app)/_components/create-set-dialog'
import { SetGrid } from '@/app/(app)/_components/set-grid'
import { Button } from '@/components/ui/button'
import { getSession } from '@/server/auth'
import { getSetsWithLevels } from '@/server/db/queries'

export async function SetsSection() {
  const session = await getSession()
  const userId = session?.user?.id ?? ''

  const { sets, levels } = await getSetsWithLevels(userId)

  if (sets.length === 0) {
    return (
      <CreateSetDialog
        trigger={
          <button
            className='group flex w-full items-center justify-between gap-6 border-2 border-border bg-secondary-background px-6 py-10 text-left shadow-shadow transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
            type='button'
          >
            <div className='grid gap-3'>
              <div className='text-xs uppercase tracking-[0.3em]'>
                no sets yet
              </div>
              <div className='font-heading text-2xl'>Create your first set</div>
              <p className='max-w-lg text-foreground/70 text-sm'>
                Give it a name and describe the theme. The AI will handle the
                rest.
              </p>
              <span className='inline-flex w-fit items-center gap-2 border-2 border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]'>
                Click to create
              </span>
            </div>
            <div className='flex h-28 w-36 items-center justify-center border-2 border-border bg-background shadow-shadow'>
              <div className='text-center text-[10px] text-foreground/60 uppercase tracking-[0.3em]'>
                placeholder
              </div>
            </div>
          </button>
        }
      />
    )
  }

  return (
    <div className='grid gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <div className='text-foreground/60 text-xs uppercase tracking-[0.3em]'>
            sets
          </div>
          <h1 className='font-heading text-3xl'>Your sets</h1>
        </div>
        <CreateSetDialog trigger={<Button type='button'>Create set</Button>} />
      </div>

      <SetGrid
        levels={levels.map((level) => ({
          id: level.id,
          setId: level.setId,
          title: level.title,
          order: level.order,
        }))}
        sets={sets.map((set) => ({
          id: set.id,
          name: set.name,
          theme: set.theme,
        }))}
      />
    </div>
  )
}
