import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'

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
      coneCount: Number(construction.coneCount),
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

      let currentId = data.id
      const effectedChildrenId: Array<{ id: string; constructionId: string }> =
        []

      while (true) {
        const children = await prisma.fabricConstruction.findFirst({
          where: {
            parentConstructionId: currentId,
          },
          select: {
            id: true,
            constructionId: true,
          },
        })

        if (!children) break
        effectedChildrenId.push({
          id: children.id,
          constructionId: children.constructionId,
        })
        currentId = children.id
      }

      return {
        ...fabricConstruction,
        hasChildren: effectedChildrenId.length > 0,
        effectedChildren: effectedChildrenId,
        coneCount: Number(fabricConstruction.coneCount),
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

      let currentId = fabricConstruction.id
      const effectedChildrenId: Array<{ id: string; constructionId: string }> =
        []

      while (true) {
        const child = await prisma.fabricConstruction.findFirst({
          where: { parentConstructionId: currentId },
          select: { id: true, constructionId: true },
        })
        if (!child) break
        effectedChildrenId.push({
          id: child.id,
          constructionId: child.constructionId,
        })
        currentId = child.id
      }

      return {
        ...fabricConstruction,
        coneCount: Number(fabricConstruction.coneCount),
        fabricId: fabricConstruction.fabricSpec.fabricId,
        beamWidth: Number(fabricConstruction.beamWidth),
        fabricSpec: {
          ...fabricConstruction.fabricSpec,
          reedWidth: Number(fabricConstruction.fabricSpec.reedWidth),
        },
        hasChildren: effectedChildrenId.length > 0,
        effectedChildren: effectedChildrenId,
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
  coneCount: z.number().min(0.01),
  sectionCount: z.number().min(1),
  sectionLength: z.number().min(1),
  beamWidth: z.number().min(0.01),
  cutmarkValue: z.string(),
  spareEnds: z.number().min(0),
  beamingLoss: z.number().optional(),
  constructionId: z.string().min(1),
  coneLength: z.number().min(1),
  parentConstructionId: z.string().nullable().optional(),
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
          constructionId: data.constructionId,
          rollCount: data.rollCount,
          warpingMachine: warpingMachineValue,
          coneCount: data.coneCount,
          sectionCount: data.sectionCount,
          sectionLength: data.sectionLength,
          beamWidth: data.beamWidth,
          cutmarkValue: data.cutmarkValue,
          spareEnds: data.spareEnds,
          beamingLoss: data.beamingLoss ?? undefined,
          coneLength: data.coneLength,
          parentConstructionId: data.parentConstructionId ?? null,
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
        coneCount: Number(fabricConstruction.coneCount),
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

const createManyFabricConstructionsSchema = z.object({
  entries: z
    .array(createFabricConstructionSchema)
    .min(2, 'Minimal 2 konstruksi untuk endpoint ini'),
})

export const createFabricConstructions = createServerFn({
  method: 'POST',
})
  .inputValidator(createManyFabricConstructionsSchema)
  .handler(async ({ data }) => {
    try {
      for (let i = 1; i < data.entries.length; i++) {
        const parent = data.entries[i - 1]
        const child = data.entries[i]
        const parentUsage =
          parent.warpingMachine === 'BENN_KM'
            ? parent.sectionCount * parent.sectionLength
            : (parent.sectionLength + 8) * parent.sectionCount
        const expectedRemainder = parent.coneLength - parentUsage

        if (child.coneLength !== expectedRemainder) {
          throw new Error(
            `coneLength konstruksi ke-${i + 1} tidak sesuai dengan sisa konstruksi sebelumnya. ` +
              `Diharapkan ${expectedRemainder}m, diterima ${child.coneLength}m.`,
          )
        }

        if (child.parentConstructionId !== parent.constructionId) {
          throw new Error(
            `parentConstructionId konstruksi ke-${i + 1} tidak sesuai.`,
          )
        }
      }

      const results = await prisma.$transaction(async (tx) => {
        const created: Array<FabricConstructionWithRelation> = []

        for (let i = 0; i < data.entries.length; i++) {
          const entry = data.entries[i]

          const warpingMachineValue =
            entry.warpingMachine.toUpperCase() === 'BENN_KM'
              ? 'BENN_KM'
              : 'MO_TS'

          const actualParentId: string | null =
            i > 0 ? created[i - 1].id : (entry.parentConstructionId ?? null)

          const construction = await tx.fabricConstruction.create({
            data: {
              fabricSpecId: entry.fabricSpecId,
              constructionId: entry.constructionId,
              rollCount: entry.rollCount,
              warpingMachine: warpingMachineValue,
              coneCount: entry.coneCount,
              sectionCount: entry.sectionCount,
              sectionLength: entry.sectionLength,
              beamWidth: entry.beamWidth,
              cutmarkValue: entry.cutmarkValue,
              spareEnds: entry.spareEnds,
              beamingLoss: entry.beamingLoss || undefined,
              coneLength: entry.coneLength,
              parentConstructionId: actualParentId,
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

          created.push(
            construction as unknown as FabricConstructionWithRelation,
          )
        }

        return created
      })

      return results.map((construction) => ({
        ...construction,
        coneCount: Number(construction.coneCount),
        fabricId: construction.fabricSpec.fabricId,
        beamWidth: Number(construction.beamWidth),
        fabricSpec: {
          ...construction.fabricSpec,
          reedWidth: Number(construction.fabricSpec.reedWidth),
        },
      }))
    } catch (error) {
      console.error('Failed to create fabric constructions:', error)
      if (error instanceof Error) throw error
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
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Kain Utama (Parent yang sedang di-edit)
        const parentNode = await tx.fabricConstruction.update({
          where: { id },
          data: {
            fabricSpecId: updateData.fabricSpecId,
            rollCount: updateData.rollCount,
            warpingMachine: warpingMachineValue,
            coneCount: updateData.coneCount,
            sectionCount: updateData.sectionCount,
            sectionLength: updateData.sectionLength,
            beamWidth: updateData.beamWidth,
            cutmarkValue: updateData.cutmarkValue,
            spareEnds: updateData.spareEnds,
            beamingLoss: updateData.beamingLoss ?? undefined,
            coneLength: updateData.coneLength,
            updatedAt: new Date(),
          },
          include: {
            fabricSpec: {
              include: {
                fabric: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        })

        // 2. Lakukan Cascade Turun ke Child
        let currentParent = parentNode
        const affectedChildren: string[] = [] // Array penyimpan nama/ID kain yang terdampak

        while (true) {
          const child = await tx.fabricConstruction.findFirst({
            where: { parentConstructionId: currentParent.id },
          })

          if (!child) break

          // Hitung pemakaian oleh parent
          const parentUsage =
            currentParent.warpingMachine === 'BENN_KM'
              ? currentParent.sectionCount * currentParent.sectionLength
              : (currentParent.sectionLength + 8) * currentParent.sectionCount

          const expectedRemainder = currentParent.coneLength - parentUsage

          // Update child
          const updatedChild = await tx.fabricConstruction.update({
            where: { id: child.id },
            data: {
              coneLength: expectedRemainder,
              updatedAt: new Date(),
            },
          })

          affectedChildren.push(updatedChild.constructionId) // Simpan nama kainnya

          // @ts-ignore - Supaya TypeScript tidak rewel soal field fabricSpec untuk loop selanjutnya
          currentParent = updatedChild
        }

        return { parentNode, affectedChildren }
      })

      // Return data parent beserta daftar anak yang terdampak ke Frontend
      return {
        ...result.parentNode,
        coneCount: Number(result.parentNode.coneCount),
        fabricId: result.parentNode.fabricSpec.fabricId,
        beamWidth: Number(result.parentNode.beamWidth),
        fabricSpec: {
          ...result.parentNode.fabricSpec,
          reedWidth: Number(result.parentNode.fabricSpec.reedWidth),
        },
        affectedChildren: result.affectedChildren,
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
        coneCount: Number(fabricConstruction.coneCount),
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
