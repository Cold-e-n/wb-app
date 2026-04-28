import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import * as Api from '../api/weaving-machines.api'

export const getWeavingMachinesQueryOptions = queryOptions({
  queryKey: ['weaving-machines'],
  queryFn: () => Api.getWeavingMachines(),
})

export const getWeavingMachineByIdQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: ['weaving-machines', id],
    queryFn: () => Api.getWeavingMachineById({ data: { id: id! } }),
    enabled: !!id,
  })

export const useWeavingMachine = () => {
  return useQuery(getWeavingMachinesQueryOptions)
}

export const useWeavingMachineById = (machineId: string | undefined) => {
  return useQuery(getWeavingMachineByIdQueryOptions(machineId))
}

export const useWeavingMachineMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['weaving-machines'] })
    router.invalidate()
  }

  const createMutation = useMutation({
    mutationFn: async (data: {
      WeavingMachines: Array<{ name: string; width: number; type: string }>
    }) => {
      return Api.createWeavingMachines({ data })
    },
    onSuccess: (_, items) => {
      toast.success('Mesin Weaving berhasil ditambahkan', {
        description: items.WeavingMachines.map((machine) => machine.name).join(
          ', ',
        ),
      })
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menambahkan mesin weaving', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      name: string
      width: number
      type: string
    }) => {
      return Api.updateWeavingMachine({ data })
    },
    onSuccess: () => {
      toast.success('Mesin Weaving berhasil diupdate')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal mengupdate mesin weaving', {
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return Api.deleteWeavingMachine({ data })
    },
    onSuccess: () => {
      toast.success('Mesin Weaving berhasil dihapus')
      invalidate()
    },
    onError: (error) => {
      toast.error('Gagal menghapus mesin weaving', {
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
