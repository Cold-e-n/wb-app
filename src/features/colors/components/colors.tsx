import { Button } from '@/components/ui/button'
import { useColorsContext } from './colors-provider'
import { ColorsTable } from './table/colors-table'
import { ColorsDialogs } from './colors-dialogs'
import { ColorsDeleteDialog } from './colors-delete-dialog'

import { Plus } from 'lucide-react'

import { type Color } from '@/types/Color'

type ColorsProps = {
  data: Color[]
}

export const Colors = ({ data }: ColorsProps) => {
  const { setOpen } = useColorsContext()

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Benang Warna</h1>
            <p className="text-muted-foreground">
              Data benang warna yang digunakan.
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

        <ColorsTable data={data} />
      </div>
      <ColorsDialogs />
      <ColorsDeleteDialog />
    </>
  )
}
