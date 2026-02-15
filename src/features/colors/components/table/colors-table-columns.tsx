import { ColumnDef } from '@tanstack/react-table'
import { type Color } from '@/types/Color'

import { Checkbox } from '@/components/ui/checkbox'
import { ColorsTableRowActions } from './colors-table-row-actions'

export const colorsTableColumns: ColumnDef<Color>[] = [
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nama Benang Warna',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ColorsTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
