import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ColorPositionsTable } from './table/color-positions-table'
import { type ColorPositionWithRelations } from './color-positions-provider'
import { ColorPositionsDeleteDialog } from './color-positions-delete-dialog'
import { ColorPositionsDialogs } from './color-positions-dialogs'
import { useColorPositionsContext } from './color-positions-provider'

type ColorPositionsProps = {
  data: ColorPositionWithRelations[]
}

export const ColorPositions = ({ data }: ColorPositionsProps) => {
  const { setOpen, setCurrentRow } = useColorPositionsContext()
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Posisi Warna</h1>
            <p className="text-muted-foreground">
              Detail posisi warna untuk produksi
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentRow(null)
                setOpen('create')
              }}
            >
              Buat baru <Plus className="ml-2" />
            </Button>
          </div>
        </div>

        <ColorPositionsTable data={data} />
      </div>
      <ColorPositionsDialogs />
      <ColorPositionsDeleteDialog />
    </>
  )
}
