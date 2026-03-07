import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'
import { createFabricSchema, updateFabricSchema } from '@/types/Fabric'

export const getFabrics = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const fabrics = await prisma.fabric.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        hasColor: true,
        colorLayoutId: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return fabrics
  } catch (error) {
    console.error('Failed to fetch fabrics:', error)
    throw new Error('Gagal mengambil data kain.')
  }
})

export const getFabricById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const fabric = await prisma.fabric.findUnique({
        where: {
          id: data.id,
        },
        include: {
          colorLayout: true,
        },
      })

      return fabric
    } catch (error) {
      console.error('Failed to fetch fabric by id:', error)
      throw new Error('Gagal mengambil detail kain.')
    }
  })

export const createFabrics = createServerFn({
  method: 'POST',
})
  .inputValidator(createFabricSchema)
  .handler(async ({ data }) => {
    try {
      const fabricToCreate = data.fabrics.map((fabric) => ({
        name: fabric.name,
        slug: createSlug(fabric.name),
      }))

      const createdFabrics = await prisma.fabric.createMany({
        data: fabricToCreate,
      })

      return createdFabrics
    } catch (error) {
      console.error('Failed to create fabric:', error)
      throw new Error(
        'Gagal menambahkan kain. Pastikan nama kain belum digunakan.',
      )
    }
  })

export const updateFabric = createServerFn({
  method: 'POST',
})
  .inputValidator(updateFabricSchema)
  .handler(async ({ data }) => {
    try {
      const existingFabric = await prisma.fabric.findUnique({
        where: { id: data.id },
        select: {
          colorLayoutId: true,
        },
      })

      const updatedFabric = await prisma.fabric.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: createSlug(data.name),
          ...(data.hasColor !== null &&
            data.hasColor !== undefined && { hasColor: data.hasColor }),
          ...(data.hasColor && {
            colorLayout: {
              upsert: {
                create: {
                  colorContent: {
                    name: data.colorName,
                    note: data.colorNote,
                  },
                },
                update: {
                  colorContent: {
                    name: data.colorName,
                    note: data.colorNote,
                  },
                },
              },
            },
          }),
          ...(!data.hasColor &&
            existingFabric?.colorLayoutId && {
              colorLayout: {
                delete: true,
              },
            }),
        },
      })

      return updatedFabric
    } catch (error) {
      console.error('Failed to update fabric:', error)
      throw new Error('Pastikan nama kain belum digunakan.')
    }
  })

// Schema for deleting a fabric
const deleteFabricSchema = z.object({
  id: z.string(),
})

export const deleteFabric = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteFabricSchema)
  .handler(async ({ data }) => {
    try {
      const deletedFabric = await prisma.fabric.delete({
        where: { id: data.id },
      })

      return deletedFabric
    } catch (error) {
      console.error('Failed to delete fabric:', error)
      throw new Error(
        'Gagal menghapus kain. Kain mungkin masih digunakan oleh data lain.',
      )
    }
  })
