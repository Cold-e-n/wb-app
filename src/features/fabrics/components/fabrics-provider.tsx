import { createPageProvider } from '@/providers/create-page-provider'
import { type Fabric } from '@/types/Fabric'

type FabricsDialogType = 'create' | 'update' | 'detail' | 'delete'

export const [FabricsProvider, useFabricsContext] = createPageProvider<
  FabricsDialogType,
  Fabric
>('Fabrics')
