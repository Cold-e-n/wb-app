import { useColorPositionsContext } from './color-positions-provider'
import { type ColorPositionWithRelations } from './color-positions-provider'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ColorPositionsTable } from './table/color-positions-table'
import { ColorPositionsDeleteDialog } from './color-positions-delete-dialog'
import { ColorPositionsDialogs } from './color-positions-dialogs'
import { Plus, AlertCircleIcon } from 'lucide-react'

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
              Data posisi benang warna pada kain
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

        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Catatan</AlertTitle>
          <AlertDescription>
            Untuk kain:
            <strong>1151039C(NL)-225</strong>
            <strong>1152031C(NL)-225</strong>
            <strong>E8640GBS-C236(I) Soaping</strong>
            <strong>R0390801-114[DBL]</strong>
            Belum bisa melalukan perhitungan posisi benang warna untuk saat ini.
          </AlertDescription>
        </Alert>

        <ColorPositionsTable data={data} />
      </div>
      <ColorPositionsDialogs />
      <ColorPositionsDeleteDialog />
    </>
  )
}
