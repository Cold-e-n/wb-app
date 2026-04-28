import type { WeavingMachine } from '@/types/WeavingMachine'
import { createPageProvider } from '@/providers/create-page-provider'

type WeavingMachineDialogType = 'create' | 'update' | 'delete'

export const [WeavingMachinesProvider, useWeavingMachinesContext] =
  createPageProvider<WeavingMachineDialogType, WeavingMachine>(
    'WeavingMachines',
  )
