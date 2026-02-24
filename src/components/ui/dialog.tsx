'use client'

import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Dialog({ ...props }: ComponentProps<typeof Root>) {
  return <Root data-slot='dialog' {...props} />
}

function DialogTrigger({ ...props }: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot='dialog-trigger' {...props} />
}

function DialogPortal({ ...props }: ComponentProps<typeof Portal>) {
  return <Portal data-slot='dialog-portal' {...props} />
}

function DialogClose({ ...props }: ComponentProps<typeof Close>) {
  return <Close data-slot='dialog-close' {...props} />
}

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof Overlay>) {
  return (
    <Overlay
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay data-[state=closed]:animate-out data-[state=open]:animate-in',
        className
      )}
      data-slot='dialog-overlay'
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <Content
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-base border-2 border-border bg-background p-6 shadow-shadow duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg',
          className
        )}
        data-slot='dialog-content'
        {...props}
      >
        {children}
        <Close className="absolute top-4 right-4 rounded-base opacity-100 ring-offset-white focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
          <X />
          <span className='sr-only'>Close</span>
        </Close>
      </Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot='dialog-header'
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
        className
      )}
      data-slot='dialog-footer'
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: ComponentProps<typeof Title>) {
  return (
    <Title
      className={cn(
        'font-heading text-lg leading-none tracking-tight',
        className
      )}
      data-slot='dialog-title'
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Description>) {
  return (
    <Description
      className={cn('font-base text-foreground text-sm', className)}
      data-slot='dialog-description'
      {...props}
    />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
