import { openai } from '@ai-sdk/openai'
import { customProvider } from 'ai'

const chatModel = openai('gpt-4o-mini')

export const provider = customProvider({
  languageModels: {
    'chat-model': chatModel,
  },
})
