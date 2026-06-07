import type { ColumnDef } from '@tanstack/react-table'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'

import { Checkbox } from '@/components/ui/checkbox'
import { truncate } from '@/lib/utils'
import { FabricConstructionsTableRowActions } from './fabric-constructions-table-row-actions'

export const columns: ColumnDef<FabricConstructionWithRelation>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'constructionId',
    header: 'ID Konstruksi',
    cell: ({ row }) => {
      return (
        <span className="font-semibold font-jetbrains-mono text-primary">
          CONST-{row.original.constructionId}
        </span>
      )
    },
  },
  {
    accessorKey: 'fabricSpec.fabric.name',
    id: 'fabricName',
    header: 'Kain',
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {truncate(row.original.fabricSpec?.fabric?.name ?? '-', 45)}
        </span>
      )
    },
  },
  {
    id: 'fabricDimension',
    header: 'Lebar x Panjang',
    cell: ({ row }) => {
      return (
        <span className="font-medium font-jetbrains-mono text-foreground">
          {`${row.original.fabricSpec.width}mm x ${row.original.fabricSpec.length}m`}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <FabricConstructionsTableRowActions row={row} />,
  },
]
