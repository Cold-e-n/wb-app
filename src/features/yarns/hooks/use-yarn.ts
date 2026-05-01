import React from 'react'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as Api from '../api/yarns.api'

export const getYarnsQueryOptions = queryOptions({
  queryKey: ['yarns'],
  queryFn: () => Api.getYarns(),
})

export const getYarnByIdQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: ['yarns', id],
    queryFn: () => Api.getYarnById({ data: { id: id! } }),
    enabled: !!id,
  })

export const useYarn = () => {
  return useQuery(getYarnsQueryOptions)
}

export const useYarnById = (yarnId: string | undefined) => {
  return useQuery(getYarnByIdQueryOptions(yarnId))
}

export const useYarnMap = () => {
  const { data: yarns = [] } = useYarn()
  const yarnMap = React.useMemo(() => {
    return new Map(yarns.map((y) => [y.id, y.name]))
  }, [yarns])

  return { yarnMap }
}

export const useYarnsMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['yarns'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: {
      yarns: Array<{ name: string; slug: string }>
    }) => {
      return Api.createYarns({ data })
    },
    onSuccess: (_, items) => {
      toast.success('Benang berhasil ditambahkan', {
        description: items.yarns.map((yarn) => yarn.name).join(', '),
      })
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan benang', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      return Api.updateYarn({ data })
    },
    onSuccess: () => {
      toast.success('Benang berhasil diupdate')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate benang', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteYarn({ data })
    },
    onSuccess: () => {
      toast.success('Benang berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus benang', {
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
