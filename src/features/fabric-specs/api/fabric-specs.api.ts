import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'

export const getFabricSpecs = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const fabricSpecs = await prisma.fabricSpec.findMany({
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
      orderBy: {
        fabric: {
          name: 'asc',
        },
      },
    })

    return fabricSpecs.map((spec) => ({
      ...spec,
      color: spec.color ?? '-',
      reedWidth: Number(spec.reedWidth),
    }))
  } catch (error) {
    console.error('Failed to fetch fabric specs:', error)
    throw new Error('Gagal mengambil data spesifikasi kain.')
  }
})

export const getFabricSpecById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabricSpec = await prisma.fabricSpec.findUnique({
        where: { id: data.id },
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
      })

      if (!fabricSpec) return null

      return {
        ...fabricSpec,
        color: fabricSpec.color ?? '-',
        reedWidth: Number(fabricSpec.reedWidth),
      }
    } catch (error) {
      console.error('Failed to fetch fabric spec by id:', error)
      throw new Error('Gagal mengambil detail spesifikasi kain.')
    }
  })

const createFabricSpecSchema = z.object({
  fabricId: z.string().min(1),
  width: z.number().default(0),
  length: z.number().default(0),
  warpYarnId: z.string().optional(),
  weftYarnId: z.string().optional(),
  color: z.string().optional(),
  cutmarkPerRoll: z.any().default([]),
  totalEnds: z.number().default(0),
  reedWidth: z.number().default(0),
  reedNo: z.string().default(''),
  fringe: z.number().optional(),
  pickPerInch: z.number().default(0),
})

export const createFabricSpec = createServerFn({
  method: 'POST',
})
  .inputValidator(createFabricSpecSchema)
  .handler(async ({ data }) => {
    try {
      // Find default yarn if not provided
      let warpYarnId = data.warpYarnId
      let weftYarnId = data.weftYarnId

      if (!warpYarnId || !weftYarnId) {
        const defaultYarn = await prisma.yarn.findFirst()
        if (!warpYarnId) warpYarnId = defaultYarn?.id || ''
        if (!weftYarnId) weftYarnId = defaultYarn?.id || ''
      }

      if (!warpYarnId || !weftYarnId) {
        throw new Error(
          'Data Benang tidak ditemukan. Silakan tambahkan benang terlebih dahulu.',
        )
      }

      const fabricSpec = await prisma.fabricSpec.create({
        data: {
          fabricId: data.fabricId,
          width: data.width,
          length: data.length,
          warpYarnId: warpYarnId,
          weftYarnId: weftYarnId,
          color: data.color,
          cutmarkPerRoll: data.cutmarkPerRoll,
          totalEnds: data.totalEnds,
          reedWidth: data.reedWidth,
          reedNo: data.reedNo,
          fringe: data.fringe,
          pickPerInch: data.pickPerInch,
        },
      })

      return {
        ...fabricSpec,
        reedWidth: Number(fabricSpec.reedWidth),
      }
    } catch (error) {
      console.error('Failed to create fabric spec:', error)
      throw new Error('Gagal menambahkan spesifikasi kain.')
    }
  })

const updateFabricSpecSchema = z.object({
  id: z.string(),
  fabricId: z.string().min(1),
  width: z.number(),
  length: z.number(),
  warpYarnId: z.string(),
  weftYarnId: z.string(),
  color: z.string().optional(),
  cutmarkPerRoll: z.any(),
  totalEnds: z.number(),
  reedWidth: z.number(),
  reedNo: z.string(),
  fringe: z.number().optional(),
  pickPerInch: z.number(),
})

export const updateFabricSpec = createServerFn({
  method: 'POST',
})
  .inputValidator(updateFabricSpecSchema)
  .handler(async ({ data }) => {
    try {
      const { id, ...updateData } = data
      const fabricSpec = await prisma.fabricSpec.update({
        where: { id },
        data: updateData,
      })

      return {
        ...fabricSpec,
        reedWidth: Number(fabricSpec.reedWidth),
      }
    } catch (error) {
      console.error('Failed to update fabric spec:', error)
      throw new Error('Gagal mengupdate spesifikasi kain.')
    }
  })

export const deleteFabricSpec = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabricSpec = await prisma.fabricSpec.delete({
        where: { id: data.id },
      })

      return {
        ...fabricSpec,
        reedWidth: Number(fabricSpec.reedWidth),
      }
    } catch (error) {
      console.error('Failed to delete fabric spec:', error)
      throw new Error('Gagal menghapus spesifikasi kain.')
    }
  })
