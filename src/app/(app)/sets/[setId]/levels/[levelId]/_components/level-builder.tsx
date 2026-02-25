'use client'

import { useChat } from '@ai-sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { DefaultChatTransport, type UIMessage } from 'ai'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDefaultLayout } from 'react-resizable-panels'
import { z } from 'zod'
import { updateLevelAction } from '@/app/(app)/actions/levels'
import GameCanvas from '@/components/game-canvas'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Level } from '@/lib/level-schema'

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required.').max(2000),
})

interface LevelBuilderProps {
  chatId: string
  initialLevel: Level
  initialMessages: UIMessage[]
  initialTitle: string
  levelId: string
  setId: string
  setTheme: string
}

export function LevelBuilder({
  levelId,
  setId,
  setTheme,
  initialLevel,
  initialTitle,
  initialMessages,
  chatId,
}: LevelBuilderProps) {
  const [draftLevel, setDraftLevel] = useState<Level>(initialLevel)
  const [title, setTitle] = useState(initialTitle)
  const [ideas, setIdeas] = useState<string[]>([])

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest({ messages: requestMessages }) {
        return {
          body: {
            messages: requestMessages,
            setId,
            levelId,
          },
        }
      },
    }),
  })

  useEffect(() => {
    const latestToolOutput = getLatestToolOutput(messages, 'updateLevel')
    if (latestToolOutput?.level) {
      setDraftLevel(latestToolOutput.level)
    }
    if (latestToolOutput?.title) {
      setTitle(latestToolOutput.title)
    }
  }, [messages])

  useEffect(() => {
    const controller = new AbortController()

    async function loadIdeas() {
      try {
        const res = await fetch('/api/levels/ideas', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ theme: setTheme, prompt: title }),
          signal: controller.signal,
        })

        if (!res.ok) {
          return
        }

        const data = await res.json()
        if (Array.isArray(data?.ideas)) {
          setIdeas(data.ideas)
        }
      } catch {
        // ignore
      }
    }

    loadIdeas()
    return () => controller.abort()
  }, [setTheme, title])

  const previewLevel = useMemo(() => draftLevel, [draftLevel])

  const handleIdea = (idea: string) => {
    sendMessage({
      text: idea,
      metadata: {
        setId,
        levelId,
      },
    })
  }

  const saveAction = useAction(updateLevelAction)
  const isSaving = saveAction.status === 'executing'
  const isStreaming = status === 'streaming' || status === 'submitted'

  const handleSave = () => {
    saveAction.execute({
      id: levelId,
      setId,
      title,
      level: draftLevel,
    })
  }

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  })

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: `level-builder-${levelId}`,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  })

  return (
    <TooltipProvider>
      <ResizablePanelGroup
        className='h-full min-h-0 w-full border-2 border-border bg-secondary-background shadow-shadow'
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        orientation='vertical'
      >
        <ResizablePanel defaultSize={50} minSize={35}>
          <div className='h-full w-full border-border border-b-2 bg-black'>
            <GameCanvas level={previewLevel} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={35}>
          <div className='grid h-full grid-rows-[auto_1fr_auto_auto] gap-4 overflow-y-auto p-4'>
            <div>
              <div className='text-foreground/60 text-xs uppercase tracking-[0.3em]'>
                ai editor
              </div>
              <div className='mt-2 flex flex-wrap gap-2'>
                {ideas.map((idea) => (
                  <button
                    className='border-2 border-border bg-background px-3 py-2 text-left text-xs'
                    key={idea}
                    onClick={() => handleIdea(idea)}
                    type='button'
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className='grid gap-3 overflow-y-auto border-2 border-border bg-background p-4 shadow-shadow'>
              {messages.length === 0 ? (
                <div className='text-foreground/60 text-sm'>
                  Ask the AI to update this level. It can read and edit the
                  level using tools.
                </div>
              ) : (
                messages.map((message) => (
                  <div className='grid gap-2' key={message.id}>
                    <div className='text-foreground/60 text-xs uppercase tracking-[0.2em]'>
                      {message.role === 'user' ? 'You' : 'Markie'}
                    </div>
                    {message.parts.map((part, index) => {
                      if (part.type !== 'text') {
                        return null
                      }
                      return (
                        <div
                          className='whitespace-pre-wrap text-sm'
                          key={`${message.id}-${index}`}
                        >
                          {part.text}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            <Form {...form}>
              <form
                className='grid gap-2'
                onSubmit={form.handleSubmit((values) => {
                  sendMessage({
                    text: values.message,
                    metadata: {
                      setId,
                      levelId,
                    },
                  })
                  form.reset()
                })}
              >
                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Ask the AI to edit this level…'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex flex-wrap gap-2'>
                  <Button disabled={isStreaming} type='submit'>
                    {isStreaming ? 'Working...' : 'Send'}
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={handleSave}
                    type='button'
                    variant='neutral'
                  >
                    {isSaving ? 'Saving...' : 'Save level'}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/play/levels/${levelId}`}>
                        <Button variant='reverse'>Play level</Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Play level</TooltipContent>
                  </Tooltip>
                </div>
              </form>
            </Form>

            <div className='grid gap-2'>
              <div className='text-foreground/60 text-xs uppercase tracking-[0.3em]'>
                colors
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <label className='flex items-center justify-between gap-2 text-xs'>
                  Background
                  <input
                    className='h-9 w-12 border-2 border-border'
                    onChange={(event) =>
                      setDraftLevel({
                        ...draftLevel,
                        backgroundColor: event.target.value,
                      })
                    }
                    type='color'
                    value={draftLevel.backgroundColor}
                  />
                </label>
                <label className='flex items-center justify-between gap-2 text-xs'>
                  HUD
                  <input
                    className='h-9 w-12 border-2 border-border'
                    onChange={(event) =>
                      setDraftLevel({
                        ...draftLevel,
                        hudColor: event.target.value,
                      })
                    }
                    type='color'
                    value={draftLevel.hudColor}
                  />
                </label>
                <label className='flex items-center justify-between gap-2 text-xs'>
                  Accent
                  <input
                    className='h-9 w-12 border-2 border-border'
                    onChange={(event) =>
                      setDraftLevel({
                        ...draftLevel,
                        accentColor: event.target.value,
                      })
                    }
                    type='color'
                    value={draftLevel.accentColor}
                  />
                </label>
                <label className='flex items-center justify-between gap-2 text-xs'>
                  Platform
                  <input
                    className='h-9 w-12 border-2 border-border'
                    onChange={(event) =>
                      setDraftLevel({
                        ...draftLevel,
                        platformTint: event.target.value,
                      })
                    }
                    type='color'
                    value={draftLevel.platformTint}
                  />
                </label>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}

function getLatestToolOutput(
  messages: UIMessage[],
  toolName: string
): { level?: Level; title?: string } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    const toolPart = message.parts.find(
      (part) => part.type === `tool-${toolName}`
    ) as { output?: unknown } | undefined
    const output = toolPart?.output as
      | { level?: Level; title?: string }
      | undefined
    if (output?.level) {
      return output
    }
  }
  return null
}
