import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as Api from '../api/color-positions.api'
import type { fabricContentSchema } from '@/types/ColorPosition'
import type { z } from 'zod'

export const getColorPositionsQueryOptions = queryOptions({
  queryKey: ['colorPositions'],
  queryFn: Api.getColorPositions,
  staleTime: 0,
})

export const getColorPositionByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['colorPositions', id],
    queryFn: () => Api.getColorPositionById({ data: { id } }),
    enabled: !!id,
    staleTime: 0,
  })

export const useColorPositions = () => {
  return useSuspenseQuery(getColorPositionsQueryOptions)
}

export const useColorPositionById = (id: string) => {
  return useSuspenseQuery(getColorPositionByIdQueryOptions(id))
}

type FabricContent = z.infer<typeof fabricContentSchema>

export const useColorPositionsMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['colorPositions'] })
    queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    queryClient.invalidateQueries({ queryKey: ['colorLayouts'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: {
      fabricId: string
      colorLayoutId: string
      fabricContent: FabricContent
      wbNo: string
    }) => {
      return Api.createColorPosition({ data })
    },
    onSuccess: async (result) => {
      toast.success('Posisi warna berhasil ditambahkan')
      invalidate()

      await queryClient.prefetchQuery({
        queryKey: ['colorPositions', result.id],
      })
      router.navigate({
        to: '/color-positions/$colorPositionId',
        params: { colorPositionId: result.id },
      })
    },
    onError: (error) => {
      toast.error('Gagal menambahkan posisi warna', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      fabricId: string
      colorLayoutId: string
      fabricContent: FabricContent
      wbNo: string
    }) => {
      return Api.updateColorPosition({ data })
    },
    onSuccess: (_, data) => {
      toast.success('Posisi warna berhasil diupdate')
      queryClient.invalidateQueries({ queryKey: ['colorPositions', data.id] })
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate posisi warna', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteColorPosition({ data })
    },
    onSuccess: () => {
      toast.success('Posisi warna berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus posisi warna', {
        description: error.message,
      })
    },
  })

  return {
    invalidate,
    createMutation,
    updateMutation,
    deleteMutation,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  }
}
