import { z } from 'zod'

export const cutmarkItemSchema = z.object({
  roll: z.number(),
  length: z.number(),
})

export type CutmarkItem = z.infer<typeof cutmarkItemSchema>

export interface CutmarkChunk {
  id: string
  roll: number
  length: number
  count: number
  type?: 'roll' | 'test-tying' | 'test-stretching'
}

export type CutmarkCombination = {
  id: string
  chunks: CutmarkChunk[]
  totalLength: number
  remainderRolls: number
  label: string
}
