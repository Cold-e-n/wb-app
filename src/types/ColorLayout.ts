import z from 'zod'

export const colorContentSchema = z.object({
  type: z.string(),
  color: z.preprocess(
    (val) => (typeof val === 'string' ? [val] : val),
    z.array(z.string()).optional(),
  ),
  color1: z.string().optional(),
  color2: z.string().optional(),
  colorCount: z.number(),
  colorDistance: z.number(),
  colorPairDistance: z.number().optional(),
  IN: z
    .object({
      color: z.array(z.string()),
      count: z.number(),
      distance: z.number(),
    })
    .optional(),
  OUT: z
    .object({
      color: z.array(z.string()),
      count: z.number(),
      distance: z.number(),
    })
    .optional(),
})

export type ColorContent = z.infer<typeof colorContentSchema>

export const colorLayoutSchema = z.object({
  id: z.string(),
  fabricId: z.string(),
  colorContent: colorContentSchema,
})

export type ColorLayout = z.infer<typeof colorLayoutSchema>
