import { ColumnDef } from '@tanstack/react-table'
import { type ColorPositionWithRelations } from '../color-positions-provider'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPositionsTableRowActions } from '@/features/color-positions/components/table/color-positions-table-row-actions'

export const colorPositionsTableColumns: ColumnDef<ColorPositionWithRelations>[] =
  [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'wbNo',
      header: 'No WB',
    },
    {
      accessorKey: 'fabric.name',
      header: 'Kain',
      cell: ({ row }) => row.original.fabric.name,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ColorPositionsTableRowActions row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
