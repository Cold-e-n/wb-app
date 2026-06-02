import { useRouter, Link } from '@tanstack/react-router'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoveLeft, Pencil } from 'lucide-react'

import { InstructionSheet } from '@/components/instruction-sheet'

interface FabricConstructionDetailProps {
  fabricConstruction: FabricConstructionWithRelation
}

export const FabricConstructionDetail = ({
  fabricConstruction,
}: FabricConstructionDetailProps) => {
  const router = useRouter()

  if (!fabricConstruction || !fabricConstruction.fabricSpec) return null

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.history.go(-1)}
              >
                <MoveLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Kembali</TooltipContent>
          </Tooltip>
          <h1 className="text-2xl font-bold tracking-tight">
            Detail Konstruksi Kain
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link
            to="/fabric-constructions/$fabricConstructionId/edit"
            params={{ fabricConstructionId: fabricConstruction.id }}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
      </div>

      {/* Dokumen — semua field ditampilkan */}
      <InstructionSheet fabricConstruction={fabricConstruction} />
    </div>
  )
}
