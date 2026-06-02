import { Link } from '@tanstack/react-router'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'

import { Button } from '@/components/ui/button'
import { FabricConstructionsProvider } from './fabric-constructions-provider'
import { FabricConstructionsTable } from './table/fabric-constructions-table'
import { FabricConstructionsDeleteDialog } from './fabric-constructions-delete-dialog'

import { Plus } from 'lucide-react'

type FabricConstructionsProps = {
  data: Array<FabricConstructionWithRelation>
}

export const FabricConstructions = ({ data }: FabricConstructionsProps) => {
  return (
    <FabricConstructionsProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Konstruksi Kain
            </h1>
            <p className="text-muted-foreground">
              Data konstruksi kain untuk perhitungan instruksi.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/fabric-constructions/add-new">
                Buat baru <Plus className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <FabricConstructionsTable data={data} />
      </div>
      <FabricConstructionsDeleteDialog />
    </FabricConstructionsProvider>
  )
}
