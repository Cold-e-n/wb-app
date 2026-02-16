import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
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
import { ColorLayoutGrid2 } from './color-layout-grid2'
import { ChevronLeft, ChevronRight, MoveLeft } from 'lucide-react'

interface ColorLayoutDetailsProps {
  colorLayout: ColorLayout & { fabric: { name: string } }
}

const ColorName = ({ colorId }: { colorId: string }) => {
  const { data: color } = useColorById(colorId)
  return <>{color?.name || '...'}</>
}

const ColorInfoDisplay = ({ colorContent }: { colorContent: ColorContent }) => {
  const { type, color = [], colorCount, OUT } = colorContent

  const renderOUT = () => {
    if (!OUT) return null

    // Check if OUT color is the same as main color (Single type)
    const isSameColor =
      OUT.color.length === color.length &&
      OUT.color.every((c, i) => c === color[i])

    if (isSameColor) {
      return ` + OUT ${OUT.count} Helai`
    }

    // If OUT color is different (e.g. 2 different colors)
    return (
      <>
        {' + OUT 1 Helai ('}
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

  if (type === 'double') {
    const isSameColor = color.length === 2 && color[0] === color[1]

    if (!OUT) {
      if (isSameColor) {
        return (
          <>
            <ColorName colorId={color[0]} /> Double {colorCount} Helai
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
        </>
      )
    }

    // Fallback for double with OUT (or more than 2 colors if any)
    return (
      <>
        {color?.map((id, index) => (
          <span key={`${id}-${index}`}>
            {index > 0 && ' + '}
            <ColorName colorId={id} /> {colorCount} Helai
          </span>
        ))}
        {renderOUT()}
      </>
    )
  }

  // Default for single, triple, etc.
  return (
    <>
      {color[0] && <ColorName colorId={color[0]} />} {colorCount} Helai
      {renderOUT()}
    </>
  )
}

export const ColorLayoutDetails = ({
  colorLayout,
}: ColorLayoutDetailsProps) => {
  const navigate = useNavigate()
  const { data: colorLayouts = [] } = useColorLayout()
  const colorContent = colorLayout?.colorContent as ColorContent
  const ReactJson = React.lazy(() => import('react-json-view'))

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
          <div className="flex items-center gap-2 mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="-ml-2"
                  onClick={() => navigate({ to: '/color-layouts' })}
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
            <div>
              <div className="mt-2 overflow-hidden rounded-md border p-4">
                {/* 3. Bungkus dengan Suspense agar tidak error saat loading */}
                <React.Suspense
                  fallback={
                    <div className="text-sm text-muted-foreground">
                      Loading viewer...
                    </div>
                  }
                >
                  <ReactJson
                    src={(colorLayout.colorContent as object) || {}}
                    theme="rjv-default"
                    collapsed={2}
                    name={false}
                    displayDataTypes={true}
                    displayObjectSize={true}
                    enableClipboard={true}
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  />
                </React.Suspense>
              </div>
            </div>

            <ColorLayoutGrid2 colorContent={colorContent} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
