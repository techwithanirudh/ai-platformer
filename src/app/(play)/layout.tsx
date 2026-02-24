import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/server/auth'

export default async function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='fixed top-4 left-4 z-50 flex items-center gap-2'>
        <Link
          className='border-2 border-border bg-secondary-background px-3 py-2 font-heading text-primary text-xs hover:text-primary/80'
          href='/'
        >
          Markie
        </Link>
      </div>
      {children}
    </div>
  )
}
