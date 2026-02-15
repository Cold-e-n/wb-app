import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

import { Plus } from 'lucide-react'
import { ColorLayoutTable } from './table/color-layout-table'
import { ColorLayoutWithFabric } from './table/color-layout-table-columns'
import { ColorLayoutDeleteDialog } from './color-layout-delete-dialog'

type ColorLayoutProps = {
  data: ColorLayoutWithFabric[]
}

export const ColorLayout = ({ data }: ColorLayoutProps) => {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Layout Benang Warna
            </h1>
            <p className="text-muted-foreground">Data layout benang warna</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/color-layouts/add-new">
                Buat baru <Plus className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <ColorLayoutTable data={data} />
      </div>
      <ColorLayoutDeleteDialog />
    </>
  )
}
