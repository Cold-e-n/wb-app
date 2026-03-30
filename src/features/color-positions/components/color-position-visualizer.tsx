import React from 'react'
import { useColorMap } from '@/features/colors/hooks/use-color'
import {
  cn,
  getArrowColorClass,
  getColorClass,
  isEdgeMarker,
} from '@/lib/utils'
import { type ColorPositionWithRelations } from '@/types/ColorPosition'

import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoveDown, Printer } from 'lucide-react'

interface ColorPositionVisualizerProps {
  positionResults: number[][]
  dataColor: ColorPositionWithRelations
}

export const ColorPositionVisualizer: React.FC<
  ColorPositionVisualizerProps
> = ({ positionResults, dataColor }) => {
  const { colorLayout } = dataColor
  const {
    type: layoutType,
    colorPairDistance,
    IN,
    colorCount,
  } = colorLayout.colorContent

  const inCount = IN?.count || 0
  const regularCount = colorCount

  const { colorMap } = useColorMap()

  const handlePrint = () => {
    window.print()
  }

  /**
   * Render arrows untuk edge-triple marker:
   * [pD] [main] [B] [B] [B] [main] [pD]
   * Total 5 arrows: main, black, black, black, main
   */
  const renderEdgeTripleArrows = (currentMarkerIndex: number) => {
    const mainColorClass = getArrowColorClass(
      currentMarkerIndex,
      0,
      colorMap,
      colorLayout?.colorContent,
    )
    const blackColorClass = getColorClass('BLACK')

    // Arrow order: [MAIN] [BLACK] [BLACK] [BLACK] [MAIN]
    const arrows = [
      { colorClass: mainColorClass, label: colorPairDistance },
      { colorClass: blackColorClass, label: null },
      { colorClass: blackColorClass, label: null },
      { colorClass: blackColorClass, label: colorPairDistance },
      { colorClass: mainColorClass, label: null },
    ]

    return (
      <div className="flex flex-col items-center relative">
        <div className="flex items-center -gap-1">
          {arrows.map((arrow, i) => (
            <React.Fragment key={i}>
              <MoveDown
                className={cn(
                  'w-4 h-4 translate-y-5.75 translate-x-0.5 shrink-0',
                  arrow.colorClass,
                )}
              />
              {arrow.label != null && (
                <span
                  className="absolute text-[12px] font-bold text-gray-800 dark:text-foreground print:dark:text-gray-900 translate-y-10 select-none shrink-0"
                  style={{ left: `${i * 16 + 13}px` }}
                >
                  {arrow.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Render arrows untuk marker biasa (single/double/triple, non-edge).
   */
  const renderRegularArrows = (currentMarkerIndex: number) => {
    const isIn = currentMarkerIndex < inCount
    const isOut = currentMarkerIndex >= inCount + regularCount

    const arrowCount =
      isIn || isOut
        ? 1
        : layoutType === 'triple'
          ? 3
          : layoutType === 'double'
            ? 2
            : 1

    return (
      <div className="flex flex-col items-center relative">
        <div className="flex items-center -gap-1">
          {Array.from({ length: arrowCount }).map((_, i) => (
            <React.Fragment key={i}>
              <MoveDown
                className={cn(
                  'w-4 h-4 translate-y-5.75 translate-x-0.5 shrink-0',
                  getArrowColorClass(
                    currentMarkerIndex,
                    i,
                    colorMap,
                    colorLayout?.colorContent,
                  ),
                )}
              />
              {layoutType === 'double' &&
                i === 0 &&
                currentMarkerIndex >= inCount &&
                currentMarkerIndex < inCount + regularCount && (
                  <span className="absolute text-[12px] font-bold text-gray-800 dark:text-foreground print:dark:text-gray-900 translate-y-10 translate-x-3.5 select-none shrink-0">
                    {colorPairDistance}
                  </span>
                )}
            </React.Fragment>
          ))}
        </div>
        {isIn && (
          <span className="absolute text-[12px] font-bold text-gray-800 dark:text-gray-100 print:dark:text-gray-900 translate-y-13 select-none shrink-0">
            IN
          </span>
        )}
        {isOut && (
          <span className="absolute text-[12px] font-jetbrains-mono font-bold text-gray-800 dark:text-gray-100 print:dark:text-gray-900 translate-y-13 select-none shrink-0">
            OUT
          </span>
        )}
      </div>
    )
  }

  let globalMarkerIndex = 0

  return (
    <Card className="overflow-hidden mt-5 print:border-none print:shadow-none print:bg-white print:p-0">
      <CardHeader className="no-print">
        <CardAction className="no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pb-2 print:p-0">
        <div className="overflow-x-auto print:overflow-visible pb-20 print:pb-0 print:space-y-0">
          <div className="inline-flex min-w-full print-wrap">
            {positionResults.map((values, index) => {
              const sectionNumber = index + 1
              const isFirstSection = sectionNumber === 1

              return (
                <div
                  key={sectionNumber}
                  className={cn(
                    'shrink-0 min-w-10 text-center px-4',
                    !isFirstSection && 'border-l-2 border-black',
                  )}
                >
                  {/* Nomor Section */}
                  <div className="mb-15 print:mb-10 font-semibold font-jetbrains-mono text-gray-900 dark:text-gray-100 print:text-black print:dark:text-gray-900">
                    {sectionNumber}
                  </div>

                  {/* Posisi */}
                  <div className="pb-2 border-b-2 border-black -mx-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {values.map((item, valueIndex) => {
                        const isMarker = valueIndex !== values.length - 1
                        const currentMarkerIndex = isMarker
                          ? globalMarkerIndex++
                          : -1

                        return (
                          <div
                            key={valueIndex}
                            className="flex items-center text-center"
                          >
                            <div className="text-gray-800 dark:text-gray-100 print:dark:text-gray-900 font-jetbrains-mono text-[15px] font-medium">
                              {item === 0 ? '' : item}
                            </div>
                            {isMarker &&
                              (isEdgeMarker(
                                currentMarkerIndex,
                                colorLayout?.colorContent,
                              )
                                ? renderEdgeTripleArrows(currentMarkerIndex)
                                : renderRegularArrows(currentMarkerIndex))}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Empty space below */}
                  <div className="p-5 mt-10">
                    <div className="h-4"></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
