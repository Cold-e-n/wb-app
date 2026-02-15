import { Button } from '@/components/ui/button'
import { useFabricsContext } from './fabrics-provider'
import { FabricsTable } from './table/fabrics-table'
import { FabricsDialogs } from './fabrics-dialogs'
import { FabricsSheet } from './fabrics-sheet'
import { FabricsDeleteDialog } from './fabrics-delete-dialog'

import { Plus } from 'lucide-react'

import { type Fabric } from '@/types/Fabric'

type FabricsProps = {
  data: Fabric[]
}

export const Fabrics = ({ data }: FabricsProps) => {
  const { setOpen } = useFabricsContext()

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Kain</h1>
            <p className="text-muted-foreground">Data kain yang ada.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen('create')}>
              Buat baru <Plus className="ml-2" />
            </Button>
          </div>
        </div>

        <FabricsTable data={data} />
      </div>
      <FabricsDialogs />
      <FabricsSheet />
      <FabricsDeleteDialog />
    </>
  )
}
