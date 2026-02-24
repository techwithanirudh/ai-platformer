import { corePrompt } from './core'
import { examplesPrompt } from './examples'
import { rulesPrompt } from './rules'

export function levelDesignerPrompt(): string {
  return [corePrompt, rulesPrompt, examplesPrompt].join('\n\n').trim()
}
