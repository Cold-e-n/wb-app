import type { FabricConstruction } from '@/types/FabricConstruction'
import { createPageProvider } from '@/providers/create-page-provider'

type FabricConstructionDialogType = 'create' | 'update' | 'detail' | 'delete'

export const [FabricConstructionsProvider, useFabricConstructionsContext] = createPageProvider<
  FabricConstructionDialogType,
  FabricConstruction
>('FabricConstruction')
