import { type ColorPositionWithRelations } from './color-positions-provider'
import { ColorPositionCalculator } from '@/calculations/ColorPosition'
import { Card, CardContent } from '@/components/ui/card'
import { ColorInfoDisplay } from '@/features/color-layout/components/color-layout-details'
import { ColorPositionVisualizer } from './color-position-visualizer'
import { Equal } from 'lucide-react'

type ColorPositionsDetailsProps = {
  data: ColorPositionWithRelations
}

export const ColorPositionsDetails = ({ data }: ColorPositionsDetailsProps) => {
  const calculator = new ColorPositionCalculator(data)
  const results = calculator.calculate()
  const colorInfo = ColorInfoDisplay(data.colorLayout)
  const totalThreads =
    data.fabricContent.cones.length === 1
      ? data.fabricContent.cones[0] * data.fabricContent.sections
      : data.fabricContent.cones[0] * (data.fabricContent.sections - 1) +
        data.fabricContent.cones[1]

  return (
    <div className="space-y-6 print:space-y-0 print-wrap">
      <div className="w-full print:mx-2 print:mt-5">
        <Card className="print:border-gray-800 print:text-gray-800">
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-md font-jetbrains-mono">
              <div>
                <div>WB - {data.wbNo}</div>
                <div>{data.fabric.name}</div>
                <div>
                  {data.fabricContent.cones.length === 1 ? (
                    `${data.fabricContent.cones[0]} cones x ${data.fabricContent.sections} sections = ${totalThreads} Helai`
                  ) : (
                    <div className="flex items-center gap-10">
                      <div className="flex flex-col">
                        <span>
                          {data.fabricContent.cones[0]} cones x{' '}
                          {data.fabricContent.sections - 1} sections
                        </span>
                        <span>
                          {data.fabricContent.cones[1]} cones x 1 section
                        </span>
                      </div>

                      <div>
                        <Equal className="w-4 h-4" />
                      </div>

                      <div>{totalThreads} Helai</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div>
                  {`Jarak Warna: ${data.colorLayout.colorContent.colorDistance} Helai`}
                </div>
                <div>{colorInfo}</div>
                <div className="grid grid-cols-2">
                  <span>IN: </span>
                  <span>OUT: </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ColorPositionVisualizer positionResults={results} dataColor={data} />
    </div>
  )
}
