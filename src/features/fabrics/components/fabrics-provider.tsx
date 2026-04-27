import type {Fabric} from '@/types/Fabric';
import { createPageProvider } from '@/providers/create-page-provider'

type FabricsDialogType = 'create' | 'update' | 'detail' | 'delete'

export const [FabricsProvider, useFabricsContext] = createPageProvider<
  FabricsDialogType,
  Fabric
>('Fabrics')
