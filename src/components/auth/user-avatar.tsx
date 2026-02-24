'use client'

import type { User } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  className?: string
  user: User | null
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const name = user?.name ?? user?.email ?? 'MK'
  const src = user?.image ?? null

  if (src) {
    return (
      <div
        className={`size-9 overflow-hidden bg-background ${className ?? ''}`}
      >
        <img alt={name} height={36} src={src} width={36} />
      </div>
    )
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center bg-main text-main-foreground',
        className
      )}
    >
      <span className='text-[10px] uppercase tracking-[0.2em]'>
        {initials || 'MK'}
      </span>
    </div>
  )
}
