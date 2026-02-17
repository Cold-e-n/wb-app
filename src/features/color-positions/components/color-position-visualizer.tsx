import React from 'react'
import { MoveDown, Printer } from 'lucide-react'
import { type ColorPositionWithRelations } from './color-positions-provider'
import { cn } from '@/lib/utils'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useColor } from '@/features/colors/hooks/use-color'

interface ColorPositionVisualizerProps {
  positionResults: number[][]
  dataColor: ColorPositionWithRelations
}

export const ColorPositionVisualizer: React.FC<
  ColorPositionVisualizerProps
> = ({ positionResults, dataColor }) => {
  const { fabricContent, colorLayout } = dataColor
  const { sections } = fabricContent
  const {
    type: layoutType,
    colorPairDistance,
    color: regularColors,
    IN,
    OUT,
    colorCount,
  } = colorLayout.colorContent

  const inCount = IN?.count || 0
  const regularCount = colorCount

  const { data: colors = [] } = useColor()
  const colorMap = React.useMemo(() => {
    return new Map(colors.map((c) => [c.id, c.name]))
  }, [colors])

  const handlePrint = () => {
    window.print()
  }

  const getColorClass = (colorName: string | undefined): string => {
    if (!colorName) return 'text-gray-900'
    const name = colorName.toUpperCase()
    if (name.includes('RED')) return 'text-red-500'
    if (name.includes('BLACK')) return 'text-black'
    if (name.includes('GREEN')) return 'text-green-500'
    if (name.includes('BLUE')) return 'text-blue-500'
    if (name.includes('YELLOW')) return 'text-yellow-500'
    if (name.includes('ORANGE')) return 'text-orange-500'
    if (name.includes('PURPLE')) return 'text-purple-500'
    if (name.includes('PINK')) return 'text-pink-500'
    if (name.includes('BROWN')) return 'text-amber-800'
    if (name.includes('GRAY') || name.includes('GREY')) return 'text-gray-500'
    if (name.includes('WHITE')) return 'text-slate-300'
    if (name.includes('NAVY')) return 'text-blue-900'
    if (name.includes('TURQ') || name.includes('CYAN')) return 'text-cyan-500'
    if (name.includes('TEAL')) return 'text-teal-500'
    if (name.includes('LIME')) return 'text-lime-500'
    if (name.includes('ROSE')) return 'text-rose-500'
    if (name.includes('EMERALD')) return 'text-emerald-500'
    if (name.includes('VIOLET')) return 'text-violet-500'
    if (name.includes('GOLD')) return 'text-yellow-600'
    if (name.includes('SILVER')) return 'text-slate-400'
    return 'text-gray-900'
  }

  const getArrowColorClass = (markerIdx: number, arrowIdx: number) => {
    let colorId: string | undefined
    if (markerIdx < inCount) {
      colorId = IN?.color?.[arrowIdx] || IN?.color?.[0]
    } else if (markerIdx < inCount + regularCount) {
      colorId = regularColors?.[arrowIdx] || regularColors?.[0]
    } else {
      colorId = OUT?.color?.[arrowIdx] || OUT?.color?.[0]
    }

    if (!colorId) return 'text-gray-900'

    // Try to get from map (if it's an ID)
    let colorName = colorMap.get(colorId)
    // If not in map, maybe it's already a name? (Fallback)
    if (!colorName) colorName = colorId

    return getColorClass(colorName)
  }

  let globalMarkerIndex = 0

  return (
    <Card className="overflow-hidden print:border-none print:shadow-none print:bg-white print:py-0">
      <style>{`
        @media print {
          @page {
            margin: 5mm !important;
            size: landscape !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4rem 0 !important;
            overflow: visible !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            min-width: auto !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
          /* Reset Sidebar & Inset Layout for Print */
          [data-slot="sidebar"], [data-slot="sidebar-gap"] {
            display: none !important;
            width: 0 !important;
          }
          [data-slot="sidebar-inset"] {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: white !important;
          }
        }
      `}</style>
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
              const isLastSection = sectionNumber === sections

              return (
                <div
                  key={sectionNumber}
                  className={cn(
                    'shrink-0 min-w-10 text-center px-4',
                    !isLastSection && 'border-r-2 border-black',
                  )}
                >
                  {/* Nomor Section */}
                  <div className="mb-15 print:mb-10 font-semibold text-gray-900">
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
                            <div className="text-gray-700 font-medium">
                              {item === 0 ? '' : item}
                            </div>
                            {isMarker && (
                              <div className="flex flex-col items-center relative">
                                <div className="flex items-center -gap-1">
                                  {Array.from({
                                    length:
                                      layoutType === 'triple'
                                        ? 3
                                        : layoutType === 'double'
                                          ? 2
                                          : 1,
                                  }).map((_, i) => (
                                    <React.Fragment key={i}>
                                      <MoveDown
                                        className={cn(
                                          'w-4 h-4 translate-y-5.75 translate-x-0.5 shrink-0',
                                          getArrowColorClass(
                                            currentMarkerIndex,
                                            i,
                                          ),
                                        )}
                                      />
                                      {layoutType === 'double' && i === 0 && (
                                        <span className="absolute text-[12px] font-bold text-gray-500 translate-y-10 translate-x-3.5 select-none shrink-0">
                                          {colorPairDistance}
                                        </span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                                {currentMarkerIndex < inCount && (
                                  <span className="absolute text-[12px] font-bold text-gray-500 translate-y-10 select-none shrink-0">
                                    IN
                                  </span>
                                )}
                                {currentMarkerIndex >=
                                  inCount + regularCount && (
                                  <span className="absolute text-[12px] font-bold text-gray-500 translate-y-10 select-none shrink-0">
                                    OUT
                                  </span>
                                )}
                              </div>
                            )}
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
