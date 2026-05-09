import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { createSlug } from '@/lib/utils'
import { createYarnSchema, updateYarnSchema } from '@/types/Yarn'

export const getYarn = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const yarn = await prisma.yarn.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return yarn
  } catch (error) {
    console.error('Failed to fetch yarn:', error)
    throw new Error('Gagal mengambil data benang.')
  }
})

export const getYarnById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const yarn = await prisma.yarn.findUnique({
        where: { id: data.id },
      })

      return yarn
    } catch (error) {
      console.error('Failed to fetch yarn by id:', error)
      throw new Error('Gagal mengambil detail benang.')
    }
  })

export const createYarn = createServerFn({
  method: 'POST',
})
  .inputValidator(createYarnSchema)
  .handler(async ({ data }) => {
    try {
      const yarnToCreate = data.yarns.map((yarn) => ({
        name: yarn.name,
        slug: createSlug(yarn.name),
      }))

      const createdyarn = await prisma.yarn.createMany({
        data: yarnToCreate,
      })

      return createdyarn
    } catch (error) {
      console.error('Failed to create yarn:', error)
      throw new Error(
        'Gagal menambahkan benang. Pastikan nama belum digunakan.',
      )
    }
  })

export const updateYarn = createServerFn({
  method: 'POST',
})
  .inputValidator(updateYarnSchema)
  .handler(async ({ data }) => {
    try {
      const updatedYarn = await prisma.yarn.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: createSlug(data.name),
        },
      })

      return updatedYarn
    } catch (error) {
      console.error('Failed to update yarn:', error)
      throw new Error('Gagal mengupdate benang. Pastikan nama belum digunakan.')
    }
  })

// Schema for deleting a yarn
const deleteyarnchema = z.object({
  id: z.string(),
})

export const deleteYarn = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteyarnchema)
  .handler(async ({ data }) => {
    try {
      const deletedYarn = await prisma.yarn.delete({
        where: { id: data.id },
      })

      return deletedYarn
    } catch (error) {
      console.error('Failed to delete yarn:', error)
      throw new Error(
        'Gagal menghapus benang. Benang mungkin masih digunakan oleh data lain.',
      )
    }
  })

export const deleteManyYarns = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ ids: z.array(z.string()) }))
  .handler(async ({ data }) => {
    try {
      const result = await prisma.yarn.deleteMany({
        where: {
          id: { in: data.ids },
        },
      })

      return result
    } catch (error) {
      console.error('Failed to delete many yarns:', error)
      throw new Error(
        'Gagal menghapus benang terpilih. Beberapa data mungkin masih digunakan.',
      )
    }
  })
