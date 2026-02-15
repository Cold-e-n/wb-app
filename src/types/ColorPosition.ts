import z from 'zod'

export const fabricContentSchema = z.object({
  cones: z.array(z.number()),
  sections: z.number(),
  fringe: z.number().optional(),
})
export type FabricContent = z.infer<typeof fabricContentSchema>

export const colorPositionSchema = z.object({
  id: z.string(),
  fabricId: z.string(),
  colorLayoutId: z.string(),
  fabricContent: fabricContentSchema,
  wbNo: z.string(),
})
export type ColorPosition = z.infer<typeof colorPositionSchema>

export const colorPositionFormSchema = z
  .object({
    fabric: z.string().min(1, 'Kain harus dipilih.'),
    colorLayout: z.string().min(1, 'Layout warna harus dipilih.'),
    cones: z
      .array(z.number().min(1, 'Minimal 1 cone'))
      .min(1, 'Minimal 1 cones'),
    sections: z.number().min(1, 'Minimal 1 sections'),
    fringe: z.number().min(0, 'Minimal 1 pinggiran').optional(),
    wbNo: z.string().min(1, 'Nomor WB harus diisi.'),
  })
  .refine(
    (data) => {
      if (data.cones.length === 2) {
        return data.cones[0] > data.cones[1]
      }
      return true
    },
    {
      message: 'Cones 1 harus lebih besar dari Cones 2',
      path: ['cones'],
    },
  )
