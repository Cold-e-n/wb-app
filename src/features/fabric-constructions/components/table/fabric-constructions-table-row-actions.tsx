import { BookSearch, Pencil, Trash2 } from 'lucide-react'
import type { Row } from '@tanstack/react-table'
import { useFabricConstructionsContext } from '../fabric-constructions-provider'
import { fabricConstructionSchema } from '@/types/FabricConstruction'
import { DataTableRowActions } from '@/components/data-table/row-actions'

type FabricConstructionsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const FabricConstructionsTableRowActions = <TData,>({
  row,
}: FabricConstructionsTableRowActionsProps<TData>) => {
  const fabricConstruction = fabricConstructionSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useFabricConstructionsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Detail',
          icon: BookSearch,
          href: `/fabric-constructions/${fabricConstruction.constructionId}`,
        },
        {
          type: 'item',
          label: 'Edit',
          icon: Pencil,
          href: `/fabric-constructions/${fabricConstruction.constructionId}/edit`,
        },
        {
          type: 'separator',
        },
        {
          type: 'item',
          label: 'Hapus',
          icon: Trash2,
          onClick: () => {
            setCurrentRow(fabricConstruction)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}
