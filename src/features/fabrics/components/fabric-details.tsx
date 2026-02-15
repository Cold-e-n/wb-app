import { Link } from '@tanstack/react-router'

import { Fabric } from '@/types/Fabric'
import { useFabric } from '../hooks/use-fabric'
import { FabricLoomLayout } from './fabric-loom-layout'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { MoveLeft, ChevronLeft, ChevronRight } from 'lucide-react'

type FabricDetailsProps = {
  fabric: Fabric
}

export const FabricDetails = ({ fabric }: FabricDetailsProps) => {
  const { data: fabrics = [] } = useFabric()

  // Find the current fabric index
  const currentIndex = fabrics.findIndex((f) => f.id === fabric.id)

  // Calculate previous and next fabrics
  const prevFabric = currentIndex > 0 ? fabrics[currentIndex - 1] : null
  const nextFabric =
    currentIndex < fabrics.length - 1 ? fabrics[currentIndex + 1] : null

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" asChild>
          <Link to="/fabrics">
            <MoveLeft />
            Kembali
          </Link>
        </Button>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled={!prevFabric}
                asChild={!!prevFabric}
              >
                {prevFabric ? (
                  <Link
                    to="/fabrics/$fabricsId"
                    params={{ fabricsId: prevFabric.id }}
                  >
                    <ChevronLeft />
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sebelumnya</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled={!nextFabric}
                asChild={!!nextFabric}
              >
                {nextFabric ? (
                  <Link
                    to="/fabrics/$fabricsId"
                    params={{ fabricsId: nextFabric.id }}
                  >
                    <ChevronRight />
                  </Link>
                ) : (
                  <span>
                    <ChevronRight />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Berikutnya</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detail Kain</CardTitle>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/fabrics/$fabricsId" params={{ fabricsId: fabric.id }}>
                [Edit]
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold">{fabric.name}</p>

          <div className="pt-4">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Visualisasi Loom
            </p>
            <FabricLoomLayout />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
