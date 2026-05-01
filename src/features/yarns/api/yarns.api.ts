import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { createSlug } from '@/lib/utils'
import { createYarnSchema, updateYarnSchema } from '@/types/Yarn'

export const getYarns = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const yarns = await prisma.yarns.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return yarns
  } catch (error) {
    console.error('Failed to fetch yarns:', error)
    throw new Error('Gagal mengambil data benang.')
  }
})

export const getYarnById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const yarn = await prisma.yarns.findUnique({
        where: { id: data.id },
      })

      return yarn
    } catch (error) {
      console.error('Failed to fetch yarn by id:', error)
      throw new Error('Gagal mengambil detail benang.')
    }
  })

export const createYarns = createServerFn({
  method: 'POST',
})
  .inputValidator(createYarnSchema)
  .handler(async ({ data }) => {
    try {
      const yarnsToCreate = data.yarns.map((yarn) => ({
        name: yarn.name,
        slug: createSlug(yarn.name),
      }))

      const createdYarns = await prisma.yarns.createMany({
        data: yarnsToCreate,
      })

      return createdYarns
    } catch (error) {
      console.error('Failed to create yarns:', error)
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
      const updatedYarn = await prisma.yarns.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: createSlug(data.name),
        },
      })

      return updatedYarn
    } catch (error) {
      console.error('Failed to update yarn:', error)
      throw new Error(
        'Gagal mengupdate benang. Pastikan nama belum digunakan.',
      )
    }
  })

// Schema for deleting a yarn
const deleteYarnSchema = z.object({
  id: z.string(),
})

export const deleteYarn = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteYarnSchema)
  .handler(async ({ data }) => {
    try {
      const deletedYarn = await prisma.yarns.delete({
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
