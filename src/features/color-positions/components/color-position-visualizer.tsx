import React from 'react'
import { MoveDown, Printer } from 'lucide-react'
import type { ColorPositionWithRelations } from '@/types/ColorPosition'
import type { SectionData } from '@/calculations/ColorPosition'
import { useColorMap } from '@/features/colors/hooks/use-color'
import {
  cn,
  getArrowColorClass,
  getColorClass,
  isEdgeMarker,
} from '@/lib/utils'

import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ColorPositionVisualizerProps {
  positionResults: Array<SectionData>
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
   * Untuk split marker, hanya satu benang (isSingleThread=true).
   */
  const renderRegularArrows = (
    currentMarkerIndex: number,
    isSingleThread = false,
    splitThreadIndex = 0,
  ) => {
    const isIn = currentMarkerIndex < inCount
    const isOut = currentMarkerIndex >= inCount + regularCount

    const arrowCount = isSingleThread
      ? 1
      : isIn || isOut
        ? 1
        : layoutType === 'triple'
          ? 3
          : layoutType === 'double'
            ? 2
            : 1

    // Untuk split marker, tidak tampilkan label pairDistance
    const showPairLabel = layoutType === 'double' && !isSingleThread

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
                    isSingleThread ? splitThreadIndex : i,
                    colorMap,
                    colorLayout?.colorContent,
                  ),
                )}
              />
              {showPairLabel &&
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
  /**
   * Menyimpan markerIndex dari splitStart agar splitContinue bisa
   * menggunakan warna yang sama (thread-1 dan thread-2 adalah pasangan yang sama).
   */
  let pendingSplitMarkerIndex: number | null = null

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
            {positionResults.map((section, index) => {
              const sectionNumber = index + 1
              const isFirstSection = sectionNumber === 1

              const topRowMarkerCount = section.splitStart
                ? section.topRow.length // semua item topRow diikuti marker (hanya thread-1)
                : section.topRow.length - 1 // item terakhir adalah fill

              /**
               * splitContinue menggunakan markerIndex yang SAMA dengan splitStart
               * agar warna arrow thread-2 sesuai dengan thread-1.
               * Setelah diambil, reset pendingSplitMarkerIndex.
               */
              let splitContinueMarkerIndex = -1
              if (section.splitContinue && pendingSplitMarkerIndex !== null) {
                splitContinueMarkerIndex = pendingSplitMarkerIndex
                pendingSplitMarkerIndex = null
              }

              // Catat marker indices untuk topRow
              const topRowMarkerIndices: number[] = []
              if (section.splitStart) {
                // splitStart: increment sekali untuk pasangan ini, simpan untuk splitContinue
                const idx = globalMarkerIndex++
                topRowMarkerIndices.push(idx)
                pendingSplitMarkerIndex = idx
              } else {
                for (let i = 0; i < topRowMarkerCount; i++) {
                  topRowMarkerIndices.push(globalMarkerIndex++)
                }
              }

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

                  {/* Baris Utama (topRow) */}
                  <div className="pb-2 border-b-2 border-black -mx-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {section.splitContinue && (
                        <div className="flex items-center text-center">
                          {renderRegularArrows(
                            splitContinueMarkerIndex,
                            true,
                            1,
                          )}
                        </div>
                      )}

                      {section.topRow.map((item, valueIndex) => {
                        const isMarker = valueIndex < topRowMarkerCount
                        const currentMarkerIndex = isMarker
                          ? topRowMarkerIndices[valueIndex]
                          : -1

                        return (
                          <div
                            key={valueIndex}
                            className="flex items-center text-center font-jetbrains-mono"
                          >
                            <div className="text-gray-800 dark:text-gray-100 print:dark:text-gray-900 text-[15px] font-medium">
                              {item === 0 ? '' : item}
                            </div>
                            {isMarker &&
                              (isEdgeMarker(
                                currentMarkerIndex,
                                colorLayout?.colorContent,
                              )
                                ? renderEdgeTripleArrows(currentMarkerIndex)
                                : renderRegularArrows(
                                    currentMarkerIndex,
                                    section.splitStart &&
                                      valueIndex === topRowMarkerCount - 1,
                                    0,
                                  ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Baris Bawah (bottomRow) — hanya untuk split marker */}
                  {section.bottomRow.length > 0 && (
                    <div className="-mx-4 px-4 pt-1 font-jetbrains-mono">
                      {section.splitStart && (
                        <div className="flex justify-end -mr-2">
                          <div className="text-gray-800 dark:text-gray-100 print:dark:text-gray-900 text-[12px] font-medium">
                            {section.bottomRow[0] === 0
                              ? ''
                              : section.bottomRow[0]}
                          </div>
                        </div>
                      )}

                      {section.splitContinue && (
                        <div className="flex justify-start -ml-1">
                          <div className="text-gray-800 dark:text-gray-100 print:dark:text-gray-900 text-[12px] font-medium">
                            {section.bottomRow[0] === 0
                              ? ''
                              : section.bottomRow[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty space below */}
                  <div className="p-5 mt-10"></div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
