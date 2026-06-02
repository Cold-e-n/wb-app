import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'
import { prisma } from '@/db'

export const getFabricConstructions = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const fabricConstructions = await prisma.fabricConstruction.findMany({
      include: {
        fabricSpec: {
          include: {
            fabric: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return fabricConstructions.map((construction) => ({
      ...construction,
      conesCount: Number(construction.coneCount),
      fabricId: construction.fabricSpec.fabricId,
      beamWidth: Number(construction.beamWidth),
      fabricSpec: {
        ...construction.fabricSpec,
        reedWidth: Number(construction.fabricSpec.reedWidth),
      },
    }))
  } catch (error) {
    console.error('Failed to fetch fabric constructions:', error)
    throw new Error('Gagal mengambil data konstruksi kain.')
  }
})

export const getFabricConstructionById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabricConstruction = await prisma.fabricConstruction.findUnique({
        where: { id: data.id },
        include: {
          fabricSpec: {
            include: {
              fabric: {
                select: {
                  id: true,
                  name: true,
                },
              },
              warpYarn: {
                select: {
                  id: true,
                  name: true,
                },
              },
              weftYarn: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!fabricConstruction) return null

      return {
        ...fabricConstruction,
        conesCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
      }
    } catch (error) {
      console.error('Failed to fetch fabric construction by id:', error)
      throw new Error('Gagal mengambil detail konstruksi kain.')
    }
  })

export const getFabricConstructionByConstructionId = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ constructionId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabricConstruction = await prisma.fabricConstruction.findUnique({
        where: {
          constructionId: data.constructionId,
        },
        include: {
          fabricSpec: {
            include: {
              fabric: {
                select: {
                  id: true,
                  name: true,
                },
              },
              warpYarn: {
                select: {
                  id: true,
                  name: true,
                },
              },
              weftYarn: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!fabricConstruction) return null

      return {
        ...fabricConstruction,
        conesCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
      }
    } catch (error) {
      console.error('Failed to fetch fabric construction by id:', error)
      throw new Error('Gagal mengambil detail konstruksi kain.')
    }
  })

const createFabricConstructionSchema = z.object({
  fabricSpecId: z.string().min(1),
  rollCount: z.number().min(1),
  warpingMachine: z.string(),
  conesCount: z.number().min(0.01),
  sectionCount: z.number().min(1),
  sectionLength: z.number().min(1),
  beamWidth: z.number().min(0.01),
  cutmarkValue: z.string(),
  spareEnds: z.number().min(0),
  beamingLoss: z.number().optional().nullable(),
  constructionId: z.string(),
  coneLength: z.number().min(1),
})

export const createFabricConstruction = createServerFn({
  method: 'POST',
})
  .inputValidator(createFabricConstructionSchema)
  .handler(async ({ data }) => {
    try {
      const warpingMachineValue =
        data.warpingMachine.toUpperCase() === 'BENN_KM' ? 'BENN_KM' : 'MO_TS'
      const fabricConstruction = await prisma.fabricConstruction.create({
        data: {
          fabricSpecId: data.fabricSpecId,
          constructionId: `${createId().slice(-7)}`,
          rollCount: data.rollCount,
          warpingMachine: warpingMachineValue,
          coneCount: data.conesCount,
          sectionCount: data.sectionCount,
          sectionLength: data.sectionLength,
          beamWidth: data.beamWidth,
          cutmarkValue: data.cutmarkValue,
          spareEnds: data.spareEnds,
          beamingLoss: data.beamingLoss || null,
          coneLength: data.coneLength,
        },
        include: {
          fabricSpec: {
            include: {
              fabric: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      return {
        ...fabricConstruction,
        conesCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
      }
    } catch (error) {
      console.error('Failed to create fabric construction:', error)
      throw new Error('Gagal menambahkan konstruksi kain.')
    }
  })

const updateFabricConstructionSchema = createFabricConstructionSchema.extend({
  id: z.string(),
})

export const updateFabricConstruction = createServerFn({
  method: 'POST',
})
  .inputValidator(updateFabricConstructionSchema)
  .handler(async ({ data }) => {
    try {
      const { id, ...updateData } = data
      const warpingMachineValue =
        updateData.warpingMachine.toUpperCase() === 'BENN_KM'
          ? 'BENN_KM'
          : 'MO_TS'
      const fabricConstruction = await prisma.fabricConstruction.update({
        where: { id },
        data: {
          fabricSpecId: updateData.fabricSpecId,
          rollCount: updateData.rollCount,
          warpingMachine: warpingMachineValue,
          coneCount: updateData.conesCount,
          sectionCount: updateData.sectionCount,
          sectionLength: updateData.sectionLength,
          beamWidth: updateData.beamWidth,
          cutmarkValue: updateData.cutmarkValue,
          spareEnds: updateData.spareEnds,
          beamingLoss: updateData.beamingLoss || null,
          updatedAt: new Date(),
        },
        include: {
          fabricSpec: {
            include: {
              fabric: {
                select: {
                  id: true,
                  name: true,
                },
              },
              warpYarn: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      return {
        ...fabricConstruction,
        conesCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
      }
    } catch (error) {
      console.error('Failed to update fabric construction:', error)
      throw new Error('Gagal memperbarui konstruksi kain.')
    }
  })

export const deleteFabricConstruction = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabricConstruction = await prisma.fabricConstruction.delete({
        where: { id: data.id },
        include: {
          fabricSpec: {
            include: {
              fabric: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      return {
        ...fabricConstruction,
        conesCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
      }
    } catch (error) {
      console.error('Failed to delete fabric construction:', error)
      throw new Error('Gagal menghapus konstruksi kain.')
    }
  })

export const deleteManyFabricConstructions = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ ids: z.array(z.string()) }))
  .handler(async ({ data }) => {
    try {
      const result = await prisma.fabricConstruction.deleteMany({
        where: {
          id: { in: data.ids },
        },
      })

      return result
    } catch (error) {
      console.error('Failed to delete many fabric constructions:', error)
      throw new Error(
        'Gagal menghapus konstruksi kain terpilih. Beberapa data mungkin masih digunakan.',
      )
    }
  })
