import { Suspense } from 'react'
import { SetsSection } from '@/app/(app)/_components/sets-section'
import { SetsSkeleton } from '@/app/(app)/_components/sets-skeleton'

interface HomePageProps {
  searchParams?: Promise<{ welcome?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const showWelcome = params?.welcome === '1'

  return (
    <div className='grid gap-8'>
      {showWelcome && (
        <div className='border-2 border-border bg-main px-6 py-4 text-main-foreground shadow-shadow'>
          <div className='text-xs uppercase tracking-[0.3em]'>welcome</div>
          <div className='font-heading text-2xl'>Hi, welcome to Markie</div>
          <p className='text-sm'>
            An AI-powered platformer. Build your first set below.
          </p>
        </div>
      )}

      <Suspense fallback={<SetsSkeleton />}>
        <SetsSection />
      </Suspense>
    </div>
  )
}
