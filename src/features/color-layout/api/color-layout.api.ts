import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { colorContentSchema } from '@/types/ColorLayout'

export const getColorLayout = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const colorLayout = await prisma.colorLayout.findMany({
      select: {
        id: true,
        fabricId: true,
        colorContent: true,
        fabric: {
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

    return colorLayout
  } catch (error) {
    console.error('Failed to fetch color layouts:', error)
    throw new Error('Gagal mengambil data layout warna.')
  }
})

export const getColorLayoutById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const colorLayout = await prisma.colorLayout.findUnique({
        where: { id: data.id },
        select: {
          id: true,
          fabricId: true,
          colorContent: true,
          fabric: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return colorLayout
    } catch (error) {
      console.error('Failed to fetch color layout by id:', error)
      throw new Error('Gagal mengambil detail layout warna.')
    }
  })

// Schema for creating color layout
const createColorLayoutSchema = z.object({
  fabricId: z.string().min(1),
  colorContent: colorContentSchema,
})

export const createColorLayout = createServerFn({
  method: 'POST',
})
  .inputValidator(createColorLayoutSchema)
  .handler(async ({ data }) => {
    try {
      const createdLayout = await prisma.$transaction(async (tx) => {
        const layout = await tx.colorLayout.create({
          data: {
            fabricId: data.fabricId,
            colorContent: data.colorContent,
          },
        })

        // Update fabric to hasColor: true and set colorLayoutId
        await tx.fabric.update({
          where: { id: data.fabricId },
          data: {
            hasColor: true,
            colorLayoutId: layout.id,
          },
        })

        return layout
      })

      return createdLayout
    } catch (error) {
      console.error('Failed to create color layout:', error)
      throw new Error(
        'Gagal menambahkan layout warna. Pastikan kain belum memiliki layout.',
      )
    }
  })

// Schema for updating color layout
const updateColorLayoutSchema = z.object({
  id: z.string(),
  fabricId: z.string().min(1),
  colorContent: colorContentSchema,
})

export const updateColorLayout = createServerFn({
  method: 'POST',
})
  .inputValidator(updateColorLayoutSchema)
  .handler(async ({ data }) => {
    try {
      const updatedLayout = await prisma.colorLayout.update({
        where: { id: data.id },
        data: {
          fabricId: data.fabricId,
          colorContent: data.colorContent,
        },
      })

      return updatedLayout
    } catch (error) {
      console.error('Failed to update color layout:', error)
      throw new Error('Gagal mengupdate layout warna.')
    }
  })

// Schema for deleting color layout
const deleteColorLayoutSchema = z.object({
  id: z.string(),
})

export const deleteColorLayout = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteColorLayoutSchema)
  .handler(async ({ data }) => {
    try {
      const deletedLayout = await prisma.$transaction(async (tx) => {
        // Find the layout first to get fabricId
        const layout = await tx.colorLayout.findUnique({
          where: { id: data.id },
          select: { fabricId: true },
        })

        const deleted = await tx.colorLayout.delete({
          where: { id: data.id },
        })

        // Update fabric if layout was found
        if (layout) {
          await tx.fabric.update({
            where: { id: layout.fabricId },
            data: {
              hasColor: false,
              colorLayoutId: null,
            },
          })
        }

        return deleted
      })

      return deletedLayout
    } catch (error) {
      console.error('Failed to delete color layout:', error)
      throw new Error(
        'Gagal menghapus layout warna. Layout mungkin masih digunakan oleh posisi warna.',
      )
    }
  })
