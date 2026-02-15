import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

export const getFabrics = createServerFn({
  method: 'GET',
}).handler(async () => {
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
})

export const getFabricById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const fabric = await prisma.fabric.findUnique({
      where: {
        id: data.id,
      },
      include: {
        colorLayout: true,
      },
    })

    return fabric
  })

// Schema for creating fabrics
const createFabricSchema = z.object({
  name: z.string().min(3),
  hasColor: z
    .boolean()
    .nullable()
    .optional()
    .transform((v) => v ?? false),
  colorName: z.string().optional(),
  colorNote: z.string().optional(),
})

export const createFabrics = createServerFn({
  method: 'POST',
})
  .inputValidator(createFabricSchema)
  .handler(async ({ data }) => {
    const createdFabrics = await prisma.fabric.create({
      data: {
        name: data.name,
        slug: createSlug(data.name),
        hasColor: data.hasColor,
        ...(data.hasColor &&
          (data.colorName || data.colorNote) && {
            colorLayout: {
              create: {
                colorContent: {
                  name: data.colorName,
                  note: data.colorNote,
                },
              },
            },
          }),
      },
    })

    return createdFabrics
  })

// Schema for updating a fabric
const updateFabricSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  hasColor: z.boolean().nullable().optional(),
  colorName: z.string().optional(),
  colorNote: z.string().optional(),
})

export const updateFabric = createServerFn({
  method: 'POST',
})
  .inputValidator(updateFabricSchema)
  .handler(async ({ data }) => {
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
        ...(!data.hasColor && {
          colorLayout: {
            delete: true,
          },
        }),
      },
    })

    return updatedFabric
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
    const deletedFabric = await prisma.fabric.delete({
      where: { id: data.id },
    })

    return deletedFabric
  })
