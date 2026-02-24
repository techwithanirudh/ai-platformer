import Link from 'next/link'
import { UserButton } from '@/components/auth/user-button'

export function Header() {
  return (
    <header className='flex h-16 items-center justify-between border-border border-b-2 bg-secondary-background px-6'>
      <Link className='font-heading text-lg' href='/'>
        Markie
      </Link>
      <UserButton />
    </header>
  )
}
