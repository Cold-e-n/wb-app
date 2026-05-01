import { Plus } from 'lucide-react'
import { useYarnsContext } from './yarns-provider'
import { YarnsTable } from './table/yarns-table'
import { YarnsDialogs } from './yarns-dialogs'
import { YarnsDeleteDialog } from './yarns-delete-dialog'

import type { Yarn } from '@/types/Yarn'
import { Button } from '@/components/ui/button'

type YarnsProps = {
  data: Array<Yarn>
}

export const Yarns = ({ data }: YarnsProps) => {
  const { setOpen } = useYarnsContext()

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Benang</h1>
            <p className="text-muted-foreground">
              Data benang yang digunakan.
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

        <YarnsTable data={data} />
      </div>
      <YarnsDialogs />
      <YarnsDeleteDialog />
    </>
  )
}
