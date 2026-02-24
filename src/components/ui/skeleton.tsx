import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-base border-2 border-border bg-secondary-background',
        className
      )}
      data-slot='skeleton'
      {...props}
    />
  )
}

export { Skeleton }
