import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'
import { createColorsSchema, updateColorSchema } from '@/types/Color'

export const getColors = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const colors = await prisma.color.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return colors
  } catch (error) {
    console.error('Failed to fetch colors:', error)
    throw new Error('Gagal mengambil data benang warna.')
  }
})

export const getColorById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const color = await prisma.color.findUnique({
        where: { id: data.id },
      })

      return color
    } catch (error) {
      console.error('Failed to fetch color by id:', error)
      throw new Error('Gagal mengambil detail benang warna.')
    }
  })

export const createColors = createServerFn({
  method: 'POST',
})
  .inputValidator(createColorsSchema)
  .handler(async ({ data }) => {
    try {
      const colorsToCreate = data.colors.map((color) => ({
        name: color.name,
        slug: createSlug(color.name),
      }))

      const createdColors = await prisma.color.createMany({
        data: colorsToCreate,
      })

      return createdColors
    } catch (error) {
      console.error('Failed to create colors:', error)
      throw new Error(
        'Gagal menambahkan benang warna. Pastikan nama belum digunakan.',
      )
    }
  })

export const updateColor = createServerFn({
  method: 'POST',
})
  .inputValidator(updateColorSchema)
  .handler(async ({ data }) => {
    try {
      const updatedColor = await prisma.color.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: createSlug(data.name),
        },
      })

      return updatedColor
    } catch (error) {
      console.error('Failed to update color:', error)
      throw new Error(
        'Gagal mengupdate benang warna. Pastikan nama belum digunakan.',
      )
    }
  })

// Schema for deleting a color
const deleteColorSchema = z.object({
  id: z.string(),
})

export const deleteColor = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteColorSchema)
  .handler(async ({ data }) => {
    try {
      const deletedColor = await prisma.color.delete({
        where: { id: data.id },
      })

      return deletedColor
    } catch (error) {
      console.error('Failed to delete color:', error)
      throw new Error(
        'Gagal menghapus benang warna. Warna mungkin masih digunakan oleh data lain.',
      )
    }
  })
