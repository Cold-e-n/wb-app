import { Plus } from 'lucide-react'
import { useWeavingMachinesContext } from './weaving-machines-provider'
import { WeavingMachinesTable } from './table/weaving-machines-table'
import { WeavingMachinesDialogs } from './weaving-machines-dialogs'
import { WeavingMachinesDeleteDialog } from './weaving-machines-delete-dialog'

import type { WeavingMachine } from '@/types/WeavingMachine'
import { Button } from '@/components/ui/button'

type WeavingMachinesProps = {
  data: Array<WeavingMachine>
}

export const WeavingMachines = ({ data }: WeavingMachinesProps) => {
  const { setOpen } = useWeavingMachinesContext()

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Mesin Weaving</h1>
            <p className="text-muted-foreground">
              Data mesin weaving yang tersedia.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen('create')}
            >
              Buat baru <Plus className="ml-2" />
            </Button>
          </div>
        </div>

        <WeavingMachinesTable data={data} />
      </div>
      <WeavingMachinesDialogs />
      <WeavingMachinesDeleteDialog />
    </>
  )
}
