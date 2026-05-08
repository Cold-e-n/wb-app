import { Link } from '@tanstack/react-router'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'
import { Button } from '@/components/ui/button'
import { FabricSpecsProvider } from './fabric-specs-provider'
import { FabricSpecsTable } from './table/fabric-specs-table'
import { FabricSpecsDeleteDialog } from './fabric-specs-delete-dialog'
import { Plus } from 'lucide-react'

type FabricSpecsProps = {
  data: Array<FabricSpecWithRelation>
}

export const FabricSpecs = ({ data }: FabricSpecsProps) => {
  return (
    <FabricSpecsProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Spek Kain</h1>
            <p className="text-muted-foreground">Data spesifikasi kain</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/fabric-specs/add-new">
                Buat baru <Plus className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <FabricSpecsTable data={data} />
      </div>
      <FabricSpecsDeleteDialog />
    </FabricSpecsProvider>
  )
}
