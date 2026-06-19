import { z } from 'zod'
import { fabricSchema } from '@/types/Fabric'
import type { Fabric } from '@/types/Fabric'
import { yarnSchema } from './Yarn'
import { cutmarkItemSchema } from './Cutmark'

export const fabricSpecSchema = z.object({
  id: z.string(),
  fabricId: z.string(),
  width: z.number(),
  length: z.number(),
  warpYarnId: z.string(),
  weftYarnId: z.string(),
  color: z.string().default('-').optional(),
  cutmarkPerRoll: z.array(cutmarkItemSchema),
  totalEnds: z.number(),
  reedWidth: z.number(),
  reedNo: z.string(),
  fringe: z.number().optional(),
  pickPerInch: z.number(),

  hasColorLayout: z.boolean().optional(),
  colorInputType: z.enum(['layout', 'manual']).optional(),
  manualColorName: z.string().optional(),
  manualColorDescription: z.string().optional(),
})

export type FabricSpec = z.infer<typeof fabricSpecSchema>

export type FabricSpecWithFabric = FabricSpec & {
  fabric: Omit<Fabric, 'hasColor'>
}

export const fabricSpecWithRelationSchema = fabricSpecSchema
  .omit({
    hasColorLayout: true,
    colorInputType: true,
    manualColorName: true,
    manualColorDescription: true,
  })
  .extend({
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    fabric: fabricSchema.pick({ id: true, name: true }),
    warpYarn: yarnSchema.pick({ id: true, name: true }),
    weftYarn: yarnSchema.pick({ id: true, name: true }),
  })

export type FabricSpecWithRelation = z.infer<
  typeof fabricSpecWithRelationSchema
>

export type FabricSpecForm = {
  mode?: 'create' | 'edit'
  initialData?: FabricSpec
}

export const fabricSpecFormSchema = z.object({
  fabricId: z.string(),
  width: z.number(),
  length: z.number(),
  warpYarnId: z.string(),
  weftYarnId: z.string(),
  color: z.string().default('-').optional(),
  cutmarkPerRoll: z.array(cutmarkItemSchema),
  totalEnds: z.number(),
  reedWidth: z.number(),
  reedNo: z.string(),
  fringe: z.number().optional(),
  pickPerInch: z.number(),

  hasColorLayout: z.boolean().optional(),
  colorInputType: z.enum(['layout', 'manual']).optional(),
  manualColorName: z.string().optional(),
  manualColorDescription: z.string().optional(),
})

export type FabricSpecFormValues = z.infer<typeof fabricSpecFormSchema>
