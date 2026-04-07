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
  edgeTriple: z
    .object({
      color: z.string(), // decorative color ID (e.g., GREEN) — purely visual
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

export const colorLayoutFormSchema = z.object({
  fabric: z.string().min(1, 'Kain harus dipilih'),
  type: z.enum(['single', 'double', 'triple']),
  color1: z.string().min(1, 'Benang warna harus dipilih').optional(),
  color2: z.string().optional(),
  colorDistance: z.number().min(1, 'Jarak warna minimal 1'),
  colorPairDistance: z.number().min(1, 'Jarak warna minimal 1').optional(),
  colorCount: z.number().min(1, 'Jumlah warna minimal 1'),
  isEdgeTriple: z.boolean().optional(),
  edgeTripleColor: z.string().optional(),
  isIn: z.boolean().optional(),
  isOut: z.boolean().optional(),
  colorInCount: z.number().min(0, 'Jumlah warna minimal 0').optional(),
  colorIn: z.array(z.string()).optional(),
  colorInDistance: z.number().min(0).optional(),
  colorOutCount: z.number().min(0, 'Jumlah warna minimal 0').optional(),
  colorOut: z.array(z.string()).optional(),
  colorOutDistance: z.number().min(0).optional(),
})

export type ColorLayoutFormValues = z.infer<typeof colorLayoutFormSchema>
