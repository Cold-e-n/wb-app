import { YarnsTableRowActions } from './yarns-table-row-actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { Yarn } from '@/types/Yarn'

import { Checkbox } from '@/components/ui/checkbox'

export const yarnsTableColumns: Array<ColumnDef<Yarn>> = [
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
    header: 'Nama Benang',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <YarnsTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
