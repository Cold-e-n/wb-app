import z from 'zod'

export const fabricSchema = z.object({
  id: z.string(),
  name: z.string(),
  hasColor: z.boolean(),
})

export type Fabric = z.infer<typeof fabricSchema>
