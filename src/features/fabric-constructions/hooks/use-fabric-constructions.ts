import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as Api from '../api/fabric-constructions.api'

export const getFabricConstructionsQueryOptions = queryOptions({
  queryKey: ['fabricConstructions'],
  queryFn: Api.getFabricConstructions,
  staleTime: 0,
})

export const getFabricConstructionByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['fabricConstructions', id],
    queryFn: () => Api.getFabricConstructionById({ data: { id } }),
    enabled: !!id,
    staleTime: Infinity,
  })

export const getFabricConstructionByConstructionIdQueryOptions = (
  constructionId: string,
) =>
  queryOptions({
    queryKey: ['fabricConstructions', constructionId],
    queryFn: () =>
      Api.getFabricConstructionByConstructionId({ data: { constructionId } }),
    enabled: !!constructionId,
    staleTime: Infinity,
  })

export const useFabricConstructions = () => {
  return useSuspenseQuery(getFabricConstructionsQueryOptions)
}

export const useFabricConstructionById = (id: string) => {
  return useSuspenseQuery(getFabricConstructionByIdQueryOptions(id))
}

export const useFabricConstructionMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = async () => {
    queryClient.invalidateQueries({ queryKey: ['fabricConstructions'] })
    await router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return Api.createFabricConstruction({ data })
    },
    onSuccess: async () => {
      toast.success('Konstruksi kain berhasil dibuat')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal membuat konstruksi kain', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return Api.updateFabricConstruction({ data })
    },
    onSuccess: async () => {
      toast.success('Konstruksi kain berhasil diperbarui')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal memperbarui konstruksi kain', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteFabricConstruction({ data })
    },
    onSuccess: async () => {
      toast.success('Konstruksi kain berhasil dihapus')
      await invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus konstruksi kain', {
        description: error.message,
      })
    },
  })

  const deleteManyMutation = useMutation({
    mutationFn: async (data: { ids: Array<string> }) => {
      return Api.deleteManyFabricConstructions({ data })
    },
    onSuccess: (result) => {
      toast.success(`${result.count} konstruksi kain berhasil dihapus`)
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus konstruksi kain terpilih', {
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
