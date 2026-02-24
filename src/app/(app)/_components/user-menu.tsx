'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

export function UserMenu({ userName }: { userName: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    await signOut()
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='text-foreground/70 text-sm'>{userName}</div>
      <Link href='/account'>
        <Button className='h-9 px-3 text-xs' variant='neutral'>
          Account
        </Button>
      </Link>
      <Button
        className='h-9 px-3 text-xs'
        disabled={isLoading}
        onClick={handleSignOut}
        variant='neutral'
      >
        {isLoading ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  )
}
