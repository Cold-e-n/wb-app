import { z } from 'zod'

export const yarnSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type Yarn = z.infer<typeof yarnSchema>

// --- Shared mutation schemas ---

export const createYarnSchema = z.object({
  yarns: z.array(
    z.object({
      name: z.string().min(1, 'Nama benang minimal 1 karakter'),
    }),
  ),
})

export type CreateYarnsInput = z.infer<typeof createYarnSchema>

export const updateYarnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama benang minimal 1 karakter'),
})

export type UpdateYarnInput = z.infer<typeof updateYarnSchema>
