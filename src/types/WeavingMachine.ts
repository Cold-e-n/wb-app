import z from 'zod'

export const weavingMachineSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  width: z.number(),
  type: z.string(),
})

export type WeavingMachine = z.infer<typeof weavingMachineSchema>

// --- Shared mutation schemas ---

export const createWeavingMachinesSchema = z.object({
  WeavingMachines: z.array(
    z.object({
      name: z.string().min(1, 'Nama mesin weaving minimal 1 karakter'),
      width: z.number().min(230, 'Lebar mesin weaving minimal 230'),
      type: z.string().min(1, 'Tipe mesin weaving minimal 1 karakter'),
    }),
  ),
})

export type CreateWeavingMachinesInput = z.infer<
  typeof createWeavingMachinesSchema
>

export const updateWeavingMachinesSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama mesin minimal 1 karakter'),
  width: z.number().min(230, 'Lebar mesin weaving minimal 230'),
  type: z.string().min(1, 'Tipe mesin weaving minimal 1 karakter'),
})

export type UpdateWeavingMachinesInput = z.infer<
  typeof updateWeavingMachinesSchema
>
