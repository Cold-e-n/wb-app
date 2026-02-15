import z from 'zod'

export const colorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type Color = z.infer<typeof colorSchema>
