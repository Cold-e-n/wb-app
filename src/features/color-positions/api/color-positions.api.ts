import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { fabricContentSchema } from '@/types/ColorPosition'

export const getColorPositions = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const colorPositions = await prisma.colorPosition.findMany({
      select: {
        id: true,
        fabricId: true,
        colorLayoutId: true,
        fabricContent: true,
        wbNo: true,
        createdAt: true,
        fabric: {
          select: {
            id: true,
            name: true,
          },
        },
        colorLayout: {
          select: {
            id: true,
            colorContent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return colorPositions
  } catch (error) {
    console.error('Failed to fetch color positions:', error)
    throw new Error('Gagal mengambil data posisi warna.')
  }
})

export const getColorPositionById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const colorPosition = await prisma.colorPosition.findUnique({
        where: { id: data.id },
        select: {
          id: true,
          fabricId: true,
          colorLayoutId: true,
          fabricContent: true,
          wbNo: true,
          fabric: {
            select: {
              id: true,
              name: true,
            },
          },
          colorLayout: {
            select: {
              id: true,
              colorContent: true,
            },
          },
        },
      })

      return colorPosition
    } catch (error) {
      console.error('Failed to fetch color position by id:', error)
      throw new Error('Gagal mengambil detail posisi warna.')
    }
  })

// Schema for creating color position
const createColorPositionSchema = z.object({
  fabricId: z.string().min(1),
  colorLayoutId: z.string().min(1),
  fabricContent: fabricContentSchema,
  wbNo: z.string().min(1),
})

export const createColorPosition = createServerFn({
  method: 'POST',
})
  .inputValidator(createColorPositionSchema)
  .handler(async ({ data }) => {
    try {
      const createdPosition = await prisma.colorPosition.create({
        data: {
          fabricId: data.fabricId,
          colorLayoutId: data.colorLayoutId,
          fabricContent: data.fabricContent as any, // Json support
          wbNo: data.wbNo,
        },
      })

      return createdPosition
    } catch (error) {
      console.error('Failed to create color position:', error)
      throw new Error('Gagal menambahkan posisi warna.')
    }
  })

// Schema for updating color position
const updateColorPositionSchema = z.object({
  id: z.string(),
  fabricId: z.string().min(1),
  colorLayoutId: z.string().min(1),
  fabricContent: fabricContentSchema,
  wbNo: z.string().min(1),
})

export const updateColorPosition = createServerFn({
  method: 'POST',
})
  .inputValidator(updateColorPositionSchema)
  .handler(async ({ data }) => {
    try {
      const updatedPosition = await prisma.colorPosition.update({
        where: { id: data.id },
        data: {
          fabricId: data.fabricId,
          colorLayoutId: data.colorLayoutId,
          fabricContent: data.fabricContent as any, // Json support
          wbNo: data.wbNo,
        },
      })

      return updatedPosition
    } catch (error) {
      console.error('Failed to update color position:', error)
      throw new Error('Gagal mengupdate posisi warna.')
    }
  })

// Schema for deleting color position
const deleteColorPositionSchema = z.object({
  id: z.string(),
})

export const deleteColorPosition = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteColorPositionSchema)
  .handler(async ({ data }) => {
    try {
      const deletedPosition = await prisma.colorPosition.delete({
        where: { id: data.id },
      })

      return deletedPosition
    } catch (error) {
      console.error('Failed to delete color position:', error)
      throw new Error('Gagal menghapus posisi warna.')
    }
  })
