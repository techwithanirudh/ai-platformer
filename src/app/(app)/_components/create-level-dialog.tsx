'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { createLevelAction } from '@/app/(app)/actions/levels'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createLevelSchema } from '@/lib/validators/levels'

interface CreateLevelDialogProps {
  setId: string
  trigger?: ReactNode
}

export function CreateLevelDialog({ setId, trigger }: CreateLevelDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(createLevelAction, zodResolver(createLevelSchema), {
      actionProps: {
        onSuccess: ({ data }) => {
          if (data?.levelId && data?.setId) {
            setOpen(false)
            router.push(`/sets/${data.setId}/levels/${data.levelId}`)
          }
        },
      },
      formProps: {
        defaultValues: {
          title: '',
          setId,
          difficulty: 'medium',
        },
      },
    })

  const isSubmitting = action.status === 'executing'
  const serverError = action.result.serverError

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetFormAndAction()
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type='button' variant='neutral'>
            Make level
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='border-2 border-border bg-secondary-background text-foreground shadow-shadow'>
        <DialogHeader>
          <DialogTitle className='font-heading text-2xl'>
            Create a level
          </DialogTitle>
          <DialogDescription>
            Give your level a title and let the AI build it.
          </DialogDescription>
        </DialogHeader>
        <form className='grid gap-4' onSubmit={handleSubmitWithAction}>
          <input type='hidden' {...form.register('setId')} value={setId} />
          <Form {...form}>
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs uppercase tracking-[0.2em]'>
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Level title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='difficulty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs uppercase tracking-[0.2em]'>
                      Difficulty
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        className='grid grid-cols-3 gap-2'
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <div className='flex items-center gap-2 border-2 border-border bg-background px-3 py-2 text-sm shadow-shadow'>
                          <RadioGroupItem value='easy' />
                          Easy
                        </div>
                        <div className='flex items-center gap-2 border-2 border-border bg-background px-3 py-2 text-sm shadow-shadow'>
                          <RadioGroupItem value='medium' />
                          Medium
                        </div>
                        <div className='flex items-center gap-2 border-2 border-border bg-background px-3 py-2 text-sm shadow-shadow'>
                          <RadioGroupItem value='hard' />
                          Hard
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
          <DialogFooter className='gap-2 sm:justify-between'>
            {serverError && (
              <p className='text-red-600 text-xs'>{serverError}</p>
            )}
            <DialogClose asChild>
              <Button type='button' variant='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isSubmitting} type='submit'>
              <span className='flex items-center gap-2'>
                {isSubmitting && (
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
                )}
                {isSubmitting ? 'Creating...' : 'Create level'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
