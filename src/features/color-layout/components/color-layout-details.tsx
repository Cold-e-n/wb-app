import { Link, useRouter } from '@tanstack/react-router'
import { useColorLayout } from '../hooks/use-color-layout'
import { useColorById } from '@/features/colors/hooks/use-color'
import { type ColorLayout } from '@/types/ColorLayout'
import { type ColorContent } from '@/types/ColorLayout'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColorLayoutGrid } from './color-layout-grid'
import { ChevronLeft, ChevronRight, MoveLeft } from 'lucide-react'

interface ColorLayoutDetailsProps {
  colorLayout: ColorLayout & { fabric: { name: string } }
}

const ColorName = ({ colorId }: { colorId: string }) => {
  const { data: color } = useColorById(colorId)
  return <>{color?.name || '...'}</>
}

export const ColorInfoDisplay = ({
  colorContent,
}: {
  colorContent: ColorContent
}) => {
  const { IN, OUT, colorCount, color = [], type, edgeTriple } = colorContent

  const renderIN = () => {
    if (!IN) return null

    return (
      <>
        {` + IN ${IN.count} Helai (`}
        {IN.color[0] && <ColorName colorId={IN.color[0]} />}
        {IN.color[1] && (
          <>
            {' + '}
            <ColorName colorId={IN.color[1]} />
          </>
        )}
        {')'}
      </>
    )
  }

  const renderOUT = () => {
    if (!OUT) return null

    const isSameColor = OUT.color.length === 2 && OUT.color[0] === OUT.color[1]

    if (isSameColor) {
      return <>{` + OUT ${OUT.count} Helai`}</>
    }

    return (
      <>
        {` + OUT ${OUT.count} Helai (`}
        {OUT.color[0] && <ColorName colorId={OUT.color[0]} />}
        {OUT.color[1] && (
          <>
            {' + '}
            <ColorName colorId={OUT.color[1]} />
          </>
        )}
        {')'}
      </>
    )
  }

  const renderEdgeTriple = () => {
    if (!edgeTriple) return null

    return (
      <>
        {' + Triple '}
        {edgeTriple && <ColorName colorId={edgeTriple.color} />}
      </>
    )
  }

  if (type === 'double') {
    const isSameColor = color.length === 2 && color[0] === color[1]

    if (isSameColor) {
      return (
        <>
          <ColorName colorId={color[0]} /> Double {colorCount} Helai
          {renderEdgeTriple()} {renderIN()} {renderOUT()}
        </>
      )
    }

    return (
      <>
        {color[0] && <ColorName colorId={color[0]} />}
        {color[1] && (
          <>
            {' + '}
            <ColorName colorId={color[1]} />
          </>
        )}
        {` ${colorCount} Helai`}
        {renderEdgeTriple()} {renderIN()} {renderOUT()}
      </>
    )
  }

  // Default for single, triple, etc.
  return (
    <>
      {color[0] && <ColorName colorId={color[0]} />} {colorCount} Helai
      {renderIN()} {renderOUT()}
    </>
  )
}

export const ColorLayoutDetails = ({
  colorLayout,
}: ColorLayoutDetailsProps) => {
  const router = useRouter()
  const { data: colorLayouts = [] } = useColorLayout()
  const colorContent = colorLayout?.colorContent as ColorContent

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

              <p className="text-2xl">
                <ColorInfoDisplay colorContent={colorContent} />
              </p>
            </div>

            <ColorLayoutGrid colorContent={colorContent} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
