import { redirect } from 'next/navigation'
import { getSession } from '@/server/auth'
import { Header } from './_components/header'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className='flex h-dvh flex-col bg-background text-foreground'>
      <Header />
      <main className='min-h-0 flex-1 overflow-y-auto px-6 py-6'>
        {children}
      </main>
    </div>
  )
}
