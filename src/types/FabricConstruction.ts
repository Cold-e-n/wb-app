import { z } from 'zod'
import { fabricSpecWithRelationSchema } from './FabricSpec'

export const fabricConstructionSchema = z.object({
  id: z.string(),
  constructionId: z.string(),
  fabricSpecId: z.string(),
  rollCount: z.number(),
  warpingMachine: z.string(),
  conesCount: z.number().transform((val) => {
    return Number(val)
  }),
  sectionCount: z.number(),
  sectionLength: z.number(),
  beamWidth: z.number(),
  spareEnds: z.number(),
  totalEnds: z.number().optional(),
  beamingLoss: z.number().optional(),
  totalLength: z.number().optional(),
  coneLength: z.number().optional(),
  fabricId: z.string(),
  testTying: z.number().optional(),
  testStretching: z.number().optional(),
  cutMarkSequence: z
    .array(
      z.object({
        id: z.string(),
        roll: z.number(),
        length: z.number(),
        count: z.number(),
        type: z.enum(['roll', 'test-awal', 'test-akhir']).optional(),
      }),
    )
    .optional(),
  cutmarkValue: z.string(),
})

export type FabricConstruction = z.infer<typeof fabricConstructionSchema>

export const fabricConstructionWithRelationSchema =
  fabricConstructionSchema.extend({
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    fabricSpec: fabricSpecWithRelationSchema,
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
