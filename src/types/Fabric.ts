import z from 'zod'

export const fabricSchema = z.object({
  id: z.string(),
  name: z.string(),
  hasColor: z.boolean(),
})

export type Fabric = z.infer<typeof fabricSchema>

// --- Shared mutation schemas ---

export const createFabricSchema = z.object({
  fabrics: z.array(
    z.object({
      name: z.string().min(3, 'Nama kain minimal 3 karakter'),
      hasColor: z
        .boolean()
        .nullable()
        .optional()
        .transform((v) => v ?? false),
    }),
  ),
})

export type CreateFabricInput = z.infer<typeof createFabricSchema>

export const updateFabricSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Nama kain minimal 3 karakter'),
  hasColor: z.boolean().nullable().optional(),
})

export type UpdateFabricInput = z.infer<typeof updateFabricSchema>

// Form schema (client-side, extends with max length)
export const fabricFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kain minimal 3 karakter')
    .max(1000, 'Nama kain maksimal 1000 karakter')
    .trim(),
  hasColor: z.boolean().default(false),
})

export type FabricFormValues = z.infer<typeof fabricFormSchema>
