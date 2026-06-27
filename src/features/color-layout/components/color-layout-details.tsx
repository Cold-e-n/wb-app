import { Link, useRouter } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, MoveLeft } from 'lucide-react'
import { useColorLayout } from '../hooks/use-color-layout'
import { ColorLayoutGrid } from './color-layout-grid'
import type { ColorLayout } from '@/types/ColorLayout'
import { useColorMap } from '@/features/colors/hooks/use-color'
import { colorInfo } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ColorLayoutDetailsProps {
  colorLayout: ColorLayout & { fabric: { name: string } }
}

export const ColorLayoutDetails = ({
  colorLayout,
}: ColorLayoutDetailsProps) => {
  const router = useRouter()
  const { data: colorLayouts = [] } = useColorLayout()
  const { colorMap } = useColorMap()
  const colorContent = colorLayout?.colorContent

  // Find current index
  const currentIndex = colorLayouts.findIndex((l) => l.id === colorLayout.id)

  // Calculate prev and next
  const prevLayout = currentIndex > 0 ? colorLayouts[currentIndex - 1] : null
  const nextLayout =
    currentIndex < colorLayouts.length - 1
      ? colorLayouts[currentIndex + 1]
      : null

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="-ml-2"
                  onClick={() => router.history.go(-1)}
                >
                  <MoveLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kembali</TooltipContent>
            </Tooltip>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Layout: {colorLayout.fabric.name}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled={!prevLayout}
                asChild={!!prevLayout}
              >
                {prevLayout ? (
                  <Link
                    to="/color-layouts/$colorLayoutId"
                    params={{ colorLayoutId: prevLayout.id }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-4 w-4" />
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
                disabled={!nextLayout}
                asChild={!!nextLayout}
              >
                {nextLayout ? (
                  <Link
                    to="/color-layouts/$colorLayoutId"
                    params={{ colorLayoutId: nextLayout.id }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Berikutnya</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Layout</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="h-full flex flex-col justify-center items-center gap-3">
              <h2 className="text-4xl font-semibold tracking-tight">
                {colorLayout.fabric.name}
              </h2>

              <p className="text-2xl">{colorInfo(colorContent, colorMap)}</p>
            </div>

            <ColorLayoutGrid colorContent={colorContent} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
