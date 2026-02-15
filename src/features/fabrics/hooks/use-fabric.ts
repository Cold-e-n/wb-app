import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import * as Api from '../api/fabrics.api'

import { toast } from 'sonner'

export const getFabricsQueryOptions = queryOptions({
  queryKey: ['fabrics'],
  queryFn: () => Api.getFabrics(),
})

export const getFabricByIdQueryOptions = (fabricId: string) =>
  queryOptions({
    queryKey: ['fabric', fabricId],
    queryFn: () => Api.getFabricById({ data: { id: fabricId } }),
    enabled: !!fabricId,
  })

export const useFabric = () => {
  return useQuery(getFabricsQueryOptions)
}

export const useFabricById = (fabricId: string) => {
  return useQuery(getFabricByIdQueryOptions(fabricId))
}

export const useFabricsMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string
      hasColor?: boolean
      colorName?: string
      colorNote?: string
    }) => {
      return Api.createFabrics({ data: data })
    },
    onSuccess: (_, items) => {
      toast.success('Kain berhasil ditambahkan', {
        description: items.name,
        descriptionClassName: 'text-blue-900',
      })
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan kain', { description: error.message })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      name: string
      hasColor?: boolean
      colorName?: string
      colorNote?: string
    }) => {
      return Api.updateFabric({ data })
    },
    onSuccess: () => {
      toast.success('Kain berhasil diupdate')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate kain', { description: error.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteFabric({ data })
    },
    onSuccess: () => {
      toast.success('Kain berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus kain', { description: error.message })
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
