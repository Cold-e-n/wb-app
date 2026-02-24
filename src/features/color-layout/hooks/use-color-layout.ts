import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import * as Api from '../api/color-layout.api'
import { toast } from 'sonner'

export const getColorLayoutQueryOptions = queryOptions({
  queryKey: ['colorLayout'],
  queryFn: Api.getColorLayout,
})

export const getColorLayoutByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['colorLayout', id],
    queryFn: () => Api.getColorLayoutById({ data: { id } }),
    enabled: !!id,
  })

export const useColorLayout = () => {
  return useSuspenseQuery(getColorLayoutQueryOptions)
}

export const useColorLayoutById = (id: string) => {
  return useSuspenseQuery(getColorLayoutByIdQueryOptions(id))
}

export const useColorLayoutMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['colorLayout'] })
    queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: { fabricId: string; colorContent: any }) => {
      return Api.createColorLayout({ data })
    },
    onSuccess: () => {
      toast.success('Layout benang warna berhasil ditambahkan')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan layout', { description: error.message })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      fabricId: string
      colorContent: any
    }) => {
      return Api.updateColorLayout({ data })
    },
    onSuccess: () => {
      toast.success('Layout benang warna berhasil diupdate')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate layout', { description: error.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteColorLayout({ data })
    },
    onSuccess: () => {
      toast.success('Layout benang warna berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus layout', { description: error.message })
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
