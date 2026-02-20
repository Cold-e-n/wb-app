import z from 'zod'

export const colorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type Color = z.infer<typeof colorSchema>

// --- Shared mutation schemas ---

export const createColorsSchema = z.object({
  colors: z.array(
    z.object({
      name: z.string().min(3, 'Nama warna minimal 3 karakter'),
    }),
  ),
})

export type CreateColorsInput = z.infer<typeof createColorsSchema>

export const updateColorSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Nama warna minimal 3 karakter'),
})

export type UpdateColorInput = z.infer<typeof updateColorSchema>
