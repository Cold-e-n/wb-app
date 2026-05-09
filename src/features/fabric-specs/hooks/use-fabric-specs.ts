import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as Api from '../api/fabric-specs.api'

export const getFabricSpecsQueryOptions = queryOptions({
  queryKey: ['fabricSpecs'],
  queryFn: Api.getFabricSpecs,
  staleTime: 0,
})

export const getFabricSpecByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['fabricSpecs', id],
    queryFn: () => Api.getFabricSpecById({ data: { id } }),
    enabled: !!id,
    staleTime: Infinity,
  })

export const useFabricSpecs = () => {
  return useSuspenseQuery(getFabricSpecsQueryOptions)
}

export const useFabricSpecById = (id: string) => {
  return useSuspenseQuery(getFabricSpecByIdQueryOptions(id))
}

export const useFabricSpecMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = async () => {
    queryClient.invalidateQueries({ queryKey: ['fabricSpecs'] })
    queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return Api.createFabricSpec({ data })
    },
    onSuccess: async () => {
      toast.success('Spesifikasi kain berhasil ditambahkan')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan spesifikasi kain', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return Api.updateFabricSpec({ data })
    },
    onSuccess: async () => {
      toast.success('Spesifikasi kain berhasil diupdate')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate spesifikasi kain', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteFabricSpec({ data })
    },
    onSuccess: async () => {
      toast.success('Spesifikasi kain berhasil dihapus')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus spesifikasi kain', {
        description: error.message,
      })
    },
  })

  const deleteManyMutation = useMutation({
    mutationFn: async (data: { ids: string[] }) => {
      return Api.deleteManyFabricSpecs({ data })
    },
    onSuccess: (result) => {
      toast.success(`${result.count} spesifikasi kain berhasil dihapus`)
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus spesifikasi kain terpilih', {
        description: error.message,
      })
    },
  })

  return {
    invalidate,
    createMutation,
    updateMutation,
    deleteMutation,
    deleteManyMutation,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      deleteManyMutation.isPending,
  }
}
