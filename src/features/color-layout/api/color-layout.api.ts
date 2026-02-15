import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { colorContentSchema } from '@/types/ColorLayout'

export const getColorLayout = createServerFn({
  method: 'GET',
}).handler(async () => {
  if (!prisma?.colorLayout) {
    const keys = prisma ? Object.keys(prisma) : []
    const availableModels = keys.filter(
      (k) => !k.startsWith('_') && !k.startsWith('$') && k !== 'constructor',
    )
    console.error('Prisma colorLayout is undefined! Available keys:', keys)
    throw new Error(
      `Database service error: colorLayout model not found. Available models: ${availableModels.join(', ')}`,
    )
  }

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
})

export const getColorLayoutById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
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
    const createdLayout = await prisma.colorLayout.create({
      data: {
        fabricId: data.fabricId,
        colorContent: data.colorContent,
      },
    })

    return createdLayout
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
    const updatedLayout = await prisma.colorLayout.update({
      where: { id: data.id },
      data: {
        fabricId: data.fabricId,
        colorContent: data.colorContent,
      },
    })

    return updatedLayout
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
    const deletedLayout = await prisma.colorLayout.delete({
      where: { id: data.id },
    })

    return deletedLayout
  })
