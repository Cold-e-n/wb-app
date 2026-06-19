import { z } from 'zod'
import { fabricSpecWithRelationSchema } from './FabricSpec'

export const fabricConstructionSchema = z.object({
  id: z.string(),
  constructionId: z.string(),
  fabricSpecId: z.string(),
  rollCount: z.number(),
  warpingMachine: z.string(),
  coneCount: z.number().transform((val) => {
    return Number(val)
  }),
  sectionCount: z.number(),
  sectionLength: z.number(),
  beamWidth: z.number(),
  spareEnds: z.number(),
  totalEnds: z.number().optional(),
  beamingLoss: z
    .number()
    .nullable()
    .optional()
    .transform((val) => val ?? 0),
  totalLength: z.number().optional(),
  coneLength: z.number(),
  fabricId: z.string(),
  testTying: z.number().optional(),
  testStretching: z.array(z.number()).optional(),
  cutMarkSequence: z
    .array(
      z.object({
        id: z.string(),
        roll: z.number(),
        length: z.number(),
        count: z.number(),
        type: z.enum(['roll', 'test-tying', 'test-stretching']).optional(),
      }),
    )
    .optional(),
  cutmarkValue: z.string(),
  parentConstructionId: z.string().nullable().optional(),
  hasChildren: z.boolean().optional(),
  effectedChildren: z
    .array(z.object({ id: z.string(), constructionId: z.string() }))
    .optional(),
})

export type FabricConstruction = z.infer<typeof fabricConstructionSchema>

export const fabricConstructionWithRelationSchema =
  fabricConstructionSchema.extend({
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    fabricSpec: fabricSpecWithRelationSchema,
    parentConstruction: fabricConstructionSchema
      .pick({
        id: true,
        constructionId: true,
        coneLength: true,
        sectionCount: true,
        sectionLength: true,
      })
      .nullable()
      .optional(),
  })

export type FabricConstructionWithRelation = z.infer<
  typeof fabricConstructionWithRelationSchema
>

export type FabricConstructionForm = {
  mode?: 'create' | 'edit'
  initialData?: FabricConstruction
}

export const fabricConstructionFormSchema = fabricConstructionSchema.omit({
  id: true,
})

export type FabricConstructionFormValues = z.infer<
  typeof fabricConstructionFormSchema
>

export type FabricConstructionFormEntry = {
  constructionId: string
  parentConstructionId: string | null | undefined
  effectiveConeLength: number
  formValues: FabricConstructionFormValues
}
