'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { updateAccountAction } from '@/app/(app)/actions/account'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { User } from '@/lib/auth-client'
import { accountSchema } from '@/lib/validators/account'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const createdAt = useMemo(
    () => formatAccountDate(user.createdAt),
    [user.createdAt]
  )

  return (
    <div className='grid gap-4 border-2 border-border bg-secondary-background p-6 shadow-shadow'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-2 border-border bg-background p-4 shadow-shadow'>
        <div className='grid gap-2'>
          <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
            Avatar
          </div>
          <UserAvatar name={user.name ?? user.email} src={user.image ?? null} />
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-4 border-2 border-border bg-background p-4 shadow-shadow'>
        <div className='grid gap-2'>
          <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
            Display name
          </div>
          <div className='text-sm'>{user.name ?? 'No name set'}</div>
        </div>
        <EditNameDialog name={user.name ?? ''} />
      </div>

      <div className='border-2 border-border bg-background p-4 text-sm shadow-shadow'>
        <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
          Email
        </div>
        <div className='mt-2'>{user.email}</div>
      </div>

      <div className='border-2 border-border bg-background p-4 text-sm shadow-shadow'>
        <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
          Account created
        </div>
        <div className='mt-2'>{createdAt}</div>
      </div>
    </div>
  )
}

function EditNameDialog({ name }: { name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(updateAccountAction, zodResolver(accountSchema), {
      actionProps: {
        onSuccess: () => {
          setOpen(false)
          router.refresh()
        },
      },
      formProps: {
        defaultValues: {
          name,
        },
      },
    })

  const isSubmitting = action.status === 'executing'
  const serverError = action.result.serverError

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      form.reset({ name })
      return
    }
    resetFormAndAction()
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogTrigger asChild>
        <Button type='button' variant='neutral'>
          Edit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='border-2 border-border bg-secondary-background text-foreground shadow-shadow'>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit display name</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a name that appears across your sets and levels.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className='grid gap-4' onSubmit={handleSubmitWithAction}>
          <Form {...form}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs uppercase tracking-[0.2em]'>
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input maxLength={32} placeholder='Your name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <AlertDialogFooter className='gap-2 sm:justify-between'>
            {serverError && (
              <p className='text-red-600 text-xs'>{serverError}</p>
            )}
            <AlertDialogCancel asChild>
              <Button disabled={isSubmitting} type='button' variant='neutral'>
                Cancel
              </Button>
            </AlertDialogCancel>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function UserAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <div className='h-16 w-16 overflow-hidden rounded-md border-2 border-border bg-background shadow-shadow'>
        <img alt={name} height={64} src={src} width={64} />
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
    <div className='flex h-16 w-16 items-center justify-center rounded-md border-2 border-border bg-main text-main-foreground shadow-shadow'>
      <span className='text-sm uppercase tracking-[0.2em]'>
        {initials || 'MK'}
      </span>
    </div>
  )
}

function formatAccountDate(date: Date | string | null | undefined) {
  if (!date) {
    return 'Unknown'
  }
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}
