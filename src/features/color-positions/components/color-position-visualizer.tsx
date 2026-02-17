import React from 'react'
import { type FabricContent } from '@/types/ColorPosition'
import { cn } from '@/lib/utils'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoveDown, Printer } from 'lucide-react'

interface ColorPositionVisualizerProps {
  calculationResults: number[][]
  fabricContent: FabricContent
}

export const ColorPositionVisualizer: React.FC<
  ColorPositionVisualizerProps
> = ({ calculationResults, fabricContent }) => {
  const { sections } = fabricContent
  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="overflow-hidden bg-background/50 print:border-none print:shadow-none print:bg-white">
      <style>{`
        @media print {
          .print-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4rem 0 !important;
            overflow: visible !important;
            padding-bottom: 0 !important;
            min-width: auto !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
          /* Reset Sidebar Layout for Print */
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
          body {
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
        <div className="overflow-x-auto print:overflow-visible pb-20 print:pb-0">
          <div className="inline-flex min-w-full print-wrap">
            {calculationResults.map((values, index) => {
              const sectionNumber = index + 1
              const isLastSection = sectionNumber === sections

              return (
                <div
                  key={sectionNumber}
                  className={cn(
                    'shrink-0 min-w-32 text-center px-4',
                    !isLastSection && 'border-r-2 border-black',
                  )}
                >
                  {/* Nomor Section */}
                  <div className="mb-10 print:mb-5 font-semibold text-gray-900">
                    {sectionNumber}
                  </div>

                  {/* Posisi */}
                  <div className="pb-2 border-b-2 border-black -mx-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {values.map((item, valueIndex) => (
                        <div
                          key={valueIndex}
                          className="flex items-center text-center"
                        >
                          <div className="text-gray-700 font-medium">
                            {item === 0 ? '' : item}
                          </div>
                          {valueIndex !== values.length - 1 && (
                            <MoveDown className="w-4 h-4 text-gray-900 translate-y-5.75 translate-x-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty space below */}
                  <div className="p-5 mt-4">
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
