import type { FabricSpec } from '@/types/FabricSpec'
import { createPageProvider } from '@/providers/create-page-provider'

type FabricSpecDialogType = 'create' | 'update' | 'detail' | 'delete'

export const [FabricSpecsProvider, useFabricSpecsContext] = createPageProvider<
  FabricSpecDialogType,
  FabricSpec
>('FabricSpec')
