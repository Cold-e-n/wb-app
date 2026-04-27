import { ColorLayoutTableRowActions } from './color-layout-table-row-actions'
import type { ColumnDef } from '@tanstack/react-table'
import type {ColorContent, ColorLayout} from '@/types/ColorLayout';

import { Checkbox } from '@/components/ui/checkbox'


// Define a type that includes the joined fabric data balance from the API
export type ColorLayoutWithFabric = Omit<ColorLayout, 'colorContent'> & {
  colorContent: ColorContent
  fabric: {
    id: string
    name: string
  }
}

export const colorLayoutTableColumns: Array<ColumnDef<ColorLayoutWithFabric>> = [
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
    accessorKey: 'fabric.name',
    header: 'Nama Kain',
    cell: ({ row }) => row.original.fabric.name,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ColorLayoutTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
