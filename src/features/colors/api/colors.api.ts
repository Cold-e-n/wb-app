import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

export const getColors = createServerFn({
  method: 'GET',
}).handler(async () => {
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
})

export const getColorById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const color = await prisma.color.findUnique({
      where: { id: data.id },
    })

    return color
  })

// Schema for creating colors
const createColorsSchema = z.object({
  colors: z.array(
    z.object({
      name: z.string().min(3),
    }),
  ),
})

export const createColors = createServerFn({
  method: 'POST',
})
  .inputValidator(createColorsSchema)
  .handler(async ({ data }) => {
    const colorsToCreate = data.colors.map((color) => ({
      name: color.name,
      slug: createSlug(color.name),
    }))

    const createdColors = await prisma.color.createMany({
      data: colorsToCreate,
    })

    return createdColors
  })

// Schema for updating a color
const updateColorSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
})

export const updateColor = createServerFn({
  method: 'POST',
})
  .inputValidator(updateColorSchema)
  .handler(async ({ data }) => {
    const updatedColor = await prisma.color.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: createSlug(data.name),
      },
    })

    return updatedColor
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
    const deletedColor = await prisma.color.delete({
      where: { id: data.id },
    })

    return deletedColor
  })
