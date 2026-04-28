import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { createSlug } from '@/lib/utils'
import {
  createWeavingMachinesSchema,
  updateWeavingMachinesSchema,
} from '@/types/WeavingMachine'

export const getWeavingMachines = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const weavingMachines = await prisma.weavingMachine.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        width: true,
        type: true,
      },
    })

    return weavingMachines.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    )
  } catch (error) {
    console.error('Failed to fetch weaving machines:', error)
    throw new Error('Gagal mengambil data mesin weaving.')
  }
})

export const getWeavingMachineById = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const weavingMachine = await prisma.weavingMachine.findUnique({
        where: { id: data.id },
      })

      return weavingMachine
    } catch (error) {
      console.error('Failed to fetch weaving machine by id:', error)
      throw new Error('Gagal mengambil detail mesin weaving.')
    }
  })

export const createWeavingMachines = createServerFn({
  method: 'POST',
})
  .inputValidator(createWeavingMachinesSchema)
  .handler(async ({ data }) => {
    try {
      const machinesToCreate = data.WeavingMachines.map((machine) => ({
        name: machine.name,
        slug: createSlug(machine.name),
        width: machine.width,
        type: machine.type,
      }))

      const createdMachines = await prisma.weavingMachine.createMany({
        data: machinesToCreate,
      })

      return createdMachines
    } catch (error) {
      console.error('Failed to create weaving machines:', error)
      throw new Error(
        'Gagal menambahkan mesin weaving. Pastikan nama belum digunakan.',
      )
    }
  })

export const updateWeavingMachine = createServerFn({
  method: 'POST',
})
  .inputValidator(updateWeavingMachinesSchema)
  .handler(async ({ data }) => {
    try {
      const updatedMachine = await prisma.weavingMachine.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: createSlug(data.name),
          width: data.width,
          type: data.type,
        },
      })

      return updatedMachine
    } catch (error) {
      console.error('Failed to update weaving machine:', error)
      throw new Error(
        'Gagal mengupdate mesin weaving. Pastikan nama belum digunakan.',
      )
    }
  })

// Schema for deleting a weaving machine
const deleteWeavingMachineSchema = z.object({
  id: z.string(),
})

export const deleteWeavingMachine = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteWeavingMachineSchema)
  .handler(async ({ data }) => {
    try {
      const deletedMachine = await prisma.weavingMachine.delete({
        where: { id: data.id },
      })

      return deletedMachine
    } catch (error) {
      console.error('Failed to delete weaving machine:', error)
      throw new Error(
        'Gagal menghapus mesin weaving. Mesin mungkin masih digunakan oleh data lain.',
      )
    }
  })
