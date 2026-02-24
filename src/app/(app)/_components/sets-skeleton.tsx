import { Skeleton } from '@/components/ui/skeleton'

const SET_SKELETON_IDS = ['set-a', 'set-b'] as const
const LEVEL_SKELETON_IDS = ['lv-a', 'lv-b', 'lv-c', 'lv-d'] as const

export function SetsSkeleton() {
  return (
    <div className='grid gap-6'>
      {SET_SKELETON_IDS.map((setSkeletonId) => (
        <div
          className='grid gap-4 border-2 border-border bg-secondary-background p-6 shadow-shadow'
          key={setSkeletonId}
        >
          <div className='flex items-start justify-between gap-4'>
            <div className='grid gap-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-7 w-48' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-10 w-28' />
              <Skeleton className='h-10 w-28' />
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {LEVEL_SKELETON_IDS.map((levelSkeletonId) => (
              <div
                className='grid gap-3 border-2 border-border bg-background p-5 shadow-shadow'
                key={`${setSkeletonId}-${levelSkeletonId}`}
              >
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-6 w-full' />
                <div className='flex gap-2'>
                  <Skeleton className='h-10 w-10' />
                  <Skeleton className='h-10 w-10' />
                  <Skeleton className='h-10 w-10' />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
