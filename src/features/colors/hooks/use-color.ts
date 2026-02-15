import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import * as Api from '../api/colors.api'

import { toast } from 'sonner'

export const getColorsQueryOptions = queryOptions({
  queryKey: ['colors'],
  queryFn: () => Api.getColors(),
})

export const getColorByIdQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: ['color', id],
    queryFn: () => Api.getColorById({ data: { id: id! } }),
    enabled: !!id,
  })

export const useColor = () => {
  return useQuery(getColorsQueryOptions)
}

export const useColorById = (colorId: string | undefined) => {
  return useQuery(getColorByIdQueryOptions(colorId))
}

export const useColorsMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['colors'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: { colors: { name: string }[] }) => {
      return Api.createColors({ data })
    },
    onSuccess: (_, items) => {
      toast.success('Benang Warna berhasil ditambahkan', {
        description: items.colors.map((color) => color.name).join(', '),
      })
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan benang warna', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      return Api.updateColor({ data })
    },
    onSuccess: () => {
      toast.success('Benang Warna berhasil diupdate')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate benang warna', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteColor({ data })
    },
    onSuccess: () => {
      toast.success('Benang Warna berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus benang warna', {
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
